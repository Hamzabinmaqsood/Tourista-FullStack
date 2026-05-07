from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .serializers import RegisterSerializer, UserSerializer
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView 
from planner.models import Destination 

class MyTokenObtainPairView(TokenObtainPairView):
    """
    Custom login view that explicitly allows any user to access it.
    This is the definitive fix for the 401 error on re-login.
    """
    permission_classes = (permissions.AllowAny,)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class UserProfileView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class LogoutView(generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": "An error occurred during logout."}, status=status.HTTP_400_BAD_REQUEST)
        

class ToggleFavoriteView(APIView):
    """
    Toggles a destination in the user's favorites list.
    Expects a POST request with {"destination_id": ID}.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        destination_id = request.data.get('destination_id')
        if not destination_id:
            return Response({"error": "Destination ID is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            destination = Destination.objects.get(pk=destination_id)
            profile = request.user.profile
            
            # The toggle logic
            if destination in profile.favorite_destinations.all():
                profile.favorite_destinations.remove(destination)
                status_message = 'removed'
            else:
                profile.favorite_destinations.add(destination)
                status_message = 'added'
            
            return Response({"status": f"Destination {status_message} to favorites."}, status=status.HTTP_200_OK)

        except Destination.DoesNotExist:
            return Response({"error": "Destination not found."}, status=status.HTTP_404_NOT_FOUND)
        
