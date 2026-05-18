from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MyTokenObtainPairView, KapsterListView, KapsterViewSet, UserProfileView
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register(r'management', KapsterViewSet, basename='kapster-management')

urlpatterns = [
    # Endpoint Login
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Endpoint Profil
    path('users/profile/', UserProfileView.as_view(), name='user-profile'),
    
    # Endpoint Daftar Kapster untuk Reservasi
    path('kapsters/', KapsterListView.as_view(), name='kapster-list'),

    # ViewSet Management
    path('', include(router.urls)),
]