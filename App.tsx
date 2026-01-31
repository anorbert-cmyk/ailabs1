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
    "Design System Blueprints"
  ];

  const subtitles = [
    "Validation of core assumptions",
    "Landscape analysis and strategic gaps",
    "Visualizing the 9-month execution path from foundational architecture to market optimization.",
    "Architectural directives for the core application flows, defined as generative prompts",
    "Comprehensive system states including error handling, empty states, and loading patterns",
    "Generative UI Directives & Tokens"
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
        // ... (Other competitors omitted for brevity in XML, but would be here)
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
           id: "section-Errors",
           title: "Error Path Mapping",
           type: "error_path_grid" as const,
           content: "",
           data: [
             {
               id: "ERR-01",
               title: "Client Onboarding Confusion",
               scenario: "New client signs for Growth tier ($10K) but expects Enterprise deliverables (dedicated Slack, weekly calls). Frustration builds.",
               impact: "Lost $30K-$120K LTV, negative review risk, firefighting.",
               recovery: "Automated Microcopy & Visual Checklist",
               details: "Send Day 1 automated email explicitly listing inclusions vs add-ons. Client Cockpit onboarding checklist shows progress bars for deliverables with tooltips explaining scope. If client messages about out-of-scope items, auto-reply with upgrade CTA."
             },
             {
               id: "ERR-02",
               title: "Dashboard Integration Failure",
               scenario: "Client logs in, sees 'No data available'. Doesn't know how to connect analytics. assumes dashboard is broken/fake.",
               impact: "Dashboard differentiation fails; client perceives agency as traditional.",
               recovery: "Empty State Wizard & Concierge Outreach",
               details: "Dashboard empty state shows illustrated 3-step connection process. 'We'll handle this! Grant access form takes 2 mins'. If no data after 48h, trigger automated SMS/Email. If >5 days, founder manual outreach call."
             },
             {
               id: "ERR-03",
               title: "AI Visibility Results Delay",
               scenario: "Client buys AI Sprint ($5K), expects instant results. Day 30: Googles project in ChatGPT, sees nothing. Demands refund.",
               impact: "$5K refund + reputational damage.",
               recovery: "Pre-emptive Timeline Setting & Progress Report",
               details: "SOW & Week 2 email emphasize: 'AI visibility is like SEO—takes 60-90 days'. Dashboard timeline shows 'Expected Results' curve (gradual slope). At Day 30, auto-send 'Progress Report' showing citations found vs target."
             },
             {
               id: "ERR-04",
               title: "Client Can't Interpret Metrics",
               scenario: "Client sees 'On-chain engagement: 47'. Thinks: Is that good? Bad? Frustrated, ignores dashboard.",
               impact: "Dashboard becomes worthless; founder spends hours explaining metrics.",
               recovery: "Contextual Tooltips & Benchmarks",
               details: "Add tooltips: 'Great! You're trending up. (Avg for your tier: 35)'. First-time login triggers interactive tour. Color-coded indicators (green/yellow/red)."
             },
             {
               id: "ERR-05",
               title: "Client Cancels After Month 1",
               scenario: "Client expects 'immediate hockey stick growth'. Sees +5% traffic. Cancels due to impatience.",
               impact: "Lost LTV, wasted onboarding effort.",
               recovery: "Month 1 Expectations Microcopy",
               details: "Pre-emptive messaging: 'Month 1: Foundation. Month 2: Momentum. Month 3: Compounding.' Send 'Month 1 Progress Report' at Day 25 emphasizing 'what we built + early wins' to reinforce long-term vision."
             },
             {
               id: "ERR-06",
               title: "Generic AI Recommendations",
               scenario: "AI suggests 'Post more on Twitter'. Client thinks 'That's obvious, why am I paying $10K?'.",
               impact: "AI credibility gap, potential downgrade.",
               recovery: "Improved Specificity & Confidence Score",
               details: "Recommendation: 'Increase frequency to 5x/week focusing on AI+Web3 intersection. Why: Top performing tweet mentioned AI agents.' Show 'Confidence Score' based on data sources."
             },
             {
               id: "ERR-07",
               title: "No ROI Attribution",
               scenario: "CFO asks 'What did we get for $30K?'. Client can't answer. CFO forces cancellation.",
               impact: "Churn despite successful tactics.",
               recovery: "Auto-Generated ROI Report",
               details: "Monthly dashboard report: 'Marketing spend: $30K. Attributed outcomes: 47 leads ($638 CPL), 8 conversions. Net Impact: $66K gain.' Link to attribution model."
             }
           ]
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

LAYOUT SPECIFICATION:
- Container: 800px max-width, centered horizontally, 64px horizontal padding
- Progress indicator: Horizontal step tracker, fixed to top, 80px height, background: linear-gradient(to right, #F9FAFB, #FFFFFF)
- Content area: 720px max-width, 48px vertical padding between sections

VISUAL DESIGN SYSTEM:
Color Palette:
- Primary: #6366F1 (Indigo-500, used for CTAs and active states)
- Secondary: #8B5CF6 (Purple-500, used for accents and data viz)
- Success: #10B981 (Emerald-500)
- Warning: #F59E0B (Amber-500)
- Error: #EF4444 (Red-500)
- Background-Dark: #0A0E27 (Deep navy, main background)
- Background-Card: #1A1F3A (Lighter navy, card backgrounds)
- Text-Primary: #F9FAFB (Gray-50, main text)
- Text-Secondary: #9CA3AF (Gray-400, secondary text)
- Border: #374151 (Gray-700, subtle borders)

STEP-BY-STEP CONTENT:

STEP 1 - WELCOME:
Header Section:
- Logo: Top-left, 40px height, link to homepage
- Progress: "Step 1 of 4" in Text-Secondary, top-right
Hero Content (centered):
- Icon: Gradient chart icon (100px × 100px), gradient from Primary to Secondary
- Headline: "What's Your Web3 Growth Score?" (H1, Text-Primary)
- Subheadline: "Get a free, personalized analysis of your marketing maturity—plus a custom roadmap."
- Trust Signals (horizontal row, 32px margin-top):
  • "💳 No credit card required" (Caption, Text-Secondary)
  • "⚡ Results in 60 seconds" (Caption, Text-Secondary)
  • "🏢 Used by 200+ Web3 projects" (Caption, Text-Secondary)
Primary CTA:
- Button: "Start Assessment →" (Background: Primary, Text: white, full-width on mobile)

STEP 2 - PROJECT BASICS:
Form Section (left-aligned, single column):
- Field 1: "Project website or docs URL *" (Input, Placeholder: "https://yourproject.xyz")
- Field 2: "What stage are you at? *" (Radio buttons: Pre-launch, Early, Growth, Established)
- Field 3: "What's your #1 marketing goal right now? *" (Dropdown: Awareness, Leads, Community, On-chain metrics, Token Launch)

STEP 3 - CURRENT MARKETING:
Checkbox Grid (3 columns on desktop, 1 column on mobile, 16px gap):
- Options: Content marketing, Social media, SEO, Community management, Paid ads, Influencer partnerships, Email marketing, On-chain data tracking, AI tools.

STEP 4 - CONTACT INFO:
Form Section:
- Headline: "Get your personalized Growth Score"
- Field 1: "Your name *"
- Field 2: "Work email *" (Input type="email")
- Field 3: "Project or company name *"
- Privacy Notice: "By submitting, you agree to receive your Growth Score report..."
- Final CTA: "Generate My Growth Score →" (Primary, full-width)` 
          }]
        },
        // PROMPT 2: Client Cockpit Dashboard
        {
          id: "section-03-prompt-2",
          title: "Prompt 2: Client Dashboard",
          type: "blueprints" as const,
          content: "Comprehensive data-dense dashboard interface.",
          data: [{
            id: "PROMPT-02",
            title: "Client Cockpit - Real-Time Marketing Dashboard",
            description: "Main dashboard for Web3 marketing clients",
            prompt: `Design a comprehensive, data-dense dashboard interface for Web3 marketing clients. This interface serves as the "Marketing Command Center".

LAYOUT SPECIFICATION:
- Grid system: 12-column grid, 24px gutters
- Navigation: Fixed left sidebar, 280px width, collapsible to 80px
- Header: Fixed top bar, 72px height, spans full width minus sidebar
- Content area: Scrollable main region, 32px padding on all sides

COMPONENT BREAKDOWN:

HEADER SECTION:
- Left: Dashboard title "Marketing Command Center", Date range selector (Last 30 days)
- Center: Quick search input with magnifying glass
- Right: Notification bell (with badge), Help icon, User avatar with dropdown

SIDEBAR NAVIGATION (Fixed Left):
- Logo area at top
- Primary Nav: Dashboard, Experiments (Badge: "3 active"), Analytics, AI Insights (Badge: "2 new"), Campaigns, Community, ROI Reports
- Secondary Nav (bottom): Settings, Help Center, Contact Team
- Collapse toggle at bottom right

MAIN CONTENT AREA:

1. Top KPI Cards (4-column grid):
   - Card 1: AI Visibility Score (47). Trend: +12 pts. Sparkline chart.
   - Card 2: On-Chain Engagement (1,247). Label: Wallet Interactions. Trend: +18%.
   - Card 3: Community Growth (8,429). Label: Total Members. Breakdown: Discord/Telegram/Twitter.
   - Card 4: Content Performance (94K). Label: Content Impressions. Trend: -3%.

2. Active Experiments Section:
   - Header: "Active Experiments (3)" with "View all" link.
   - Cards (3 horizontal):
     - Card 1: "5x Twitter Posting Frequency". Status: RUNNING. Progress bar: 40%. Metrics: "Day 12 of 30", "+23% engagement".
     - Card 2 & 3: Similar structure with different experiment data.

3. AI-Generated Insights Section:
   - Header: "AI Recommendations (2 new)"
   - Insight Card: "Optimize AI Search Visibility for 'Web3 marketing automation'". Priority: HIGH. Description: "Ranking #8 in Perplexity but not appearing in ChatGPT." CTA: "Add to experiments".

4. Analytics Overview (2-column grid):
   - Left: Traffic Sources Chart (Donut chart). Legend: Organic Search, AI Search, Social Media, Direct, Referral.
   - Right: Campaign Performance Table. Columns: Campaign Name, Impressions, Clicks, Conversions, ROI. ROI column color-coded.

5. Recent Activity Feed (Full width):
   - List of recent actions/events with icons, titles, timestamps, and action links.`
          }]
        },
        // PROMPT 3: Experiment Builder
        {
          id: "section-04-prompt-3",
          title: "Prompt 3: Experiment Builder",
          type: "blueprints" as const,
          content: "Step-by-step interface for creating marketing tests.",
          data: [{
            id: "PROMPT-03",
            title: "Experiment Builder - Core Action Screen",
            description: "Interface for creating and launching new experiments",
            prompt: `Design an intuitive, step-by-step experiment builder interface where clients can create, configure, and launch marketing tests.

LAYOUT SPECIFICATION:
- Container: 1200px max-width, centered
- Left panel (Form): 720px width, scrollable
- Right panel (Preview): 440px width, sticky, shows live preview
- Mobile: Single column, preview at bottom

SCREEN STRUCTURE:

HEADER (Sticky Top):
- Breadcrumb: Dashboard > Experiments > New Experiment
- Title: "Create New Experiment"
- Action Buttons: "Save Draft" (Ghost), "Launch Experiment" (Primary, disabled until valid)

LEFT PANEL - FORM:
Section 1: Experiment Basics
- Field: Experiment Name (Input, char counter 0/80)
- Field: Category (Radio buttons with icons: Content, Community, Paid Ads, SEO/AI, Influencer, Email)
- Field: Hypothesis (Textarea, "If we do X, then Y will happen because Z")

Section 2: Test Configuration
- Field: Test Duration (Slider: 7-90 days, default 30)
- Field: Success Metrics (Select 1-3 from list). Example Metric Card: "Follower Growth" with checkbox and Target Input field ("+___%").

Section 3: Tactics & Resources
- Field: Tactics (Textarea, "Describe specific actions")
- Field: Team & Resources (Input, "Who's involved?")
- Field: Budget (Optional Number input)

Section 4: Risk Assessment
- Field: Potential Risks (Textarea)
- Field: Mitigation Plan (Textarea)

RIGHT PANEL - PREVIEW:
- Card looking like a dashboard experiment card.
- Live updates as user types name, selects category, sets duration.
- "What happens next?" checklist below preview:
  1. You launch the experiment
  2. We track metrics automatically
  3. You get progress updates [frequency]
  4. At day [duration], we analyze results

VALIDATION STATES:
- Real-time inline validation for required fields.
- Launch button opacity change when valid.
- Success Modal upon launch: Rocket animation, "Experiment Launched!", CTA "View Dashboard".`
          }]
        },
        // PROMPT 4: Account Settings
        {
          id: "section-05-prompt-4",
          title: "Prompt 4: Account Settings",
          type: "blueprints" as const,
          content: "Client profile and preferences management interface.",
          data: [{
            id: "PROMPT-04",
            title: "Account Settings - Profile & Management",
            description: "Tabbed interface for account management",
            prompt: `Design a comprehensive account settings interface organized with tab navigation.

LAYOUT SPECIFICATION:
- Container: 1120px max-width, centered
- Tab navigation: Horizontal tabs (Profile, Team, Integrations, Billing, Notifications, Security)
- Content area: Full-width within container, 32px padding

VISUAL DESIGN SYSTEM:
- Consistent with previous prompts (Indigo/Purple palette, Inter font)

TAB 1 - PROFILE (Active):
Section: Basic Information (Card)
- Avatar Upload: 120px circle, "Change Photo" button.
- Fields: Display Name, Email (Verified badge), Title/Role, Company Name, Website URL.
- Social Fields: Twitter/X Handle, Discord ID.
- Save Button: Bottom right, "Save Changes".

Section: Time Zone & Language (Card)
- Fields: Time Zone dropdown, Interface Language dropdown.

Section: Danger Zone (Card with Red Border/Accent)
- Action: "Delete Account" (Ghost button, Error color).
- Helper text: "Once you delete your account, there is no going back."

TAB 2 - TEAM & ACCESS:
- Header: "Team Members (3)" with "+ Invite Member" button.
- Table: Member, Role (Owner/Admin/Member), Status (Active/Pending), Last Active, Actions.
- Invite Modal: Email input, Role selection (Radio buttons with descriptions), Message textarea.

TAB 3 - INTEGRATIONS:
- Grid of Integration Cards (Google Analytics, Discord, Twitter, Stripe, etc.).
- State: Connected (Green badge, "Configure" button) vs Not Connected ("Connect" button).

TAB 4 - BILLING & PLANS:
- Current Plan Card: "Growth Plan" badge, Price ($10,000/mo), Next billing date.
- Included Features list with checkmarks.
- Payment Method Section: Visa ending in 4242, Expiry, Edit/Remove buttons.
- Billing History Table: Date, Description, Amount, Status, Invoice Download.`
          }]
        }
      ]
    };
  }

  // PHASE 04: ADVANCED SCREENS & EDGE CASES (Formerly Scaling)
  // Maps to "Syndicate Part 5" in source material
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
          id: "section-02-prompt-6",
          title: "Prompt 6: Empty States",
          type: "blueprints" as const,
          content: "First-time user and zero-data experiences.",
          data: [{
            id: "PROMPT-06",
            title: "Empty States Library",
            description: "First-Time User & Zero-Data Experiences",
            prompt: `Design a comprehensive set of empty state screens for a Web3 marketing agency dashboard.

VISUAL DESIGN SYSTEM:
- Illustrations: Isometric line art with gradient accents (Primary #6366F1 to Secondary #8B5CF6).
- Layout: Centered content, max-width 560px.

SCENARIO A: NO EXPERIMENTS YET (New User)
- Illustration: Laboratory beaker with upward growth chart inside, sparkles.
- Headline: "No experiments running yet"
- Subheadline: "Start testing new marketing tactics to improve your performance."
- Primary CTA: "Create Your First Experiment" (Button with '+' icon).
- Secondary CTA: "Browse Experiment Templates" (Ghost button).

SCENARIO B: NO SEARCH RESULTS
- Illustration: Magnifying glass with question mark.
- Headline: "No results for '[search term]'"
- Suggestions: Check spelling, try general keywords, use fewer filters.
- Actions: "Clear all filters", "Contact support".

SCENARIO C: NO NOTIFICATIONS (All Caught Up)
- Illustration: Check mark inside peaceful circle.
- Headline: "You're all caught up!"
- Subheadline: "No new notifications right now."

SCENARIO D: PERMISSION REQUIRED (Access Denied 403)
- Illustration: Shield with lock icon.
- Headline: "This feature requires Growth or Enterprise plan" OR "You don't have permission".
- Action: "Upgrade to Growth Plan" or "Request Access".

SCENARIO E: NO ANALYTICS DATA (Integration Required)
- Illustration: Plug icon connecting to dashboard icon with dashed line.
- Headline: "Connect your data sources to see analytics"
- Visual Steps: 1. Connect Analytics (Active) -> 2. Authorize -> 3. Syncing.
- CTA: "Connect Data Sources".

GENERAL PRINCIPLES:
- Animation: Subtle float or pulse (2-3s duration).
- Tone: Encouraging, providing clear next steps.` 
          }]
        },
        // PROMPT 7: Error States
        {
          id: "section-03-prompt-7",
          title: "Prompt 7: Error Recovery",
          type: "blueprints" as const,
          content: "Validation, API failures, and recovery flows.",
          data: [{
            id: "PROMPT-07",
            title: "Error Handling System",
            description: "Validation, API Failures & Recovery Flows",
            prompt: `Design a comprehensive error handling system that turns failures into opportunities.

ERROR TYPE A: FORM VALIDATION
- Inline Fields: Red border, error icon inside right edge.
- Error Message: Below input, 14px Red text. Shake animation on appearance.
- Example: "Email address is required" or "Password must be at least 8 characters".
- Error Summary: Banner at top of form listing all errors with anchor links to fields.

ERROR TYPE B: API / SYSTEM ERRORS
- Toast: "Something went wrong. Changes not saved." with "Retry" button.
- Modal (Critical): Overlay with blur.
  - Icon: Warning triangle.
  - Headline: "Connection Timeout" or "Server Error 500".
  - Body: "We couldn't complete your request. This is usually temporary."
  - Buttons: "Try Again" (Primary), "Contact Support" (Secondary).

ERROR TYPE C: 404 NOT FOUND
- Full page layout.
- Illustration: Astronaut floating with broken link chain.
- Headline: "Page not found".
- Navigation Options: Grid of cards (Home, Search, Sitemap, Support).

ERROR TYPE D: NETWORK / OFFLINE
- Persistent Banner: Top of screen, Red/Orange background.
- Icon: WiFi off.
- Text: "You're offline. Some features may not work until you reconnect."
- Action: "Retry Connection".

INTERACTION STATES:
- Shake animation for inline errors.
- Fade-in for toasts/modals.
- Accessibility: aria-live="assertive" for critical errors.` 
          }]
        },
        // PROMPT 8: Loading States
        {
          id: "section-04-prompt-8",
          title: "Prompt 8: Loading Patterns",
          type: "blueprints" as const,
          content: "Skeleton screens and progressive loading indicators.",
          data: [{
            id: "PROMPT-08",
            title: "Loading States & Skeleton Screens",
            description: "Progressive Content Reveal Patterns",
            prompt: `Design a comprehensive loading system that makes waiting feel shorter.

PATTERN A: SKELETON SCREENS
- Dashboard Skeleton: Maintains full layout structure.
- Elements:
  - Header: Rectangles for logo/search/avatar. Base color gray-700 (30% opacity).
  - Sidebar: Rectangles for nav items.
  - Cards: Rectangles matching exact dimensions of KPI cards.
- Animation: "Shimmer" effect (linear gradient moving left to right).

PATTERN B: PROGRESS INDICATORS
- Linear Bar: Top of screen for page transitions. Primary color fill.
- Modal Progress: For file uploads.
  - Icon: Upload/Download.
  - Bar: Percentage fill + Time remaining text ("About 2 minutes remaining").
  - Cancel button available.

PATTERN C: OPTIMISTIC UI
- Toggle Switches: Immediately animate to "On" state before API confirms. Revert if failed.
- Like Buttons: Instant fill.

PATTERN D: CONTENT PLACEHOLDERS
- Image Lazy Load: Blurred low-res version or solid background color before image fades in.
- Spinner: Circular spinner with gradient trail for button states ("Loading...").

ACCESSIBILITY:
- aria-busy="true" on containers.
- Reduced motion support (disable shimmer, use static pulse).` 
          }]
        },
        // PROMPT 9: Notifications
        {
          id: "section-05-prompt-9",
          title: "Prompt 9: Notifications",
          type: "blueprints" as const,
          content: "Toasts, modals, banners, and badge systems.",
          data: [{
            id: "PROMPT-09",
            title: "Notification System",
            description: "Toasts, Modals, Banners & Badges",
            prompt: `Design a comprehensive notification system communicating system status.

TYPE A: TOAST NOTIFICATIONS
- Position: Top-right (desktop), Top-center (mobile).
- Success Toast: Green accent. Checkmark icon. "Changes saved successfully." Auto-dismiss (3s).
- Error Toast: Red accent. Error circle icon. "Upload failed." Persistent until dismissed or action taken.
- Warning/Info Toasts: Amber/Blue accents.
- Stacking: Vertical stack with gap.

TYPE B: MODAL ALERTS
- Destructive Confirmation:
  - Red warning icon.
  - Headline: "Delete [Item Name]?"
  - Body: "This action cannot be undone."
  - Input: "Type DELETE to confirm."
  - Buttons: "Delete" (Red), "Cancel".

TYPE C: INLINE BANNERS
- Info Banner: Blue background (10% opacity). "New feature available."
- Warning Banner: Amber background. "Your trial ends in 3 days."
- Success Banner: Green background. "Payment successful."

TYPE D: BADGES / INDICATORS
- Notification Bell: Red dot for unread.
- Nav Items: Pill badge ("3 active", "New").
- Status Indicators: Colored dot + Text (Online, Offline, Busy).

VISUAL STYLE:
- Consistent with design system (Inter font, rounded corners, subtle shadows).
- Clear iconography for quick scanning.` 
          }]
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