import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle2, Phone, Scissors, Calendar, Bell, ExternalLink } from 'lucide-react';
import api from '../api/axios';
import background from '../assets/bg-poly.svg';
import Header from '../components/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const BookedPage = () => {
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const activeBookingId = localStorage.getItem('active_booking_id');

  useEffect(() => {
    if (!activeBookingId) {
      navigate('/');
      return;
    }

    const fetchBookingDetails = async () => {
      try {
        const res = await api.get(`/reservations/`);
        const all = res.data.results || res.data;
        const found = all.find(b => b.booking_id === activeBookingId);
        
        if (found) {
          setBooking(found);
          // If finished, we might want to clear it eventually, but for now keep it
          if (found.status === 'selesai' || found.status === 'batal') {
            // localStorage.removeItem('active_booking_id');
          }
        } else {
          setError("Reservasi tidak ditemukan.");
        }
      } catch (err) {
        setError("Gagal memuat detail reservasi.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
    const interval = setInterval(fetchBookingDetails, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [activeBookingId, navigate]);

  // Notification Permission Request
  const requestNotificationPermission = () => {
    if ("Notification" in window) {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          alert("Notifikasi diaktifkan! Kami akan mengingatkanmu 15 menit sebelum jadwal.");
        }
      });
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F0F0F0] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="font-black italic uppercase tracking-widest text-xs">Loading Order...</p>
      </div>
    </div>
  );

  if (error || !booking) return (
    <div className="min-h-screen bg-[#F0F0F0] p-6 flex flex-col items-center justify-center text-center">
      <Card className="p-8 max-w-sm">
        <h2 className="text-2xl font-black uppercase italic mb-4">Oops!</h2>
        <p className="text-gray-500 text-sm mb-6">{error || "Data reservasi hilang."}</p>
        <Button onClick={() => navigate('/')} className="w-full">Kembali ke Beranda</Button>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F0F0F0] relative overflow-x-hidden font-sans text-black pb-20">
      <img src={background} alt="BG" className="fixed inset-0 z-0 opacity-10 w-full h-full object-cover pointer-events-none grayscale" />
      
      <div className="relative z-10 p-4 max-w-lg mx-auto pt-8">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate('/')} className="p-2.5 bg-black text-white rounded-full shadow-lg active:scale-90 transition-all">
            <ArrowLeft size={20}/>
          </button>
          <h1 className="text-2xl font-black uppercase italic tracking-tighter leading-none">Detail Pesanan</h1>
        </div>

        <Card className="p-6 relative overflow-hidden mb-6 border-2 border-black/5">
            <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-xl text-[9px] font-black uppercase italic text-white ${
                booking.status === 'menunggu' ? 'bg-blue-600' :
                booking.status === 'proses' ? 'bg-green-600 animate-pulse' :
                booking.status === 'selesai' ? 'bg-gray-400' : 'bg-red-600'
            }`}>
                {booking.status}
            </div>

            <div className="mb-6">
                <p className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-400 mb-1 italic">Booking ID</p>
                <h2 className="text-3xl font-black italic tracking-tighter text-black">{booking.booking_id}</h2>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <Calendar size={12} className="text-gray-400" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Tanggal</span>
                    </div>
                    <p className="text-sm font-black italic uppercase">{new Date(booking.scheduled_time).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <Clock size={12} className="text-gray-400" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Jam</span>
                    </div>
                    <p className="text-sm font-black italic uppercase">{booking.scheduled_time.substring(11, 16)} WIB</p>
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <Scissors size={12} className="text-gray-400" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Layanan</span>
                    </div>
                    <p className="text-sm font-black italic uppercase">{booking.service_detail || booking.service_name}</p>
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <Phone size={12} className="text-gray-400" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Kapster</span>
                    </div>
                    <p className="text-sm font-black italic uppercase">{booking.kapster_name}</p>
                </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase text-gray-400 italic">Estimasi Mulai</span>
                    <span className="text-xl font-black italic text-blue-600">
                        {booking.estimated_start?.substring(11, 16) || '--:--'}
                    </span>
                </div>
                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-tight">
                    *Waktu mulai dapat berubah tergantung pada kecepatan layanan sebelumnya. Mohon datang tepat waktu.
                </p>
            </div>
        </Card>

        {Notification.permission !== 'granted' && (
            <button 
                onClick={requestNotificationPermission}
                className="w-full p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl flex items-center gap-4 mb-6 group active:scale-95 transition-all"
            >
                <div className="p-2 bg-amber-500 text-white rounded-xl shadow-lg">
                    <Bell size={20} className="group-hover:animate-ring" />
                </div>
                <div className="text-left">
                    <p className="text-xs font-black uppercase italic leading-none mb-1">Aktifkan Notifikasi</p>
                    <p className="text-[9px] font-bold text-amber-700/60 uppercase tracking-wider">Ingatkan saya 15 menit sebelum mulai</p>
                </div>
            </button>
        )}

        <div className="space-y-3">
            <Button 
                variant="secondary" 
                className="w-full flex items-center justify-center gap-2 py-4"
                onClick={() => window.open(`https://wa.me/628123456789?text=Halo%20JBC,%20saya%20ingin%20bertanya%20tentang%20booking%20${booking.booking_id}`)}
            >
                <Phone size={18} /> HUBUNGI KAMI
            </Button>
            <Button 
                onClick={() => navigate('/')}
                className="w-full py-4"
            >
                KEMBALI KE BERANDA
            </Button>
            { (booking.status === 'selesai' || booking.status === 'batal') && (
                <button 
                    onClick={() => {
                        localStorage.removeItem('active_booking_id');
                        navigate('/');
                    }}
                    className="w-full text-[10px] font-black uppercase italic tracking-widest text-gray-400 py-4"
                >
                    Hapus Riwayat di Perangkat Ini
                </button>
            ) }
        </div>
      </div>
    </div>
  );
};

export default BookedPage;
