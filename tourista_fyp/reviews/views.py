# In reviews/views.py
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Review, ServiceReview
from .serializers import ReviewSerializer, ServiceReviewSerializer
from vendors.models import Booking 

class ReviewCreateView(generics.CreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    def create(self, request, *args, **kwargs):
        if Review.objects.filter(destination_id=kwargs['destination_id'], user=request.user).exists():
            return Response({"error": "You have already reviewed this destination."}, status=status.HTTP_400_BAD_REQUEST)
        return super().create(request, *args, **kwargs)
    def perform_create(self, serializer):
        serializer.save(user=self.request.user, destination_id=self.kwargs['destination_id'])


class ReviewListView(generics.ListAPIView):
    """
    Provides a list of all reviews for a specific destination.
    """
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny] # Anyone can read reviews

    def get_queryset(self):
        return Review.objects.filter(destination_id=self.kwargs['destination_id'])
    

class ServiceReviewCreateView(generics.CreateAPIView):
    serializer_class = ServiceReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    def create(self, request, *args, **kwargs):
        service_id = self.kwargs['service_id']
        user = request.user
        
        # --- THIS IS THE FIX: Check for a paid booking before allowing a review ---
        has_paid_booking = Booking.objects.filter(
            service_id=service_id, 
            user=user,
            status__in=[Booking.BookingStatus.CONFIRMED, Booking.BookingStatus.COMPLETED]
        ).exists()

        if not has_paid_booking:
            return Response({"error": "You can only review services you have booked and paid for."}, status=status.HTTP_403_FORBIDDEN)
        
        if ServiceReview.objects.filter(service_id=service_id, user=user).exists():
            return Response({"error": "You have already reviewed this service."}, status=status.HTTP_400_BAD_REQUEST)
        
        return super().create(request, *args, **kwargs)
    def perform_create(self, serializer):
        serializer.save(user=self.request.user, service_id=self.kwargs['service_id'])

class ServiceReviewListView(generics.ListAPIView):
    serializer_class = ServiceReviewSerializer
    permission_classes = [permissions.AllowAny]
    def get_queryset(self):
        return ServiceReview.objects.filter(service_id=self.kwargs['service_id']).order_by('-created_at')