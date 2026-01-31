import React, { useState, useRef } from 'react';

// --- 01. Typography ---

export const DSHeader: React.FC<{ 
  title: string; 
  subtitle?: string; 
  badge?: string;
  className?: string 
}> = ({ title, subtitle, badge, className = "" }) => (
  <div className={`animate-in slide-in-from-bottom-4 duration-700 fade-in ${className}`}>
    {badge && (
      <span className="px-2 py-0.5 border border-primary text-primary text-[9px] font-bold uppercase tracking-widest font-mono bg-primary/5 mb-4 inline-block">
        {badge}
      </span>
    )}
    <h1 className="text-4xl lg:text-6xl font-light tracking-tighter text-charcoal mb-6 leading-[1.1] break-words">
      {title}
    </h1>
    {subtitle && (
      <div className="text-lg lg:text-xl font-serif italic text-charcoal-muted font-medium max-w-3xl">
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
  <h3 id={id} className="text-charcoal font-sans text-xl font-medium mb-6 mt-16 uppercase tracking-wide flex items-center gap-2 scroll-mt-32">
    <span className="text-primary text-sm font-mono">{number}.</span> {title}
  </h3>
);

export const DSParagraph: React.FC<{ 
  children: React.ReactNode; 
  isLead?: boolean 
}> = ({ children, isLead }) => (
  <p className={`mb-6 text-charcoal-muted leading-8 text-[16px] lg:text-[17px] font-serif ${
    isLead 
      ? "first-letter:text-5xl first-letter:font-light first-letter:text-charcoal first-letter:float-left first-letter:mr-3 first-letter:mt-[-8px]" 
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
  <div className="my-10">
    <blockquote className="pl-6 border-l-2 border-primary italic text-charcoal text-xl font-light py-4 bg-gradient-to-r from-primary/5 to-transparent">
      "{children}"
    </blockquote>
    {author && <div className="pl-6 mt-3 text-xs font-mono font-bold text-primary uppercase tracking-widest">— {author}</div>}
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
    
    <div className="overflow-x-auto">
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
  </div>
);

// --- 03. Badges ---

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

// --- 05. Competitor Analysis ---

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
      <div className="bg-off-white p-6 border-b border-border-hairline flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h3 className="font-sans font-bold text-xl text-charcoal">{name}</h3>
           <a href={website} target="_blank" rel="noreferrer" className="text-xs font-mono text-primary hover:underline">{website}</a>
        </div>
        <div className="text-xs text-charcoal-muted font-mono max-w-md text-right md:text-left">
          {info}
        </div>
      </div>
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

// --- 06. Visual Timeline ---

export interface TimelineQuarter {
  id: string;
  title: string;
  months: string[];
  status: 'active' | 'completed' | 'upcoming';
}

export interface VisualTimelineData {
  title: string;
  subtitle: string;
  quarters: TimelineQuarter[];
  context?: {
    title: string;
    rejected: string;
    adopted: string;
  }
}

export const DSVisualTimeline: React.FC<VisualTimelineData> = ({ title, subtitle, quarters, context }) => {
  return (
    <div className="animate-in fade-in duration-700">
        <div className="mb-12 border-l-4 border-red-500 pl-6">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-red-500 mb-2 block">/// Fiscal Timeline</span>
            <h1 className="text-4xl lg:text-7xl font-light tracking-tighter text-charcoal mb-4 leading-[1.1]">{title}</h1>
            <p className="text-xs lg:text-sm font-mono text-charcoal-muted max-w-2xl lg:text-right lg:ml-auto">{subtitle}</p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
            {context && (
                <div className="lg:col-span-3 border border-charcoal p-6 bg-white shadow-sharp h-full">
                    <div className="mb-2 border-l-2 border-red-500 pl-2">
                        <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-red-500">Behind the Decision</span>
                    </div>
                    <h3 className="font-serif italic text-2xl text-charcoal mb-6">{context.title}</h3>
                    <div className="mb-6 opacity-50 grayscale">
                        <div className="flex items-center gap-2 mb-2">
                             <span className="material-symbols-outlined text-[14px] text-charcoal">close</span>
                             <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-charcoal decoration-line-through">Accepted: Linear Growth</span>
                        </div>
                        <p className="text-[10px] text-charcoal leading-relaxed">{context.rejected}</p>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                             <span className="material-symbols-outlined text-[14px] text-red-500">check</span>
                             <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-charcoal">Adopted: Exponential Velocity</span>
                        </div>
                        <p className="text-[10px] text-charcoal leading-relaxed">{context.adopted}</p>
                    </div>
                </div>
            )}
            <div className="lg:col-span-9 flex flex-col justify-center h-full min-h-[300px]">
                <div className="w-full overflow-x-auto pb-4 lg:pb-0">
                    <div className="grid grid-cols-3 w-full min-w-[600px] lg:min-w-0">
                         {quarters.map((q, i) => (
                             <div key={i} className={`relative border-l ${i === 0 ? 'border-charcoal' : 'border-charcoal/20'} ${i === 2 ? 'border-r border-charcoal/20' : ''} h-48`}>
                                <div className="absolute top-0 left-0 p-4 flex items-baseline gap-3">
                                    <span className="bg-charcoal text-white font-mono font-bold text-sm px-2 py-1">{q.id}</span>
                                    <span className="font-serif italic text-xl text-charcoal">{q.title}</span>
                                </div>
                                <div className="absolute top-1/2 left-0 w-full h-px bg-charcoal flex items-center justify-around">
                                    {q.months.map((m, mi) => (
                                        <div key={mi} className="relative group">
                                            <div className={`size-3 rounded-full border-2 border-charcoal bg-white z-10 hover:bg-red-500 hover:border-red-500 transition-colors cursor-pointer ${mi === 2 && q.id === 'Q2' ? 'bg-red-500 border-red-500 animate-pulse' : ''}`}></div>
                                            <span className="absolute top-6 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold uppercase tracking-widest text-charcoal-muted whitespace-nowrap opacity-60 group-hover:opacity-100 group-hover:text-red-500 transition-all">{m}</span>
                                        </div>
                                    ))}
                                </div>
                             </div>
                         ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

// --- 07. Roadmap Phase (Layout for Timeline) ---

export interface RoadmapObjective {
  type: string;
  content: string;
}

export interface RoadmapDeliverable {
  title: string;
  items: string[];
}

export interface RoadmapDecision {
  title: string;
  stakeholders: string;
  deadline: string;
  criteria: string;
}

export interface RoadmapPhaseData {
  phase: string;
  timeline: string;
  objectives: RoadmapObjective[];
  deliverables: RoadmapDeliverable[];
  decisions: RoadmapDecision[];
}

export const DSRoadmapPhase: React.FC<RoadmapPhaseData> = ({ phase, timeline, objectives, deliverables, decisions }) => (
  <div className="mb-24 border-b border-charcoal/10 pb-12 last:border-0 last:mb-0 last:pb-0">
    <div className="mb-8 border-l-4 border-charcoal pl-6">
      <h2 className="text-3xl font-light tracking-tight text-charcoal mb-2">{phase}</h2>
      <span className="font-mono text-xs uppercase tracking-widest text-charcoal-muted bg-off-white px-2 py-1 rounded inline-block border border-border-hairline">{timeline}</span>
    </div>
    <div className="grid md:grid-cols-2 gap-8 mb-12 bg-off-white p-6 border border-border-hairline">
      {objectives.map((obj, idx) => (
        <div key={idx} className="">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary block mb-2">{obj.type} Objective</span>
          <p className="text-sm font-serif text-charcoal leading-relaxed">{obj.content}</p>
        </div>
      ))}
    </div>
    <div className="grid lg:grid-cols-12 gap-12">
      <div className="lg:col-span-7">
        <h3 className="font-sans font-bold text-sm uppercase tracking-wider text-charcoal mb-6 flex items-center gap-2 border-b border-charcoal/10 pb-2">
          <span className="material-symbols-outlined text-[18px]">assignment</span>
          Key Deliverables
        </h3>
        <div className="space-y-6">
          {deliverables.map((del, idx) => (
            <div key={idx} className="group">
              <h4 className="font-bold text-charcoal text-sm mb-2 flex items-start gap-3">
                <span className="text-charcoal-muted text-[10px] mt-0.5 font-mono border border-charcoal/20 px-1.5 rounded-sm">{idx + 1}</span>
                {del.title}
              </h4>
              <ul className="pl-9 space-y-1.5">
                {del.items.map((item, i) => (
                  <li key={i} className="text-xs text-charcoal-muted font-mono leading-relaxed relative pl-3 before:content-[''] before:absolute before:left-0 before:top-2 before:w-1 before:h-1 before:bg-charcoal/20 before:rounded-full">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="lg:col-span-5">
        <h3 className="font-sans font-bold text-sm uppercase tracking-wider text-rose-600 mb-6 flex items-center gap-2 border-b border-rose-100 pb-2">
          <span className="material-symbols-outlined text-[18px]">crisis_alert</span>
          Critical Decision Points
        </h3>
        <div className="space-y-6">
          {decisions.map((dec, idx) => (
            <div key={idx} className="bg-rose-50/50 border border-rose-100 p-5 rounded-sm hover:border-rose-300 transition-colors">
              <h4 className="font-bold text-charcoal text-sm mb-3">{dec.title}</h4>
              <div className="flex flex-col gap-2 mb-3">
                <div className="flex justify-between items-center border-b border-rose-100 pb-2">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-charcoal-muted">Deadline</span>
                  <span className="text-xs font-bold text-charcoal">{dec.deadline}</span>
                </div>
                <div className="flex justify-between items-center pb-1">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-charcoal-muted">Stakeholders</span>
                  <span className="text-xs text-charcoal text-right">{dec.stakeholders}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-rose-100">
                <span className="font-bold text-rose-600 block mb-1 uppercase text-[9px] font-mono">Criteria</span>
                <p className="text-[11px] text-charcoal-muted leading-relaxed italic">
                  {dec.criteria}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// --- 07b. Phase Card (Layout for Risk Section) ---

export interface PhaseCardData {
  id: string;
  title: string;
  subtitle: string;
  timeline: string;
  focus: string;
  status: 'CRITICAL' | 'MODERATE' | 'LOW';
  deliverables: string[];
  criteria: string[];
  dependencies: string;
  touchpoints: string;
  risk: {
    name: string;
    mitigation: string;
  }
}

export const DSPhaseCard: React.FC<PhaseCardData> = ({ 
  id, 
  title, 
  subtitle, 
  timeline, 
  focus, 
  status, 
  deliverables, 
  criteria, 
  dependencies, 
  touchpoints, 
  risk 
}) => {
  const statusColors = {
    'CRITICAL': 'text-rose-700 bg-rose-50 border-rose-200',
    'MODERATE': 'text-amber-700 bg-amber-50 border-amber-200',
    'LOW': 'text-emerald-700 bg-emerald-50 border-emerald-200'
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 border-b border-charcoal/10 py-16 lg:py-24 last:border-0">
      <div className="lg:w-1/3 flex-shrink-0">
        <div className="inline-block px-3 py-1 border border-charcoal text-[10px] font-mono font-bold uppercase tracking-widest mb-6">
          {id}
        </div>
        <h2 className="text-4xl lg:text-5xl font-serif text-charcoal mb-4 leading-tight">{title}</h2>
        <div className="text-lg font-serif italic text-charcoal-muted mb-10 leading-relaxed">
          {subtitle}
        </div>
        <div className="space-y-3 font-mono text-[10px] uppercase tracking-widest text-charcoal-muted border-t border-charcoal/10 pt-6">
          <div className="flex items-baseline justify-between">
            <span className="opacity-50">Impact:</span>
            <span className="font-bold text-charcoal">{timeline}</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="opacity-50">Focus:</span>
            <span className="font-bold text-charcoal text-right">{focus}</span>
          </div>
          <div className="flex items-baseline justify-between pt-2">
            <span className="opacity-50">Risk Score:</span>
            <span className={`px-2 py-0.5 border rounded-sm font-bold ${statusColors[status] || statusColors['LOW']}`}>
              {status}
            </span>
          </div>
        </div>
      </div>
      <div className="lg:w-2/3 flex flex-col">
        <div className="grid md:grid-cols-2 gap-12 mb-16 flex-grow">
          <div>
            <h4 className="font-mono text-[10px] font-bold uppercase tracking-widest text-charcoal mb-6 border-b border-charcoal pb-2">
              Risk Factors (Vectors)
            </h4>
            <ul className="space-y-4">
              {deliverables.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm font-serif text-charcoal-muted leading-relaxed">
                  <span className="material-symbols-outlined text-[16px] text-rose-600 flex-shrink-0 mt-0.5">warning</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-mono text-[10px] font-bold uppercase tracking-widest text-charcoal mb-6 border-b border-charcoal pb-2">
              Mitigation Strategies
            </h4>
            <ul className="space-y-4">
              {criteria.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm font-serif text-charcoal-muted leading-relaxed">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600 flex-shrink-0 mt-0.5">verified_user</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-dashed border-charcoal/30 pt-8 mt-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="border-l-2 border-transparent pl-0 md:pl-0">
              <span className="block text-[9px] font-bold font-mono uppercase tracking-widest text-charcoal-muted mb-2">Owner</span>
              <p className="text-xs font-serif text-charcoal leading-relaxed opacity-80">{dependencies}</p>
            </div>
            <div className="border-l-2 border-transparent md:border-charcoal/10 pl-0 md:pl-4">
              <span className="block text-[9px] font-bold font-mono uppercase tracking-widest text-charcoal-muted mb-2">Likelihood</span>
              <p className="text-xs font-serif text-charcoal leading-relaxed opacity-80">{touchpoints}</p>
            </div>
            <div className="border-l-2 border-red-500 pl-4 bg-red-50/50 -my-4 py-4 md:bg-transparent md:py-0 md:my-0">
              <span className="block text-[9px] font-bold font-mono uppercase tracking-widest text-red-600 mb-2">Key Contingency Plan</span>
              <div className="text-xs font-serif text-charcoal leading-relaxed">
                <span className="font-bold block mb-1 text-red-800">"{risk.name}"</span>
                <span className="italic text-charcoal-muted">{risk.mitigation}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 08. Strategy Grid ---

export interface PhaseDetail {
  id: string;
  title: string;
  summary: string;
  deepDive: { title: string; content: string };
  deliverables: string[];
  decision: string;
  dependencies: string;
  team: string;
}

export const DSStrategyGrid: React.FC<{ phases: PhaseDetail[], mode?: 'grid' | 'list' }> = ({ phases, mode = 'grid' }) => (
  <div className={`
    ${mode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-3 border-l border-border-hairline mb-16 bg-white' : 'flex flex-col gap-8 mb-16'}
  `}>
    {phases.map((p, idx) => (
      <div 
        key={p.id} 
        className={`
          ${mode === 'grid' 
            ? 'border-r border-b border-border-hairline p-8 flex flex-col group hover:bg-off-white/30 transition-colors' 
            : 'border border-border-hairline bg-white p-8 hover:shadow-sharp transition-all group'
          }
        `}
      >
        {mode === 'grid' ? (
          <>
            <div className="mb-6">
              <span className="px-2 py-1 border border-charcoal/20 text-[9px] font-mono uppercase tracking-widest mb-4 inline-block">{p.id}</span>
              <h3 className="font-serif text-3xl italic text-charcoal mb-6">{p.title}</h3>
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-charcoal-muted block mb-2">Executive Summary</span>
              <p className="text-xs text-charcoal-muted leading-relaxed mb-8">{p.summary}</p>
            </div>
            <div className="mb-8">
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-charcoal-muted block mb-2">Deep Dive: {p.deepDive.title}</span>
              <p className="text-[11px] text-charcoal leading-relaxed font-mono opacity-80">{p.deepDive.content}</p>
            </div>
            <div className="mb-8 flex-1">
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-charcoal-muted block mb-3">Key Deliverables</span>
              <ul className="space-y-2">
                {p.deliverables.map((d, i) => (
                  <li key={i} className="flex items-start gap-2 text-[10px] text-charcoal font-medium">
                    <span className="w-2 h-px bg-red-500 mt-1.5 flex-shrink-0"></span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mb-6 pt-6 border-t border-border-hairline border-dashed">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-[14px] text-charcoal">crisis_alert</span>
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-charcoal">Critical Decision Point</span>
              </div>
              <p className="text-[10px] text-charcoal-muted italic">{p.decision}</p>
            </div>
            <div className="space-y-3 pt-4 border-t border-border-hairline">
              <div className="flex gap-2">
                  <span className="material-symbols-outlined text-[12px] text-charcoal-muted">hub</span>
                  <div className="text-[9px] text-charcoal-muted">
                    <span className="font-bold block text-[8px] uppercase tracking-wider mb-0.5">Dependencies</span>
                    {p.dependencies}
                  </div>
              </div>
              <div className="flex gap-2">
                  <span className="material-symbols-outlined text-[12px] text-charcoal-muted">groups</span>
                  <div className="text-[9px] text-charcoal-muted">
                    <span className="font-bold block text-[8px] uppercase tracking-wider mb-0.5">Team Collaboration</span>
                    {p.team}
                  </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
             <div className="lg:w-1/4">
                <div className="flex items-center gap-4 mb-4">
                   <span className="px-2 py-1 bg-charcoal text-white text-[9px] font-mono uppercase tracking-widest">{p.id}</span>
                   <h3 className="font-serif text-2xl italic text-charcoal">{p.title}</h3>
                </div>
                <div className="mb-4">
                   <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-charcoal-muted block mb-1">Deep Dive: {p.deepDive.title}</span>
                   <p className="text-[10px] text-charcoal leading-relaxed font-mono opacity-80">{p.deepDive.content}</p>
                </div>
             </div>
             <div className="lg:w-1/4 border-l border-border-hairline pl-0 lg:pl-8">
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-charcoal-muted block mb-3">Executive Summary</span>
                <p className="text-sm text-charcoal leading-relaxed">{p.summary}</p>
             </div>
             <div className="lg:w-1/4 border-l border-border-hairline pl-0 lg:pl-8">
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-charcoal-muted block mb-3">Key Deliverables</span>
                <ul className="space-y-3">
                  {p.deliverables.map((d, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-charcoal font-medium">
                      <span className="material-symbols-outlined text-[14px] text-red-500">check</span>
                      {d}
                    </li>
                  ))}
                </ul>
             </div>
             <div className="lg:w-1/4 bg-off-white p-4 border border-border-hairline">
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-red-500 block mb-3 flex items-center gap-2">
                   <span className="material-symbols-outlined text-[14px]">crisis_alert</span>
                   Critical Decision
                </span>
                <p className="text-xs text-charcoal italic mb-4">{p.decision}</p>
                <div className="pt-4 border-t border-charcoal/10 space-y-2">
                   <div className="text-[9px] text-charcoal-muted">
                      <span className="font-bold">Deps:</span> {p.dependencies}
                   </div>
                   <div className="text-[9px] text-charcoal-muted">
                      <span className="font-bold">Team:</span> {p.team}
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    ))}
  </div>
);

// --- 09. Resource Split ---

export interface ResourceRole {
  title: string;
  desc: string;
}

export interface ResourceData {
  title: string;
  monthlyBurn: string;
  roles: ResourceRole[];
  implication: string;
}

export const DSResourceSplit: React.FC<{ solo: ResourceData; team: ResourceData }> = ({ solo, team }) => (
  <div className="mb-16">
    <div className="flex items-center gap-2 mb-6">
      <div className="h-4 w-1 bg-red-500"></div>
      <h3 className="text-2xl font-light text-charcoal">Resource Requirements</h3>
    </div>
    <div className="grid md:grid-cols-2 gap-8">
      <div className="border border-charcoal p-8 bg-white relative">
        <div className="flex justify-between items-start mb-8">
           <h4 className="font-serif text-2xl italic text-charcoal">{solo.title}</h4>
           <span className="bg-charcoal text-white text-[9px] font-mono font-bold uppercase px-2 py-1 tracking-widest">Lean</span>
        </div>
        <div className="flex justify-between items-end border-b border-charcoal pb-4 mb-6">
           <span className="text-[10px] font-mono uppercase tracking-widest text-charcoal-muted">Monthly Burn</span>
           <span className="font-mono text-xl font-bold text-charcoal">{solo.monthlyBurn}</span>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-8">
          {solo.roles.map((r, i) => (
             <div key={i} className="border border-border-hairline p-3 bg-off-white">
               <span className="block text-[8px] font-mono uppercase tracking-widest text-charcoal-muted mb-1">{r.title}</span>
               <span className="text-xs font-bold text-charcoal block">{r.desc}</span>
             </div>
          ))}
        </div>
        <p className="text-[10px] text-charcoal-muted leading-relaxed">
          <span className="font-bold text-charcoal">Implication: </span>{solo.implication}
        </p>
      </div>
      <div className="border border-charcoal p-8 bg-charcoal text-white relative">
         <div className="absolute top-[-5px] right-[-5px] size-4 bg-red-500 rounded-full animate-pulse"></div>
         <div className="flex justify-between items-start mb-8">
           <h4 className="font-serif text-2xl italic text-white">{team.title}</h4>
           <span className="bg-red-600 text-white text-[9px] font-mono font-bold uppercase px-2 py-1 tracking-widest">Accelerated</span>
        </div>
        <div className="flex justify-between items-end border-b border-white/20 pb-4 mb-6">
           <span className="text-[10px] font-mono uppercase tracking-widest text-white/60">Monthly Burn</span>
           <span className="font-mono text-xl font-bold text-white">{team.monthlyBurn}</span>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-8">
          {team.roles.map((r, i) => (
             <div key={i} className="border border-white/20 p-3 bg-white/5">
               <span className="block text-[8px] font-mono uppercase tracking-widest text-white/50 mb-1">{r.title}</span>
               <span className="text-xs font-bold text-white block">{r.desc}</span>
             </div>
          ))}
        </div>
        <p className="text-[10px] text-white/60 leading-relaxed">
          <span className="font-bold text-white">Implication: </span>{team.implication}
        </p>
      </div>
    </div>
  </div>
);

// --- 10. Error Path ---

export interface ErrorPathData {
  id: string;
  title: string;
  scenario: string;
  impact: string;
  recovery: string;
  details?: string;
}

export const DSErrorPathGrid: React.FC<{ items: ErrorPathData[] }> = ({ items }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="mb-16 border-t border-charcoal pt-12">
      <div className="mb-10 bg-off-white p-6 border border-border-hairline">
        <h3 className="font-bold text-xl uppercase tracking-wider text-charcoal leading-none mb-2">3. Error Path Mapping</h3>
        <p className="text-sm font-serif text-charcoal-muted">
          This section maps potential failure states in the user journey.
        </p>
      </div>
      <div className="flex items-center gap-4 mb-8">
          <div className="size-8 bg-red-600 flex items-center justify-center text-white rounded-sm shadow-sm">
             <span className="material-symbols-outlined text-[18px]">warning</span>
          </div>
          <span className="text-[10px] font-mono font-bold text-charcoal uppercase tracking-widest">{items.length} Vulnerabilities Detected</span>
      </div>
      <div className="grid md:grid-cols-2 gap-4 items-start">
        {items.map((item) => {
          const isExpanded = expandedId === item.id;
          return (
            <div 
              key={item.id} 
              onClick={() => toggleExpand(item.id)}
              className={`border transition-all duration-300 cursor-pointer group bg-white overflow-hidden ${
                isExpanded ? 'border-red-600 shadow-xl ring-1 ring-red-600 z-10 scale-[1.01]' : 'border-border-hairline hover:border-red-500 hover:shadow-sharp'
              }`}
            >
               <div className="p-6">
                  <div className="flex justify-between mb-4">
                     <span className={`text-[9px] font-mono border px-1 py-0.5 transition-colors ${
                       isExpanded ? 'text-white bg-red-600 border-red-600' : 'text-red-500 border-red-200'
                     }`}>{item.id}</span>
                     <span className={`material-symbols-outlined text-[16px] transition-colors ${
                       isExpanded ? 'text-red-600' : 'text-charcoal-muted group-hover:text-red-500'
                     }`}>
                       {isExpanded ? 'expand_less' : 'expand_more'}
                     </span>
                  </div>
                  <h4 className="font-bold text-sm text-charcoal mb-4 leading-tight pr-4">{item.title}</h4>
                  <div className="mb-4">
                     <span className="text-[9px] font-mono text-charcoal-muted uppercase font-bold block mb-1">Failure Scenario:</span>
                     <p className="text-[11px] text-charcoal leading-relaxed">{item.scenario}</p>
                  </div>
                  <div className="pt-3 border-t border-border-hairline border-dashed">
                     <span className="text-[9px] font-mono text-emerald-600 uppercase font-bold block mb-1">Solution / Recovery:</span>
                     <p className="text-[11px] font-bold text-charcoal leading-tight">{item.recovery}</p>
                  </div>
               </div>
               <div className={`grid transition-all duration-300 ease-in-out bg-off-white ${
                 isExpanded ? 'grid-rows-[1fr] opacity-100 border-t border-red-200' : 'grid-rows-[0fr] opacity-0'
               }`}>
                  <div className="overflow-hidden">
                     <div className="p-6">
                        <div className="mb-4">
                          <span className="text-[9px] font-mono uppercase tracking-widest font-bold text-charcoal-muted mb-2 block">User Impact</span>
                          <p className="text-[11px] text-charcoal leading-relaxed">{item.impact}</p>
                        </div>
                        <div>
                          <span className="text-[9px] font-mono uppercase tracking-widest font-bold text-emerald-600 mb-2 block">Implementation Detail</span>
                          <div className="p-3 bg-white border border-border-hairline text-[10px] font-mono text-charcoal leading-relaxed whitespace-pre-wrap">
                             {item.details}
                          </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- 12. Blueprints ---

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

// --- 13. Risk Assessment Dossier (Phase 6 Specific Header) ---

export interface RiskData {
  title: string;
  description: string;
  score: string;
}

export const DSRiskDossierHeader: React.FC<RiskData> = ({ title, description, score }) => (
  <div className="mb-24 bg-white">
    <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-charcoal/10 pb-6 mb-12 gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <h2 className="text-xl font-sans font-medium text-charcoal">Risk Assessment Dossier</h2>
        <div className="hidden sm:block h-4 w-px bg-charcoal/20"></div>
        <span className="font-mono text-[10px] text-charcoal-muted uppercase tracking-widest">Project X-01 Validation</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 border border-yellow-200 text-[9px] font-mono font-bold uppercase tracking-widest rounded-sm">
          Status: Review Pending
        </span>
        <div className="flex gap-2 text-charcoal-muted">
           <span className="material-symbols-outlined text-lg">download</span>
           <span className="material-symbols-outlined text-lg">share</span>
        </div>
      </div>
    </div>
    <div className="grid lg:grid-cols-12 gap-12">
      <div className="lg:col-span-5">
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary block mb-3">/// Risk Matrix Visualization</span>
        <h1 className="text-4xl lg:text-6xl font-light tracking-tighter text-charcoal mb-6 leading-tight">
          {title}
        </h1>
        <p className="text-sm font-serif text-charcoal-muted leading-relaxed mb-12 max-w-md">
          {description}
        </p>
        <div className="border-t border-charcoal/10 pt-6">
          <div className="flex justify-between items-end mb-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-charcoal-muted">Composite Risk Score</span>
            <span className="font-mono text-xl font-bold text-charcoal">{score}</span>
          </div>
          <div className="h-1.5 w-full bg-charcoal/10 rounded-full overflow-hidden mb-6">
            <div className="h-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500 w-[72%]"></div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-red-500"></div>
              <span className="text-[9px] font-mono uppercase tracking-widest text-charcoal-muted">Strategic (Critical)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-amber-400"></div>
              <span className="text-[9px] font-mono uppercase tracking-widest text-charcoal-muted">Operational (Moderate)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-emerald-400"></div>
              <span className="text-[9px] font-mono uppercase tracking-widest text-charcoal-muted">Financial (Low)</span>
            </div>
          </div>
        </div>
      </div>
      <div className="lg:col-span-7 relative h-[300px] lg:h-[400px] bg-off-white border border-charcoal/10 p-8 flex items-center justify-center">
         <div className="absolute inset-8 grid grid-cols-4 grid-rows-4 divide-x divide-y divide-charcoal/5 border border-charcoal/10">
             {[...Array(16)].map((_, i) => <div key={i} className=""></div>)}
         </div>
         <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold uppercase tracking-widest text-charcoal-muted">Probability of Occurrence</span>
         <span className="absolute left-3 top-1/2 -translate-y-1/2 -rotate-90 text-[9px] font-mono font-bold uppercase tracking-widest text-charcoal-muted">Impact Severity</span>
         <div className="absolute top-[20%] right-[15%] group cursor-pointer">
            <div className="size-4 rounded-full border-2 border-red-500 bg-red-500/20 shadow-sm animate-pulse"></div>
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-charcoal text-white text-[8px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">R1: AI Visibility</div>
         </div>
         <div className="absolute top-[35%] right-[35%] group cursor-pointer">
            <div className="size-4 rounded-full border-2 border-amber-400 bg-amber-400/20 shadow-sm"></div>
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-charcoal text-white text-[8px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">R2: Dashboard Delay</div>
         </div>
         <div className="absolute bottom-[25%] left-[30%] group cursor-pointer">
            <div className="size-4 rounded-full border-2 border-emerald-400 bg-emerald-400/20 shadow-sm"></div>
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-charcoal text-white text-[8px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">R7: Competitors</div>
         </div>
          <div className="absolute top-[50%] right-[25%] group cursor-pointer">
            <div className="size-4 rounded-full border-2 border-amber-400 bg-amber-400/20 shadow-sm"></div>
             <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-charcoal text-white text-[8px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">R5: Case Studies</div>
         </div>
      </div>
    </div>
  </div>
);

// --- 14. ROI Analysis ---

export interface ROIScenario {
  title: string;
  investment: string;
  mrr: string;
  roi: string;
  payback: string;
}

export const DSROIAnalysis: React.FC<{ scenarios: ROIScenario[] }> = ({ scenarios }) => (
  <div className="mb-16">
    <div className="grid md:grid-cols-2 gap-8">
      {scenarios.map((s, i) => (
        <div key={i} className="border border-charcoal/10 bg-white p-6 hover:shadow-sharp transition-shadow">
          <h4 className="font-sans font-bold text-sm text-charcoal uppercase tracking-wide mb-6 border-b border-charcoal/10 pb-4">{s.title}</h4>
          <div className="space-y-4">
             <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-charcoal-muted">Investment</span>
                <span className="text-sm font-bold text-charcoal">{s.investment}</span>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-charcoal-muted">Month 9 MRR</span>
                <span className="text-sm font-bold text-charcoal">{s.mrr}</span>
             </div>
             <div className="flex justify-between items-center p-2 bg-emerald-50 rounded-sm">
                <span className="text-xs font-mono text-emerald-800 font-bold uppercase">12-Month ROI</span>
                <span className="text-lg font-bold text-emerald-600">{s.roi}</span>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-charcoal-muted">Payback Period</span>
                <span className="text-xs font-mono font-bold text-charcoal">{s.payback}</span>
             </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// --- 15. Drag & Drop Task List (New) ---

export interface TaskItem {
  id: string;
  content: string;
  priority: 'High' | 'Medium' | 'Low';
}

export const DSTaskList: React.FC<{ initialTasks: TaskItem[] }> = ({ initialTasks }) => {
  const [tasks, setTasks] = useState(initialTasks);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, position: number) => {
    dragItem.current = position;
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnter = (e: React.DragEvent<HTMLLIElement>, position: number) => {
    e.preventDefault();
    dragOverItem.current = position;
    
    if (dragItem.current !== null && dragItem.current !== position) {
        const copyListItems = [...tasks];
        const dragItemContent = copyListItems[dragItem.current];
        copyListItems.splice(dragItem.current, 1);
        copyListItems.splice(position, 0, dragItemContent);
        dragItem.current = position;
        setTasks(copyListItems);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLIElement>) => {
      e.preventDefault();
  }

  const handleDragEnd = () => {
      dragItem.current = null;
      dragOverItem.current = null;
  }

  return (
    <div className="my-12 border border-charcoal/10 bg-white shadow-sharp">
       <div className="bg-off-white px-6 py-4 border-b border-charcoal/10 flex justify-between items-center">
          <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-charcoal">Priority Queue (Interactive)</h4>
          <span className="text-[10px] font-mono text-charcoal-muted hidden sm:inline-block">Drag items to reorder</span>
       </div>
       <ul className="divide-y divide-charcoal/5">
         {tasks.map((item, index) => (
           <li 
             key={item.id}
             draggable
             onDragStart={(e) => handleDragStart(e, index)}
             onDragEnter={(e) => handleDragEnter(e, index)}
             onDragOver={handleDragOver}
             onDragEnd={handleDragEnd}
             className="p-4 flex items-center justify-between hover:bg-off-white/50 cursor-move group transition-colors active:bg-off-white"
           >
             <div className="flex items-center gap-4">
               <div className="p-1 rounded hover:bg-charcoal/5 text-charcoal/20 group-hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[18px]">drag_indicator</span>
               </div>
               <span className="font-serif text-sm text-charcoal">{item.content}</span>
             </div>
             <span className={`text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-1 rounded-sm border w-20 text-center ${
               item.priority === 'High' ? 'bg-red-50 text-red-600 border-red-100' :
               item.priority === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' :
               'bg-blue-50 text-blue-600 border-blue-100'
             }`}>
               {item.priority}
             </span>
           </li>
         ))}
       </ul>
    </div>
  );
}