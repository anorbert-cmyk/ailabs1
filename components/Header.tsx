import React, { useState, useRef, useEffect } from 'react';

interface HeaderProps {
  viewMode: string;
  setViewMode: (mode: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ viewMode, setViewMode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleModeChange = (mode: string) => {
    setViewMode(mode);
    setIsMenuOpen(false);
  };

  return (
    <header className="h-20 px-8 lg:px-12 border-b border-border-hairline bg-off-white/95 backdrop-blur-sm sticky top-0 z-40 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <h1 className="text-sm font-bold uppercase tracking-widest text-charcoal hidden sm:block">Deep Research</h1>
        <span className="h-4 w-px bg-border-hairline hidden sm:block"></span>
        <p className="text-xs font-mono text-charcoal-muted truncate max-w-[150px] sm:max-w-none">
          Project X-01 / Validation Phase
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* Dropdown - Hidden on small screens */}
        <div className="relative hidden md:block" ref={menuRef}>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2 px-4 py-2 border border-border-hairline bg-white text-xs font-mono font-medium hover:border-primary hover:text-primary transition-all active:scale-95"
          >
            <span className="hidden sm:inline">View: {viewMode}</span>
            <span className="sm:hidden">View</span>
            <span className="material-symbols-outlined text-[14px]">expand_more</span>
          </button>
          
          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-border-hairline shadow-sharp z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="py-1">
                {['Academic Layout', 'Data Grid View', 'Presentation Mode'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => handleModeChange(mode)}
                    className={`block w-full text-left px-4 py-2 text-xs font-mono transition-colors ${
                      viewMode === mode 
                        ? 'text-primary bg-primary/5' 
                        : 'text-charcoal hover:bg-off-white'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <button 
          title="Download PDF"
          className="size-8 flex items-center justify-center border border-border-hairline bg-white hover:bg-primary hover:text-white hover:border-primary transition-all active:scale-90"
        >
          <span className="material-symbols-outlined text-[16px]">download</span>
        </button>
        <button 
          title="Share"
          className="size-8 flex items-center justify-center border border-border-hairline bg-white hover:bg-primary hover:text-white hover:border-primary transition-all active:scale-90"
        >
          <span className="material-symbols-outlined text-[16px]">share</span>
        </button>
      </div>
    </header>
  );
};