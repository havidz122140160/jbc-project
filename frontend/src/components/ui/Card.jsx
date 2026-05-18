
const Card = ({ children, className = '', hover = false, onClick }) => {
  const isCustomBg = className.includes('bg-');

  return (
    <div 
      onClick={onClick}
      className={`
      ${!isCustomBg ? 'bg-white/60 backdrop-blur-xl' : 'backdrop-blur-xl'} 
      border border-white/10 rounded-2xl p-4 shadow-sm
      ${hover ? 'hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};

export default Card;
