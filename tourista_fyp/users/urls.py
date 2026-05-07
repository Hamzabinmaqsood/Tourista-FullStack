from django.urls import path
from .views import RegisterView, UserProfileView, LogoutView, MyTokenObtainPairView,ToggleFavoriteView 
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # THIS IS THE FIX: Use our new, corrected view for the login endpoint.
    path('login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('logout/', LogoutView.as_view(), name='auth_logout'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('favorites/toggle/', ToggleFavoriteView.as_view(), name='toggle-favorite'),
]