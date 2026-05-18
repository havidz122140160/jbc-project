from django.contrib import admin
from .models import Reservation, BreakSlot

@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ('booking_id', 'customer_name', 'kapster', 'status', 'estimated_start')
    list_filter = ('status', 'kapster')
    search_fields = ('booking_id', 'customer_name')

@admin.register(BreakSlot)
class BreakSlotAdmin(admin.ModelAdmin):
    list_display = ('kapster', 'name', 'day_of_week', 'start_time', 'end_time')
    list_filter = ('kapster', 'day_of_week')