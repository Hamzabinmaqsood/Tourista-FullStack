# In utils/urls.py
from django.urls import path
from .views import TranslationView

urlpatterns = [
    path('translate/', TranslationView.as_view(), name='translation-service'),
]