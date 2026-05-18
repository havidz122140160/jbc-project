import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import background from '../assets/bg-poly.svg';
import logo from '../assets/logo.png';
import Header from '../components/Header';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import { Lock } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/token/', formData);
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      localStorage.setItem('username', formData.username);
      localStorage.setItem('user_role', res.data.role);
      localStorage.setItem('userId', res.data.user_id || res.data.id); // Simpan ID untuk terminal
      navigate('/dashboard');
    } catch {
      setError('Akses ditolak. Cek kembali username & password!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F0F0] relative overflow-hidden p-6 font-sans text-black">
      <img src={background} alt="BG" className="fixed inset-0 z-0 opacity-10 w-full h-full object-cover pointer-events-none grayscale" />
      
      <div className="relative z-10 max-w-md mx-auto pt-8">
        <Header />

        <div className="mt-8 flex flex-col items-center">
            <Card className="w-full p-6 md:p-8 relative overflow-hidden group">
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-black/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
                
                <div className="text-center mb-6 relative z-10">
                <div className="relative inline-block mb-4">
                    <img src={logo} alt="Logo" className="w-16 h-16 mx-auto rounded-full border-4 border-white shadow-2xl relative z-10" />
                    <div className="absolute inset-0 bg-black rounded-full scale-110 blur-xl opacity-10 -z-0" />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tighter italic leading-none">Admin Terminal</h2>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-3">Authorized Personnel Only</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4 relative z-10">
                    <Input 
                        label="Username"
                        placeholder="admin_javas"
                        required
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                    />
                    <Input 
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        required
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />

                    {error && (
                        <div className="p-3 bg-red-100 border-l-4 border-red-600 rounded-r-xl">
                            <p className="text-[10px] text-red-700 font-black uppercase italic tracking-widest">{error}</p>
                        </div>
                    )}

                    <Button 
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 text-lg flex items-center justify-center gap-3 mt-2"
                    >
                        <Lock size={20} />
                        {loading ? 'VERIFYING...' : 'ACCESS GRANTED'}
                    </Button>
                </form>

                <div className="mt-8 text-center opacity-20">
                    <p className="text-[8px] font-black uppercase tracking-[0.5em]">JBC Security Protocol v2.1</p>
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
