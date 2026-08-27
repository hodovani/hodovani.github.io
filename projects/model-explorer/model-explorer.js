/**
 * Hugging Face Model Explorer - Root Web Component (Light DOM)
 * Implements Trade-off 6: Hybrid Thin Component Shell
 * Implements Trade-off 7: Native <dialog> Modal Overlay (Google Chrome Modern Web Guidance)
 */

import { ModelExplorerStore, syncToURL, rehydrateFromURL } from './state.js';
import { searchModels, getModelDetails } from './model-service.js';
import { FocusCoordinator } from './focus-manager.js';
import { debounce } from './utils.js';
import {
  renderSearchBar,
  renderFilterBar,
  renderMainContent,
  renderModelDetails,
  renderDetailsSkeleton
} from './templates.js';

export class HfModelExplorer extends HTMLElement {
  constructor() {
    super();
    this.store = new ModelExplorerStore();
    this.focusCoordinator = new FocusCoordinator();
    this._abortController = null;
    this._detailsAbortController = null;
    this._unsubscribe = null;
    this._onPopState = this._onPopState.bind(this);
    this._debouncedSearch = debounce(this._executeSearch.bind(this), 350);
  }

  connectedCallback() {
    // 1. Subscribe to store changes to trigger UI renders
    this._unsubscribe = this.store.subscribe((state) => this._render(state));

    // 2. Listen to browser Back/Forward navigation
    window.addEventListener('popstate', this._onPopState);

    // 3. Delegate user events on the host element
    this.addEventListener('click', this._handleClick.bind(this));
    this.addEventListener('input', this._handleInput.bind(this));
    this.addEventListener('change', this._handleChange.bind(this));
    this.addEventListener('keydown', this._handleKeyDown.bind(this));

    // 4. Rehydrate state from URL query parameters
    rehydrateFromURL(this.store);

    const initialState = this.store.getState();

    // 5. Initial fetch: load trending or search query, and model details if deep-linked
    this._executeSearch();

    if (initialState.selectedModelId) {
      this._fetchModelDetails(initialState.selectedModelId);
    }

    // 6. Progressive WebMCP Tool Registration for AI agent browsing
    this._registerWebMCPTools();
  }

  disconnectedCallback() {
    if (this._unsubscribe) {
      this._unsubscribe();
      this._unsubscribe = null;
    }
    window.removeEventListener('popstate', this._onPopState);
    this._abortController?.abort();
    this._detailsAbortController?.abort();
    this._mcpAbortController?.abort();
    this._debouncedSearch.cancel();
  }

  _registerWebMCPTools() {
    const modelContext = typeof document !== 'undefined' ? document.modelContext : null;
    if (modelContext && typeof modelContext.registerTool === 'function') {
      try {
        this._mcpAbortController = new AbortController();
        modelContext.registerTool({
          name: 'search_ai_models',
          description: 'Search open-source AI models on the Hugging Face Hub by keyword or pipeline task',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Keyword query (e.g. whisper, llama, flux)' },
              pipelineTag: { type: 'string', description: 'Pipeline task tag (e.g. text-generation, audio)' }
            }
          },
          execute: async (input) => {
            if (input.query) this.store.setQuery(input.query);
            if (input.pipelineTag) this.store.setPipelineTag(input.pipelineTag);
            await this._executeSearch();
            return this.store.getState().models;
          },
          annotations: { readOnlyHint: true }
        }, { signal: this._mcpAbortController.signal });
      } catch (err) {
        // WebMCP is progressive enhancement; non-fatal
      }
    }
  }

  _onPopState() {
    rehydrateFromURL(this.store);
    const state = this.store.getState();
    if (state.selectedModelId) {
      this._fetchModelDetails(state.selectedModelId);
    } else {
      const dialog = this.querySelector('#model-details-dialog');
      if (dialog?.open) {
        dialog.close();
      }
    }
  }

  /**
   * Executes API search with cancellation support (Milestone 1)
   */
  async _executeSearch() {
    const state = this.store.getState();

    if (this._abortController) {
      this._abortController.abort();
    }
    this._abortController = new AbortController();

    this.store.startSearch({
      query: state.query,
      filters: state.filters
    });

    syncToURL(this.store);

    try {
      const results = await searchModels(
        {
          query: state.query,
          pipelineTag: state.filters.pipelineTag,
          library: state.filters.library,
          sort: state.filters.sort,
          limit: 24
        },
        { signal: this._abortController.signal }
      );

      this.store.setResults(results);
    } catch (err) {
      if (err.name === 'AbortError') return;
      this.store.setError(err.message || 'Failed to load models.');
    }
  }

  /**
   * Fetches deep model metadata for modal details view
   */
  async _fetchModelDetails(modelId) {
    if (this._detailsAbortController) {
      this._detailsAbortController.abort();
    }
    this._detailsAbortController = new AbortController();

    this.store.openModel(modelId);
    syncToURL(this.store);

    try {
      const details = await getModelDetails(modelId, { signal: this._detailsAbortController.signal });
      this.store.setModelDetails(details);
    } catch (err) {
      if (err.name === 'AbortError') return;
      this.store.setError(`Failed to inspect model: ${err.message}`);
    }
  }

  _handleInput(e) {
    if (e.target.id === 'search-input') {
      const newQuery = e.target.value;
      this.store._state.query = newQuery;
      this._debouncedSearch();
    }
  }

  _handleChange(e) {
    if (e.target.id === 'sort-select') {
      this.store._state.filters.sort = e.target.value;
      this._executeSearch();
    }
  }

  _handleClick(e) {
    // 1. Task filter pills
    const taskBtn = e.target.closest('[data-task]');
    if (taskBtn) {
      const task = taskBtn.dataset.task;
      this.store._state.filters.pipelineTag = task === this.store.getState().filters.pipelineTag ? '' : task;
      this._executeSearch();
      return;
    }

    // 2. Library filter pills
    const libBtn = e.target.closest('[data-lib]');
    if (libBtn) {
      const lib = libBtn.dataset.lib;
      this.store._state.filters.library = lib === this.store.getState().filters.library ? '' : lib;
      this._executeSearch();
      return;
    }

    // 3. Clear search query button
    if (e.target.closest('#btn-clear-search')) {
      this.store._state.query = '';
      this._executeSearch();
      const input = this.querySelector('#search-input');
      input?.focus();
      return;
    }

    // 4. Clear all filters (empty state)
    if (e.target.closest('#btn-empty-clear-filters')) {
      this.store.resetFilters();
      this.store._state.query = '';
      this._executeSearch();
      return;
    }

    // 5. Retry search button (error state)
    if (e.target.closest('#btn-error-retry')) {
      this._executeSearch();
      return;
    }

    // 6. Click on model card -> open modal
    const card = e.target.closest('[data-model-id]');
    if (card && !e.target.closest('a')) {
      const modelId = card.dataset.modelId;
      this.focusCoordinator.recordTrigger(card);
      this._fetchModelDetails(modelId);
      return;
    }

    // 7. Close modal triggers ("Back to results" or Close button)
    if (e.target.closest('#btn-back-to-results') || e.target.closest('#btn-close-details')) {
      const dialog = this.querySelector('#model-details-dialog');
      if (dialog?.open) {
        dialog.close();
      }
      this.store.closeModel();
      syncToURL(this.store);
      this.focusCoordinator.restoreTriggerFocus();
      return;
    }

    // 8. Suggested query buttons
    const suggestBtn = e.target.closest('[data-suggest]');
    if (suggestBtn) {
      this.store._state.query = suggestBtn.dataset.suggest;
      this._executeSearch();
      return;
    }

    // 9. Copy snippet button
    const copyBtn = e.target.closest('#btn-copy-snippet');
    if (copyBtn) {
      const snippet = copyBtn.dataset.snippet;
      if (snippet && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(snippet).then(() => {
          const originalText = copyBtn.textContent;
          copyBtn.textContent = 'Copied!';
          copyBtn.classList.add('copied');
          setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.classList.remove('copied');
          }, 2000);
        });
      }
    }
  }

  _handleKeyDown(e) {
    // Enter or Space opens card when focused
    const card = e.target.closest('[data-model-id]');
    if (card && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      const modelId = card.dataset.modelId;
      this.focusCoordinator.recordTrigger(card);
      this._fetchModelDetails(modelId);
    }
  }

  /**
   * Main render function - keeps search dashboard mounted and overlays native <dialog>
   */
  _render(state) {
    let dialog = this.querySelector('#model-details-dialog');
    const mainEl = this.querySelector('#explorer-main');
    const searchInput = this.querySelector('#search-input');

    // 1. Initial shell mount if not yet rendered
    if (!mainEl || !searchInput) {
      const dashboardHtml = `
        <div class="explorer-app-shell">
          <header class="explorer-header">
            <div class="explorer-badge">Hugging Face Hub Explorer</div>
            <h2 class="explorer-title">Open Source AI Model Radar</h2>
            <p class="explorer-lead">
              Explore and benchmark trending foundation models, speech recognizers, vision models, and research artifacts with zero dependencies.
            </p>
          </header>

          <section class="explorer-controls" aria-label="Model filters and search">
            ${renderSearchBar(state)}
            ${renderFilterBar(state)}
          </section>

          <main class="explorer-main" id="explorer-main">
            ${renderMainContent(state)}
          </main>

          <!-- Native <dialog> Modal Overlay (Google Chrome Modern Web Guidance) -->
          <dialog class="model-details-dialog" id="model-details-dialog" closedby="any" aria-labelledby="details-heading"></dialog>
        </div>
      `.trim();

      this.innerHTML = dashboardHtml;
      dialog = this.querySelector('#model-details-dialog');
    } else {
      // 2. Incremental dashboard update (renders skeleton cards in #explorer-main during search)
      mainEl.innerHTML = renderMainContent(state);

      // Sync filter pills and controls without destroying input
      const activeTask = state.filters.pipelineTag || '';
      this.querySelectorAll('[data-task]').forEach(pill => {
        const isActive = pill.dataset.task === activeTask;
        pill.classList.toggle('active', isActive);
        pill.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });

      const activeLib = state.filters.library || '';
      this.querySelectorAll('[data-lib]').forEach(pill => {
        const isActive = pill.dataset.lib === activeLib;
        pill.classList.toggle('active', isActive);
        pill.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });

      const sortSelect = this.querySelector('#sort-select');
      if (sortSelect && sortSelect.value !== (state.filters.sort || 'downloads')) {
        sortSelect.value = state.filters.sort || 'downloads';
      }

      const clearBtn = this.querySelector('#btn-clear-search');
      if (clearBtn) {
        clearBtn.style.display = state.query ? 'flex' : 'none';
      }
    }

    // 3. Modal Dialog Lifecycle (Top Layer & Light Dismiss)
    if (dialog) {
      if (state.selectedModelId) {
        const detailsHtml = state.selectedModelDetails
          ? renderModelDetails(state.selectedModelDetails)
          : renderDetailsSkeleton();

        dialog.innerHTML = detailsHtml;

        if (typeof dialog.showModal === 'function' && !dialog.open) {
          dialog.showModal();
        }

        // Chrome Modern Web Guidance: Light-dismiss fallback for browsers without native closedby support
        if (!('closedBy' in HTMLDialogElement.prototype) && !dialog._hasLightDismissFallback) {
          dialog._hasLightDismissFallback = true;
          dialog.addEventListener('click', (event) => {
            if (event.target !== dialog) return;
            const rect = dialog.getBoundingClientRect();
            const isInside = (
              rect.top <= event.clientY &&
              event.clientY <= rect.top + rect.height &&
              rect.left <= event.clientX &&
              event.clientX <= rect.left + rect.width
            );
            if (!isInside) {
              dialog.close();
            }
          });
        }

        // Native close listener (Esc key, form method=dialog, backdrop click)
        if (!dialog._hasCloseListener) {
          dialog._hasCloseListener = true;
          dialog.addEventListener('close', () => {
            if (this.store.getState().selectedModelId) {
              this.store.closeModel();
              syncToURL(this.store);
              this.focusCoordinator.restoreTriggerFocus();
            }
          });
        }
      } else {
        if (dialog.open && typeof dialog.close === 'function') {
          dialog.close();
        }
      }
    }
  }
}

if (!customElements.get('hf-model-explorer')) {
  customElements.define('hf-model-explorer', HfModelExplorer);
}
