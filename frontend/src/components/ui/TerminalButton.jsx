
const TerminalButton = ({ children, onClick, variant = 'primary', disabled = false, icon: Icon }) => {
  const variants = {
    primary: "bg-blue-600 border-blue-500 shadow-blue-900/20 text-white",
    success: "bg-green-600 border-green-500 shadow-green-900/20 text-white",
    warning: "bg-yellow-500 border-yellow-400 shadow-yellow-900/20 text-black",
    danger: "bg-red-600 border-red-500 shadow-red-900/20 text-white",
    ghost: "bg-white/5 border-white/10 text-gray-400"
  };

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`
        relative w-full aspect-square md:aspect-video rounded-xl border-b-[4px] 
        flex flex-col items-center justify-center gap-2 transition-all
        active:border-b-0 active:translate-y-[2px] disabled:opacity-30 disabled:grayscale
        ${variants[variant]}
      `}
    >
      {Icon && <Icon size={24} strokeWidth={2.5} />}
      <span className="text-base font-black uppercase italic tracking-tighter">
        {children}
      </span>
    </button>
  );
};

export default TerminalButton;
