"use client";

import { useState, useMemo } from "react";
import { Navbar } from "@/components/Navbar";

const releases = [
  {
    version: "2.5.3",
    date: "August 3, 2026",
    latest: true,
    added: [],
    changed: [
      {
        title: "Internal Refactor",
        desc: "Extracted resolveIconName and validateIconNamePattern out of CLI/Sync scripts into a shared naming.js module. No changes to public API or behavior.",
      }
    ],
    fixed: [],
  },
  {
    version: "2.5.2",
    date: "August 3, 2026",
    latest: false,
    added: [],
    changed: [],
    fixed: [
      {
        title: "Circular Dependency",
        desc: "Fixed an innocuous Node.js warning about an unsettled top-level await by embedding the sync naming logic directly into the sync script instead of dynamically importing it from the CLI runner.",
      }
    ],
  },
  {
    version: "2.5.1",
    date: "August 3, 2026",
    latest: false,
    added: [],
    changed: [],
    fixed: [
      {
        title: "Sync Case Formatting",
        desc: "Fixed a bug where `iconcodegen sync` could generate camelCase component names instead of strict PascalCase components when the user configured a lowercase prefix in `iconNamePattern`. Lowercase component names caused React to treat them as native HTML tags, breaking Intellisense.",
      }
    ],
  },
  {
    version: "2.5.0",
    date: "August 3, 2026",
    latest: false,
    added: [
      {
        title: "iconcodegen sync Command",
        desc: "A powerful new CLI command to automatically mass-rename all generated icons to conform to your iconNamePattern. It uses AST-informed surgical barrel updates and features a strict zero-breakage pre-flight check.",
      }
    ],
    changed: [],
    fixed: [],
  },
  {
    version: "2.4.2",
    date: "August 3, 2026",
    latest: false,
    added: [
      {
        title: "Metadata Injection",
        desc: "The generator now unconditionally injects an `@iconcodegen-source` tracking comment into all generated icons. This preserves the original provider and icon identity for future automation workflows.",
      }
    ],
    changed: [],
    fixed: [
      {
        title: "CSRF Middleware",
        desc: "Patched the local API server's strict requireLocalOrigin middleware to explicitly allow localhost and [::1] origins alongside 127.0.0.1, fixing 403 Forbidden errors for users on different local loopbacks.",
      }
    ],
  },
  {
    version: "2.4.1",
    date: "August 3, 2026",
    latest: false,
    added: [
      {
        title: "Config Hot-Reloading",
        desc: "Added an active file watcher that instantly hot-reloads iconcodegen.json when you save it in your editor. The terminal will automatically log the update without requiring a CLI restart.",
      }
    ],
    changed: [],
    fixed: [
      {
        title: "Batch Generation Stale Config",
        desc: "Fixed an inconsistency where batch generating icons would still use the stale startup config instead of the hot-reloaded pattern.",
      }
    ],
  },
  {
    version: "2.4.0",
    date: "August 3, 2026",
    latest: false,
    added: [
      {
        title: "Audit Command (AST Dead-Code Detection)",
        desc: "Introduced `npx iconcodegen audit` to scan your codebase for orphaned icons. Uses safe `@babel/parser` AST analysis instead of regex, and implements hard bail-outs if wildcard or dynamic imports are detected. Strictly read-only.",
      }
    ],
    changed: [],
    fixed: [],
  },
  {
    version: "2.3.0",
    date: "July 31, 2026",
    latest: false,
    added: [
      {
        title: "Prune Command",
        desc: "Introduced `npx iconcodegen prune` to automatically clean up dangling exports in your index.ts barrel file when you manually delete or rename generated icon components. Supports a `--dry-run` flag to safely preview destructive changes.",
      }
    ],
    changed: [],
    fixed: [],
  },
  {
    version: "2.2.0",
    date: "July 31, 2026",
    latest: false,
    added: [
      {
        title: "Custom Naming Templates",
        desc: "Added the iconNamePattern field to iconcodegen.json. You can now enforce strict team naming conventions (e.g. {name}Icon, App{name}) across both single and batch exports. All generated names are automatically validated and sanitized into compliant JavaScript identifiers.",
      }
    ],
    changed: [],
    fixed: [],
  },
  {
    version: "2.1.2",
    date: "July 31, 2026",
    latest: false,
    added: [],
    changed: [],
    fixed: [
      {
        title: "Architecture",
        desc: "Decoupled the CLI server execution block to strictly lock out tests, allowing proper unit testing of Express middleware.",
      },
      {
        title: "Symlink Resolution",
        desc: "Fixed a critical execution bug where running the tool via npm global symlink (iconcodegen) would silently fail because Node.js ES Modules enforce strict import.meta.url realpath comparisons.",
      }
    ],
  },
  {
    version: "2.1.1",
    date: "July 31, 2026",
    latest: false,
    added: [],
    changed: [],
    fixed: [
      {
        title: "Security",
        desc: "Hardened the local API server's CSRF protection by shifting from a fail-open to a fail-closed architecture. The /api/download and /api/batch-generate endpoints now explicitly reject requests that omit Origin or Referer headers.",
      }
    ],
  },
  {
    version: "2.1.0",
    date: "July 31, 2026",
    latest: false,
    added: [
      {
        title: "Batch Export Drawer",
        desc: "Introduced a beautifully animated, slide-out drawer for batch exporting icons. Features a new flexbox grid layout, smooth glassmorphism hover effects, and persistent export settings.",
      },
      {
        title: "Production React Generators",
        desc: "Generated React components now automatically include global overrides (/* eslint-disable */, // @ts-nocheck) and DO NOT EDIT warnings to seamlessly bypass strict enterprise linting rules.",
      },
      {
        title: "Barrel File Automation",
        desc: "The CLI now automatically generates and updates index.ts / index.js barrel files across both Single and Batch export workflows.",
      }
    ],
    changed: [],
    fixed: [
      {
        title: "UI & UX Polish",
        desc: "Fixed multiple layout edge cases including double-scrollbars on small screens, CSS transition flickering between modals, and toast notifications blocking clicks.",
      }
    ],
  },
  {
    version: "2.0.0",
    date: "July 21, 2026",
    latest: false,
    added: [
      {
        title: "Package Rename",
        desc: "icon-vista has been officially renamed to iconcodegen for better SEO and discoverability. This marks the first release under the new npm namespace.",
      }
    ],
    changed: [],
    fixed: [],
  },
  {
    version: "1.2.1",
    date: "July 21, 2026",
    latest: false,
    added: [
      {
        title: "CI Status",
        desc: "Added GitHub Actions CI badge to the README.",
      },
      {
        title: "Security",
        desc: "Added origin verification middleware to prevent CSRF on write endpoints (/api/download and /api/generate-snippet).",
      },
    ],
    changed: [
      {
        title: "API Errors",
        desc: "Standardized API error responses to return proper JSON objects and appropriate HTTP status codes (400, 404, 500) across all endpoints.",
      },
    ],
    fixed: [
      {
        title: "Security",
        desc: "Fixed a security vulnerability by binding the local Express server explicitly to 127.0.0.1 instead of all network interfaces (0.0.0.0).",
      },
      {
        title: "Error Handling",
        desc: "Fixed missing icon_id validation in the /api/svg endpoint, preventing bare string 500 errors.",
      },
    ],
  },
  {
    version: "1.2.0",
    date: "June 26, 2026",
    latest: false,
    added: [
      {
        title: "AST-based SVG Parsing",
        desc: "Replaced the fragile regex generator with @svgr/core, ensuring 100% syntactically correct React JSX output directly from SVG abstract syntax trees.",
      },
      {
        title: "CLI Arguments",
        desc: "Introduced --headless mode for CI/CD and --port <number> flag for custom port binding to avoid EADDRINUSE collisions.",
      },
      {
        title: "Persisted Preferences",
        desc: "The dashboard now remembers your preferred Language (TypeScript/JavaScript) and Component Style (Arrow/Function) across sessions.",
      },
    ],
    changed: [
      {
        title: "Modularized Architecture",
        desc: "Split the monolithic 2,300-line index.html into a clean app.js and styles.css structure for improved maintainability.",
      },
    ],
    fixed: [],
  },
  {
    version: "1.1.5",
    date: "June 26, 2026",
    latest: false,
    added: [],
    changed: [],
    fixed: [
      {
        title: "NPM Markdown Compatibility",
        desc: "Replaced the <video> tag in the README with a clean text link pointing to the Next.js site, as the NPM registry strictly strips out HTML video elements, leaving a broken layout. Removed leftover placeholder text.",
      },
      {
        title: "Cropped Video",
        desc: "Updated the demo video to a tightly cropped, high-resolution version.",
      },
    ],
  },
  {
    version: "1.1.4",
    date: "June 26, 2026",
    latest: false,
    added: [
      {
        title: "Interactive Demo",
        desc: "Added a looping video demonstration of the CLI to the README and website.",
      },
      {
        title: "Documentation Links",
        desc: "Added direct links to the new Next.js documentation website within the CLI terminal output and the local UI.",
      },
    ],
    changed: [],
    fixed: [],
  },
  {
    version: "1.1.3",
    date: "June 26, 2026",
    latest: false,
    added: [
      {
        title: "Unit Testing Suite",
        desc: "Implemented a comprehensive Vitest testing suite covering the React component generator to ensure strictly typed, 100% valid React output.",
      },
      {
        title: "Automated CI/CD Tests",
        desc: "The GitHub Actions release pipeline now strictly enforces npm test before any tag or npm publish occurs.",
      },
      {
        title: "Website Link",
        desc: "Added a direct link to the full documentation website in the README.md.",
      },
    ],
    changed: [],
    fixed: [
      {
        title: "Regex Edge Case",
        desc: "Fixed a critical generator bug where width and height attributes were being globally stripped from all inner SVG tags (e.g. <rect width=\"24\">), which was distorting certain icons. The generator now strictly targets only the outer <svg> wrapper.",
      },
    ],
  },
  {
    version: "1.1.2",
    date: "June 26, 2026",
    latest: false,
    added: [
      {
        title: "Infinite Scrolling",
        desc: "Implemented a highly optimised IntersectionObserver to seamlessly lazy-load icons as you scroll, completely replacing the static 100-icon limit. The backend API now supports start and limit pagination.",
      },
      {
        title: "Sidebar Filtering Engine",
        desc: "Built a dynamic sidebar filter panel. The app fetches available packs and styles from /api/filters on load, letting you narrow down searches across 200,000+ icons instantly.",
      },
      {
        title: "Premium Skeleton Loaders",
        desc: "Introduced shimmering skeleton states for both the icon grid and the sidebar filters, hardcoded directly into the initial DOM to prevent layout shifts during API fetches.",
      },
      {
        title: "Retina-Ready Favicon",
        desc: "Extracted the star logo into a standalone SVG favicon with matching violet-to-cyan gradients — scales perfectly on all displays.",
      },
    ],
    changed: [
      {
        title: "UI Architecture Refactoring",
        desc: "Replaced the landing-page hero section with a native app-like layout. The search bar is now prominently centred in the header, bringing the icon grid and filters into immediate view on load.",
      },
      {
        title: "Typography & Aesthetics",
        desc: "Migrated to the Outfit Google Font using a strict fonts-loaded pattern to completely eliminate Flash of Invisible Text (FOIT) without adding local .woff2 files to the package.",
      },
      {
        title: "Layout Shift Fixes",
        desc: "Added a global custom scrollbar with overflow-y: scroll to lock layout width. Implemented scrollRestoration = manual and instant top-scrolling on filter changes to prevent browser scroll snaps.",
      },
    ],
    fixed: [],
  },
  {
    version: "1.1.0",
    date: "June 25, 2026",
    latest: false,
    added: [
      {
        title: "Modern Color Picker",
        desc: "Integrated the Pickr library for a smoother, cross-browser consistent color selection experience.",
      },
      {
        title: "Recent Colors",
        desc: "Saved and displayed the 5 most recently used colors — persisted across sessions using localStorage.",
      },
      {
        title: "Hex Input Enhancements",
        desc: "The hex input now auto-formats and expands 3-digit hex codes (e.g. #abc expands to #aabbcc).",
      },
    ],
    changed: [
      {
        title: "Inherit Mode",
        desc: "Replaced the previous currentColor button with a new Inherit switch for improved UI clarity.",
      },
      {
        title: "Startup Behaviour",
        desc: "The application now loads a random icon theme on initialisation instead of a static search.",
      },
      {
        title: "Dynamic Swatches",
        desc: "Refactored the color swatches section to dynamically render recent colors alongside standard presets.",
      },
      {
        title: "Slider UI",
        desc: "Improved the size slider with dynamic fill tracking as the value changes.",
      },
    ],
    fixed: [],
  },
  {
    version: "1.0.1",
    date: "June 24, 2026",
    latest: false,
    added: [],
    changed: [],
    fixed: [
      {
        title: "Duplicate color attribute (TS17001)",
        desc: "Fixed a strict TypeScript compilation error where generated SVG components rendered duplicate color attributes when parsing premium SVGs that natively hardcoded color=currentColor.",
      },
      {
        title: "Modal DOM null exception",
        desc: "Resolved a critical JavaScript DOM selector exception (Cannot set properties of null) that was completely preventing the customization modal from opening.",
      },
      {
        title: "Windows bin resolution",
        desc: "Corrected the package.json executable path to prevent bin resolution issues on Windows operating systems.",
      },
    ],
  },
  {
    version: "1.0.0",
    date: "June 24, 2026",
    latest: false,
    added: [
      {
        title: "Initial Release",
        desc: "First public release of iconcodegen.",
      },
      {
        title: "Visual Search Engine",
        desc: "Launched the beautiful localhost UI to search over 200,000+ open-source icons from Iconify.",
      },
      {
        title: "Provider Architecture",
        desc: "Implemented a highly scalable, decoupled backend engine supporting multiple icon providers.",
      },
      {
        title: "Untitled UI Pro Integration",
        desc: "Engineered the Reverse-Rendering backend to securely parse, compile, and serve premium private icon repositories locally without exposing authentication tokens.",
      },
      {
        title: "Code Generator",
        desc: "Added one-click SVG React component code generation supporting both JavaScript and strict TypeScript outputs.",
      },
    ],
    changed: [],
    fixed: [],
  },
];

const tagStyles: Record<string, string> = {
  Added: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Changed: "bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20",
  Fixed: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

type Entry = { title: string; desc: string; type: "Added" | "Changed" | "Fixed" };
type FilterType = "All" | "Added" | "Changed" | "Fixed";

function InlineEntry({ entry }: { entry: Entry }) {
  return (
    <div className="flex items-start gap-4 mb-4 last:mb-0 group/entry">
      <div className={`mt-1 text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-widest shrink-0 w-[72px] text-center ${tagStyles[entry.type]}`}>
        {entry.type}
      </div>
      <div>
        <span className="font-semibold text-white text-sm group-hover/entry:text-brand-cyan transition-colors">{entry.title} — </span>
        <span className="text-sm text-slate-400 leading-relaxed">{entry.desc}</span>
      </div>
    </div>
  );
}

export default function ChangelogPage() {
  const [filter, setFilter] = useState<FilterType>("All");

  const stats = useMemo(() => {
    return {
      total: releases.length,
      features: releases.reduce((acc, r) => acc + r.added.length, 0),
      fixes: releases.reduce((acc, r) => acc + r.fixed.length, 0),
    };
  }, []);

  const latestRelease = releases[0];
  const olderReleases = releases.slice(1);

  const getAllEntries = (release: typeof releases[0]) => {
    return [
      ...release.added.map((e) => ({ ...e, type: "Added" as const })),
      ...release.changed.map((e) => ({ ...e, type: "Changed" as const })),
      ...release.fixed.map((e) => ({ ...e, type: "Fixed" as const })),
    ];
  };

  const getFilteredEntries = (release: typeof releases[0]) => {
    const allEntries = getAllEntries(release);
    if (filter === "All") return allEntries;
    return allEntries.filter((e) => e.type === filter);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#08090f] pt-16">
        
        {/* Hero Section */}
        <div className="relative overflow-hidden pt-20 pb-12">
          <div className="absolute inset-0 pointer-events-none flex justify-center">
            <div className="w-[800px] h-[300px] bg-brand-purple/10 blur-[100px] rounded-full translate-y-[-50%]" />
          </div>
          
          <div className="relative z-10 max-w-3xl mx-auto px-6 text-center flex flex-col items-center">
            <h1 className="text-5xl md:text-6xl font-black tracking-tight bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">
              Changelog
            </h1>
          </div>
        </div>

        {/* Latest Release (Hero Card) */}
        <div className="max-w-4xl mx-auto px-6 mb-16">
          <div className="relative group">
            {/* Animated border gradient */}
            <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-b from-brand-purple to-brand-cyan opacity-40 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative bg-[#0d0f1a]/90 backdrop-blur-xl rounded-3xl p-8 md:p-12 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-cyan/10 blur-[60px] rounded-full pointer-events-none translate-x-1/2 -translate-y-1/2" />
              
              <div className="flex flex-wrap items-end justify-between gap-4 mb-10 border-b border-white/10 pb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-purple opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-purple"></span>
                    </span>
                    <span className="text-brand-purple font-bold tracking-widest uppercase text-xs">Latest Release</span>
                  </div>
                  <h2 className="text-4xl font-black text-white">v{latestRelease.version}</h2>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 font-mono text-sm mb-2">{latestRelease.date}</p>
                  <a
                    href={`https://github.com/nibin-org/iconcodegen/releases/tag/v${latestRelease.version}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-brand-cyan hover:text-white transition-colors"
                  >
                    View on GitHub
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 17L17 7M17 7H7M17 7v10" />
                    </svg>
                  </a>
                </div>
              </div>
              <div>
                {getAllEntries(latestRelease).length === 0 ? (
                  <p className="text-slate-500 italic py-4">No items in this release.</p>
                ) : (
                  getAllEntries(latestRelease).map((entry, idx) => (
                    <InlineEntry key={idx} entry={entry} />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Older Releases (Compact List) */}
        <div className="max-w-3xl mx-auto px-6 pb-32">
          
          <div className="flex flex-col items-center mb-10">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Previous Releases</h3>
            
            {/* Filter Bar */}
            <div className="inline-flex bg-[#0d0f1a] p-1.5 rounded-xl border border-white/5 shadow-xl">
              {(["All", "Added", "Changed", "Fixed"] as FilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                    filter === f 
                      ? "bg-brand-purple text-white shadow-md shadow-brand-purple/20" 
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[11px] top-6 bottom-0 w-px bg-gradient-to-b from-white/10 to-transparent hidden md:block" />

            <div className="space-y-8">
              {olderReleases.map((release) => {
                const entries = getFilteredEntries(release);
                // Only hide the entire block if a specific filter is active and there are no matches
                if (filter !== "All" && entries.length === 0) return null;

                return (
                  <div key={release.version} className="md:flex gap-8 relative z-10">
                    {/* Timeline dot */}
                    <div className="hidden md:flex flex-col items-center shrink-0 w-6 pt-6">
                      <div className="w-[10px] h-[10px] rounded-full border-2 shrink-0 bg-[#08090f] border-white/20" />
                    </div>

                    <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.04] transition-colors">
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                          <h3 className="text-xl font-bold text-white">v{release.version}</h3>
                          <span className="text-slate-500 text-xs font-mono">{release.date}</span>
                        </div>
                        <a
                          href={`https://github.com/nibin-org/iconcodegen/releases/tag/v${release.version}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-white transition-colors"
                          title="View on GitHub"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                          </svg>
                          GitHub
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
                            <path d="M7 17L17 7M17 7H7M17 7v10" />
                          </svg>
                        </a>
                      </div>

                      <div>
                        {entries.length === 0 ? (
                          <p className="text-slate-600 italic text-sm">No recorded changes.</p>
                        ) : (
                          entries.map((entry, idx) => (
                            <InlineEntry key={idx} entry={entry} />
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/5 py-8 px-6 text-center text-slate-600 text-sm">
          <p>Built by <a href="https://github.com/nibin-org" className="text-slate-400 hover:text-white transition-colors">Nibin Kurian</a> · MIT License</p>
        </footer>
      </main>
    </>
  );
}
