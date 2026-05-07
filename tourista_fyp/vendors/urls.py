# In vendors/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    VendorRegistrationView, 
    ServiceViewSet, 
    TouristBookingViewSet,
    VendorBookingViewSet,
    ServiceListView,
    ServiceDetailView,
    VendorStatsView,
    InitiatePaymentView,
    EasyPaisaIPNView
)
from .views import ServiceDetailView

# This router is for a VENDOR managing their services
vendor_service_router = DefaultRouter()
vendor_service_router.register(r'my-services', ServiceViewSet, basename='vendor-service')

# This router is for a TOURIST creating/viewing bookings
tourist_booking_router = DefaultRouter()
tourist_booking_router.register(r'bookings', TouristBookingViewSet, basename='tourist-booking')

urlpatterns = [
    # --- MANUAL URLS ---
    path('register/', VendorRegistrationView.as_view(), name='vendor-register'),
    path('services/all/', ServiceListView.as_view(), name='service-list-all'),
    path('my-bookings/', VendorBookingViewSet.as_view({'get': 'list'}), name='vendor-bookings-list'),
    path('my-bookings/<int:pk>/', VendorBookingViewSet.as_view({'get': 'retrieve'}), name='vendor-bookings-detail'),
    path('services/detail/<int:pk>/', ServiceDetailView.as_view(), name='service-detail'),
    path('services/detail/<int:pk>/', ServiceDetailView.as_view(), name='service-detail'),
    path('my-stats/', VendorStatsView.as_view(), name='vendor-stats'),
    path('bookings/<int:booking_id>/initiate-payment/', InitiatePaymentView.as_view(), name='initiate-payment'),
    path('easypaisa-ipn/', EasyPaisaIPNView.as_view(), name='easypaisa-ipn'),
    
    # --- ROUTER-GENERATED URLS ---
    path('', include(vendor_service_router.urls)),
    path('', include(tourist_booking_router.urls)),
    
]