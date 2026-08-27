/**
 * Accessible View Templates for Hugging Face Model Explorer - Milestone 3
 * Provides pure HTML template functions with zero layout shift (CLS) skeletons and ARIA live regions.
 */

import { escapeHtml, formatNumber, formatParameters, generateUsageSnippet } from './utils.js';

export const POPULAR_TASKS = [
  { id: '', label: 'All Tasks' },
  { id: 'text-generation', label: 'Text Generation' },
  { id: 'automatic-speech-recognition', label: 'Audio / Speech' },
  { id: 'image-to-image', label: 'Vision / Image' },
  { id: 'text-to-image', label: 'Text to Image' },
  { id: 'feature-extraction', label: 'Embeddings' }
];

export const POPULAR_LIBRARIES = [
  { id: '', label: 'All Libraries' },
  { id: 'transformers', label: 'Transformers' },
  { id: 'safetensors', label: 'Safetensors' },
  { id: 'gguf', label: 'GGUF' },
  { id: 'diffusers', label: 'Diffusers' },
  { id: 'onnx', label: 'ONNX' }
];

export const SORT_OPTIONS = [
  { id: 'downloads', label: 'Most Downloads' },
  { id: 'likes7d', label: 'Most Liked' },
  { id: 'lastModified', label: 'Recently Updated' }
];

/**
 * Renders the search bar input with clear action and live loading indicator
 */
export function renderSearchBar({ query = '', status = 'idle' } = {}) {
  const safeQuery = escapeHtml(query);
  const isLoading = status === 'loading';

  return `
    <search class="search-bar-container" role="search">
      <form
        class="search-input-wrapper"
        toolname="search_ai_models"
        tooldescription="Search and benchmark open-source AI models on Hugging Face Hub"
        toolautosubmit
        onsubmit="return false;"
      >
        <svg class="search-icon" aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          type="search"
          id="search-input"
          name="query"
          class="search-input"
          placeholder="Search models (e.g., whisper, llama, flux)..."
          value="${safeQuery}"
          aria-label="Search open-source AI models"
          autocomplete="off"
          spellcheck="false"
        />
        ${safeQuery ? `
          <button type="button" class="btn-clear-search" id="btn-clear-search" aria-label="Clear search query">
            &times;
          </button>
        ` : ''}
        ${isLoading ? `
          <span class="search-spinner" aria-label="Searching..."></span>
        ` : ''}
      </form>
    </search>
  `.trim();
}

/**
 * Renders faceted filter pills and sort dropdown
 */
export function renderFilterBar({ filters = {} } = {}) {
  const activeTask = filters.pipelineTag || '';
  const activeLib = filters.library || '';
  const activeSort = filters.sort || 'downloads';

  const taskPills = POPULAR_TASKS.map(t => {
    const isActive = t.id === activeTask;
    return `<button type="button" class="filter-pill ${isActive ? 'active' : ''}" data-task="${escapeHtml(t.id)}" aria-pressed="${isActive ? 'true' : 'false'}">${escapeHtml(t.label)}</button>`;
  }).join('');

  const libPills = POPULAR_LIBRARIES.map(l => {
    const isActive = l.id === activeLib;
    return `<button type="button" class="filter-pill ${isActive ? 'active' : ''}" data-lib="${escapeHtml(l.id)}" aria-pressed="${isActive ? 'true' : 'false'}">${escapeHtml(l.label)}</button>`;
  }).join('');

  const sortOptions = SORT_OPTIONS.map(s => {
    const isSelected = s.id === activeSort;
    return `<option value="${escapeHtml(s.id)}" ${isSelected ? 'selected' : ''}>${escapeHtml(s.label)}</option>`;
  }).join('');

  return `
    <div class="filters-bar" role="toolbar" aria-label="Search filters and sorting">
      <div class="filters-group" role="group" aria-label="Filter by ML Task">
        <span class="filters-label">Task:</span>
        <div class="pills-scroll-container">
          ${taskPills}
        </div>
      </div>

      <div class="filters-group" role="group" aria-label="Filter by Framework or Library">
        <span class="filters-label">Library:</span>
        <div class="pills-scroll-container">
          ${libPills}
        </div>
      </div>

      <div class="sort-group">
        <label for="sort-select" class="filters-label">Sort by:</label>
        <select id="sort-select" class="sort-select" aria-label="Sort models">
          ${sortOptions}
        </select>
      </div>
    </div>
  `.trim();
}

/**
 * Renders structured skeleton placeholders to prevent Cumulative Layout Shift (CLS)
 */
export function renderSkeletonGrid(count = 6) {
  const cards = Array.from({ length: count }, () => `
    <div class="skeleton-card" aria-hidden="true">
      <div class="skeleton-line skeleton-author"></div>
      <div class="skeleton-line skeleton-title"></div>
      <div class="skeleton-badges">
        <div class="skeleton-badge"></div>
        <div class="skeleton-badge"></div>
      </div>
      <div class="skeleton-line skeleton-meta"></div>
    </div>
  `.trim()).join('');

  return `
    <div class="models-grid skeleton-grid" aria-busy="true" aria-label="Loading models">
      ${cards}
    </div>
  `.trim();
}

/**
 * Renders an accessible, interactive model card
 */
export function renderModelCard(model) {
  const safeId = escapeHtml(model.id);
  const safeAuthor = escapeHtml(model.author);
  const safeName = escapeHtml(model.name);
  const safeTask = escapeHtml(model.pipeline_tag || 'other');
  const safeLib = escapeHtml(model.library_name || '');
  const formattedDownloads = formatNumber(model.downloads);
  const formattedLikes = formatNumber(model.likes);

  return `
    <div
      class="model-card"
      role="button"
      tabindex="0"
      data-model-id="${safeId}"
      aria-label="${safeAuthor} ${safeName}, ${safeTask}, ${formattedDownloads} downloads"
    >
      <div class="model-card-header">
        <span class="model-author">${safeAuthor}</span>
        <h3 class="model-title">${safeName}</h3>
      </div>

      <div class="model-badges">
        <span class="badge badge-task">${safeTask}</span>
        ${safeLib ? `<span class="badge badge-library">${safeLib}</span>` : ''}
      </div>

      <div class="model-card-footer">
        <div class="model-stat" title="${model.downloads} downloads">
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          <span>${formattedDownloads}</span>
        </div>

        <div class="model-stat" title="${model.likes} likes">
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
          </svg>
          <span>${formattedLikes}</span>
        </div>
      </div>
    </div>
  `.trim();
}

/**
 * Renders the results grid with an ARIA live region for screen-reader announcements
 */
export function renderResultsGrid(models = [], { query = '' } = {}) {
  const count = models.length;
  const modelWord = count === 1 ? 'model' : 'models';
  const queryNotice = query ? ` for "${escapeHtml(query)}"` : '';
  const announcement = `Found ${count} ${modelWord}${queryNotice}`;

  const cardsHtml = models.map(renderModelCard).join('');

  return `
    <div class="results-container">
      <div class="results-header" aria-live="polite" role="status">
        <span class="results-count">${announcement}</span>
      </div>
      <div class="models-grid" role="region" aria-label="Search results">
        ${cardsHtml}
      </div>
    </div>
  `.trim();
}

/**
 * Renders the empty state when no models match the query or filters
 */
export function renderEmptyState({ query = '', filters = {} } = {}) {
  const safeQuery = escapeHtml(query);
  const hasFilters = Boolean(filters.pipelineTag || filters.library || (filters.sort && filters.sort !== 'downloads'));

  let detailMsg = 'Try broadening your search term or exploring different categories.';
  if (safeQuery && hasFilters) {
    detailMsg = `No models found matching "<strong>${safeQuery}</strong>" with the active filters.`;
  } else if (safeQuery) {
    detailMsg = `No models found matching "<strong>${safeQuery}</strong>".`;
  } else if (hasFilters) {
    detailMsg = 'No models match the selected filter combination.';
  }

  return `
    <div class="empty-state" role="status" aria-label="No models found">
      <div class="empty-state-icon" aria-hidden="true">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          <line x1="8" y1="11" x2="14" y2="11"></line>
        </svg>
      </div>
      <h3 class="empty-state-title">No models found</h3>
      <p class="empty-state-text">${detailMsg}</p>
      <div class="empty-state-actions">
        <button type="button" class="btn-action btn-clear-filters" id="btn-empty-clear-filters">
          Clear all filters
        </button>
      </div>
    </div>
  `.trim();
}

/**
 * Renders the error state with contextual message and recovery retry action
 */
export function renderErrorState({
  errorMessage = 'An unexpected error occurred while fetching models.',
  canRetry = true,
  retryAfter = null
} = {}) {
  const safeError = escapeHtml(errorMessage);

  return `
    <div class="error-state" role="alert" aria-live="assertive">
      <div class="error-state-icon" aria-hidden="true">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <h3 class="error-state-title">Unable to Load Models</h3>
      <p class="error-state-text">${safeError}</p>
      ${retryAfter ? `
        <p class="error-state-hint">
          API rate limit active. Please wait <strong>${Number(retryAfter)} seconds</strong> before retrying.
        </p>
      ` : `
        <p class="error-state-hint">
          Please check your network connection or try again.
        </p>
      `}
      ${canRetry ? `
        <div class="error-state-actions">
          <button type="button" class="btn-action btn-retry" id="btn-error-retry">
            Retry Search
          </button>
        </div>
      ` : ''}
    </div>
  `.trim();
}

/**
 * Renders initial welcome / suggested searches state
 */
export function renderIdleState() {
  return `
    <div class="idle-state" role="region" aria-label="Suggested Searches">
      <div class="idle-state-header">
        <h3>Explore Open Source Machine Learning</h3>
        <p>Type a keyword above or select a trending model collection:</p>
      </div>
      <div class="suggested-queries">
        <button type="button" class="btn-suggested" data-suggest="whisper">Whisper (Speech)</button>
        <button type="button" class="btn-suggested" data-suggest="llama">Llama 3 (LLM)</button>
        <button type="button" class="btn-suggested" data-suggest="flux">Flux (Image Gen)</button>
        <button type="button" class="btn-suggested" data-suggest="bert">BERT (Embeddings)</button>
      </div>
    </div>
  `.trim();
}

/**
 * Routes main content rendering based on state status (Trade-off 5: strict boundary)
 */
export function renderMainContent(state = {}) {
  switch (state.status) {
    case 'loading':
      return renderSkeletonGrid(6);
    case 'empty':
      return renderEmptyState(state);
    case 'error':
      return renderErrorState(state);
    case 'success':
      return renderResultsGrid(state.results, { query: state.query });
    case 'idle':
    default:
      return renderIdleState();
  }
}

/**
 * Renders the full details inspection view for a single model
 */
export function renderModelDetails(details = {}, { isLoading = false } = {}) {
  const safeId = escapeHtml(details.id || '');
  const safeAuthor = escapeHtml(details.author || 'community');
  const safeName = escapeHtml(details.name || details.id || 'Model');
  const safeTask = escapeHtml(details.pipeline_tag || 'other');
  const safeLib = escapeHtml(details.library_name || '');
  const safeLicense = escapeHtml(details.license || 'unknown');
  const formattedDownloads = formatNumber(details.downloads || 0);
  const formattedLikes = formatNumber(details.likes || 0);
  const paramsText = details.safetensors?.total
    ? formatParameters(details.safetensors.total)
    : 'Not specified';

  const usageSnippet = generateUsageSnippet(details.id, details.pipeline_tag);
  const safeSnippet = escapeHtml(usageSnippet);

  const spacesHtml = Array.isArray(details.spaces) && details.spaces.length > 0
    ? `
      <div class="details-section">
        <h3 class="section-subtitle">Connected Spaces Demos</h3>
        <div class="spaces-list">
          ${details.spaces.map(s => `
            <a href="https://huggingface.co/spaces/${escapeHtml(s)}" target="_blank" rel="noopener noreferrer" class="space-badge">
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              <span>${escapeHtml(s)}</span>
            </a>
          `).join('')}
        </div>
      </div>
    `.trim() : '';

  const filesHtml = Array.isArray(details.siblings) && details.siblings.length > 0
    ? `
      <div class="details-section">
        <h3 class="section-subtitle">Repository Files (${details.siblings.length})</h3>
        <ul class="files-list">
          ${details.siblings.slice(0, 8).map(f => `
            <li class="file-item">
              <span class="file-name">${escapeHtml(f.rfilename)}</span>
              ${f.size ? `<span class="file-size">${formatNumber(f.size)}B</span>` : ''}
            </li>
          `).join('')}
          ${details.siblings.length > 8 ? `<li class="file-more">+ ${details.siblings.length - 8} more files</li>` : ''}
        </ul>
      </div>
    `.trim() : '';

  return `
    <div class="model-details-view" role="region" aria-labelledby="details-heading">
      <div class="details-nav">
        <button type="button" class="btn-back" id="btn-back-to-results" aria-label="Back to results">
          &larr; Back to results
        </button>
        <form method="dialog" class="dialog-close-form">
          <button type="submit" class="btn-close-modal" id="btn-close-details" aria-label="Close details dialog">&times;</button>
        </form>
      </div>

      <header class="details-header">
        <div class="details-title-row">
          <span class="details-author">${safeAuthor}</span>
          <h2 class="details-title" id="details-heading" tabindex="-1">${safeName}</h2>
        </div>
        <div class="details-actions">
          <a
            href="https://huggingface.co/${safeId}"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-link hf-external-link"
            aria-label="View on Hugging Face: ${safeName}"
          >
            View on Hugging Face &rarr;
          </a>
        </div>
      </header>

      <div class="details-telemetry-grid">
        <div class="telemetry-card">
          <span class="telemetry-label">Downloads</span>
          <span class="telemetry-value">${formattedDownloads}</span>
        </div>
        <div class="telemetry-card">
          <span class="telemetry-label">Likes</span>
          <span class="telemetry-value">${formattedLikes}</span>
        </div>
        <div class="telemetry-card">
          <span class="telemetry-label">Parameters</span>
          <span class="telemetry-value">${paramsText}</span>
        </div>
        <div class="telemetry-card">
          <span class="telemetry-label">License</span>
          <span class="telemetry-value badge-license">${safeLicense}</span>
        </div>
        <div class="telemetry-card">
          <span class="telemetry-label">Task</span>
          <span class="telemetry-value badge-task">${safeTask}</span>
        </div>
        ${safeLib ? `
          <div class="telemetry-card">
            <span class="telemetry-label">Library</span>
            <span class="telemetry-value badge-library">${safeLib}</span>
          </div>
        ` : ''}
      </div>

      <div class="details-section">
        <div class="snippet-header">
          <h3 class="section-subtitle">Quick Python Usage</h3>
          <button type="button" class="btn-copy" id="btn-copy-snippet" data-snippet="${safeSnippet}">
            Copy Code
          </button>
        </div>
        <pre class="snippet-code"><code>${safeSnippet}</code></pre>
      </div>

      ${spacesHtml}
      ${filesHtml}
    </div>
  `.trim();
}

/**
 * Renders a structured details skeleton placeholder (Zero-CLS)
 * Matches the exact geometry and height of the loaded details view to prevent document collapse.
 */
export function renderDetailsSkeleton() {
  return `
    <div class="model-details-view details-skeleton" role="region" aria-busy="true" aria-label="Loading model details">
      <div class="details-nav">
        <button type="button" class="btn-back" id="btn-back-to-results" aria-label="Back to results">
          &larr; Back to results
        </button>
        <form method="dialog" class="dialog-close-form">
          <button type="submit" class="btn-close-modal" id="btn-close-details-skeleton" aria-label="Close details dialog">&times;</button>
        </form>
      </div>

      <header class="details-header">
        <div class="details-title-row" style="width: 70%;">
          <div class="skeleton-line skeleton-author" style="width: 140px; height: 16px; margin-bottom: 0.5rem;"></div>
          <div class="skeleton-line skeleton-title" style="width: 320px; height: 36px;"></div>
        </div>
      </header>

      <div class="details-telemetry-grid">
        <div class="telemetry-card skeleton-telemetry">
          <div class="skeleton-line" style="width: 60px; height: 12px; margin-bottom: 0.5rem;"></div>
          <div class="skeleton-line" style="width: 80px; height: 26px;"></div>
        </div>
        <div class="telemetry-card skeleton-telemetry">
          <div class="skeleton-line" style="width: 50px; height: 12px; margin-bottom: 0.5rem;"></div>
          <div class="skeleton-line" style="width: 70px; height: 26px;"></div>
        </div>
        <div class="telemetry-card skeleton-telemetry">
          <div class="skeleton-line" style="width: 70px; height: 12px; margin-bottom: 0.5rem;"></div>
          <div class="skeleton-line" style="width: 100px; height: 26px;"></div>
        </div>
        <div class="telemetry-card skeleton-telemetry">
          <div class="skeleton-line" style="width: 50px; height: 12px; margin-bottom: 0.5rem;"></div>
          <div class="skeleton-line" style="width: 80px; height: 26px;"></div>
        </div>
        <div class="telemetry-card skeleton-telemetry">
          <div class="skeleton-line" style="width: 45px; height: 12px; margin-bottom: 0.5rem;"></div>
          <div class="skeleton-line" style="width: 90px; height: 26px;"></div>
        </div>
        <div class="telemetry-card skeleton-telemetry">
          <div class="skeleton-line" style="width: 55px; height: 12px; margin-bottom: 0.5rem;"></div>
          <div class="skeleton-line" style="width: 85px; height: 26px;"></div>
        </div>
      </div>

      <div class="details-section">
        <div class="skeleton-line" style="width: 180px; height: 20px; margin-bottom: 1rem;"></div>
        <div class="skeleton-line" style="width: 100%; height: 170px; border-radius: var(--hf-radius-sm);"></div>
      </div>
    </div>
  `.trim();
}



