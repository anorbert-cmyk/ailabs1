import React from 'react';

interface SidebarProps {
  activeSection: string;
  sectionIds: string[];
}

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, sectionIds }) => {
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, item: string) => {
    e.preventDefault();
    const element = document.getElementById(`section-${item}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      // Update URL hash without forcing a jump, preserving history state
      try {
        window.history.pushState(null, '', `#section-${item}`);
      } catch (err) {
        // Silently fail in sandboxed environments (e.g. iframes/blobs) where pushState is restricted
      }
    }
  };

  const handleLogoClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Remove hash when scrolling to top
    try {
      window.history.pushState(null, '', window.location.pathname);
    } catch (err) {
      // Silently fail in sandboxed environments
    }
  };

  return (
    <aside className="hidden lg:flex w-24 fixed h-screen top-0 left-0 border-r border-border-hairline bg-off-white z-50 flex-col items-center py-6 justify-between">
      {/* Logo / Home Icon */}
      <div 
        className="size-8 text-primary cursor-pointer hover:scale-110 transition-transform duration-300 flex-shrink-0" 
        onClick={handleLogoClick}
      >
        <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 4L4 44H44L24 4Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="2.5"></path>
        </svg>
      </div>

      {/* Navigation Links - Scrollable if content exceeds height */}
      <nav className="flex flex-col gap-4 text-[10px] font-bold font-mono text-charcoal-muted my-4 overflow-y-auto no-scrollbar w-full items-center">
        {sectionIds.map((item) => {
          const isActive = item === activeSection;

          return (
            <a 
              key={item} 
              href={`#section-${item}`} 
              onClick={(e) => handleNavClick(e, item)}
              className={`hover:text-primary transition-colors flex flex-col items-center gap-1 group py-1 ${isActive ? 'text-primary' : ''}`}
            >
              <span className={`transition-transform duration-300 ${isActive ? 'translate-x-1' : 'group-hover:-translate-y-1'}`}>
                {item}
              </span>
              <div 
                className={`w-px transition-all duration-300 ${isActive ? 'bg-primary h-8' : 'h-4 bg-border-hairline group-hover:bg-primary group-hover:h-6'}`} 
              />
            </a>
          );
        })}
      </nav>

      {/* Vertical Version Text */}
      <div className="writing-vertical-rl text-[9px] uppercase tracking-widest text-charcoal-muted opacity-50 rotate-180 select-none flex-shrink-0">
        v2.4.0 Deep Research
      </div>
    </aside>
  );
};