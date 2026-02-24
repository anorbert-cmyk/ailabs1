import React, { useState } from 'react';
import type { PhaseData as BasePhaseData } from '../services/contentParser';
import { 
  DSHeader, 
  DSSectionHeader, 
  DSParagraph, 
  DSBlockquote, 
  DSMetricTable, 
  DSGenericTable,
  DSInfoCard,
  DSBlueprintCard,
  DSList,
  DSCompetitorAnalysis,
  DSRoadmapPhase,
  DSPhaseCard,
  DSStrategyGrid,
  DSResourceSplit,
  DSErrorPathGrid,
  DSVisualTimeline,
  DSRiskDossierHeader,
  DSROIAnalysis,
  DSTaskList,
  MetricRow,
  BlueprintItem,
  CompetitorData,
  RoadmapPhaseData,
  PhaseCardData,
  PhaseDetail,
  ResourceData,
  ErrorPathData,
  VisualTimelineData,
  RiskData,
  ROIScenario,
  TaskItem
} from './DesignLibrary';

// Types for the AI Generated Data Structure — discriminated union for type safety
interface CardItem {
  title: string;
  text: string;
  icon: string;
  subLabel?: string;
}

type SectionBase = {
  id: string;
  title: string;
  content: string;
};

type SectionData =
  | (SectionBase & { type: 'text' })
  | (SectionBase & { type: 'list'; data: string[] })
  | (SectionBase & { type: 'metrics'; data: MetricRow[] })
  | (SectionBase & { type: 'table'; data: Record<string, string>[]; columns: { header: string; key: string; width?: string }[] })
  | (SectionBase & { type: 'cards'; data: CardItem[] })
  | (SectionBase & { type: 'competitor'; data: CompetitorData })
  | (SectionBase & { type: 'strategy_grid'; data: PhaseDetail[] })
  | (SectionBase & { type: 'resource_split'; data: { solo: ResourceData; team: ResourceData } })
  | (SectionBase & { type: 'error_path_grid'; data: ErrorPathData[] })
  | (SectionBase & { type: 'blueprints'; data: BlueprintItem[] })
  | (SectionBase & { type: 'roadmap_phase'; data: RoadmapPhaseData })
  | (SectionBase & { type: 'phase_card'; data: PhaseCardData })
  | (SectionBase & { type: 'roi_analysis'; data: ROIScenario[] })
  | (SectionBase & { type: 'task_list'; data: TaskItem[] })
  | (SectionBase & { type: 'risk_dossier_header'; data: RiskData })
  | (SectionBase & { type: 'task_list_checkbox'; data: TaskItem[] })
  | (SectionBase & { type: 'viability_score'; data: { score: number; label: string; emoji: string; summary: string } })
  | (SectionBase & { type: 'pain_points'; data: Array<{ title: string; text: string; severity: 'high' | 'medium' | 'low'; icon: string }> })
  | (SectionBase & { type: 'next_step'; data: { title: string; whatToDo: string; whyFirst: string } });

interface PhaseData extends BasePhaseData {
  visualTimeline?: VisualTimelineData;
}

interface ArticleProps {
  data: PhaseData;
}

export const Article: React.FC<ArticleProps> = ({ data }) => {
  // Phase 3 uses a custom layout where the "Header" is part of the first visual section
  const isRoadmapLayout = data.id === 'phase-03';
  
  // State for the Strategy Grid Layout Toggle
  const [strategyLayoutMode, setStrategyLayoutMode] = useState<'grid' | 'list'>('grid');

  return (
    <article className="w-full bg-white h-full min-h-screen font-sans text-charcoal-muted">
      
      {/* Visual Timeline Header (For Phase 3) */}
      {isRoadmapLayout && data.visualTimeline && (
          <div className="w-full bg-[#F3F3F1] mb-16 lg:mb-24 border-b border-charcoal/5">
            <div className="max-w-[1320px] mx-auto px-4 lg:px-12 py-12 lg:py-24">
              <DSVisualTimeline {...data.visualTimeline} />
            </div>
          </div>
      )}

      {/* Standard Layout Header (Hidden for Phase 3) */}
      {!isRoadmapLayout && (
        <div className="max-w-[1320px] mx-auto px-4 lg:px-12 pt-12 lg:pt-24 pb-8 lg:pb-12">
          <DSHeader 
            title={data.title}
            subtitle={data.subtitle}
            badge={data.badge}
          />
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-charcoal-muted border-b border-border-hairline pb-8">
            {data.metadata.map((meta, idx) => (
              <React.Fragment key={idx}>
                <span>{meta}</span>
                {idx < data.metadata.length - 1 && <span className="hidden sm:inline opacity-30">•</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Content Sections */}
      <div className="prose prose-slate prose-lg max-w-none font-serif text-charcoal-muted leading-loose">
        {(data.sections as SectionData[]).map((section, idx) => {
          
          // --- FULL WIDTH SECTIONS ---
          if (section.type === 'risk_dossier_header') {
             return (
               <section key={section.id} id={section.id} className="scroll-mt-32">
                 <div className="max-w-[1320px] mx-auto px-4 lg:px-12 pt-12 lg:pt-24 mb-16">
                    <DSRiskDossierHeader {...section.data} />
                 </div>
               </section>
             )
          }

          // --- CONSTRAINED WIDTH SECTIONS (1320px) ---
          return (
            <section key={section.id} id={section.id} className="max-w-[1320px] mx-auto px-4 lg:px-12 mb-12 lg:mb-16 scroll-mt-32">
              
              {/* Special Header Handling for Strategy Grid to include Toggle */}
              {section.type === 'strategy_grid' ? (
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                   {section.title && <DSSectionHeader number={String(idx + (isRoadmapLayout ? 0 : 1)).padStart(2, '0')} title={section.title} />}
                   
                   {/* Layout Toggle Switch */}
                   <div className="flex items-center gap-2 bg-off-white p-1 rounded-sm border border-border-hairline self-start md:self-auto">
                      <button 
                        onClick={() => setStrategyLayoutMode('grid')}
                        className={`p-2 rounded-sm transition-all ${strategyLayoutMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-charcoal-muted hover:text-charcoal'}`}
                        title="Grid View"
                      >
                        <span className="material-symbols-outlined text-[18px] block">grid_view</span>
                      </button>
                      <button 
                        onClick={() => setStrategyLayoutMode('list')}
                        className={`p-2 rounded-sm transition-all ${strategyLayoutMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-charcoal-muted hover:text-charcoal'}`}
                        title="List View"
                      >
                        <span className="material-symbols-outlined text-[18px] block">view_list</span>
                      </button>
                   </div>
                </div>
              ) : (
                /* Standard Header */
                section.title && (
                  <DSSectionHeader 
                    number={String(idx + (isRoadmapLayout ? 0 : 1)).padStart(2, '0')}
                    title={section.title} 
                  />
                )
              )}
              
              {/* Note: Removed mx-auto from inner containers to keep elements left-aligned within the 1100px block */}
              
              {section.type === 'text' && section.content && (
                <div className="max-w-4xl">
                  <DSParagraph isLead={idx === (isRoadmapLayout ? 1 : 0)}>
                    {section.content}
                  </DSParagraph>
                </div>
              )}

              {section.type === 'list' && (
                <div className="max-w-4xl">
                   {section.content && <DSParagraph>{section.content}</DSParagraph>}
                   <DSList items={section.data} />
                </div>
              )}

              {section.type === 'metrics' && section.data && (
                 <>
                  <div className="max-w-4xl">
                    <DSParagraph>{section.content}</DSParagraph>
                  </div>
                  <DSMetricTable 
                    title={`Table ${idx + 1}.1: Financial Metrics`}
                    data={section.data}
                  />
                 </>
              )}

              {section.type === 'table' && section.data && section.columns && (
                <>
                  <div className="max-w-4xl">
                    <DSParagraph>{section.content}</DSParagraph>
                  </div>
                  <DSGenericTable 
                    title={`Table ${idx + 1}.1: ${section.title}`}
                    columns={section.columns}
                    data={section.data}
                  />
                </>
              )}

              {section.type === 'cards' && section.data && (
                <>
                  <div className="max-w-4xl">
                    <DSParagraph>{section.content}</DSParagraph>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
                    {section.data.map((card, cIdx) => (
                      <DSInfoCard
                        key={cIdx}
                        title={card.title}
                        icon={card.icon}
                        subLabel={card.subLabel}
                      >
                        {card.text}
                      </DSInfoCard>
                    ))}
                  </div>
                </>
              )}

              {section.type === 'competitor' && section.data && (
                <>
                  <div className="max-w-4xl">
                    <DSParagraph>{section.content}</DSParagraph>
                  </div>
                  <DSCompetitorAnalysis {...section.data} />
                </>
              )}

              {section.type === 'strategy_grid' && section.data && (
                <DSStrategyGrid phases={section.data} mode={strategyLayoutMode} />
              )}

              {section.type === 'resource_split' && section.data && section.data.solo && section.data.team && (
                 <DSResourceSplit
                   solo={section.data.solo}
                   team={section.data.team}
                 />
              )}

              {section.type === 'error_path_grid' && section.data && (
                <DSErrorPathGrid items={section.data} />
              )}

              {section.type === 'blueprints' && section.data && (
                <>
                   <div className="max-w-4xl">
                     <DSParagraph>{section.content}</DSParagraph>
                   </div>
                   <div className="mt-8">
                     {section.data.map((bp) => (
                       <DSBlueprintCard key={bp.id} {...bp} />
                     ))}
                   </div>
                </>
              )}
              
              {section.type === 'roadmap_phase' && section.data && (
                <DSRoadmapPhase {...section.data} />
              )}

              {section.type === 'phase_card' && section.data && (
                <DSPhaseCard {...section.data} />
              )}

              {section.type === 'roi_analysis' && section.data && (
                 <>
                   <div className="max-w-4xl">
                     <DSParagraph>{section.content}</DSParagraph>
                   </div>
                   <DSROIAnalysis scenarios={section.data} />
                 </>
              )}

              {section.type === 'task_list' && section.data && (
                 <>
                   <div className="max-w-4xl">
                     <DSParagraph>{section.content}</DSParagraph>
                   </div>
                   <DSTaskList initialTasks={section.data} />
                 </>
              )}

              {section.type === 'viability_score' && (
                <div className="max-w-4xl text-center py-8">
                  <div className="text-6xl mb-2">{section.data.emoji}</div>
                  <div className="text-4xl font-bold font-mono text-charcoal">{section.data.score}<span className="text-lg text-charcoal-muted">/100</span></div>
                  <div className="text-sm font-bold font-mono uppercase tracking-widest text-charcoal-muted mt-2">{section.data.label}</div>
                  <p className="text-sm text-charcoal-muted mt-4 max-w-lg mx-auto">{section.data.summary}</p>
                </div>
              )}

              {section.type === 'pain_points' && (
                <>
                  {section.content && <div className="max-w-4xl"><DSParagraph>{section.content}</DSParagraph></div>}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
                    {section.data.map((point, pIdx) => (
                      <div key={pIdx} className={`p-6 rounded-sm border-l-4 bg-off-white ${
                        point.severity === 'high' ? 'border-red-500' : point.severity === 'medium' ? 'border-yellow-500' : 'border-green-500'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="material-symbols-outlined text-[18px]">{point.icon}</span>
                          <span className="font-bold font-mono text-sm text-charcoal">{point.title}</span>
                        </div>
                        <p className="text-xs text-charcoal-muted">{point.text}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {section.type === 'next_step' && (
                <div className="max-w-4xl bg-technical-blue p-8 rounded-sm my-8">
                  <h4 className="font-bold font-mono text-sm uppercase tracking-widest text-charcoal mb-4">{section.data.title || 'Recommended Next Step'}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <span className="text-xs font-bold font-mono uppercase text-charcoal-muted">What to do</span>
                      <p className="text-sm text-charcoal mt-1">{section.data.whatToDo}</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold font-mono uppercase text-charcoal-muted">Why first</span>
                      <p className="text-sm text-charcoal mt-1">{section.data.whyFirst}</p>
                    </div>
                  </div>
                </div>
              )}

              {section.type === 'task_list_checkbox' && (
                <>
                  {section.content && <div className="max-w-4xl"><DSParagraph>{section.content}</DSParagraph></div>}
                  <DSTaskList initialTasks={section.data} />
                </>
              )}

              {/* Occasional Blockquote */}
              {idx === 2 && section.type === 'text' && data.badge === 'Discovery Phase' && (
                 <div className="max-w-4xl">
                   <DSBlockquote author="Strategic Insight">
                      The intersection of AI automation and Web3 distinctiveness creates a defensible moat in a crowded agency market.
                   </DSBlockquote>
                 </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Footer / References - Constrained Width */}
      <div className="max-w-[1320px] mx-auto px-4 lg:px-12 mt-16 lg:mt-24 pt-12 border-t border-border-hairline pb-24">
        <h4 className="font-mono text-xs font-bold uppercase tracking-widest mb-6 text-charcoal">Footnotes & References</h4>
        <ol className="list-decimal pl-4 space-y-4 text-xs font-mono text-charcoal-muted max-w-2xl">
          <li>
            <span className="font-bold text-charcoal">Generated by Valid8 Agent</span>. Timestamp: {new Date().toISOString()}.
          </li>
          <li>
            <span className="font-bold text-charcoal">Model Version:</span> Claude Sonnet 4.6 via Perplexity.
          </li>
          <li>
            <span className="font-bold text-charcoal">Data Source:</span> Perplexity Syndicate Part 3.
          </li>
        </ol>
      </div>
    </article>
  );
};