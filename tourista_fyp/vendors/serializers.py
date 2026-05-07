#  In vendors/serializers.py
from rest_framework import serializers
from .models import Vendor, Service, Booking
from planner.serializers import SimpleDestinationSerializer

# Define SimpleVendorSerializer first
class SimpleVendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = ['business_name']


class VendorDetailSerializer(serializers.ModelSerializer):
    # This explicitly gets the user's ID and names it 'user_id'
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    class Meta:
        model = Vendor
        fields = ['id', 'business_name', 'user_id'] # Send the ID clearly


class ServiceSerializer(serializers.ModelSerializer):
    # THIS IS THE FIX: Use our new, clear serializer
    vendor = VendorDetailSerializer(read_only=True)
    destination = SimpleDestinationSerializer(read_only=True)

    class Meta:
        model = Service
        fields = ['id', 'vendor', 'name', 'description', 'service_type', 'price', 'price_per', 'city', 'is_available', 'destination', 'cover_image', 'rating', 'review_count']
# Define VendorSerializer third
class VendorSerializer(serializers.ModelSerializer):
    """Serializer for vendor registration and viewing."""
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Vendor
        fields = ['id', 'user', 'user_username', 'business_name', 'contact_phone', 'business_description', 'is_verified']
        read_only_fields = ['user', 'is_verified']

# Define BookingSerializer last, as it depends on ServiceSerializer
class BookingSerializer(serializers.ModelSerializer):
    """
    Serializer for tourists to create and view their bookings.
    """
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    service = ServiceSerializer(read_only=True) # This now works correctly
    service_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'user', 'service', 'service_id', 'booking_date', 
            'service_start_date', 'service_end_date', 'status', 'total_price'
        ]
        read_only_fields = ['status', 'total_price', 'booking_date']

    def create(self, validated_data):
        service_id = validated_data.pop('service_id')
        service = Service.objects.get(pk=service_id)
        total_price = service.price
        booking = Booking.objects.create(
            service=service,
            total_price=total_price,
            **validated_data
        )
        return booking