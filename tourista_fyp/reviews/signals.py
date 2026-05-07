# In reviews/signals.py
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import Avg, Count
from .models import Review

@receiver([post_save, post_delete], sender=Review)
def update_destination_ratings(sender, instance, **kwargs):
    """
    Automatically updates the average rating and review count on a Destination
    whenever a Review for it is saved or deleted.
    """
    destination = instance.destination
    
    # Calculate the new average rating and count
    aggregates = destination.reviews.aggregate(
        average_rating=Avg('rating'),
        review_count=Count('id')
    )

    destination.rating = aggregates.get('average_rating') or 0.00
    destination.review_count = aggregates.get('review_count') or 0
    destination.save()
    
    print(f"Updated ratings for {destination.name}: {destination.rating} ({destination.review_count} reviews)")