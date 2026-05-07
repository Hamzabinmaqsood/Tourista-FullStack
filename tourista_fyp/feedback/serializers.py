# In feedback/serializers.py
from rest_framework import serializers
from .models import Feedback

class FeedbackCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for users to create new feedback.
    The user is set automatically.
    """
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = Feedback
        fields = ['id', 'user', 'subject', 'message', 'rating']