import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import background from '../assets/bg-poly.svg';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Activity, Calendar, LayoutGrid } from 'lucide-react';
import { useRealtime } from '../hooks/useRealtime';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Hari ini');
  const [kapsters, setKapsters] = useState([]);
  const [allReservations, setAllReservations] = useState([]);
  const [totalReservations, setTotalReservations] = useState(0);
  const [loading, setLoading] = useState(true);

  const getTargetDate = (label) => {
    const date = new Date();
    if (label === 'Besok') date.setDate(date.getDate() + 1);
    if (label === 'Lusa') date.setDate(date.getDate() + 2);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const targetDate = getTargetDate(activeTab);
      const [resK, resR, resQ] = await Promise.all([
        api.get('/kapsters/'),
        api.get('/reservations/'),
        api.get(`/reservations/queue/?date=${targetDate}`)
      ]);
      const kData = resK.data.results || resK.data;
      const rData = resR.data.results || resR.data;
      setKapsters(Array.isArray(kData) ? kData : []);
      setAllReservations(Array.isArray(rData) ? rData : []);
      setTotalReservations(resQ.data.total);
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  useRealtime('reservations_reservation', () => {
    fetchData();
  });

  const targetDate = getTargetDate(activeTab);
  const dailyReservations = allReservations.filter(res => 
    res.scheduled_time?.substring(0, 10) === targetDate
  );

  const kapsterProgress = kapsters.map(k => {
    const inProgress = dailyReservations.find(res => 
      res.kapster === k.id && res.status === 'proses'
    );
    return {
      name: k.username,
      queue: inProgress ? inProgress.booking_id.split('-')[1] : '-' 
    };
  });

  return (
    <div className="min-h-screen bg-[#F0F0F0] relative overflow-x-hidden font-sans text-black">
      <img src={background} alt="BG" className="fixed inset-0 z-0 opacity-10 w-full h-full object-cover pointer-events-none grayscale" />

      <div className="relative z-10 p-4 flex flex-col min-h-screen w-full mx-auto md:max-w-4xl pt-8">
        <Header />

        <div className="mb-8">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-1 italic">Live Monitor</p>
          <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-[0.85]">
            Status<br/>Antrean
          </h1>
        </div>

        {/* DATE TABS */}
        <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar pb-1">
          {['Hari ini', 'Besok', 'Lusa'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl font-black uppercase italic text-[10px] transition-all tracking-widest border-2 ${
                activeTab === tab 
                ? 'bg-black text-white border-black shadow-lg scale-105' 
                : 'bg-white/60 backdrop-blur-md text-gray-500 border-white hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* GRID CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="p-6 relative overflow-hidden group">
            <Activity className="absolute -right-3 -top-3 w-16 h-16 text-black/5 -rotate-12 group-hover:rotate-0 transition-transform" />
            <div className="relative z-10">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6 italic">Aktif Sekarang</h3>
              <div className="space-y-4">
                {loading ? (
                    <div className="h-16 flex items-center justify-center opacity-20 font-black italic text-xs">SYNCING...</div>
                ) : kapsterProgress.map((k) => (
                    <div key={k.name} className="flex justify-between items-center group/item">
                      <span className="font-serif font-black text-xl uppercase italic tracking-tighter group-hover/item:translate-x-1 transition-transform">{k.name}</span>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shadow-lg transition-all border-2 ${k.queue === '-' ? 'bg-gray-100 text-gray-400 border-transparent' : 'bg-black text-white border-white'}`}>
                        {k.queue}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </Card>

          <Card className="p-6 flex flex-col justify-between text-center relative overflow-hidden group">
            <Calendar className="absolute -right-3 -top-3 w-16 h-16 text-black/5 rotate-12 group-hover:rotate-0 transition-transform" />
            <div className="relative z-10">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-1 italic">Total Reservasi</h3>
                <p className="text-[8px] font-bold text-gray-300 uppercase tracking-widest mb-4">Untuk {activeTab}</p>
                <div className="bg-white rounded-2xl py-6 shadow-inner border border-black/5 flex items-center justify-center">
                    <span className="text-7xl leading-none font-black italic tracking-tighter">
                        {loading ? '...' : totalReservations}
                    </span>
                </div>
            </div>
          </Card>
        </div>

        {/* ACTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {localStorage.getItem('active_booking_id') && (
            <Button 
              onClick={() => navigate('/booked')}
              className="py-6 text-xl flex items-center justify-center gap-3 bg-blue-600 border-blue-700"
            >
              <LayoutGrid className="animate-pulse" size={24} />
              LIHAT PESANAN
            </Button>
          )}
          <Button 
            onClick={() => navigate('/reservation')}
            className="py-6 text-xl flex items-center justify-center gap-3 group"
          >
            <LayoutGrid className="group-hover:rotate-90 transition-transform" size={24} />
            ATUR JADWAL
          </Button>
          <Button 
            variant="secondary"
            onClick={() => navigate('/queue-details')}
            className="py-6 text-xl"
          >
            PANTAU DETAIL
          </Button>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default Dashboard;
