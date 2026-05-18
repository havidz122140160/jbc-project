
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = ({ label, error, variant = 'light', ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = props.type === 'password';

  const themes = {
    light: "bg-gray-200/50 text-black placeholder:text-gray-400 focus:bg-white focus:border-black",
    dark: "bg-white/10 text-white placeholder:text-gray-500 focus:bg-white/20 focus:border-white/30"
  };

  return (
    <div className="space-y-2 w-full">
      {label && (
        <label className={`text-[10px] font-black uppercase tracking-[0.3em] ml-4 ${variant === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          {label}
        </label>
      )}
      <div className="relative">
        <input
          {...props}
          type={isPassword && showPassword ? 'text' : props.type}
          className={`
            w-full p-4 rounded-xl backdrop-blur-md border-2 border-transparent
            shadow-inner focus:outline-none transition-all duration-300
            font-black text-sm
            ${themes[variant]}
            ${error ? 'border-red-500 bg-red-50/50' : ''}
            ${isPassword ? 'pr-12' : ''}
            ${props.className || ''}
          `}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${variant === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-black'}`}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {error && <p className="text-[10px] text-red-600 font-bold ml-6 uppercase italic tracking-widest">{error}</p>}
    </div>
  );
};

export default Input;
