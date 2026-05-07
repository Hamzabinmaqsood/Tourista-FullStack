# In planner/urls.py
from django.urls import path, include
from rest_framework_nested import routers
from .views import (
    AIRecommendationView,
    ItineraryViewSet,
    ItineraryItemViewSet,
    AIChatView,
    DestinationDetailView,
    CulturalEventsView, 
    ItineraryRouteView,
    BulkWeatherView,
    jwt_test_view,
    RecommendDestinationView,
    GenerateItineraryView,
    SaveAIItineraryView,
    BudgetEstimationView,
    SaveTripIdeaView,
)
from .views import AllDestinationsView

# --- Primary Routers for CRUD operations ---
# This handles /itineraries/ and /itineraries/{id}/
router = routers.SimpleRouter()
router.register(r'itineraries', ItineraryViewSet, basename='itinerary')
# This handles /itineraries/{id}/items/ and /itineraries/{id}/items/{id}/
items_router = routers.NestedSimpleRouter(router, r'itineraries', lookup='itinerary')
items_router.register(r'items', ItineraryItemViewSet, basename='itinerary-items')



urlpatterns = [
    # --- Automatically Generated Router URLs ---
    path('', include(router.urls)),
    path('', include(items_router.urls)),

    # --- AI-Powered Endpoints ---
    path('recommendations/', AIRecommendationView.as_view(), name='ai-recommendations'),
    path('ai-chat/', AIChatView.as_view(), name='ai-chat'),
    path('recommend-destination/', RecommendDestinationView.as_view(), name='recommend-destination'),
    path('generate-itinerary/', GenerateItineraryView.as_view(), name='generate-itinerary'),

    # --- Data Endpoints ---
    path('destinations/<int:pk>/', DestinationDetailView.as_view(), name='destination-detail'),
    path('events/', CulturalEventsView.as_view(), name='cultural-events-list'),

    # --- Itinerary-Specific Action Endpoints ---
    path('itineraries/<int:itinerary_pk>/optimize-route/', ItineraryRouteView.as_view(), name='itinerary-route'),

    # --- Utility and Test Endpoints ---
    # THIS IS NOW THE ONLY WEATHER ENDPOINT
    path('weather/bulk/', BulkWeatherView.as_view(), name='bulk-weather'),
    
    path('jwt-test/', jwt_test_view, name='jwt-test'),
    path('all-destinations/', AllDestinationsView.as_view(), name='all-destinations'),
    
]

urlpatterns += [
    path('save-ai-itinerary/', SaveAIItineraryView.as_view(), name='save-ai-itinerary'),
    # path('generate-itinerary/', GenerateItineraryView.as_view(), name='generate-itinerary'),
    path('estimate-budget/', BudgetEstimationView.as_view(), name='estimate-budget'),
    path('save-trip-idea/', SaveTripIdeaView.as_view(), name='save-trip-idea'),
]
