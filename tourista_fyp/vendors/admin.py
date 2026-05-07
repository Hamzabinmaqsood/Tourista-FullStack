# In vendors/admin.py
from django.contrib import admin
from .models import Vendor, Service, Booking

# This class customizes how the Vendor list is displayed in the admin panel
@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ('business_name', 'user_username', 'contact_phone', 'is_verified', 'created_at')
    list_filter = ('is_verified',)
    search_fields = ('business_name', 'user__username')
    # This allows you to directly edit the 'is_verified' field from the list view
    list_editable = ('is_verified',)

    def user_username(self, obj):
        return obj.user.username
    user_username.short_description = 'User Account'


# This class customizes how the Service list is displayed
@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('name', 'vendor', 'service_type', 'price', 'city', 'is_available')
    list_filter = ('service_type', 'city', 'is_available')
    search_fields = ('name', 'vendor__business_name')
    list_editable = ('is_available',)


# You can also register the Booking model for viewing
@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'service', 'service_start_date', 'status')
    list_filter = ('status',)
    search_fields = ('user__username', 'service__name')