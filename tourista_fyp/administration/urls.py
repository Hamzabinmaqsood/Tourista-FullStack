# In administration/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VendorAdminViewSet
from .views import VendorAdminViewSet, FeedbackAdminViewSet

router = DefaultRouter()
router.register(r'vendors', VendorAdminViewSet, basename='admin-vendor')
router.register(r'feedback', FeedbackAdminViewSet, basename='admin-feedback')

urlpatterns = [
    path('', include(router.urls)),
]