---
layout: page
title: Hugging Face Model Radar & Explorer
permalink: /projects/model-explorer/
date: 2026-08-27
project:
  description: "An API-backed search and discovery dashboard for open-source AI models on Hugging Face Hub. Built using the RADIO system design framework with debounced input, AbortController request cancellation, two-way URL synchronization, zero-CLS skeletons, and accessible focus management."
  tags:
    - Hugging Face API
    - Light DOM Web Component
    - TDD & Native Tests
    - AbortController
    - URL Sync
    - Accessibility
    - Zero Dependencies
  source_path: projects/model-explorer
---

<!-- Interactive Web Component -->
<hf-model-explorer id="model-explorer-app" style="display: block; min-height: 800px;"></hf-model-explorer>

<!-- Page Stylesheet & Component Scripts -->
<link rel="stylesheet" href="./model-explorer.css">
<script type="module" src="./model-explorer.js"></script>

<hr class="section-divider" style="margin: 3rem 0; border: 0; border-top: 1px solid var(--hf-border, #334155);" />
