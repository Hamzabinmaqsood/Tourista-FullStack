from django.shortcuts import render

# Create your views here.
# In administration/views.py
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from vendors.models import Vendor
from vendors.serializers import VendorSerializer
from .serializers import FeedbackAdminSerializer
from feedback.models import Feedback

class VendorAdminViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for admins to view and manage vendor applications.
    - list: View all vendors.
    - retrieve: View a specific vendor's details.
    - approve: Custom action to approve a vendor.
    """
    queryset = Vendor.objects.all().order_by('is_verified', '-created_at')
    serializer_class = VendorSerializer
    # This is the key: Only staff/superusers can access this.
    permission_classes = [permissions.IsAdminUser]

    @action(detail=True, methods=['post'], url_path='approve')
    def approve(self, request, pk=None):
        """
        Custom action to approve a vendor application.
        Accessible at: POST /api/admin/vendors/{id}/approve/
        """
        try:
            vendor = self.get_object()
            if vendor.is_verified:
                return Response({'status': 'Vendor is already verified'}, status=status.HTTP_400_BAD_REQUEST)
            
            vendor.is_verified = True
            vendor.save()
            return Response({'status': 'Vendor approved successfully'}, status=status.HTTP_200_OK)
        except Vendor.DoesNotExist:
            return Response({'error': 'Vendor not found'}, status=status.HTTP_404_NOT_FOUND)
        

class FeedbackAdminViewSet(viewsets.ModelViewSet):
    """
    ViewSet for admins to view and update the status of user feedback.
    """
    queryset = Feedback.objects.all().order_by('status', '-created_at')
    serializer_class = FeedbackAdminSerializer
    permission_classes = [permissions.IsAdminUser]
    # Admins can list, retrieve, and update (for changing status), but not create/delete feedback.
    http_method_names = ['get', 'put', 'patch', 'head', 'options']
