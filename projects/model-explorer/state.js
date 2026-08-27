/**
 * State Coordinator & URL Synchronization - Milestone 2
 * Manages the finite state machine, store subscriptions, and bidirectional URL routing.
 */

export const DEFAULT_FILTERS = {
  pipelineTag: '',
  library: '',
  sort: 'downloads'
};

export const VALID_STATUSES = new Set(['idle', 'loading', 'success', 'empty', 'error']);

/**
 * Valid state transitions table
 */
const TRANSITION_GRAPH = {
  idle: new Set(['loading']),
  loading: new Set(['loading', 'success', 'empty', 'error', 'idle']),
  success: new Set(['loading', 'idle']),
  empty: new Set(['loading', 'idle']),
  error: new Set(['loading', 'idle'])
};

/**
 * Thrown when an illegal state machine transition is attempted
 */
export class InvalidStateTransitionError extends Error {
  constructor(from, to) {
    super(`Invalid state transition: Cannot transition from '${from}' to '${to}'`);
    this.name = 'InvalidStateTransitionError';
    this.from = from;
    this.to = to;
  }
}

/**
 * Serializes state into a clean, minimal URL query string
 */
export function serializeStateToQuery(state = {}) {
  const params = new URLSearchParams();

  const query = state.query ? state.query.trim() : '';
  if (query) {
    params.set('q', query);
  }

  const filters = state.filters || {};
  if (filters.pipelineTag && filters.pipelineTag.trim()) {
    params.set('task', filters.pipelineTag.trim());
  }

  if (filters.library && filters.library.trim()) {
    params.set('lib', filters.library.trim());
  }

  // Omit default sort 'downloads' to keep URL concise
  if (filters.sort && filters.sort.trim() && filters.sort.trim() !== 'downloads') {
    params.set('sort', filters.sort.trim());
  }

  if (state.selectedModelId && state.selectedModelId.trim()) {
    params.set('model', state.selectedModelId.trim());
  }

  const queryStr = params.toString();
  return queryStr ? `?${queryStr}` : '';
}

/**
 * Parses URL search string into corresponding state slice
 */
export function parseQueryToState(searchString = '') {
  const cleanSearch = searchString.startsWith('?') ? searchString.slice(1) : searchString;
  const params = new URLSearchParams(cleanSearch);

  return {
    query: params.get('q') || '',
    filters: {
      pipelineTag: params.get('task') || '',
      library: params.get('lib') || '',
      sort: params.get('sort') || 'downloads'
    },
    selectedModelId: params.get('model') || null
  };
}

/**
 * Central State Coordinator & Store
 */
export class ModelExplorerStore {
  constructor(initialState = {}) {
    this._state = {
      status: 'idle',
      query: '',
      filters: { ...DEFAULT_FILTERS },
      results: [],
      selectedModelId: null,
      selectedModelDetails: null,
      errorMessage: null,
      ...initialState
    };

    this._listeners = new Set();
  }

  /**
   * Returns an immutable copy of the state
   */
  getState() {
    return {
      ...this._state,
      filters: { ...this._state.filters },
      results: [...this._state.results]
    };
  }

  /**
   * Subscribes a listener function to state changes
   * @returns {Function} Unsubscribe cleanup function
   */
  subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('Listener must be a function');
    }
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  _notify() {
    const snapshot = this.getState();
    for (const listener of this._listeners) {
      listener(snapshot);
    }
  }

  _transitionTo(nextStatus) {
    const current = this._state.status;
    const allowed = TRANSITION_GRAPH[current];

    if (!allowed || !allowed.has(nextStatus)) {
      throw new InvalidStateTransitionError(current, nextStatus);
    }

    this._state.status = nextStatus;
  }

  /**
   * Initiates a search lifecycle (sets status to loading)
   */
  startSearch({ query = this._state.query, filters = this._state.filters } = {}) {
    this._transitionTo('loading');
    this._state.query = query;
    this._state.filters = { ...this._state.filters, ...filters };
    this._state.errorMessage = null;
    this._notify();
  }

  /**
   * Resolves search results and transitions to success or empty
   */
  setResults(results = []) {
    if (!Array.isArray(results) || results.length === 0) {
      this._transitionTo('empty');
      this._state.results = [];
    } else {
      this._transitionTo('success');
      this._state.results = [...results];
    }
    this._state.errorMessage = null;
    this._notify();
  }

  /**
   * Sets error state and clears stale results (Trade-off 5)
   */
  setError(error) {
    this._transitionTo('error');
    this._state.errorMessage = typeof error === 'string' ? error : (error?.message || 'An error occurred');
    // Clear old results so failed requests do not leave stale state
    this._state.results = [];
    this._notify();
  }

  /**
   * Opens the deep inspection view for a model
   */
  openModel(modelId) {
    this._state.selectedModelId = modelId;
    this._state.selectedModelDetails = null;
    this._notify();
  }

  /**
   * Sets loaded details metadata for the active model
   */
  setModelDetails(details) {
    this._state.selectedModelDetails = details;
    this._notify();
  }

  /**
   * Closes the details view and returns to the results list
   */
  closeModel() {
    this._state.selectedModelId = null;
    this._state.selectedModelDetails = null;
    this._notify();
  }

  /**
   * Resets all search filters back to default
   */
  resetFilters() {
    this._state.filters = { ...DEFAULT_FILTERS };
    this._notify();
  }
}

/**
 * Synchronizes store state to browser History API (pushState)
 */
export function syncToURL(store, historyObj = globalThis.history, { replace = false } = {}) {
  if (!historyObj || typeof historyObj.pushState !== 'function') {
    return;
  }

  const state = store.getState();
  const queryString = serializeStateToQuery(state);
  const pathname = globalThis.location?.pathname || '';
  const hash = globalThis.location?.hash || '';
  const newUrl = `${pathname}${queryString}${hash}` || '?';

  if (replace) {
    historyObj.replaceState(null, '', newUrl);
  } else {
    historyObj.pushState(null, '', newUrl);
  }
}

/**
 * Rehydrates store state from a URL search string on initial load or popstate
 */
export function rehydrateFromURL(store, searchString = globalThis.location?.search || '') {
  const parsed = parseQueryToState(searchString);
  store._state.query = parsed.query;
  store._state.filters = { ...store._state.filters, ...parsed.filters };
  store._state.selectedModelId = parsed.selectedModelId;
  store._notify();
}
