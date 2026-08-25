---
layout: page
title: AI Safety & Gateway Guardrail Policy Builder
permalink: /projects/multi-step-form/
---

<div class="project-intro">
  <p class="intro-lead">
    A multi-step configuration workflow for provisioning real-time guardrails on LLM gateway endpoints.
  </p>
  <div class="project-tags" aria-label="Technical Highlights">
    <span class="tag">Modular ES6 Web Component</span>
    <span class="tag">Minimal CSS</span>
    <span class="tag">Zero Dependencies</span>
    <span class="tag">Accessible</span>
    <span class="tag">LocalStorage Autosave</span>
  </div>
</div>

<ai-guardrail-form id="guardrail-app"></ai-guardrail-form>

<!-- Page Stylesheet & Modular Web Component -->
<link rel="stylesheet" href="./page.css">
<script type="module" src="./guardrail-form.js"></script>

<hr class="section-divider" />

## Project Architecture & Engineering Notes

### 1. Problem & AI Gateway Workflow
Enterprise AI applications require deterministic guardrails to prevent prompt injections, scrub sensitive tokens (API keys, PII, healthcare records), and execute safe fallbacks prior to model inference. This multi-step form acts as the management plane for configuring and deploying runtime gateway interceptors.

### 2. Modular Engineering Decisions
- **ES Module Architecture (`projects/multi-step-form/`)**:
  - `config.js`: Default state schemas, route definitions, and entity options.
  - `validation.js`: Pure validation functions for field, step, and form-level checks.
  - `storage.js`: LocalStorage draft persistence and error handling.
  - `theme.js`: Dedicated theme management module (System, Light, Dark, High-Contrast).
  - `templates.js`: Pure, declarative HTML view functions decoupled from component state.
  - `guardrail-form.js`: Native Web Component orchestrating UI events, keyboard shortcuts, and step transitions.
  - `form.css`: Minimal CSS design system scoped strictly inside Shadow DOM.
  - `page.css`: Styles for host page intro and technical badges.
  - `test.js`: Native zero-dependency Node.js unit test suite (24 tests).
  - `layout.test.js`: Programmatic headless browser responsive layout and contrast test runner.
- **Validation Strategy (HTML5 + JS Hybrid)**:
  - Native HTML5 attributes (`required`, `minlength`, `maxlength`, `pattern`, `type="email"`, `type="url"`) provide baseline constraint enforcement.
  - JavaScript validation is retained for:
    1. *Custom, Helpful Error Text*: Native HTML5 pattern failure displays generic browser text (e.g. "Please match the requested format"). In JS, we provide clear, actionable feedback ("Only letters, numbers, spaces, dashes, and underscores allowed").
    2. *Multi-Element Constraints*: HTML5 cannot natively validate checkbox group minimum counts (e.g. "select at least 1 route").
    3. *Step 4 Review Step / Offscreen State*: In a multi-step workflow, earlier step inputs are unmounted from the DOM. A JS data object is needed to verify the overall payload when clicking "Activate Policy" on the review screen.
- **Zero Build Tooling**: Runs directly in the browser via native ES module imports (`import / export`) with wide baseline compatibility.
- **System Theme & Accessibility Standards**:
  - Automatically matches browser/system preference (`prefers-color-scheme: light/dark`).
  - Supports Windows High Contrast and WCAG AAA (`prefers-contrast: more` / `forced-colors: active`).
  - Decoupled semantic tokens (`--bg`, `--text`, `--border`) prevent color collisions in inverted modes.
- **Robust State & Non-Destructive Navigation**:
  - All form values reside in a centralized state object (`formData`).
  - Stepper navigation and "Back" buttons never erase earlier inputs.
  - Review screen provides direct "Edit" jump links to return to any prior step without state loss.
  - Automatically persists form progress to `localStorage` with debouncing.

### 3. Architectural Trade-offs & Technology Selection

| Decision | Chosen Approach | Alternative Considered | Trade-off & Rationale |
| :--- | :--- | :--- | :--- |
| **Component Architecture** | **Native Web Component (`<ai-guardrail-form>`)** | React / Vue / Svelte | **Pros**: 0 KB library overhead, zero build/transpilation pipeline, strict Shadow DOM style encapsulation.<br>**Cons**: Manual DOM updates without virtual DOM diffing (mitigated by clean functional sub-templates). |
| **View Layer** | **Pure Functional HTML Templates (`templates.js`)** | Monolithic Web Component | **Pros**: Completely separates UI presentation from event handling and state logic; pure functions are instantly unit-testable.<br>**Cons**: Requires template helper imports. |
| **Language & Tooling** | **Pure ES6+ JavaScript** | TypeScript | **Pros**: Runs directly in browsers and static Jekyll sites without `tsc` compilation or `package.json` build steps.<br>**Cons**: No compile-time type checking (mitigated by automated `node:test` schema and validation suites). |
| **Styling & Theming** | **Modular Vanilla CSS with Custom Properties** | TailwindCSS / CSS-in-JS | **Pros**: Zero runtime or build-time CSS processors, native `@media (forced-colors)` / `@media (prefers-color-scheme)` support, private Shadow DOM stylesheet.<br>**Cons**: No utility classes (mitigated by clean, semantic BEM-like class tokens). |
| **Form Validation** | **HTML5 Constraints + Minimal JS Hybrid** | React Hook Form / Formik / Yup / Zod | **Pros**: Leverages browser-native constraint checking (`pattern`, `required`, `minlength`, `type`) with zero dependencies. JS only handles custom error copy, multi-checkboxes, and offscreen state.<br>**Cons**: Requires custom event wiring for live blur/input states. |
| **Responsive Grid & Text Wrapping** | **`minmax(0, 1fr)` & `overflow-wrap: anywhere`** | `overflow-x: scroll` | **Pros**: Guarantees zero horizontal overflow on small screens even with long unbroken URLs and tokens.<br>**Cons**: Long strings wrap across multiple lines. |
| **Testing Strategy** | **Native `node:test` + Headless Puppeteer** | Jest / Vitest + Cypress | **Pros**: Instant sub-millisecond unit tests with zero npm devDependencies, real browser layout testing across 5 viewports.<br>**Cons**: Requires manual test harness setup rather than prepackaged test runners. |
| **Project Boundary** | **Self-Contained Directory (`projects/multi-step-form/`)** | Site-wide shared assets | **Pros**: Complete isolation; the rest of the blog has zero knowledge or coupling with this project.<br>**Cons**: Assets are local to this route rather than shared globally across other posts. |

### 4. Automated Verification & Responsive Metrics
The project includes a programmatic layout and geometry test suite (`layout.test.js`) executed across 5 standard viewports (Mobile Small `375px`, Mobile Large `412px`, Tablet `768px`, Laptop `1280px`, Full HD `1920px`):
1. **Zero Horizontal Overflow**: `document.documentElement.scrollWidth <= viewport.width` across every step.
2. **Bounding Containment**: Component boundaries fit cleanly within the viewport.
3. **Accessible Touch Targets**: All interactive controls satisfy $\ge 24\text{px}$ minimum tap height.
4. **Responsive Breakpoints**: Grid collapses to 1 column below $600\text{px}$ and expands to 2 columns on tablet/desktop.
5. **Color Contrast & Legibility**: Code snippet background (`--bg`) and text (`--text`) remain distinct across all themes, guaranteeing high-contrast readability.
6. **Multi-Step Flow Verification**: Validates transitions from Step 1 through Step 4 activation and cURL snippet generation.