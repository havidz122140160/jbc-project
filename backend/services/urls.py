from django.urls import path
from .views import ServiceListView, ServiceViewSet

urlpatterns = [
    path('', ServiceListView.as_view(), name='service-list'),
    path('management/', ServiceViewSet.as_view({'get': 'list', 'post': 'create'}), name='service-management-list'),
    path('management/<int:pk>/', ServiceViewSet.as_view({
        'get': 'retrieve', 
        'put': 'update', 
        'patch': 'partial_update', 
        'delete': 'destroy'
    }), name='service-management-detail'),
]