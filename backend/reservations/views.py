from rest_framework import viewsets, status, decorators, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Reservation, BreakSlot
from .serializers import ReservationSerializer, BreakSlotSerializer
from django.db.models import Sum, Count, Avg, Q
from django.utils import timezone
from datetime import datetime, timedelta, time

class IsOwner(IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role == 'owner'

@api_view(['GET'])
@permission_classes([AllowAny])
def available_times(request):
    kapster_id = request.query_params.get('kapster')
    date_str = request.query_params.get('date') # Format: YYYY-MM-DD (Local Time)
    
    if not kapster_id or not date_str:
        return Response({'error': 'Parameter kapster dan date diperlukan'}, status=status.HTTP_400_BAD_REQUEST)

    # 1. Tentukan Range Waktu Lokal (00:00 - 23:59 pada hari tersebut)
    try:
        local_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return Response({'error': 'Format tanggal salah. Gunakan YYYY-MM-DD'}, status=status.HTTP_400_BAD_REQUEST)
        
    start_of_day = timezone.make_aware(datetime.combine(local_date, time.min))
    end_of_day = timezone.make_aware(datetime.combine(local_date, time.max))

    # 2. Ambil jam yang sudah dibooking + Block System di range waktu tersebut
    booked_times = Reservation.objects.filter(
        kapster_id=kapster_id, 
        scheduled_time__range=(start_of_day, end_of_day)
    ).filter(
        Q(status__in=['menunggu', 'proses', 'selesai', 'tertunda']) | 
        Q(customer_name="[BLOCK] SYSTEM")
    ).values_list('scheduled_time', flat=True)
    
    # Format jam biar gampang dibaca (HH:MM) - HARUS dikonversi ke timezone lokal JKT
    taken_slots = [t.astimezone(timezone.get_current_timezone()).strftime('%H:%M') for t in booked_times]
    
    # 3. Ambil jam istirahat Kapster
    day_of_week = local_date.weekday()
    breaks = BreakSlot.objects.filter(kapster_id=kapster_id, day_of_week=day_of_week)
    
    # List jam operasional JBC
    all_slots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "19:00", "20:00"]
    
    # FILTER DINAMIS: Kalau booking buat HARI INI, jangan tampilin jam yang udah LEWAT
    now_local = timezone.now().astimezone(timezone.get_current_timezone())
    today_str = now_local.strftime('%Y-%m-%d')
    current_time_str = now_local.strftime('%H:%M')

    available = []
    for s in all_slots:
        # 1. Cek apakah sudah di-book
        if s in taken_slots:
            continue
            
        # 2. Cek apakah masuk jam istirahat
        is_break = False
        for b in breaks:
            b_start_str = b.start_time.strftime('%H:%M')
            b_end_str = b.end_time.strftime('%H:%M')
            # Jika slot mulai di dalam jam istirahat
            if b_start_str <= s < b_end_str:
                is_break = True
                break
        if is_break:
            continue

        # 3. Filter jam yang sudah lewat (Hanya untuk hari ini)
        if date_str == today_str:
            if s > current_time_str:
                available.append(s)
        else:
            # Besok/Lusa semua slot aman yang tidak kena break/booking
            available.append(s)
    
    return Response(available)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def owner_analytics(request):
    if request.user.role != 'owner':
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
    period = request.query_params.get('period', 'all')
    now = timezone.now().astimezone(timezone.get_current_timezone())
    
    base_qs = Reservation.objects.all()
    
    if period == 'day':
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        base_qs = base_qs.filter(scheduled_time__gte=start_date)
    elif period == 'week':
        # Start of current week (Monday)
        start_date = (now - timedelta(days=now.weekday())).replace(hour=0, minute=0, second=0, microsecond=0)
        base_qs = base_qs.filter(scheduled_time__gte=start_date)
    elif period == 'month':
        # Start of current month
        start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        base_qs = base_qs.filter(scheduled_time__gte=start_date)
    elif period == 'year':
        # Start of current year
        start_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        base_qs = base_qs.filter(scheduled_time__gte=start_date)

    # Agregasi Data
    total_income = base_qs.filter(status='selesai').aggregate(Sum('service__price'))['service__price__sum'] or 0
    total_reservations = base_qs.exclude(customer_name="[BLOCK] SYSTEM").count()
    
    from users.models import CustomUser
    active_kapsters_count = CustomUser.objects.filter(role='kapster', is_active_staf=True).count()
    
    # Income per Kapster
    kapsters = CustomUser.objects.filter(role='kapster')
    income_per_kapster = []
    for k in kapsters:
        # Performance metrics
        kapster_qs = base_qs.filter(kapster=k)
        reservations_count = kapster_qs.filter(status='selesai').count()
        income = kapster_qs.filter(status='selesai').aggregate(Sum('service__price'))['service__price__sum'] or 0
        
        # Dynamic Target for Performance Percentage
        target = 10 # Default for day
        if period == 'week': target = 50
        elif period == 'month': target = 200
        elif period == 'year': target = 2000
        elif period == 'all': target = 5000

        performance = min(100, (reservations_count / target) * 100) if reservations_count > 0 else 0

        income_per_kapster.append({
            'id': k.id,
            'name': k.username,
            'income': income,
            'sessions': reservations_count,
            'performance': round(performance),
            'is_active': k.is_active_staf
        })
        
    # Recent Blocks (God Mode Logs)
    recent_blocks = Reservation.objects.filter(
        customer_name='[BLOCK] SYSTEM', 
        status='batal'
    ).order_by('-created_at')[:5]
    
    blocks_data = [{
        'id': b.id,
        'kapster': b.kapster.username,
        'date': b.scheduled_time.strftime('%Y-%m-%d'),
        'time': b.scheduled_time.strftime('%H:%M'),
        'reason': b.service_name
    } for b in recent_blocks]

    return Response({
        'stats': {
            'total_income': total_income,
            'total_reservations': total_reservations,
            'active_kapsters': active_kapsters_count
        },
        'income_per_kapster': income_per_kapster,
        'recent_blocks': blocks_data
    })

class BreakSlotViewSet(viewsets.ModelViewSet):
    queryset = BreakSlot.objects.all()
    serializer_class = BreakSlotSerializer
    permission_classes = [IsOwner]

    def get_queryset(self):
        kapster_id = self.request.query_params.get('kapster')
        if kapster_id:
            return self.queryset.filter(kapster_id=kapster_id)
        return self.queryset

class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer

    def get_permissions(self):
        # Pelanggan boleh 'create' (booking) dan 'list' (liat antrean) tanpa login
        if self.action in ['create', 'list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            # Aksi check_in, mark_done, roll_queue wajib login
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        instance = serializer.save()
        self.update_all_est(instance.kapster)
        instance.refresh_from_db()

    # Action khusus untuk Kapster: CHECK-IN
    @decorators.action(detail=True, methods=['post'])
    def check_in(self, request, pk=None):
        reservation = self.get_object()
        reservation.status = 'proses'
        reservation.actual_start = timezone.now()
        reservation.save()
        
        # Trigger update EST untuk antrean di bawahnya
        self.update_all_est(reservation.kapster)
        
        return Response({'status': 'Pelanggan mulai diproses'})

    # Action khusus untuk Kapster: SELESAI
    @decorators.action(detail=True, methods=['post'])
    def mark_done(self, request, pk=None):
        reservation = self.get_object()
        reservation.status = 'selesai'
        reservation.actual_end = timezone.now()
        reservation.save()
        
        # Trigger update EST
        self.update_all_est(reservation.kapster)
        
        return Response({'status': 'Layanan selesai'})

    # Action khusus untuk Kapster: ROLLING (TUNDA)
    @decorators.action(detail=True, methods=['post'])
    def roll_queue(self, request, pk=None):
        reservation = self.get_object()
        reservation.status = 'tertunda'
        # Tambahkan logika: EST dihapus sementara atau ditaruh di paling bawah
        reservation.save()
        
        self.update_all_est(reservation.kapster)
        
        return Response({'status': 'Antrean berhasil di-roll (ditunda)'})

    # ACTION GOD MODE (OWNER ONLY)
    @decorators.action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def emergency_block(self, request):
        if request.user.role != 'owner':
            return Response({'error': 'Hanya Owner yang bisa God Mode!'}, status=403)
            
        kapster_id = request.data.get('kapster')
        date = request.data.get('date')
        time = request.data.get('time')
        reason = request.data.get('reason', 'Emergency Block by Owner')

        # Buat reservasi dummy "Batal" atau status khusus buat blokir
        from users.models import CustomUser
        kapster = CustomUser.objects.get(id=kapster_id)

        aware_scheduled_time = timezone.make_aware(datetime.strptime(f"{date} {time}", "%Y-%m-%d %H:%M"))
        
        Reservation.objects.create(
            customer_name="[BLOCK] SYSTEM",
            customer_phone="000",
            kapster=kapster,
            status='batal',
            scheduled_time=aware_scheduled_time,
            service_name=reason
        )
        
        return Response({'status': f'Slot {time} pada {date} berhasil diblokir.'})

    # ACTION EMERGENCY LEAVE (OWNER ONLY)
    @decorators.action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def kapster_emergency(self, request):
        if request.user.role != 'owner':
            return Response({'error': 'Unauthorized'}, status=403)
            
        kapster_id = request.data.get('kapster')
        date_str = request.data.get('date') # YYYY-MM-DD
        
        if not kapster_id or not date_str:
            return Response({'error': 'Kapster and Date required'}, status=400)

        # 1. Cancel all existing pending reservations for this kapster today
        affected = Reservation.objects.filter(
            kapster_id=kapster_id,
            scheduled_time__date=date_str,
            status__in=['menunggu', 'tertunda']
        ).update(status='batal', service_name="[CANCEL] KAPSTER EMERGENCY")

        # 2. Block all remaining standard slots for the rest of the day
        # (Simply prevent any new bookings by creating a block if they don't exist)
        all_slots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "19:00", "20:00"]
        from users.models import CustomUser
        kapster = CustomUser.objects.get(id=kapster_id)
        
        for s in all_slots:
            aware_time = timezone.make_aware(datetime.strptime(f"{date_str} {s}", "%Y-%m-%d %H:%M"))
            # Only block if no reservation exists for that time
            if not Reservation.objects.filter(kapster=kapster, scheduled_time=aware_time).exists():
                Reservation.objects.create(
                    customer_name="[BLOCK] SYSTEM",
                    customer_phone="000",
                    kapster=kapster,
                    status='batal',
                    scheduled_time=aware_time,
                    service_name="Kapster Emergency Leave"
                )
        
        return Response({'status': f'Emergency handled. {affected} reservations cancelled and slots blocked.'})

    def update_all_est(self, kapster):
        from datetime import datetime, timedelta
        
        current_time = timezone.now()
        
        # 1. Cari kapan Kapster ini mulai "FREE" (kosong)
        active = Reservation.objects.filter(kapster=kapster, status='proses').first()
        if active and active.actual_start:
            # Kapster free setelah pelanggan yang sekarang beres
            kapster_free_at = active.actual_start + timedelta(minutes=active.duration_minutes)
        else:
            # Kalau nggak ada yang dikerjain, kapster free dari SEKARANG
            kapster_free_at = current_time

        # 2. Ambil antrean yang belum diproses
        queue = Reservation.objects.filter(
            kapster=kapster, 
            status__in=['menunggu', 'tertunda']
        ).order_by('scheduled_time')

        # 3. Ambil jadwal istirahat hari ini
        breaks = BreakSlot.objects.filter(kapster=kapster, day_of_week=current_time.weekday())

        for res in queue:
            # Tentukan start_time: mana yang lebih lambat antara jam kapster free 
            # ATAU jam yang dia mau (scheduled_time)
            start_time = max(kapster_free_at, res.scheduled_time)

            # CEK ISTIRAHAT: Kalau start_time masuk jam istirahat, geser ke akhir istirahat
            for b in breaks:
                b_start = timezone.make_aware(datetime.combine(start_time.date(), b.start_time))
                b_end = timezone.make_aware(datetime.combine(start_time.date(), b.end_time))
                
                if b_start <= start_time < b_end:
                    start_time = b_end

            # Simpan hasil hitungan
            res.estimated_start = start_time
            res.save()

            # Update kapan kapster free buat orang berikutnya
            kapster_free_at = start_time + timedelta(minutes=res.duration_minutes)

class ReservationListCreateView(generics.ListCreateAPIView): # Pake ListCreate!
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer
    permission_classes = [AllowAny] # Supaya pelanggan bisa booking tanpa login

@api_view(['GET'])
@permission_classes([AllowAny])
def reservation_queue(request):
    # Ambil tanggal dari parameter URL atau default hari ini
    date_str = request.query_params.get('date', timezone.now().date().isoformat())
    
    # Hitung jumlah orang yang booking di tanggal tersebut (Exclude Block System & Batal)
    total = Reservation.objects.filter(
        scheduled_time__date=date_str
    ).exclude(
        customer_name="[BLOCK] SYSTEM"
    ).exclude(
        status='batal'
    ).count()
    
    # Cari siapa yang statusnya lagi 'proses' (nomor antrean sekarang)
    current = Reservation.objects.filter(scheduled_time__date=date_str, status='proses').first()
    
    return Response({
        'total': total,
        'current_number': current.id if current else "-"
    })