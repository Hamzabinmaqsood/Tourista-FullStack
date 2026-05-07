# In messaging/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Conversation, Message
from vendors.models import Service, Vendor
from users.serializers import UserSerializer
import re # Import the regular expression library for security

# --- NEW: Simple, safe serializers for nesting ---
class SimpleUserSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(source='profile.avatar', read_only=True)
    class Meta:
        model = User
        fields = ['id', 'username', 'avatar']

class SimpleServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ['id', 'name', 'service_type']


# --- UPDATED: MessageSerializer with security validation ---
class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.IntegerField(source='sender.id', read_only=True)
    attachment = serializers.ImageField(use_url=True, required=False)

    class Meta:
        model = Message
        fields = ['id', 'sender', 'body', 'timestamp', 'attachment']
        read_only_fields = ['id', 'sender', 'timestamp', 'attachment']

    def validate_body(self, value):
        """
        THIS IS THE SECURITY FEATURE.
        Scans message content for phone numbers and email addresses.
        """
        # Regex to detect common phone number patterns (Pakistani and international)
        phone_pattern = r'(\+?\d{1,4}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?[\d\s.-]{7,10}'
        # Regex for email addresses
        email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'

        if re.search(phone_pattern, value) or re.search(email_pattern, value):
            # Instead of blocking, we will replace the sensitive info.
            # This is better UX as the user's message still sends.
            print(f"--- SECURITY ALERT: Contact info detected in message. Original: '{value}' ---")
            censored_value = re.sub(phone_pattern, "[phone number hidden]", value)
            censored_value = re.sub(email_pattern, "[email hidden]", censored_value)
            return censored_value

        return value


# --- Your existing ConversationSerializer (for the list view) ---
class ConversationSerializer(serializers.ModelSerializer):
    # THIS IS THE FIX: We now nest the full UserSerializer for both users.
    tourist = UserSerializer(read_only=True)
    vendor = UserSerializer(read_only=True)
    service_name = serializers.CharField(source='service.name', read_only=True)
    last_message = serializers.SerializerMethodField()
    is_read = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [ 'id', 'service_name', 'tourist', 'vendor', 'last_message', 'updated_at','is_read' ]

    def get_last_message(self, obj):
        last_msg = obj.messages.order_by('-timestamp').first()
        return last_msg.body if last_msg else None
    
    def get_is_read(self, obj):
        # This logic determines if the conversation is "unread" for the person requesting it.
        requesting_user = self.context['request'].user
        last_msg = obj.messages.order_by('-timestamp').first()
        
        if not last_msg:
            return True # No messages means it's "read"
        
        # It's unread if the last message was NOT sent by the current user
        # AND its read flag is false. (We will add the message's read flag next).
        return last_msg.sender == requesting_user or last_msg.is_read


class ConversationDetailSerializer(serializers.ModelSerializer):
    tourist = UserSerializer(read_only=True)
    vendor = SimpleUserSerializer(read_only=True)
    service = SimpleServiceSerializer(read_only=True)
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = Conversation
        fields = ['id', 'tourist', 'vendor', 'service', 'messages']