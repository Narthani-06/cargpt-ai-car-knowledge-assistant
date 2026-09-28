import os
import json
import urllib.request
import urllib.error
from typing import List, Dict, Any, Optional
from services.retrieval import CarRetrievalService
from prompts.car_prompts import SYSTEM_PROMPT, USER_PROMPT_TEMPLATE

class LLMService:
    def __init__(self, retrieval_service: CarRetrievalService):
        self.retrieval_service = retrieval_service
        self.api_key = os.environ.get("LLM_API_KEY") or os.environ.get("GEMINI_API_KEY") or os.environ.get("OPENAI_API_KEY")
        self.provider = os.environ.get("LLM_PROVIDER", "gemini").lower()

    def generate_response(self, question: str) -> Dict[str, Any]:
        """
        Executes the RAG Workflow:
        1. Check if query is car-related.
        2. Retrieve relevant car records from custom knowledge base.
        3. Construct prompt with retrieved context.
        4. Send to LLM API if key available, or use Smart RAG Fallback Generator.
        """
        question_str = question.strip()
        if not question_str:
            return {
                "answer": "Please enter a valid question about cars.",
                "retrieved_cars": [],
                "source": "validation_error"
            }

        # 1. Off-topic check
        if not self.retrieval_service.is_car_related_query(question_str):
            return {
                "answer": "I'm CarGPT, a car-focused AI assistant. I can help you with information and comparisons about the cars available in my knowledge base.",
                "retrieved_cars": [],
                "source": "car_guardrail"
            }

        # 2. Check comparison vs general search
        clean_q = question_str.lower()
        if "compare" in clean_q or "vs" in clean_q or "difference between" in clean_q:
            retrieved_cars = self.retrieval_service.extract_cars_for_comparison(question_str)
        else:
            retrieved_cars = self.retrieval_service.search_relevant_cars(question_str, top_k=4)

        # 3. Handle case where no car matched in custom KB
        if not retrieved_cars:
            return {
                "answer": f"I checked my custom knowledge base, but I couldn't find any relevant car matching your question **'{question_str}'**.\n\n"
                          f"Currently available cars in my knowledge base include models from **Hyundai, Tata, Kia, Maruti Suzuki, Toyota, Honda, Mahindra, Volkswagen, and Skoda**.",
                "retrieved_cars": [],
                "source": "not_in_kb"
            }

        # 4. Generate context and prompt
        context_str = self.retrieval_service.format_car_context(retrieved_cars)
        user_prompt = USER_PROMPT_TEMPLATE.format(context=context_str, question=question_str)

        # 5. Call Live LLM API if key is present, otherwise fallback to Smart RAG Generator
        if self.api_key:
            try:
                llm_response = self._call_llm_api(user_prompt)
                return {
                    "answer": llm_response,
                    "retrieved_cars": retrieved_cars,
                    "source": f"live_llm_{self.provider}"
                }
            except Exception as e:
                print(f"[CarGPT Warning] LLM API Call failed ({e}). Falling back to local RAG generator.")
                # Fallthrough to offline smart generator

        # 6. Smart RAG Generator Fallback (Guaranteed to work offline / without API key!)
        offline_answer = self._generate_smart_rag_response(question_str, retrieved_cars)
        return {
            "answer": offline_answer,
            "retrieved_cars": retrieved_cars,
            "source": "smart_rag_generator"
        }

    def _call_llm_api(self, user_prompt: str) -> str:
        """Invokes Gemini or OpenAI API via HTTP requests."""
        if "gemini" in self.provider:
            # Google Gemini REST Endpoint
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"
            headers = {"Content-Type": "application/json"}
            payload = {
                "system_instruction": {"parts": [{"text": SYSTEM_PROMPT}]},
                "contents": [{"parts": [{"text": user_prompt}]}],
                "generationConfig": {"temperature": 0.2}
            }
            req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers)
            with urllib.request.urlopen(req, timeout=15) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                return result["candidates"][0]["content"]["parts"][0]["text"]

        else:
            # OpenAI / Compatible REST Endpoint
            url = "https://api.openai.com/v1/chat/completions"
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}"
            }
            payload = {
                "model": "gpt-3.5-turbo",
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": 0.2
            }
            req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers)
            with urllib.request.urlopen(req, timeout=15) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                return result["choices"][0]["message"]["content"]

    def _generate_smart_rag_response(self, query: str, cars: List[Dict[str, Any]]) -> str:
        """
        Smart local RAG response generator that synthesizes retrieved context 
        into clear, student-friendly markdown responses adhering strictly to prompt instructions.
        """
        clean_q = query.lower()

        # A. Comparison Response
        if ("compare" in clean_q or "vs" in clean_q or "difference" in clean_q) and len(cars) >= 2:
            car1, car2 = cars[0], cars[1]
            ans = [f"### 🚗 Comparison: {car1['name']} vs {car2['name']}\n"]
            ans.append("Here is a side-by-side comparison based on retrieved data from the CarGPT knowledge base:\n")
            
            ans.append("| Spec / Feature | " + car1['name'] + " | " + car2['name'] + " |")
            ans.append("| :--- | :--- | :--- |")
            ans.append(f"| **Brand** | {car1['brand']} | {car2['brand']} |")
            ans.append(f"| **Body Type** | {car1['body_type']} | {car2['body_type']} |")
            ans.append(f"| **Fuel Type** | {', '.join(car1['fuel_type'])} | {', '.join(car2['fuel_type'])} |")
            ans.append(f"| **Transmission** | {', '.join(car1['transmission'])} | {', '.join(car2['transmission'])} |")
            ans.append(f"| **Engine** | {car1['engine']} | {car2['engine']} |")
            ans.append(f"| **Mileage** | {car1['mileage']} | {car2['mileage']} |")
            ans.append(f"| **Seating** | {car1['seating_capacity']} Seats | {car2['seating_capacity']} Seats |")
            ans.append(f"| **Demo Price** | {car1['price_range_demo']} | {car2['price_range_demo']} |")

            ans.append(f"\n#### Key Differences & Highlights:")
            ans.append(f"- **{car1['name']}**: {car1['description']}")
            ans.append(f"  - *Standout features*: {', '.join(car1['key_features'][:3])}")
            ans.append(f"- **{car2['name']}**: {car2['description']}")
            ans.append(f"  - *Standout features*: {', '.join(car2['key_features'][:3])}")
            
            ans.append("\n> **Summary**: Both vehicles have distinct strengths. Choose based on your priorities (e.g., fuel type preference, feature technology, or safety requirements).")
            return "\n".join(ans)

        # B. Automatic Transmission Inquiry
        if "automatic" in clean_q or "auto" in clean_q:
            auto_cars = [c for c in cars if any("automatic" in t.lower() or "cvt" in t.lower() or "dct" in t.lower() or "amt" in t.lower() for t in c.get("transmission", []))]
            if auto_cars:
                ans = [f"### 🚗 Cars with Automatic Transmission ({len(auto_cars)} found in Knowledge Base)\n"]
                for c in auto_cars:
                    trans_types = [t for t in c['transmission'] if t.lower() != 'manual']
                    ans.append(f"#### **{c['name']}** ({c['brand']} - {c['body_type']})")
                    ans.append(f"- **Transmissions**: {', '.join(c['transmission'])}")
                    ans.append(f"- **Engine**: {c['engine']}")
                    ans.append(f"- **Mileage**: {c['mileage']}")
                    ans.append(f"- **Key Feature**: {c['key_features'][0] if c['key_features'] else 'N/A'}")
                    ans.append("")
                return "\n".join(ans)

        # C. Family Cars Inquiry
        if "family" in clean_q or "families" in clean_q:
            ans = [f"### 👨‍👩‍👧‍👦 Recommended Family Cars from Knowledge Base\n"]
            for c in cars:
                ans.append(f"#### **{c['name']}** ({c['brand']})")
                ans.append(f"- **Seating**: {c['seating_capacity']} Passengers")
                ans.append(f"- **Body Type**: {c['body_type']}")
                ans.append(f"- **Safety Rating / Features**: {', '.join(c['safety_features'][:2])}")
                ans.append(f"- **Why suitable**: {', '.join(c['suitable_usage'])}")
                ans.append("")
            return "\n".join(ans)

        # D. Single Car / General Overview Query
        primary_car = cars[0]
        ans = [f"### 🚗 Information on {primary_car['name']}\n"]
        ans.append(f"{primary_car['description']}\n")
        ans.append(f"#### 📋 Key Specifications:")
        ans.append(f"- **Brand & Model**: {primary_car['brand']} {primary_car['model']}")
        ans.append(f"- **Body Type**: {primary_car['body_type']}")
        ans.append(f"- **Fuel Types**: {', '.join(primary_car['fuel_type'])}")
        ans.append(f"- **Transmission**: {', '.join(primary_car['transmission'])}")
        ans.append(f"- **Engine**: {primary_car['engine']}")
        ans.append(f"- **Mileage**: {primary_car['mileage']}")
        ans.append(f"- **Seating Capacity**: {primary_car['seating_capacity']} Passengers")
        ans.append(f"- **Demo Price**: {primary_car['price_range_demo']}\n")

        ans.append(f"#### 🌟 Key Features:")
        for feat in primary_car['key_features']:
            ans.append(f"- {feat}")

        ans.append(f"\n#### 🛡️ Safety Features:")
        for safe in primary_car['safety_features']:
            ans.append(f"- {safe}")

        ans.append(f"\n#### 🎯 Suitable Usage:")
        for usage in primary_car['suitable_usage']:
            ans.append(f"- {usage}")

        # If more than 1 car returned in general search, mention them briefly
        if len(cars) > 1:
            ans.append(f"\n---\n*Other related cars in knowledge base: " + ", ".join([c['name'] for c in cars[1:]]) + "*")

        return "\n".join(ans)
