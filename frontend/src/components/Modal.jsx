
// import { useState } from 'react';

export default function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex place-items-start justify-end gap-2 pt-6 pr-6 md:pr-[14.4rem] bg-black bg-opacity-50">
      <div className="bg-white/30 rounded-[2.5rem] backdrop-blur-xl z-40 place-content mr-120px w-auto md:max-w-4xl pl-4 py-2 shadow-lg">
        <div className="flex justify-between place-items-start pb-3">
          <div className="grid grid-cols-1 gap-2 pt-3 pr-4 text-gray-600">
            {children || 'This is where your modal content goes.'}
          </div>
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-12 h-12 md:w-16 md:h-16 bg-black rounded-full border-2 border-white/50 flex flex-col items-center justify-center gap-1.5 shadow-lg active:scale-90 transition-transform"
        aria-label="Close modal"
      >
        {/* <div className="font-bold text-white text-lg">X</div> */}
        <div className="relative flex w-8 h-8 cursor-pointer place-items-center">
          <div className="absolute left-0 w-full h-1 rounded-full bg-white rotate-45"></div>
          <div className="absolute left-0 w-full h-1 rounded-full bg-white -rotate-45"></div>
        </div>
        {/* <div className="w-6 h-1 bg-white rounded-full"></div>
        <div className="w-6 h-1 bg-white rounded-full"></div>
        <div className="w-6 h-1 bg-white rounded-full"></div> */}
      </button>
    </div>
  );
}