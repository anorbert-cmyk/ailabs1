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
    "Phase-by-Phase Roadmap",
    "Core Design",
    "Advanced Screens & Edge Cases",
    "Risk, Metrics & ROI"
  ];

  const subtitles = [
    "Validation of core assumptions",
    "Landscape analysis and strategic gaps",
    "Visualizing the 9-month execution path from foundational architecture to market optimization.",
    "Architectural directives for the core application flows, defined as generative prompts",
    "Comprehensive system states including error handling, empty states, and loading patterns",
    "Critical exposure analysis, success metrics, and financial justification"
  ];

  // PHASE 01: ADAPTIVE PROBLEM ANALYSIS
  if (phaseIndex === 0) {
    return {
      id: "phase-01",
      badge: "Discovery Phase",
      title: titles[0],
      subtitle: subtitles[0],
      metadata: ["Input: PDF Brief", "Status: Exploratory", "Horizon: 3-6 Months"],
      sources: [
         { source: 'Perplexity', title: 'Syndicate Part 1: Executive Summary', icon: 'description' },
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
              text: "Web3 + AI marketing touches topics like user data, tracking, and possibly financial promotions; messaging must show responsibility and ethics.", 
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
          content: "Functional & Emotional Jobs:",
          data: [
            "Design and run data-driven campaigns with measurable impact (SQLs, MRR, TVL, retention).",
            "Build AI marketing systems: connected workflows that integrate research, content creation, and measurement.",
            "Translate complex data (analytics, on-chain activity, AI search visibility) into simple dashboards.",
            "De-risk experimentation through structured, ethical use of AI.",
            "Feel confident that someone truly understands both their technical product and new marketing realities.",
            "Reduce anxiety about wasting budget on vanity metrics or agencies that don’t measure attribution."
          ]
        },
        {
          id: "section-06",
          title: "Assumption Ledger",
          type: "table" as const,
          content: "Critical assumptions that must be validated to ensure business viability.",
          columns: [
             { header: "Assumption", key: "assumption", width: "w-1/3" },
             { header: "Confidence", key: "confidence", width: "w-1/6" },
             { header: "Validation Plan", key: "plan", width: "w-1/3" },
             { header: "Risk", key: "risk", width: "w-1/6" }
          ],
          data: [
            { assumption: "Growing niche of Web2/Web3 teams seek AI-native, systems-first partners.", confidence: "Medium", plan: "5-10 structured founder/CMO interviews using JTBD format.", risk: "Positioning too narrow." },
            { assumption: "AI SEO/GEO will become a key driver for Web3 brand discovery.", confidence: "High", plan: "Run 1-2 pilot case studies optimizing AI visibility.", risk: "Pitch feels over-futuristic." },
            { assumption: "Projects willing to pay premium retainers for systems vs campaigns.", confidence: "Medium", plan: "Test pricing structure with 3-5 prospects; offer 'system build' pilot.", risk: "Sales cycles lengthen." },
            { assumption: "Trust concerns around AI require explicit safeguards.", confidence: "High", plan: "Include privacy/AI-ethics content; test close rates.", risk: "Losing regulated clients." },
            { assumption: "Dashboard-centric UX differentiates from traditional agencies.", confidence: "High", plan: "Build lean v1 'client cockpit'; run usability tests.", risk: "Clients prefer PDF decks." }
          ]
        }
      ]
    };
  }

  // PHASE 02: COMPETITOR DEEP-DIVE
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
          content: "The Web3 marketing agency market is experiencing rapid professionalization and consolidation in 2026, with agencies shifting from hype-driven campaign work to data-driven, AI-integrated growth systems. The market is characterized by monthly retainers ranging from $1,200–$20,000+, with premium agencies commanding $5,000–$50,000+ for comprehensive system builds. Key trends include: (1) AI-powered marketing automation and on-chain analytics integration becoming table stakes; (2) agencies productizing 'marketing systems' rather than one-off campaigns to create recurring revenue; (3) demand for measurable attribution connecting off-chain marketing to on-chain conversions (TVL, token purchases, NFT mints); and (4) hybrid Web2/Web3 positioning as many projects need both traditional B2B SaaS marketing and crypto-native community building."
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
            info: "Founded: 2018. Target: Major crypto exchanges, NFT projects. Pricing: High-end retainers ($10K+).",
            strengths: [
              "High Brand Authority: 'Leading Web3 Marketing Agency' positioning with strong SEO presence.",
              "Influencer Network: Extensive roster of crypto influencers and KOLs.",
              "Content Machine: Hosts a popular podcast, driving significant inbound traffic."
            ],
            weaknesses: [
              "Traditional Agency feel: Less emphasis on 'systems' or automation, more on 'connections'.",
              "Opaque Reporting: Dashboard exists but is not a primary selling point on the landing page.",
              "Expensive Entry: Pricing creates a barrier for mid-market B2B SaaS pivoting to Web3."
            ],
            opportunity: "Differentiate by offering a 'glass-box' approach—public dashboard access and clear, lower-tier pricing for automated services."
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
            info: "Founded: 2019. Target: DeFi, Metaverse. Pricing: Mid-range, paid media focus.",
            strengths: [
              "Paid Media Expertise: Strong positioning on Google/Facebook ads for crypto (difficult niche).",
              "Clear Packages: Offers distinct service bundles, improving sales clarity.",
              "Educational Content: Good blog content explaining Web3 marketing nuances."
            ],
            weaknesses: [
              "Generic Analytics: Reports focus on vanity metrics (impressions, clicks) rather than on-chain value.",
              "Low AI Integration: Little mention of AI-driven optimization or workflows.",
              "Website UX: Standard agency template, lacks the 'tech-forward' feel of an AI-native firm."
            ],
            opportunity: "Win on attribution. Connect marketing spend directly to wallet transactions (TVL/Sales) via the client dashboard, highlighting the 'real ROI' Lunar misses."
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
            info: "Founded: ~2020. Target: Web3 projects needing KOL marketing. Pricing: Competitive fee.",
            strengths: [
              "Niche specialization creates clarity: Explicitly a 'Web3 KOL agency'.",
              "Service mix is balanced: 40% blockchain marketing, 20% social media, 10% PR.",
              "Client satisfaction is high: Strong reviews on organic traffic and lead increases."
            ],
            weaknesses: [
              "No ROI guarantees create uncertainty: Explicitly states results vary drastically.",
              "Pricing ambiguity is frustrating: Pricing determined by 'supply/demand', feels arbitrary.",
              "No tech differentiation: No mention of dashboards, analytics, or AI tools."
            ],
            opportunity: "Offer real-time KOL performance dashboards (impressions, engagement, on-chain conversions per influencer) to provide accountability."
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
            info: "Founded: 2017. Target: Fintech, B2B, Crypto. Pricing: Starts $3,200/mo.",
            strengths: [
              "Pricing transparency is exceptional: Publicly disclosed tiers and deliverables.",
              "Data-driven positioning is credible: Explicitly markets analytics capabilities.",
              "Strong client feedback: Praise for updates and responsiveness."
            ],
            weaknesses: [
              "Not Web3-native: Positioning is generalist (SaaS, fintech, healthcare).",
              "No proprietary Web3 tooling: Uses standard tools (Google Analytics).",
              "Content deliverables feel commoditized: Volume-based rather than outcome-based."
            ],
            opportunity: "Offer transparent pricing PLUS Web3-native dashboards (on-chain attribution, token holder cohorts)."
          }
        },
        {
          id: "section-07",
          title: "Competitive Matrix",
          type: "table" as const,
          content: "Comparison of key features across top competitors.",
          columns: [
             { header: "Feature", key: "feature", width: "w-1/4" },
             { header: "RZLT", key: "rzlt", width: "w-1/6" },
             { header: "Coinbound", key: "coinbound", width: "w-1/6" },
             { header: "Lunar Strategy", key: "lunar", width: "w-1/6" },
             { header: "Our Edge", key: "us", width: "w-1/4" }
          ],
          data: [
            { feature: "AI-Native Systems", rzlt: "Yes (Claimed)", coinbound: "No", lunar: "No", us: "Core Core (AI SEO/GEO)" },
            { feature: "On-Chain Analytics", rzlt: "No", coinbound: "Yes (Strong)", lunar: "No", us: "Yes (Integrated)" },
            { feature: "Transparent Pricing", rzlt: "No", coinbound: "No", lunar: "No", us: "Yes (Public Tiers)" },
            { feature: "Self-Serve Diagnostic", rzlt: "No", coinbound: "No", lunar: "No", us: "Yes (Lead Magnet)" },
            { feature: "Real-Time Dashboard", rzlt: "No", coinbound: "Yes", lunar: "No", us: "Yes (Client Cockpit)" }
          ]
        },
        {
          id: "section-08",
          title: "Blue Ocean Opportunities",
          type: "list" as const,
          content: "Strategic gaps identified in the market:",
          data: [
            "Self-Serve Diagnostic + Freemium Entry Tier: No competitor offers a free tool to assess Web3 marketing maturity.",
            "Real-Time Client Dashboard with Experimentation Backlog: Only Coinbound has a dashboard; none combine metrics with experiments.",
            "AI Visibility & GEO Optimization as a Standalone Product: No competitor explicitly offers AI SEO (ChatGPT/Perplexity visibility).",
            "Performance-Based Pricing with On-Chain Attribution: Offer a hybrid model (base + bonus) tied to measurable on-chain outcomes."
          ]
        }
      ]
    };
  }

  // PHASE 03: TIMELINE (Strategic Roadmap)
  if (phaseIndex === 2) {
     return {
       id: "phase-03",
       badge: "Strategic Roadmap",
       title: titles[2],
       subtitle: subtitles[2],
       metadata: ["Input: Syndicate Part 3", "Status: Execution", "Timeline: 9 Months"],
       sources: [
         { source: 'Syndicate Part 3', title: 'Strategic Roadmap PDF', icon: 'picture_as_pdf' }
       ],
       visualTimeline: {
          title: "The Strategic Trajectory",
          subtitle: "Visualizing the 9-month execution path from foundational architecture to market optimization.",
          quarters: [
              { id: "Q1", title: "Foundation", months: ["JAN: ARCH", "FEB: INGEST", "MAR: ALPHA"], status: 'completed' },
              { id: "Q2", title: "Productization", months: ["APR: BETA", "MAY: AUDIT", "JUN: LAUNCH"], status: 'active' },
              { id: "Q3", title: "Optimization", months: ["JUL: SCALE", "AUG: SER A", "SEP: GLOB"], status: 'upcoming' }
          ],
          context: {
              title: "Why This Roadmap?",
              rejected: "Rejected due to high churn risk in saturating markets. Linear scaling proved inefficient for compounding AI models.",
              adopted: "Prioritizes heavy upfront architectural load (Phase 1) to enable rapid, frictionless scaling in Phase 3. Validated by cohort retention data."
          }
       },
       sections: [
         {
           id: "section-Intro",
           title: "Strategic Approach Selection",
           type: "text" as const,
           content: "Primary Methodology: Hybrid Service Design + Lean Agency Launch. This approach combines service design principles with lean startup validation and Web3-specific go-to-market tactics. The methodology prioritizes building reusable systems (AI workflows, dashboards, playbooks) over delivering custom one-offs, treating the agency itself as a product. Why this approach fits: Service design addresses the multi-stakeholder nature (agency team, clients, end-users, Web3 communities) and maps entire service ecosystems. Lean validation prevents over-building before market fit is proven."
         },
         {
           id: "section-Q1",
           title: "Phase 1: Foundation & Validation",
           type: "roadmap_phase" as const,
           content: "", // Content handled by data prop
           data: {
             phase: "Phase 1: Foundation & Validation",
             timeline: "Q1: Months 1-3",
             objectives: [
               { type: "Primary", content: "Validate core assumptions (AI SEO/GEO demand, on-chain analytics pricing power, dashboard-centric UX appeal) with 5–7 JTBD interviews and 2 pilot clients." },
               { type: "Secondary", content: "Build v1 service blueprints for Starter and Growth tiers; establish brand positioning and initial Web3 presence." }
             ],
             deliverables: [
               { title: "Service blueprints for Starter + Growth tiers", items: ["Map frontstage/backstage processes", "Identify automation opportunities", "Integration requirements (Dune, Discord)"] },
               { title: "Brand identity + positioning assets", items: ["Website with transparent pricing", "Self-serve 'Web3 Growth Score' lead magnet", "Case-study-ready structure"] },
               { title: "JTBD interview synthesis report", items: ["5-7 completed interviews", "Top 3 jobs-to-be-done identified", "Validation of AI visibility priority"] },
               { title: "Pilot client #1 (AI Visibility Sprint)", items: ["AI visibility audit", "Optimized content for 3-5 queries", "Baseline tracking dashboard", "Revenue: $5K-$8K"] },
               { title: "Pilot client #2 (Full Growth tier prototype)", items: ["60-day marketing system", "Analytics dashboard v1", "Revenue: $12K-$18K"] }
             ],
             decisions: [
               { title: "Proceed with pilot #1 or pivot?", stakeholders: "Founder, Pilot Client", deadline: "End of Week 6", criteria: "JTBD interviews show ≥3/5 prospects prioritize AI visibility OR client commits to $5K+ pilot." },
               { title: "Scale pilot learnings or iterate?", stakeholders: "Founder, Pilot Clients", deadline: "End of Week 10", criteria: "Pilot #1 delivers measurable outcomes AND client satisfaction ≥8/10." }
             ]
           }
         },
         {
           id: "section-Q2",
           title: "Phase 2: Productization & Scaling",
           type: "roadmap_phase" as const,
           content: "",
           data: {
             phase: "Phase 2: Productization & Scaling",
             timeline: "Q2: Months 4-6",
             objectives: [
               { type: "Primary", content: "Convert pilot learnings into scalable, repeatable service packages; close 3–5 full-price clients (mix of Starter + Growth tiers)." },
               { type: "Secondary", content: "Build v1 Client Cockpit dashboard; establish content marketing engine for inbound lead generation." }
             ],
             deliverables: [
               { title: "Finalized service packages + SOW templates", items: ["Scope, deliverables, timelines, SLAs", "Legal review complete", "Pricing matches Part 2 recommendations"] },
               { title: "Client Cockpit dashboard v1 (MVP)", items: ["Live metrics (traffic, leads, on-chain)", "Experiment pipeline", "AI-generated insights", "Built on no-code (Retool/Softr)"] },
               { title: "Content marketing system launch", items: ["2 blog posts/month, 4 LinkedIn posts/week", "Topics: AI SEO/GEO, on-chain analytics", "First 500 site visitors/month"] },
               { title: "3–5 new client engagements closed", items: ["Mix of Starter and Growth tiers", "Total MRR: $15K-$35K", "At least 1 Web3-native client"] },
               { title: "Referral + partnership pipeline", items: ["3-5 partnerships (dev shops, tokenomics)", "Referral program launched (10% discount)"] }
             ],
             decisions: [
               { title: "Launch Client Cockpit publicly?", stakeholders: "Founder, Clients", deadline: "End of Week 18", criteria: "Dashboard UX satisfaction ≥8/10 and usage ≥2x/week." },
               { title: "Hire full-time team member?", stakeholders: "Founder, Advisor", deadline: "End of Week 24", criteria: "MRR ≥$25K AND founder working >60 hrs/week." }
             ]
           }
         },
         {
           id: "section-Q3",
           title: "Phase 3: Optimization & Proof",
           type: "roadmap_phase" as const,
           content: "",
           data: {
             phase: "Phase 3: Optimization & Proof",
             timeline: "Q3: Months 7-9",
             objectives: [
               { type: "Primary", content: "Achieve 5–8 active clients, $40K–$60K MRR; produce 3 case studies with quantified ROI; refine Client Cockpit to v2." },
               { type: "Secondary", content: "Establish thought leadership (conference talks, podcasts); test performance-based pricing." }
             ],
             deliverables: [
               { title: "3 published case studies with metrics", items: ["Client background, challenges, solutions", "Measurable outcomes (e.g. 150% AI visibility lift)", "Video testimonials"] },
               { title: "Client Cockpit v2 with AI recommendations", items: ["AI-generated experiment ideas", "Competitive benchmarking", "Mobile-responsive design", "NPS ≥50"] },
               { title: "5–8 total active clients", items: ["$40K-$60K MRR", "Churn rate <10%", "At least 2 clients on performance pricing"] },
               { title: "Thought leadership program launched", items: ["2-3 speaking slots", "1 deep-dive content piece", "500+ social followers"] },
               { title: "Performance-based pricing pilot results", items: ["Hybrid pricing model validated", "Attribution model links to on-chain conversions", "≥$5K in bonuses"] }
             ],
             decisions: [
               { title: "Raise prices for new clients?", stakeholders: "Founder, Advisor", deadline: "End of Week 30", criteria: "Pipeline ≥10 qualified leads/month AND close rate ≥30%." },
               { title: "Expand service offerings?", stakeholders: "Founder, Team", deadline: "End of Week 36", criteria: "≥3 clients request add-ons AND team has bandwidth." }
             ]
           }
         },
         {
           id: "section-Milestones",
           title: "Milestone Summary",
           type: "table" as const,
           content: "Key milestones, owners, and success criteria for the 9-month execution roadmap.",
           columns: [
             { header: "Milestone", key: "id", width: "w-1/6" },
             { header: "Name", key: "name", width: "w-1/4" },
             { header: "Target Date", key: "targetDate", width: "w-1/6" },
             { header: "Success Criteria", key: "criteria", width: "w-1/3" },
             { header: "Dependencies", key: "dependencies", width: "w-1/6" }
           ],
           data: [
             { id: "M1", name: "Service blueprints finalized", targetDate: "Week 4", owner: "Founder", criteria: "Starter + Growth tier blueprints complete; automation opps identified", dependencies: "None" },
             { id: "M2", name: "Brand + website live", targetDate: "Week 5", owner: "Founder + Contractor", criteria: "Website published, transparent pricing, Lead magnet live", dependencies: "M1" },
             { id: "M3", name: "JTBD interviews complete", targetDate: "Week 6", owner: "Founder", criteria: "5-7 interviews done; top 3 jobs identified", dependencies: "None" },
             { id: "M4", name: "Pilot #1 delivered", targetDate: "Week 10", owner: "Founder", criteria: "AI Visibility Sprint complete; testimonial + metrics", dependencies: "M1, M2" },
             { id: "M5", name: "Pilot #2 delivered", targetDate: "Week 12", owner: "Founder + Contractor", criteria: "Full Growth tier engagement complete; case study draft", dependencies: "M1, M2, M4" },
             { id: "M6", name: "Q1 retrospective", targetDate: "Week 13", owner: "Founder", criteria: "Lessons documented; Q2 plan finalized", dependencies: "M3, M4, M5" },
             { id: "M7", name: "SOW templates + legal", targetDate: "Week 15", owner: "Founder", criteria: "Contracts legally reviewed and finalized", dependencies: "M6" },
             { id: "M8", name: "Client Cockpit v1 live", targetDate: "Week 18", owner: "Founder + Dev", criteria: "MVP dashboard live; 2 clients using it", dependencies: "M6, M7" },
             { id: "M9", name: "Content marketing launch", targetDate: "Week 20", owner: "Content Lead", criteria: "2 blog posts/mo, 4 LinkedIn/wk; 500 visitors", dependencies: "M6" },
             { id: "M10", name: "3-5 new clients closed", targetDate: "Week 24", owner: "Founder", criteria: "MRR $15K-$35K; mix of tiers", dependencies: "M7, M8, M9" },
             { id: "M11", name: "Q2 retro + hiring", targetDate: "Week 24", owner: "Founder", criteria: "Decide: hire FTE or stay lean?", dependencies: "M10" },
             { id: "M12", name: "3 case studies published", targetDate: "Week 32", owner: "Founder + Team", criteria: "Metrics + video testimonials published", dependencies: "M10" },
             { id: "M13", name: "Client Cockpit v2 live", targetDate: "Week 34", owner: "Founder + Dev", criteria: "AI recommendations, NPS ≥9/10", dependencies: "M8, M11" },
             { id: "M14", name: "5-8 active clients", targetDate: "Week 36", owner: "Founder + Team", criteria: "$40K-$60K MRR, Churn <10%", dependencies: "M10, M12" },
             { id: "M15", name: "Thought leadership", targetDate: "Week 36", owner: "Founder", criteria: "2-3 speaking slots, 500+ followers", dependencies: "M12" },
             { id: "M16", name: "Pricing pilot results", targetDate: "Week 36", owner: "Founder + Team", criteria: "≥$5K bonuses earned via attribution", dependencies: "M13, M14" },
             { id: "M17", name: "Q3 retro + Year 2 plan", targetDate: "Week 36", owner: "Founder + Team", criteria: "Roadmap set for Q4+", dependencies: "M14, M15, M16" }
           ]
         }
       ]
     };
  }

  // PHASE 04: CORE DESIGN (Formerly Growth Strategy)
  if (phaseIndex === 3) {
    return {
      id: "phase-04",
      badge: "Generative Specifications",
      title: "Core Design & UI Prompts",
      subtitle: "Architectural directives for the core application flows, defined as generative prompts.",
      metadata: ["Input: Syndicate Part 4", "Status: Ready for Generation", "Format: Prompt Engineering"],
      sources: [],
      sections: [
        {
          id: "section-01-directives",
          title: "Design Directives",
          type: "text" as const,
          content: "The following blueprints represent the 'architectural DNA' of the platform. They are structured as high-fidelity prompts designed to be fed into generative UI systems to produce production-ready interfaces. Each prompt details layout specifications, visual design systems, and step-by-step content requirements."
        },
        // PROMPT 1: Web3 Growth Score
        {
          id: "section-02-prompt-1",
          title: "Prompt 1: Lead Magnet",
          type: "blueprints" as const,
          content: "Multi-step assessment flow for lead capture.",
          data: [{
            id: "PROMPT-01",
            title: "Web3 Growth Score Assessment",
            description: "Multi-Step Lead Capture Flow",
            prompt: `Design a modern, high-conversion 4-step assessment flow for a Web3 marketing agency's lead magnet.
            
CONTEXT:
This tool assesses a Web3 project's marketing maturity and gives them a 0-100 score. It is the primary lead capture device.

STYLE:
- Minimalist, high-end "Fintech" aesthetic (think Linear meets Coinbase).
- White background, sharp black text, electric blue accents (#0047AB).
- Smooth transitions between steps (framer-motion).

STEPS:
1. "Project Basics":
   - Input: Project Name, Website URL.
   - Selector: Project Type (DeFi / NFT / Infra / SaaS / DAO).
   - Visual: Cards with simple icons for Project Type.

2. "Current Traction":
   - Slider: Monthly Marketing Budget ($0 - $50k+).
   - Input: Current Community Size (Twitter + Discord combined).
   - Checkbox Group: "Which analytics do you use?" (GA4, Dune, Nansen, None).

3. "The 'AI Visibility' Test":
   - "Have you checked how your brand appears in ChatGPT?" (Yes/No toggle).
   - "Do you have a structured SEO strategy?" (Yes/No toggle).

4. "Results & Capture":
   - Email Input (Floating label).
   - "Calculate Score" Button (Full width, primary color).
   - Micro-copy: "We'll email your full report instantly. No spam."

OUTPUT UI:
- Show a radial progress bar animating to the calculated score.
- Display 3 key "Actionable Insights" cards based on their answers.
- CTA: "Book a Strategy Call to fix this" (Secondary button).` 
          }]
        },
        // PROMPT 2: Client Cockpit
        {
          id: "section-02-prompt-2",
          title: "Prompt 2: Client Dashboard",
          type: "blueprints" as const,
          content: "The central hub for client reporting and transparency.",
          data: [{
            id: "PROMPT-02",
            title: "Client Cockpit Dashboard",
            description: "Main view for retained clients.",
            prompt: `Design the "Client Cockpit" dashboard view for a Web3 marketing agency client.

LAYOUT:
- Sidebar Navigation (Left, 240px, dark mode optional): Overview, Campaigns, AI Visibility, On-Chain Metrics, Settings.
- Main Content Area (White background, card-based layout).

HEADER:
- "Welcome back, [Client Name]".
- Date Range Picker (Top right).
- Status Indicator: "System Active" (Green dot).

KEY METRIC CARDS (Top Row):
1. "Total Spend": $12,450 (vs last month).
2. "AI Visibility Score": 72/100 (+12% lift).
3. "Net New Leads": 342.
4. "On-Chain Conversions": 45 (Wallet connects).

MAIN CHART (Middle):
- Dual-axis line chart: "Web Traffic" (Left axis, blue line) vs. "Wallet Connections" (Right axis, grey bars).
- Title: "Correlation: Awareness to Action".

LOWER SECTION (2 Columns):
- Left (Activity Feed): "Recent Actions" list. E.g., "Published blog post: 'DeFi Trends'", "Optimized 5 keywords", "Weekly Report Generated".
- Right (AI Insights): "Agent Alpha recommends: Increase LinkedIn posting frequency to 3x/week based on recent engagement spike."

STYLE GUIDANCE:
- Use 'Inter' or 'Epilogue' font.
- Clean borders, subtle drop shadows (box-shadow: 4px 4px 0px rgba(0,0,0,0.05)).
- Data visualization colors: Blue (#0047AB), Teal (#14B8A6), Grey (#64748B).`
          }]
        },
        // PROMPT 3: Experiment Builder
        {
          id: "section-02-prompt-3",
          title: "Prompt 3: Experiment Builder",
          type: "blueprints" as const,
          content: "Interface for proposing and approving marketing experiments.",
          data: [{
            id: "PROMPT-03",
            title: "AI Experiment Builder",
            description: "Campaign proposal interface.",
            prompt: `Design the "Experiment Builder" modal or page where the agency proposes new marketing tests to the client.

STRUCTURE:
- Header: "New Experiment Proposal".
- Form Layout: Single column, clear hierarchy.

FIELDS:
1. Hypothesis: Text area. "If we [action], then [result] will happen."
2. AI-Generated Suggestions: "Auto-fill with AI" button.
3. Target Metric: Dropdown (e.g., "Wallet Connects", "Discord Joins").
4. Budget Allocation: Input ($).
5. Duration: Toggle (1 week / 2 weeks / 1 month).

PREDICTION CARD (Right side or Bottom):
- "Projected Outcome": High/Low estimate of results.
- "Confidence Score": 85% (Visual gauge).

APPROVAL FLOW:
- "Approve Experiment" Button (Green).
- "Request Changes" Button (Ghost).
- Comment section for client feedback.

AESTHETIC:
- Scientific but accessible.
- Use badge colors to denote "Experimental" vs "Proven" tactics.`
          }]
        },
        // PROMPT 4: Account Settings
        {
          id: "section-02-prompt-4",
          title: "Prompt 4: Account Settings",
          type: "blueprints" as const,
          content: "Account Settings - Client Profile & Preferences Management.",
          data: [{
            id: "PROMPT-04",
            title: "Account Settings",
            description: "Client Profile & Preferences Management",
            prompt: `Design a comprehensive account settings interface organized with tab navigation. The UX should be standard B2B SaaS.

LAYOUT SPECIFICATION:
- Container: 1120px max-width, centered, 48px horizontal padding
- Tab navigation: Horizontal tabs on desktop, vertical on mobile
- Content area: Full-width within container, 32px padding

HEADER (80px height):
- Breadcrumb: "Dashboard > Settings"
- Title: "Account Settings" (24px, 600 weight)
- Save indicator (right): Auto-saved notification

TAB NAVIGATION:
1. "Profile" (icon: User)
2. "Team & Access" (icon: Users)
3. "Integrations" (icon: Plugs)
4. "Billing & Plans" (icon: CreditCard)
5. "Notifications" (icon: Bell)
6. "Security" (icon: Shield)

TAB 1 - PROFILE CONTENT:
- Avatar Upload: 120px circle, "Change Photo" ghost button.
- Form Fields (2-col): Display Name, Email (disabled), Title/Role, Company Name, Website, Twitter, Discord ID.
- Section: Time Zone & Language.
- Section: Danger Zone (Delete Account).

TAB 2 - TEAM & ACCESS CONTENT:
- Team Members Table: Member, Role (Owner/Admin/Viewer), Status, Last Active, Actions.
- Invite Member Button (opens modal).

TAB 3 - INTEGRATIONS:
- Connected Integrations Grid: Google Analytics, Discord, Twitter API, Dune, Stripe.
- Each card shows status (Connected/Not), key data point, and Configure/Disconnect buttons.

TAB 4 - BILLING:
- Current Plan Badge (Growth Plan).
- Payment Method card (Visa ending 4242).
- Billing History table.

TAB 5 - NOTIFICATIONS:
- Toggles for Email and Dashboard notifications, grouped by category (Experiments, Billing, System).`
          }]
        },
        {
           id: "section-end-p4",
           title: "End of Phase 4",
           type: "text" as const,
           content: "Proceed to Phase 5 for Edge Cases."
        }
      ]
    };
  }

  // PHASE 05: ADVANCED SCREENS & EDGE CASES
  if (phaseIndex === 4) {
    return {
      id: "phase-05",
      badge: "Edge Cases & States",
      title: "Advanced Screens & Edge Cases",
      subtitle: "Comprehensive system states including error handling, empty states, and loading patterns.",
      metadata: ["Input: Syndicate Part 5", "Status: Specification", "Scope: UX Resilience"],
      sources: [],
      sections: [
        {
          id: "section-01-intro",
          title: "UX Resilience Strategy",
          type: "text" as const,
          content: "A robust application must handle the 'unhappy paths' with as much care as the ideal user journey. This section defines the visual and interaction specifications for empty states, errors, loading sequences, and notifications to ensure user confidence remains high even when the system faces friction."
        },
        // PROMPT 6: Empty States
        {
          id: "section-05-prompt-6",
          title: "Prompt 6: Empty States",
          type: "blueprints" as const,
          content: "First-Time User & Zero-Data Experiences.",
          data: [{
            id: "PROMPT-06",
            title: "Empty States Library",
            description: "First-Time User & Zero-Data Experiences",
            prompt: `Design a comprehensive set of empty state screens for a Web3 marketing agency dashboard.

VISUAL DESIGN SYSTEM:
- All empty states: Max-width 560px, centered vertically and horizontally.
- Illustration Style: Isometric line art with gradient accents (Primary to Secondary).

SCENARIO A: NO EXPERIMENTS YET (New Dashboard User)
- Illustration: Laboratory beaker with upward growth chart inside, sparkles.
- Headline: "No experiments running yet"
- Subheadline: "Start testing new marketing tactics to improve your performance."
- Primary CTA: "Create Your First Experiment" (+ icon).
- Secondary CTA: "Browse Experiment Templates".

SCENARIO B: NO SEARCH RESULTS
- Illustration: Magnifying glass with question mark inside.
- Headline: "No results for '[search term]'"
- Suggestions: "Check your spelling", "Try more general keywords".
- Actions: "Clear all filters", "Contact support".

SCENARIO C: NO NOTIFICATIONS
- Illustration: Check mark inside peaceful circle.
- Headline: "You're all caught up!"

SCENARIO D: PERMISSION REQUIRED
- Illustration: Shield with lock icon.
- Headline: "Access restricted"
- CTA: "Request Access" or "Upgrade Plan".

SCENARIO E: NO ANALYTICS DATA
- Illustration: Plug icon connecting to dashboard icon (dashed line).
- Headline: "Connect data sources to see analytics"
- Steps: Visual step indicator (Connect -> Authorize -> Syncing).

SCENARIO F: NO TEAM MEMBERS
- Illustration: Two silhouette figures with "+" between them.
- Headline: "Your team is just you—for now"
- CTA: "Invite Team Member".`
          }]
        },
        // PROMPT 7: Error States
        {
          id: "section-05-prompt-7",
          title: "Prompt 7: Error States",
          type: "blueprints" as const,
          content: "Validation, API Failures & Recovery Flows.",
          data: [{
            id: "PROMPT-07",
            title: "Error Handling System",
            description: "Validation, API Failures & Recovery Flows",
            prompt: `Design a comprehensive error handling system.

ERROR TYPE A: FORM VALIDATION
- Inline: Below input, red text, shake animation on submit.
- Input State: Red border, red background tint (10% opacity).
- Error Summary: Top of form, "Please fix 3 errors", links scroll to fields.

ERROR TYPE B: API / SYSTEM ERRORS
- Temporary Error: Modal overlay, "Something went wrong", "Try Again" button.
- 500 Error: Full page illustration (Server rack), "System Overload", "Refresh".
- 404 Error: Astronaut floating in space, "Page not found", "Return Home" button.
- Permission Denied (403): Lock icon, "You don't have access".

ERROR TYPE C: NETWORK / OFFLINE
- Banner: Fixed top, full-width, "You're offline. Some features may not work." (Yellow/Warning).
- Action: "Retry Connection".

RECOVERY SUCCESS FEEDBACK:
- After fixing error: Input border turns green briefly (Success state).
- Toast: "Changes saved successfully".`
          }]
        },
        // PROMPT 8: Loading & Skeleton
        {
          id: "section-05-prompt-8",
          title: "Prompt 8: Loading & Skeleton Screens",
          type: "blueprints" as const,
          content: "Progressive Content Reveal patterns.",
          data: [{
            id: "PROMPT-08",
            title: "Loading States",
            description: "Skeleton Screens & Progress Indicators",
            prompt: `Design a comprehensive loading system.

LOADING PATTERN A: SKELETON SCREENS
- Use for: Dashboard, Card Grids, Tables.
- Style: Gray pulsing rectangles (Opactiy 0.3 to 0.7).
- Header: Circle (Avatar) + Rectangle (Title).
- Chart: Y-axis lines + Rectangle bars.
- Animation: Linear gradient shimmer moving left to right.

LOADING PATTERN B: PROGRESS INDICATORS
- Linear Bar: Top of screen, fixed, for page loads.
- Modal Progress: "Uploading file...", Percentage text, Cancel button.
- Circular Spinner: Inside buttons ("Saving..."), or centered in small widgets.

LOADING PATTERN C: OPTIMISTIC UI
- Toggle Switch: Instantly moves to "On", background API call.
- If fail: Revert toggle, show Error Toast.

LOADING PATTERN D: LAZY LOADING
- Images: Blur-up effect (Low res -> High res).
- Infinite Scroll: Spinner at bottom of list "Loading more...".`
          }]
        },
        // PROMPT 9: Notifications
        {
          id: "section-05-prompt-9",
          title: "Prompt 9: Notifications & Alerts",
          type: "blueprints" as const,
          content: "Toasts, Modals, Banners & Badges.",
          data: [{
            id: "PROMPT-09",
            title: "Notification System",
            description: "Toasts, Modals, Banners & Badges",
            prompt: `Design a comprehensive notification system.

TYPE A: TOAST NOTIFICATIONS
- Position: Top-right fixed. Stacking.
- Success: Green check icon, "Changes saved". Auto-dismiss (3s).
- Error: Red alert icon, "Upload failed". Persistent until closed. Action: "Retry".
- Warning: Yellow triangle, "Subscription ending soon".

TYPE B: MODAL ALERTS
- Destructive: "Delete Account?", Red warning icon, "Delete" button (Red), "Cancel" (Ghost).
- Info: "New features available", Blue info icon, "Got it" button.

TYPE C: INLINE BANNERS
- Page Level: Top of content area.
- Info: Blue background tint, "New export options available".
- Warning: Yellow tint, "Payment method expiring".
- Error: Red tint, "System maintenance scheduled".

TYPE D: BADGES
- Notification Bell: Red dot with number count.
- Status Badges: "Active" (Green), "Draft" (Gray), "Error" (Red).`
          }]
        },
         {
           id: "section-end-p5",
           title: "End of Phase 5",
           type: "text" as const,
           content: "Proceed to Phase 6 for Risk Assessment."
        }
      ]
    };
  }

  // PHASE 06: RISK, METRICS & ROI
  if (phaseIndex === 5) {
    return {
      id: "phase-06",
      badge: "Strategic Analysis",
      title: "Risk Assessment, Metrics & ROI",
      subtitle: "Critical exposure analysis, success metrics, and financial justification for the 9-month execution plan.",
      metadata: ["Input: Syndicate Part 6", "Status: Review Pending", "Scope: Validation & Finance"],
      sources: [
        { source: 'Perplexity', title: 'Syndicate Part 6', icon: 'description' }
      ],
      sections: [
        {
          id: "section-risk-matrix",
          title: "Risk Assessment Dossier",
          type: "risk_dossier_header" as const,
          content: "",
          data: {
             title: "Critical Exposure Analysis",
             description: "The current architectural posture exhibits a high dependency on single-vendor APIs (OpenAI), creating a critical operational bottleneck. Financial exposure is moderate but correlates strongly with compute cost volatility.",
             score: "72/100 (High)",
             strategic: [], // Data moved to cards
             operational: [], 
             financial: []
          }
        },
        {
          id: "section-risk-strategic",
          title: "", // Title handled by card
          type: "phase_card" as const,
          content: "",
          data: {
            id: "CLUSTER 01",
            title: "Strategic Risks",
            subtitle: "Market positioning, competitive erosion, and core value proposition failure.",
            timeline: "High Impact",
            focus: "Market Fit",
            status: "CRITICAL",
            deliverables: [
              "R1: AI visibility (SEO/GEO) fails to drive meaningful traffic in 30-60 days.",
              "R6: Web3 market downturn reduces client budgets significantly.",
              "R7: Competitors launch copycat AI-native dashboards."
            ],
            criteria: [
              "Run 2 pilot case studies with explicit KPIs to validate AI value.",
              "Adopt dual positioning (Web2/Web3) to diversify client base.",
              "Accelerate launch timeline to establish 'first mover' brand authority."
            ],
            dependencies: "Founder execution speed. Market conditions.",
            touchpoints: "High likelihood (30%)",
            risk: {
              name: "AI Value Proposition Failure",
              mitigation: "Pivot to traditional SEO + Dashboard positioning if AI metrics fail."
            }
          }
        },
        {
          id: "section-risk-operational",
          title: "",
          type: "phase_card" as const,
          content: "",
          data: {
            id: "CLUSTER 02",
            title: "Operational Risks",
            subtitle: "Execution bottlenecks, resource constraints, and delivery failures.",
            timeline: "High Impact",
            focus: "Execution",
            status: "CRITICAL",
            deliverables: [
              "R2: Client Cockpit v1 delayed beyond Week 18.",
              "R3: Founder bandwidth bottleneck (sales vs delivery).",
              "R5: Case studies underperform or clients refuse testimonials.",
              "R10: Support scalability issues with 8+ clients."
            ],
            criteria: [
              "Use no-code tools (Retool) to ensure delivery speed.",
              "Hire part-time contractor by Week 4 to offload execution.",
              "Incentivize case studies ($500 credit) in pilot contracts.",
              "Productize services to reduce founder hours per client."
            ],
            dependencies: "Contractor availability. Tool reliability.",
            touchpoints: "High likelihood (40%)",
            risk: {
              name: "Founder Burnout",
              mitigation: "Extend timeline by 4-8 weeks and reduce pilot scope to 1 client."
            }
          }
        },
        {
          id: "section-risk-financial",
          title: "",
          type: "phase_card" as const,
          content: "",
          data: {
            id: "CLUSTER 03",
            title: "Financial & Legal Risks",
            subtitle: "Cash flow, compliance, and technical integration costs.",
            timeline: "Medium Impact",
            focus: "Viability",
            status: "MODERATE",
            deliverables: [
              "R4: On-chain analytics integration complexity exceeds budget.",
              "R8: GDPR/CCPA compliance gaps in dashboard handling wallet data.",
              "R9: Early client churn due to unrealistic expectations."
            ],
            criteria: [
              "Start with manual reporting before automating complex queries.",
              "Conduct legal review by Week 12; implement consent flows.",
              "Set explicit '90-Day Roadmap' expectations during sales."
            ],
            dependencies: "Legal counsel. 3rd party API pricing.",
            touchpoints: "Medium likelihood (30%)",
            risk: {
              name: "Integration Cost Blowout",
              mitigation: "Offer 'consultation' instead of automated dashboard for complex metrics."
            }
          }
        },
        {
          id: "section-metrics-primary",
          title: "Primary KPIs (North Star Metrics)",
          type: "table" as const,
          content: "Key Performance Indicators (KPIs) tracked to validate product-market fit and operational health.",
          columns: [
             { header: "Metric", key: "metric", width: "w-1/4" },
             { header: "Baseline", key: "baseline", width: "w-1/6" },
             { header: "Target (M3)", key: "target3", width: "w-1/4" },
             { header: "Target (M9)", key: "target9", width: "w-1/4" },
             { header: "Method", key: "method", width: "w-1/6" }
          ],
          data: [
            { metric: "Monthly Recurring Revenue", baseline: "$0", target3: "$15,000 (2-3 clients)", target9: "$50,000 (6-8 clients)", method: "Stripe" },
            { metric: "Client NPS", baseline: "N/A", target3: "≥40 (Acceptable)", target9: "≥60 (Excellent)", method: "Typeform" },
            { metric: "Dashboard Login Freq", baseline: "N/A", target3: "≥3x per week", target9: "≥5x per week", method: "PostHog" },
            { metric: "Pilot Success Rate", baseline: "N/A", target3: "100% (2/2 pilots)", target9: "N/A", method: "Binary" },
            { metric: "Thought Leadership", baseline: "0", target3: "+500 followers", target9: "+2,000 followers", method: "Social" }
          ]
        },
        {
          id: "section-metrics-secondary",
          title: "Secondary Metrics (Supporting Indicators)",
          type: "list" as const,
          content: "Client Acquisition & Pipeline:",
          data: [
             "Lead generation rate: 10+ qualified leads/month by Month 6 (source: content, referrals, outbound).",
             "Lead-to-client conversion rate: ≥30% (3 clients from 10 leads) by Month 6.",
             "Sales cycle length: ≤4 weeks (first contact → signed contract).",
             "Onboarding completion rate: 100% (all clients complete setup within 7 days).",
             "Experiment launch rate: ≥1 new experiment per client per month (shows engagement).",
             "Client check-in attendance: ≥90% (clients attend scheduled monthly calls).",
             "Experiment success rate: ≥60% of experiments meet or exceed targets.",
             "AI visibility citations: ≥10 citations per client by Month 3 (cumulative).",
             "On-chain attribution: Track ≥50% of conversions to marketing (where applicable).",
             "Churn rate: ≤10% (lose ≤1 client in 9 months).",
             "Expansion revenue: ≥20% of clients upgrade tier or add services by Month 9.",
             "Contract renewal rate: 100% of pilots convert to ongoing retainer."
          ]
        },
        {
          id: "section-metrics-ops",
          title: "Operational & UX Metrics",
          type: "list" as const,
          content: "Operational Efficiency & UX:",
          data: [
             "Founder hours per client: ≤15 hrs/week by Month 9 (via automation + hiring).",
             "Support ticket volume: ≤5 tickets per client per month.",
             "Dashboard uptime: ≥99.5% (minimal downtime).",
             "Dashboard task completion rate: ≥95% (users successfully complete core tasks).",
             "Error rate: ≤2% (failed API calls, broken integrations).",
             "Accessibility score: WCAG 2.1 AA compliant (100% of core flows).",
             "Mobile usage: ≥20% of dashboard sessions from mobile by Month 9."
          ]
        },
        {
          id: "section-okrs",
          title: "Business OKR Alignment",
          type: "list" as const,
          content: "Strategic objectives mapping the initiative to broader business goals.",
          data: [
             "Objective 1: Achieve Product-Market Fit. Key Results: Close 2 pilots (Week 12), $15K MRR (Month 3), Validate AI visibility with 3 case studies.",
             "Objective 2: Establish Market Leadership. Key Results: 2,000+ social followers, Rank top 3 Google for 'AI marketing Web3', Generate 10+ leads/month.",
             "Objective 3: Build Scalable Operations. Key Results: Reduce founder hours to ≤15/client/week, 90% client retention, Productize 3 reusable systems."
          ]
        },
        {
          id: "section-strategic-alignment",
          title: "Strategic Alignment Matrix",
          type: "table" as const,
          content: "Mapping business priorities to UX contributions.",
          columns: [
             { header: "Priority", key: "priority", width: "w-1/4" },
             { header: "UX Contribution", key: "ux", width: "w-1/3" },
             { header: "Measurement", key: "measure", width: "w-1/4" },
             { header: "Timeline", key: "time", width: "w-1/6" }
          ],
          data: [
            { priority: "Revenue Growth", ux: "Transparent pricing reduces sales friction; dashboard justifies premium.", measure: "MRR, Close rate", time: "Month 1-9" },
            { priority: "Client Retention", ux: "Real-time dashboard eliminates 'black box' anxiety; Error recovery prevents frustration.", measure: "Churn rate, NPS", time: "Month 3-9" },
            { priority: "Differentiation", ux: "Client Cockpit = unique IP. AI visibility = future-proof niche.", measure: "Thought leadership", time: "Month 6-9" },
            { priority: "Efficiency", ux: "AI insights reduce reporting; Productized services scale.", measure: "Founder hours", time: "Month 6-9" }
          ]
        },
        {
           id: "section-roi-investment",
           title: "Investment Required",
           type: "table" as const,
           content: "Detailed cost breakdown for the 9-month execution.",
           columns: [
             { header: "Category", key: "cat", width: "w-1/4" },
             { header: "Est. Cost", key: "cost", width: "w-1/4" },
             { header: "Timeframe", key: "time", width: "w-1/4" },
             { header: "Notes", key: "notes", width: "w-1/4" }
           ],
           data: [
             { cat: "Design Resources", cost: "$0", time: "Weeks 1-18", notes: "Founder executed (16+ yrs exp) using AI tools + Figma." },
             { cat: "Dev (Cockpit)", cost: "$3k-$5k or 60-80 hrs", time: "Weeks 8-18", notes: "No-code (Retool/Softr) + contractor integration." },
             { cat: "Research/Testing", cost: "$1,000 or 20 hrs", time: "Weeks 1-12", notes: "5-7 JTBD interviews, usability testing incentives." },
             { cat: "Tools/Infra", cost: "$3,600/year", time: "Ongoing", notes: "Perplexity, Dune Pro, PostHog, Retool, ConvertKit." },
             { cat: "Legal/Compliance", cost: "$1,500 one-time", time: "Week 12", notes: "Contract templates, privacy policy review, GDPR." },
             { cat: "Contractor (Content)", cost: "$15k-$20k", time: "Weeks 4-36", notes: "Part-time 15-20 hrs/week for 8 months." },
             { cat: "Marketing (Lead Gen)", cost: "$2,000", time: "Weeks 16-36", notes: "Tool dev, content tools, minimal ads/events." },
             { cat: "Pilot Discounts", cost: "$6,000 (opportunity)", time: "Weeks 6-12", notes: "2 pilots at discounted rate vs standard." },
             { cat: "Founder Salary", cost: "$45,000 (opportunity)", time: "Weeks 1-36", notes: "Foregone $60k/year salary during buildout." }
           ]
        },
        {
           id: "section-roi-analysis",
           title: "ROI Justification",
           type: "roi_analysis" as const,
           content: "Financial projection comparing cash-only investment vs. full economic cost including opportunity cost.",
           data: [
             {
               title: "Scenario 1: Cash-Only ROI",
               investment: "$32,100 - $39,100",
               mrr: "$50,000 ($600K ARR)",
               roi: "820 - 1,020%",
               payback: "1 month of Month 9 MRR"
             },
             {
               title: "Scenario 2: Full Economic ROI",
               investment: "$77,100 - $84,100",
               mrr: "$50,000 ($600K ARR)",
               roi: "330 - 370%",
               payback: "1.5 - 2 months of Month 9 MRR"
             }
           ]
        },
        {
          id: "section-roi-details",
          title: "Detailed ROI Benefits",
          type: "text" as const,
          content: "Break-Even Point: Cash break-even at Month 5-6 (cumulative revenue ~$40K covers spend). Economic break-even at Month 7-8. Risk-Adjusted ROI: Success scenario (70% probability) achieves $360K net profit. Moderate scenario (20%) achieves $216K. Failure scenario (10%) recovers costs ($0-$50K net). Expected value: $300K net profit."
        },
        {
          id: "section-qualitative-benefits",
          title: "Qualitative Benefits",
          type: "list" as const,
          content: "Strategic value beyond immediate revenue:",
          data: [
            "Competitive Differentiation: Only Web3 agency with public pricing + real-time dashboard + AI visibility.",
            "Brand Authority: 3 case studies + thought leadership position founder as category expert.",
            "Scalability: Reusable blueprints and AI workflows enable scaling to 15-20 clients in Year 2 without proportional cost.",
            "Validation: De-risks future fundraising by proving model with traction.",
            "Team & Culture: Data-driven ops attract top talent; founder maintains work-life balance."
          ]
        },
        {
           id: "section-compliance",
           title: "Compliance Checkpoints",
           type: "table" as const,
           content: "Regulatory requirements and implementation status.",
           columns: [
             { header: "Regulation", key: "reg", width: "w-1/6" },
             { header: "Applicability", key: "apply", width: "w-1/6" },
             { header: "Status", key: "status", width: "w-1/6" },
             { header: "Required Actions", key: "action", width: "w-1/3" },
             { header: "Deadline", key: "deadline", width: "w-1/6" }
           ],
           data: [
             { reg: "GDPR (EU)", apply: "Yes (Wallet = PII)", status: "Gap", action: "Privacy policy update, Cookie banner, DPA template, 'Delete my data' flow.", deadline: "Week 12" },
             { reg: "CCPA (California)", apply: "Yes", status: "Gap", action: "'Do Not Sell' link, Privacy policy update, Data request tool.", deadline: "Week 12" },
             { reg: "WCAG 2.1 AA", apply: "Yes", status: "Partial", action: "Accessibility audit (axe DevTools), fix contrast/nav issues.", deadline: "Week 18" },
             { reg: "CAN-SPAM", apply: "Yes", status: "Gap", action: "Physical address in emails, 1-click unsubscribe, auto-compliance tools.", deadline: "Week 16" },
             { reg: "SOC 2 Type II", apply: "Maybe (Enterprise)", status: "N/A", action: "No action in first 9 months. Revisit if 2+ Enterprise clients request it.", deadline: "Month 12+" }
           ]
        },
        {
          id: "section-strategic-notes",
          title: "Strategic Notes: Behind the Decision",
          type: "text" as const,
          content: "Choice 1: Hybrid Positioning (Web2/Web3) vs. Web3-Only. Chosen to mitigate market risk (Web3 volatility) and access larger TAM ($50B+ vs $5B). Competitive analysis shows incumbents struggling to scale. Reversibility is high. Choice 2: Dashboard-Centric UX (Build vs. Buy). Chosen for competitive differentiation (Coinbound hides theirs) and cost efficiency ($3K-$5K no-code vs $50K custom). Choice 3: Lean Validation (Pilots First). Chosen to validate assumptions before hiring. Choice 4: AI Visibility as Primary Differentiator. Blue ocean opportunity vs commoditized SEO. Choice 5: Transparent Pricing. Chosen to reduce sales friction and align with 'innovative' brand positioning."
        },
        {
          id: "section-assumptions",
          title: "Critical Assumptions",
          type: "list" as const,
          content: "Assumptions that must hold true:",
          data: [
            "1. AI visibility (AI SEO/GEO) will become a meaningful traffic driver by 2026-2027. Validation: Track citations for 2 pilots. Threshold: ≥10 citations by Week 12.",
            "2. Web3/Web2 buyers are willing to pay $8K-$15K/mo for 'marketing systems' vs traditional execution. Validation: Pilot pricing test and win/loss analysis.",
            "3. Real-time dashboard creates sufficient differentiation to justify premium pricing. Validation: NPS survey and login analytics."
          ]
        },
        {
          id: "section-recommendation-change",
          title: "What Would Change Our Recommendation",
          type: "list" as const,
          content: "Scenario Planning:",
          data: [
            "Scenario 1: If pilot results show weak AI visibility outcomes (<5 citations) -> De-prioritize AI visibility, lead with Dashboard + Systems.",
            "Scenario 2: If founder can't hire reliable contractor -> Extend timeline 4-8 weeks, reduce pilot scope.",
            "Scenario 3: If dashboard build delayed beyond Week 22 -> Launch 'manual dashboard' v0.5 (Notion + Dune embeds).",
            "Scenario 4: If 2+ enterprise clients request SOC 2 -> Fast-track SOC 2 Type II audit ($15k-$50k investment).",
            "Scenario 5: If Web3 market crashes -> Aggressively pivot to Web2 SaaS/fintech, rebrand as 'AI-native agency'."
          ]
        },
        {
          id: "section-final-summary",
          title: "Final Executive Summary",
          type: "text" as const,
          content: "The Web3 marketing agency market is professionalizing. Clients demand attribution and insights, yet competitors lack comprehensive solutions. We recommend launching a lean, founder-led agency using a hybrid Service Design + Lean Validation approach. Key deliverables include a Web3 Growth Score lead magnet, 2 pilot engagements with case studies, and a Client Cockpit Dashboard v1. With a total cash investment of ~$35K and an expected MRR of $50K by Month 9, the initiative offers a high ROI (820% cash-only) and a defensible competitive moat."
        },
        {
          id: "section-next-steps",
          title: "Immediate Next Steps",
          type: "list" as const,
          content: "Action Plan:",
          data: [
            "1. Conduct 5-7 JTBD Interviews (Weeks 1-6). Create script, outreach to 20 founders.",
            "2. Design 'Web3 Growth Score' Lead Magnet (Weeks 2-5). Wireframe 4-step flow.",
            "3. Draft Service Blueprints for Starter + Growth Tiers (Weeks 1-4). Map frontstage/backstage workflows.",
            "4. Verify Verification Gate: Design prompts ready, Competitor data sourced, Metrics measurable, Risks mitigated."
          ]
        }
      ]
    };
  }

  // Fallback for Phase 5 & 6 (preserving structure)
  return {
    id: `phase-0${phaseIndex + 1}`,
    badge: `Analysis Phase 0${phaseIndex + 1}`,
    title: titles[phaseIndex],
    subtitle: subtitles[phaseIndex],
    metadata: ["Authored by Agent Alpha", `Phase Depth: Level ${phaseIndex + 3}`, "Confidential"],
    sources: [],
    sections: []
  };
};

export default function App() {
  const [activeSection, setActiveSection] = useState<string>('01');
  const [currentPhase, setCurrentPhase] = useState<number>(0);
  
  // Current Data based on Phase
  const phaseData = generatePhaseData(currentPhase);
  
  // Extract section IDs for the Sidebar (Dynamic Navigation)
  // We filter out null IDs just in case
  const sectionIds = phaseData.sections ? phaseData.sections.map(section => section.id.replace('section-', '')) : [];

  useEffect(() => {
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
    
    setTimeout(() => {
      const sections = document.querySelectorAll('section[id^="section-"]');
      sections.forEach((section) => observer.observe(section));
    }, 100);

    return () => observer.disconnect();
  }, [currentPhase]);

  return (
    <div className="flex min-h-screen bg-off-white text-charcoal font-sans selection:bg-technical-blue selection:text-primary relative">
      
      {/* Fixed Left Navigation (Intra-page) */}
      <Sidebar activeSection={activeSection} sectionIds={sectionIds} />

      {/* Main Content Area */}
      <main className="flex-1 ml-0 lg:ml-24 min-h-screen flex flex-col relative transition-opacity duration-300">
        <Header 
          currentPhase={currentPhase} 
          setPhase={setCurrentPhase} 
        />
        
        <div className="flex-1 flex flex-col lg:flex-row">
          {/* Scrollable Article Content */}
          <div className="flex-1 bg-white min-w-0"> 
            <Article key={currentPhase} data={phaseData} />
          </div>

          {/* Fixed/Sticky Right Panel for Desktop */}
          <RightPanel sources={phaseData.sources} />
        </div>
      </main>
    </div>
  );
}