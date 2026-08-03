# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.5.1] - 2026-08-03
### Fixed
- **Sync Case Formatting**: Fixed a bug where `iconcodegen sync` could generate camelCase component names (e.g. `customCoffeeIcon`) instead of strict PascalCase components (e.g. `CustomCoffeeIcon`) when the user configured a lowercase prefix in `iconNamePattern`. Lowercase component names caused React to treat them as native HTML tags, breaking Intellisense.

## [2.5.0] - 2026-08-03
### Added
- **`iconcodegen sync` Command**: A powerful new CLI command to automatically mass-rename all generated icons to conform to your `iconNamePattern` in `iconcodegen.json`.
  - **Identity Resolution**: Groups and deduplicates icons based on their internal metadata tags, not their filenames.
  - **Surgical Barrel Updates**: Uses AST-informed surgical string replacement to update your `index.ts` file without destroying comments, quotes, or manual formatting.
  - **Zero-Breakage Guarantee**: Safely aborts renames if collisions are detected, if the icon has been manually tampered with, or if you've manually aliased the export in your barrel file.

## [2.4.2] - 2026-08-03
### Added
- **Metadata Injection**: The generator now unconditionally injects an `@iconcodegen-source` tracking comment into all generated icons. This preserves the original provider and icon identity for future automation workflows.

### Fixed
- **CSRF Middleware**: Patched the local API server's strict `requireLocalOrigin` middleware to explicitly allow `localhost` and `[::1]` origins alongside `127.0.0.1`, fixing `403 Forbidden: Invalid origin` errors for users on different local loopbacks.

## [2.4.1] - 2026-08-03
### Added
- **Config Hot-Reloading**: Added an active file watcher that instantly hot-reloads `iconcodegen.json` when you save it in your editor. The terminal will log `🔄 Config hot-reloaded` without requiring a CLI restart.

### Fixed
- Fixed an inconsistency where `/api/batch-generate` was still using stale startup configuration data.
- De-duplicated config validation logic internally.

## [2.4.0] - 2026-08-03
### Added
- **Audit Command**: Introduced `npx iconcodegen audit` to safely scan your codebase via AST analysis for orphaned icons that are no longer imported. Refuses to execute deletions automatically to prevent accidental data loss; strictly read-only output. 

## [2.3.0] - 2026-07-31
### Added
- **Prune Command**: Introduced `npx iconcodegen prune` to automatically clean up dangling exports in your `index.ts` barrel file when you manually delete or rename generated icon components. Supports a `--dry-run` flag to safely preview destructive changes.

## [2.2.0] - 2026-07-31
### Added
- **Custom Naming Templates**: Added the `iconNamePattern` field to `iconcodegen.json`. You can now enforce strict team naming conventions (e.g. `{name}Icon`, `App{name}`, `{name}`) across both single and batch exports. All generated names are automatically validated and sanitized into compliant JavaScript identifiers.

## [2.1.2] - 2026-07-31
### Fixed
- **Architecture**: Decoupled the CLI server execution block to strictly lock out tests, allowing proper unit testing of Express middleware.
- **Symlink Resolution**: Fixed a critical execution bug where running the tool via npm global symlink (`iconcodegen`) would silently fail because Node.js ES Modules enforce strict `import.meta.url` realpath comparisons.

## [2.1.1] - 2026-07-31
### Fixed
- **Security**: Hardened the local API server's CSRF protection by shifting from a fail-open to a fail-closed architecture. The `/api/download` and `/api/batch-generate` endpoints now explicitly reject requests that omit `Origin` or `Referer` headers.

## [2.1.0] - 2026-07-31
### Added
- **Batch Export Drawer**: Introduced a beautifully animated, slide-out drawer for batch exporting icons. Features a new flexbox grid layout, smooth glassmorphism hover effects, and persistent export settings.
- **Production React Generators**: Generated React components now automatically include global overrides (`/* eslint-disable */`, `// @ts-nocheck`) and "DO NOT EDIT" warnings to seamlessly bypass strict enterprise linting rules.
- **Barrel File Automation**: The CLI now automatically generates and updates `index.ts` / `index.js` barrel files across both Single and Batch export workflows to keep your codebase organized.

### Fixed
- **UI & UX Polish**: Fixed multiple layout edge cases including double-scrollbars on small screens, CSS transition flickering when switching between modals, and toast notifications blocking clicks.

## [2.0.1] - 2026-07-21
### Changed
- Refactored `README.md` design for better aesthetics on the npm registry and added an animated demo GIF.

## [2.0.0] - 2026-07-21
### Added
- **Package Rename**: `icon-vista` has been officially renamed to `iconcodegen` for better discoverability. This is the first release under the new npm namespace.

## [1.2.1] - 2026-07-21
### Added
- **CI Status**: Added GitHub Actions CI badge to the README.
- **Security**: Added origin verification middleware to prevent CSRF on write endpoints (`/api/download` and `/api/generate-snippet`).

### Changed
- **API Errors**: Standardized API error responses to return proper JSON objects (`{"error": "..."}`) and appropriate HTTP status codes (400, 404, 500) across all endpoints.

### Fixed
- **Security**: Fixed a security vulnerability by binding the local Express server explicitly to `127.0.0.1` instead of all network interfaces (`0.0.0.0`).
- **Error Handling**: Fixed missing `icon_id` validation in the `/api/svg` endpoint, preventing bare string 500 errors.
## [1.2.0] - 2026-06-26
### Added
- **SVGR AST Parsing**: Completely rewrote the React component generator to use `@svgr/core` instead of fragile regex string manipulation, guaranteeing 100% syntactically correct JSX AST generation.
- **CLI Arguments**: Added `--headless` mode for CI/CD usage and `--port <port>` (or `-p`) for custom port binding to avoid collisions.
- **Preference Persistence**: UI selections for Language (TS/JS) and Export Style (Arrow/Function) are now automatically persisted across sessions using `localStorage`.

### Changed
- **Frontend Architecture**: Refactored the monolithic 2,300-line `index.html` file by extracting logic into `app.js` and styles into `styles.css` for dramatically improved maintainability.

## [1.1.5] - 2026-06-26
### Added
- **Unit Testing Suite**: Implemented a comprehensive Vitest testing suite covering the React component generator to ensure strictly typed, 100% valid React output.
- **Automated CI/CD Tests**: The GitHub Actions release pipeline now strictly enforces `npm test` before any tag or npm publish occurs.
- **Website Link**: Added a direct link to the full documentation website in the `README.md`.

### Fixed
- **Regex Edge Case**: Fixed a critical generator bug where `width` and `height` attributes were being globally stripped from *all* inner SVG tags (e.g. `<rect width="24">`), which was distorting certain icons. The generator now strictly targets only the outer `<svg>` wrapper.

## [1.1.2] - 2026-06-26
### Added
- **Infinite Scrolling**: Implemented a highly optimized `IntersectionObserver` to seamlessly lazy-load additional icons as you scroll, completely replacing the static 100-icon limit. The backend API was updated to support `start` and `limit` pagination.
- **Sidebar Filtering Engine**: Built a dynamic sidebar filter system. The app now fetches available packs and styles from `/api/filters` on load, allowing you to narrow down searches across 200,000+ icons instantly.
- **Premium Skeleton Loaders**: Introduced shimmering skeleton states for both the icon grid and the sidebar filters. These are hardcoded into the initial DOM to prevent violent layout shifts during API fetches.
- **Brand Polish**: Extracted the precise SVG star logo into a standalone Retina-ready `favicon.svg` with matching gradients.

### Changed
- **UI Architecture Refactoring**: Replaced the landing-page hero section with a native app-like layout. The search bar is now prominently centered in the header, bringing the icon grid and sidebar filters into immediate view on load.
- **Typography & Aesthetics**: Migrated to the 'Outfit' Google Font using a strict `fonts-loaded` pattern to completely eliminate Flash of Invisible Text (FOIT) without bloating the package size with local `.woff2` files.
- **Layout Shift Fixes**: 
  - Added a global custom scrollbar with `overflow-y: scroll` to lock layout width.
  - Implemented `scrollRestoration = 'manual'` and instant top-scrolling on filter changes to prevent browser scroll snaps.

## [1.1.0] - 2026-06-25
### Added
- **Modern Color Picker**: Integrated the Pickr library for a smoother, cross-browser consistent color selection experience.
- **Recent Colors**: Added support for saving and displaying the 5 most recently used colors. Your selections are now persisted across sessions.
- **Hex Input Enhancements**: The color hex input now automatically formats and correctly expands 3-digit hex codes (e.g., `#abc` expands to `#aabbcc`).

### Changed
- **Inherit Mode**: Replaced the previous `currentColor` button with a new "Inherit" switch to improve UI clarity.
- **Startup Behavior**: The application now loads a random theme upon initialization instead of a static search.
- **Dynamic Swatches**: Refactored the color swatches section to dynamically render your recent colors alongside standard presets.
- **Slider UI**: Improved the size slider with dynamic fill tracking as the value changes.

## [1.0.1] - 2026-06-24
### Fixed
- Fixed a strict TypeScript compilation error (`TS17001`) where generated SVG components were rendering duplicate `color` attributes when parsing premium SVGs that natively hardcoded `color="currentColor"`. The generator now aggressively strips existing color properties before injecting React props.
- Resolved a critical JavaScript DOM selector exception (`Cannot set properties of null`) that was completely preventing the icon customization modal from opening. 
- Corrected the `package.json` executable path to prevent `bin` resolution issues on Windows operating systems.

## [1.0.0] - 2026-06-24
### Added
- **Initial Release**
- **Visual Search Engine**: Launched the beautiful localhost UI to search over 200,000+ open-source icons.
- **Provider Architecture**: Implemented a highly scalable, decoupled backend engine.
- **Untitled UI Pro Integration**: Engineered the Reverse-Rendering backend to securely parse, compile, and serve premium private icon repositories locally without exposing authentication tokens.
- **Code Generator**: Added single-click `<svg>` React component code generation supporting both JavaScript and strict TypeScript outputs.
