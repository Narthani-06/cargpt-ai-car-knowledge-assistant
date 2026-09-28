import json
import os
import re
from typing import List, Dict, Any, Optional

DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "cars.json")

class CarRetrievalService:
    def __init__(self, data_path: str = DATA_PATH):
        self.data_path = data_path
        self.cars: List[Dict[str, Any]] = []
        self.metadata: Dict[str, Any] = {}
        self.load_data()

    def load_data(self):
        """Loads car knowledge base from JSON file."""
        if not os.path.exists(self.data_path):
            raise FileNotFoundError(f"Knowledge base file not found at {self.data_path}")
        
        with open(self.data_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            self.metadata = data.get("metadata", {})
            self.cars = data.get("cars", [])

    def get_all_cars(
        self,
        brand: Optional[str] = None,
        fuel_type: Optional[str] = None,
        transmission: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Filter cars for the Knowledge Base UI tab."""
        result = self.cars
        
        if brand and brand.strip() and brand.lower() != "all":
            result = [c for c in result if c["brand"].lower() == brand.lower()]
            
        if fuel_type and fuel_type.strip() and fuel_type.lower() != "all":
            result = [
                c for c in result 
                if any(f.lower() == fuel_type.lower() for f in c.get("fuel_type", []))
            ]
            
        if transmission and transmission.strip() and transmission.lower() != "all":
            target_trans = transmission.lower()
            result = [
                c for c in result 
                if any(target_trans in t.lower() for t in c.get("transmission", []))
            ]
            
        if search and search.strip():
            query = search.lower().strip()
            result = [
                c for c in result 
                if query in c["name"].lower() 
                or query in c["brand"].lower() 
                or query in c["model"].lower()
                or query in c["body_type"].lower()
                or any(query in feat.lower() for feat in c.get("key_features", []))
            ]
            
        return result

    def get_car_by_id(self, car_id: str) -> Optional[Dict[str, Any]]:
        """Returns a single car record by ID."""
        for car in self.cars:
            if car["id"] == car_id or car["model"].lower() == car_id.lower():
                return car
        return None

    def search_relevant_cars(self, query: str, top_k: int = 4) -> List[Dict[str, Any]]:
        """
        Retrieves top_k most relevant car records based on keyword matching, 
        car name mentions, feature search, fuel, and transmission queries.
        """
        clean_query = re.sub(r'[^\w\s]', ' ', query.lower())
        tokens = set(clean_query.split())

        scored_cars = []

        for car in self.cars:
            score = 0
            car_name_clean = re.sub(r'[^\w\s]', ' ', car["name"].lower())
            brand_clean = car["brand"].lower()
            model_clean = car["model"].lower()
            body_type_clean = car["body_type"].lower()

            # 1. Direct Model / Name Mention (Highest priority)
            if model_clean in clean_query or car_name_clean in clean_query:
                score += 20
            elif any(token == model_clean for token in tokens):
                score += 15

            # 2. Brand Mention
            if brand_clean in clean_query:
                score += 8

            # 3. Fuel Type Match
            for fuel in car.get("fuel_type", []):
                fuel_clean = fuel.lower()
                if fuel_clean in clean_query or (fuel_clean == "electric" and "ev" in clean_query):
                    score += 6

            # 4. Transmission Match
            for trans in car.get("transmission", []):
                trans_clean = trans.lower()
                if trans_clean in clean_query:
                    score += 6
                elif "automatic" in clean_query and any(t in trans_clean for t in ["automatic", "cvt", "dct", "amt"]):
                    score += 6
                elif "manual" in clean_query and "manual" in trans_clean:
                    score += 6

            # 5. Body Type / Seating / Usage Match
            if body_type_clean in clean_query:
                score += 5
            
            if "family" in clean_query or "families" in clean_query:
                if "family" in " ".join(car.get("suitable_usage", [])).lower() or car["seating_capacity"] >= 5:
                    score += 5

            if "off road" in clean_query or "adventure" in clean_query or "4x4" in clean_query:
                if "off-road" in " ".join(car.get("suitable_usage", [])).lower() or "4x4" in car.get("engine", "").lower():
                    score += 6

            if "safety" in clean_query or "star" in clean_query or "ncap" in clean_query:
                if any("star" in s.lower() or "ncap" in s.lower() for s in car.get("safety_features", [])):
                    score += 6

            # 6. General Feature & Keyword token overlap
            all_text = f"{car['description']} {' '.join(car['key_features'])} {' '.join(car['suitable_usage'])}".lower()
            for token in tokens:
                if len(token) > 3 and token in all_text:
                    score += 1

            if score > 0:
                scored_cars.append((score, car))

        # Sort by score descending
        scored_cars.sort(key=lambda x: x[0], reverse=True)

        if not scored_cars:
            return []

        # Return top_k cars that passed threshold
        return [car for score, car in scored_cars[:top_k]]

    def extract_cars_for_comparison(self, query: str) -> List[Dict[str, Any]]:
        """Detects 2 or more cars mentioned in comparison query."""
        clean_query = query.lower()
        matched_cars = []

        for car in self.cars:
            model_name = car["model"].lower()
            full_name = car["name"].lower()
            if model_name in clean_query or full_name in clean_query:
                matched_cars.append(car)

        # If less than 2 matched explicitly, fallback to top 2 search results
        if len(matched_cars) < 2:
            top_cars = self.search_relevant_cars(query, top_k=2)
            for c in top_cars:
                if c not in matched_cars:
                    matched_cars.append(c)
                if len(matched_cars) == 2:
                    break

        return matched_cars

    def is_car_related_query(self, query: str) -> bool:
        """Determines if question is car-related or off-topic."""
        car_keywords = [
            "car", "cars", "suv", "sedan", "hatchback", "crossover", "engine", "mileage",
            "fuel", "petrol", "diesel", "ev", "electric", "cng", "hybrid", "transmission",
            "automatic", "manual", "cvt", "dct", "seat", "seating", "safety", "ncap",
            "hyundai", "tata", "kia", "maruti", "suzuki", "toyota", "honda", "mahindra",
            "volkswagen", "skoda", "tesla", "bmw", "audi", "mercedes", "ford", "ferrari",
            "lamborghini", "porsche", "nissan", "renault", "mg", "jeep", "byd", "cybertruck",
            "creta", "nexon", "seltos", "fortuner", "harrier", "slavia", "virtus", "swift",
            "brezza", "thar", "xuv700", "i20", "sonet", "taisor", "city", "elevate",
            "compare", "best", "drive", "price", "boot", "sunroof", "tell me about"
        ]
        clean = query.lower()
        return any(kw in clean for kw in car_keywords)

    def format_car_context(self, cars: List[Dict[str, Any]]) -> str:
        """Formats retrieved car records into structured markdown context for LLM prompt."""
        if not cars:
            return "No relevant car records were found in the CarGPT custom knowledge base."

        context_lines = []
        for i, car in enumerate(cars, 1):
            context_lines.append(f"--- RETRIEVED CAR RECORD #{i}: {car['name']} ---")
            context_lines.append(f"Brand: {car['brand']}")
            context_lines.append(f"Model: {car['model']}")
            context_lines.append(f"Body Type: {car['body_type']}")
            context_lines.append(f"Fuel Types: {', '.join(car['fuel_type'])}")
            context_lines.append(f"Transmissions: {', '.join(car['transmission'])}")
            context_lines.append(f"Engine: {car['engine']}")
            context_lines.append(f"Mileage: {car['mileage']}")
            context_lines.append(f"Seating Capacity: {car['seating_capacity']} Passengers")
            context_lines.append(f"Key Features: {', '.join(car['key_features'])}")
            context_lines.append(f"Safety Features: {', '.join(car['safety_features'])}")
            context_lines.append(f"Suitable Usage: {', '.join(car['suitable_usage'])}")
            context_lines.append(f"Description: {car['description']}")
            context_lines.append("")

        return "\n".join(context_lines)
