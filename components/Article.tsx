import React, { useState } from 'react';
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
  DSStrategyGrid,
  DSResourceSplit,
  DSErrorPathGrid,
  DSVisualTimeline,
  DSRiskDossierHeader,
  DSRiskTable,
  DSROIAnalysis,
  MetricRow,
  BlueprintItem,
  CompetitorData,
  RoadmapPhaseData,
  PhaseDetail,
  ResourceData,
  ErrorPathData,
  VisualTimelineData,
  RiskData,
  RiskItem,
  ROIScenario
} from './DesignLibrary';

// Types for the AI Generated Data Structure
interface SectionData {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'metrics' | 'cards' | 'blueprints' | 'table' | 'list' | 'competitor' | 'roadmap_phase' | 'strategy_grid' | 'resource_split' | 'error_path_grid' | 'risk_dossier_header' | 'roi_analysis';
  // Flexible data union
  data?: MetricRow[] | { title: string; text: string; icon: string; subLabel?: string }[] | BlueprintItem[] | any[] | string[] | CompetitorData | RoadmapPhaseData | PhaseDetail[] | ResourceData | ErrorPathData[] | RiskData | ROIScenario[] | any; 
  columns?: { header: string; key: string; width?: string }[]; // For tables
}

interface PhaseData {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  metadata: string[];
  sources?: any[];
  visualTimeline?: VisualTimelineData;
  sections: SectionData[];
}

interface ArticleProps {
  data: PhaseData;
}

export const Article: React.FC<ArticleProps> = ({ data }) => {
  // Phase 3 uses a custom layout where the "Header" is part of the first visual section
  const isRoadmapLayout = data.id === 'phase-03';
  // Phase 6 (Risk) uses a custom layout
  const isRiskLayout = data.id === 'phase-06';
  
  // State for the Strategy Grid Layout Toggle
  const [strategyLayoutMode, setStrategyLayoutMode] = useState<'grid' | 'list'>('grid');

  return (
    <article className="w-full bg-white h-full min-h-screen font-sans text-charcoal-muted">
      
      {/* Visual Timeline Header (For Phase 3) */}
      {isRoadmapLayout && data.visualTimeline && (
          <div className="w-full bg-[#F3F3F1] mb-24 border-b border-charcoal/5">
            <div className="max-w-[1100px] mx-auto px-6 lg:px-12 py-16 lg:py-24">
              <DSVisualTimeline {...data.visualTimeline} />
            </div>
          </div>
      )}

      {/* Standard Layout Header (Hidden for Phase 3 & 6) */}
      {!isRoadmapLayout && !isRiskLayout && (
        <div className="max-w-[1100px] mx-auto px-6 lg:px-12 pt-16 lg:pt-24 pb-12">
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
        {data.sections.map((section, idx) => {
          
          // --- FULL WIDTH SECTIONS ---
          if (section.type === 'risk_dossier_header') {
             return (
               <section key={section.id} id={section.id} className="scroll-mt-32">
                 <div className="max-w-[1100px] mx-auto px-6 lg:px-12 pt-16 lg:pt-24 mb-16">
                    <DSRiskDossierHeader {...(section.data as RiskData)} />
                    
                    {/* Render Risk Clusters immediately after header in this layout */}
                    <DSRiskTable 
                      number="01" 
                      title="Strategic Risk Cluster" 
                      rows={(section.data as RiskData).strategic} 
                      colorTheme="red"
                    />
                    <DSRiskTable 
                      number="02" 
                      title="Operational Risk Cluster" 
                      rows={(section.data as RiskData).operational} 
                      colorTheme="amber"
                    />
                     <DSRiskTable 
                      number="03" 
                      title="Financial Risk Cluster" 
                      rows={(section.data as RiskData).financial} 
                      colorTheme="emerald"
                    />
                 </div>
               </section>
             )
          }

          // --- CONSTRAINED WIDTH SECTIONS (1100px) ---
          return (
            <section key={section.id} id={section.id} className="max-w-[1100px] mx-auto px-6 lg:px-12 mb-16 scroll-mt-32">
              
              {/* Special Header Handling for Strategy Grid to include Toggle */}
              {section.type === 'strategy_grid' ? (
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                   {section.title && <DSSectionHeader number={`0${idx + (isRoadmapLayout ? 0 : 1)}`} title={section.title} />}
                   
                   {/* Layout Toggle Switch */}
                   <div className="flex items-center gap-2 bg-off-white p-1 rounded-sm border border-border-hairline">
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
                    number={`0${idx + (isRoadmapLayout ? 0 : 1)}`} // Adjust numbering if header is skipped
                    title={section.title} 
                  />
                )
              )}
              
              {/* Note: Removed mx-auto from inner containers to keep elements left-aligned within the 1100px block */}
              
              {section.type === 'text' && (
                <div className="max-w-4xl">
                  <DSParagraph isLead={idx === (isRoadmapLayout ? 1 : 0)}>
                    {section.content}
                  </DSParagraph>
                </div>
              )}

              {section.type === 'list' && section.data && (
                <div className="max-w-4xl">
                   <DSParagraph>{section.content}</DSParagraph>
                   <DSList items={section.data as string[]} />
                </div>
              )}

              {section.type === 'metrics' && section.data && (
                 <>
                  <div className="max-w-4xl">
                    <DSParagraph>{section.content}</DSParagraph>
                  </div>
                  <DSMetricTable 
                    title={`Table ${idx + 1}.1: Financial Metrics`}
                    data={section.data as MetricRow[]}
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
                    data={section.data as any[]}
                  />
                </>
              )}

              {section.type === 'cards' && section.data && (
                <>
                  <div className="max-w-4xl">
                    <DSParagraph>{section.content}</DSParagraph>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 my-8">
                    {(section.data as any[]).map((card: any, cIdx: number) => (
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
                  <DSCompetitorAnalysis {...(section.data as CompetitorData)} />
                </>
              )}

              {section.type === 'strategy_grid' && section.data && (
                <DSStrategyGrid phases={section.data as PhaseDetail[]} mode={strategyLayoutMode} />
              )}

              {section.type === 'resource_split' && section.data && (
                 <DSResourceSplit 
                   solo={(section.data as any).solo as ResourceData} 
                   team={(section.data as any).team as ResourceData} 
                 />
              )}

              {section.type === 'error_path_grid' && section.data && (
                <DSErrorPathGrid items={section.data as ErrorPathData[]} />
              )}

              {section.type === 'blueprints' && section.data && (
                <>
                   <div className="max-w-4xl">
                     <DSParagraph>{section.content}</DSParagraph>
                   </div>
                   <div className="mt-8">
                     {(section.data as BlueprintItem[]).map((bp) => (
                       <DSBlueprintCard key={bp.id} {...bp} />
                     ))}
                   </div>
                </>
              )}
              
              {section.type === 'roadmap_phase' && section.data && (
                <DSRoadmapPhase {...(section.data as RoadmapPhaseData)} />
              )}

              {section.type === 'roi_analysis' && section.data && (
                 <>
                   <div className="max-w-4xl">
                     <DSParagraph>{section.content}</DSParagraph>
                   </div>
                   <DSROIAnalysis scenarios={section.data as ROIScenario[]} />
                 </>
              )}

              {/* Occasional Blockquote */}
              {idx === 2 && section.type === 'text' && (
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
      <div className="max-w-[1100px] mx-auto px-6 lg:px-12 mt-24 pt-12 border-t border-border-hairline pb-24">
        <h4 className="font-mono text-xs font-bold uppercase tracking-widest mb-6 text-charcoal">Footnotes & References</h4>
        <ol className="list-decimal pl-4 space-y-4 text-xs font-mono text-charcoal-muted max-w-2xl">
          <li>
            <span className="font-bold text-charcoal">Generated by Agent Alpha</span>. Timestamp: {new Date().toISOString()}.
          </li>
          <li>
            <span className="font-bold text-charcoal">Model Version:</span> Gemini-Pro-Vision-X.
          </li>
          <li>
            <span className="font-bold text-charcoal">Data Source:</span> Perplexity Syndicate Part 3.
          </li>
        </ol>
      </div>
    </article>
  );
};