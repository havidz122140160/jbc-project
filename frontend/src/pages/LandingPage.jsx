import { useNavigate } from 'react-router-dom';
import { ChevronRight, Scissors, Star, Users } from 'lucide-react';
import background from '../assets/bg-poly.svg';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F0F0F0] relative overflow-x-hidden font-sans text-black">
      {/* BACKGROUND GEOMETRIC */}
      <img 
        src={background} 
        alt="Background" 
        className="fixed inset-0 z-0 opacity-10 min-h-screen w-full object-cover pointer-events-none grayscale" 
      />

      <div className="relative z-10 p-4 flex flex-col min-h-screen w-full mx-auto md:max-w-4xl pt-8">
        <Header />

        {/* HERO SECTION */}
        <div className="relative mt-6 mb-12 group">
          <div className="space-y-1 mb-6">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 italic">Welcome to JBC</p>
            <h2 className="font-serif text-3xl md:text-5xl font-black leading-none uppercase italic tracking-tighter">
              Ganteng Itu <br/>
              <span className="text-white drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">Pilihan</span>, <br/>
              Cukur Itu <br/>
              <span className="bg-black text-white px-3">Solusi.</span>
            </h2>
          </div>
          
          <Button 
            onClick={() => navigate('/dashboard')}
            className="w-16 h-16 md:w-20 md:h-20 rounded-full absolute -right-2 top-1/2 flex items-center justify-center p-0"
          >
            <ChevronRight size={32} className="italic" />
          </Button>
        </div>

        {/* STATS SECTION */}
        <div className="grid grid-cols-3 gap-2 mb-12">
            <div className="text-center">
                <p className="text-2xl font-black italic">10k+</p>
                <p className="text-[8px] font-bold uppercase tracking-widest text-gray-400">Customers</p>
            </div>
            <div className="text-center border-x border-black/5">
                <p className="text-2xl font-black italic">4.9</p>
                <p className="text-[8px] font-bold uppercase tracking-widest text-gray-400">Rating</p>
            </div>
            <div className="text-center">
                <p className="text-2xl font-black italic">12</p>
                <p className="text-[8px] font-bold uppercase tracking-widest text-gray-400">Barbers</p>
            </div>
        </div>

        {/* SERVICES PREVIEW */}
        <section className="mb-12">
            <div className="flex justify-between items-end mb-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest">Layanan Unggulan</h3>
                <Scissors className="text-gray-300" size={20} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Card hover className="p-4 flex justify-between items-center group">
                    <div>
                        <h4 className="text-xl font-black italic uppercase tracking-tighter">Gentleman Cut</h4>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Potong + Cuci + Pijat</p>
                    </div>
                    <Star className="group-hover:fill-black transition-all" size={20} />
                </Card>
                <Card hover className="p-4 flex justify-between items-center group">
                    <div>
                        <h4 className="text-xl font-black italic uppercase tracking-tighter">Kid's Styling</h4>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Cukur Keren buat si Kecil</p>
                    </div>
                    <Users className="group-hover:fill-black transition-all" size={20} />
                </Card>
            </div>
        </section>

        {/* GALLERY PREVIEW */}
        <div className="flex gap-4 overflow-x-auto pb-8 no-scrollbar snap-x">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="min-w-[180px] md:min-w-[240px] aspect-[4/5] relative rounded-2xl overflow-hidden snap-center group shadow-xl border-2 border-white">
              <img 
                src={`https://picsum.photos/600/800?haircut=${item}`}
                alt="Model"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                 <p className="text-white font-black italic uppercase text-lg">Modern Fade</p>
                 <p className="text-white/60 text-[8px] font-bold tracking-widest uppercase">Style by Javas</p>
              </div>
            </div>
          ))}
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default LandingPage;
