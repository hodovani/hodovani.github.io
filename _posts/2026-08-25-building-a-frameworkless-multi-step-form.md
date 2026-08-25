---
layout: post
title: "Building a Frameworkless Multi-Step Form: Web Components, A11y, and Upfront System Design"
description: "Why I stepped outside the React ecosystem to build a multi-step form using native Web Components, HTML/CSS/JS, automated Lighthouse CI, and AI-assisted upfront system design."
---

I recently took the opportunity to build a couple of frontend projects with a minimal stack: pure **HTML**, **CSS**, **vanilla JavaScript**, and native **Web Components**.

After working extensively with React, you almost forget what state management, rendering lifecycles, and UI orchestration look like without framework abstractions. I wanted to step outside of frameworks to dive deep into native web platform fundamentals.

---

## Upfront System Design Over Writing Code First

Instead of immediately jumping in to write code, I started by doing comprehensive system design:
- **System Definitions & Constraints**: Defining exact data schemas, input constraints, and component boundaries.
- **Interfaces & Data Flow**: Mapping state transitions, event dispatching, and review screen serialization.
- **Accessibility Requirements**: Establishing keyboard navigation patterns, focus management, and ARIA live announcements upfront.

Investing time in requirement analysis, architecture, and trade-offs before generating code paid off significantly. It streamlined the process and prevented unnecessary rework.

---

## AI Pair-Programming with Antigravity IDE

I used **Gemini Flash** inside **Antigravity IDE** to generate code and iterate through technical solutions based on my system specifications.

Because the project had a lean, zero-dependency footprint, I spent my time reading every line of generated code, refining edge cases, and ensuring I fully understood the implementation details. This deep-reading workflow helped me learn more about Web Component encapsulation (`customElements`, Shadow DOM), custom event dispatching, and clean functional template separation.

---

## Deep Dive into Accessibility (A11y)

Accessibility was a core constraint from the start:
- Full keyboard navigation and logical tab order across every step.
- Real-time error announcements using `aria-live="polite"` regions for screen readers.
- High-contrast visual styling meeting WCAG AAA color standards.
- Verification and audit workflows using Chrome DevTools.

A big shout-out to the [web.dev Learn Accessibility](https://web.dev/learn/accessibility) course, which provided great guidance on semantic HTML, accessible form design, and ARIA patterns.

---

## Programmatic Testing with Lighthouse CI

To guarantee that accessibility, performance, and best practices remain top tier, I integrated [Google Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) into the GitHub Actions CI pipeline.

On every pull request, Lighthouse CI audits the compiled static site and posts an automated summary table directly into the PR comments and job summaries. This automated visibility sped up iteration and helped achieve **100/100 across Performance, Accessibility, Best Practices, and SEO**.

---

## Key Takeaways

### 1. What I Built
A responsive, multi-step [AI Guardrail Policy Builder](/projects/multi-step-form/) with live step validation, review confirmation, downloadable JSON policies, and dynamic cURL generation.

### 2. Frontend Decisions
- **Single Source of Truth**: Kept all form state in one centralized object so the review step can read and serialize the entire configuration cleanly.
- **Step-by-Step Validation**: Validated each step before allowing progress forward to keep users on a clear path without surprise errors on submit.

### 3. What I Learned
Form UX is much more than inputs. Disabled states, error copy, focus transitions, review screens, and keyboard ergonomics make all the difference in real-world usability.

### 4. What I Would Improve
For future projects, I will focus on an even more disciplined, **layer-by-layer** construction approach — building and validating data schemas and foundational primitives before layering UI components and styling.

---

Overall, it was a great experience to build outside of React and see firsthand how powerful, fast, and lean the native modern web platform is on its own!
