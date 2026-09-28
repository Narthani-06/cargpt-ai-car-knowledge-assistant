import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

from services.retrieval import CarRetrievalService
from services.llm import LLMService

app = FastAPI(
    title="CarGPT Backend API",
    description="RAG-powered AI Car Knowledge Assistant API",
    version="1.0.0"
)

# Enable CORS for Frontend Development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize RAG & LLM Services
retrieval_service = CarRetrievalService()
llm_service = LLMService(retrieval_service=retrieval_service)

# Mount static files directory
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.get("/")
def read_root():
    """Serves the main CarGPT user interface."""
    index_path = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "CarGPT API is running. Access /api/health for system status."}

# Request Models
class ChatRequest(BaseModel):
    question: str

class CompareRequest(BaseModel):
    cars: List[str]

@app.get("/")
@app.get("/api/health")
def health_check():
    """Health check endpoint exposing system & knowledge base status."""
    has_api_key = bool(llm_service.api_key)
    return {
        "status": "online",
        "service": "CarGPT - AI Car Knowledge Assistant API",
        "cars_in_knowledge_base": len(retrieval_service.cars),
        "api_key_configured": has_api_key,
        "llm_provider": llm_service.provider if has_api_key else "Offline Smart RAG Generator",
        "knowledge_base_version": retrieval_service.metadata.get("version", "1.0")
    }

@app.post("/api/chat")
def chat_endpoint(request: ChatRequest):
    """Processes natural language car question using RAG pipeline."""
    if not request.question or not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")
    
    response = llm_service.generate_response(request.question)
    return response

@app.get("/api/cars")
def list_cars(
    brand: Optional[str] = Query(None, description="Filter by car brand"),
    fuel_type: Optional[str] = Query(None, description="Filter by fuel type"),
    transmission: Optional[str] = Query(None, description="Filter by transmission"),
    search: Optional[str] = Query(None, description="Keyword search in name, model, features")
):
    """Returns filtered cars for the Knowledge Base UI tab."""
    cars = retrieval_service.get_all_cars(
        brand=brand,
        fuel_type=fuel_type,
        transmission=transmission,
        search=search
    )
    return {
        "count": len(cars),
        "cars": cars
    }

@app.get("/api/cars/{car_id}")
def get_car_detail(car_id: str):
    """Returns detailed specifications for a specific car ID."""
    car = retrieval_service.get_car_by_id(car_id)
    if not car:
        raise HTTPException(status_code=404, detail=f"Car with ID '{car_id}' not found in knowledge base.")
    return car

@app.post("/api/compare")
def compare_cars_endpoint(request: CompareRequest):
    """Returns structured comparison data for 2 or more cars."""
    if not request.cars or len(request.cars) < 2:
        raise HTTPException(status_code=400, detail="At least 2 car names/IDs are required for comparison.")
    
    query = f"Compare {' and '.join(request.cars)}"
    cars = retrieval_service.extract_cars_for_comparison(query)
    
    if not cars:
        raise HTTPException(status_code=404, detail="None of the specified cars were found in knowledge base.")
        
    context = retrieval_service.format_car_context(cars)
    answer = llm_service._generate_smart_rag_response(query, cars)
    
    return {
        "cars": cars,
        "context": context,
        "comparison_markdown": answer
    }
