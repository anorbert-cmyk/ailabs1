import React, { useState } from 'react';

/**
 * PROJECT X-01 DESIGN SYSTEM LIBRARY
 * ----------------------------------
 * This library exports the atomic components used to construct the
 * validation reports.
 */

// --- 01. Typography ---

export const DSHeader: React.FC<{ 
  title: string; 
  subtitle?: string; 
  badge?: string;
  className?: string 
}> = ({ title, subtitle, badge, className = "" }) => (
  <div className={`mb-12 animate-in slide-in-from-bottom-4 duration-700 fade-in ${className}`}>
    {badge && (
      <span className="px-2 py-0.5 border border-primary text-primary text-[9px] font-bold uppercase tracking-widest font-mono bg-primary/5 mb-4 inline-block">
        {badge}
      </span>
    )}
    <h1 className="text-4xl lg:text-6xl font-light tracking-tighter text-charcoal mb-6 leading-[1.1]">
      {title}
    </h1>
    {subtitle && (
      <div className="text-xl font-serif italic text-charcoal-muted font-medium">
        {subtitle}
      </div>
    )}
  </div>
);

export const DSSectionHeader: React.FC<{ 
  number: string; 
  title: string; 
  id?: string 
}> = ({ number, title, id }) => (
  <h3 id={id} className="text-charcoal font-sans text-xl font-medium mb-4 mt-12 uppercase tracking-wide flex items-center gap-2 scroll-mt-32">
    <span className="text-primary text-sm font-mono">{number}.</span> {title}
  </h3>
);

export const DSParagraph: React.FC<{ 
  children: React.ReactNode; 
  isLead?: boolean 
}> = ({ children, isLead }) => (
  <p className={`mb-6 text-charcoal-muted leading-loose ${
    isLead 
      ? "first-letter:text-5xl first-letter:font-light first-letter:text-charcoal first-letter:float-left first-letter:mr-3 first-letter:mt-[-6px]" 
      : ""
  }`}>
    {children}
  </p>
);

export const DSList: React.FC<{
  items: string[];
  type?: 'bullet' | 'number';
}> = ({ items, type = 'bullet' }) => (
  <ul className={`mb-8 pl-4 space-y-3 text-charcoal-muted font-serif leading-relaxed ${type === 'bullet' ? 'list-disc' : 'list-decimal'}`}>
    {items.map((item, idx) => (
      <li key={idx} className="pl-2 marker:text-primary/50">
        {item}
      </li>
    ))}
  </ul>
);

export const DSBlockquote: React.FC<{ 
  children: React.ReactNode; 
  author?: string 
}> = ({ children, author }) => (
  <div className="my-8">
    <blockquote className="pl-6 border-l-2 border-primary italic text-charcoal text-xl font-light py-2 bg-gradient-to-r from-primary/5 to-transparent">
      "{children}"
    </blockquote>
    {author && <div className="pl-6 mt-2 text-xs font-mono font-bold text-primary uppercase tracking-widest">— {author}</div>}
  </div>
);

// --- 02. Data Display ---

export interface MetricRow {
  name: string;
  baseline: string;
  stress: string;
  variance: string;
}

export const DSMetricTable: React.FC<{ 
  title: string;
  subtitle?: string;
  data: MetricRow[];
}> = ({ title, subtitle, data }) => (
  <div className="my-12 border border-charcoal/10 shadow-sharp bg-white overflow-hidden">
    <div className="bg-off-white px-6 py-4 border-b border-charcoal/10 flex justify-between items-center flex-wrap gap-2">
      <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-charcoal">
        {title}
      </h4>
      {subtitle && <span className="font-mono text-[10px] text-charcoal-muted whitespace-nowrap">{subtitle}</span>}
    </div>
    
    {/* Desktop View */}
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-charcoal/10">
            <th className="py-4 px-6 text-xs font-bold font-sans text-charcoal uppercase tracking-wider w-1/4">Metric</th>
            <th className="py-4 px-6 text-xs font-mono font-medium text-charcoal-muted uppercase tracking-wider text-right">Baseline</th>
            <th className="py-4 px-6 text-xs font-mono font-medium text-primary uppercase tracking-wider text-right bg-primary/5">Projected</th>
            <th className="py-4 px-6 text-xs font-mono font-medium text-charcoal-muted uppercase tracking-wider text-right">Variance</th>
          </tr>
        </thead>
        <tbody className="font-mono text-xs text-charcoal">
          {data.map((row, idx) => (
            <tr key={idx} className="border-b border-charcoal/5 hover:bg-off-white transition-colors last:border-0">
              <td className="py-4 px-6 font-sans font-medium text-charcoal">{row.name}</td>
              <td className="py-4 px-6 text-right text-charcoal-muted">{row.baseline}</td>
              <td className="py-4 px-6 text-right font-bold text-primary bg-primary/5">{row.stress}</td>
              <td className={`py-4 px-6 text-right font-bold ${row.variance.startsWith('-') ? 'text-red-600' : 'text-emerald-600'}`}>{row.variance}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
     {/* Mobile Card View (Simplified) */}
    <div className="md:hidden">
      {data.map((row, idx) => (
        <div key={idx} className="p-6 border-b border-charcoal/10 bg-white">
           <div className="font-bold text-sm mb-2">{row.name}</div>
           <div className="flex justify-between text-xs font-mono text-charcoal-muted">
             <span>Var: <span className={row.variance.startsWith('-') ? 'text-red-600' : 'text-emerald-600'}>{row.variance}</span></span>
           </div>
        </div>
      ))}
    </div>
  </div>
);

// New Generic Table for "Assumption Ledger" and other structured data
export interface TableColumn {
  header: string;
  key: string;
  width?: string;
}

export const DSGenericTable: React.FC<{
  title: string;
  columns: TableColumn[];
  data: any[];
}> = ({ title, columns, data }) => (
  <div className="my-12 border border-charcoal/10 shadow-sharp bg-white overflow-hidden">
    <div className="bg-off-white px-6 py-4 border-b border-charcoal/10">
      <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-charcoal">{title}</h4>
    </div>
    
    {/* Desktop View */}
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-charcoal/10 bg-white">
            {columns.map((col, idx) => (
              <th key={idx} className={`py-4 px-6 text-[10px] font-bold font-mono text-charcoal-muted uppercase tracking-wider ${col.width || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="font-sans text-xs text-charcoal leading-relaxed">
          {data.map((row, rIdx) => (
            <tr key={rIdx} className="border-b border-charcoal/5 hover:bg-off-white/50 transition-colors last:border-0 align-top">
              {columns.map((col, cIdx) => (
                <td key={cIdx} className="py-4 px-6">
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Mobile Card View (Responsive Stack) */}
    <div className="md:hidden">
      {data.map((row, rIdx) => (
        <div key={rIdx} className="p-6 border-b border-charcoal/10 bg-white last:border-0 hover:bg-off-white/20 transition-colors">
          {columns.map((col, cIdx) => (
            <div key={cIdx} className="mb-4 last:mb-0">
               <span className="block text-[10px] font-bold font-mono text-charcoal-muted uppercase tracking-wider mb-1 opacity-70">
                 {col.header}
               </span>
               <div className="text-sm font-sans text-charcoal leading-relaxed">
                 {row[col.key]}
               </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

// --- 03. Badges & Indicators ---

export const DSStatusBadge: React.FC<{ 
  status: 'optimal' | 'warning' | 'critical' | 'neutral',
  text: string 
}> = ({ status, text }) => {
  const colors = {
    optimal: "bg-emerald-100 text-emerald-800 border-emerald-200",
    warning: "bg-amber-100 text-amber-800 border-amber-200",
    critical: "bg-rose-100 text-rose-800 border-rose-200",
    neutral: "bg-slate-100 text-slate-800 border-slate-200"
  };

  return (
    <span className={`px-2 py-1 border text-[10px] font-mono uppercase tracking-wide font-bold rounded-sm ${colors[status]}`}>
      {text}
    </span>
  );
};

// --- 04. Cards ---

export const DSInfoCard: React.FC<{
  title: string;
  children: React.ReactNode;
  icon?: string;
  subLabel?: string;
}> = ({ title, children, icon, subLabel }) => (
  <div className="p-6 bg-off-white border border-border-hairline hover:border-charcoal/20 transition-colors duration-300 h-full flex flex-col">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        {icon && <span className="material-symbols-outlined text-primary">{icon}</span>}
        <h4 className="font-sans font-bold text-sm text-charcoal uppercase tracking-wide">{title}</h4>
      </div>
      {subLabel && (
        <span className="text-[9px] font-mono text-primary bg-primary/5 px-2 py-1 rounded-sm uppercase tracking-wider">
          {subLabel}
        </span>
      )}
    </div>
    <div className="text-sm text-charcoal-muted font-mono leading-relaxed flex-1">
      {children}
    </div>
  </div>
);

// New Competitor Analysis Component
export interface CompetitorData {
  name: string;
  website: string;
  info: string;
  strengths: string[];
  weaknesses: string[];
  opportunity: string;
}

export const DSCompetitorAnalysis: React.FC<CompetitorData> = ({ name, website, info, strengths, weaknesses, opportunity }) => {
  return (
    <div className="mb-8 border border-border-hairline bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-off-white p-6 border-b border-border-hairline flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h3 className="font-sans font-bold text-xl text-charcoal">{name}</h3>
           <a href={website} target="_blank" rel="noreferrer" className="text-xs font-mono text-primary hover:underline">{website}</a>
        </div>
        <div className="text-xs text-charcoal-muted font-mono max-w-md text-right md:text-left">
          {info}
        </div>
      </div>
      
      {/* Body */}
      <div className="grid md:grid-cols-2">
        <div className="p-6 border-b md:border-b-0 md:border-r border-border-hairline">
           <h4 className="font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-700 mb-4 flex items-center gap-2">
             <span className="material-symbols-outlined text-sm">check_circle</span> UX Strengths
           </h4>
           <ul className="space-y-3">
             {strengths.map((item, idx) => (
               <li key={idx} className="text-xs text-charcoal-muted leading-relaxed pl-2 border-l-2 border-emerald-100">
                 {item}
               </li>
             ))}
           </ul>
        </div>
        <div className="p-6">
           <h4 className="font-mono text-[10px] font-bold uppercase tracking-widest text-rose-700 mb-4 flex items-center gap-2">
             <span className="material-symbols-outlined text-sm">cancel</span> UX Weaknesses
           </h4>
           <ul className="space-y-3">
             {weaknesses.map((item, idx) => (
               <li key={idx} className="text-xs text-charcoal-muted leading-relaxed pl-2 border-l-2 border-rose-100">
                 {item}
               </li>
             ))}
           </ul>
        </div>
      </div>
      
      {/* Footer: Opportunity */}
      <div className="p-6 bg-primary/5 border-t border-primary/10">
        <h4 className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">lightbulb</span> Key Differentiator Opportunity
        </h4>
        <p className="text-sm font-serif text-charcoal leading-relaxed">
          {opportunity}
        </p>
      </div>
    </div>
  )
};

// --- 05. Blueprints (New) ---

export interface BlueprintItem {
  id: string;
  title: string;
  description: string;
  prompt: string;
}

export const DSBlueprintCard: React.FC<BlueprintItem> = ({ id, title, description, prompt }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className={`group bg-white border border-border-hairline hover:shadow-sharp hover:border-primary/30 transition-all duration-300 mb-4 cursor-pointer overflow-hidden ${isOpen ? 'ring-1 ring-primary/20' : ''}`}
      onClick={() => setIsOpen(!isOpen)}
    >
      {/* Header Row */}
      <div className="p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6 lg:gap-12 flex-1">
          <span className="text-primary font-mono text-xs font-bold">{id}</span>
          <div>
            <h3 className="font-bold text-charcoal text-sm uppercase tracking-wider mb-2">{title}</h3>
            <p className="font-mono text-xs text-charcoal-muted">{description}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between md:justify-end w-full md:w-auto mt-4 md:mt-0">
          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 border border-border-hairline bg-off-white text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-colors group-hover:border-primary"
          >
            {copied ? 'Copied!' : 'Copy Prompt'}
            <span className="material-symbols-outlined text-[12px]">{copied ? 'check' : 'content_copy'}</span>
          </button>
          
          <button className="ml-4 p-2 text-charcoal-muted hover:text-primary transition-colors">
              <span className={`material-symbols-outlined text-[20px] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>expand_more</span>
          </button>
        </div>
      </div>

      {/* Expanded Content (The Markup) */}
      <div className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="border-t border-border-hairline bg-off-white/50 p-6 lg:p-8">
            <div className="relative">
              <div className="absolute top-0 right-0 px-2 py-1 bg-charcoal text-white text-[9px] font-mono uppercase tracking-widest rounded-bl-md opacity-50">
                Markdown
              </div>
              <pre className="font-mono text-xs text-charcoal-muted overflow-x-auto whitespace-pre-wrap leading-relaxed p-4 bg-white border border-border-hairline rounded-sm">
                {prompt}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};