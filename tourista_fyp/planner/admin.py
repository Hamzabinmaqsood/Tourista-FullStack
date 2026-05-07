from django.contrib import admin
from .models import Destination, Itinerary, ItineraryItem, CulturalEvent 


admin.site.register(Destination)
admin.site.register(Itinerary)
admin.site.register(ItineraryItem)
admin.site.register(CulturalEvent)