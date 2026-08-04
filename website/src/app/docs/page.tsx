"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { CopyButton } from "@/components/CopyButton";

const NAV_ITEMS = [
  { id: "initialize", label: "1. Initialize" },
  { id: "dashboard", label: "2. Run dashboard" },
  {
    id: "day2",
    label: "3. Day-2 commands",
    children: [
      { id: "prune", label: "Prune" },
      { id: "audit", label: "Audit" },
      { id: "sync", label: "Sync" },
    ],
  },
  {
    id: "providers",
    label: "4. Providers",
    children: [
      { id: "provider-iconify", label: "Iconify" },
      { id: "provider-untitled", label: "Untitled UI" },
    ],
  },
  { id: "config", label: "5. Config reference" },
  { id: "flags", label: "6. Flags" },
];

function CodeBlock({
  code,
  lang = "bash",
  label,
}: {
  code: string;
  lang?: "bash" | "json" | "output";
  label?: string;
}) {
  const isCommand = lang === "bash";
  const colorClass =
    lang === "json" ? "text-amber-300" : lang === "output" ? "text-slate-400" : "text-brand-cyan";

  return (
    <div className="mb-3 rounded-xl border border-white/8 bg-[#0d0e14] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/8">
        <span className="text-xs font-mono text-slate-500">{label || (isCommand ? "terminal" : lang)}</span>
        {lang === "bash" && (
          <CopyButton text={code} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer" />
        )}
      </div>
      <pre className={`px-4 py-3.5 text-[13px] font-mono leading-relaxed overflow-x-auto ${colorClass}`}>
        <code
          dangerouslySetInnerHTML={{
            __html: lang === "output" ? highlightOutput(code) : escapeHtml(code),
          }}
        />
      </pre>
    </div>
  );
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function highlightOutput(s: string) {
  return escapeHtml(s).replace(
    /\[(DRY RUN|BLOCKED|COLLISION|DUPLICATE|RENAME|INDEX)\]/g,
    '<span class="text-amber-400">[$1]</span>'
  );
}

function SectionHeading({ number, title }: { number: number; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-[22px] h-[22px] rounded-full bg-brand-cyan/15 text-brand-cyan text-xs font-bold flex items-center justify-center flex-shrink-0">
        {number}
      </div>
      <h2 className="text-lg font-semibold text-white">{title}</h2>
    </div>
  );
}

function Section({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div id={id} className="pt-12 first:pt-0 pb-12 border-b border-white/5 last:border-0 last:pb-0 scroll-mt-24">
      <SectionHeading number={number} title={title} />
      {children}
    </div>
  );
}

function SubCommand({
  command,
  desc,
  output,
}: {
  command: string;
  desc: string;
  output: string;
}) {
  return (
    <div id={command.split(" ")[2]} className="mb-10 last:mb-0 scroll-mt-24">
      <CodeBlock code={command} />
      <p className="text-sm text-slate-400 leading-relaxed mb-3">{desc}</p>
      <div>
        <CodeBlock code={output} lang="output" label="output" />
      </div>
    </div>
  );
}

function MobileTOC({ activeId }: { activeId: string }) {
  const [open, setOpen] = useState(false);

  const activeLabel = NAV_ITEMS.flatMap((item) => [
    { id: item.id, label: item.label },
    ...(item.children ?? []),
  ]).find((x) => x.id === activeId)?.label ?? "On this page";

  return (
    <div className="lg:hidden sticky top-16 z-40 bg-[#08090f]/95 backdrop-blur-xl border-b border-white/5">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-3 text-sm text-slate-300"
      >
        <div className="flex items-center gap-2">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="15" y2="18" />
          </svg>
          <span className="text-brand-cyan font-medium">{activeLabel}</span>
        </div>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="px-6 pb-4 flex flex-col gap-0.5 border-t border-white/5">
          {NAV_ITEMS.map((item) => (
            <div key={item.id}>
              <button
                onClick={() => { smoothScrollTo(item.id); setOpen(false); }}
                className="w-full text-left text-sm px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                {item.label}
              </button>
              {item.children && (
                <div className="ml-4 flex flex-col gap-0.5">
                  {item.children.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => { smoothScrollTo(child.id); setOpen(false); }}
                      className="w-full text-left text-xs px-3 py-1.5 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all"
                    >
                      {child.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// All section IDs to observe
const ALL_IDS = ["initialize", "dashboard", "day2", "prune", "audit", "sync", "providers", "provider-iconify", "provider-untitled", "config", "flags"];

function smoothScrollTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 88;
  window.scrollTo({ top, behavior: "smooth" });
}

export default function DocsPage() {
  const [activeId, setActiveId] = useState("initialize");
  useEffect(() => {
    const handleScroll = () => {
      // Force last item if scrolled to the absolute bottom
      if (Math.ceil(window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 10) {
        setActiveId(ALL_IDS[ALL_IDS.length - 1]);
        return;
      }

      const elements = ALL_IDS.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
      
      const visibleElements = elements.filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 88;
      });

      if (visibleElements.length > 0) {
        visibleElements.sort((a, b) => {
          return Math.abs(a.getBoundingClientRect().top - 88) - Math.abs(b.getBoundingClientRect().top - 88);
        });
        setActiveId(visibleElements[0].id);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <Navbar />
      <MobileTOC activeId={activeId} />
      <div className="min-h-screen bg-[#08090f] pt-16">
        <div className="max-w-7xl mx-auto px-6 pt-14 flex gap-12">
          {/* Sidebar */}
          <aside className="hidden lg:block w-[260px] flex-shrink-0">
            <div className="sticky top-[120px]">
              {/* Glass card */}
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-md overflow-hidden">
                {/* Top gradient accent bar */}
                <div className="h-[2px] w-full" style={{ background: "linear-gradient(90deg, #7c3aed, #06b6d4)" }} />

                <div className="p-4">
                  {/* Label */}
                  <div className="flex items-center gap-2 mb-4">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
                      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="15" y2="18" />
                    </svg>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">On this page</span>
                  </div>

                  {/* Nav items */}
                  <nav className="flex flex-col gap-0.5">
                    {NAV_ITEMS.map((item) => (
                      <div key={item.id}>
                        <a
                          href={`#${item.id}`}
                          onClick={(e) => { e.preventDefault(); smoothScrollTo(item.id); }}
                          className={`group flex items-center gap-2.5 text-sm px-3 py-2 rounded-lg transition-all duration-200 ${
                            activeId === item.id
                              ? "bg-brand-cyan/10 text-brand-cyan"
                              : "text-slate-400 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          {/* Left accent bar */}
                          <span className={`w-[3px] h-4 rounded-full flex-shrink-0 transition-all duration-200 ${
                            activeId === item.id
                              ? "bg-brand-cyan"
                              : "bg-white/0 group-hover:bg-white/20"
                          }`} />
                          {item.label}
                        </a>

                        {/* Child items with connector line */}
                        {item.children && (
                          <div className="relative ml-[22px] mt-0.5 mb-1 flex flex-col gap-0.5">
                            {/* Vertical connector line */}
                            <div className="absolute left-[5px] top-0 bottom-0 w-px bg-white/8" />
                            {item.children.map((child) => (
                              <a
                                key={child.id}
                                href={`#${child.id}`}
                                onClick={(e) => { e.preventDefault(); smoothScrollTo(child.id); }}
                                className={`relative flex items-center gap-2 text-xs px-3 py-1.5 rounded-md transition-all duration-150 ${
                                  activeId === child.id
                                    ? "text-brand-cyan"
                                    : "text-slate-500 hover:text-slate-300"
                                }`}
                              >
                                {/* Horizontal connector tick */}
                                <span className={`w-2.5 h-px flex-shrink-0 transition-colors ${
                                  activeId === child.id ? "bg-brand-cyan/60" : "bg-white/15"
                                }`} />
                                {child.label}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 pb-[47vh]">
            <div className="mb-12">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-brand-purple uppercase tracking-widest mb-4">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                Documentation
              </div>
              <h1 className="text-4xl font-black text-white mb-4 tracking-tight">iconcodegen</h1>
              <p className="text-lg text-slate-400 leading-relaxed">
                Complete command reference for setting up and maintaining your icon library.
              </p>
            </div>

            <div className="space-y-0">
              <Section id="initialize" number={1} title="Initialize">
                <CodeBlock code="npx iconcodegen init" />
                <p className="text-sm text-slate-400 leading-relaxed mb-3">
                  Asks for your save path and provider, then writes an{" "}
                  <code className="bg-white/5 px-1.5 py-0.5 rounded text-xs">iconcodegen.json</code> to your
                  project root.
                </p>
                <CodeBlock
                  lang="json"
                  label="iconcodegen.json"
                  code={`{\n  "savePath": "./src/components/icons",\n  "provider": "iconify",\n  "iconNamePattern": "{name}Icon"\n}`}
                />
              </Section>

              <Section id="dashboard" number={2} title="Run the dashboard">
                <CodeBlock code="npx iconcodegen" />
                <p className="text-sm text-slate-400 leading-relaxed">
                  Spins up the local visual dashboard at{" "}
                  <code className="bg-white/5 px-1.5 py-0.5 rounded text-xs">http://127.0.0.1:3000</code> to
                  instantly search and generate typed React icons.
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  If port 3000 is busy, the server automatically tries 3001, 3002, and so on.
                </p>
              </Section>

              <Section id="day2" number={3} title="Day-2 commands">


                <SubCommand
                  command="npx iconcodegen prune"
                  desc="Removes barrel-file exports pointing to icons you've deleted manually."
                  output={`🔍 Scanning ./src/components/icons for barrel files...\n🗑️  [DRY RUN] Would remove dangling export: AirplayIcon (file not found)\n🗑️  [DRY RUN] Would remove dangling export: CustomThing (file not found)\n✅ Dry run complete. Found 2 missing export(s) to remove.`}
                />

                <SubCommand
                  command="npx iconcodegen audit"
                  desc="Reports icons that aren't imported anywhere in your code. Read-only — never deletes anything."
                  output={`🔍 Scanning ./src for imported icons...\n📦 Found 6 total icons in ./src/components/icons\n✅ Found 1 explicitly imported in your code.\n\n⚠️  5 icons found with no direct static import detected.\nPlease verify manually before removing, especially if you use dynamic selection.\n\n  ⚠️  IMPORTANT: This scanner only matches import paths containing the\n  literal string "icons" (e.g. '@/components/icons', '../icons'). If\n  your project imports icons through an alias that does NOT contain\n  that word (e.g. '@/ui/svg-pack'), this tool cannot see those imports\n  and WILL incorrectly list those icons as unused. If you use custom\n  path aliases, verify manually — do not trust this report blindly.\n\n[LIMITATIONS] The scanner ONLY detects static named imports:\n  ✅ Detects: import { ArrowIcon } from '@/icons'\n  ❌ Ignores: import * as Icons from '@/icons' (Wildcards)\n  ❌ Ignores: import(iconName) (Dynamic Imports)\n  ❌ Ignores: Re-exported barrel chains across monorepo boundaries\n\nTo manually remove these 5 potentially unused icons, review and run:\n\n  rm ./src/components/icons/ActivityIcon.tsx \\\n     ./src/components/icons/AirplayIcon.tsx \\\n     ./src/components/icons/AlarmCheckIcon.tsx \\\n     ./src/components/icons/CameraIcon.tsx \\\n     ./src/components/icons/CheckIcon.tsx`}
                />

                <SubCommand
                  command="npx iconcodegen sync"
                  desc="Renames existing icons to match a naming pattern you've changed in config. Safe — supports --dry-run and blocks anything it's unsure about."
                  output={`Iconcodegen Sync\n--------------------------------------------------\n[RENAME]     ActivityIcon.tsx → SuperActivity.tsx\n[RENAME]     AlarmCheckIcon.tsx → SuperAlarmCheck.tsx\n[RENAME]     AnotherHome.tsx → SuperHome.tsx\n[RENAME]     AppBell.tsx → SuperBell.tsx\n[INDEX]      Rewrote 4 export(s) in index.ts\n[COLLISION]  CameraIcon.tsx (Target SuperCamera.tsx already exists)\n[BLOCKED]    CheckIcon.tsx (Manual or aliased export reference found in index.ts)\n[DUPLICATE]  HomeIcon.tsx (Shares metadata with another file)\n--------------------------------------------------\nSummary: 4 Rename, 1 Collision, 1 Blocked, 1 Duplicate, 0 Unsupported, 0 Keep`}
                />
              </Section>

              <Section id="providers" number={4} title="Providers">
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  The <code className="bg-white/5 px-1.5 py-0.5 rounded text-xs">provider</code> field in your config controls which icon backend is used.
                </p>

                <div id="provider-iconify" className="mb-8 scroll-mt-24">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold bg-brand-cyan/15 text-brand-cyan px-2.5 py-1 rounded-full font-mono">iconify</span>
                    <span className="text-xs text-slate-500">Default</span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed mb-3">
                    Fetches SVGs on demand from the public Iconify API — zero local dependencies required. Supports 11 curated icon packs: <span className="text-slate-300">mdi, ph, lucide, heroicons, bi, tabler, radix-icons, feather, ri, carbon, ion</span>.
                  </p>
                  <CodeBlock lang="json" label="iconcodegen.json" code={`{\n  "provider": "iconify"\n}`} />
                </div>

                <div id="provider-untitled" className="scroll-mt-24">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold bg-brand-purple/15 text-brand-purple px-2.5 py-1 rounded-full font-mono">untitled-ui</span>
                    <span className="text-xs text-slate-500">Requires @untitledui-pro/icons</span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed mb-3">
                    Renders icons fully offline using your locally installed <code className="bg-white/5 px-1.5 py-0.5 rounded text-xs">@untitledui-pro/icons</code> package. Scans all 4 style categories (line, solid, duotone, duocolor) and indexes them on startup. No external requests — ever.
                  </p>
                  <CodeBlock lang="json" label="iconcodegen.json" code={`{\n  "provider": "untitled-ui"\n}`} />
                </div>
              </Section>

              <Section id="config" number={5} title="Config reference">
                <CodeBlock
                  lang="json"
                  label="iconcodegen.json"
                  code={`{\n  "savePath": "./src/components/icons",   // Where generated components are saved\n  "provider": "iconify",                  // Backend: "iconify" or "untitled-ui"\n  "iconNamePattern": "{name}Icon"         // Enforces strict naming (e.g. "{name}Icon")\n}`}
                />
              </Section>

              <Section id="flags" number={6} title="Flags">
                <div className="overflow-x-auto mt-1">
                  <table className="w-full text-sm text-left text-slate-400">
                    <thead className="text-xs uppercase text-slate-500 border-b border-white/10">
                      <tr>
                        <th className="px-4 py-3">Flag</th>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3">Supported by</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      <tr>
                        <td className="px-4 py-3 font-mono text-brand-cyan">--dry-run</td>
                        <td className="px-4 py-3">Previews changes without touching any files.</td>
                        <td className="px-4 py-3 font-mono text-xs">prune, sync</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono text-brand-cyan">--target</td>
                        <td className="px-4 py-3">Overrides the source code directory to scan.</td>
                        <td className="px-4 py-3 font-mono text-xs">audit</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono text-brand-cyan">--port</td>
                        <td className="px-4 py-3">Changes the dashboard server port.</td>
                        <td className="px-4 py-3 font-mono text-xs">(default start)</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono text-brand-cyan">--headless</td>
                        <td className="px-4 py-3">Starts the server without opening the browser.</td>
                        <td className="px-4 py-3 font-mono text-xs">(default start)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Section>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}