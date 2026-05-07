# In administration/serializers.py
from rest_framework import serializers
from feedback.models import Feedback

class FeedbackAdminSerializer(serializers.ModelSerializer):
    """
    Serializer for admins to view and manage user feedback.
    """
    user_username = serializers.CharField(source='user.username', read_only=True, default='Anonymous')

    class Meta:
        model = Feedback
        fields = [
            'id', 'user', 'user_username', 'subject', 'message', 
            'rating', 'status', 'created_at'
        ]
        # Admin can only change the status, not the original feedback
        read_only_fields = ['id', 'user', 'user_username', 'subject', 'message', 'rating', 'created_at']