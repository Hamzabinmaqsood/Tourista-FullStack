# In feedback/models.py

from django.db import models
from django.contrib.auth.models import User

class Feedback(models.Model):
    """
    Model to store user feedback, suggestions, or bug reports.
    """
    class FeedbackStatus(models.TextChoices):
        NEW = 'NEW', 'New'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        RESOLVED = 'RESOLVED', 'Resolved'
        CLOSED = 'CLOSED', 'Closed'

    # The user who submitted the feedback. Can be null if you want to allow anonymous feedback.
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='feedback')
    
    subject = models.CharField(max_length=255)
    message = models.TextField()
    
    # A simple rating can provide quick insights
    rating = models.PositiveIntegerField(null=True, blank=True, help_text="Optional rating from 1 to 5")
    
    status = models.CharField(
        max_length=20,
        choices=FeedbackStatus.choices,
        default=FeedbackStatus.NEW
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        # Use a more descriptive name in the admin panel
        verbose_name_plural = "User Feedback"

    def __str__(self):
        return f"Feedback: '{self.subject}' from {self.user.username if self.user else 'Anonymous'}"