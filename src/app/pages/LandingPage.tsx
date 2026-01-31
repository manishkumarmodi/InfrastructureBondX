import {
  ArrowRight,
  ArrowUpRight,
  BarChart2,
  Building2,
  FileCheck,
  Globe2,
  LineChart,
  Lock,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";


interface LandingPageProps {
  onNavigate: (page: string) => void;
}

const heroStats = [
  { label: "Pipeline", value: "₹620Cr", detail: "tokenized issuances" },
  { label: "Investors", value: "18.4K", detail: "verified KYC wallets" },
  { label: "Avg. Yield", value: "9.8% p.a.", detail: "current cohorts" },
];

const featureTiles = [
  {
    title: "Institution-grade diligence",
    description: "Credit scoring, ESG heatmaps, and audited data rooms built into onboarding.",
    icon: ShieldCheck,
  },
  {
    title: "Live telemetry",
    description: "Escrow automation tied to drone imagery, IoT signals, and proof stacks.",
    icon: LineChart,
  },
  {
    title: "Inclusive participation",
    description: "Retail + HNI allocation from ₹100 with automated compliance, identity, and suitability checks.",
    icon: Users,
  },
];

const journeySteps = [
  {
    stage: "Origination",
    summary: "Issuer KYC + ESG scoring",
    detail: "Government and PPP desks upload DPR, EPC, and sustainability data packs for review.",
  },
  {
    stage: "Structuring",
    summary: "Fractional bond packaging",
    detail: "Smart escrow ladders define payouts, KPIs, and reviewer permissions.",
  },
  {
    stage: "Allocation",
    summary: "Investor window",
    detail: "Retail/HNI book building with instant wallet issuance and risk disclosures.",
  },
  {
    stage: "Monitoring",
    summary: "Milestone verification",
    detail: "Proof stacks unlock capital; investors watch telemetry and impact metrics in real time.",
  },
];

const complianceLayers = [
  {
    title: "Escrow governance",
    icon: Lock,
    bullets: ["Tri-party accounts", "Weighted milestone ladder", "Automated release rules"],
  },
  {
    title: "Proof engine",
    icon: FileCheck,
    bullets: ["Geo-tagged imagery", "Signed contractor invoices", "Independent audit uploads"],
  },
  {
    title: "Transparency APIs",
    icon: Zap,
    bullets: ["Downloadable ledgers", "Regulator-ready exports", "Live webhook events"],
  },
];

const impactStats = [
  { value: "2,450", label: "Jobs enabled" },
  { value: "127 km", label: "Transit laid" },
  { value: "18,500 t", label: "CO₂ saved" },
  { value: "43", label: "Projects tokenized" },
];

const marqueeBrands = ["NHAI", "Smart City Mission", "DFCCIL", "ADB Sandbox", "Bharat Rail Infra"];

export function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#02030a] text-white overflow-hidden">


      <div className="relative">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-30" style={{
          backgroundImage:
            "linear-gradient(120deg, rgba(148,163,184,0.05) 1px, transparent 1px), linear-gradient(0deg, rgba(148,163,184,0.05) 1px, transparent 1px)",
          backgroundSize: "140px 140px",
        }} />

        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-[#02030a]/80 backdrop-blur border-b border-white/10">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#1d4ed8] to-[#38bdf8] flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-lg font-semibold tracking-wide">InfraBondX</p>
                <p className="text-xs text-white/60">Tokenized infrastructure desk</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" className="text-white hover:bg-white/10" onClick={() => onNavigate("role-select")}>
                Sign in
              </Button>
              <Button className="bg-white text-slate-900 hover:bg-white/90" onClick={() => onNavigate("role-select")}>
                Launch app
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="px-4 pt-16 pb-24 relative">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-white/80 mb-6">
                <Sparkles className="w-4 h-4" />
                SDG 9 infrastructure debt stack
              </div>
              <h1 className="text-4xl md:text-5xl font-semibold leading-tight tracking-tight">
                A textured, enterprise-grade surface for tokenized infrastructure bonds.
              </h1>
              <p className="text-lg text-white/70 mt-6 max-w-2xl">
                Bring metros, green corridors, and logistics parks to life with fractional ₹100 entries, audited escrows, and transparent milestone telemetry.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button size="lg" className="bg-gradient-to-r from-[#22d3ee] to-[#818cf8] text-slate-900" onClick={() => onNavigate("role-select")}>
                  Explore live issuances
                  <ArrowUpRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                  onClick={() => onNavigate("role-select")}
                >
                  Book issuer demo
                </Button>
              </div>
              <div className="mt-12 grid sm:grid-cols-3 gap-4">
                {heroStats.map((stat) => (
                  <Card key={stat.label} className="bg-white/5 border-white/10">
                    <CardContent className="p-4 space-y-1">
                      <p className="text-sm uppercase tracking-[0.3em] text-white/50">{stat.label}</p>
                      <p className="text-2xl font-semibold">{stat.value}</p>
                      <p className="text-xs text-white/60">{stat.detail}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="relative hidden lg:block h-[420px]" aria-hidden="true">
              <div className="absolute -inset-6 rounded-[32px] bg-gradient-to-br from-[#22d3ee]/30 via-[#a855f7]/20 to-transparent blur-3xl" />
              <div className="relative h-full w-full rounded-[32px] border border-white/10 bg-black/30 overflow-hidden flex items-center justify-center">
                {/* Full-size animated infrastructure illustration */}
                <svg width="100%" height="100%" viewBox="0 0 420 420" fill="none" className="absolute inset-0" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                  <rect x="50" y="300" width="320" height="40" rx="16" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                  <rect x="90" y="240" width="80" height="60" rx="12" fill="#0ea5e9" opacity="0.8">
                    <animate attributeName="y" values="240;220;240" dur="3s" repeatCount="indefinite" />
                  </rect>
                  <rect x="270" y="220" width="80" height="80" rx="12" fill="#a855f7" opacity="0.8">
                    <animate attributeName="y" values="220;200;220" dur="3.5s" repeatCount="indefinite" />
                  </rect>
                  <rect x="180" y="170" width="60" height="120" rx="12" fill="#f472b6" opacity="0.8">
                    <animate attributeName="y" values="170;150;170" dur="2.7s" repeatCount="indefinite" />
                  </rect>
                  <rect x="140" y="120" width="140" height="30" rx="8" fill="#fcd34d" opacity="0.7">
                    <animate attributeName="y" values="120;100;120" dur="4s" repeatCount="indefinite" />
                  </rect>
                  <circle cx="210" cy="90" r="28" fill="#38bdf8" opacity="0.7">
                    <animate attributeName="cy" values="90;70;90" dur="3.2s" repeatCount="indefinite" />
                  </circle>
                  <rect x="80" y="350" width="260" height="16" rx="8" fill="#64748b" opacity="0.3" />
                  <rect x="120" y="375" width="180" height="12" rx="6" fill="#64748b" opacity="0.2" />
                </svg>
                {/* Glow effect */}
                <div className="absolute inset-0 w-full h-full rounded-[32px] bg-gradient-to-br from-[#38bdf8]/30 via-[#a855f7]/20 to-[#f472b6]/10 blur-2xl opacity-70" />
              </div>
            </div>
          </div>
        </section>

        {/* Project Story */}
        <section className="px-4 pb-16">
          <div className="max-w-5xl mx-auto rounded-3xl border border-white/10 bg-white/5 p-8 space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">About InfraBondX</p>
            <p className="text-lg text-white/80">
              InfraBondX is a next-generation platform for financing and monitoring large-scale infrastructure projects. It enables tokenized sovereign-grade bonds, milestone-based escrow automation, and real-time project telemetry, allowing investors—from institutions to retail—to participate in funding metros, solar, logistics, and water projects with full transparency.
            </p>
            <p className="text-sm text-white/60">
              The software provides a unified workflow: issuers upload structured CAPEX and ESG data, admins verify milestones, investors track returns, and regulators can export compliance-ready ledgers—all in one secure, transparent interface.
            </p>
          </div>
        </section>
      </div>

      {/* Brand marquee */}
      <section className="py-8 border-y border-white/5 bg-[#030816]">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-xs uppercase tracking-[0.3em] text-white/40 mb-4">Pilot collaborations</p>
          <div className="flex flex-wrap gap-4 text-white/60 text-sm">
            {marqueeBrands.map((logo) => (
              <span key={logo} className="px-4 py-2 rounded-full border border-white/10 bg-white/5">
                {logo}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Feature tiles */}
      <section className="py-20 px-4 bg-[#050b19]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50 mb-2">Platform fabric</p>
              <h2 className="text-3xl md:text-4xl font-semibold">What makes InfraBondX different</h2>
            </div>
            <p className="text-white/60 max-w-xl">
              Purpose-built for sovereign-grade infrastructure desks needing automation, transparency, and trusted retail participation.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {featureTiles.map((tile) => (
              <Card key={tile.title} className="bg-white/5 border-white/10 h-full">
                <CardContent className="p-6 space-y-4">
                  <tile.icon className="w-6 h-6 text-[#38bdf8]" />
                  <h3 className="text-xl font-semibold">{tile.title}</h3>
                  <p className="text-sm text-white/70">{tile.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Journey */}
      <section className="py-20 px-4 bg-[#02060f]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50 mb-2">Journey</p>
            <h2 className="text-3xl md:text-4xl font-semibold">From origination to payout in four accountable stages</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {journeySteps.map((step, index) => (
              <Card key={step.stage} className="bg-gradient-to-br from-white/5 to-transparent border-white/10">
                <CardContent className="p-6 space-y-3">
                  <p className="text-sm text-white/60">{index + 1}. {step.stage}</p>
                  <h3 className="text-xl font-semibold">{step.summary}</h3>
                  <p className="text-white/70 text-sm">{step.detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance + KPIs */}
      <section className="py-20 px-4 bg-[#050b19]">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-12">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50 mb-3">Compliance stack</p>
            <h2 className="text-3xl font-semibold mb-8">Controls embedded at every milestone</h2>
            <div className="space-y-6">
              {complianceLayers.map((layer) => (
                <div key={layer.title} className="rounded-2xl border border-white/10 bg-black/30 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <layer.icon className="w-5 h-5 text-[#22d3ee]" />
                    <p className="font-semibold">{layer.title}</p>
                  </div>
                  <ul className="text-sm text-white/70 space-y-2">
                    {layer.bullets.map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#22d3ee]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-white/50">
                  <BarChart2 className="w-4 h-4" />
                  Platform KPIs
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {impactStats.map((metric) => (
                    <div key={metric.label} className="rounded-2xl border border-white/10 p-4 text-center">
                      <p className="text-2xl font-semibold">{metric.value}</p>
                      <p className="text-xs text-white/60">{metric.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Globe2 className="w-4 h-4" />
                  Impact corridor coverage
                </div>
                <p className="text-lg font-semibold">Transit • Energy • Logistics • Water</p>
                <p className="text-sm text-white/70">
                  Multi-sector exposure ensures diversified yield opportunities while maintaining ESG accountability.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-[#010409]">
        <div className="max-w-5xl mx-auto text-center space-y-6 border border-white/10 rounded-[32px] p-10 bg-gradient-to-b from-white/5 to-transparent">
          <h2 className="text-3xl md:text-4xl font-semibold">Ready to open the next tranche?</h2>
          <p className="text-white/70 text-lg">
            Whether you are scaling metro corridors or underwriting climate logistics, InfraBondX provides the compliance, telemetry, and investor demand in one pane of glass.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-gradient-to-r from-[#22d3ee] to-[#818cf8] text-slate-900" onClick={() => onNavigate("role-select")}>
              Start investing
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 text-white" onClick={() => onNavigate("role-select")}>
              Talk to our team
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#00040c] text-white/70 py-12 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[#0f172a]" />
              </div>
              <span className="font-semibold text-white">InfraBondX</span>
            </div>
            <p className="text-sm">
              Democratizing infrastructure finance through tokenization, compliance automation, and transparent telemetry.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>Live marketplace</li>
              <li>Issuer console</li>
              <li>Admin command</li>
              <li>Impact analytics</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Compliance</h4>
            <ul className="space-y-2 text-sm">
              <li>Risk disclosure</li>
              <li>Privacy & security</li>
              <li>Escrow policy</li>
              <li>Responsible AI</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Disclaimer</h4>
            <p className="text-xs">
              Hackathon MVP for demonstration only. No real financial services provided. Tokens simulate fractional ownership of regulated infrastructure bonds.
            </p>
          </div>
        </div>
        <p className="mt-10 text-center text-xs">© 2026 InfraBondX • National Infra Innovation Challenge demo.</p>
      </footer>
    </div>
  );
}
