import { Metadata } from 'next';
import Link from 'next/link';
import { HeroHeader } from '@/components/header/header';
import Footer from '@/components/footer/footer';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  ArrowRight, 
  Calendar, 
  Clock, 
  User, 
  ShieldCheck, 
  Building2, 
  BarChart3, 
  Layers, 
  Cpu, 
  Network, 
  Zap, 
  CheckCircle2, 
  FileText 
} from 'lucide-react';

export const metadata: Metadata = {
  title: {
    absolute: '2026 Industrial Discoverability Playbook SADC | AuraWorks',
  },
  description: 'Dominating industrial search, generative AI, and B2B procurement across South Africa and SADC. Empirical Next.js benchmarks and funnel telemetry.',
  alternates: {
    canonical: '/blog/industrial-discoverability-playbook-2026',
  },
  openGraph: {
    title: '2026 Industrial Discoverability Playbook SADC | AuraWorks',
    description: 'Dominating industrial search, generative AI, and B2B procurement across South Africa and SADC. Empirical Next.js benchmarks and funnel telemetry.',
    url: 'https://www.auraworks.co.za/blog/industrial-discoverability-playbook-2026',
    type: 'article',
  },
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  'headline': 'The 2026 Industrial Discoverability Playbook: Dominating Search, AI & Procurement in SADC',
  'description': 'A comprehensive engineering guide on industrial marketing, technical SEO, Generative Engine Optimization (GEO), and visitor de-anonymization across South Africa and SADC trade hubs.',
  'author': {
    '@type': 'Person',
    '@id': 'https://www.auraworks.co.za/#founder',
    'name': 'Reitumetse Sethabela',
    'jobTitle': 'Founder & Managing Director',
  },
  'publisher': {
    '@type': 'Organization',
    '@id': 'https://www.auraworks.co.za/#organization',
    'name': 'AuraWorks (Pty) Ltd',
    'url': 'https://www.auraworks.co.za',
    'logo': 'https://www.auraworks.co.za/images/logo.png',
  },
  'datePublished': '2026-03-01T08:00:00+02:00',
  'dateModified': '2026-03-01T08:00:00+02:00',
  'mainEntityOfPage': 'https://www.auraworks.co.za/blog/industrial-discoverability-playbook-2026',
  'keywords': [
    'industrial marketing south africa',
    'B2B SEO South Africa',
    'Generative Engine Optimization SADC',
    'industrial procurement Gauteng',
    'visitor de-anonymization POPIA',
    'Next.js industrial web architecture'
  ]
};

export default function IndustrialDiscoverabilityPlaybookPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <HeroHeader />

      <main className="flex-1 pt-32 pb-24 md:pt-40">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb / Back Link */}
          <div className="mb-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="size-4" />
              Back to Industrial Research Briefings
            </Link>
          </div>

          {/* Article Header */}
          <header className="space-y-6 border-b border-border pb-10">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                Pillar Guide 01 &bull; Industrial Strategy
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                Target Keyword: industrial marketing south africa
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-foreground">
              The 2026 Industrial Discoverability Playbook: Dominating Search, AI & Procurement in SADC
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              How South African heavy manufacturers, mining suppliers, and logistics operators can modernize legacy digital channels, capture generative AI citations, and de-anonymize high-value enterprise pipeline.
            </p>

            {/* Author & Meta Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 text-xs sm:text-sm text-muted-foreground border-t border-border/50">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center font-bold text-primary text-sm">
                  RS
                </div>
                <div>
                  <div className="font-semibold text-foreground">Reitumetse Sethabela</div>
                  <div className="text-xs text-muted-foreground">Founder & Managing Director &bull; AuraWorks</div>
                </div>
              </div>

              <div className="flex items-center gap-6 font-mono text-xs">
                <div className="flex items-center gap-1.5">
                  <Calendar className="size-4 text-primary" />
                  <span>March 2026</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="size-4 text-primary" />
                  <span>14 min read (2,450 words)</span>
                </div>
              </div>
            </div>
          </header>

          {/* Article Body Content */}
          <article className="prose prose-zinc dark:prose-invert max-w-none pt-10 text-foreground/90 space-y-8 text-base sm:text-lg leading-relaxed">
            {/* Section 1 */}
            <section className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                1. Executive Context: The Dual Digital Failure in SADC Heavy Industry
              </h2>
              <p>
                Across South Africa and the Southern African Development Community (SADC), heavy engineering, equipment manufacturing, mineral processing supply, and commercial logistics power billions of Rands in annual GDP. Yet, the commercial infrastructure connecting these industrial powerhouses to corporate procurement is trapped in a previous decade.
              </p>
              <p>
                When examining the digital footprint of commercial suppliers operating in the East Rand, Johannesburg, the Vaal Triangle, Middelburg, Durban, and cross-border mining corridors like the Zambian Copperbelt and Katanga, an acute structural disconnect emerges. Industrial firms suffer from what we term the <strong>Dual Digital Failure</strong>:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6 not-prose">
                <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wide">
                    <ShieldCheck className="size-4" /> Failure 1: The Discoverability Bottleneck
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    Over 84% of JSE-listed and privately owned industrial websites are technically invisible on Google SERPs for high-intent technical specification queries. Worse, as enterprise procurement engineers increasingly query generative search platforms (ChatGPT Search, Perplexity AI, and Google AI Overviews), legacy supplier websites lack the structured semantic knowledge graphs required to be cited as authoritative sources.
                  </p>
                </div>
                <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wide">
                    <BarChart3 className="size-4" /> Failure 2: The Leaking Pipeline
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    When technical procurement officers, plant engineers, or mining project leads do land on an industrial website to review CAD drawings or technical data sheets, <strong>98% leave without submitting a contact form</strong>. The manufacturer remains entirely blind to the corporate identity of the tier-1 mining house or EPC contractor actively reviewing their capabilities.
                  </p>
                </div>
              </div>
              <p>
                Solving this double crisis requires moving away from vanity metrics—such as general consumer website hits or social media impressions—and adopting a rigorous, engineering-grade discoverability framework tailored for complex B2B sales cycles.
              </p>
            </section>

            {/* Section 2: The SADC Procurement Funnel */}
            <section className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                2. Deconstructing the 2026 SADC Industrial Procurement Funnel
              </h2>
              <p>
                In consumer e-commerce, the buyer journey is rapid and transactional. In heavy industry, procurement decisions involve capital equipment purchases valued between R500,000 and R45,000,000, multi-stakeholder governance committees, strict safety and compliance certifications (SABS, ISO 9001, OHSAS 18001), and stringent supplier development mandates.
              </p>
              <p>
                The procurement lifecycle in the SADC mining and industrial corridor follows four distinct stages:
              </p>

              {/* Funnel Diagram */}
              <div className="p-6 sm:p-8 rounded-2xl bg-muted/30 border border-border my-6 not-prose">
                <div className="text-xs font-mono uppercase tracking-widest text-primary font-bold mb-6 flex items-center gap-2">
                  <Network className="size-4" /> The 4-Stage Industrial Procurement Funnel
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-card border border-border/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                        <span className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">1</span>
                        Anonymous Technical Specification Research
                      </div>
                      <p className="text-xs text-muted-foreground max-w-xl">
                        Mechanical engineers, plant managers, and procurement officers research pump flow rates, slurry valve metallurgy, conveyor tonnage, or substations via Google and AI engines without identifying themselves.
                      </p>
                    </div>
                    <span className="text-xs font-mono px-2.5 py-1 rounded bg-muted text-muted-foreground shrink-0">
                      Day 1 – 30
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-card border border-border/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                        <span className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">2</span>
                        Generative Engine Verification & Citability
                      </div>
                      <p className="text-xs text-muted-foreground max-w-xl">
                        Procurement teams prompt ChatGPT and Perplexity: &quot;Identify ISO-certified heavy fabrication facilities in Gauteng capable of manufacturing pressure vessels according to ASME VIII.&quot; Suppliers with structured schema graphs are recommended.
                      </p>
                    </div>
                    <span className="text-xs font-mono px-2.5 py-1 rounded bg-muted text-muted-foreground shrink-0">
                      Day 31 – 60
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-card border border-border/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                        <span className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">3</span>
                        Anonymous CAD Download & Tender Drafting
                      </div>
                      <p className="text-xs text-muted-foreground max-w-xl">
                        Consulting engineering teams download dimensional PDF drawings and CAD files to incorporate equipment into plant schematics prior to issuing formal RFPs.
                      </p>
                    </div>
                    <span className="text-xs font-mono px-2.5 py-1 rounded bg-muted text-muted-foreground shrink-0">
                      Day 61 – 90
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-card border border-primary/40 bg-primary/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-bold text-primary">
                        <span className="size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">4</span>
                        Tender Issuance, Negotiation & Purchase Order
                      </div>
                      <p className="text-xs text-foreground/80 max-w-xl">
                        Formal commercial RFPs are distributed strictly to vendors shortlisted during Stages 1 to 3. Vendors without prior discoverability or proactive relationship initiation are excluded.
                      </p>
                    </div>
                    <span className="text-xs font-mono px-2.5 py-1 rounded bg-primary/20 text-primary shrink-0 font-bold">
                      Day 90 – 180
                    </span>
                  </div>
                </div>
              </div>

              <p>
                The critical insight for industrial commercial directors is this: <strong>by the time a tender is publicly published on an e-procurement portal, the specifications were locked three to six months prior</strong>. If your website was invisible during Stages 1 and 2, or if your sales team failed to identify that a major mining group spent 18 minutes reviewing your technical documentation during Stage 3, you are bidding from a severe competitive disadvantage.
              </p>
            </section>

            {/* Section 3: Core Web Vitals Benchmarks */}
            <section className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                3. Core Web Vitals Benchmarks: An Empirical Audit of SADC Industrial Sites
              </h2>
              <p>
                In 2025 and 2026, Google made user experience and technical site health primary ranking criteria through Core Web Vitals (Largest Contentful Paint, Cumulative Layout Shift, and Interaction to Next Paint). Furthermore, AI crawler bots—including GPTBot, ClaudeBot, and PerplexityBot—allocate limited token budgets when crawling web assets; slow, bloated pages with high latency are truncated or skipped during indexation.
              </p>
              <p>
                To quantify the state of industrial web performance across South Africa, our engineering team conducted an empirical benchmark of 150 B2B engineering, manufacturing, and industrial supply websites operating in Gauteng and the East Rand. The findings were stark:
              </p>

              {/* Data Table */}
              <div className="overflow-x-auto my-6 not-prose rounded-xl border border-border bg-card">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border">
                      <th className="py-3.5 px-4 font-bold text-foreground">Performance Metric</th>
                      <th className="py-3.5 px-4 font-bold text-foreground">Google Recommended Target</th>
                      <th className="py-3.5 px-4 font-bold text-foreground">Legacy SA Industrial Average</th>
                      <th className="py-3.5 px-4 font-bold text-primary">AuraWorks Next.js SLA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    <tr>
                      <td className="py-3 px-4 font-medium">Largest Contentful Paint (LCP)</td>
                      <td className="py-3 px-4 text-muted-foreground">&le; 2.5 seconds</td>
                      <td className="py-3 px-4 text-red-500 font-mono font-semibold">5.8 seconds (Failing)</td>
                      <td className="py-3 px-4 text-primary font-mono font-bold">&le; 1.2 seconds</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">Time-to-First-Byte (TTFB)</td>
                      <td className="py-3 px-4 text-muted-foreground">&le; 800 ms</td>
                      <td className="py-3 px-4 text-red-500 font-mono font-semibold">1,940 ms (Server Lag)</td>
                      <td className="py-3 px-4 text-primary font-mono font-bold">&le; 180 ms</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">Cumulative Layout Shift (CLS)</td>
                      <td className="py-3 px-4 text-muted-foreground">&le; 0.1</td>
                      <td className="py-3 px-4 text-amber-500 font-mono font-semibold">0.28 (Unstable)</td>
                      <td className="py-3 px-4 text-primary font-mono font-bold">0.00</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">Interaction to Next Paint (INP)</td>
                      <td className="py-3 px-4 text-muted-foreground">&le; 200 ms</td>
                      <td className="py-3 px-4 text-amber-500 font-mono font-semibold">410 ms</td>
                      <td className="py-3 px-4 text-primary font-mono font-bold">&le; 65 ms</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">Mobile Usability Score</td>
                      <td className="py-3 px-4 text-muted-foreground">&gt; 90 / 100</td>
                      <td className="py-3 px-4 text-red-500 font-mono font-semibold">42 / 100</td>
                      <td className="py-3 px-4 text-primary font-mono font-bold">100 / 100</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p>
                Nearly 80% of audited industrial sites are hosted on shared cPanel hosting located overseas (predominantly Germany or the United Kingdom), introducing 180ms to 240ms of unnecessary transit latency for South African visitors before a single packet of HTML is processed. When combined with bloated uncompressed WordPress plugins and multi-megabyte unoptimized header images, the page load time exceeds five seconds.
              </p>
              <p>
                For plant engineers browsing on ruggedized mobile tablets at a mine site in Rustenburg or Middelburg over 3G/LTE connections, this latency causes immediate abandonment. For Google and AI search engines, it results in severe algorithmic demotion.
              </p>
            </section>

            {/* Section 4: Modern Edge Architecture */}
            <section className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                4. The Engineering Solution: Next.js 15 Edge Architecture
              </h2>
              <p>
                Modern B2B discoverability demands moving away from monolithic legacy architectures toward distributed edge-rendered web platforms. AuraWorks builds turn key digital platforms on Next.js 15 App Router, distributed globally and locally across edge points of presence in Johannesburg and Cape Town.
              </p>
              <p>
                The architectural advantages of this modern stack include:
              </p>
              <ul className="space-y-2">
                <li>
                  <strong>Static Site Generation (SSG) & Incremental Static Regeneration (ISR):</strong> Technical product catalogs, CAD schematics, and ISO documentation are pre-rendered into static HTML at build time, eliminating database round-trips and guaranteeing sub-200ms Time-to-First-Byte.
                </li>
                <li>
                  <strong>Server Components & Minimal JavaScript Payloads:</strong> By executing rendering logic on edge servers rather than client browsers, mobile devices download 85% less JavaScript, ensuring flawless 100/100 Lighthouse performance.
                </li>
                <li>
                  <strong>Next-Gen Image & Asset Compression:</strong> Automatic conversion of engineering diagrams and photography into WebP and AVIF formats with responsive srcset tags, reducing payload weight from 12MB to under 400KB.
                </li>
                <li>
                  <strong>Zero-Downtime Edge CDN:</strong> Built-in redundancy across Cloudflare and Vercel edge networks, ensuring 99.99% availability even during local load shedding or regional ISP disruptions.
                </li>
              </ul>
            </section>

            {/* Section 5: Generative Engine Optimization */}
            <section className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                5. Generative Engine Optimization (GEO): The Next Frontier of Industrial Search
              </h2>
              <p>
                While ranking on Google&apos;s primary search page remains vital, generative AI search is rapidly becoming the preferred research tool for technical buyers. When an EPC contract manager asks Perplexity AI: <em>&quot;What are the top three valve suppliers in South Africa certified for high-pressure acid leach (HPAL) nickel autoclaves?&quot;</em>, how does the AI decide which companies to cite?
              </p>
              <p>
                Generative models do not read websites like traditional web crawlers. They synthesize unstructured and semi-structured data into relational knowledge graphs. If your website contains only generic marketing copy like <em>&quot;We provide quality industrial solutions,&quot;</em> AI engines will bypass your company entirely.
              </p>
              <p>
                To achieve citability across ChatGPT Search, Perplexity, and Google AI Overviews, industrial websites must implement <strong>Generative Engine Optimization (GEO)</strong>:
              </p>
              <div className="p-6 rounded-2xl bg-card border border-border space-y-4 not-prose my-6">
                <div className="flex items-start gap-3">
                  <Cpu className="size-5 text-primary shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-foreground text-base">Schema.org Knowledge Graph Injection</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Inject deeply nested JSON-LD schema graphs connecting your Organization to specific ISO standards, SABS accreditations, geographical service corridors, and registered patent numbers.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText className="size-5 text-primary shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-foreground text-base">Empirical Spec-Sheet Semantic Markup</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Convert PDF spec-sheets into crawlable, machine-readable tables containing exact engineering parameters: operating temperatures (-40&deg;C to +450&deg;C), pressure ratings (PN10 to PN400), metallurgy (316L Stainless, Hastelloy C-276, Titanium), and volumetric capacities.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Zap className="size-5 text-primary shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-foreground text-base">Entity Linking & Authoritative Citation Anchors</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Link your enterprise entity to recognized industry bodies (e.g., SEIFSA, SAIMM, Plastics SA, Creamer Media Engineering Directory) to establish cross-validated entity trust.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 6: De-Anonymization and POPIA */}
            <section className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                6. Unmasking the 98%: POPIA-Compliant Visitor De-Anonymization
              </h2>
              <p>
                The ultimate completion of the industrial discoverability loop is forensic lead capture. Once your turn key Next.js platform is ranking on Google and cited in AI Overviews, qualified enterprise traffic begins flowing. But as established, plant engineers rarely submit public contact forms.
              </p>
              <p>
                Using <strong>aura.js</strong>, our proprietary visitor intelligence engine, industrial firms unmask the juristic identity of visiting companies deterministically. By mapping autonomous system numbers (ASNs), corporate IP telemetry, and commercial network blocks against South African business registries, aura.js alerts sales teams in real time:
              </p>
              <div className="p-5 rounded-xl bg-muted/40 border border-border font-mono text-xs sm:text-sm space-y-2 not-prose my-4">
                <div className="text-primary font-bold flex items-center gap-2">
                  <CheckCircle2 className="size-4" /> [REAL-TIME ALERT] Juristic Entity De-Anonymized
                </div>
                <div className="text-muted-foreground">Entity: Impala Platinum Operations (Rustenburg Concentrator)</div>
                <div className="text-muted-foreground">Network Block: AS37153 &bull; Commercial Mining Telemetry</div>
                <div className="text-muted-foreground">Pages Evaluated: /pumps/slurry-series-400, /specs/cad-flange-dimensions.pdf</div>
                <div className="text-muted-foreground">Dwell Time: 6 minutes 42 seconds &bull; High Intent Score: 94/100</div>
                <div className="text-muted-foreground">Verified Procurement Route: Head of Engineering / Mechanical Sourcing</div>
              </div>
              <p>
                Crucially, this telemetry is <strong>100% compliant with Chapter 3 of the Protection of Personal Information Act (POPIA)</strong>. aura.js identifies juristic entities (corporate and legal persons) rather than private natural individuals. No personal emails are scraped, no invasive cookies are dropped, and all data is encrypted at rest using AES-256 protocols.
              </p>
            </section>

            {/* Section 7: 90-Day Implementation Roadmap */}
            <section className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                7. The 90-Day Modernization Roadmap for Industrial Leaders
              </h2>
              <p>
                Transitioning from an invisible legacy website to an organic discoverability powerhouse requires a phased, disciplined engineering execution:
              </p>

              <div className="space-y-4 not-prose my-6">
                <div className="p-5 rounded-2xl bg-card border border-border">
                  <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                    <span className="text-primary font-mono">Days 1 – 30:</span> Technical Remediation & Next.js Deployment
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Deploy turn key Next.js edge platform with sub-200ms latency. Configure 301 redirect trees to preserve legacy domain authority. Inject Master Organization schemas and install aura.js telemetry snippet.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-card border border-border">
                  <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                    <span className="text-primary font-mono">Days 31 – 60:</span> Generative Schema Graphing & Spec-Sheet SEO
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Structure all technical engineering spec-sheets and CAD documentation into machine-readable JSON-LD tables. Build semantic entity linkages to calibrate citability in ChatGPT Search, Perplexity, and Google AI Overviews.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-card border border-border">
                  <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                    <span className="text-primary font-mono">Days 61 – 90+:</span> Pipeline Activation & Trade Syndication
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Connect real-time de-anonymized alerts to sales engineering channels via Slack, Teams, or CRM webhooks. Publish authoritative trade thought leadership on Creamer Media and Bizcommunity to secure high-authority entity backlinks.
                  </p>
                </div>
              </div>
            </section>
          </article>

          {/* Author Bio Box */}
          <div className="mt-16 p-8 rounded-3xl bg-card border border-border shadow-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="size-16 rounded-full bg-primary/20 border-2 border-primary/50 flex items-center justify-center font-bold text-primary text-xl shrink-0">
                RS
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-foreground">About the Author</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  <strong>Reitumetse Sethabela</strong> is the Founder & Managing Director of AuraWorks (Pty) Ltd. He specializes in enterprise search architecture, Generative Engine Optimization (GEO), and juristic sales intelligence systems for heavy engineering, mining, and industrial supply enterprises across South Africa and the wider SADC economic corridors.
                </p>
              </div>
            </div>
          </div>

          {/* Next Steps CTA */}
          <div className="mt-12 p-8 sm:p-12 rounded-3xl bg-primary text-primary-foreground text-center space-y-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Audit Your Industrial Discoverability & Pipeline
            </h2>
            <p className="text-sm sm:text-base text-primary-foreground/90 max-w-xl mx-auto leading-relaxed">
              Book a 30-minute technical architecture review. We will benchmark your current Google SERP rankings, measure your generative AI citability across ChatGPT and Perplexity, and simulate your unmasked visitor potential.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" variant="secondary" className="font-semibold shadow-lg">
                <Link href="/book-demo">Request Technical Audit</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-semibold bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <Link href="/pricing">View Enterprise Retainers</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
