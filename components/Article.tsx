import React from 'react';
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
  MetricRow,
  BlueprintItem,
  CompetitorData
} from './DesignLibrary';

// Types for the AI Generated Data Structure
interface SectionData {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'metrics' | 'cards' | 'blueprints' | 'table' | 'list' | 'competitor';
  // Flexible data union
  data?: MetricRow[] | { title: string; text: string; icon: string; subLabel?: string }[] | BlueprintItem[] | any[] | string[] | CompetitorData; 
  columns?: { header: string; key: string; width?: string }[]; // For tables
}

interface PhaseData {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  metadata: string[];
  sections: SectionData[];
}

interface ArticleProps {
  data: PhaseData;
}

export const Article: React.FC<ArticleProps> = ({ data }) => {
  return (
    <article className="w-full px-8 lg:px-24 py-16 lg:py-24 max-w-6xl mx-auto border-r border-border-hairline bg-white h-full min-h-screen">
      
      {/* Dynamic Header */}
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

      {/* Dynamic Content Body */}
      <div className="prose prose-slate prose-lg max-w-none font-serif text-charcoal-muted leading-loose mt-12">
        {data.sections.map((section, idx) => (
          <section key={section.id} id={section.id} className="mb-16 scroll-mt-32">
            <DSSectionHeader 
              number={`0${idx + 1}`} 
              title={section.title} 
            />
            
            {section.type === 'text' && (
              <DSParagraph isLead={idx === 0}>
                {section.content}
              </DSParagraph>
            )}

            {section.type === 'list' && section.data && (
              <>
                 <DSParagraph>{section.content}</DSParagraph>
                 <DSList items={section.data as string[]} />
              </>
            )}

            {section.type === 'metrics' && section.data && (
               <>
                <DSParagraph>{section.content}</DSParagraph>
                <DSMetricTable 
                  title={`Table ${idx + 1}.1: Financial Metrics`}
                  data={section.data as MetricRow[]}
                />
               </>
            )}

            {section.type === 'table' && section.data && section.columns && (
              <>
                <DSParagraph>{section.content}</DSParagraph>
                <DSGenericTable 
                  title={`Table ${idx + 1}.1: Structured Data`}
                  columns={section.columns}
                  data={section.data as any[]}
                />
              </>
            )}

            {section.type === 'cards' && section.data && (
              <>
                <DSParagraph>{section.content}</DSParagraph>
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
                <DSParagraph>{section.content}</DSParagraph>
                <DSCompetitorAnalysis {...(section.data as CompetitorData)} />
              </>
            )}

            {section.type === 'blueprints' && section.data && (
              <>
                 <DSParagraph>{section.content}</DSParagraph>
                 <div className="mt-8">
                   {(section.data as BlueprintItem[]).map((bp) => (
                     <DSBlueprintCard key={bp.id} {...bp} />
                   ))}
                 </div>
              </>
            )}

            {/* Simulating a Blockquote occasionally for variety */}
            {idx === 2 && section.type === 'text' && (
               <DSBlockquote author="Strategic Insight">
                  The intersection of AI automation and Web3 distinctiveness creates a defensible moat in a crowded agency market.
               </DSBlockquote>
            )}
          </section>
        ))}
      </div>

      {/* Footer / References */}
      <div className="mt-24 pt-12 border-t border-border-hairline">
        <h4 className="font-mono text-xs font-bold uppercase tracking-widest mb-6 text-charcoal">Footnotes & References</h4>
        <ol className="list-decimal pl-4 space-y-4 text-xs font-mono text-charcoal-muted">
          <li>
            <span className="font-bold text-charcoal">Generated by Agent Alpha</span>. Timestamp: {new Date().toISOString()}.
          </li>
          <li>
            <span className="font-bold text-charcoal">Model Version:</span> Gemini-Pro-Vision-X.
          </li>
        </ol>
      </div>
    </article>
  );
};