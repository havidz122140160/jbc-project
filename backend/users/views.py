from rest_framework import generics, viewsets, permissions
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model

# Import serializer yang kita bahas sebelumnya
from .serializers import MyTokenObtainPairSerializer, UserSerializer, KapsterManagementSerializer, UserProfileSerializer

User = get_user_model()

class IsOwner(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'owner'

class MyTokenObtainPairView(TokenObtainPairView):
    """
    View untuk Login. 
    Menggunakan serializer custom agar mengembalikan access, refresh, role, dan username.
    """
    serializer_class = MyTokenObtainPairSerializer


class KapsterListView(generics.ListAPIView):
    """
    View untuk mengambil daftar Kapster.
    Digunakan di halaman reservasi pelanggan.
    """
    serializer_class = UserSerializer
    permission_classes = [AllowAny]  # Pelanggan harus bisa akses tanpa login

    def get_queryset(self):
        # Filter hanya user yang memiliki role 'kapster'
        return User.objects.filter(role='kapster', is_active_staf=True)

class KapsterViewSet(viewsets.ModelViewSet):
    """
    ViewSet untuk Owner mengelola Kapster.
    """
    serializer_class = KapsterManagementSerializer
    permission_classes = [IsOwner]

    def get_queryset(self):
        return User.objects.filter(role='kapster')

class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    View untuk user mengedit profilnya sendiri.
    """
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user