# booking_api/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'halls', views.HallViewSet)
router.register(r'users', views.UserViewSet)
router.register(r'bookings', views.BookingViewSet)

# The API URLs are now determined automatically by the router.
urlpatterns = [
    
    path('bookings/queue/', views.ApprovalQueueView.as_view(), name='booking-queue'),
    path('bookings/history/', views.BookingHistoryView.as_view(), name='booking-history'),
    path('', include(router.urls)),
]

