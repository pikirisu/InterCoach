import {
  ArrowRight,
  CheckCircle2,
  FileSearch,
  Gauge,
  Layers3,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { Link } from "react-router";

import { LinkButton } from "../components/ui";
import { useAuth } from "../hooks/useAuth";

const featureCards = [
  {
    description: "Score resumes against role readiness and recruiter scan quality in one clean report.",
    icon: Gauge,
    title: "Signal-rich scoring",
  },
  {
    description: "Turn weaknesses into prioritized edits with section-by-section feedback and keyword coverage.",
    icon: WandSparkles,
    title: "Actionable AI coaching",
  },
  {
    description: "Keep every version, analysis, and improvement cycle organized without a spreadsheet ritual.",
    icon: Layers3,
    title: "Resume workspace",
  },
];

const workflowSteps = ["Upload a PDF", "InterCoach reads the resume", "Review AI feedback", "Export a sharper version"];

function LogoMark() {
  return (
    <span className="flex size-10 items-center justify-center rounded-2xl bg-blue-500 text-white shadow-[0_12px_28px_rgba(0,0,0,0.35)]">
      <Sparkles aria-hidden="true" size={19} />
    </span>
  );
}

function ProductPreview() {
  const scoreRows = [
    { label: "Impact", value: 92 },
    { label: "Keywords", value: 84 },
    { label: "Clarity", value: 89 },
  ];

  return (
    <div className="relative mx-auto mt-14 max-w-6xl animate-surface-in" aria-label="InterCoach product preview">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-2 shadow-[0_24px_90px_rgba(0,0,0,0.4)]">
        <div className="overflow-hidden rounded-[14px] border border-slate-800 bg-slate-950 text-white">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-red-400" />
              <span className="size-2.5 rounded-full bg-amber-300" />
              <span className="size-2.5 rounded-full bg-emerald-400" />
            </div>
            <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
              AI analysis complete
            </div>
          </div>
          <div className="grid min-h-[420px] gap-0 lg:grid-cols-[260px_1fr_320px]">
            <aside className="hidden border-r border-white/10 bg-white/[0.03] p-5 lg:block">
              <div className="flex items-center gap-3">
                <LogoMark />
                <div>
                  <p className="text-sm font-semibold">InterCoach</p>
                  <p className="text-xs text-white/50">Resume Intelligence</p>
                </div>
              </div>
              <div className="mt-8 space-y-2">
                {["Dashboard", "Upload", "Library", "Analysis", "Analytics"].map((item, index) => (
                  <div className={index === 3 ? "rounded-2xl bg-blue-500 px-3 py-2 text-sm font-semibold" : "rounded-2xl px-3 py-2 text-sm text-white/60"} key={item}>
                    {item}
                  </div>
                ))}
              </div>
            </aside>

            <section className="p-5 sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-300">Product Manager Resume</p>
                  <h2 className="mt-1 text-2xl font-semibold">AI Resume Analysis</h2>
                </div>
                <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                  91 overall score
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {["Structure", "Impact", "Readability"].map((label, index) => (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4" key={label}>
                    <p className="text-xs text-white/50">{label}</p>
                    <p className="mt-2 text-2xl font-semibold">{[88, 94, 90][index]}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.06] p-5">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <FileSearch aria-hidden="true" size={17} />
                  Section-by-section analysis
                </div>
                <div className="mt-5 space-y-4">
                  {scoreRows.map((row) => (
                    <div key={row.label}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-white/70">{row.label}</span>
                        <span>{row.value}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10">
                        <div className="h-2 rounded-full bg-blue-400" style={{ width: `${row.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <aside className="border-t border-white/10 bg-white/[0.03] p-5 lg:border-l lg:border-t-0">
              <div className="rounded-2xl border border-blue-300/20 bg-blue-400/10 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-blue-100">
                  <Sparkles aria-hidden="true" size={16} />
                  AI coach note
                </div>
                <p className="mt-3 text-sm leading-6 text-white/70">
                  Lead with measurable business outcomes and add missing product analytics keywords before exporting.
                </p>
              </div>
              <div className="mt-5 space-y-3">
                {["Add SQL and experimentation keywords", "Quantify roadmap ownership", "Tighten summary to 3 lines"].map((item) => (
                  <div className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-sm text-white/75" key={item}>
                    <CheckCircle2 aria-hidden="true" className="mt-0.5 shrink-0 text-emerald-300" size={16} />
                    {item}
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  const { isAuthenticated } = useAuth();
  const appTarget = isAuthenticated ? "/app" : "/register";

  return (
    <main className="bg-slate-950 text-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/85 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Public navigation">
          <Link className="flex items-center gap-3 text-sm font-semibold" to="/">
            <LogoMark />
            <span>InterCoach</span>
          </Link>
          <div className="hidden items-center gap-7 text-sm font-semibold text-slate-400 md:flex">
            <a className="transition hover:text-slate-50" href="#features">Features</a>
            <a className="transition hover:text-slate-50" href="#workflow">Workflow</a>
          </div>
          <div className="flex items-center gap-2">
            {!isAuthenticated ? (
              <LinkButton size="sm" to="/login" variant="ghost">
                Log in
              </LinkButton>
            ) : null}
            <LinkButton size="sm" to={isAuthenticated ? "/app" : "/register"}>
              {isAuthenticated ? "Open app" : "Sign up"}
            </LinkButton>
          </div>
        </nav>
      </header>

      <section className="premium-grid overflow-hidden border-b border-slate-800 bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-20 text-center sm:px-6 lg:px-8 lg:pb-20 lg:pt-24">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-sm font-semibold text-slate-400">
            <ShieldCheck aria-hidden="true" className="text-blue-400" size={16} />
            AI-powered resume intelligence for ambitious teams and candidates
          </div>
          <h1 className="mx-auto mt-8 max-w-4xl text-5xl font-semibold leading-[1.05] text-slate-50 sm:text-6xl lg:text-7xl">
            InterCoach
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            A premium resume analyzer that turns uploads into clarity, sharper positioning, and interview-ready next steps.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <LinkButton className="w-full sm:w-auto" to={appTarget}>
              Analyze a resume
              <ArrowRight aria-hidden="true" size={17} />
            </LinkButton>
            <LinkButton className="w-full sm:w-auto" to={isAuthenticated ? "/app/analysis" : "/login"} variant="secondary">
              View analysis demo
            </LinkButton>
          </div>
          <ProductPreview />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8" id="features">
        {featureCards.map((feature) => {
          const Icon = feature.icon;

          return (
            <article className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition duration-200 hover:-translate-y-1 hover:border-slate-700" key={feature.title}>
              <div className="flex size-11 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                <Icon aria-hidden="true" size={21} />
              </div>
              <h2 className="mt-5 text-lg font-semibold text-slate-50">{feature.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">{feature.description}</p>
            </article>
          );
        })}
      </section>

      <section className="border-y border-slate-800 bg-slate-900/40" id="workflow">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold text-blue-400">Workflow</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-50">From first upload to a stronger story.</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {workflowSteps.map((step, index) => (
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5" key={step}>
                <div className="flex items-center gap-3">
                  <span className="flex size-8 items-center justify-center rounded-xl bg-blue-500 text-xs font-semibold text-white">{index + 1}</span>
                  <p className="font-semibold text-slate-50">{step}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
