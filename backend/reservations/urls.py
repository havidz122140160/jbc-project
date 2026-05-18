from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReservationViewSet, ReservationListCreateView, reservation_queue, available_times, owner_analytics, BreakSlotViewSet

router = DefaultRouter()
router.register(r'breaks', BreakSlotViewSet, basename='break-slots')
router.register(r'', ReservationViewSet)

urlpatterns = [
    path('queue/', reservation_queue, name='reservation-queue'),
    path('available-times/', available_times, name='available-times'),
    path('owner-analytics/', owner_analytics, name='owner-analytics'),
    path('list-create/', ReservationListCreateView.as_view(), name='reservation-list-create'), # Legacy support if needed
    path('', include(router.urls)),
]