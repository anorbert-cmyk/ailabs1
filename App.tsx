import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Article } from './components/Article';
import { RightPanel } from './components/RightPanel';

export default function App() {
  const [activeSection, setActiveSection] = useState<string>('01');
  const [viewMode, setViewMode] = useState<string>('Academic Layout');

  useEffect(() => {
    // Scroll Spy Logic
    const observerOptions = {
      root: null, // viewport
      rootMargin: '-30% 0px -50% 0px', // Trigger when section is in the middle third of screen
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          if (id && id.startsWith('section-')) {
            setActiveSection(id.replace('section-', ''));
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const sections = document.querySelectorAll('section[id^="section-"]');
    
    // Fallback if sections aren't mounted yet (unlikely in this structure but safe)
    if (sections.length > 0) {
      sections.forEach((section) => observer.observe(section));
    } else {
      // Retry briefly if needed for initial render timing
      setTimeout(() => {
        document.querySelectorAll('section[id^="section-"]').forEach((section) => observer.observe(section));
      }, 100);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex min-h-screen bg-off-white text-charcoal font-sans selection:bg-technical-blue selection:text-primary">
      {/* Fixed Left Navigation */}
      <Sidebar activeSection={activeSection} />

      {/* Main Content Area */}
      <main className="flex-1 ml-0 lg:ml-24 min-h-screen flex flex-col relative">
        <Header viewMode={viewMode} setViewMode={setViewMode} />
        
        <div className="flex-1 flex flex-col lg:flex-row">
          {/* Scrollable Article Content */}
          <div className="flex-1 bg-white min-w-0"> {/* min-w-0 prevents flex child overflow */}
            <Article />
          </div>

          {/* Fixed/Sticky Right Panel for Desktop */}
          <RightPanel />
        </div>
      </main>
    </div>
  );
}