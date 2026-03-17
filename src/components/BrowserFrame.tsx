import React from 'react';
import { Viewport } from '../core/domain/Componente';

interface BrowserFrameProps {
  children: React.ReactNode;
  viewport?: Viewport;
}

export function BrowserFrame({ children, viewport = 'desktop' }: BrowserFrameProps) {
  // Mobile Frame (iOS-inspired)
  if (viewport === 'mobile') {
    return (
      <div className="mx-auto relative border-[8px] border-slate-900 rounded-[3rem] bg-slate-900 shadow-2xl overflow-hidden h-[736px] w-[414px] flex flex-col">
        {/* Status Bar / Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-50 flex items-center justify-center">
          <div className="w-10 h-1 bg-slate-800 rounded-full"></div>
        </div>
        
        {/* Screen Content */}
        <div className="flex-1 bg-white rounded-[2.2rem] overflow-auto mt-2 relative pointer-events-auto">
          {children}
        </div>
        
        {/* Home Indicator */}
        <div className="h-6 w-full flex items-center justify-center bg-slate-900">
          <div className="w-24 h-1 bg-slate-700 rounded-full"></div>
        </div>
      </div>
    );
  }

  // Tablet Frame
  if (viewport === 'tablet') {
    return (
      <div className="mx-auto relative border-[12px] border-slate-800 rounded-[2rem] bg-slate-800 shadow-2xl overflow-hidden h-[1024px] w-[768px] flex flex-col">
        {/* Camera Dot */}
        <div className="h-6 w-full flex items-center justify-center bg-slate-800">
           <div className="w-2 h-2 rounded-full bg-slate-700"></div>
        </div>

        {/* Screen Content */}
        <div className="flex-1 bg-white rounded-[0.5rem] overflow-auto relative pointer-events-auto">
          {children}
        </div>

        {/* Bottom Bar */}
        <div className="h-6 w-full bg-slate-800"></div>
      </div>
    );
  }


  // Desktop / Default Frame
  return (
    <div className="w-full flex-1 flex flex-col rounded-xl overflow-hidden shadow-2xl bg-white border border-gray-200">
      {/* Browser Header / Titlebar */}
      <div className="h-10 bg-gray-100 flex items-center px-4 border-b border-gray-200 shrink-0">
        
        {/* Left: Window Controls */}
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-amber-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
        </div>

        {/* Center: Fake URL Bar */}
        <div className="flex-1 flex justify-center px-4">
          <div className="bg-white px-24 py-1.5 rounded-md text-xs text-gray-400 font-medium flex items-center shadow-sm w-full max-w-sm justify-center space-x-2 relative">
             <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span>https://meusite.com</span>
          </div>
        </div>

        {/* Right: Actions / Settings icon */}
        <div className="flex items-center space-x-2 text-gray-400">
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="hover:text-gray-600 cursor-pointer">
            <path d="M12 2v20"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </div>
      </div>

      {/* Browser Viewport (Artboard content goes here) */}
      <div className="flex-1 relative overflow-auto">
        {children}
      </div>
    </div>
  );
}

