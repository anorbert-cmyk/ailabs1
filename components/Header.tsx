import React, { useState } from 'react';

interface HeaderProps {
  currentPhase: number;
  setPhase: (phase: number) => void;
  toggleBlueprints?: () => void;
}

const phases = [
  "01: Discovery",
  "02: Tech Audit",
  "03: Market Fit",
  "04: Growth",
  "05: Scale",
  "06: Blueprints"
];

export const Header: React.FC<HeaderProps> = ({ currentPhase, setPhase }) => {
  
  return (
    <header className="h-20 px-4 lg:px-8 border-b border-border-hairline bg-off-white/95 backdrop-blur-sm sticky top-0 z-40 flex items-center justify-between">
      
      {/* Phase Navigation (Horizontal Scroll on Mobile) */}
      <nav className="flex-1 overflow-x-auto no-scrollbar mr-4">
        <div className="flex items-center gap-1">
          {phases.map((phase, idx) => {
            const isActive = currentPhase === idx;
            return (
              <button
                key={idx}
                onClick={() => setPhase(idx)}
                className={`whitespace-nowrap px-4 py-2 text-[10px] font-bold font-mono uppercase tracking-widest transition-all rounded-sm border ${
                  isActive 
                    ? 'bg-charcoal text-white border-charcoal shadow-sharp' 
                    : 'bg-transparent text-charcoal-muted border-transparent hover:bg-white hover:border-border-hairline'
                }`}
              >
                {phase}
              </button>
            )
          })}
        </div>
      </nav>

      <div className="flex items-center gap-3 pl-4 border-l border-border-hairline flex-shrink-0">
        {/* Action Buttons */}
        <button 
          title="Download JSON"
          className="size-9 flex items-center justify-center border border-border-hairline bg-white hover:bg-primary hover:text-white hover:border-primary transition-all active:scale-90"
        >
          <span className="material-symbols-outlined text-[18px]">data_object</span>
        </button>
        <button 
          title="Download PDF"
          className="size-9 flex items-center justify-center border border-border-hairline bg-white hover:bg-primary hover:text-white hover:border-primary transition-all active:scale-90"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
        </button>
      </div>
    </header>
  );
};