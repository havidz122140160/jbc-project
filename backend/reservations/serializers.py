from rest_framework import serializers
from .models import Reservation, BreakSlot
from django.utils import timezone

class BreakSlotSerializer(serializers.ModelSerializer):
    kapster_name = serializers.ReadOnlyField(source='kapster.username')
    day_display = serializers.CharField(source='get_day_of_week_display', read_only=True)

    class Meta:
        model = BreakSlot
        fields = '__all__'

class ReservationSerializer(serializers.ModelSerializer):
    # Field tambahan -> tampilan estimasi waktu
    wait_time_display = serializers.SerializerMethodField()
    kapster_name = serializers.ReadOnlyField(source='kapster.username')
    service_detail = serializers.ReadOnlyField(source='service.name')

    class Meta:
        model = Reservation
        fields = '__all__'
        read_only_fields = ['booking_id', 'created_at', 'actual_start', 'actual_end', 'estimated_start', 'service_name', 'duration_minutes']

    def validate(self, data):
        # Additional validation can be added here
        return data

    def get_wait_time_display(self, obj):
        if obj.status == 'proses':
            return "Sedang diproses"
        
        if not obj.estimated_start:
            return "Segera"
        
        now = timezone.now()
        if obj.estimated_start > now:
            diff = obj.estimated_start - now
            minutes = int(diff.total_seconds() // 60)
            return f"{minutes} menit lagi"
        return "Segera"