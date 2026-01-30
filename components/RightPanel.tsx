import React from 'react';

export const RightPanel: React.FC = () => {
  return (
    <aside className="w-full lg:w-80 bg-off-white flex-shrink-0 border-l border-border-hairline hidden lg:block">
      <div className="sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto p-8 custom-scrollbar">
        
        {/* Cited Sources */}
        <div className="mb-12">
          <h3 className="text-xs font-bold uppercase tracking-widest text-charcoal mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">library_books</span>
            Cited Sources
          </h3>
          <ul className="space-y-6">
            {[
              { source: 'Journal of Finance, Vol 45', title: '"Microstructure Noise in HFT"', icon: 'arrow_outward' },
              { source: 'IEEE Transactions on AI', title: '"GANs for FinTech Simulation"', icon: 'arrow_outward' },
              { source: 'Internal Memo 882', title: '"Risk Assessment Q3"', icon: 'lock' },
              { source: 'SEC Filing 10-K', title: '"Market Structure Analysis 2022"', icon: 'arrow_outward' },
              { source: 'ArXiv Pre-print', title: '"Adversarial Attacks on Algo-Trading"', icon: 'arrow_outward' },
              { source: 'Goldman Sachs Research', title: '"The Future of Liquidity"', icon: 'lock' },
              { source: 'Nature Machine Intelligence', title: '"Reinforcement Learning in Finance"', icon: 'arrow_outward' },
              { source: 'Internal Code Review', title: '"Project X-01 Post-Mortem"', icon: 'lock' },
              { source: 'Bloomberg Terminal Data', title: '"Tick-by-Tick Export: Flash Crash"', icon: 'download' },
              { source: 'Regulation NMS', title: '"Section 610: Access to Markets"', icon: 'gavel' },
            ].map((item, idx) => (
              <li key={idx} className="group cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="text-xs font-mono text-charcoal-muted group-hover:text-primary transition-colors">
                    <span className="block font-bold text-charcoal mb-1 group-hover:text-primary transition-colors">{item.source}</span>
                    {item.title}
                  </div>
                  <span className="material-symbols-outlined text-[14px] text-border-hairline group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 duration-300">
                    {item.icon}
                  </span>
                </div>
                <div className="h-px bg-border-hairline w-full mt-3 group-hover:bg-primary/20 transition-colors duration-500 origin-left group-hover:scale-x-100"></div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
};