import pytest
from fastapi.testclient import TestClient
from main import app
from services.retrieval import CarRetrievalService

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["cars_in_knowledge_base"] >= 15

def test_retrieval_service_search():
    retrieval = CarRetrievalService()
    # 1. Search Creta
    creta_results = retrieval.search_relevant_cars("Tell me about Hyundai Creta")
    assert len(creta_results) > 0
    assert creta_results[0]["model"] == "Creta"
    assert creta_results[0]["brand"] == "Hyundai"

    # 2. Search Automatic Transmission
    auto_results = retrieval.search_relevant_cars("Which cars have automatic transmission?")
    assert len(auto_results) > 0
    assert any("automatic" in t.lower() or "cvt" in t.lower() for t in auto_results[0]["transmission"])

def test_chat_known_car():
    response = client.post("/api/chat", json={"question": "Tell me about Hyundai Creta"})
    assert response.status_code == 200
    data = response.json()
    assert "Creta" in data["answer"]
    assert len(data["retrieved_cars"]) > 0

def test_chat_car_comparison():
    response = client.post("/api/chat", json={"question": "Compare Creta and Seltos"})
    assert response.status_code == 200
    data = response.json()
    assert "Creta" in data["answer"]
    assert "Seltos" in data["answer"]
    assert len(data["retrieved_cars"]) >= 2

def test_chat_unrelated_question():
    response = client.post("/api/chat", json={"question": "What is the capital of France?"})
    assert response.status_code == 200
    data = response.json()
    assert "CarGPT" in data["answer"]
    assert "car-focused AI assistant" in data["answer"]

def test_chat_unavailable_car():
    response = client.post("/api/chat", json={"question": "Tell me about Tesla Cybertruck"})
    assert response.status_code == 200
    data = response.json()
    assert "couldn't find" in data["answer"].lower() or "not available" in data["answer"].lower()

def test_list_cars_filters():
    # Filter by Hyundai brand
    response = client.get("/api/cars?brand=Hyundai")
    assert response.status_code == 200
    cars = response.json()["cars"]
    assert len(cars) >= 2
    assert all(c["brand"] == "Hyundai" for c in cars)

    # Filter by Diesel fuel
    response = client.get("/api/cars?fuel_type=Diesel")
    assert response.status_code == 200
    diesel_cars = response.json()["cars"]
    assert len(diesel_cars) > 0
    assert all("Diesel" in c["fuel_type"] for c in diesel_cars)
