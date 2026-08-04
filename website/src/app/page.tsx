import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { CopyButton } from "@/components/CopyButton";

const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    color: "text-brand-purple",
    bg: "bg-brand-purple/10",
    title: "200,000+ Icons",
    desc: "Instantly search across 50+ curated open-source packs — Lucide, Heroicons, Phosphor, Tabler, Material Design, and more.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    color: "text-brand-cyan",
    bg: "bg-brand-cyan/10",
    title: "Strictly-Typed React",
    desc: <>One click generates a fully typed <code className="bg-white/10 px-1 rounded text-slate-300 text-xs font-mono">.tsx</code> component with <code className="bg-white/10 px-1 rounded text-slate-300 text-xs font-mono">React.SVGProps&lt;SVGSVGElement&gt;</code> — ready to paste directly into your codebase.</>,
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    title: "Private Library Support",
    desc: "A unique Reverse-Rendering Engine securely parses your Untitled UI Pro icons directly in memory — no uploads, completely offline.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    title: "Powerful CLI Tooling",
    desc: <>Maintain your library safely with built-in commands. Run <code className="bg-white/10 px-1 rounded text-slate-300 text-xs font-mono">audit</code> to find unused icons, <code className="bg-white/10 px-1 rounded text-slate-300 text-xs font-mono">prune</code> to clean up your barrel file, and <code className="bg-white/10 px-1 rounded text-slate-300 text-xs font-mono">sync</code> to mass-rename components.</>,
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
      </svg>
    ),
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    title: "Customization Panel",
    desc: "Fine-tune stroke color, size, and preview against dark/light backgrounds before generating. Export as Arrow or Standard function.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    title: "Infinite Scroll",
    desc: "The UI lazy-loads icons in batches using an IntersectionObserver — browse thousands of results without ever clicking 'next page'.",
  },
];

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="relative min-h-screen overflow-hidden pt-16">
        
        {/* ── Background ── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-brand-purple/15 blur-[120px] rounded-full" />
          <div className="absolute top-[30%] left-[-5%] w-[400px] h-[400px] bg-brand-cyan/10 blur-[100px] rounded-full animate-float" />
          <div className="absolute bottom-[5%] right-[0%] w-[500px] h-[500px] bg-pink-500/8 blur-[120px] rounded-full animate-float" style={{ animationDelay: "3s" }} />
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        </div>

        {/* ── HERO ── */}
        <section className="relative z-10 text-center px-6 pt-12 pb-24 max-w-5xl mx-auto flex flex-col items-center">
          
          <Link href="/changelog" className="group relative inline-flex items-center gap-3 px-4 py-1.5 mb-8 text-sm text-slate-300 transition-all rounded-full bg-[#0d0f1a] hover:bg-white/5 border border-white/10 overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-purple/20 to-brand-cyan/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center justify-center w-5 h-5 rounded-full bg-brand-cyan/20 text-brand-cyan">
              <span className="absolute animate-ping inline-flex h-full w-full rounded-full bg-brand-cyan opacity-40"></span>
              <svg className="w-3 h-3 relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
              </svg>
            </div>
            <span className="relative z-10 font-medium tracking-wide flex items-center gap-2">
              <span className="text-white font-semibold">v2.5.3</span>
              <span className="text-white/20">—</span>
              <span className="text-slate-400 group-hover:text-slate-200 transition-colors">Latest Release</span>
            </span>
            <span className="relative z-10 text-brand-cyan group-hover:translate-x-1 transition-transform ml-1">→</span>
          </Link>

          <h1 className="text-5xl md:text-[80px] font-black tracking-tight mb-8 leading-[1.05]">
            <span className="text-gradient">Beautiful icons,</span>
            <br />
            <span className="text-white">instantly typed.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            A local dashboard to search 200,000+ open-source icons and generate strictly-typed React components directly into your codebase.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mb-20">
            <Link href="/docs" className="flex items-center justify-center gap-2 h-14 px-8 rounded-full bg-white text-black font-bold hover:bg-slate-200 transition-all shadow-xl shadow-white/10 text-sm">
              Get Started
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
            <a href="https://github.com/nibin-org/iconcodegen" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 h-14 px-8 rounded-full bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all backdrop-blur-md text-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
              GitHub
            </a>
          </div>

          {/* Browser Window Demo */}
          <div className="relative mx-auto max-w-5xl group w-full">
             <div className="absolute -inset-1 bg-gradient-to-b from-brand-purple/40 to-brand-cyan/10 rounded-2xl blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000" />
             <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#08090f]">
                <div className="flex items-center px-4 py-3 bg-white/5 border-b border-white/5">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="mx-auto bg-black/40 rounded-md px-4 py-1 text-xs text-slate-500 font-mono border border-white/5">localhost:3000</div>
                  <div className="w-[52px]" /> {/* Spacer to perfectly center URL bar */}
                </div>
                <video autoPlay loop muted playsInline className="w-full aspect-video object-cover bg-black block" controls>
                  <source src="/demo.webm" type="video/webm" />
                </video>
             </div>
          </div>
        </section>

        {/* ── BENTO FEATURES ── */}
        <section className="relative z-10 px-6 py-32 max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">Everything you need.</h2>
            <p className="text-slate-400">Built for professional React developers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Bento 1 - Large */}
            <div className="md:col-span-2 glass-panel rounded-3xl p-8 md:p-10 flex flex-col justify-between group hover:border-brand-purple/50 transition-colors relative overflow-hidden">
              <div className="absolute right-0 top-0 w-64 h-64 bg-brand-purple/10 blur-[80px] rounded-full group-hover:bg-brand-purple/20 transition-colors" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-brand-purple/10 text-brand-purple flex items-center justify-center mb-8">
                  {features[0].icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">200,000+ Icons on Demand</h3>
                <p className="text-slate-400 text-lg leading-relaxed max-w-lg">
                  Instantly search across 50+ curated open-source packs including Lucide, Heroicons, Phosphor, and Tabler. No massive <code className="text-brand-purple bg-brand-purple/10 px-1.5 py-0.5 rounded text-sm">node_modules</code> required.
                </p>
              </div>
            </div>

            {/* Bento 2 - Tall */}
            <div className="glass-panel rounded-3xl p-8 md:p-10 flex flex-col justify-between group hover:border-brand-cyan/50 transition-colors relative overflow-hidden">
              <div className="absolute left-0 bottom-0 w-40 h-40 bg-brand-cyan/10 blur-[60px] rounded-full group-hover:bg-brand-cyan/20 transition-colors" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-brand-cyan/10 text-brand-cyan flex items-center justify-center mb-8">
                  {features[1].icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">100% TypeSafe</h3>
                <p className="text-slate-400 leading-relaxed">
                  Generates strict <code className="text-brand-cyan bg-brand-cyan/10 px-1.5 py-0.5 rounded text-sm">React.SVGProps</code> components ready to drop into your codebase.
                </p>
              </div>
            </div>

            {/* Bento 3 - Standard */}
            <div className="glass-panel rounded-3xl p-8 group hover:border-pink-500/50 transition-colors relative overflow-hidden">
              <div className="absolute right-0 bottom-0 w-40 h-40 bg-pink-500/10 blur-[60px] rounded-full group-hover:bg-pink-500/20 transition-colors" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-400 flex items-center justify-center mb-6">
                  {features[2].icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Private Libraries</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Reverse-renders premium packs like Untitled UI directly in memory. 100% offline and secure.
                </p>
              </div>
            </div>

            {/* Bento 4 - Large Row */}
            <div className="md:col-span-2 glass-panel rounded-3xl p-8 group hover:border-emerald-500/50 transition-colors relative overflow-hidden flex flex-col md:flex-row gap-8 items-center justify-between">
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 bg-emerald-500/10 blur-[60px] rounded-full group-hover:bg-emerald-500/20 transition-colors" />
              <div className="relative z-10 flex-1">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
                  {features[3].icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Powerful CLI Tooling</h3>
                <p className="text-slate-400 leading-relaxed max-w-md">
                  Maintain your library safely with built-in commands. Run <code className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded text-sm">audit</code> to find unused icons, and <code className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded text-sm">sync</code> to mass-rename components across your repo.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="relative z-10 px-6 pb-40 max-w-3xl mx-auto text-center">
          <div className="glass-panel rounded-3xl p-12 border border-brand-purple/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/10 via-transparent to-brand-cyan/10 pointer-events-none" />
            <h2 className="text-3xl font-black text-white mb-4 tracking-tight relative z-10">
              Try it in 10 seconds.
            </h2>
            <p className="text-slate-400 mb-10 relative z-10">No account. No install. Just run this in any React project directory.</p>
            <div className="relative z-10 group inline-block">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-purple to-brand-cyan rounded-xl blur opacity-40 group-hover:opacity-70 transition duration-500" />
              <code className="relative flex items-center justify-between gap-8 bg-[#0d0f1a] border border-white/10 px-8 py-5 rounded-xl text-slate-200 font-mono text-base shadow-2xl">
                <span className="flex items-center gap-3">
                  <span className="text-brand-purple select-none">$</span>
                  npx iconcodegen init
                </span>
                <CopyButton text="npx iconcodegen init" />
              </code>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="relative z-10 border-t border-white/5 py-8 px-6 text-center text-slate-600 text-sm">
          <p>Built by <a href="https://github.com/nibin-org" className="text-slate-400 hover:text-white transition-colors">Nibin Kurian</a> · MIT License</p>
        </footer>

      </main>
    </>
  );
}
