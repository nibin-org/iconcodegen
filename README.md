# 🌄 IconCodegen

*(Formerly published as **icon-vista**)*
[![npm version](https://img.shields.io/npm/v/iconcodegen.svg?style=flat-square&color=7c3aed)](https://www.npmjs.com/package/iconcodegen)
[![npm downloads](https://img.shields.io/npm/dm/iconcodegen.svg?style=flat-square&color=06b6d4)](https://www.npmjs.com/package/iconcodegen)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/github/actions/workflow/status/nibin-org/iconcodegen/release.yml?style=flat-square)](https://github.com/nibin-org/iconcodegen/actions/workflows/release.yml)

A beautiful, local CLI dashboard to search, customize, and strictly type React icons directly into your codebase. By default, it searches across 200,000+ open-source icons via Iconify. It also features a built-in enterprise plugin to seamlessly integrate premium, private icon libraries like **Untitled UI Pro**.

<br />

> 🎬 **[Watch the Video Demo & Read Docs](https://iconcodegen.vercel.app)**  

<br />

## ✨ Comprehensive Features

IconCodegen is built to bridge the gap between design and developer experience.

### 🎨 The Local Dashboard
* **Infinite Scroll Lazy-Loading:** Seamlessly browse through thousands of search results without ever clicking a "Next Page" button.
* **Live Customization Panel:** Fine-tune stroke widths, absolute sizing (`24px`, `32px`, etc.), and hex colors using the built-in color picker.
* **Contextual Previews:** Test your icon against both dark and light mode backdrops before generating code.
* **Dynamic Sidebar Filtering:** Instantly filter searches by specific icon packs (e.g., Lucide, Phosphor) or styles (Line, Solid, Duotone).

### 💻 Code Generation
* **Strictly-Typed Output:** Instantly generates `.tsx` files fully typed with `React.SVGProps<SVGSVGElement>` — no `any` types.
* **JavaScript & TypeScript:** Supports both `.jsx` and `.tsx` output.
* **Component Styles:** Choose between Arrow functions (`const Icon = () =>`) or Standard functions (`function Icon()`).
* **Zero Runtime Dependencies:** Generates pure, raw `<svg>` React components. Your production bundle will never ship bloated icon font libraries.

### 🏢 Enterprise Architecture
* **Decoupled Providers:** The backend seamlessly switches between public APIs (Iconify) and private, offline npm packages.
* **Reverse-Rendering Engine:** Built-in support for premium packages like `@untitledui-pro/icons`. IconCodegen will parse your minified `node_modules` package, render the React components into SVGs in memory, and serve them to your local dashboard — completely offline and secure.

---

## 🚀 Quick Start (Free Iconify Provider)

In any React project, initialize the configuration wizard:
```bash
npx iconcodegen init
```
This will prompt you for a save directory (e.g., `./src/components/icons`) and generate an `iconcodegen.json` file.

To start the visual search engine, simply run:
```bash
npx iconcodegen
```

---

## 💎 Premium Setup (Untitled UI Pro)

If your company has a license for **Untitled UI Pro**, IconCodegen can dynamically reverse-render the minified package.

**1. Install the Premium Package**
Ensure you have authenticated with your `.npmrc` token, then install the package in your project:
```bash
npm install @untitledui-pro/icons react react-dom
```

**2. Update your Configuration**
Open `iconcodegen.json` in your project root and update the `provider` field to `untitled-ui`:
```json
{
  "savePath": "./src/components/icons",
  "provider": "untitled-ui"
}
```

**3. Boot the Engine**
```bash
npx iconcodegen
```
IconCodegen will instantly detect your premium package, index all 4,700+ icons into memory, and switch the UI to your private Untitled UI database. *(If you ever remove the provider key or uninstall the package, it gracefully defaults back to the free Iconify library).*

---

## ⚙️ Configuration File (`iconcodegen.json`)

| Key | Type | Default | Description |
|---|---|---|---|
| `savePath` | string | `./src/components/icons` | The directory where generated React components are saved. |
| `provider` | string | `iconify` | The active icon database (`iconify` or `untitled-ui`). |

---

## 📜 License
MIT
