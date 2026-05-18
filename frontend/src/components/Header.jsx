import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import Modal from './Modal';
import { LogOut, User, Info, HelpCircle } from 'lucide-react'; // Opsional: pake icon biar makin cakep

const Header = ({ onEditProfile }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // Ambil data auth dari Local Storage
  const token = localStorage.getItem('access_token');
  const role = localStorage.getItem('user_role');
  const username = localStorage.getItem('username');

  const handleLogout = () => {
    localStorage.clear(); // Bersihin semua session
    setIsOpen(false);
    navigate('/login', { replace: true });
  };

  return (
    <header className="flex justify-between items-center w-full max-w-7xl mx-auto mb-8">
      {/* LOGO & TITLE */}
      <button onClick={() => navigate('/')} className="flex items-center gap-2.5 md:gap-3 group">
        <div className="relative">
          <img 
            src={logo} 
            alt="Logo" 
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white shadow-lg group-active:scale-90 transition-all z-10 relative" 
          />
          <div className="absolute inset-0 bg-black rounded-full scale-110 -z-0 opacity-20 blur-sm" />
        </div>
        <div className="font-serif text-lg md:text-xl font-black tracking-tighter text-black drop-shadow-sm italic uppercase leading-none text-left">
          JAVAS<br/><span className="text-[10px] opacity-40 not-italic">Connect</span>
        </div>
      </button>

      {/* HAMBURGER MENU */}
      <button 
        onClick={() => setIsOpen(true)} 
        className="w-10 h-10 md:w-11 md:h-11 bg-black text-white rounded-full border-2 border-black/10 flex flex-col items-center justify-center gap-0.5 shadow-xl active:scale-90 transition-all"
      >
        <div className="w-4 h-0.5 bg-white rounded-full"></div>
        <div className="w-2.5 h-0.5 bg-white rounded-full self-end mr-3"></div>
        <div className="w-4 h-0.5 bg-white rounded-full"></div>
      </button>

      {/* MODAL MENU */}
      <Modal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        title={token ? `HALO, ${username}!` : "MENU UTAMA"}
      >
        <div className="flex flex-col gap-3 w-full mt-3">
          {token && (
            <button 
              onClick={() => { setIsOpen(false); onEditProfile(); }}
              className="flex items-center justify-center gap-2 bg-white border border-black text-black py-2.5 px-5 rounded-full font-bold transition-transform hover:scale-105 active:scale-95 shadow-md text-sm"
            >
              <User size={16} /> Edit Profil
            </button>
          )}

          <button className="flex items-center justify-center gap-2 bg-black text-white py-2.5 px-5 rounded-full font-bold transition-transform hover:scale-105 active:scale-95 shadow-md text-sm">
            <Info size={16} /> Tentang Kami
          </button>
          
          <button className="flex items-center justify-center gap-2 bg-black text-white py-2.5 px-5 rounded-full font-bold transition-transform hover:scale-105 active:scale-95 shadow-md text-sm">
            <HelpCircle size={16} /> FAQ
          </button>

          {/* KONDISI: Jika Login (Admin/Kapster) Tampilkan Logout */}
          {token ? (
            <div className="pt-3 border-t border-gray-100 flex flex-col gap-3">
              <p className="text-[9px] text-center font-black text-gray-400 uppercase tracking-widest">
                Role: <span className="text-black">{role}</span>
              </p>
              <button 
                onClick={handleLogout} 
                className="flex items-center justify-center gap-2 bg-red-600 text-white py-2.5 px-5 rounded-full font-black transition-transform hover:scale-105 active:scale-95 shadow-lg text-sm"
              >
                <LogOut size={16} /> LOGOUT
              </button>
            </div>
          ) : (
            /* KONDISI: Jika Belum Login, Tampilkan Tombol Login */
            <button 
              onClick={() => {
                setIsOpen(false);
                navigate('/login');
              }} 
              className="flex items-center justify-center gap-2 bg-black text-white py-2.5 px-5 rounded-full font-black transition-transform hover:scale-105 active:scale-95 shadow-lg border-2 border-white/20 text-sm"
            >
              <User size={16} /> LOGIN ADMIN
            </button>
          )}
        </div>
      </Modal>
    </header>
  );
};

export default Header;