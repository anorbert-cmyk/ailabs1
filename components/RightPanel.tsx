import React from 'react';

export interface SourceItem {
  source: string;
  title: string;
  url?: string;
  icon?: string;
}

interface RightPanelProps {
  sources?: SourceItem[];
}

export const RightPanel: React.FC<RightPanelProps> = ({ sources = [] }) => {
  return (
    // Changed: No longer hidden on mobile. Now displays as block everywhere, layout handled by parent flex container.
    <aside className="w-full lg:w-80 bg-off-white flex-shrink-0 lg:border-l border-t lg:border-t-0 border-border-hairline">
      <div className="lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] lg:overflow-y-auto p-6 lg:p-8 custom-scrollbar">
        
        {/* Cited Sources */}
        <div className="mb-12">
          <h3 className="text-xs font-bold uppercase tracking-widest text-charcoal mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">library_books</span>
            Cited Sources
          </h3>
          {sources.length === 0 ? (
            <p className="text-xs text-charcoal-muted font-mono italic">No sources cited for this phase.</p>
          ) : (
            <ul className="space-y-6">
              {sources.map((item, idx) => (
                <li key={idx} className="group cursor-pointer">
                  <a 
                    href={item.url || '#'} 
                    target={item.url ? "_blank" : "_self"}
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="flex items-start justify-between">
                      <div className="text-xs font-mono text-charcoal-muted group-hover:text-primary transition-colors">
                        <span className="block font-bold text-charcoal mb-1 group-hover:text-primary transition-colors">{item.source}</span>
                        {item.title}
                      </div>
                      <span className="material-symbols-outlined text-[14px] text-border-hairline group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 duration-300 hidden lg:inline-block">
                        {item.icon || 'arrow_outward'}
                      </span>
                      <span className="material-symbols-outlined text-[14px] text-primary lg:hidden">
                        {item.icon || 'arrow_outward'}
                      </span>
                    </div>
                    <div className="h-px bg-border-hairline w-full mt-3 group-hover:bg-primary/20 transition-colors duration-500 origin-left group-hover:scale-x-100"></div>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </aside>
  );
};