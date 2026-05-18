import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Header from '../components/Header';
import background from '../assets/bg-poly.svg';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import api from '../api/axios';
import { useRealtime } from '../hooks/useRealtime';
import { ShieldAlert, TrendingUp, Users, Wallet, Plus, Edit, Trash2, Clock, UserPlus, BarChart2, Scissors } from 'lucide-react';
import Modal from '../components/Modal';

const OwnerDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics', 'staff', 'breaks', 'services'
  const [analyticsFilter, setAnalyticsFilter] = useState('all'); // 'day', 'week', 'month', 'year', 'all'
  const [stats, setStats] = useState({ total_income: 0, total_reservations: 0, active_kapsters: 0 });
  const [incomePerKapster, setIncomePerKapster] = useState([]);
  const [kapsters, setKapsters] = useState([]);
  const [recentBlocks, setRecentBlocks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Service Management State
  const [services, setServices] = useState([]);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [serviceFormData, setServiceFormData] = useState({ name: '', price: '', duration: 30 });
  const [editingServiceId, setEditingServiceId] = useState(null);

  // Kapster Form State
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [staffFormData, setStaffFormData] = useState({ username: '', email: '', password: '', first_name: '', last_name: '', no_wa: '', is_active_staf: true });
  const [editingStaffId, setEditingStaffId] = useState(null);

  // Break Form State
  const [isBreakModalOpen, setIsBreakModalOpen] = useState(false);
  const [breakFormData, setBreakFormData] = useState({ kapster: '', name: 'Istirahat', start_time: '12:00', end_time: '13:00', day_of_week: 0 });
  const [breaks, setBreaks] = useState([]);
  const [selectedKapsterForBreaks, setSelectedKapsterForBreaks] = useState('');

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

  // God Mode State
  const [blockData, setBlockData] = useState(() => {
    const date = new Date();
    const localDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return { kapster: '', date: localDate, time: '12:00', reason: '' };
  });

  const fetchData = async () => {
    try {
      const [resA, resK, resS] = await Promise.all([
        api.get(`/reservations/owner-analytics/?period=${analyticsFilter}`),
        api.get('/management/'),
        api.get('/services/')
      ]);
      
      setStats(resA.data.stats);
      setIncomePerKapster(resA.data.income_per_kapster);
      setRecentBlocks(resA.data.recent_blocks);
      setKapsters(resK.data.results || resK.data);
      setServices(resS.data.results || resS.data);

    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
    }
  };

  const fetchBreaks = async (kapsterId) => {
    if (!kapsterId) return;
    try {
      const res = await api.get(`/reservations/breaks/?kapster=${kapsterId}`);
      setBreaks(res.data.results || res.data);
    } catch (err) {
      console.error("Fetch Breaks Error:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [analyticsFilter]);

  useEffect(() => {
    if (selectedKapsterForBreaks) {
      fetchBreaks(selectedKapsterForBreaks);
    }
  }, [selectedKapsterForBreaks]);

  useRealtime('reservations_reservation', () => fetchData());

  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingStaffId) {
        await api.patch(`/management/${editingStaffId}/`, staffFormData);
      } else {
        await api.post('/management/', staffFormData);
      }
      setIsStaffModalOpen(false);
      setStaffFormData({ username: '', email: '', password: '', first_name: '', last_name: '', no_wa: '', is_active_staf: true });
      setEditingStaffId(null);
      fetchData();
    } catch (err) {
      alert("Error: " + JSON.stringify(err.response?.data));
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingServiceId) {
        await api.patch(`/services/management/${editingServiceId}/`, serviceFormData);
      } else {
        await api.post('/services/management/', serviceFormData);
      }
      setIsServiceModalOpen(false);
      setServiceFormData({ name: '', price: '', duration: 30 });
      setEditingServiceId(null);
      fetchData();
    } catch (err) {
      alert("Error: " + JSON.stringify(err.response?.data));
    } finally {
      setLoading(false);
    }
  };

  const deleteService = async (id) => {
    if (!confirm("Hapus layanan ini? Tindakan ini dapat mempengaruhi data historis.")) return;
    try {
      await api.delete(`/services/management/${id}/`);
      fetchData();
    } catch (err) {
      alert("Gagal menghapus layanan");
    }
  };

  const handleBreakSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/reservations/breaks/', breakFormData);
      setIsBreakModalOpen(false);
      fetchBreaks(breakFormData.kapster);
    } catch (err) {
      alert("Error: " + JSON.stringify(err.response?.data));
    } finally {
      setLoading(false);
    }
  };

  const deleteBreak = async (id) => {
    if (!confirm("Hapus jadwal istirahat ini?")) return;
    try {
      await api.delete(`/reservations/breaks/${id}/`);
      fetchBreaks(selectedKapsterForBreaks);
    } catch (err) {
      alert("Gagal menghapus");
    }
  };

  const handleEmergencyBlock = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/reservations/emergency_block/', blockData);
      fetchData();
    } catch (err) {
      alert("Gagal memblokir");
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyShutdown = async (e) => {
    e.preventDefault();
    if (!confirm("PERINGATAN: Ini akan MEMBATALKAN semua antrean aktif kapster ini dan memblokir sisa hari ini. Lanjutkan?")) return;
    setLoading(true);
    try {
      await api.post('/reservations/kapster_emergency/', {
        kapster: blockData.kapster,
        date: blockData.date
      });
      alert("Emergency Shutdown Sukses. Semua antrean telah dibatalkan.");
      fetchData();
    } catch (err) {
      alert("Gagal melakukan shutdown");
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#000', '#444', '#888', '#AAA'];

  const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  return (
    <div className="min-h-screen bg-[#EFEFEF] relative overflow-x-hidden font-sans text-black pb-20">
      <img src={background} alt="BG" className="fixed inset-0 z-0 opacity-20 w-full h-full object-cover pointer-events-none" />
      
      <div className="relative z-10 p-4 md:p-8 max-w-7xl mx-auto">
        <Header onEditProfile={fetchProfile} />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-8 mb-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-1">Management Console</p>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic leading-none">Eagle Eye Dashboard</h1>
          </div>
          <div className="flex bg-white/50 backdrop-blur-md p-1 rounded-xl border border-white shadow-sm overflow-x-auto">
            {[
              { id: 'analytics', label: 'Analytics', icon: BarChart2 },
              { id: 'staff', label: 'Staff', icon: Users },
              { id: 'breaks', label: 'Schedules', icon: Clock },
              { id: 'services', label: 'Services', icon: Scissors }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all whitespace-nowrap ${
                  activeTab === tab.id ? 'bg-black text-white shadow-lg scale-105' : 'text-gray-400 hover:text-black'
                }`}
              >
                <tab.icon size={12} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'analytics' && (
          <>
            {/* PERIOD FILTER */}
            <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar pb-1">
              {[
                { id: 'day', label: 'Hari Ini' },
                { id: 'week', label: 'Minggu Ini' },
                { id: 'month', label: 'Bulan Ini' },
                { id: 'year', label: 'Tahun Ini' },
                { id: 'all', label: 'Semua Waktu' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setAnalyticsFilter(f.id)}
                  className={`px-5 py-2.5 rounded-xl font-black uppercase italic text-[10px] transition-all tracking-widest border-2 ${
                    analyticsFilter === f.id 
                    ? 'bg-black text-white border-black shadow-lg scale-105' 
                    : 'bg-white/60 backdrop-blur-md text-gray-400 border-white hover:border-gray-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="flex items-center gap-4 p-5">
                <div className="p-3 bg-black text-white rounded-2xl"><TrendingUp size={20}/></div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Pendapatan</p>
                  <h3 className="text-xl font-black italic">Rp {(stats.total_income/1000).toLocaleString()}k</h3>
                </div>
              </Card>
              <Card className="flex items-center gap-4 p-5">
                <div className="p-3 bg-white border-2 border-black rounded-2xl"><Users size={20}/></div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Total Booking</p>
                  <h3 className="text-xl font-black italic">{stats.total_reservations}</h3>
                </div>
              </Card>
              <Card className="flex items-center gap-4 p-5">
                <div className="p-3 bg-gray-100 rounded-2xl"><ShieldAlert size={20}/></div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Kapster Aktif</p>
                  <h3 className="text-xl font-black italic">{stats.active_kapsters}</h3>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 p-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-black uppercase italic tracking-tighter">Performance Analysis</h2>
                  <Wallet className="text-gray-300" size={20} />
                </div>
                <div className="h-[300px] w-full mb-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={incomePerKapster}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 900, textTransform: 'uppercase'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9}} tickFormatter={(value) => `Rp${value/1000}k`} />
                      <Tooltip 
                        cursor={{fill: 'rgba(0,0,0,0.02)'}}
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontStyle: 'italic', fontWeight: 900, fontSize: '10px' }}
                      />
                      <Bar dataKey="income" radius={[8, 8, 0, 0]} barSize={40}>
                        {incomePerKapster.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* DETAILED REPORT TABLE */}
                <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Staff Performance Report</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[9px] font-black uppercase text-gray-400">
                          <th className="pb-3 px-2">Kapster</th>
                          <th className="pb-3 px-2">Sessions</th>
                          <th className="pb-3 px-2">Income</th>
                          <th className="pb-3 px-2">Performance</th>
                        </tr>
                      </thead>
                      <tbody className="text-[10px] font-bold uppercase italic">
                        {incomePerKapster.map((k, idx) => (
                          <tr key={idx} className="border-t border-gray-50">
                            <td className="py-3 px-2">{k.name}</td>
                            <td className="py-3 px-2">{k.sessions}</td>
                            <td className="py-3 px-2">Rp {k.income.toLocaleString()}</td>
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-black" style={{ width: `${k.performance}%` }} />
                                </div>
                                <span className="text-[9px] font-black">{k.performance}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>

              {/* EMERGENCY OVERRIDE */}
              <Card className="border-2 border-red-500/20 bg-red-50/30 p-6">
                <div className="flex items-center gap-3 mb-6 text-red-600">
                  <ShieldAlert size={24} />
                  <h2 className="text-lg font-black uppercase italic tracking-tighter">God Mode</h2>
                </div>
                <form onSubmit={handleEmergencyBlock} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-red-400 ml-4">Target Kapster</label>
                    <select 
                      required
                      className="w-full p-4 rounded-xl bg-white/60 border border-white shadow-sm focus:outline-none font-bold text-[10px]"
                      onChange={e => setBlockData({...blockData, kapster: e.target.value})}
                    >
                      <option value="">Pilih Kapster...</option>
                      {kapsters.map(k => <option key={k.id} value={k.id}>{k.username.toUpperCase()}</option>)}
                    </select>
                  </div>
                  <Input label="Tanggal Blokir" type="date" value={blockData.date} onChange={e => setBlockData({...blockData, date: e.target.value})} />
                  <Input label="Jam (HH:MM)" type="time" value={blockData.time} onChange={e => setBlockData({...blockData, time: e.target.value})} />
                  <Input label="Alasan" placeholder="Misal: Rapat" onChange={e => setBlockData({...blockData, reason: e.target.value})} />
                  <Button variant="danger" type="submit" disabled={loading} className="w-full py-4 mt-2 text-xs">{loading ? 'EXECUTING...' : 'FORCE BLOCK SLOT'}</Button>
                </form>

                <div className="mt-8 pt-6 border-t border-red-200">
                   <p className="text-[8px] font-black text-red-600 uppercase italic mb-3">Extreme Action:</p>
                   <Button 
                    variant="danger" 
                    onClick={handleEmergencyShutdown}
                    disabled={loading || !blockData.kapster}
                    className="w-full py-4 bg-red-700 border-red-800 text-[10px]"
                   >
                     EMERGENCY SHUTDOWN
                   </Button>
                   <p className="text-[7px] text-red-400 mt-2 font-bold uppercase tracking-widest text-center">
                     Batal antrean & blokir sisa hari
                   </p>
                </div>
              </Card>
            </div>
          </>
        )}

        {activeTab === 'staff' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">Manage Kapster Accounts</h2>
              <Button onClick={() => { setEditingStaffId(null); setStaffFormData({ username: '', email: '', password: '', first_name: '', last_name: '', no_wa: '', is_active_staf: true }); setIsStaffModalOpen(true); }} className="flex items-center gap-2 py-2 px-4 text-xs">
                <UserPlus size={16} /> Add New Kapster
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {kapsters.map(k => (
                <Card key={k.id} className={`p-4 border-l-4 ${k.is_active_staf ? 'border-green-500' : 'border-gray-300 opacity-60'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-black uppercase italic leading-none">{k.first_name || ''} {k.last_name || ''}</h3>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">@{k.username}</p>
                    </div>
                    <div className={`px-2 py-0.5 rounded text-[7px] font-black uppercase ${k.is_active_staf ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                      {k.is_active_staf ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  <div className="space-y-1 mb-4">
                    <p className="text-[10px] font-bold text-gray-600">Email: {k.email}</p>
                    <p className="text-[10px] font-bold text-gray-600">WA: {k.no_wa || '-'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setEditingStaffId(k.id); setStaffFormData(k); setIsStaffModalOpen(true); }}
                      className="p-2 bg-gray-100 hover:bg-black hover:text-white rounded-lg transition-all"
                    ><Edit size={14}/></button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'breaks' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="p-6">
              <h3 className="text-lg font-black uppercase italic mb-6">Select Kapster</h3>
              <div className="space-y-2">
                {kapsters.map(k => (
                  <button
                    key={k.id}
                    onClick={() => setSelectedKapsterForBreaks(k.id)}
                    className={`w-full p-3 rounded-xl text-left font-black uppercase italic text-[10px] transition-all border ${
                      selectedKapsterForBreaks === k.id ? 'bg-black text-white border-black shadow-lg scale-105' : 'bg-white border-gray-100 hover:border-black'
                    }`}
                  >
                    {k.username}
                  </button>
                ))}
              </div>
            </Card>

            <Card className="lg:col-span-2 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black uppercase italic">Weekly Break Schedule</h3>
                {selectedKapsterForBreaks && (
                  <Button onClick={() => { setBreakFormData({ ...breakFormData, kapster: selectedKapsterForBreaks }); setIsBreakModalOpen(true); }} className="px-3 py-1.5 text-[9px]">
                    <Plus size={12} className="inline mr-1" /> Add Break
                  </Button>
                )}
              </div>

              {!selectedKapsterForBreaks ? (
                <div className="text-center py-16 text-gray-300 font-black uppercase italic text-xs">Pilih kapster untuk melihat jadwal</div>
              ) : (
                <div className="space-y-3">
                  {breaks.length > 0 ? breaks.map(b => (
                    <div key={b.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="w-16 text-[9px] font-black uppercase text-gray-400">{DAYS[b.day_of_week]}</div>
                        <div>
                          <p className="text-[10px] font-black uppercase italic">{b.name}</p>
                          <p className="text-[9px] font-bold text-gray-500">{b.start_time.slice(0,5)} - {b.end_time.slice(0,5)}</p>
                        </div>
                      </div>
                      <button onClick={() => deleteBreak(b.id)} className="text-red-400 hover:text-red-600 p-1.5"><Trash2 size={14} /></button>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-400 text-[9px] font-black uppercase">Belum ada jadwal istirahat</div>
                  )}
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">Barber Services</h2>
              <Button onClick={() => { setEditingServiceId(null); setServiceFormData({ name: '', price: '', duration: 30 }); setIsServiceModalOpen(true); }} className="flex items-center gap-2 py-2 px-4 text-xs">
                <Plus size={16} /> Add New Service
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map(s => (
                <Card key={s.id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-black uppercase italic leading-none">{s.name}</h3>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1.5">{s.duration} Minutes</p>
                    </div>
                    <div className="text-lg font-black italic">
                      Rp {(s.price/1000).toLocaleString()}k
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button 
                      onClick={() => { setEditingServiceId(s.id); setServiceFormData(s); setIsServiceModalOpen(true); }}
                      className="p-2 bg-gray-100 hover:bg-black hover:text-white rounded-lg transition-all"
                    ><Edit size={14}/></button>
                    <button 
                      onClick={() => deleteService(s.id)}
                      className="p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                    ><Trash2 size={14}/></button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* MODALS */}
        {isStaffModalOpen && (
          <Modal isOpen={isStaffModalOpen} onClose={() => setIsStaffModalOpen(false)}>
            <div className="p-4 w-full max-w-md">
              <h2 className="text-xl font-black uppercase italic mb-6">{editingStaffId ? 'Edit Kapster' : 'Add New Kapster'}</h2>
              <form onSubmit={handleStaffSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="First Name" value={staffFormData.first_name || ''} onChange={e => setStaffFormData({...staffFormData, first_name: e.target.value})} required />
                  <Input label="Last Name" value={staffFormData.last_name || ''} onChange={e => setStaffFormData({...staffFormData, last_name: e.target.value})} required />
                </div>
                <Input label="Username" value={staffFormData.username || ''} onChange={e => setStaffFormData({...staffFormData, username: e.target.value})} required />
                <Input label="Email" type="email" value={staffFormData.email || ''} onChange={e => setStaffFormData({...staffFormData, email: e.target.value})} required />
                <Input label="WhatsApp" value={staffFormData.no_wa || ''} onChange={e => setStaffFormData({...staffFormData, no_wa: e.target.value})} />
                {!editingStaffId && <Input label="Password" type="password" required onChange={e => setStaffFormData({...staffFormData, password: e.target.value})} />}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <input type="checkbox" checked={staffFormData.is_active_staf} onChange={e => setStaffFormData({...staffFormData, is_active_staf: e.target.checked})} />
                  <label className="text-[9px] font-black uppercase">Staf Aktif (Muncul di Booking)</label>
                </div>
                <Button type="submit" disabled={loading} className="w-full py-3 mt-4 text-sm">{loading ? 'SAVING...' : 'SAVE KAPSTER'}</Button>
              </form>
            </div>
          </Modal>
        )}

        {isBreakModalOpen && (
          <Modal isOpen={isBreakModalOpen} onClose={() => setIsBreakModalOpen(false)}>
            <div className="p-4 w-full max-w-md">
              <h2 className="text-xl font-black uppercase italic mb-6">Add Weekly Break</h2>
              <form onSubmit={handleBreakSubmit} className="space-y-4">
                <Input label="Nama Istirahat" value={breakFormData.name || ''} onChange={e => setBreakFormData({...breakFormData, name: e.target.value})} required />
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase ml-4">Hari</label>
                  <select 
                    className="w-full p-3 rounded-xl bg-gray-50 border-none font-bold text-xs"
                    value={breakFormData.day_of_week}
                    onChange={e => setBreakFormData({...breakFormData, day_of_week: parseInt(e.target.value)})}
                  >
                    {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Mulai" type="time" value={breakFormData.start_time || ''} onChange={e => setBreakFormData({...breakFormData, start_time: e.target.value})} required />
                  <Input label="Selesai" type="time" value={breakFormData.end_time || ''} onChange={e => setBreakFormData({...breakFormData, end_time: e.target.value})} required />
                </div>
                <Button type="submit" disabled={loading} className="w-full py-3 mt-4 text-sm">{loading ? 'SAVING...' : 'ADD SCHEDULE'}</Button>
              </form>
            </div>
          </Modal>
        )}

        {isServiceModalOpen && (
          <Modal isOpen={isServiceModalOpen} onClose={() => setIsServiceModalOpen(false)}>
            <div className="p-4 w-full max-w-md">
              <h2 className="text-xl font-black uppercase italic mb-6">{editingServiceId ? 'Edit Service' : 'Add New Service'}</h2>
              <form onSubmit={handleServiceSubmit} className="space-y-4">
                <Input label="Service Name" value={serviceFormData.name || ''} onChange={e => setServiceFormData({...serviceFormData, name: e.target.value})} required />
                <Input label="Price (Rp)" type="number" value={serviceFormData.price || ''} onChange={e => setServiceFormData({...serviceFormData, price: e.target.value})} required />
                <Input label="Duration (Minutes)" type="number" value={serviceFormData.duration || ''} onChange={e => setServiceFormData({...serviceFormData, duration: parseInt(e.target.value)})} required />
                <Button type="submit" disabled={loading} className="w-full py-3 mt-4 text-sm">{loading ? 'SAVING...' : 'SAVE SERVICE'}</Button>
              </form>
            </div>
          </Modal>
        )}
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
      </div>
    </div>
  );
};

export default OwnerDashboard;