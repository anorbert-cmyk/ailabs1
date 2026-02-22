import React from 'react';

interface HeaderProps {
  currentPhase: number;
  setPhase: (phase: number) => void;
  toggleBlueprints?: () => void;
}

const phases = [
  "01: Discovery",
  "02: Tech Audit",
  "03: Timeline",
  "04: Core Design",
  "05: Scale",
  "06: Risk & ROI"
];

export const Header: React.FC<HeaderProps> = ({ currentPhase, setPhase }) => {
  return (
    <header className="h-16 lg:h-20 px-4 lg:px-8 bg-white/95 backdrop-blur-md border-b border-charcoal/10 sticky top-0 z-50 flex items-center justify-between shadow-sm transition-all duration-200">
      
      {/* Navigation - Scrollable on Mobile */}
      <nav className="flex-1 overflow-x-auto no-scrollbar w-full mask-linear-fade">
        <div className="flex items-center gap-2 min-w-max pr-4">
          {phases.map((phase, idx) => {
            const isActive = currentPhase === idx;
            return (
              <button
                key={idx}
                onClick={() => setPhase(idx)}
                className={`
                  relative px-3 lg:px-4 py-2 lg:py-2 text-[10px] lg:text-[11px] font-bold font-mono uppercase tracking-widest rounded-sm transition-all duration-200 border whitespace-nowrap
                  ${isActive 
                    ? 'bg-charcoal text-white border-charcoal shadow-md translate-y-0' 
                    : 'bg-transparent text-charcoal-muted border-transparent hover:bg-charcoal/5 hover:text-charcoal'
                  }
                `}
              >
                {phase}
              </button>
            )
          })}
        </div>
      </nav>

      <div className="flex items-center gap-1 lg:gap-2 pl-2 lg:pl-4 border-l border-charcoal/10 flex-shrink-0 bg-white">
        <button 
          title="Export Data"
          className="size-8 lg:size-9 flex items-center justify-center rounded-sm border border-transparent hover:border-charcoal/10 hover:bg-off-white text-charcoal-muted transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">data_object</span>
        </button>
        <button 
          title="Download PDF"
          className="size-8 lg:size-9 flex items-center justify-center rounded-sm border border-transparent hover:border-charcoal/10 hover:bg-off-white text-charcoal-muted transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
        </button>
      </div>
    </header>
  );
};