# In messaging/views.py (FINAL, CORRECTED VERSION)
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from vendors.models import Service 
from .models import Conversation, Message
from .serializers import ConversationSerializer, ConversationDetailSerializer, MessageSerializer

class ConversationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for handling conversations and messages.
    Now correctly manages one conversation thread per vendor.
    """
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ConversationDetailSerializer
        return ConversationSerializer

    def get_queryset(self):
        user = self.request.user
        # The select_related and prefetch_related are performance optimizations
        return Conversation.objects.filter(Q(tourist=user) | Q(vendor=user)).select_related('tourist__profile', 'vendor__profile').prefetch_related('messages')

    # THIS IS THE NEW, CORRECT `create` METHOD
    def create(self, request, *args, **kwargs):
        service_id = request.data.get('service_id')
        initial_message = request.data.get('body')

        if not service_id or not initial_message:
            return Response({"error": "A service_id and an initial message body are required."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            service = Service.objects.get(pk=service_id)
            vendor_user = service.vendor.user
        except Service.DoesNotExist:
            return Response({"error": "Service not found."}, status=status.HTTP_404_NOT_FOUND)

        if vendor_user == request.user:
            return Response({"error": "You cannot start a conversation with yourself."}, status=status.HTTP_400_BAD_REQUEST)

        # THIS IS THE FIX: Find or create the single conversation thread
        # based only on the tourist and vendor, ignoring the specific service.
        conversation, created = Conversation.objects.get_or_create(
            tourist=request.user,
            vendor=vendor_user
        )
        
        # Create the initial message for this conversation
        # We also add a reference to the service in the message body for context
        full_initial_message = f"Inquiry about '{service.name}': {initial_message}"
        Message.objects.create(
            sender=request.user, 
            conversation=conversation,
            body=full_initial_message
        )
        
        # Return the full conversation detail so the app can navigate to it
        response_serializer = ConversationDetailSerializer(conversation, context={'request': request})
        response_status = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        
        return Response(response_serializer.data, status=response_status)

    @action(detail=True, methods=['post'], url_path='messages')
    def send_message(self, request, pk=None):
        """
        Custom action to send a message to an existing conversation.
        """
        conversation = self.get_object()
        
        if request.user != conversation.tourist and request.user != conversation.vendor:
            return Response(
                {'error': 'You do not have permission to post in this conversation.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # We pass the request context to the serializer so it knows who the user is
        serializer = MessageSerializer(data=request.data, context={'request': request})
        if serializer.is_valid(raise_exception=True):
            serializer.save(sender=request.user, conversation=conversation)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)