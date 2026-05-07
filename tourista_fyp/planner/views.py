from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from .services import get_ai_recommendations
from .serializers import DestinationSerializer
from rest_framework import viewsets
from .models import Itinerary, ItineraryItem
from .serializers import ItinerarySerializer, ItineraryDetailSerializer, ItineraryItemSerializer
from .services import get_weather_alerts_for_itinerary

from django_filters.rest_framework import DjangoFilterBackend 
from rest_framework import generics 
from .models import CulturalEvent 
from .serializers import CulturalEventSerializer 
from .services import get_optimized_route_for_itinerary

from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
# api_key = os.getenv("GEMINI_API_KEY")
from django.utils import timezone
from datetime import timedelta

from django.conf import settings
from .services import get_weather_for_cities
# from .services import get_weather_for_cities
from .models import Destination 
import re
import random 
from .models import Destination, Itinerary, ItineraryItem

from django.conf import settings

# api_key = settings.GEMINI_API_KEY


@api_view(['GET'])
@authentication_classes([JWTAuthentication]) # We explicitly use ONLY JWT auth here
@permission_classes([IsAuthenticated])
def jwt_test_view(request):
    """A simple view to test JWT authentication."""
    return Response({"message": f"Hello {request.user.username}, your JWT token is valid!"})

class AIRecommendationView(APIView):
    """
    A new, highly-optimized endpoint that provides all data needed
    for the user's home screen in a single API call.
    It includes personalized recommendations, favorites, and weather data.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        profile = request.user.profile
        favorite_ids = set(profile.favorite_destinations.values_list('id', flat=True))

        # 1. Get base recommendations (your existing AI logic)
        recommendations = Destination.objects.filter(
            # Your filtering logic here...
        ).exclude(id__in=favorite_ids).order_by('?')[:10]

        # 2. Serialize the data. Weather logic is now REMOVED.
        serialized_data = []
        for rec in recommendations:
            serialized_data.append({
                "id": rec.id,
                "name": rec.name,
                "description": rec.description,
                "city": rec.city,
                "country": rec.country,
                "rating": f"{rec.average_rating:.2f}",
                "review_count": rec.total_reviews,
                "is_favorite": rec.id in favorite_ids,
            })
            
        return Response(serialized_data)
        
class ItineraryViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to create, view, update, and delete their itineraries.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        This view should only return itineraries for the currently authenticated user.
        """
        return Itinerary.objects.filter(user=self.request.user).prefetch_related('items__destination')

    def get_serializer_class(self):
        """
        Return the appropriate serializer class based on the action.
        - Use ItineraryDetailSerializer for 'retrieve' (viewing one item).
        - Use ItinerarySerializer for all other actions (list, create, update).
        """
        if self.action == 'retrieve':
            return ItineraryDetailSerializer
        return ItinerarySerializer

    def perform_create(self, serializer):
        """
        Ensure the itinerary is saved with the current user.
        """
        serializer.save(user=self.request.user)

class ItineraryItemViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing items within a specific itinerary.
    Allows adding, updating, and removing destinations from a trip plan.
    """
    queryset = ItineraryItem.objects.all()
    serializer_class = ItineraryItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Filter items to only those belonging to the itinerary specified in the URL.
        Also ensures the user owns the parent itinerary.
        """
        itinerary_id = self.kwargs['itinerary_pk']
        return ItineraryItem.objects.filter(
            itinerary__id=itinerary_id,
            itinerary__user=self.request.user # Security check!
        )

    def perform_create(self, serializer):
        """
        Automatically associate the new item with the itinerary from the URL.
        """
        itinerary_id = self.kwargs['itinerary_pk']
        itinerary = Itinerary.objects.get(id=itinerary_id, user=self.request.user) # Security check!
        serializer.save(itinerary=itinerary)

class CulturalEventsView(generics.ListAPIView):
    """
    API endpoint to list and filter cultural events.
    Allows filtering by city and category.
    Example: /api/planner/events/?city=Gilgit&category=SPORT
    """
    queryset = CulturalEvent.objects.all().order_by('start_date')
    serializer_class = CulturalEventSerializer
    permission_classes = [permissions.IsAuthenticated] # Keep it protected for now
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['city', 'category']

class ItineraryRouteView(APIView):
    """
    API endpoint to get an optimized route for a specific itinerary.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, itinerary_pk, *args, **kwargs):
        try:
            # Security check: ensure user owns the itinerary
            itinerary = Itinerary.objects.get(pk=itinerary_pk, user=request.user)
        except Itinerary.DoesNotExist:
            return Response({"error": "Itinerary not found."}, status=status.HTTP_404_NOT_FOUND)
            
        route_data = get_optimized_route_for_itinerary(itinerary)
        
        if "error" in route_data:
            # Pass along any errors from the service
            return Response(route_data, status=status.HTTP_400_BAD_REQUEST)

        return Response(route_data, status=status.HTTP_200_OK)

import google.generativeai as genai
from dotenv import load_dotenv
import os
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

@csrf_exempt
def AIChatView(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        user_message = data.get('message', '')

        model = genai.GenerativeModel("gemini-1.5-flash")  # ✅ use this model
        response = model.generate_content(user_message)

        return JsonResponse({'reply': response.text})




PAKISTAN_MAJOR_CITIES = [
    "Karachi", "Lahore", "Faisalabad", "Rawalpindi", "Islamabad", "Multan", "Hyderabad",
    "Gujranwala", "Peshawar", "Quetta", "Sialkot", "Bahawalpur", "Sargodha", "Sukkur",
    "Larkana", "Murree", "Naran", "Kaghan", "Hunza", "Gilgit", "Skardu", "Chitral",
    "Swat", "Muzaffarabad", "Ziarat", "Gwadar"
]

def extract_city_from_prompt(prompt):
    """Extracts the first known Pakistani city from user text."""
    for city in PAKISTAN_MAJOR_CITIES:
        if re.search(r'\b' + re.escape(city) + r'\b', prompt, re.IGNORECASE):
            return city
    return None


class AIChatView(APIView):
    """
    Advanced AI travel assistant for Pakistan (Tourista)
    Integrated with Gemini 1.5 for context-aware responses.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        model = genai.GenerativeModel("models/gemini-2.5-flash")
        if not model:
            return Response({"error": "AI assistant not configured."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        user_prompt = request.data.get("prompt")
        if not user_prompt:
            return Response({"error": "A prompt is required."}, status=status.HTTP_400_BAD_REQUEST)

        user_profile = request.user.profile
        travel_style = user_profile.travel_style or "any style"
        budget = f"around Rs {user_profile.budget} per day" if user_profile.budget else "any budget"

        # 🧠 Context setup
        system_instruction = f"""
        You are 'Tourista' — an AI-powered smart travel assistant designed exclusively for Pakistan.
        Your personality: friendly, professional, and helpful.
        Your user's preferences: Travel Style = {travel_style}, Budget = {budget}.
        You must always:
        1. Focus strictly on travel-related questions in Pakistan.
        2. Use the user's preferences to make recommendations.
        3. If asked about non-travel topics, reply with:
           "I'm sorry, I specialize in travel and tourism within Pakistan. How can I assist with your travel plans?"
        4. Keep your answers clear, concise, and practical.
        """

        final_prompt_for_ai = user_prompt
        prompt_lower = user_prompt.lower()

        # 🌦 Weather Context
        if any(word in prompt_lower for word in ["weather", "forecast", "temperature"]):
            city = extract_city_from_prompt(user_prompt)
            if city:
                print(f"🌦 Fetching real-time weather for {city}...")
                weather_data = get_weather_for_cities([city])
                if city_weather := weather_data.get(city):
                    context = (
                        f"[Weather Update: {city} - {city_weather.get('description', 'N/A')}, "
                        f"{city_weather.get('temp', 'N/A')}°C]"
                    )
                    final_prompt_for_ai = f"{context}\n\nUser query: {user_prompt}"

        try:
            print(f"💬 Sending prompt to Gemini: '{final_prompt_for_ai}'")
            chat = model.start_chat(history=[
                {"role": "user", "parts": [system_instruction]},
                {"role": "model", "parts": ["Understood. I am Tourista — your expert Pakistani travel companion."]}
            ])

            response = chat.send_message(final_prompt_for_ai)
            ai_response = response.text.strip()
            print(f"✅ Gemini Response: {ai_response[:200]}...")

            return Response({"response": ai_response}, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"❌ AI Chat ERROR: {e}")
            return Response({"error": "The AI assistant is currently unavailable. Please try again later."},
                            status=status.HTTP_503_SERVICE_UNAVAILABLE)

class DestinationDetailView(generics.RetrieveAPIView):
    queryset = Destination.objects.all()
    serializer_class = DestinationSerializer
    permission_classes = [permissions.AllowAny]
class BulkWeatherView(APIView):
    """
    A unified, public endpoint to get live weather for a list of cities.
    Accepts a POST request with {"cities": ["Hunza", "Skardu"]}.
    This is now the single source of truth for weather data.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        cities = request.data.get('cities', [])
        if not cities or not isinstance(cities, list):
            return Response({"error": "A non-empty list of cities is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Use the robust service function to get live weather data
        weather_data_map = get_weather_for_cities(cities)
        
        # Convert the dictionary map to a list of objects for the frontend
        response_data = [{"city": city, **data} for city, data in weather_data_map.items()]
        
        return Response(response_data, status=status.HTTP_200_OK)

class AllDestinationsView(generics.ListAPIView):
    """
    Provides a simple, public list of all destinations in the database.
    Used by the home screen to get its initial data set.
    """

    queryset = Destination.objects.all().order_by('name')
    serializer_class = DestinationSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None 
class GenerateItineraryView(APIView):
    """
    Accepts detailed user preferences and uses Gemini to generate a full itinerary.
    Includes a robust fallback to a mock response on failure.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        prefs = request.data
        prompt = f"""
        You are 'Tourista', a creative and expert travel planner for all of Pakistan.
        Generate a detailed, day-by-day itinerary for a trip. Be specific and imaginative with your suggestions.

        **Trip Details:**
        - **Destination:** {prefs.get('destination', 'Not specified')}
        - **Duration:** {prefs.get('duration', 'Not specified')}
        - **Budget Style:** {prefs.get('budget', 'Flexible')}
        - **Travel Style:** {prefs.get('style', 'Balanced')}
        
        **Your Task:**
        1. Create a plan for each day.
        2. For each day, suggest 2-3 specific, real, and interesting activities or places (e.g., "Morning hike to Fairy Meadows viewpoint", "Afternoon exploring the ancient Baltit Fort").
        3. For each activity, provide a short, exciting one-sentence description.
        4. Include a unique, budget-appropriate meal suggestion for each day (e.g., "Lunch at a local cafe known for its Chapshuro", "Dinner enjoying fresh trout by the river").
        
        **Response Format:**
        You MUST respond ONLY with a valid JSON object. Do not include any text before or after the JSON.
        The JSON structure must be:
        {{"destination": "{prefs.get('destination')}", "duration": "{prefs.get('duration')}", "daily_plan": [{{"day": 1, "title": "Catchy Day Title", "activities": [{{"time": "Time of Day", "activity": "Activity Name", "description": "Short description."}}]}}]}}
        """

        try:
            print(f"--- Itinerary Generator: Sending prompt to Gemini... ---")
            response = model.generate_content(prompt)
            json_response_text = response.text.strip().replace('```json', '').replace('```', '')
            import json
            return Response(json.loads(json_response_text), status=status.HTTP_200_OK)

        except Exception as e:
            print(f"--- Itinerary Generator ERROR: {e}. Falling back to mock response. ---")
            mock_itinerary = {
                "destination": prefs.get('destination', 'your destination'),
                "duration": prefs.get('duration', 'your trip'),
                "daily_plan": [{
                    "day": 1,
                    "title": "Arrival & Exploration (Sample)",
                    "activities": [
                        {"time": "Afternoon", "activity": "Explore Local Market", "description": "Experience the local culture and find unique souvenirs."},
                        {"time": "Evening", "activity": "Dinner at a Traditional Restaurant", "description": "Enjoy authentic local cuisine."}
                    ]
                }]
            }
            return Response(mock_itinerary, status=status.HTTP_200_OK)



# class RecommendDestinationView(APIView):
#     """
#     Accepts questionnaire answers and uses Gemini to recommend destinations across Pakistan.
#     Includes robust fallback logic to ensure reliability.
#     """
#     permission_classes = [permissions.IsAuthenticated]

#     def post(self, request, *args, **kwargs):
#         import json, random
#         answers = request.data

#         # Initialize Gemini model safely
#         try:
#             model = genai.GenerativeModel('models/gemini-1.5-flash-latest')
#         except Exception as e:
#             print(f"[CRITICAL] Gemini init failed: {e}")
#             model = None

#         # Build a more detailed prompt for realistic + diverse destinations
#         prompt = f"""
#         You are 'Tourista', an AI-powered travel assistant and budget analyst for Pakistan.
#         Based on the user's preferences, recommend the top 2–3 destinations within Pakistan.

#         **User Travel Profile:**
#         - Desired Scenery: {answers.get('scenery', 'any')}
#         - Trip Vibe: {answers.get('vibe', 'any')}
#         - Group Size: {answers.get('group_size', 'any')}
#         - Duration: {answers.get('duration', 'any')}
#         - Spending Style: {answers.get('spending_style', 'any')}
#         - Departure City: {answers.get('departure_city', 'any')}
#         - Accommodation: {answers.get('accommodation', 'any')}
#         - Food Preference: {answers.get('food_preference', 'any')}
#         - Extra Activities: {answers.get('extra_activities', 'any')}

#         **Your Task:**
#         1. Recommend 2–3 real travel destinations across Pakistan (not just Hunza/Swat/Lahore).
#         2. Prefer a mix of provinces — mountains, beaches, cultural cities, or historical towns.
#         3. For each destination, provide:
#             - "name": the full name (e.g., "Skardu Valley")
#             - "city": the main nearby city
#             - "province": Punjab, Sindh, KP, Balochistan, or Gilgit-Baltistan
#             - "country": "Pakistan"
#             - "reason": why this destination matches the user's preferences
#             - "estimated_budget_pkr": realistic total budget (in PKR)
#             - "tags": 2–4 keywords like ["Adventure", "Culture", "Nature"]
#         4. Always respond with valid JSON only. Do not include extra text.

#         **Output Format (must be a single valid JSON):**
#         {{
#           "recommendations": [
#             {{
#               "name": "Destination Name",
#               "city": "City Name",
#               "province": "Province Name",
#               "country": "Pakistan",
#               "reason": "Short compelling reason here",
#               "estimated_budget_pkr": 120000,
#               "tags": ["Adventure", "Hiking", "Culture"]
#             }}
#           ]
#         }}
#         """

#         # --- Try AI recommendation ---
#         try:
#             if not model:
#                 raise Exception("Gemini not initialized")

#             print(f"--- [Tourista AI] Sending prompt to Gemini... ---")
#             response = model.generate_content(prompt)

#             response_text = response.text.strip()
#             cleaned_json = (
#                 response_text.replace("```json", "")
#                 .replace("```", "")
#                 .strip()
#             )

#             data = json.loads(cleaned_json)
#             return Response(data, status=status.HTTP_200_OK)

#         # --- Fallback logic ---
#         except Exception as e:
#             print(f"[Tourista AI ERROR] {e} — Falling back to smart mock response.")

#             MOCK_DESTINATIONS = [
#                 {"name": "Hunza Valley", "city": "Hunza", "province": "Gilgit-Baltistan",
#                  "country": "Pakistan", "reason": "Breathtaking valleys surrounded by snow-capped peaks and warm local culture."},
#                 {"name": "Skardu Valley", "city": "Skardu", "province": "Gilgit-Baltistan",
#                  "country": "Pakistan", "reason": "Heaven for adventure seekers with lakes, glaciers, and hiking routes."},
#                 {"name": "Neelum Valley", "city": "Muzaffarabad", "province": "Azad Kashmir",
#                  "country": "Pakistan", "reason": "Peaceful riverside beauty and green landscapes perfect for relaxation."},
#                 {"name": "Lahore", "city": "Lahore", "province": "Punjab",
#                  "country": "Pakistan", "reason": "A cultural and culinary heart of Pakistan rich in Mughal heritage."},
#                 {"name": "Gwadar", "city": "Gwadar", "province": "Balochistan",
#                  "country": "Pakistan", "reason": "A unique coastal escape with emerging beach tourism and seafood."},
#                 {"name": "Malam Jabba", "city": "Swat", "province": "Khyber Pakhtunkhwa",
#                  "country": "Pakistan", "reason": "Best for winter sports and family-friendly adventure in the mountains."},
#                 {"name": "Karachi", "city": "Karachi", "province": "Sindh",
#                  "country": "Pakistan", "reason": "Vibrant coastal city with shopping, beaches, and modern vibes."},
#                 {"name": "Murree", "city": "Murree", "province": "Punjab",
#                  "country": "Pakistan", "reason": "A classic hill station close to Islamabad with cool weather and easy access."}
#             ]

#             # Randomly pick 2–3 different destinations for fallback
#             selected_mocks = random.sample(MOCK_DESTINATIONS, k=3)

#             # Estimate budgets based on spending style
#             spending_style = answers.get('spending_style', '').lower()
#             for mock in selected_mocks:
#                 if "budget" in spending_style:
#                     mock['estimated_budget_pkr'] = random.randint(40000, 80000)
#                 elif "premium" in spending_style:
#                     mock['estimated_budget_pkr'] = random.randint(150000, 250000)
#                 else:
#                     mock['estimated_budget_pkr'] = random.randint(90000, 140000)
#                 mock['tags'] = random.sample(["Adventure", "Culture", "Nature", "Relaxation", "Family"], 3)

#             return Response({"recommendations": selected_mocks}, status=status.HTTP_200_OK)

class SaveAIItineraryView(APIView):
    """
    Accepts a full AI-generated JSON plan and converts it into
    real Itinerary and ItineraryItem objects in the database.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        ai_plan = request.data
        user = request.user

        try:
            # Step 1: Create the main Itinerary object
            new_itinerary = Itinerary.objects.create(
                user=user,
                name=f"AI Trip to {ai_plan.get('destination', 'New Destination')}",
                start_date=timezone.now().date(), # Use current date as placeholder
                end_date=(timezone.now() + timedelta(days=len(ai_plan.get('daily_plan', [])) - 1)).date()
            )

            # Step 2: Process each day in the AI's plan
            for day_plan in ai_plan.get('daily_plan', []):
                day_number = day_plan.get('day')
                for activity in day_plan.get('activities', []):
                    activity_name = activity.get('activity')
                    
                    # Step 3: Find or Create a Destination object for each activity
                    # This is a robust way to handle new places the AI might suggest.
                    # We use the city from the main destination as a placeholder.
                    destination_obj, created = Destination.objects.get_or_create(
                        name=activity_name,
                        defaults={
                            'city': ai_plan.get('destination', 'Unknown'),
                            'country': 'Pakistan',
                            'description': activity.get('description', '')
                        }
                    )
                    
                    # Step 4: Create the ItineraryItem, linking everything together
                    ItineraryItem.objects.create(
                        itinerary=new_itinerary,
                        destination=destination_obj,
                        day_number=day_number,
                        start_time=None # Can be updated later by the user
                    )
            
            # Serialize the newly created, real itinerary to send back
            serializer = ItineraryDetailSerializer(new_itinerary)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            print(f"--- Save AI Itinerary ERROR: {e} ---")
            return Response({"error": "Could not save the AI-generated itinerary."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

# class BudgetEstimationView(APIView):
#     """
#     AI-powered travel budget estimator for Pakistan.
#     Accepts destination + user preferences and returns a detailed breakdown.
#     """
#     permission_classes = [permissions.IsAuthenticated]

#     def post(self, request, *args, **kwargs):
#         destination = request.data.get('destination')
#         preferences = request.data.get('preferences', {})
#         if not destination or not preferences:
#             return Response({"error": "Destination and preferences are required."}, status=status.HTTP_400_BAD_REQUEST)
        
#         duration_str = preferences.get("duration", "3 Days")
#         try:
#             duration_days = int(re.search(r'\d+', duration_str).group())
#         except (ValueError, AttributeError):
#             duration_days = 3
        
#         prompt = f"""
#         You are 'Tourista', an expert travel budget analyst for Pakistan.
#         Estimate a realistic, itemized budget for a trip.
#         **Trip Context:** Destination: {destination}, Preferences: {json.dumps(preferences)}, Duration: {duration_days} days.
#         **Instructions:** Base estimations on Pakistani market prices. Adjust for preferences.
#         **Format:** Respond ONLY with valid JSON: {{"destination": "{destination}", "total_budget_pkr": ..., "breakdown": [...]}}
#         """

#         try:
#             # THIS IS THE FIX: Initialize the model safely inside the view.
#             model = genai.GenerativeModel('gemini-pro')
#             if not model:
#                 raise Exception("Gemini model not initialized.")
            
#             print(f"--- [Tourista Budget AI] Generating estimate for {destination} ---")
#             response = model.generate_content(prompt)
#             json_response_text = response.text.strip().replace('```json', '').replace('```', '')
#             budget_data = json.loads(json_response_text)
#             return Response(budget_data, status=status.HTTP_200_OK)

#         except Exception as e:
#             print(f"--- [Tourista Budget AI ERROR]: {e}. Falling back to DYNAMIC mock. ---")

#             # --- THIS IS THE FIX: Use the correct variable name 'spending_style' ---
#             spending_style = preferences.get("spending_style", "Standard")
            
#             # Base daily cost per person (more realistic)
#             base_daily_cost = {"Budget-Conscious": 5000, "Standard": 12000, "Premium": 30000}.get(spending_style, 10000)
            
#             # Group size multiplier
#             group_size_str = preferences.get("group_size", "1")
#             try:
#                 group_size = int(re.search(r'\d+', group_size_str).group())
#             except:
#                 group_size = 2 # Default if parsing fails
            
#             # Destination cost multiplier
#             destination_multiplier = {"Hunza Valley": 1.2, "Skardu": 1.1, "Murree": 0.9}.get(destination, 1.0)
            
#             # Calculate total budget
#             total_budget = int(base_daily_cost * duration_days * group_size * destination_multiplier)

#             # Create a dynamic breakdown
#             breakdown = [
#                 {"category": "Accommodation", "description": f"{duration_days}-night stay for {group_size} people", "cost_pkr": int(total_budget * 0.40)},
#                 {"category": "Food", "description": "Meals and snacks", "cost_pkr": int(total_budget * 0.30)},
#                 {"category": "Transport", "description": "Local travel", "cost_pkr": int(total_budget * 0.15)},
#                 {"category": "Activities", "description": "Sightseeing and entry fees", "cost_pkr": int(total_budget * 0.15)},
#             ]
            
#             mock_budget = {
#                 "destination": destination,
#                 "total_budget_pkr": total_budget,
#                 "breakdown": breakdown,
#             }
#             return Response(mock_budget, status=status.HTTP_200_OK)


# FILE: planner/views.py

import json
import re
from typing import Any, Dict, List, Optional

import google.generativeai as genai
from django.conf import settings
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

# Import your models as needed (example)
# from .models import Destination, Itinerary, ...

# ---------------------
# AI Initialization
# ---------------------
# We avoid creating a single global model that may be the wrong model id.
# Instead, try a short list of likely working model IDs when making calls.
genai.configure(api_key=getattr(settings, "GOOGLE_GEMINI_API_KEY", None))

# Candidate model ids to try. Adjust/add as Google updates names.
MODEL_CANDIDATES = [
    "gemini-1.5-flash-latest",
    "gemini-1.5-flash",
    "gemini-1.5",
    "gemini-pro",
]

def try_generate_with_candidates(prompt: str, max_output_chars: int = 3000) -> Optional[str]:
    """
    Try to call the generative API using a set of candidate model identifiers.
    Returns the raw text of the model response if successful, otherwise None.
    """
    last_err = None
    for model_id in MODEL_CANDIDATES:
        try:
            model = genai.GenerativeModel(model_id)
            # generate_content is what you've used; keep using it and handle failures
            response = model.generate_content(prompt)
            # response.text is the textual output
            text = getattr(response, "text", None)
            if text:
                return text
        except Exception as e:
            # Keep trying others; log for server logs.
            print(f"[Gemini Attempt] model={model_id} failed: {e}")
            last_err = e
            continue
    print(f"[Gemini] All candidate models failed. Last error: {last_err}")
    return None

def extract_json_from_text(text: str) -> Optional[Dict[str, Any]]:
    """
    Extract the first JSON object from a block of text robustly.
    Strips markdown fences (```json ... ```), finds {...}, and returns parsed JSON.
    """
    if not text:
        return None

    cleaned = text.strip()

    # Remove common markdown code fences
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned, flags=re.IGNORECASE)

    # Try to find the first {...} JSON object (handles large JSON)
    # Find balanced braces using a simple stack approach
    start_idx = cleaned.find("{")
    if start_idx == -1:
        return None

    stack = []
    for i in range(start_idx, len(cleaned)):
        ch = cleaned[i]
        if ch == "{":
            stack.append("{")
        elif ch == "}":
            stack.pop()
            if not stack:
                json_text = cleaned[start_idx:i+1]
                try:
                    return json.loads(json_text)
                except Exception as e:
                    # Try a looser parse (sometimes AI uses single quotes)
                    try:
                        fixed = json_text.replace("'", '"')
                        return json.loads(fixed)
                    except Exception as e2:
                        print(f"[extract_json] JSON parse failed: {e} / {e2}")
                        return None
    # If loop ends without balanced braces
    return None

# ---------------------
# Deterministic fallback budget estimator
# ---------------------
REGION_MULTIPLIER = {
    # Some sample multipliers (higher in remote mountain areas)
    "hunza": 1.25,
    "skardu": 1.2,
    "fairy meadows": 1.2,
    "naran": 1.15,
    "kaghan": 1.15,
    "swat": 1.05,
    "murree": 0.95,
    "lahore": 1.0,
    "karachi": 1.0,
    "islamabad": 1.05,
    "gwadar": 1.1,
    # default: 1.0
}

SPENDING_PROFILE_DAILY = {
    # typical per-person daily baseline by named profile
    "budget-conscious": 3000,
    "standard": 9000,
    "premium": 25000,
    # alternative names handling
    "economy": 3000,
    "mid-range": 9000,
    "luxury": 25000,
}

def normalize_profile(style: str) -> str:
    if not style:
        return "standard"
    s = style.lower()
    if "budget" in s or "econom" in s:
        return "budget-conscious"
    if "premium" in s or "luxury" in s:
        return "premium"
    return "standard"

def estimate_budget_fallback(destination: str, preferences: Dict[str, Any]) -> Dict[str, Any]:
    """
    Deterministic fallback budget estimator.
    Returns {"destination": ..., "total_budget_pkr": int, "breakdown": [...]}
    """
    # Duration extraction
    duration_str = preferences.get("duration", preferences.get("days", "3"))
    try:
        days = int(re.search(r"\d+", str(duration_str)).group())
        if days <= 0:
            days = 3
    except Exception:
        days = 3

    # Spending profile
    spending_style = normalize_profile(preferences.get("budget") or preferences.get("budget_style") or preferences.get("spending_style", "standard"))
    daily_per_person = SPENDING_PROFILE_DAILY.get(spending_style, SPENDING_PROFILE_DAILY["standard"])

    # Group size
    group_str = str(preferences.get("group_size", "1"))
    try:
        group = int(re.search(r"\d+", group_str).group())
        if group <= 0:
            group = 1
    except Exception:
        group = 2

    dest_key = (destination or "").lower()
    multiplier = 1.0
    for k, v in REGION_MULTIPLIER.items():
        if k in dest_key:
            multiplier = v
            break

    # Base total
    total = int(daily_per_person * days * group * multiplier)

    # Deterministic breakdown ratios
    acc = int(total * 0.45)
    food = int(total * 0.25)
    transport = int(total * 0.18)
    activities = total - (acc + food + transport)  # remaining

    breakdown = [
        {"category": "Accommodation", "description": f"{days}-night accommodation costs for {group} person(s)", "cost_pkr": acc},
        {"category": "Food", "description": f"Meals and local food for {group} person(s) over {days} days", "cost_pkr": food},
        {"category": "Transport", "description": "Local transport (fuel, taxis, transfers)", "cost_pkr": transport},
        {"category": "Activities", "description": "Local activities, guides, and entry fees", "cost_pkr": activities},
    ]

    return {
        "destination": destination,
        "total_budget_pkr": int(total),
        "breakdown": breakdown,
    }

# ---------------------
# Helpers used in views
# ---------------------
def generate_budget_for_destination(destination: str, preferences: Dict[str, Any]) -> Dict[str, Any]:
    """
    Attempt AI generation of budget; fall back to deterministic estimator.
    Returns JSON-serializable dict with keys: destination, total_budget_pkr (int), breakdown (list)
    """
    # Build careful prompt with explicit JSON output requirement
    prompt = f"""
You are "Tourista", Pakistan's travel budget analyst. Create a realistic, locally-aware budget estimation based on the context below.

Trip Context:
- Destination: {destination}
- Preferences: {json.dumps(preferences, ensure_ascii=False)}

Instructions:
1) Base your calculations on typical Pakistani prices adjusted to destination and spending style.
2) Compute integer "total_budget_pkr".
3) Provide "breakdown": a JSON array of objects with fields "category", "description", "cost_pkr".
4) Return EXACTLY one JSON object and nothing else in this format:

{{
  "destination": "{destination}",
  "total_budget_pkr": 95000,
  "breakdown": [
    {{"category": "Accommodation", "description": "3 nights mid-range hotel", "cost_pkr": 45000}},
    {{"category": "Food", "description": "Local and mid-range meals", "cost_pkr": 25000}},
    {{"category": "Transport", "description": "Local travel and transfers", "cost_pkr": 15000}},
    {{"category": "Activities", "description": "Sightseeing and entry fees", "cost_pkr": 10000}}
  ]
}}

Make sure numbers are integers and the JSON is valid.
"""
    raw = try_generate_with_candidates(prompt)
    if raw:
        parsed = extract_json_from_text(raw)
        if parsed and isinstance(parsed, dict):
            # sanitize fields
            try:
                parsed["total_budget_pkr"] = int(parsed.get("total_budget_pkr", 0))
            except Exception:
                parsed["total_budget_pkr"] = int(parsed.get("total_budget_pkr") or 0)
            # Ensure breakdown exists and costs are ints
            breakdown = parsed.get("breakdown") or []
            sanitized = []
            for b in breakdown:
                cat = b.get("category", "Misc")
                desc = b.get("description", "")
                try:
                    cost = int(b.get("cost_pkr", 0))
                except Exception:
                    try:
                        cost = int(re.sub(r"[^\d]", "", str(b.get("cost_pkr") or "0")))
                    except Exception:
                        cost = 0
                sanitized.append({"category": cat, "description": desc, "cost_pkr": cost})
            parsed["breakdown"] = sanitized
            # If parsed has no meaningful data, fallback
            if parsed.get("total_budget_pkr", 0) <= 0 or len(parsed["breakdown"]) == 0:
                print("[generate_budget_for_destination] AI result incomplete, using fallback estimator.")
                return estimate_budget_fallback(destination, preferences)
            return parsed
        else:
            print("[generate_budget_for_destination] Could not extract JSON from AI output.")
    else:
        print("[generate_budget_for_destination] No AI response (all models failed).")

    # Fallback deterministic estimator
    return estimate_budget_fallback(destination, preferences)

# ---------------------
# Views
# ---------------------
# class RecommendDestinationView(APIView):
#     """
#     Accepts user questionnaire and returns 2-3 recommended destinations.
#     For each recommendation we also compute an (AI or fallback) budget and attach it,
#     so frontend has consistent budget & breakdown to show immediately.
#     """
#     permission_classes = [permissions.IsAuthenticated]

#     def post(self, request, *args, **kwargs):
#         answers = request.data or {}
#         prompt = f"""
# You are 'Tourista', an expert travel analyst for Pakistan.
# Based on the user's preferences below, recommend the top 2 destinations (Pakistan only).

# User Preferences: {json.dumps(answers, ensure_ascii=False)}

# For each destination, provide:
# - name (string)
# - city (string)
# - country (string, 'Pakistan')
# - reason (string)
# - tags (array of 2-3 keyword strings)

# Do NOT include budget data here — the server will compute budgets separately and attach them.
# Respond ONLY with valid JSON in this format:
# {{ "recommendations": [ {{ "name":"...", "city":"...", "country":"Pakistan", "reason":"...", "tags":["..",".."] }} ] }}
# """
#         try:
#             # Try AI generation using candidate models
#             raw = try_generate_with_candidates(prompt, max_output_chars=2000)
#             parsed = None
#             if raw:
#                 parsed = extract_json_from_text(raw)

#             if not parsed or "recommendations" not in parsed:
#                 raise Exception("AI did not return valid recommendations JSON.")

#             recommendations = parsed.get("recommendations", [])
#             # Limit to 3 or less
#             recommendations = recommendations[:3] if len(recommendations) > 3 else recommendations

#             # For each recommendation compute budget (AI or fallback) deterministically here
#             enriched = []
#             for rec in recommendations:
#                 name = rec.get("name") or rec.get("destination") or ""
#                 city = rec.get("city") or ""
#                 country = rec.get("country") or "Pakistan"
#                 reason = rec.get("reason") or ""
#                 tags = rec.get("tags") or []

#                 # compute budget for this destination using same preferences (so consistent)
#                 budget = generate_budget_for_destination(name, answers)

#                 enriched_rec = {
#                     "name": name,
#                     "city": city,
#                     "country": country,
#                     "reason": reason,
#                     "tags": tags,
#                     # attach consistent budget fields used by frontend
#                     "estimated_budget_pkr": int(budget.get("total_budget_pkr", 0)),
#                     "budget_breakdown": budget.get("breakdown", []),
#                     # optional image_url if AI provided (or leave to frontend)
#                     "image_url": rec.get("image_url"),
#                 }
#                 enriched.append(enriched_rec)

#             return Response({"recommendations": enriched}, status=status.HTTP_200_OK)

#         except Exception as e:
#             print(f"[RecommendDestinationView ERROR] {e}. Falling back to mock recommendations.")

#             # Fallback mock recommendations (deterministic)
#             MOCK_DESTINATIONS = [
#                 {"name": "Hunza Valley", "city": "Hunza", "country": "Pakistan", "reason": "Dramatic mountain scenery.", "tags": ["Nature","Hiking"]},
#                 {"name": "Swat Valley", "city": "Swat", "country": "Pakistan", "reason": "Lush valleys and rivers.", "tags": ["Nature","Scenic"]},
#                 {"name": "Lahore City", "city": "Lahore", "country": "Pakistan", "reason": "Historic sites and food scene.", "tags": ["Culture","Food"]},
#             ]

#             enriched = []
#             for rec in MOCK_DESTINATIONS[:3]:
#                 # Use same deterministic estimator so budget is consistent
#                 budget = generate_budget_for_destination(rec["name"], answers)
#                 enriched.append({
#                     "name": rec["name"],
#                     "city": rec["city"],
#                     "country": rec["country"],
#                     "reason": rec["reason"],
#                     "tags": rec["tags"],
#                     "estimated_budget_pkr": int(budget.get("total_budget_pkr", 0)),
#                     "budget_breakdown": budget.get("breakdown", []),
#                 })

#             return Response({"recommendations": enriched}, status=status.HTTP_200_OK)


class RecommendDestinationView(APIView):
    """
    Accepts user questionnaire and returns 2-3 recommended destinations.
    Dynamically generates diverse Pakistan destinations + attaches realistic budgets.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        answers = request.data or {}
        prompt = f"""
You are 'Tourista', an expert Pakistani travel planner.
Based on the user's preferences below, recommend the **top 3 travel destinations within Pakistan**.

User Preferences: {json.dumps(answers, ensure_ascii=False)}

Each destination must include:
- name (string)
- city (string)
- country (always 'Pakistan')
- reason (short 1–2 sentence reason why it fits the user)
- tags (array of 2–3 descriptive keywords)

Make sure destinations are **diverse** (not repeated each time) and **relevant to budget & interests**.
Respond ONLY with valid JSON in this format:
{{ "recommendations": [ {{ "name":"...", "city":"...", "country":"Pakistan", "reason":"...", "tags":["..",".."] }} ] }}
"""
        try:
            raw = try_generate_with_candidates(prompt, max_output_chars=2500)
            parsed = extract_json_from_text(raw) if raw else None

            if not parsed or "recommendations" not in parsed:
                raise Exception("AI did not return valid JSON")

            recommendations = parsed["recommendations"][:3]

        except Exception as e:
            print(f"[RecommendDestinationView ERROR] {e}. Using fallback destinations.")

            # Random fallback to ensure diversity
            ALL_FALLBACKS = [
                {"name": "Hunza Valley", "city": "Hunza", "country": "Pakistan", "reason": "Spectacular mountain views and adventure spots.", "tags": ["Nature", "Hiking"]},
                {"name": "Swat Valley", "city": "Swat", "country": "Pakistan", "reason": "Beautiful green valleys and rivers ideal for families.", "tags": ["Nature", "Relaxation"]},
                {"name": "Skardu", "city": "Skardu", "country": "Pakistan", "reason": "Gateway to K2 and peaceful lakes.", "tags": ["Adventure", "Mountains"]},
                {"name": "Lahore", "city": "Lahore", "country": "Pakistan", "reason": "Rich history, Mughal architecture, and food culture.", "tags": ["Culture", "Food"]},
                {"name": "Karachi", "city": "Karachi", "country": "Pakistan", "reason": "Beaches, nightlife, and diverse cuisine.", "tags": ["Urban", "Beach"]},
                {"name": "Islamabad", "city": "Islamabad", "country": "Pakistan", "reason": "Modern city surrounded by scenic hills.", "tags": ["Scenic", "Modern"]},
                {"name": "Murree", "city": "Murree", "country": "Pakistan", "reason": "Hill station with cool weather and forests.", "tags": ["Hill Station", "Nature"]},
                {"name": "Neelum Valley", "city": "Azad Kashmir", "country": "Pakistan", "reason": "Waterfalls, rivers, and untouched beauty.", "tags": ["Nature", "Peaceful"]},
            ]
            recommendations = random.sample(ALL_FALLBACKS, 3)

        # ✅ Compute realistic budget for each destination
        enriched = []
        for rec in recommendations:
            name = rec.get("name", "")
            budget = generate_budget_for_destination(name, answers)

            enriched.append({
                "name": name,
                "city": rec.get("city", ""),
                "country": rec.get("country", "Pakistan"),
                "reason": rec.get("reason", ""),
                "tags": rec.get("tags", []),
                "estimated_budget_pkr": int(budget.get("total_budget_pkr", 0)),
                "budget_breakdown": budget.get("breakdown", []),
                "image_url": rec.get("image_url"),
            })

        return Response({"recommendations": enriched}, status=status.HTTP_200_OK)

class BudgetEstimationView(APIView):
    """
    Accepts single destination + preferences and returns a budget breakdown.
    This endpoint is useful when user has an exact destination and wants a budget.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        destination = request.data.get("destination")
        preferences = request.data.get("preferences", {})

        if not destination:
            return Response({"error": "Destination is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            budget = generate_budget_for_destination(destination, preferences)
            # Ensure types
            budget["total_budget_pkr"] = int(budget.get("total_budget_pkr", 0))
            budget["destination"] = destination
            # ensure breakdown exists
            if "breakdown" not in budget or not isinstance(budget["breakdown"], list):
                budget["breakdown"] = []
            return Response(budget, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"[BudgetEstimationView ERROR] {e}")
            # Last-resort fallback
            fb = estimate_budget_fallback(destination, preferences)
            return Response(fb, status=status.HTTP_200_OK)


class SaveTripIdeaView(APIView):
    """
    Creates a simple, one-day itinerary from a single destination name.
    This is used to quickly save an AI recommendation.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        destination_name = request.data.get('name')
        destination_city = request.data.get('city')
        if not destination_name:
            return Response({"error": "Destination name is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Find or create the main Destination object
            destination_obj, _ = Destination.objects.get_or_create(
                name=destination_name,
                defaults={'city': destination_city or 'Unknown', 'country': 'Pakistan'}
            )
            
            # Create the main Itinerary
            new_itinerary = Itinerary.objects.create(
                user=request.user,
                name=f"Trip to {destination_name}",
                start_date=timezone.now().date(),
                end_date=timezone.now().date(), # Initially a one-day trip
            )

            # Add the destination as the first activity on Day 1
            ItineraryItem.objects.create(
                itinerary=new_itinerary,
                destination=destination_obj,
                day_number=1,
            )
            
            # Return the ID of the newly created itinerary
            return Response({"itinerary_id": new_itinerary.id}, status=status.HTTP_201_CREATED)

        except Exception as e:
            print(f"--- Save Trip Idea ERROR: {e} ---")
            return Response({"error": "Could not save this trip idea."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
