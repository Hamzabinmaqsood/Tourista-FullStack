# In reviews/serializers.py
from rest_framework import serializers
from .models import Review
from .models import Review, ServiceReview

class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = Review
        fields = ['id', 'user', 'rating', 'comment', 'created_at']


class ServiceReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = ServiceReview
        fields = ['id', 'user', 'rating', 'comment', 'created_at']