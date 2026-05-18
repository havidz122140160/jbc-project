
const Button = ({ children, onClick, className = '', variant = 'primary', disabled = false, type = 'button' }) => {
  const baseStyles = "px-4 py-2.5 rounded-xl font-black italic uppercase transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-xl border text-sm";
  
  const variants = {
    primary: "bg-black text-white border-black hover:bg-gray-900",
    secondary: "bg-white/60 text-black border-white hover:bg-white/80 backdrop-blur-md",
    danger: "bg-red-600 text-white border-red-700 hover:bg-red-700",
    outline: "bg-transparent border-2 border-black text-black hover:bg-black hover:text-white"
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
