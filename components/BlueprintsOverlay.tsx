import React from 'react';

interface BlueprintsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const blueprintItems = [
  { id: '01', title: 'Atomic Typography Scale', desc: "Defines the fluid type scale for headers H1-H6 using 'Epilogue'." },
  { id: '02', title: 'Semantic Color Tokens', desc: "Establish the 'Architectural Minimalist' palette variables." },
  { id: '03', title: 'Navigation Sidebar', desc: "Vertical navigation structure with hover micro-interactions." },
  { id: '04', title: 'Data Table Architecture', desc: "Minimalist table for high-density financial data." },
  { id: '05', title: 'Form Input Fields', desc: "Standardized input styling with floating labels." },
  { id: '06', title: 'Button Component System', desc: "Primary, secondary, and tertiary button definitions." },
  { id: '07', title: 'Modal Dialog Overlay', desc: "Fullscreen focus interruption logic." },
  { id: '08', title: 'Grid Layout System', desc: "12-column responsive architectural grid." },
  { id: '09', title: 'Status Badge Taxonomy', desc: "Visual indicators for system health and validation." },
  { id: '10', title: 'Tooltip Micro-interactions', desc: "Contextual help popovers and delays." },
];

export const BlueprintsOverlay: React.FC<BlueprintsOverlayProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-off-white overflow-y-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="sticky top-0 bg-off-white/95 backdrop-blur-sm border-b border-border-hairline px-8 lg:px-24 py-6 flex justify-between items-center z-10">
        <div className="size-8 text-primary">
           <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 4L4 44H44L24 4Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="2.5"></path>
          </svg>
        </div>
        <button 
          onClick={onClose}
          className="group flex items-center gap-2 text-xs font-mono uppercase tracking-widest hover:text-primary transition-colors"
        >
          <span>Close Blueprints</span>
          <span className="material-symbols-outlined text-[18px] group-hover:rotate-90 transition-transform">close</span>
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-8 lg:px-12 py-16">
        {/* Title Block */}
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-4">
             <span className="px-2 py-0.5 border border-primary text-primary text-[9px] font-bold uppercase tracking-widest font-mono bg-primary/5">Restricted Access</span>
             <span className="text-[10px] font-mono text-charcoal-muted uppercase tracking-widest">Last Synced: Just Now</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-light tracking-tighter text-charcoal mb-6">
            Design System <span className="font-bold">Blueprints</span>
          </h1>
          <p className="max-w-2xl font-serif text-charcoal-muted text-lg leading-relaxed">
            A curated repository of generative design directives. These prompts serve as the architectural DNA for the Project X-01 interface, establishing rigid constraints for typography, layout spacing, and component behavior to ensure strict adherence to the validation platform's minimalist aesthetic.
          </p>
        </div>

        {/* Blueprint Grid */}
        <div className="grid gap-4">
          {blueprintItems.map((item) => (
            <div 
              key={item.id}
              className="group bg-white border border-border-hairline p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-sharp hover:border-primary/30 transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-6 lg:gap-12 flex-1">
                <span className="text-primary font-mono text-xs font-bold">{item.id}</span>
                <div>
                  <h3 className="font-bold text-charcoal text-sm uppercase tracking-wider mb-2">{item.title}</h3>
                  <p className="font-mono text-xs text-charcoal-muted">{item.desc}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-end">
                <button className="flex items-center gap-2 px-4 py-2 border border-border-hairline bg-off-white text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-colors group-hover:border-primary">
                  Copy
                  <span className="material-symbols-outlined text-[12px]">content_copy</span>
                </button>
                <button className="ml-4 p-2 text-charcoal-muted hover:text-primary transition-colors">
                   <span className="material-symbols-outlined text-[20px]">expand_more</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-20 py-12 border-t border-border-hairline text-center">
         <div className="flex justify-center gap-12 text-[10px] font-bold font-mono text-charcoal uppercase tracking-widest">
            <span>Project X-01</span>
            <span>Confidential & Proprietary</span>
            <span>Download All JSON</span>
         </div>
      </div>
    </div>
  );
};