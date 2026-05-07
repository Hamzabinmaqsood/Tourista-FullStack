# In users/serializers.py

from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import UserProfile
from planner.serializers import DestinationSerializer
from vendors.serializers import VendorSerializer 
from planner.models import Itinerary 
from django.utils import timezone 
from django.db.models import Count

class RegisterSerializer(serializers.ModelSerializer):
    # We add a password2 field to confirm the password
    password2 = serializers.CharField(style={'input_type': 'password'}, write_only=True)

    class Meta:
        model = User
        # List the fields we want for registration
        fields = ['username', 'email', 'password', 'password2']
        extra_kwargs = {
            'password': {'write_only': True} # Ensures password is not sent back in response
        }

    def validate(self, attrs):
        """
        Check that the two password entries match.
        """
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        # You can also add Django's built-in password validation here if you want
        # validate_password(attrs['password'])
        
        return attrs

    def create(self, validated_data):
        """
        Create and return a new user.
        """
        # We use create_user to handle password hashing automatically
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        # We don't need the password2 field anymore, so we remove it
        # validated_data.pop('password2') # Not needed since we don't pass it to create_user

        return user
    
class UserProfileSerializer(serializers.ModelSerializer):
    favorite_destinations = DestinationSerializer(many=True, read_only=True)
    class Meta:
        model = UserProfile
        fields = ['travel_style', 'budget', 'preferred_languages', 'avatar', 'bio','favorite_destinations']

class UserSerializer(serializers.ModelSerializer):
    # This nests the profile data within the user data
    profile = UserProfileSerializer()
    vendor_profile = VendorSerializer(read_only=True)

    trips_completed = serializers.SerializerMethodField()
    countries_visited = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'profile','vendor_profile','trips_completed', 'countries_visited']

    def get_trips_completed(self, obj):
        # A trip is "completed" if its end_date is in the past.
        # 'obj' here is the User instance.
        return Itinerary.objects.filter(user=obj, end_date__lt=timezone.now().date()).count()
    
    def get_countries_visited(self, obj):
        return Itinerary.objects.filter(
            user=obj, 
            end_date__lt=timezone.now().date()
        ).values('items__destination__country').distinct().count()


    def update(self, instance, validated_data):
        # This custom update method handles saving the nested profile data.
        profile_data = validated_data.pop('profile', {})
        profile_serializer = UserProfileSerializer(instance.profile, data=profile_data, partial=True)
        
        if profile_serializer.is_valid(raise_exception=True):
            profile_serializer.save()

        # Update the main user fields (e.g., email)
        return super().update(instance, validated_data)
