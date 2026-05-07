# In vendors/permissions.py

from rest_framework import permissions
from .models import Vendor

class IsVerifiedVendor(permissions.BasePermission):
    """
    Custom permission to only allow access to users who are verified vendors.
    """
    message = "You must be a verified vendor to perform this action."

    def has_permission(self, request, view):
        # First, check if the user is authenticated at all.
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Check if the user has a related vendor profile and if it's verified.
        try:
            # request.user.vendor_profile is the "reverse" relationship from the User model
            # to the Vendor model, defined by the OneToOneField.
            return request.user.vendor_profile.is_verified
        except Vendor.DoesNotExist:
            # If the user has no vendor profile, they are not a vendor.
            return False