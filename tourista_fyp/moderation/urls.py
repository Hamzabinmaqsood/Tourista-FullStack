# In moderation/urls.py
from django.urls import path
from .views import ReportUserView,ToggleBlockUserView 

urlpatterns = [
    path('report/', ReportUserView.as_view(), name='report-user'),
    path('block/', ToggleBlockUserView.as_view(), name='toggle-block-user'),
]