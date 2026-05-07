# In core/urls.py

from django.contrib import admin
from django.urls import path, include  
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/planner/', include('planner.urls')),
    path('api/utils/', include('utils.urls')),
    path('api/vendors/', include('vendors.urls')),
    path('api/admin/', include('administration.urls')),
    path('api/messaging/', include('messaging.urls')),
    path('api/feedback/', include('feedback.urls')),

    # DOCUMENTATION ROUTES
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    # Optional UI:
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    path('api/reviews/', include('reviews.urls')),
    path('api/moderation/', include('moderation.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)