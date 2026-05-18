from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('owner', 'Owner'),
        ('kapster', 'Kapster'),
        ('pelanggan', 'Pelanggan'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='pelanggan')
    no_wa = models.CharField(max_length=15, blank=True, null=True)
    is_active_staf = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.username} ({self.role})"