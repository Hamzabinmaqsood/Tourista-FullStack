# In reviews/urls.py
from django.urls import path
from .views import ReviewListView, ReviewCreateView, ServiceReviewCreateView,ServiceReviewListView

urlpatterns = [
    # The URL for GETTING reviews
    path('destinations/<int:destination_id>/reviews/', ReviewListView.as_view(), name='list-reviews'),
    # The URL for CREATING a review
    path('destinations/<int:destination_id>/reviews/create/', ReviewCreateView.as_view(), name='create-review'),
    path('services/<int:service_id>/reviews/create/', ServiceReviewCreateView.as_view(), name='create-service-review'),
    path('services/<int:service_id>/reviews/', ServiceReviewListView.as_view(), name='list-service-reviews'),
]