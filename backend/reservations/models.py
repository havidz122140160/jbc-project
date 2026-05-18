
import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone
from services.models import Service

# Create your models here.

class Reservation(models.Model):
    STATUS_CHOICES = (
        ('menunggu', 'Menunggu'),
        ('proses', 'Diproses'),
        ('selesai', 'Selesai'),
        ('tertunda', 'Tertunda (Delayed)'),
        ('batal', 'Batal'),
    )

    # Identitas Reservasi
    booking_id = models.CharField(max_length=10, unique=True, editable=False)
    customer_name = models.CharField(max_length=100)
    customer_phone = models.CharField(max_length=15)
    
    # Relasi ke Kapster (CustomUser)
    kapster = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='reservations',
        limit_choices_to={'role': 'kapster'}
    )
    
    # Detail Layanan
    service = models.ForeignKey(
        Service,
        on_delete=models.PROTECT,
        related_name='reservations',
        null=True # Allow null for transition if needed, but ideally required
    )
    service_name = models.CharField(max_length=100, blank=True, help_text="Snapshot service name")
    duration_minutes = models.PositiveIntegerField(default=30)
    
    # Logika Waktu & Status
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='menunggu')
    scheduled_time = models.DateTimeField(help_text="Jadwal asli saat booking")
    estimated_start = models.DateTimeField(help_text="Waktu mulai yang dinamis (Dynamic EST)")
    
    # Audit Log Operasional
    actual_start = models.DateTimeField(null=True, blank=True)
    actual_end = models.DateTimeField(null=True, blank=True)
    is_walk_in = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Generate Booking ID unik jika belum ada
        if not self.booking_id:
            self.booking_id = f"JV-{uuid.uuid4().hex[:5].upper()}"
        
        # Set initial estimated_start sama dengan scheduled_time saat pertama dibuat
        if not self.estimated_start:
            self.estimated_start = self.scheduled_time
            
        # Snapshot service details if service is provided
        if self.service:
            if not self.service_name:
                self.service_name = self.service.name
            if self.duration_minutes == 30: # Default value
                self.duration_minutes = self.service.duration
                
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.booking_id} - {self.customer_name} ({self.status})"

    class Meta:
        ordering = ['estimated_start']
        constraints = [
            models.UniqueConstraint(
                fields=['kapster', 'scheduled_time'], 
                name='unique_kapster_reservation_time'
            )
        ]

class BreakSlot(models.Model):
    kapster = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='breaks'
    )
    name = models.CharField(max_length=50, default="Istirahat/Sholat")
    start_time = models.TimeField() # Jam mulai (misal 12:00)
    end_time = models.TimeField()   # Jam selesai (misal 12:30)
    day_of_week = models.IntegerField(
        choices=[(0, 'Senin'), (1, 'Selasa'), (2, 'Rabu'), (3, 'Kamis'), (4, 'Jumat'), (5, 'Sabtu'), (6, 'Minggu')],
        help_text="Hari apa istirahat ini berlaku"
    )

    def __str__(self):
        return f"{self.name} - {self.kapster.username} ({self.get_day_of_week_display()})"