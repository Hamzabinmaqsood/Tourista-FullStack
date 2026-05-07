# In moderation/views.py
from rest_framework import generics, permissions
from .models import Report
from .serializers import ReportSerializer
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response 

class ReportUserView(generics.CreateAPIView):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Automatically set the person filing the report to the current user.
        serializer.save(reporter=self.request.user)


class ToggleBlockUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user_to_block_id = request.data.get('user_id')
        if not user_to_block_id:
            return Response({"error": "User ID is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user_to_block = User.objects.get(pk=user_to_block_id)
            profile = request.user.profile
            
            if user_to_block in profile.blocked_users.all():
                profile.blocked_users.remove(user_to_block)
                status_message = 'unblocked'
            else:
                profile.blocked_users.add(user_to_block)
                status_message = 'blocked'

            return Response({"status": f"User {status_message} successfully."}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
