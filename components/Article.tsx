import React from 'react';

const metricsData = [
  { name: "Liquidity Depth", baseline: "450,000 Units", stress: "12,000 Units", variance: "-97.3%" },
  { name: "Bid-Ask Spread", baseline: "0.02 bps", stress: "14.50 bps", variance: "+72,400%" },
  { name: "Execution Jitter", baseline: "1.2 ms", stress: "450.0 ms", variance: "+37,400%" },
  { name: "Slippage Tolerance", baseline: "0.05%", stress: "4.20%", variance: "+8,300%" },
];

export const Article: React.FC = () => {
  return (
    <article className="w-full px-8 lg:px-24 py-16 lg:py-24 max-w-6xl mx-auto border-r border-border-hairline bg-white h-full">
      {/* Article Header */}
      <div className="mb-12 animate-in slide-in-from-bottom-4 duration-700 fade-in">
        <span className="px-2 py-0.5 border border-primary text-primary text-[9px] font-bold uppercase tracking-widest font-mono bg-primary/5 mb-4 inline-block">
          Analysis Vector: Alpha-Delta
        </span>
        <h1 className="text-4xl lg:text-6xl font-light tracking-tighter text-charcoal mb-6 leading-[1.1]">
          Generative Pre-validation of <br />
          <span className="font-serif italic font-medium">Algorithmic Trading Architectures</span>
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-charcoal-muted border-b border-border-hairline pb-8">
          <span>Authored by Agent Alpha & Beta</span>
          <span className="hidden sm:inline">•</span>
          <span>October 12, 2023</span>
          <span className="hidden sm:inline">•</span>
          <span>34,201 Characters</span>
        </div>
      </div>

      {/* Content Body */}
      <div className="prose prose-slate prose-lg max-w-none font-serif text-charcoal-muted leading-loose">
        
        {/* Abstract */}
        <section id="section-01" className="scroll-mt-32">
          <h3 className="text-charcoal font-sans text-xl font-medium mb-4 mt-12 uppercase tracking-wide flex items-center gap-2">
            <span className="text-primary text-sm font-mono">01.</span> Abstract
          </h3>
          <p className="mb-6 first-letter:text-5xl first-letter:font-light first-letter:text-charcoal first-letter:float-left first-letter:mr-3 first-letter:mt-[-6px]">
            The rapid evolution of high-frequency trading (HFT) algorithms necessitates a rigorous pre-validation framework to mitigate systemic risks. This paper presents a novel approach utilizing generative adversarial networks (GANs) to simulate market conditions and stress-test algorithmic resilience. By creating synthetic market data indistinguishable from historical records, we enable a deeper analysis of edge cases that traditional backtesting often overlooks.
          </p>
        </section>

        {/* Methodology */}
        <section id="section-02" className="scroll-mt-32">
          <h3 className="text-charcoal font-sans text-xl font-medium mb-4 mt-12 uppercase tracking-wide flex items-center gap-2">
            <span className="text-primary text-sm font-mono">02.</span> Methodology: Synthetic Data Injection
          </h3>
          <p className="mb-6">
            Our primary methodology involves the injection of synthetic volatility spikes into standard OHLCV (Open, High, Low, Close, Volume) datasets. The generative model, trained on 10 years of NASDAQ tick data, produces artifacts that mimic "flash crash" scenarios with high fidelity. This allows us to observe the algorithmic response to liquidity vacuums without risking capital in live environments.
          </p>

          {/* Responsive Table Visualization */}
          <div className="my-12 border border-charcoal/10 shadow-sharp bg-white overflow-hidden">
             <div className="bg-off-white px-6 py-4 border-b border-charcoal/10 flex justify-between items-center flex-wrap gap-2">
                <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-charcoal">
                  Table 1.1: Comparative Stress Metrics
                </h4>
                <span className="font-mono text-[10px] text-charcoal-muted whitespace-nowrap">Dataset: NQ-2023-GAN</span>
             </div>
             
             {/* Desktop Table View */}
             <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-charcoal/10">
                      <th className="py-4 px-6 text-xs font-bold font-sans text-charcoal uppercase tracking-wider w-1/4">Metric</th>
                      <th className="py-4 px-6 text-xs font-mono font-medium text-charcoal-muted uppercase tracking-wider text-right">Historical Baseline</th>
                      <th className="py-4 px-6 text-xs font-mono font-medium text-primary uppercase tracking-wider text-right bg-primary/5">Synthetic Stress</th>
                      <th className="py-4 px-6 text-xs font-mono font-medium text-charcoal-muted uppercase tracking-wider text-right">Variance (Δ)</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono text-xs text-charcoal">
                    {metricsData.map((row, idx) => (
                      <tr key={idx} className="border-b border-charcoal/5 hover:bg-off-white transition-colors last:border-0">
                        <td className="py-4 px-6 font-sans font-medium text-charcoal">{row.name}</td>
                        <td className="py-4 px-6 text-right text-charcoal-muted">{row.baseline}</td>
                        <td className="py-4 px-6 text-right font-bold text-primary bg-primary/5">{row.stress}</td>
                        <td className="py-4 px-6 text-right text-red-600">{row.variance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>

             {/* Mobile Card View (Stacked Layout) */}
             <div className="md:hidden">
               {metricsData.map((row, idx) => (
                 <div key={idx} className={`p-6 border-b border-charcoal/10 ${idx % 2 === 0 ? 'bg-white' : 'bg-off-white/30'}`}>
                   <h5 className="font-sans font-bold text-charcoal text-sm mb-4">{row.name}</h5>
                   <div className="space-y-3 font-mono text-xs">
                     <div className="flex justify-between items-center pb-2 border-b border-charcoal/5">
                       <span className="text-charcoal-muted uppercase tracking-wider text-[10px]">Historical</span>
                       <span className="text-charcoal font-medium">{row.baseline}</span>
                     </div>
                     <div className="flex justify-between items-center pb-2 border-b border-charcoal/5 bg-primary/5 -mx-2 px-2 py-1 rounded-sm">
                       <span className="text-primary uppercase tracking-wider text-[10px] font-bold">Synthetic</span>
                       <span className="text-primary font-bold">{row.stress}</span>
                     </div>
                     <div className="flex justify-between items-center pt-1">
                       <span className="text-charcoal-muted uppercase tracking-wider text-[10px]">Variance</span>
                       <span className="text-red-600 font-bold">{row.variance}</span>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
             
             <div className="bg-off-white px-6 py-3 border-t border-charcoal/10">
                <p className="text-[10px] font-mono text-charcoal-muted leading-relaxed">
                   <strong>Note:</strong> Variance represents the deviation between standard market conditions (Historical) and GAN-generated black swan events (Synthetic). Values highlighted in red indicate critical infrastructure failure points.
                </p>
             </div>
          </div>

          <p className="mb-6">
            The data presented in Table 1.1 quantifies the critical failure points. In the 'Synthetic Stress' column, the inversion of market stability is palpable: liquidity evaporates (represented by the 97.3% drop) while spread and jitter explode. This confirms our hypothesis that current risk management protocols are insufficient for black swan events of this magnitude.
          </p>
        </section>

        {/* Architectural Implications */}
        <section id="section-03" className="scroll-mt-32">
          <h3 className="text-charcoal font-sans text-xl font-medium mb-4 mt-12 uppercase tracking-wide flex items-center gap-2">
            <span className="text-primary text-sm font-mono">03.</span> Architectural Implications
          </h3>
          <p className="mb-6">
            To counter these vulnerabilities, we propose a decentralized mesh architecture for order execution. By distributing the execution logic across multiple geographically distinct nodes, we can reduce the impact of localized latency spikes. Furthermore, implementing an asynchronous consensus mechanism for trade validation ensures that erroneous orders generated during high-volatility periods are quarantined before execution.
          </p>
          
          <blockquote className="pl-6 border-l-2 border-primary my-8 italic text-charcoal text-xl font-light py-2 bg-gradient-to-r from-primary/5 to-transparent">
            "The system must not only survive chaos but thrive within it. Antifragility is the core design principle for the next generation of algorithmic engines."
          </blockquote>
          
          <p className="mb-6">
            Implementing this architecture requires a shift from monolithic C++ codebases to modular Rust-based microservices. The memory safety guarantees of Rust, combined with its zero-cost abstractions, make it the ideal candidate for building resilient financial infrastructure. Preliminary benchmarks show a 40% reduction in runtime errors during stress tests.
          </p>
        </section>

        {/* Conclusion */}
        <section id="section-04" className="scroll-mt-32">
          <h3 className="text-charcoal font-sans text-xl font-medium mb-4 mt-12 uppercase tracking-wide flex items-center gap-2">
            <span className="text-primary text-sm font-mono">04.</span> Conclusion
          </h3>
          <p className="mb-6">
            The era of static backtesting is over. Generative pre-validation offers a robust alternative that prepares algorithmic strategies for the unknown unknowns of modern markets. Project X-01 demonstrates that by embracing synthetic chaos, we can build systems of unparalleled stability.
          </p>
        </section>
      </div>

      {/* Footer / References */}
      <div className="mt-24 pt-12 border-t border-border-hairline">
        <h4 className="font-mono text-xs font-bold uppercase tracking-widest mb-6 text-charcoal">Footnotes & References</h4>
        <ol className="list-decimal pl-4 space-y-4 text-xs font-mono text-charcoal-muted">
          <li>
            <span className="font-bold text-charcoal">Vaswani et al. (2017)</span>. "Attention Is All You Need." NeurIPS. This foundational paper established the Transformer architecture, which underpins our generative models.
          </li>
          <li>
            <span className="font-bold text-charcoal">Nakamoto, S. (2008)</span>. "Bitcoin: A Peer-to-Peer Electronic Cash System." Referenced for distributed consensus mechanisms in high-latency environments.
          </li>
          <li>
            <span className="font-bold text-charcoal">Taleb, N. N. (2012)</span>. "Antifragile: Things That Gain from Disorder." Random House. Provides the philosophical basis for our stress-testing methodology.
          </li>
        </ol>
      </div>
    </article>
  );
};