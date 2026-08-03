# IconCodegen 🌄

*(Formerly published as **icon-vista**)*

[![npm version](https://img.shields.io/npm/v/iconcodegen.svg?style=flat-square&color=7c3aed)](https://www.npmjs.com/package/iconcodegen)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/github/actions/workflow/status/nibin-org/iconcodegen/release.yml?style=flat-square)](https://github.com/nibin-org/iconcodegen/actions/workflows/release.yml)
<!-- Re-add the npm downloads badge once it has propagated (usually 24-48h after first publish):
[![npm downloads](https://img.shields.io/npm/dm/iconcodegen.svg?style=flat-square&color=06b6d4)](https://www.npmjs.com/package/iconcodegen) -->

A local CLI dashboard to search, customize, and strictly type React icons directly into your codebase. Searches 200,000+ open-source icons via Iconify by default, with a built-in plugin for premium, private icon libraries like **Untitled UI Pro**.


![IconCodegen dashboard preview](https://raw.githubusercontent.com/nibin-org/iconcodegen/main/docs/demo.gif)

**[Watch the full video demo & read the docs →](https://iconcodegen.vercel.app)**

---

## Contents

- [Quick Start](#quick-start-free-iconify-provider)
- [Features](#features)
- [Premium Setup (Untitled UI Pro)](#premium-setup-untitled-ui-pro)
- [Configuration](#configuration-file-iconcodegenjson)
- [Requirements](#requirements)
- [License](#license)

---

## Quick Start (Free Iconify Provider)

In any React project, initialize the configuration wizard:

```bash
npx iconcodegen init
```

This prompts for a save directory (e.g. `./src/components/icons`) and generates an `iconcodegen.json` file.

Then start the visual search dashboard:

```bash
npx iconcodegen
```

To clean up your barrel file after manually deleting icons:

```bash
npx iconcodegen prune
npx iconcodegen prune --dry-run
```

To find unused icons in your project that can be safely deleted:

```bash
npx iconcodegen audit
npx iconcodegen audit --target ./app
```

---

## Features

### The Local Dashboard
- **Batch export drawer:** select multiple icons and customize or export them all at once via a sleek slide-out drawer
- **Infinite scroll:** browse thousands of results without pagination
- **Live customization panel:** fine-tune stroke width, size (`24px`, `32px`, etc.), and hex color with a built-in color picker
- **Contextual previews:** check an icon against both dark and light backgrounds before generating code
- **Dynamic filtering:** narrow results by icon pack (Lucide, Phosphor, etc.) or style (Line, Solid, Duotone)

### Code Generation
- **Strictly typed output:** generates `.tsx` fully typed with `React.SVGProps<SVGSVGElement>` — no `any`
- **Barrel file automation:** automatically generates and updates an `index.ts` (or `.js`) file to cleanly export all your icons from one place
- **Enterprise ready:** generated files include linter overrides (`/* eslint-disable */`) to cleanly bypass strict CI environments
- **JS & TS support:** outputs `.jsx` or `.tsx`
- **Component style:** choose arrow function (`const Icon = () =>`) or standard function (`function Icon()`)
- **Zero runtime dependencies:** generates raw `<svg>` components — no bundled icon font libraries

### Enterprise Architecture
- **Decoupled providers:** switches between the public Iconify API and private, offline npm packages
- **Reverse-rendering engine:** supports premium packages like `@untitledui-pro/icons` — parses your installed package and renders components to SVG in memory, fully offline and local

---

## Premium Setup (Untitled UI Pro)

If your company has a license for **Untitled UI Pro**, IconCodegen can reverse-render the package directly.

**1. Install the premium package**

Authenticate with your `.npmrc` token, then install:

```bash
npm install @untitledui-pro/icons react react-dom
```

**2. Update your configuration**

In `iconcodegen.json`, set `provider` to `untitled-ui`:

```json
{
  "savePath": "./src/components/icons",
  "provider": "untitled-ui"
}
```

**3. Boot the engine**

```bash
npx iconcodegen
```

IconCodegen detects the premium package, indexes all 4,700+ icons into memory, and switches the dashboard to your private Untitled UI database. If you remove the provider key or uninstall the package, it falls back to the free Iconify library automatically.

---

## Configuration File (`iconcodegen.json`)

| Key | Type | Default | Description |
|---|---|---|---|
| `savePath` | string | `./src/components/icons` | Directory where generated components are saved |
| `provider` | string | `iconify` | Active icon source (`iconify` or `untitled-ui`) |
| `iconNamePattern` | string | `{name}Icon` | Enforces a strict component naming convention (e.g. `App{name}`, `{name}Icon`) |

---

## Requirements

- Node.js 18 or later
- A React project (16.8+, for hooks-based components)

---

## License

MIT
