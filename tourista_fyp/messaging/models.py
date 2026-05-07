# In messaging/models.py

from django.db import models
from django.contrib.auth.models import User
from vendors.models import Service

class Conversation(models.Model):
    """
    Represents a single, unique conversation thread between a tourist and a vendor.
    """
    # The user who is acting as the tourist in this conversation.
    tourist = models.ForeignKey(User, on_delete=models.CASCADE, related_name='initiated_conversations')
    
    # The user who is acting as the vendor in this conversation.
    vendor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_conversations')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # THIS IS THE NEW FIELD
    is_read_by_user1 = models.BooleanField(default=True)
    is_read_by_user2 = models.BooleanField(default=True)

    class Meta:
        # THIS IS THE CRITICAL FIX:
        # Ensures that only one conversation can exist between a specific tourist and a specific vendor.
        unique_together = ('tourist', 'vendor')
        ordering = ['-updated_at']

    def __str__(self):
        return f"Conversation between {self.tourist.username} and {self.vendor.username}"


class Message(models.Model):
    """
    Represents a single message within a conversation.
    """
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    # The user who sent this message (can be tourist or vendor)
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    # The actual message content
    body = models.TextField(blank=True, null=True)
    attachment = models.ImageField(upload_to='chat_attachments/', blank=True, null=True)
    
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"Message from {self.sender.username} at {self.timestamp.strftime('%Y-%m-%d %H:%M')}"