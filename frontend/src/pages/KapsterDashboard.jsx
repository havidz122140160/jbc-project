import { useState, useEffect, useCallback } from 'react';
import { Scissors, CheckCircle, Clock, Phone, PlayCircle, Megaphone, SkipForward, User } from 'lucide-react';
import Header from '../components/Header';
import background from '../assets/bg-poly.svg';
import TerminalButton from '../components/ui/TerminalButton';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Modal from '../components/Modal';
import api from '../api/axios';
import { useRealtime } from '../hooks/useRealtime';

const KapsterDashboard = () => {
  const username = localStorage.getItem('username') || 'Kapster';
  const kapsterId = localStorage.getItem('userId'); // Pastikan ini disimpan saat login

  const [activeCustomer, setActiveCustomer] = useState(null);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Profile Management State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileFormData, setProfileFormData] = useState({ username: '', email: '', password: '', first_name: '', last_name: '', no_wa: '' });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch('/users/profile/', profileFormData);
      setIsProfileModalOpen(false);
      alert('Profil berhasil diperbarui!');
    } catch (err) {
      alert('Gagal update profil.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/profile/');
      setProfileFormData(res.data);
      setIsProfileModalOpen(true);
    } catch (err) {
      alert('Gagal mengambil data profil.');
    }
  };

  const fetchTerminalData = useCallback(async () => {
    try {
      const res = await api.get('/reservations/');
      const allReservations = res.data.results || res.data;
      
      // Filter untuk Kapster ini saja
      const myReservations = allReservations.filter(r => r.kapster.toString() === kapsterId);
      
      setActiveCustomer(myReservations.find(r => r.status === 'proses'));
      setQueue(myReservations.filter(r => r.status === 'menunggu').sort((a, b) => new Date(a.scheduled_time) - new Date(b.scheduled_time)));
    } catch (err) {
      console.error("Terminal Fetch Error:", err);
      setErrorMsg("Gagal sinkronisasi terminal.");
    }
  }, [kapsterId]);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchTerminalData();
    });
  }, [fetchTerminalData]);

  // REAL-TIME: Update terminal instantly on any queue change
  useRealtime('reservations_reservation', () => {
    fetchTerminalData();
  });

  const handleStatusChange = async (id, action) => {
    // OPTIMISTIC UI: Instantly update state before API finishes
    const originalActive = activeCustomer;
    const originalQueue = [...queue];

    if (action === 'check_in') {
      const nextCustomer = queue.find(r => r.id === id);
      setActiveCustomer(nextCustomer);
      setQueue(queue.filter(r => r.id !== id));
    } else if (action === 'mark_done' || action === 'roll_queue') {
      setActiveCustomer(null);
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await api.post(`/reservations/${id}/${action}/`);
      // fetchTerminalData() will be triggered by useRealtime or manually
      fetchTerminalData();
    } catch {
      // REVERT ON ERROR
      setActiveCustomer(originalActive);
      setQueue(originalQueue);
      setErrorMsg("Operasi Gagal! Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-x-hidden font-sans text-white pb-16">
      <img src={background} alt="BG" className="fixed inset-0 z-0 opacity-10 w-full h-full object-cover pointer-events-none grayscale" />

      <div className="relative z-10 p-4 max-w-2xl mx-auto pt-8">
        <Header onEditProfile={fetchProfile} />

        {/* ERROR NOTIFICATION */}
        {errorMsg && (
          <div className="mt-6 mb-3 bg-red-600/20 border border-red-500 text-red-500 p-2.5 rounded-xl flex items-center gap-2 animate-shake">
            <div className="p-1 bg-red-500 text-white rounded-full"><Megaphone size={10}/></div>
            <p className="text-[9px] font-black uppercase italic tracking-widest">{errorMsg}</p>
          </div>
        )}

        {/* TERMINAL STATUS BAR */}
        <div className={`mb-5 ${errorMsg ? 'mt-2' : 'mt-6'} flex items-center justify-between`}>
          <div>
            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-blue-500 italic">Barber Terminal Active</p>
            <h1 className="text-xl font-black uppercase italic tracking-tighter">
              {username}
            </h1>
          </div>
          <div className="bg-white/5 border border-white/10 p-2 rounded-xl text-center min-w-[60px]">
            <p className="text-[7px] font-bold text-gray-500 uppercase">Antrean</p>
            <p className="text-lg font-black italic">{queue.length}</p>
          </div>
        </div>

        {/* MAIN OPERATION AREA (ONE-HANDED) */}
        {activeCustomer ? (
          <section className="space-y-3">
            <Card className="bg-blue-600/10 border-blue-500/30 p-4 rounded-xl relative overflow-hidden ring-1 ring-blue-500/20">
              <div className="relative z-10">
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="px-1.5 py-0.5 bg-blue-500 text-[7px] font-black uppercase italic rounded-full">In Session</div>
                  <div className="text-blue-400"><Clock size={12} className="animate-spin-slow" /></div>
                </div>
                <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-0.5">{activeCustomer.customer_name}</h2>
                <p className="text-blue-300 font-bold uppercase tracking-widest text-[9px] mb-3">{activeCustomer.service_detail || activeCustomer.service_name}</p>
                
                <div className="flex gap-3 opacity-60 mb-4">
                   <div className="flex items-center gap-1 text-[9px] font-mono bg-black/20 px-2 py-0.5 rounded-full"><Phone size={9}/> {activeCustomer.customer_phone}</div>
                </div>

                <TerminalButton 
                  variant="success" 
                  icon={CheckCircle}
                  disabled={loading}
                  onClick={() => handleStatusChange(activeCustomer.id, 'mark_done')}
                >
                  Selesaikan Sesi
                </TerminalButton>
              </div>
              <Scissors size={80} className="absolute -right-6 -bottom-6 opacity-5 -rotate-12" />
            </Card>
          </section>
        ) : (
          <section className="space-y-3">
            {queue.length > 0 ? (
              <Card className="bg-white/5 border-white/10 p-4 rounded-xl text-center border-dashed">
                <User size={24} className="mx-auto mb-1.5 text-gray-600" />
                <h3 className="text-lg font-black uppercase italic text-gray-400">Siap untuk Pelanggan Berikutnya?</h3>
                <p className="text-[9px] text-gray-500 mt-0.5 font-bold uppercase tracking-widest">Pilih tindakan di bawah untuk memanggil</p>
              </Card>
            ) : (
              <Card className="bg-white/5 border-white/10 p-6 rounded-xl text-center">
                <CheckCircle size={32} className="mx-auto mb-1.5 text-green-500/50" />
                <h3 className="text-lg font-black uppercase italic text-gray-500 tracking-tighter">Antrean Kosong</h3>
                <p className="text-[9px] text-gray-600 mt-0.5 font-bold uppercase tracking-widest">Waktunya istirahat sejenak, {username}.</p>
              </Card>
            )}
          </section>
        )}

        {/* NEXT CUSTOMER CONTROLS */}
        {!activeCustomer && queue.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            <TerminalButton 
              variant="primary" 
              icon={Megaphone}
              disabled={loading}
              onClick={() => {
                setErrorMsg("Memanggil: " + queue[0].customer_name);
                setTimeout(() => setErrorMsg(''), 3000);
              }}
            >
              Panggil
            </TerminalButton>
            <TerminalButton 
              variant="success" 
              icon={PlayCircle}
              disabled={loading}
              onClick={() => handleStatusChange(queue[0].id, 'check_in')}
            >
              Mulai Sesi
            </TerminalButton>
          </div>
        )}

        {/* SECONDARY ACTIONS (SKIP/DELAY) */}
        <div className="mt-6 space-y-2">
           <h3 className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-600 ml-3">Advanced Control</h3>
           <div className="grid grid-cols-1 gap-2">
              <button 
                disabled={loading || (!activeCustomer && queue.length === 0)}
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between hover:bg-red-500/10 transition-all group"
                onClick={() => handleStatusChange(activeCustomer?.id || queue[0].id, 'roll_queue')}
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-red-500/20 text-red-500 rounded-lg group-hover:bg-red-500 group-hover:text-white transition-all"><SkipForward size={14}/></div>
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase italic">Skip / No-Show</p>
                    <p className="text-[7px] text-gray-500 font-bold uppercase">Geser pelanggan ke antrean akhir</p>
                  </div>
                </div>
              </button>
           </div>
        </div>
        
        {isProfileModalOpen && (
          <Modal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)}>
            <div className="p-4 w-full max-w-md">
              <h2 className="text-xl font-black uppercase italic mb-6">Edit Profil</h2>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="First Name" value={profileFormData.first_name || ''} onChange={e => setProfileFormData({...profileFormData, first_name: e.target.value})} />
                  <Input label="Last Name" value={profileFormData.last_name || ''} onChange={e => setProfileFormData({...profileFormData, last_name: e.target.value})} />
                </div>
                <Input label="Username" value={profileFormData.username || ''} onChange={e => setProfileFormData({...profileFormData, username: e.target.value})} required />
                <Input label="Email" type="email" value={profileFormData.email || ''} onChange={e => setProfileFormData({...profileFormData, email: e.target.value})} required />
                <Input label="WhatsApp" value={profileFormData.no_wa || ''} onChange={e => setProfileFormData({...profileFormData, no_wa: e.target.value})} />
                <Input label="New Password (optional)" type="password" onChange={e => setProfileFormData({...profileFormData, password: e.target.value})} />
                <Button type="submit" disabled={loading} className="w-full py-3 mt-4 text-sm">{loading ? 'SAVING...' : 'UPDATE PROFILE'}</Button>
              </form>
            </div>
          </Modal>
        )}

        {/* SYSTEM LOG */}
        <footer className="mt-10 text-center opacity-20">
          <p className="text-[10px] font-black uppercase tracking-[0.5em]">JBC Operational Terminal v4.2</p>
          <p className="text-[8px] font-mono mt-2">TERMINAL_ID: {kapsterId || 'UNSET'}</p>
        </footer>
      </div>
    </div>
  );
};

export default KapsterDashboard;