---
layout: post
title: "Designing for Humans and AI Agents: The Model Explorer Case Study"
description: "Building an API-backed Web Component with zero dependencies, Lighthouse User Flows, and WebMCP tools for autonomous browser agents."
---

I wanted a fast, resilient dashboard for the **Hugging Face Hub API**. No framework. No external dependencies.

You can test the live application here: [Hugging Face Model Radar & Explorer](/projects/model-explorer/).

To build it cleanly, I used the **RADIO framework**: Requirements, Architecture, Data Model, Interfaces, and Optimizations. Here is how it came together.

---

## 1. Requirements

What does the system actually need to do?

### Functional Requirements
- **Search & Filtering**: Search models by keyword. Filter by task (`text-generation`, `audio`, `vision`) and library (`transformers`, `gguf`). Sort by downloads, likes, or update time.
- **Explicit UI States**: Distinct visual states for Loading (skeletons), Empty (zero matches), and Error (network drops or rate limits).
- **Error Recovery**: A working Retry action that re-runs the failed request without resetting the user's filters.
- **Deep Inspection**: A details view showing model metadata, licenses, parameter counts, and quick Python usage snippets.

### Non-Functional Requirements
- **Accessibility**: Full keyboard navigation, logical tab order, and an ARIA live region (`aria-live="polite"`) for result counts. Focus must return cleanly when closing the details view.
- **URL as Source of Truth**: The address bar (`?q=...&task=...&model=...`) must stay bookmarkable and shareable at all times.
- **Zero Framework Overhead**: Vanilla JavaScript and native browser primitives. Clean request cancellation on rapid keystrokes.

---

## 2. Architecture

How do data and events move through the application?

The system coordinates state and UI across four decoupled layers:

1. **Browser URL ↔ Controller (Two-Way Sync)**  
   On boot or browser Back/Forward (`popstate`), the controller reads the query string to restore the exact view. When filters change, it updates the address bar via `history.pushState()` without a full reload. Every state is shareable.

2. **Controller (State Machine)**  
   The controller acts as the single source of truth. It manages transitions between `idle`, `loading`, `success`, `empty`, and `error`. Only one active request cycle can update the UI at any time, eliminating race conditions.

3. **Controller ➔ ModelService (Fetching & Cancellation)**  
   Typing is debounced by 350ms to keep the network quiet. Rapid keystrokes trigger `AbortController.abort()` to terminate in-flight fetches immediately. The service normalizes raw API payloads and maps HTTP errors into typed domain errors.

4. **Controller ➔ View Layer (Unidirectional Rendering)**  
   The view receives state and renders HTML string templates. Structured skeletons occupy space during loading to prevent layout shifts. Focus coordinators restore keyboard position when the user closes the modal.

---

## 3. Data Model

What state needs to exist? 

We model application state as an explicit state machine. This makes impossible UI states impossible to represent:

```typescript
type SearchStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error';

interface AppState {
  status: SearchStatus;
  query: string;
  filters: {
    pipelineTag: string;
    library: string;
    sort: 'downloads' | 'likes7d' | 'lastModified';
  };
  results: ModelSummary[];
  selectedModelId: string | null;
  selectedModelDetails: ModelDetails | null;
  errorMessage: string | null;
}
```

---

## 4. Interfaces & Contracts

To keep bandwidth and memory footprints minimal, we split the data model in two. The grid needs a lightweight summary. The modal needs deep metadata:

```typescript
interface ModelSummary {
  id: string;
  author: string;
  name: string;
  pipeline_tag: string;
  library_name?: string;
  likes: number;
  downloads: number;
  tags: string[];
  lastModified: string;
  private: boolean;
}

interface ModelDetails extends ModelSummary {
  description?: string;
  license?: string;
  sha: string;
  createdAt: string;
  cardData?: {
    language?: string[];
    license?: string;
    datasets?: string[];
    base_model?: string;
  };
  safetensors?: {
    total?: number;
    parameters?: Record<string, number>;
  };
  siblings: Array<{
    rfilename: string;
    size?: number;
  }>;
  spaces?: string[];
}

interface SearchParams {
  query?: string;
  pipelineTag?: string;
  library?: string;
  sort?: 'downloads' | 'likes7d' | 'lastModified';
  limit?: number;
}

interface ModelService {
  search(params: SearchParams, signal: AbortSignal): Promise<ModelSummary[]>;
  getDetails(modelId: string, signal: AbortSignal): Promise<ModelDetails>;
}
```

---

## 5. Architectural Trade-offs

Every technical decision carries a compromise. Here are the core trade-offs made during implementation.

### Trade-off 1: Debouncing vs. Search-on-Submit
Should the user press Enter, or should results appear as they type?

Search-on-submit minimizes network requests, but feels stiff. Debouncing feels responsive and modern. However, rapid typing risks race conditions where an older request finishes after a newer one.

We resolve this by combining a 350ms debounce with native `AbortController`. Every new keystroke cancels the pending fetch immediately before scheduling the next. Fast typing never leaves dangling network requests.

### Trade-off 2: Skeleton Placeholders vs. Center Spinners
How should the UI communicate loading?

A centered spinner is easy to drop in, but collapses container height. When results arrive, the page abruptly expands, triggering high Cumulative Layout Shift (CLS).

We render 6 structured skeleton cards matching the exact dimensions of real cards. Viewport height remains completely stable from the first millisecond of data loading.

### Trade-off 3: URL State vs. Internal Component Memory
Where should state live?

Storing state purely in component memory breaks the browser's native Back and Forward buttons. It also makes link sharing impossible.

We bind every filter change directly to `window.location.search` through `history.pushState()`. On page load or `popstate`, the controller rehydrates from the URL. The URL remains the single source of truth.

### Trade-off 4: Focus Management in Deep Views
What happens to keyboard navigation when opening a modal?

Without focus management, keyboard users stay trapped on the trigger card behind the modal backdrop. When closing, they lose their spot entirely.

On modal open, focus shifts to the modal title. On modal close, the focus coordinator restores focus directly to the card that triggered the view, preventing disruptive scroll jumps.

### Trade-off 5: Stale Results vs. Explicit Error States
What should happen when a request fails?

Some applications keep old cards on screen and show a subtle toast. This breeds ambiguity: did the new filter apply or not?

We clear stale results and transition explicitly to a dedicated Error State card. It provides a clear retry button so the user knows exactly what failed and how to recover.

### Trade-off 6: Pure Templates vs. Shadow DOM vs. Light DOM Custom Element
How should we encapsulate component markup?

Pure template functions are fast to test in `node:test`, but lack lifecycle cleanup. Shadow DOM encapsulates styles, but breaks cross-boundary accessibility (`aria-labelledby`, form associations).

We chose a thin Custom Element shell in **light DOM**. Pure string functions handle rendering for instant testing, while the custom element provides clean `connectedCallback` and `disconnectedCallback` hooks with zero accessibility barriers.

### Trade-off 7: Native `<dialog>` Modal vs. In-Place Page Swapping
What happens if you swap the search grid for a full details view?

Swapping the page collapses the document height and forcibly clamps the window scroll position to the top. Returning to results snaps the viewport and disorients the user.

We use a native HTML5 `<dialog>` opened with `.showModal()`. The results grid underneath remains completely untouched in the DOM. Scroll position stays locked, background content becomes inert natively, and pressing `Escape` closes the view without custom code.

---

## 6. Incremental Verification with TDD

Testing should never be left to the end. Leaving verification for last guarantees regressions and painful rework.

We followed a Test-Driven Development (TDD) approach from milestone zero. Every feature followed a tight three-step loop:

1. **Write the test first:** Define exact failure modes, data schemas, and a11y requirements.
2. **Implement the minimum code:** Write just enough logic to make the test pass.
3. **Run the programmatic QA gate:** Verify all assertions pass before adding more complexity.

### Milestone 1: Service Layer & Request Cancellation
- **Goal:** Reliable network fetching with abort capabilities.
- **Verification:** Verified query string serialization, mocked HTTP 429 rate limits, and asserted that `abortController.abort()` cleanly halts in-flight requests.
- **Code:** Built `ModelService` with native `fetch` and typed error normalization.

### Milestone 2: State Coordinator & URL Synchronization
- **Goal:** An airtight state machine where impossible UI states cannot exist.
- **Verification:** Tested transitions between `idle`, `loading`, `success`, `empty`, and `error`. Verified that `history.pushState` and `rehydrateFromURL()` round-trip query parameters symmetrically.
- **Code:** Built the centralized state store and URL router bindings.

### Milestone 3: Debounced Search & Structured Skeletons
- **Goal:** Responsive input with zero layout shift during fetches.
- **Verification:** Used timer tests to assert that rapid typing only dispatches after 350ms of quiet time. Asserted that 6 structured skeleton cards render during loading.
- **Code:** Built search input controls, filter pills, and CSS skeleton styles.

### Milestone 4: Edge States & Recovery
- **Goal:** Clear boundaries for empty results and network drops.
- **Verification:** Asserted that failed queries wipe stale cards from the DOM. Tested that clicking "Retry" re-fetches without resetting user inputs.
- **Code:** Built accessible empty and error view templates with retry handlers.

### Milestone 5: Details View & Focus Coordination
- **Goal:** Accessible inspection modal with reliable keyboard navigation.
- **Verification:** Asserted focus shifts to the modal title on open. Verified that closing the view restores focus to the triggering card with `preventScroll: true`.
- **Code:** Built details templates, telemetry stat grids, code snippet generator, and focus coordinator.

---

## 7. Auditing Transitions with Lighthouse User Flows

A standard Lighthouse run tests a single page load. But what happens when the user interacts with the app? What happens when a modal opens, runs animations, and closes?

Single-page audits miss transition bugs. To inspect the complete user journey, we audited five distinct steps with **Lighthouse 13.4 User Flows**:

1. **Navigation**: Cold load of the explore dashboard.
2. **Timespan**: Modal open transition (measuring Interaction to Next Paint and runtime CLS).
3. **Snapshot**: Modal open DOM accessibility, contrast, and focus trapping.
4. **Timespan**: Modal close transition and focus return.
5. **Snapshot**: Restored search grid state.

### The Three Modes of Lighthouse User Flows

| Flow Mode | What It Measures | In Model Explorer |
| :--- | :--- | :--- |
| **Navigation** | Cold load metrics (FCP, LCP, CLS, SEO) | Initial dashboard load, search bar, and skeleton grid |
| **Timespan** | Performance and layout stability **during user interaction** | Card click transition to `<dialog>`, measuring INP and runtime CLS |
| **Snapshot** | Live DOM accessibility, contrast, and focus trapping | Inspecting the active `<dialog>` modal and restored grid state |

### What the Audit Caught

Testing live state transitions exposed three critical issues that standard audits missed:

#### 1. Cumulative Layout Shift on Web Component Boot (CLS: 0.698 ➔ 0.000)
The custom element parsed with an initial height of `0px`. Then JavaScript booted and search results populated, jumping the container to `6000px`. Layout shift spiked to `0.698`.

We fixed this by reserving layout space upfront in CSS. Adding `min-height: 800px` on `<hf-model-explorer>` and `min-height: 540px` on `.explorer-main` stabilized the initial paint to a perfect **CLS of 0.000**.

#### 2. Color Contrast on High-Traffic Controls (4.09:1 ➔ 5.7:1)
In light mode, brand blue (`#0284c7`) scored a contrast ratio of `4.09:1` against white backgrounds on badges and filter pills. This failed WCAG AA's mandatory `4.5:1` threshold.

We shifted `--hf-primary` in light theme to `#0369a1`. This yielded a crisp **5.7:1 contrast ratio**, clearing the audit without sacrificing visual clarity.

#### 3. Deep Modal A11y Traps
During the modal snapshot, Lighthouse caught two subtle accessibility flaws:
- **Heading Order Collision:** Inside the modal, the title used `<h1>`. Because Jekyll's page template already had an `<h1>`, this violated descending heading order. We changed the modal title to `<h2>`.
- **Label in Name Mismatch:** The "Back to results" button had visible text `← Back to results`, but had an `aria-label="Close details"`. Because the accessible name did not contain the visible text, speech-recognition tools could not target it. Aligning `aria-label="Back to results"` resolved the violation.

### Accessibility for AI Agents

Accessibility is no longer just for screen readers. It is the primary sensory layer for **autonomous AI agents**.

When markup violates ARIA rules—like placing `role="button"` on an `<article>` landmark—the accessibility tree becomes malformed. Screen readers misannounce content, and AI agents fail to locate interactive controls.

Lighthouse 13.4 introduces dedicated **Agentic Browsing** audits to test how machine-operable a web application is:

#### 1. Machine Sitemaps with `llms.txt`
Just as `robots.txt` guides search engine crawlers, [llms.txt](https://llmstxt.org/) guides LLMs on project architecture, core APIs, and documentation. 

Instead of maintaining this file manually, Jekyll compiles `/llms.txt` dynamically on every build using a root Liquid template:

```liquid
---
layout: null
permalink: /llms.txt
---
# {{ site.title }}

> {{ site.description }}

## Interactive Projects
{% assign project_pages = site.pages | where_exp: "item", "item.project" | sort: "date" | reverse %}
{% for item in project_pages %}
- [{{ item.title }}]({{ item.url | absolute_url }}): {{ item.project.description }}
{% endfor %}

## Technical Writing
{% for post in site.posts limit: 25 %}
- [{{ post.title }}]({{ post.url | absolute_url }}): {{ post.excerpt | strip_html | truncate: 140 }}
{% endfor %}
```

#### 2. Declarative WebMCP Form Tools
Using Chrome's emerging **Web Model Context Protocol (WebMCP)**, web forms can expose themselves directly as callable tools to AI agents:

```html
<search class="search-bar-container" role="search">
  <form
    class="search-input-wrapper"
    toolname="search_ai_models"
    tooldescription="Search and benchmark open-source AI models on Hugging Face Hub"
    toolautosubmit
    onsubmit="return false;"
  >
    <input
      type="search"
      id="search-input"
      name="query"
      class="search-input"
      placeholder="Search models (e.g., whisper, llama, flux)..."
      aria-label="Search open-source AI models"
    />
  </form>
</search>
```

In standard browsers, the `tool*` attributes are cleanly ignored with zero runtime overhead. In WebMCP-enabled browsers, an agent can trigger `search_ai_models` directly as a structured tool call rather than guessing at form inputs.

---

## What Stays With Me

Building a fast, resilient web app without a framework is not about writing messy vanilla code. It is about **deliberate architectural discipline**:

- Model state as a finite state machine to make impossible UI states impossible to render.
- Keep the URL as the single source of truth for seamless sharing and navigation.
- Reach for native browser primitives (`<dialog>`, light DOM Web Components, `<search>`) before installing third-party dependencies.
- Verify every transition with Lighthouse User Flows to guarantee zero layout shifts, solid accessibility, and clean support for both human users and AI agents.
