# In planner/services.py
from .models import Destination
from users.models import UserProfile
import requests
from django.conf import settings
from .models import Itinerary

def get_ai_recommendations(user_profile: UserProfile):
    """
    An intelligent AI service to recommend destinations based on user profile.
    This version uses the user's travel style and budget.
    """
    
    # 1. Get user preferences
    style = user_profile.travel_style
    # Use a very high budget if none is set, to include all options
    budget = user_profile.budget if user_profile.budget is not None else 999999.00

    print(f"--- AI Service: Generating recs for style='{style}', budget<='{budget}' ---")

    # 2. Define a mapping from travel style to destination type
    style_to_destination_map = {
        UserProfile.TravelStyle.ADVENTURE: ['HIKING_TRAIL', 'PARK'],
        UserProfile.TravelStyle.RELAXATION: ['PARK', 'BEACH', 'LANDMARK'],
        UserProfile.TravelStyle.CULTURAL: ['MUSEUM', 'LANDMARK'],
        UserProfile.TravelStyle.FAMILY: ['PARK', 'MUSEUM'],
        UserProfile.TravelStyle.BUDGET: ['PARK', 'LANDMARK'], # Budget travelers often enjoy free/low-cost sights
    }

    # 3. Build the initial queryset of all destinations
    queryset = Destination.objects.all()

    # 4. Filter destinations based on the mapping and budget
    preferred_types = style_to_destination_map.get(style, [])
    if preferred_types:
        # Filter by travel style
        queryset = queryset.filter(destination_type__in=preferred_types)
    
    # Always filter by budget
    queryset = queryset.filter(average_cost__lte=budget)

    # 5. Smart Sorting (Personalization Layer)
    # This is a simple example. A more advanced system could use a scoring algorithm.
    # We will exclude destinations the user has already favorited to suggest new things.
    favorited_ids = user_profile.favorite_destinations.values_list('id', flat=True)
    
    recommendations = queryset.exclude(id__in=favorited_ids).order_by('?')[:5] # Get 5 random new suggestions

    # If there are not enough new suggestions, include some favorites as a fallback.
    if len(recommendations) < 5:
        num_needed = 5 - len(recommendations)
        fallback_recs = queryset.filter(id__in=favorited_ids).order_by('?')[:num_needed]
        recommendations = list(recommendations) + list(fallback_recs)

    return recommendations

def get_weather_alerts_for_itinerary(itinerary: Itinerary):
    """
    Fetches weather forecasts for the unique cities in an itinerary.
    """
    # 1. Get unique cities from the itinerary to avoid duplicate API calls
    destinations = itinerary.items.select_related('destination').all()
    unique_cities = {item.destination.city for item in destinations}

    if not unique_cities:
        return {"message": "No destinations in this itinerary to fetch weather for."}

    # 2. Prepare to call the weather API for each city
    api_key = settings.OPENWEATHER_API_KEY
    base_url = "http://api.openweathermap.org/data/2.5/weather"
    weather_data = []

    for city in unique_cities:
        params = {
            'q': city,
            'appid': api_key,
            'units': 'metric'  # Get temperature in Celsius
        }
        try:
            response = requests.get(base_url, params=params)
            response.raise_for_status()  # Raise an exception for bad status codes (4xx or 5xx)
            data = response.json()

            # 3. Format the data cleanly for our response
            weather_data.append({
                "city": city,
                "temperature": data['main']['temp'],
                "feels_like": data['main']['feels_like'],
                "description": data['weather'][0]['description'].title(),
                "icon_code": data['weather'][0]['icon'],
                # You can build the full icon URL on the frontend like this:
                # `http://openweathermap.org/img/wn/{icon_code}@2x.png`
            })
        except requests.exceptions.HTTPError as e:
            # Handle cases where city is not found (404) or other API errors
            weather_data.append({"city": city, "error": f"Could not retrieve weather data. {e}"})
        except Exception as e:
            weather_data.append({"city": city, "error": f"An unexpected error occurred. {e}"})
    
    return weather_data

def get_weather_for_cities(cities: list):
    """
    Accepts a list of city names and returns a dictionary mapping
    each city to its REAL, LIVE weather data from OpenWeatherMap.
    """
    api_key = settings.OPENWEATHER_API_KEY
    if not api_key:
        print("WARNING: OPENWEATHER_API_KEY not set. Weather data will be empty.")
        return {}

    base_url = "http://api.openweathermap.org/data/2.5/weather"
    weather_map = {}

    # Use a set to avoid calling the API for the same city multiple times
    for city in set(cities):
        params = {'q': city, 'appid': api_key, 'units': 'metric'}
        try:
            response = requests.get(base_url, params=params, timeout=5) # Added a 5-second timeout
            response.raise_for_status() # This will raise an error for bad responses (4xx or 5xx)
            
            data = response.json()
            weather_map[city] = {
                "temp": round(data['main']['temp']),
                "description": data['weather'][0]['description'].title()
            }
            print(f"Successfully fetched weather for {city}: {weather_map[city]}")

        except requests.exceptions.RequestException as e:
            print(f"Could not fetch weather for {city}: {e}")
            continue # Move to the next city if one fails
            
    return weather_map

def get_optimized_route_for_itinerary(itinerary: Itinerary):
    """
    Fetches an optimized route connecting all destinations in an itinerary.
    It now filters out destinations with invalid (0,0) coordinates.
    """
    # 1. Get all items and prefetch the destination data
    items = itinerary.items.order_by('day_number', 'start_time').select_related('destination')
    
    # --- THIS IS THE FIX ---
    # Filter out any destinations that have invalid coordinates (0.0, 0.0)
    valid_destinations = [
        item.destination for item in items 
        if item.destination.latitude != 0.0 and item.destination.longitude != 0.0
    ]

    # 2. Check if we have enough valid points to create a route
    if len(valid_destinations) < 2:
        return {"error": "At least two destinations with valid coordinates are required to calculate a route."}

    # Format coordinates for the ORS API: [[lon, lat], [lon, lat], ...]
    coordinates = [
        [dest.longitude, dest.latitude] for dest in valid_destinations
    ]

    # 3. Call the OpenRouteService API (the rest of the function is the same)
    api_key = settings.OPENROUTESERVICE_API_KEY
    headers = {
        'Authorization': api_key,
        'Content-Type': 'application/json',
    }
    body = {
        "coordinates": coordinates,
        "radiuses": [-1] * len(coordinates)
    }
    
    try:
        response = requests.post(
            'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
            json=body,
            headers=headers
        )
        response.raise_for_status()
        data = response.json()

        route = data['features'][0]
        summary = route['properties']['summary']

        return {
            "route_geometry": route['geometry']['coordinates'],
            "total_distance_km": round(summary['distance'] / 1000, 2),
            "total_duration_hours": round(summary['duration'] / 3600, 2),
        }
    except requests.exceptions.HTTPError as e:
        return {"error": f"Failed to get route from ORS. {e.response.text}"}
    except Exception as e:
        return {"error": f"An unexpected error occurred. {e}"}
    