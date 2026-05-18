import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertCircle, User, Scissors, Clock, Calendar, Star } from 'lucide-react';
import api from '../api/axios';
import background from '../assets/bg-poly.svg';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';

const ReservationPage = () => {
  const navigate = useNavigate();

  const [kapsters, setKapsters] = useState([]);
  const [services, setServices] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  
  const getFormattedDate = (daysToAdd) => {
    const date = new Date();
    date.setDate(date.getDate() + daysToAdd);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDisplayDate = (daysToAdd) => {
    const date = new Date();
    date.setDate(date.getDate() + daysToAdd);
    return new Intl.DateTimeFormat('id-ID', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
    }).format(date).replace(/\//g, '-');
  };

  const dateOptions = [
    { label: 'HARI INI', value: getFormattedDate(0), display: getDisplayDate(0) },
    { label: 'BESOK', value: getFormattedDate(1), display: getDisplayDate(1) },
    { label: 'LUSA', value: getFormattedDate(2), display: getDisplayDate(2) },
  ];

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    kapster: null,
    service: null,
    scheduled_date: getFormattedDate(0),
    scheduled_time: ''
  });

  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isRaceCondition, setIsRaceCondition] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const ALL_SLOTS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "19:00", "20:00"];

  const activeBookingId = localStorage.getItem('active_booking_id');

  useEffect(() => {
    // Check if user already has an active booking on this device
    if (activeBookingId) {
      const verifyBooking = async () => {
        try {
          const res = await api.get('/reservations/');
          const all = res.data.results || res.data;
          const found = all.find(b => b.booking_id === activeBookingId);
          // If booking exists and is still waiting/in-progress, redirect to BookedPage
          if (found && found.status !== 'selesai' && found.status !== 'batal') {
            navigate('/booked');
          } else if (found) {
            // If it's done or cancelled, we can allow a new one by clearing the old ID
            localStorage.removeItem('active_booking_id');
          }
        } catch (err) {
          console.error("Verification failed:", err);
        }
      };
      verifyBooking();
    }

    const fetchData = async () => {
      try {
        const [resK, resS] = await Promise.all([
          api.get('/kapsters/'),
          api.get('/services/')
        ]);
        setKapsters(resK.data.results || resK.data);
        setServices(resS.data.results || resS.data);
      } catch {
        setErrorMsg("Gagal sinkronisasi data.");
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchTimes = async () => {
      if (!formData.kapster || !formData.scheduled_date) return;
      try {
        const res = await api.get(`/reservations/available-times/`, {
          params: { kapster: formData.kapster, date: formData.scheduled_date }
        });
        setAvailableTimes(res.data);
      } catch (err) {
        console.error("Fetch Times Error:", err);
      }
    };
    fetchTimes();
  }, [formData.kapster, formData.scheduled_date]);

  const handleBooking = async (e) => {
    e.preventDefault();
    
    // VALIDASI KETAT
    const missing = [];
    if (!formData.customer_name) missing.push("Nama");
    if (!formData.customer_phone) missing.push("WhatsApp");
    if (formData.kapster === null) missing.push("Kapster");
    if (formData.service === null) missing.push("Layanan");
    if (!formData.scheduled_time) missing.push("Jam");

    if (missing.length > 0) {
      setErrorMsg(`Pilih yang lengkap ya! Belum diisi: ${missing.join(', ')}`);
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const payload = {
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        kapster: parseInt(formData.kapster),
        service: parseInt(formData.service),
        scheduled_time: `${formData.scheduled_date}T${formData.scheduled_time}:00`
      };

      const res = await api.post('/reservations/', payload);
      const bookingData = res.data;
      if (bookingData.booking_id) {
        localStorage.setItem('active_booking_id', bookingData.booking_id);
      }
      setIsSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2500);
    } catch (err) {
      const serverError = err.response?.data;
      // Detect race condition (unique constraint violation usually returns 400 with specific message)
      if (err.response?.status === 400 && (JSON.stringify(serverError).includes("already exists") || JSON.stringify(serverError).includes("unique"))) {
        setIsRaceCondition(true);
      } else {
        setErrorMsg(serverError ? JSON.stringify(serverError) : "Gagal menyimpan reservasi. Cek jadwal kembali.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (isRaceCondition) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-center">
        <div className="relative mb-8">
            <AlertCircle size={80} className="text-red-500 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center text-4xl">:(</div>
        </div>
        <h1 className="text-2xl font-black italic text-white uppercase tracking-tighter leading-tight mb-4">
            Waduh, Maaf Ya,<br/>
            Kayaknya Slotnya Udah<br/>
            ada yang Duluan<br/>
            Ngambil Deh
        </h1>
        <p className="text-red-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-8 max-w-xs mx-auto">
            Coba pilih jam atau kapster lain yuk, jangan nyerah dulu!
        </p>
        <Button 
            onClick={() => {
                setIsRaceCondition(false);
                setFormData({...formData, scheduled_time: ''});
            }}
            className="bg-white text-black px-8 py-4 rounded-full font-black italic uppercase tracking-widest text-xs hover:scale-105 transition-all"
        >
            PILIH ULANG JAM
        </Button>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white text-center">
        <CheckCircle2 size={80} className="mb-4 animate-bounce text-green-400" />
        <h1 className="text-3xl font-black italic uppercase tracking-tighter leading-none">Booking<br/>Berhasil!</h1>
        <p className="text-gray-500 mt-4 font-bold uppercase tracking-[0.3em] text-[10px]">Jangan Lupa Datang Ya!</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F0F0] relative font-sans pb-16 overflow-x-hidden">
      <img src={background} alt="BG" className="fixed inset-0 z-0 opacity-10 w-full h-full object-cover pointer-events-none grayscale" />

      <div className="relative z-10 p-4 max-w-lg mx-auto pt-6">
        {/* TOP NAV */}
        <div className="flex items-center gap-3 mb-6">
          <button type="button" onClick={() => navigate(-1)} className="p-2.5 bg-black text-white rounded-full shadow-lg active:scale-90 transition-all border-2 border-white/20">
            <ArrowLeft size={20}/>
          </button>
          <div>
            <p className="text-[7px] font-black uppercase tracking-[0.5em] text-gray-400 mb-0.5">JBC Terminal v2</p>
            <h1 className="text-2xl font-black uppercase italic tracking-tighter leading-none">Reservasi</h1>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 bg-red-600 text-white p-3 rounded-xl animate-shake shadow-lg flex items-center gap-2">
            <AlertCircle size={20} className="shrink-0" />
            <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleBooking} className="space-y-6">
          
          {/* 1. IDENTITAS: BLACK CARD DESIGN */}
          <section className="space-y-3">
             <div className="flex items-center gap-2 ml-4">
                <User size={12} className="text-black" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 italic">Identitas Pelanggan</h3>
             </div>
             <Card className="space-y-3 bg-black border-none p-4 rounded-xl shadow-lg relative overflow-hidden group">
                <div className="absolute -right-20 -top-20 w-48 h-48 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-700" />
                <Input 
                  placeholder="Nama Lengkap..." 
                  required 
                  className="bg-white/10 border-transparent text-white focus:bg-white/20 text-sm py-2.5 rounded-lg"
                  onChange={e => setFormData({...formData, customer_name: e.target.value})} 
                />
                <Input 
                  type="tel" 
                  placeholder="WhatsApp (08xx...)" 
                  required 
                  className="bg-white/10 border-transparent text-white focus:bg-white/20 text-sm py-2.5 rounded-lg"
                  onChange={e => setFormData({...formData, customer_phone: e.target.value})} 
                />
             </Card>
          </section>

          {/* 2. LAYANAN: BLACK ON CHOSEN */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 ml-4">
                <Scissors size={12} />
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 italic">Pilih Layanan</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 px-1">
              {services.map(s => {
                const isSelected = formData.service === s.id;
                return (
                    <Card 
                    key={s.id} 
                    hover 
                    onClick={() => setFormData({...formData, service: s.id})}
                    className={`p-4 border-2 transition-all duration-500 rounded-xl ${isSelected ? 'bg-black text-white border-black scale-[1.02] shadow-lg' : 'bg-white border-transparent'}`}
                    >
                    <p className={`text-base font-black uppercase italic tracking-tighter ${isSelected ? 'text-white' : 'text-black'}`}>{s.name}</p>
                    <div className="flex items-center justify-between mt-3">
                        <p className={`text-[9px] font-black uppercase tracking-[0.3em] ${isSelected ? 'text-gray-400' : 'text-gray-400'}`}>
                            Rp {s.price?.toLocaleString()}
                        </p>
                        {isSelected && <CheckCircle2 className="text-green-400" size={16} />}
                    </div>
                    </Card>
                );
              })}
            </div>
          </section>

          {/* 3. KAPSTER: BLACK ON CHOSEN, NO GREEN CIRCLE */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 ml-4">
                <Star size={12} fill="black" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 italic">Kapster Ahli</h3>
            </div>
            <div className="flex gap-3 overflow-x-auto px-2 pb-4 pt-1 no-scrollbar scroll-smooth">
              {kapsters.map(k => {
                const isSelected = formData.kapster === k.id;
                return (
                    <button 
                    key={k.id} 
                    type="button" 
                    onClick={() => setFormData({...formData, kapster: k.id})}
                    className={`min-w-[90px] p-4 rounded-2xl border-2 transition-all duration-500 flex flex-col items-center gap-2 relative
                        ${isSelected ? 'bg-black border-black text-white shadow-lg scale-[1.05] z-10' : 'bg-white border-transparent text-gray-500 shadow-sm'}`}
                    >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xl shadow-inner
                        ${isSelected ? 'bg-white text-black' : 'bg-gray-100 text-black'}`}>
                        {k.username[0].toUpperCase()}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] italic">{k.username}</span>
                    </button>
                );
              })}
            </div>
          </section>
          
          {/* 4. JADWAL: dd-mm-yyyy */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 ml-4">
                <Calendar size={12} />
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 italic">Jadwal Kedatangan</h3>
            </div>
            <div className="grid grid-cols-3 gap-2 px-1">
              {dateOptions.map((opt) => {
                const isSelected = formData.scheduled_date === opt.value;
                return (
                    <Button
                    key={opt.value}
                    variant={isSelected ? 'primary' : 'secondary'}
                    onClick={() => setFormData({ ...formData, scheduled_date: opt.value })}
                    className={`py-2 rounded-xl border-2 transition-all flex flex-col items-center ${isSelected ? 'border-black scale-[1.02]' : 'border-transparent opacity-60'}`}
                    >
                    <span className="text-[9px] font-black block mb-0.5">{opt.label}</span>
                    <span className="block text-[8px] font-black opacity-40">{opt.display}</span>
                    </Button>
                );
              })}
            </div>
          </section>

          {/* 5. JAM: LARGE TOUCH TARGETS */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 ml-4">
                <Clock size={12} />
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 italic">Jam Kedatangan</h3>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2 px-1">
              {ALL_SLOTS.map(t => {
                const isAvailable = availableTimes.includes(t);
                const isSelected = formData.scheduled_time === t;
                
                return (
                    <button 
                    key={t} 
                    type="button" 
                    disabled={!isAvailable}
                    onClick={() => isAvailable && setFormData({...formData, scheduled_time: t})}
                    className={`py-2 rounded-lg text-xs font-black border-2 transition-all shadow-md relative overflow-hidden
                        ${!isAvailable 
                            ? 'bg-gray-100 border-transparent text-gray-300 cursor-not-allowed' 
                            : isSelected 
                                ? 'bg-black border-black text-white scale-[1.05] z-10' 
                                : 'bg-white border-transparent text-black hover:bg-black/5'}`}
                    >
                    <span className={!isAvailable ? 'line-through decoration-2 opacity-50' : ''}>
                        {t}
                    </span>
                    {!isAvailable && (
                        <div className="absolute inset-0 bg-white/10 flex items-center justify-center">
                            <div className="w-full h-[2px] bg-gray-300 rotate-[25deg] absolute" />
                        </div>
                    )}
                    </button>
                );
              })}
            </div>
          </section>

          <div className="pt-6">
            <Button 
                disabled={loading} 
                type="submit" 
                className="w-full py-4 text-xl italic shadow-xl hover:scale-[1.02] active:scale-95 transition-all rounded-xl flex flex-col items-center gap-0.5"
            >
                <span className="leading-none">{loading ? 'PROSES...' : 'KONFIRMASI'}</span>
                {!loading && <span className="text-[7px] font-black tracking-[0.5em] opacity-40 uppercase not-italic">TAP TO FINISH BOOKING</span>}
            </Button>
            <p className="text-center mt-4 text-[8px] font-black uppercase tracking-[0.6em] text-gray-300 italic">
                JAVAS BARBER CONNECT &bull; EST 2026
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReservationPage;
