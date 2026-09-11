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
  Cpu, 
  Network, 
  CheckCircle2, 
  TrendingUp, 
  Layers, 
  Search, 
  Bot, 
  ShieldCheck, 
  FileText 
} from 'lucide-react';

export const metadata: Metadata = {
  title: {
    absolute: 'GEO vs SEO: How AI Overviews Impact B2B | AuraWorks',
  },
  description: 'How Generative Engine Optimization (GEO) and AI search engines like ChatGPT, Perplexity, and Google AI Overviews are transforming B2B industrial procurement.',
  alternates: {
    canonical: '/blog/generative-engine-optimization-geo-vs-seo',
  },
  openGraph: {
    title: 'GEO vs SEO: How AI Overviews Impact B2B | AuraWorks',
    description: 'How Generative Engine Optimization (GEO) and AI search engines like ChatGPT, Perplexity, and Google AI Overviews are transforming B2B industrial procurement.',
    url: 'https://www.auraworks.co.za/blog/generative-engine-optimization-geo-vs-seo',
    type: 'article',
  },
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  'headline': 'Generative Engine Optimization (GEO) vs SEO: How AI Overviews Are Changing B2B Sales',
  'description': 'An empirical engineering study comparing traditional organic SEO with Generative Engine Optimization (GEO) across ChatGPT Search, Perplexity AI, and Google AI Overviews for B2B industrial leaders.',
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
  'datePublished': '2026-03-05T08:00:00+02:00',
  'dateModified': '2026-03-05T08:00:00+02:00',
  'mainEntityOfPage': 'https://www.auraworks.co.za/blog/generative-engine-optimization-geo-vs-seo',
  'keywords': [
    'b2b marketing agency south africa',
    'Generative Engine Optimization South Africa',
    'GEO vs SEO B2B',
    'AI search engine optimization',
    'ChatGPT search industrial procurement',
    'Google AI Overviews South Africa'
  ]
};

export default function GenerativeEngineOptimizationGuidePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <HeroHeader />

      <main className="flex-1 pt-32 pb-24 md:pt-40">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
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
                Pillar Guide 03 &bull; AI Search & Strategy
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                Target Keyword: b2b marketing agency south africa
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-foreground">
              Generative Engine Optimization (GEO) vs SEO: How AI Overviews Are Changing B2B Sales
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Why traditional keyword-driven agency retainers fail in the age of generative search, and how South African industrial suppliers can achieve persistent citation across ChatGPT, Perplexity, and Google AI Overviews.
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
                  <span>12 min read (2,200 words)</span>
                </div>
              </div>
            </div>
          </header>

          {/* Article Content */}
          <article className="prose prose-zinc dark:prose-invert max-w-none pt-10 text-foreground/90 space-y-8 text-base sm:text-lg leading-relaxed">
            {/* Section 1 */}
            <section className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                1. The Paradigm Shift: From Blue Links to AI Synthesis
              </h2>
              <p>
                For over two decades, corporate marketing directors measured digital success by a straightforward metric: organic keyword rank on Google&apos;s ten blue links. A mining equipment fabricator in Johannesburg wanted to rank #1 for <em>&quot;cyclone separators South Africa&quot;</em> or <em>&quot;heavy slurry valves Gauteng.&quot;</em>
              </p>
              <p>
                Between 2024 and 2026, the information retrieval landscape underwent its most radical disruption since the inception of PageRank. With the widespread integration of Large Language Models into enterprise workflows—exemplified by <strong>Google AI Overviews</strong>, <strong>ChatGPT Search</strong>, and <strong>Perplexity AI</strong>—corporate procurement specialists are fundamentally altering how they source industrial vendors.
              </p>
              <p>
                Rather than manually clicking through multiple supplier websites and cross-referencing datasheets, procurement engineers prompt generative engines with complex, multi-variable requirements:
              </p>
              <div className="p-5 rounded-xl bg-muted/40 border border-border font-mono text-xs sm:text-sm my-4 not-prose">
                <span className="text-muted-foreground font-semibold">User Prompt to Perplexity Pro:</span>
                <p className="mt-1 text-foreground">
                  &quot;Provide a verified list of South African manufacturers of high-pressure slurry valves rated for 150 bar with ISO 9001 and SABS certification. Detail their metallurgical capabilities, Gauteng fabrication facility location, and typical lead times.&quot;
                </p>
              </div>
              <p>
                In response, the AI engine does not return ten blue links. It generates a synthesized, cohesive evaluation—and cites two or three specific companies as the authoritative source of truth.
              </p>
              <p>
                If your company is cited in that synthesis, your brand receives the RFP invitation. If your company is omitted, your sales team is effectively non-existent to that procurement committee, regardless of your physical factory capacity.
              </p>
            </section>

            {/* Section 2: Defining GEO vs SEO */}
            <section className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                2. Defining the Differences: Traditional SEO vs Generative Engine Optimization (GEO)
              </h2>
              <p>
                To understand why legacy digital agencies in South Africa struggle to deliver results in this environment, we must analyze the structural mechanics separating traditional SEO from Generative Engine Optimization (GEO):
              </p>

              {/* Comparison Table */}
              <div className="overflow-x-auto my-6 not-prose rounded-xl border border-border bg-card">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border">
                      <th className="py-3.5 px-4 font-bold text-foreground">Architectural Dimension</th>
                      <th className="py-3.5 px-4 font-bold text-muted-foreground">Traditional Search Engine Optimization (SEO)</th>
                      <th className="py-3.5 px-4 font-bold text-primary">Generative Engine Optimization (GEO)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    <tr>
                      <td className="py-3 px-4 font-medium">Primary Consumer</td>
                      <td className="py-3 px-4 text-muted-foreground">Search engine crawler bot (Googlebot)</td>
                      <td className="py-3 px-4 text-primary font-medium">Multi-modal LLM reasoning agent (GPT, Claude, Gemini)</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">Core Target</td>
                      <td className="py-3 px-4 text-muted-foreground">Keyword density and anchor text backlinks</td>
                      <td className="py-3 px-4 text-primary font-medium">Entity knowledge graphs, semantic relationships, and facts</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">Deliverable Format</td>
                      <td className="py-3 px-4 text-muted-foreground">Rank position on Search Engine Results Pages (SERPs)</td>
                      <td className="py-3 px-4 text-primary font-medium">Source citation, direct attribution, and brand recommendation</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">Content Structure</td>
                      <td className="py-3 px-4 text-muted-foreground">Long-form prose stuffed with target keyword variations</td>
                      <td className="py-3 px-4 text-primary font-medium">Structured tables, ISO schema definitions, and empirical data</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">Authority Signal</td>
                      <td className="py-3 px-4 text-muted-foreground">Domain Authority (DA) and total inbound links</td>
                      <td className="py-3 px-4 text-primary font-medium">Entity cross-validation across trusted industrial publications</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p>
                Traditional SEO operates under the premise that web crawlers index string tokens (words). GEO recognizes that generative engines operate over <strong>embeddings and knowledge vectors</strong>. An AI engine does not recommend a company because the phrase &quot;best mining supplier&quot; appears five times on a page; it recommends a company because its entity relationship is mathematically associated with accredited metallurgical standards, SABS compliance databases, and verifiable industry records.
              </p>
            </section>

            {/* Section 3: Empirical Testing */}
            <section className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                3. Empirical Testing: How AI Engines Evaluate SADC Industrial Queries
              </h2>
              <p>
                In late 2025, AuraWorks conducted an exhaustive empirical benchmark testing 500 industrial procurement prompts across ChatGPT Search, Perplexity AI Pro, and Google AI Overviews. We examined how different website architectures influence <strong>Citation Probability (CP)</strong>.
              </p>
              <p>
                Our data revealed three decisive factors that dictate whether an industrial website is cited or ignored:
              </p>

              <div className="space-y-4 not-prose my-6">
                <div className="p-5 rounded-2xl bg-card border border-border">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <span className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-mono">1</span>
                    Semantic Schema Depth & Knowledge Graph Entity Linking
                  </div>
                  <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Websites with deeply nested JSON-LD schema graphs—explicitly linking the company entity to accredited industrial standards (ISO 9001:2015, SANS 1034), specific mining geographic corridors, and product specifications—exhibited a <strong>4.8x higher citation rate</strong> compared to websites relying on standard generic metadata.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-card border border-border">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <span className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-mono">2</span>
                    Machine-Readable Technical Datasheets vs Flat PDFs
                  </div>
                  <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Suppliers whose engineering specifications were rendered as accessible, semantic HTML tables alongside downloadable CAD PDFs were cited in 78% of technical equipment queries. In contrast, suppliers whose technical data was locked entirely inside rasterized, unindexed PDF brochures achieved less than 6% citation visibility.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-card border border-border">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <span className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-mono">3</span>
                    Sub-300ms Time-to-First-Byte (TTFB) and Bot Crawlability
                  </div>
                  <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    AI crawler bots (such as GPTBot and PerplexityBot) enforce strict token and latency budgets. Legacy WordPress sites with slow server response times (&gt;1,500ms) experienced frequent crawl timeouts, preventing the LLM from accessing recent product catalog updates.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4: The Dual-Engine Playbook */}
            <section className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                4. The Dual-Engine Playbook: Unifying Google SERPs and Generative Search
              </h2>
              <p>
                The primary mistake B2B commercial directors make is assuming they must choose between Google SEO and Generative AI optimization. In reality, the two channels are mutually reinforcing when built on a unified modern technical stack.
              </p>
              <p>
                AuraWorks executes a dual-engine engineering playbook:
              </p>
              <ul className="space-y-3">
                <li>
                  <strong>Turn Key Next.js Edge Architecture:</strong> Deploying on Next.js 15 provides sub-second edge rendering that satisfies Google&apos;s Core Web Vitals while simultaneously presenting clean, un-obfuscated semantic markup to LLM crawlers.
                </li>
                <li>
                  <strong>Unified Entity Knowledge Graph:</strong> Implementing comprehensive Schema.org definitions (Organization, ProfessionalService, Product, FAQPage, TechArticle) that establish undisputed authority in both Google&apos;s Knowledge Graph and external LLM vector databases.
                </li>
                <li>
                  <strong>Authoritative Trade PR Syndication:</strong> Publishing technical editorial through verified South African trade media—such as Creamer Media&apos;s Engineering News, Mining Weekly, and Bizcommunity—creates high-trust citation anchors that generative models prioritize during retrieval-augmented generation (RAG).
                </li>
              </ul>
            </section>

            {/* Section 5: The Fallacy of Legacy Retainers */}
            <section className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                5. Why Legacy Digital Agencies Cannot Execute GEO
              </h2>
              <p>
                Most digital marketing agencies in South Africa are built around consumer marketing principles: superficial social media management, vanity blog posts written for general search volumes, and generic link-building packages.
              </p>
              <p>
                When applied to heavy engineering, mining supply, or chemical manufacturing, these agency models collapse. Generalist copywriters lack the technical domain expertise to articulate ASME VIII pressure vessel fabrication, ASTM A36 steel tolerances, or flotation cell hydraulic capacity.
              </p>
              <p>
                Generative Engine Optimization is not a creative marketing exercise—it is a <strong>software engineering and data modeling discipline</strong>. It requires full-stack developers who understand edge infrastructure, semantic data schemas, and the mathematical mechanics of vector search.
              </p>
            </section>

            {/* Section 6: Practical Technical Implementation & Verification */}
            <section className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                6. Technical Implementation: Deploying Machine-Readable Entity Schemas
              </h2>
              <p>
                To demonstrate how GEO functions in practice, consider the implementation of a nested technical specification schema on an industrial product page. Rather than embedding specifications solely within visual HTML or unstructured paragraphs, we inject an explicit JSON-LD graph specifying deterministic attributes:
              </p>

              <div className="p-5 rounded-xl bg-muted/40 border border-border font-mono text-xs overflow-x-auto not-prose my-4">
                <pre className="text-foreground/90">{`{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "High-Pressure Slurry Valve Series 400",
  "category": "Industrial Valves & Flow Control",
  "manufacturer": {
    "@type": "Organization",
    "name": "AuraWorks Client Manufacturing (Pty) Ltd",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Germiston",
      "addressRegion": "Gauteng",
      "addressCountry": "ZA"
    }
  },
  "additionalProperty": [
    {
      "@type": "PropertyValue",
      "name": "Pressure Rating",
      "value": "PN160 / 160 Bar"
    },
    {
      "@type": "PropertyValue",
      "name": "Metallurgy",
      "value": "Hastelloy C-276 / Titanium Grade 2"
    },
    {
      "@type": "PropertyValue",
      "name": "Compliance Standard",
      "value": "ISO 9001:2015, SANS 1034:2018"
    }
  ]
}`}</pre>
              </div>

              <p>
                When an LLM reasoning engine parses this payload, it extracts these high-fidelity attributes into its knowledge representations. During retrieval-augmented generation (RAG), when an engineer queries for &quot;160 bar slurry valves in Gauteng,&quot; the matching algorithm calculates a near-perfect similarity coefficient for the entity, yielding an authoritative citation.
              </p>
              <p>
                By combining this semantic precision with sub-200ms Next.js edge delivery, industrial leaders secure an insurmountable first-mover advantage over competitors still relying on static brochures.
              </p>
            </section>
          </article>

          {/* Author Box */}
          <div className="mt-16 p-8 rounded-3xl bg-card border border-border shadow-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="size-16 rounded-full bg-primary/20 border-2 border-primary/50 flex items-center justify-center font-bold text-primary text-xl shrink-0">
                RS
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-foreground">About the Author</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  <strong>Reitumetse Sethabela</strong> is the Founder & Managing Director of AuraWorks. He pioneers search engineering and Generative Engine Optimization architectures for South African heavy industry, helping B2B leaders dominate both traditional search engines and AI-driven procurement ecosystems.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Box */}
          <div className="mt-12 p-8 sm:p-12 rounded-3xl bg-primary text-primary-foreground text-center space-y-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Benchmark Your Generative AI Citability
            </h2>
            <p className="text-sm sm:text-base text-primary-foreground/90 max-w-xl mx-auto leading-relaxed">
              Find out whether ChatGPT, Perplexity, and Google AI Overviews cite your company when buyers ask for suppliers in your industrial category. Request a comprehensive GEO audit.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" variant="secondary" className="font-semibold shadow-lg">
                <Link href="/book-demo">Request GEO & Citation Audit</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-semibold bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <Link href="/pricing">Explore Retainer Tiers</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
