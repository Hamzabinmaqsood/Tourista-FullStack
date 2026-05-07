# In users/models.py

from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from planner.models import Destination 

class UserProfile(models.Model):
    """
    Extends the default User model to store travel-specific preferences.
    """
    class TravelStyle(models.TextChoices):
        ADVENTURE = 'ADVENTURE', 'Adventure'
        RELAXATION = 'RELAXATION', 'Relaxation'
        CULTURAL = 'CULTURAL', 'Cultural'
        FAMILY = 'FAMILY', 'Family'
        BUDGET = 'BUDGET', 'Budget'
        # Add any other styles you envision

    # This creates a one-to-one link with Django's built-in User model.
    # on_delete=models.CASCADE means if a User is deleted, their profile is deleted too.
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.CharField(max_length=150, blank=True, null=True)
    favorite_destinations = models.ManyToManyField(Destination, related_name='favorited_by', blank=True)
    # Fields from your project description
    travel_style = models.CharField(
        max_length=20,
        choices=TravelStyle.choices,
        default=TravelStyle.RELAXATION
    )
    budget = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="User's approximate budget per day in USD."
    )
    preferred_languages = models.CharField(
        max_length=100,
        default='English',
        help_text="Comma-separated list of preferred languages."
    )
    avatar = models.ImageField(
        upload_to='avatars/', # Images will be saved in 'media/avatars/'
        null=True,
        blank=True,
        help_text="User's profile picture."
    )

    blocked_users = models.ManyToManyField('self', symmetrical=False, blank=True, related_name='blocked_by')
    # This is a "magic method" to make the object readable in the admin panel.
    def __str__(self):
        return f"{self.user.username}'s Profile"

# These two functions ensure that a UserProfile is automatically created
# whenever a new Django User is created. This is a common pattern.
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()