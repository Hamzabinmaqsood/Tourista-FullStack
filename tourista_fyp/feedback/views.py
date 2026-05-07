from django.shortcuts import render
# In feedback/views.py
from rest_framework import generics, permissions
from .models import Feedback
from .serializers import FeedbackCreateSerializer

class FeedbackCreateView(generics.CreateAPIView):
    """
    API endpoint for any authenticated user to submit feedback.
    """
    queryset = Feedback.objects.all()
    serializer_class = FeedbackCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # The serializer's HiddenField automatically handles associating the user
        serializer.save()