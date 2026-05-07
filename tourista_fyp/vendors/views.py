# // In vendors/views.py
from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from .models import Vendor, Service, Booking
from .serializers import (
    VendorSerializer, 
    ServiceSerializer, 
    BookingSerializer
) 
from django.utils import timezone 
from datetime import timedelta 
from django.db.models import Sum
from rest_framework.views import APIView
from django.conf import settings
from decimal import Decimal
from django.views.decorators.csrf import csrf_exempt
import requests
import json,socket
from urllib.parse import urlparse
from django_filters.rest_framework import DjangoFilterBackend

class IsVerifiedVendor(permissions.BasePermission):
    """ Custom permission to only allow verified vendors to manage services. """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        try:
            return request.user.vendor_profile.is_verified
        except Vendor.DoesNotExist:
            return False

class VendorRegistrationView(generics.CreateAPIView):
    """ API endpoint for users to apply to become a vendor. """
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ServiceViewSet(viewsets.ModelViewSet):
    """ API endpoint for verified vendors to manage their services. """
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated, IsVerifiedVendor]
    pagination_class = None

    def get_queryset(self):
        return Service.objects.filter(vendor__user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(vendor=self.request.user.vendor_profile)

class TouristBookingViewSet(viewsets.ModelViewSet):
    """ API endpoint for tourists to create and view their bookings. """
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user).select_related('service__vendor')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class VendorBookingViewSet(viewsets.ReadOnlyModelViewSet):
    """ API endpoint for VERIFIED VENDORS to view bookings for their services. """
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated, IsVerifiedVendor]

    def get_queryset(self):
        vendor_profile = self.request.user.vendor_profile
        return Booking.objects.filter(service__vendor=vendor_profile)

# --- Public Views ---

class ServiceListView(generics.ListAPIView):
    """ Public, read-only endpoint for listing all available services. """
    queryset = Service.objects.filter(is_available=True, vendor__is_verified=True).select_related('vendor')
    serializer_class = ServiceSerializer
    authentication_classes = [] 
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['destination']

class ServiceDetailView(generics.RetrieveAPIView):
    """ Public, read-only endpoint for viewing the details of a single service. """
    queryset = Service.objects.filter(is_available=True, vendor__is_verified=True).select_related('vendor')
    serializer_class = ServiceSerializer
    authentication_classes = []
    permission_classes = [permissions.AllowAny]


class VendorStatsView(APIView):
    """
    API endpoint to provide key statistics for the logged-in vendor's dashboard.
    """
    permission_classes = [permissions.IsAuthenticated, IsVerifiedVendor] # Only for verified vendors

    def get(self, request, *args, **kwargs):
        vendor = request.user.vendor_profile
        
        # 1. Get Current Active Services
        active_services_count = Service.objects.filter(vendor=vendor, is_available=True).count()
        
        # 2. Get Total Bookings
        total_bookings_count = Booking.objects.filter(service__vendor=vendor).count()
        
        # 3. Get Monthly Revenue (for the last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        # We filter bookings that are 'CONFIRMED' or 'COMPLETED'
        monthly_revenue_data = Booking.objects.filter(
            service__vendor=vendor,
            booking_date__gte=thirty_days_ago,
            status__in=[Booking.BookingStatus.CONFIRMED, Booking.BookingStatus.COMPLETED]
        ).aggregate(total=Sum('total_price'))
        
        # The result from aggregate is a dictionary {'total': value}
        monthly_revenue = monthly_revenue_data['total'] or 0.00
        
        # Prepare the data to send back to the frontend
        stats_data = {
            'activeServices': active_services_count,
            'totalBookings': total_bookings_count,
            'monthlyRevenue': f"{monthly_revenue:.2f}", # Format to 2 decimal places
        }
        
        return Response(stats_data, status=status.HTTP_200_OK)
    

class InitiatePaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, booking_id, *args, **kwargs):
        try:
            booking = Booking.objects.get(pk=booking_id, user=request.user)
        except Booking.DoesNotExist:
            return Response({"error": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)

        # --- THIS IS THE DEFINITIVE DNS FIX ---
        # The direct IP address of the EasyPaisa sandbox server.
        EASYPAISA_SANDBOX_IP = "34.149.213.210"
        EASYPAISA_HOSTNAME = "sandbox.easypaisa.com.pk"
        
        # The final URL using the direct IP address.
        initiate_url = f"https://{EASYPAISA_SANDBOX_IP}/checkout/v1/initiate"
        
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            # We MUST specify the original hostname in the 'Host' header.
            'Host': EASYPAISA_HOSTNAME,
        }

        payload = {
            "storeId": settings.EASYPAISA_STORE_ID,
            "orderId": str(booking.id),
            "transactionAmount": f"{booking.total_price:.2f}",
            "transactionType": "Initial", # Use "Initial" as per docs
            "emailAddress": request.user.email or "",
            "postBackURL": f"https://YOUR_CURRENT_NGROK_URL/api/vendors/easypaisa-ipn/", # Ensure this is your live ngrok URL
        }

        try:
            print("--- Sending Checkout Request directly to IP ---")
            # We add `verify=False` to bypass SSL certificate issues when using a direct IP.
            response = requests.post(initiate_url, data=json.dumps(payload), headers=headers, verify=False)
            response.raise_for_status()
            
            response_data = response.json()
            print("--- Received Response from EasyPaisa ---", response_data)

            # The confirmation URL now also needs the direct IP to work in the WebView
            payment_token = response_data.get("paymentToken")
            if payment_token:
                payment_url = f"https://{EASYPAISA_HOSTNAME}/checkout/v1/confirm?paymentToken={payment_token}"
                return Response({"payment_url": payment_url})
            else:
                raise Exception(response_data.get("responseDesc", "Failed to get payment token from EasyPaisa"))

        except requests.exceptions.RequestException as e:
            print(f"--- EasyPaisa Gateway Connection Error: {e} ---")
            return Response({"error": f"Gateway connection error: {e}"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as e:
            print(f"--- EasyPaisa Logic Error: {e} ---")
            return Response({"error": f"Gateway logic error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class EasyPaisaIPNView(APIView):
    """
    Instant Payment Notification (IPN) webhook handler for EasyPaisa.
    This is called by EasyPaisa's servers to confirm a payment.
    """
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    @csrf_exempt
    def post(self, request, *args, **kwargs):
        ipn_data = request.data
        print("--- EasyPaisa IPN Received ---", ipn_data)
        
        order_id = ipn_data.get('orderId')
        transaction_id = ipn_data.get('transactionId')
        transaction_status = ipn_data.get('transactionStatus') # Note the camelCase from EasyPaisa

        if not order_id or not transaction_status:
            return Response({"error": "Invalid IPN data."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            booking = Booking.objects.get(pk=order_id, status=Booking.BookingStatus.PENDING)
            
            if transaction_status.upper() == "PAID":
                booking.status = Booking.BookingStatus.CONFIRMED
                booking.paid_at = timezone.now()
                booking.payment_gateway_txn_id = transaction_id
                # ... (commission calculation logic is the same) ...
                booking.save()
                print(f"--- Booking ID {order_id} CONFIRMED via IPN ---")
            else:
                print(f"--- Payment for Booking ID {order_id} FAILED or was CANCELLED via IPN ---")
            
            return Response(status=status.HTTP_200_OK)

        except Booking.DoesNotExist:
            return Response({"error": "Booking not found or already processed."}, status=status.HTTP_404_NOT_FOUND)
