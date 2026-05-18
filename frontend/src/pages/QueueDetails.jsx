import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Users, Scissors, Info } from 'lucide-react';
import api from '../api/axios';
import background from '../assets/bg-poly.svg';
import Card from '../components/ui/Card';
import { useRealtime } from '../hooks/useRealtime';

const QueueDetails = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Hari ini');
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const getTargetDate = useCallback((label) => {
    const date = new Date(); 
    if (label === 'Besok') date.setDate(date.getDate() + 1);
    if (label === 'Lusa') date.setDate(date.getDate() + 2);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const fetchData = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const targetDate = getTargetDate(activeTab);
      // Fetch specific date to reduce data transfer
      const res = await api.get(`/reservations/?date=${targetDate}`);
      
      // Filter by date and status (backup filter in case backend doesn't handle date yet)
      const data = (res.data.results || res.data).filter(item => 
        item.scheduled_time?.startsWith(targetDate) &&
        ['menunggu', 'proses', 'tertunda'].includes(item.status)
      ).sort((a, b) => new Date(a.estimated_start) - new Date(b.estimated_start));
      
      setReservations(data);
    } catch (err) {
      console.error("Queue Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, getTargetDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useRealtime('reservations_reservation', () => {
    fetchData(true); // Quiet update for realtime
  });

  return (
    <div className="min-h-screen bg-[#F0F0F0] relative overflow-x-hidden font-sans text-black pb-20">
      <img src={background} alt="BG" className="fixed inset-0 z-0 opacity-10 w-full h-full object-cover pointer-events-none grayscale" />

      <div className="relative z-10 p-4 max-w-2xl mx-auto pt-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-3 bg-black text-white rounded-full shadow-lg active:scale-90 transition-all hover:bg-gray-800">
            <ArrowLeft size={20}/>
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-black uppercase italic tracking-tighter leading-none">Live Queue</h1>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Real-time Synchronization</p>
          </div>
        </div>

        {/* DATE TABS */}
        <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar pb-1">
          {['Hari ini', 'Besok', 'Lusa'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl font-black uppercase italic text-[10px] transition-all border-2 whitespace-nowrap ${
                activeTab === tab 
                ? 'bg-black text-white border-black shadow-lg scale-105' 
                : 'bg-white/60 backdrop-blur-md text-gray-500 border-white hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
                <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin mb-3" />
                <p className="font-black italic uppercase tracking-widest animate-pulse text-xs">Syncing Antrean...</p>
            </div>
        ) : (
            <div className="space-y-4">
                {reservations.length === 0 ? (
                    <Card className="p-8 text-center border-dashed border-4 border-gray-200 bg-white/40">
                        <Users size={40} className="mx-auto mb-4 text-gray-200" />
                        <h4 className="text-lg font-black uppercase italic text-gray-400 mb-1">Slot Kosong</h4>
                        <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Belum ada antrean untuk tanggal ini</p>
                    </Card>
                ) : (
                    reservations.map((res, index) => (
                        <Card key={res.id} className={`p-4 relative overflow-hidden transition-all duration-500 ${
                          res.status === 'proses' 
                          ? 'ring-4 ring-black ring-offset-4 ring-offset-[#F0F0F0] scale-[1.02] shadow-xl z-20' 
                          : 'opacity-90 hover:opacity-100 hover:scale-[1.01]'
                        }`}>
                            {res.status === 'proses' && (
                                <div className="absolute top-0 right-0 bg-black text-white px-3 py-1 rounded-bl-xl text-[8px] font-black uppercase italic animate-pulse flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                                    Sedang Dicukur
                                </div>
                            )}

                            {res.status === 'tertunda' && (
                                <div className="absolute top-0 right-0 bg-amber-500 text-white px-3 py-1 rounded-bl-xl text-[8px] font-black uppercase italic">
                                    Delayed
                                </div>
                            )}
                            
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shadow-inner italic border-2 transition-colors ${
                                  res.status === 'proses' ? 'bg-black text-white border-gray-800' : 'bg-gray-100 text-black border-white/50'
                                }`}>
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <h3 className={`text-lg font-black uppercase italic tracking-tighter ${res.status === 'proses' ? 'text-black' : 'text-gray-800'}`}>
                                          {res.customer_name}
                                        </h3>
                                    </div>
                                    <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                                        <div className="flex items-center gap-1 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                                            <Scissors size={10} className="text-black" /> {res.kapster_name}
                                        </div>
                                        <div className="flex items-center gap-1 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                                            <Info size={10} className="text-black" /> {res.service_name || res.service_detail}
                                        </div>
                                    </div>
                                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-white/50 rounded-full">
                                        <Clock size={10} className={res.status === 'proses' ? 'text-black' : 'text-blue-600'} />
                                        <span className={`text-[9px] font-black uppercase italic tracking-widest ${res.status === 'proses' ? 'text-black' : 'text-blue-600'}`}>
                                          {res.wait_time_display}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right border-l-2 border-gray-100 pl-4">
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none mb-1">Estimasi</p>
                                    <p className={`text-lg font-black italic tracking-tighter ${res.status === 'proses' ? 'text-black' : 'text-gray-700'}`}>
                                      {res.estimated_start?.substring(11, 16) || '--:--'}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        )}

        <div className="mt-16 text-center">
            <div className="mt-12 text-center opacity-30">
                <p className="text-[9px] font-black uppercase tracking-[0.4em]">State Synchronization Engine v1.0</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default QueueDetails;
