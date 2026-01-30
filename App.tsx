import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Article } from './components/Article';
import { RightPanel, SourceItem } from './components/RightPanel';

/* 
  =============================================================================
  SYSTEM DOCUMENTATION: AI GENERATION SCHEMA
  =============================================================================
  ... (Schema documentation preserved) ...
*/

// --- MOCK AI DATA GENERATION ---
const generatePhaseData = (phaseIndex: number) => {
  // Phase Definitions
  const titles = [
    "Discovery & User Needs",
    "Competitor Deep-Dive",
    "Market Fit Analysis",
    "Growth Strategy",
    "Scaling Infrastructure",
    "Design System Blueprints"
  ];

  const subtitles = [
    "Validation of core assumptions",
    "Landscape analysis and strategic gaps",
    "Competitor vectors and gaps",
    "Channel optimization metrics",
    "Load balancing and sharding",
    "Generative UI Directives & Tokens"
  ];

  // PHASE 01: ADAPTIVE PROBLEM ANALYSIS (From PDF)
  if (phaseIndex === 0) {
    return {
      id: "phase-01",
      badge: "Discovery Phase",
      title: titles[0],
      subtitle: subtitles[0],
      metadata: ["Input: PDF Brief", "Status: Exploratory", "Horizon: 3-6 Months"],
      sources: [
         { source: 'Perplexity', title: 'Executive Summary Brief', icon: 'description' },
         { source: 'JSEO', title: 'AI Marketing Systems Analysis', url: 'https://jseo.polteksci.ac.id/index.php/Jseo/article/view/28' },
         { source: 'IEEE Xplore', title: 'Document 11198381', url: 'https://ieeexplore.ieee.org/document/11198381/' },
         { source: 'GrowthCurve', title: 'Web3 Marketing Agency Landscape', url: 'https://growthcurve.co/agency/digital-marketing-agency/web3-marketing-agency' },
         { source: 'RZLT', title: 'Agency Portfolio', url: 'https://www.rzlt.io' },
         { source: 'Lureon AI', title: 'Best AI Content Agencies 2026', url: 'https://lureon.ai/blog/best-ai-content-agencies-for-web3-companies-to-use-in-2026/' },
      ] as SourceItem[],
      sections: [
        {
          id: "section-01",
          title: "Executive Summary",
          type: "text" as const,
          content: "You are launching a Web2/Web3 marketing agency that differentiates through AI-native, data-driven execution and non-traditional communication formats. The strategic move is to position this as a “systems-first” growth partner: integrating AI marketing systems, on-chain/off-chain analytics, and AI/GEO visibility rather than just “campaigns.” If executed well, you’ll attract crypto-native and AI-curious B2B clients who value measurable growth, experimentation, and technical fluency over generic “Web3 hype.” The outcome is a defensible niche at the intersection of AI marketing, Web3, and performance-driven B2B services, with clear proof via dashboards, experiments, and attribution, not decks."
        },
        {
          id: "section-02",
          title: "Adaptive Problem Analysis",
          type: "cards" as const,
          content: "A breakdown of the task complexity, target user base, and the fundamental nature of the initiative.",
          data: [
            { 
              title: "Task Type: Exploratory", 
              text: "Defining positioning, service model, and UX for a new agency rather than iterating on an existing product. Justification: The value proposition (AI-native, Web3-aware, data-driven) still needs market framing, ICP clarity, and service packaging.", 
              icon: "explore",
              subLabel: "Strategic"
            },
            { 
              title: "User Base", 
              text: "Primary: B2B professionals (founders, CMOs, growth leads at Web2 SaaS, fintech, and Web3 projects). Secondary: Web3/Crypto native teams with community-heavy products needing on-chain-aware analytics.", 
              icon: "group",
              subLabel: "B2B / Web3"
            },
            { 
              title: "Complexity: High", 
              text: "Strategic Initiative (3+ months). Requires system design, ops processes, and trust-building. Market education needed for both Web2 (AI visibility) and Web3 (bridging on-chain metrics to business outcomes).", 
              icon: "psychology",
              subLabel: "High"
            }
          ]
        },
        {
          id: "section-03",
          title: "Key Constraints",
          type: "cards" as const,
          content: "Verified constraints and assumptions that shape the operational viability of the agency model.",
          data: [
            { 
              title: "Timeline Pressures", 
              text: "Need visible traction and first lighthouse clients in ~3–6 months to prove viability. (Assumption: Medium)", 
              icon: "schedule"
            },
            { 
              title: "Budget & Resources", 
              text: "Solo/small team set-up. Must leverage automation (AI workflows, low-code tools) to deliver 'agency-level' value without headcount.", 
              icon: "savings"
            },
            { 
              title: "Technical Platform", 
              text: "Requires integration with on-chain analytics, Discord/Telegram, and AI SEO/GEO pipelines. Best practice mix verified.", 
              icon: "integration_instructions"
            },
            { 
              title: "Regulatory Compliance", 
              text: "Web3 + AI marketing touches user data, tracking, and financial promotions. Messaging must show responsibility and ethics.", 
              icon: "policy"
            }
          ]
        },
        {
          id: "section-04",
          title: "Core JTBD Statement",
          type: "text" as const,
          content: "When a founder or marketing lead at a Web2/Web3 company realizes their current marketing is too generic, unmeasurable, or disconnected from on-chain/behavioral data, they want to hire an agency that can build an AI- and data-native growth system so they can see clear, compounding results without managing a big in-house team."
        },
        {
          id: "section-05",
          title: "Jobs To Be Done Breakdown",
          type: "list" as const,
          content: "Functional Jobs:",
          data: [
            "Design and run data-driven campaigns with measurable impact (SQLs, MRR, TVL, retention, community activity).",
            "Build AI marketing systems: connected workflows that integrate research, content creation, publishing, and measurement (including AI SEO/GEO and on-chain-aware targeting).",
            "Translate complex data (analytics, on-chain activity, AI search visibility) into simple dashboards and narratives for internal stakeholders and investors.",
            "De-risk experimentation through structured, ethical use of AI (no random prompt hacking, clear guardrails, privacy-conscious tracking)."
          ]
        },
        {
          id: "section-06",
          title: "Emotional & Social Jobs",
          type: "list" as const,
          content: "Psychological drivers for the target persona:",
          data: [
            "Feel confident that someone truly understands both their technical product and new marketing realities (AI, Web3, data, communities).",
            "Reduce anxiety about wasting budget on vanity metrics or agencies that don’t measure attribution.",
            "Signal to investors and team that they run a sophisticated, experimental, data-first growth engine, not 'spray and pray' marketing.",
            "Position the brand as innovative and credible in AI and Web3 ecosystems."
          ]
        },
        {
          id: "section-07",
          title: "Current Pain Points & Gaps",
          type: "list" as const,
          content: "Market gaps identified in the current agency landscape:",
          data: [
            "Agencies claim 'data-driven' but reporting is still static, delayed, and thin (CTR, impressions) vs. deep behavioral or on-chain insights.",
            "Web3 marketing often over-indexes on hype, KOLs, and short-term pumps, underusing analytics, GEO/AI visibility, and experimentation systems.",
            "AI is used as copy-generation, not as an integrated system: no AI-aware SEO/GEO, no agentic workflows, no AI visibility metrics.",
            "Founders are overwhelmed by tools; they want coherent systems and clear decision support, not a new SaaS stack to manage."
          ]
        },
        {
          id: "section-08",
          title: "Assumption Ledger",
          type: "table" as const,
          content: "Critical assumptions that must be validated to mitigate business risk.",
          columns: [
            { header: "Assumption", key: "assumption", width: "w-1/3" },
            { header: "Confidence", key: "confidence", width: "w-1/6" },
            { header: "Validation Plan", key: "plan", width: "w-1/3" },
            { header: "Risk", key: "risk", width: "w-1/6" }
          ],
          data: [
            {
              assumption: "Growing niche of Web2/Web3 teams seek AI-native, systems-first partners.",
              confidence: "Medium",
              plan: "5–10 structured founder/CMO interviews (JTBD format). Analyze RFP/job postings.",
              risk: "Positioning too narrow; reducing differentiation."
            },
            {
              assumption: "AI SEO/GEO visibility will become key driver for Web3 brand discovery.",
              confidence: "High",
              plan: "Run 1–2 pilot case studies optimizing AI visibility. Track answer appearances.",
              risk: "Pitch feels over-futuristic; reframe as 'bonus'."
            },
            {
              assumption: "Web3 projects willing to pay premium for data-driven systems over one-off campaigns.",
              confidence: "Medium",
              plan: "Test pricing with 3–5 prospects. Offer 'System Build + 90-day run' pilot.",
              risk: "CAC rises; sales cycles lengthen."
            },
            {
              assumption: "Trust concerns around AI/Data Privacy require explicit UX safeguards.",
              confidence: "High",
              plan: "Include privacy content in proposals. Test close rates.",
              risk: "Losing regulated clients (Fintech/Enterprise)."
            },
            {
              assumption: "Productized, dashboard-centric UX will differentiate from traditional agencies.",
              confidence: "High",
              plan: "Build lean v1 'client cockpit'. Run usability tests.",
              risk: "Clients prefer decks; dashboard becomes unused overhead."
            },
            {
              assumption: "Can deliver as small/solo team by leveraging AI automation.",
              confidence: "Medium",
              plan: "Prototype 2–3 reusable AI pipelines. Monitor hours vs. margin.",
              risk: "Margins suffer; forced to pivot to advisory-only."
            },
            {
              assumption: "Non-traditional formats (narrative dashboards) resonate with buyers.",
              confidence: "Low-Medium",
              plan: "A/B test proposal formats (PDF vs. Interactive).",
              risk: "Clients feel disoriented; slows sales cycle."
            }
          ]
        },
        {
          id: "section-09",
          title: "Actionable Checklist (Immediate)",
          type: "list" as const,
          content: "Next steps for the first week:",
          data: [
            "Define ICP and Offer Stack: 1–page internal brief covering 2–3 ideal client profiles and 3 productized offers.",
            "Draft JTBD-Based Messaging v1: Core narrative landing hero copy, 3–5 key benefits, and 3 proof mechanisms.",
            "Outline Client Dashboard / 'Cockpit' UX: Low-fidelity wireframe (or text spec) for client cockpit metrics overview.",
            "Create a Lean AI Marketing System Blueprint: Diagram for a single end-to-end AI system (e.g., AI SEO/GEO).",
            "Prospect List & Interview Plan: List of 10–15 target companies + outreach template for interviews."
          ]
        }
      ]
    };
  }

  // PHASE 02: COMPETITOR DEEP-DIVE (Full Content)
  if (phaseIndex === 1) {
    return {
      id: "phase-02",
      badge: "Market Intelligence",
      title: titles[1],
      subtitle: subtitles[1],
      metadata: ["Input: Syndicate Part 2", "Status: Analysis", "Market: Web3/AI"],
      sources: [
        { source: 'RZLT', title: 'Competitor Website', url: 'https://www.rzlt.io' },
        { source: 'Coinbound', title: 'Competitor Website', url: 'https://coinbound.io' },
        { source: 'Lunar Strategy', title: 'Competitor Website', url: 'https://lunarstrategy.com' },
        { source: 'theKOLLAB', title: 'Competitor Website', url: 'https://thekollab.io' },
        { source: 'Ninja Promo', title: 'Competitor Website', url: 'https://ninjapromo.io' }
      ] as SourceItem[],
      sections: [
        {
          id: "section-01",
          title: "Landscape Overview",
          type: "text" as const,
          content: "The Web3 marketing agency market is experiencing rapid professionalization and consolidation in 2026, with agencies shifting from hype-driven campaign work to data-driven, AI-integrated growth systems. The market is characterized by monthly retainers ranging from $1,200–$20,000+, with premium agencies commanding $5,000–$50,000+ for comprehensive system builds. Key trends include: (1) AI-powered marketing automation and on-chain analytics integration becoming table stakes; (2) agencies productizing 'marketing systems' rather than one-off campaigns to create recurring revenue; (3) demand for measurable attribution connecting off-chain marketing to on-chain conversions (TVL, token purchases, NFT mints); and (4) hybrid Web2/Web3 positioning as many projects need both traditional B2B SaaS marketing and crypto-native community building. Regulatory factors remain minimal for marketing services, though data privacy (GDPR, CCPA) and transparent disclosure of paid influencer relationships are increasingly scrutinized."
        },
        {
          id: "section-02",
          title: "Competitor 1: RZLT",
          type: "competitor" as const,
          content: "Deep dive analysis of RZLT.",
          data: {
            name: "RZLT",
            website: "https://www.rzlt.io",
            info: "Founded: 2020. Target: Web3 protocols, AI-native startups. Pricing: Project-based ($20K–$100K).",
            strengths: [
              "AI-native positioning is clear and differentiated: Homepage communicates 'AI-Native Web3 Marketing Agency'.",
              "Service taxonomy is modular and scalable: Offers five core pillars (Strategy, Creative, Social & Content, Paid, Community).",
              "Case study transparency builds trust: Portfolio shows exact project names, budget ranges, and timelines."
            ],
            weaknesses: [
              "No self-serve pricing or ROI calculator: Prospects must contact sales, creating friction.",
              "Dashboard/client portal UX is not showcased: No evidence of live client dashboards or metrics visualization.",
              "Limited proof of AI tooling specifics: No detail on which AI tools, workflows, or systems they deploy."
            ],
            opportunity: "RZLT lacks a self-serve diagnostic tool or interactive 'growth score' widget. Building this would create a top-of-funnel lead magnet and demonstrate AI/data capabilities upfront."
          }
        },
        {
          id: "section-03",
          title: "Competitor 2: Coinbound",
          type: "competitor" as const,
          content: "Deep dive analysis of Coinbound.",
          data: {
            name: "Coinbound",
            website: "https://coinbound.io",
            info: "Founded: ~2018. Target: Crypto exchanges, DeFi, NFT. Pricing: Custom ($5K–$25K/mo est).",
            strengths: [
              "Coinbound Analytics is a standout product: Links on-chain (wallet activity) and off-chain data (web visits) for unified attribution.",
              "Social proof is exceptional: 100+ verified Clutch reviews with 5-star average.",
              "Wallet-to-social mapping is innovative: Maps wallet addresses to social profiles for retargeting."
            ],
            weaknesses: [
              "No pricing transparency creates sales bottleneck: 'Request a quote' is the only CTA.",
              "Analytics product UX is not shown: No screenshots or demos of the proprietary dashboard.",
              "Content marketing is thin: No blog, resources, or thought leadership visible on main site."
            ],
            opportunity: "Coinbound's analytics dashboard is clearly powerful but hidden. A competitor offering a freemium analytics dashboard would disrupt their model."
          }
        },
        {
          id: "section-04",
          title: "Competitor 3: Lunar Strategy",
          type: "competitor" as const,
          content: "Deep dive analysis of Lunar Strategy.",
          data: {
            name: "Lunar Strategy",
            website: "https://lunarstrategy.com",
            info: "Target: Web3 projects of all sizes. Pricing: Custom proposals (hidden).",
            strengths: [
              "360-degree service model is comprehensive: Offers influencer marketing, paid ads, PR, community, SEO.",
              "Influencer network is a moat: Built relationships with Web3 influencers across niches.",
              "Strong client testimonials and results: 150+ Web3 projects served with specific metrics."
            ],
            weaknesses: [
              "Zero pricing visibility is a major friction point: Creates anxiety for budget-conscious buyers.",
              "No blog or educational resources: Reduces SEO discoverability.",
              "No mention of AI or data systems: Positioning is traditional (services, relationships) with no AI differentiation."
            ],
            opportunity: "A competitor offering a self-serve influencer marketplace (searchable by niche, transparent pricing) would capture mid-market demand."
          }
        },
        {
          id: "section-05",
          title: "Competitor 4: theKOLLAB",
          type: "competitor" as const,
          content: "Deep dive analysis of theKOLLAB.",
          data: {
            name: "theKOLLAB",
            website: "https://thekollab.io",
            info: "Founded: ~2020. Target: Projects needing KOL marketing. Pricing: 'Competitive fee' (hidden).",
            strengths: [
              "Niche specialization creates clarity: Explicitly a 'Web3 KOL agency'.",
              "Service mix is balanced: 40% blockchain marketing, 20% social, 10% PR.",
              "Client satisfaction is high: Clutch reviews note specific result metrics."
            ],
            weaknesses: [
              "No ROI guarantees create uncertainty: FAQ explicitly states results vary drastically.",
              "Pricing ambiguity is frustrating: 'Supply & demand' pricing feels arbitrary.",
              "No tech differentiation: Service delivery appears manual and relationship-based."
            ],
            opportunity: "Offer real-time KOL performance dashboards (impressions, on-chain conversions per influencer) to provide unprecedented accountability."
          }
        },
        {
          id: "section-06",
          title: "Competitor 5: Ninja Promo",
          type: "competitor" as const,
          content: "Deep dive analysis of Ninja Promo.",
          data: {
            name: "Ninja Promo",
            website: "https://ninjapromo.io",
            info: "Founded: ~2017. Target: Mid-market (SaaS, Fintech, Web3). Pricing: Transparent ($3.2K–$19K+).",
            strengths: [
              "Pricing transparency is exceptional: Publicly disclosed tiers and deliverable counts.",
              "Data-driven positioning is credible: Explicitly markets analytics capabilities.",
              "Strong client feedback on execution: Trustpilot reviews praise responsiveness."
            ],
            weaknesses: [
              "Not Web3-native: Positioning is generalist, diluting credibility in crypto contexts.",
              "No proprietary Web3 tooling: Appears to use standard marketing tools vs on-chain data.",
              "Content deliverables feel commoditized: Volume-based pricing (X posts/month) vs outcome-based."
            ],
            opportunity: "A competitor offering transparent pricing PLUS Web3-native dashboards would capture the 'Ninja Promo buyer' who needs crypto-specific features."
          }
        },
        {
          id: "section-07",
          title: "Competitive Matrix",
          type: "table" as const,
          content: "Feature comparison across key market players.",
          columns: [
            { header: "Capability", key: "feature", width: "w-1/4" },
            { header: "Your Product", key: "yours", width: "w-1/6" },
            { header: "RZLT", key: "rzlt", width: "w-1/6" },
            { header: "Coinbound", key: "coin", width: "w-1/6" },
            { header: "Lunar", key: "lunar", width: "w-1/6" },
            { header: "theKOLLAB", key: "kollab", width: "w-1/6" },
            { header: "Ninja", key: "ninja", width: "w-1/6" }
          ],
          data: [
            { feature: "AI-Native Systems", yours: "🎯 Planned", rzlt: "✅ Claimed", coin: "❌", lunar: "❌", kollab: "❌", ninja: "❌" },
            { feature: "On-Chain Analytics", yours: "🎯 Planned", rzlt: "❌", coin: "✅", lunar: "❌", kollab: "❌", ninja: "❌" },
            { feature: "Transparent Pricing", yours: "🎯 Planned", rzlt: "❌", coin: "❌", lunar: "❌", kollab: "❌", ninja: "✅" },
            { feature: "Self-Serve Diagnostic", yours: "🎯 Planned", rzlt: "❌", coin: "❌", lunar: "❌", kollab: "❌", ninja: "❌" },
            { feature: "AI SEO/GEO", yours: "🎯 Planned", rzlt: "❌", coin: "❌", lunar: "✅ SEO", kollab: "✅ SEO", ninja: "❌" },
            { feature: "Wallet-to-Social Map", yours: "🎯 Planned", rzlt: "❌", coin: "✅", lunar: "❌", kollab: "❌", ninja: "❌" }
          ]
        },
        {
          id: "section-08",
          title: "UX Pattern Analysis",
          type: "list" as const,
          content: "Key patterns identified in onboarding, workflow, and pricing:",
          data: [
            "Onboarding Friction: All five competitors require 'Contact us'. No self-serve trial or diagnostic tools available.",
            "Workflow Reporting: Reporting is retrospective (monthly PDF) vs real-time. Clients want unified attribution.",
            "Pricing Models: Opaque 'black box' pricing dominates, creating anxiety. Ninja Promo wins on transparency but lacks outcome alignment.",
            "Best-in-Class: Coinbound's unified analytics platform is the gold standard for Web3 UX.",
            "Missing: Educational onboarding for DIY users and interactive product demos."
          ]
        },
        {
          id: "section-09",
          title: "Strategic Gaps (Blue Ocean)",
          type: "cards" as const,
          content: "High-value opportunities to differentiate from incumbents.",
          data: [
            {
              title: "Self-Serve Diagnostic",
              icon: "speed",
              text: "No competitor offers a free tool to assess Web3 marketing maturity. Build a 'Web3 Growth Score' to capture top-of-funnel leads."
            },
            {
              title: "Client Cockpit",
              icon: "dashboard",
              text: "Real-time visibility builds trust. Create the 'Stripe Dashboard of Web3 Marketing' with live metrics and experiment pipelines."
            },
            {
              title: "AI Visibility Sprint",
              icon: "manage_search",
              text: "Package AI SEO/GEO (ChatGPT/Perplexity ranking) as a standalone product. Position as future-proof SEO."
            },
            {
              title: "Performance Pricing",
              icon: "trending_up",
              text: "Hybrid model: Base retainer + Performance bonus (TVL/Token Growth) tied to transparent on-chain attribution."
            }
          ]
        },
        {
          id: "section-10",
          title: "Competitor Intelligence Summary",
          type: "text" as const,
          content: "The primary differentiation opportunity lies in combining Coinbound's dashboard-centric UX, RZLT's AI-native positioning, and Ninja Promo's pricing transparency into a single offering. No competitor does all three. Recommended launch pricing tiers: Starter ($3K–$5K/month), Growth ($8K–$15K/month), and Enterprise ($20K+/month), positioning as transparent but outcome-focused, differentiating from RZLT/Coinbound's opaque models and Ninja Promo's deliverable-based approach."
        }
      ]
    };
  }

  // PHASE 06: DESIGN BLUEPRINTS (Existing data)
  if (phaseIndex === 5) {
    return {
      id: "phase-06",
      badge: "System Directives",
      title: titles[5],
      subtitle: subtitles[5],
      metadata: ["Last Synced: Just Now", "Restricted Access", "Version 2.4.0"],
      sources: [],
      sections: [
        {
          id: "section-01",
          title: "Pricing Architecture",
          type: "blueprints" as const,
          content: "The following directives are strictly generated for the pricing module to ensure maximum conversion on the validation landing page.",
          data: [
            {
              id: "BP-01",
              title: "Pricing Section",
              description: "Guide users to premium tiers with clear value differentiation",
              prompt: `Design a 3-tier pricing comparison with these specifications:

LAYOUT:
- Horizontal card layout on desktop (grid-cols-3)
- Card dimensions: 380px width, auto height
- Middle card elevated (scale-105) with "Popular" badge

TIER STRUCTURE:
1. Observer ($49) - "Quick validation for side projects"
   - 1-part analysis (single API call), Email delivery, 48hr turnaround
   
2. Insider ($99) - "Full analysis for serious founders" [POPULAR]
   - 2-part analysis, Dashboard access, 24hr turnaround
   - Competitor deep-dive, Strategic roadmap
   
3. Syndicate ($199) - "Complete package for funded teams"
   - 6-part analysis, Priority support, 12hr turnaround
   - 10 Figma prompts, ROI calculator, Team sharing`
            },
            {
              id: "BP-02",
              title: "Hero Component",
              description: "High-impact visual entry point for the landing page.",
              prompt: `Design a split-screen Hero component:

LEFT COLUMN (Typography):
- H1: "Validate Before You Build" (Epilogue, 4rem, Tight tracking)
- Subheader: "AI-driven market analysis for lean startups."`
            },
            {
              id: "BP-03",
              title: "Feature Grid",
              description: "Bento-box style layout for core capabilities.",
              prompt: `Create a 2x2 Bento Grid for features:

CELL 1 (Large, Spans 2 cols): "Deep Search"
- Icon: Search Loupe
- Description: "Access 500M+ data points from Reddit, ProductHunt, and G2."`
            }
          ]
        },
        {
          id: "section-02",
          title: "Atomic Tokens",
          type: "blueprints" as const,
          content: "Fundamental variables defining the visual language.",
          data: [
             {
              id: "BP-04",
              title: "Typography Scale",
              description: "Fluid type scale for headers H1-H6 using 'Epilogue'.",
              prompt: `Define the Typography System:

FONT FAMILY:
- Headings: "Epilogue", sans-serif
- Body: "Inter", sans-serif`
             }
          ]
        }
      ]
    };
  }

  // STANDARD MOCK DATA FOR OTHER PHASES (Fallback)
  return {
    id: `phase-0${phaseIndex + 1}`,
    badge: `Analysis Phase 0${phaseIndex + 1}`,
    title: titles[phaseIndex],
    subtitle: subtitles[phaseIndex],
    metadata: ["Authored by Agent Alpha", `Phase Depth: Level ${phaseIndex + 3}`, "Confidential"],
    sources: [],
    sections: [
      {
        id: "section-01",
        title: "Executive Summary",
        type: "text" as const,
        content: "This phase focuses on the foundational elements of the venture. By rigorously testing initial assumptions against generated synthetic user personas, we have identified key friction points in the value proposition."
      },
      {
        id: "section-02",
        title: "Key Metrics",
        type: "metrics" as const,
        content: "The following data points represent the variance between our baseline expectations and the simulated outcomes derived from 10,000 Monte Carlo runs.",
        data: [
          { name: "User Acquisition Cost", baseline: "$45.00", stress: "$12.50", variance: "-72.2%" },
          { name: "Retention Rate (D30)", baseline: "15%", stress: "42%", variance: "+180%" },
          { name: "Server Latency", baseline: "120ms", stress: "45ms", variance: "-62.5%" },
        ]
      },
      {
        id: "section-03",
        title: "Strategic Directives",
        type: "cards" as const,
        content: "Based on the metrics above, the following strategic pivots are recommended to maximize probability of success.",
        data: [
          { title: "Pivot A", icon: "alt_route", text: "Shift focus from B2C to B2B2C to leverage existing enterprise distribution channels.", subLabel: "Priority" },
          { title: "Optimize Core", icon: "memory", text: "Refactor the ingestion engine to Rust to handle the projected 10x spike in concurrency." },
          { title: "Market Gap", icon: "radar", text: "Competitor analysis shows a vacuum in the mid-market segment for this specific feature set." },
          { title: "Risk Vector", icon: "shield_alert", text: "Regulatory compliance in EU regions remains the highest unmitigated risk factor.", subLabel: "Critical" }
        ]
      }
    ]
  };
};

export default function App() {
  const [activeSection, setActiveSection] = useState<string>('01');
  const [currentPhase, setCurrentPhase] = useState<number>(0);
  
  // Current Data based on Phase
  const phaseData = generatePhaseData(currentPhase);

  useEffect(() => {
    // Scroll Spy Logic
    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -50% 0px',
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
    
    // Give DOM a moment to paint new content when switching phases
    setTimeout(() => {
      const sections = document.querySelectorAll('section[id^="section-"]');
      sections.forEach((section) => observer.observe(section));
    }, 100);

    return () => observer.disconnect();
  }, [currentPhase]); // Re-run when phase changes

  return (
    <div className="flex min-h-screen bg-off-white text-charcoal font-sans selection:bg-technical-blue selection:text-primary relative">
      
      {/* Fixed Left Navigation (Intra-page) */}
      <Sidebar activeSection={activeSection} />

      {/* Main Content Area */}
      <main className="flex-1 ml-0 lg:ml-24 min-h-screen flex flex-col relative transition-opacity duration-300">
        <Header 
          currentPhase={currentPhase} 
          setPhase={setCurrentPhase} 
        />
        
        <div className="flex-1 flex flex-col lg:flex-row">
          {/* Scrollable Article Content */}
          <div className="flex-1 bg-white min-w-0"> 
            {/* Key forces re-mount for animation effect on phase change */}
            <Article key={currentPhase} data={phaseData} />
          </div>

          {/* Fixed/Sticky Right Panel for Desktop */}
          <RightPanel sources={phaseData.sources} />
        </div>
      </main>
    </div>
  );
}