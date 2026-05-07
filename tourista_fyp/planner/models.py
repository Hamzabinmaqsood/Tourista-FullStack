from django.db import models
from django.contrib.auth.models import User
from django.db.models import Avg

class Destination(models.Model):
    """
    Represents a potential travel destination or point of interest.
    """
    class DestinationType(models.TextChoices):
        LANDMARK = 'LANDMARK', 'Landmark'
        MUSEUM = 'MUSEUM', 'Museum'
        RESTAURANT = 'RESTAURANT', 'Restaurant'
        PARK = 'PARK', 'Park'
        HIKING_TRAIL = 'HIKING_TRAIL', 'Hiking Trail'
        BEACH = 'BEACH', 'Beach'

    name = models.CharField(max_length=255)
    description = models.TextField()
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    # This field is crucial for our dummy AI
    destination_type = models.CharField(max_length=20, choices=DestinationType.choices)
    # A simple cost metric for the AI to use
    average_cost = models.DecimalField(max_digits=10, decimal_places=2, default=50.00)
    image = models.ImageField(upload_to='destination_images/', null=True, blank=True)
    latitude = models.FloatField(default=0.0)
    longitude = models.FloatField(default=0.0)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    review_count = models.PositiveIntegerField(default=0)
    image_url = models.URLField(max_length=500, blank=True, null=True)

    @property
    def average_rating(self):
        # Calculate the average rating from all its reviews
        # The '.reviews' comes from the related_name in the Review model
        return self.reviews.aggregate(Avg('rating'))['rating__avg'] or 0.00

    @property
    def total_reviews(self):
        # Count the total number of reviews
        return self.reviews.count()

    def __str__(self):
        return f"{self.name}, {self.city}"

class Itinerary(models.Model):
    """
    Represents a user's trip plan.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='itineraries')
    name = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    # An itinerary can have many destinations in it
    # destinations = models.ManyToManyField(Destination, related_name='itineraries', blank=True)

    def __str__(self):
        return f"Itinerary: {self.name} for {self.user.username}"
    
class ItineraryItem(models.Model):
    """
    Represents a destination within a specific day of an itinerary.
    This is our "through" model.
    """
    itinerary = models.ForeignKey(Itinerary, on_delete=models.CASCADE, related_name='items')
    destination = models.ForeignKey(Destination, on_delete=models.CASCADE, related_name='itinerary_items')
    day_number = models.PositiveIntegerField(help_text="Day number in the trip, e.g., 1, 2, 3.")
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)

    class Meta:
        # Ensures that destinations are ordered by day and time within an itinerary
        ordering = ['day_number', 'start_time']

    def __str__(self):
        return f"Day {self.day_number}: {self.destination.name} in '{self.itinerary.name}'"

class CulturalEvent(models.Model):
    """
    Represents a cultural event, festival, or exhibition.
    """
    class EventCategory(models.TextChoices):
        FESTIVAL = 'FESTIVAL', 'Festival'
        CONCERT = 'CONCERT', 'Concert'
        EXHIBITION = 'EXHIBITION', 'Exhibition'
        SPORT = 'SPORT', 'Sport'
        FOOD = 'FOOD', 'Food'

    name = models.CharField(max_length=255)
    description = models.TextField()
    city = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField()
    category = models.CharField(max_length=20, choices=EventCategory.choices)
    
    def __str__(self):
        return f"{self.name} in {self.city}"