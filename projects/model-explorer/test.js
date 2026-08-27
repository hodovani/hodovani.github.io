/**
 * Unit Test Suite for Hugging Face Model Explorer - Milestone 1
 * Uses Node.js native test runner (node:test & node:assert/strict) - Zero dependencies
 *
 * TDD Phase: Milestone 1 - Service Layer & Request Cancellation
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  buildSearchUrl,
  mapModelSummary,
  mapModelDetails,
  searchModels,
  getModelDetails,
  ModelServiceError,
  RateLimitError,
  NotFoundError,
  NetworkError
} from './model-service.js';

import {
  ModelExplorerStore,
  serializeStateToQuery,
  parseQueryToState,
  rehydrateFromURL,
  syncToURL,
  InvalidStateTransitionError
} from './state.js';

describe('Service Layer & Request Cancellation', () => {

  describe('1. Query String Serialization & URL Building', () => {
    test('buildSearchUrl: builds default search URL with standard pagination limit and full metadata', () => {
      const url = buildSearchUrl({});
      assert.ok(url.startsWith('https://huggingface.co/api/models'));
      const parsed = new URL(url);
      assert.strictEqual(parsed.searchParams.get('limit'), '20');
      assert.strictEqual(parsed.searchParams.get('full'), 'true');
      assert.strictEqual(parsed.searchParams.get('direction'), '-1');
    });

    test('buildSearchUrl: serializes keyword search query correctly', () => {
      const url = buildSearchUrl({ query: 'whisper large v3' });
      const parsed = new URL(url);
      assert.strictEqual(parsed.searchParams.get('search'), 'whisper large v3');
    });

    test('buildSearchUrl: adds pipelineTag and library filters', () => {
      const url = buildSearchUrl({
        query: 'llama',
        pipelineTag: 'text-generation',
        library: 'transformers',
        sort: 'downloads'
      });
      const parsed = new URL(url);
      assert.strictEqual(parsed.searchParams.get('search'), 'llama');
      assert.strictEqual(parsed.searchParams.get('filter'), 'text-generation');
      assert.strictEqual(parsed.searchParams.get('sort'), 'downloads');
      assert.strictEqual(parsed.searchParams.get('library'), 'transformers');
    });

    test('buildSearchUrl: omits empty, whitespace-only, or undefined parameters', () => {
      const url = buildSearchUrl({ query: '   ', pipelineTag: '', library: undefined });
      const parsed = new URL(url);
      assert.strictEqual(parsed.searchParams.has('search'), false);
      assert.strictEqual(parsed.searchParams.has('filter'), false);
      assert.strictEqual(parsed.searchParams.has('library'), false);
    });
  });

  describe('2. Data Transformation & Normalization', () => {
    test('mapModelSummary: cleanly normalizes raw HF model payload', () => {
      const raw = {
        _id: '123',
        id: 'openai/whisper-large-v3',
        likes: 4500,
        downloads: 1200000,
        pipeline_tag: 'automatic-speech-recognition',
        tags: ['transformers', 'audio', 'license:apache-2.0'],
        lastModified: '2024-05-01T12:00:00.000Z',
        private: false
      };

      const summary = mapModelSummary(raw);
      assert.strictEqual(summary.id, 'openai/whisper-large-v3');
      assert.strictEqual(summary.author, 'openai');
      assert.strictEqual(summary.name, 'whisper-large-v3');
      assert.strictEqual(summary.likes, 4500);
      assert.strictEqual(summary.downloads, 1200000);
      assert.strictEqual(summary.pipeline_tag, 'automatic-speech-recognition');
      assert.deepStrictEqual(summary.tags, ['transformers', 'audio', 'license:apache-2.0']);
      assert.strictEqual(summary.library_name, 'transformers');
      assert.strictEqual(summary.lastModified, '2024-05-01T12:00:00.000Z');
      assert.strictEqual(summary.private, false);
    });

    test('mapModelSummary: handles root models without an author prefix gracefully', () => {
      const raw = { id: 'gpt2', likes: 100, downloads: 5000 };
      const summary = mapModelSummary(raw);
      assert.strictEqual(summary.id, 'gpt2');
      assert.strictEqual(summary.author, 'community');
      assert.strictEqual(summary.name, 'gpt2');
      assert.strictEqual(summary.pipeline_tag, 'other');
      assert.strictEqual(summary.likes, 100);
      assert.strictEqual(summary.downloads, 5000);
    });

    test('mapModelDetails: normalizes rich inspection payload with safetensors and files', () => {
      const raw = {
        id: 'meta-llama/Llama-3.1-8B-Instruct',
        likes: 8200,
        downloads: 3500000,
        pipeline_tag: 'text-generation',
        tags: ['safetensors', 'license:llama3.1', 'arxiv:2407.21783'],
        sha: 'abc12345def',
        createdAt: '2024-07-23T00:00:00.000Z',
        cardData: {
          license: 'llama3.1',
          language: ['en', 'de', 'es'],
          datasets: ['custom-instruct']
        },
        safetensors: {
          total: 8030261248,
          parameters: { F16: 8030261248 }
        },
        siblings: [
          { rfilename: 'config.json', size: 1024 },
          { rfilename: 'model.safetensors', size: 16000000000 }
        ],
        spaces: ['meta-llama/llama-chat-demo']
      };

      const details = mapModelDetails(raw);
      assert.strictEqual(details.id, 'meta-llama/Llama-3.1-8B-Instruct');
      assert.strictEqual(details.license, 'llama3.1');
      assert.strictEqual(details.sha, 'abc12345def');
      assert.strictEqual(details.safetensors?.total, 8030261248);
      assert.strictEqual(details.siblings.length, 2);
      assert.strictEqual(details.siblings[0].rfilename, 'config.json');
      assert.deepStrictEqual(details.spaces, ['meta-llama/llama-chat-demo']);
      assert.deepStrictEqual(details.cardData?.language, ['en', 'de', 'es']);
    });
  });

  describe('3. Request Execution & AbortController Cancellation', () => {
    test('searchModels: executes fetch with signal and returns mapped models', async () => {
      const mockPayload = [
        { id: 'meta-llama/Llama-3.1-8B', likes: 500, downloads: 10000, pipeline_tag: 'text-generation', tags: [] }
      ];

      const mockFetch = async (url, options) => {
        assert.ok(url.includes('https://huggingface.co/api/models'));
        assert.ok(options?.signal);
        return {
          ok: true,
          status: 200,
          json: async () => mockPayload
        };
      };

      const controller = new AbortController();
      const results = await searchModels({ query: 'llama' }, { signal: controller.signal, fetchFn: mockFetch });
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].id, 'meta-llama/Llama-3.1-8B');
    });

    test('searchModels: aborting controller rejects immediately with an AbortError', async () => {
      const controller = new AbortController();

      const mockFetch = async (_url, options) => {
        return new Promise((_, reject) => {
          options?.signal?.addEventListener('abort', () => {
            const err = new Error('The operation was aborted');
            err.name = 'AbortError';
            reject(err);
          });
        });
      };

      const promise = searchModels({ query: 'llama' }, { signal: controller.signal, fetchFn: mockFetch });
      controller.abort();

      await assert.rejects(promise, (err) => {
        return err.name === 'AbortError';
      });
    });
  });

  describe('4. Error Handling & HTTP Status Normalization', () => {
    test('searchModels: normalizes HTTP 429 into a typed RateLimitError with retry info', async () => {
      const mockFetch = async () => ({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        headers: new Headers({ 'retry-after': '30' }),
        json: async () => ({ message: 'Rate limit exceeded' })
      });

      await assert.rejects(
        searchModels({ query: 'whisper' }, { fetchFn: mockFetch }),
        (err) => {
          assert.ok(err instanceof RateLimitError);
          assert.strictEqual(err.status, 429);
          assert.strictEqual(err.retryAfter, 30);
          assert.match(err.message, /rate limit/i);
          return true;
        }
      );
    });

    test('getModelDetails: normalizes HTTP 404 into a typed NotFoundError', async () => {
      const mockFetch = async () => ({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ error: 'Model not found' })
      });

      await assert.rejects(
        getModelDetails('non-existent/fake-model', { fetchFn: mockFetch }),
        (err) => {
          assert.ok(err instanceof NotFoundError);
          assert.strictEqual(err.status, 404);
          assert.match(err.message, /not found/i);
          return true;
        }
      );
    });

    test('searchModels: normalizes HTTP 500 into a typed ModelServiceError', async () => {
      const mockFetch = async () => ({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ error: 'Hugging Face API unavailable' })
      });

      await assert.rejects(
        searchModels({ query: 'test' }, { fetchFn: mockFetch }),
        (err) => {
          assert.ok(err instanceof ModelServiceError);
          assert.strictEqual(err.status, 500);
          assert.match(err.message, /Internal Server Error/i);
          return true;
        }
      );
    });

    test('searchModels: normalizes network failure / offline into NetworkError', async () => {
      const mockFetch = async () => {
        throw new TypeError('Failed to fetch');
      };

      await assert.rejects(
        searchModels({ query: 'test' }, { fetchFn: mockFetch }),
        (err) => {
          assert.ok(err instanceof NetworkError);
          assert.match(err.message, /network|fetch/i);
          return true;
        }
      );
    });
  });

});

describe('State Coordinator & URL Synchronization', () => {

  describe('1. State Machine & Transitions', () => {
    test('initial state: starts at idle with default filters and empty results', () => {
      const store = new ModelExplorerStore();
      const state = store.getState();

      assert.strictEqual(state.status, 'idle');
      assert.strictEqual(state.query, '');
      assert.deepStrictEqual(state.filters, {
        pipelineTag: '',
        library: '',
        sort: 'downloads'
      });
      assert.deepStrictEqual(state.results, []);
      assert.strictEqual(state.selectedModelId, null);
      assert.strictEqual(state.selectedModelDetails, null);
      assert.strictEqual(state.errorMessage, null);
    });

    test('startSearch: transitions from idle/success/error to loading', () => {
      const store = new ModelExplorerStore();
      store.startSearch({ query: 'whisper', filters: { pipelineTag: 'audio' } });

      const state = store.getState();
      assert.strictEqual(state.status, 'loading');
      assert.strictEqual(state.query, 'whisper');
      assert.strictEqual(state.filters.pipelineTag, 'audio');
      assert.strictEqual(state.errorMessage, null);
    });

    test('setResults: transitions loading to success when models exist', () => {
      const store = new ModelExplorerStore();
      store.startSearch({ query: 'whisper' });

      const mockModels = [{ id: 'openai/whisper-large', likes: 100 }];
      store.setResults(mockModels);

      const state = store.getState();
      assert.strictEqual(state.status, 'success');
      assert.deepStrictEqual(state.results, mockModels);
    });

    test('setResults: transitions loading to empty when results array is empty', () => {
      const store = new ModelExplorerStore();
      store.startSearch({ query: 'non-existent-query-xyz' });

      store.setResults([]);

      const state = store.getState();
      assert.strictEqual(state.status, 'empty');
      assert.deepStrictEqual(state.results, []);
    });

    test('setError: transitions to error and clears stale results (Trade-off 5)', () => {
      const store = new ModelExplorerStore();
      // First populate some results
      store.startSearch({ query: 'initial' });
      store.setResults([{ id: 'old/model' }]);

      // Now new search fails
      store.startSearch({ query: 'failing-query' });
      store.setError('API rate limit reached');

      const state = store.getState();
      assert.strictEqual(state.status, 'error');
      assert.strictEqual(state.errorMessage, 'API rate limit reached');
      // Critical requirement: failed requests MUST NOT leave old results
      assert.deepStrictEqual(state.results, []);
    });

    test('illegal transitions: throwing InvalidStateTransitionError on prohibited transitions', () => {
      const store = new ModelExplorerStore(); // in 'idle'
      // Cannot setResults directly from idle without going through loading
      assert.throws(
        () => store.setResults([{ id: 'test' }]),
        (err) => err instanceof InvalidStateTransitionError
      );
    });
  });

  describe('2. Details View State Management', () => {
    test('openModel and closeModel: manages active selection and details', () => {
      const store = new ModelExplorerStore();
      store.openModel('openai/whisper-large-v3');

      assert.strictEqual(store.getState().selectedModelId, 'openai/whisper-large-v3');
      assert.strictEqual(store.getState().selectedModelDetails, null);

      const mockDetails = { id: 'openai/whisper-large-v3', license: 'apache-2.0' };
      store.setModelDetails(mockDetails);
      assert.deepStrictEqual(store.getState().selectedModelDetails, mockDetails);

      store.closeModel();
      assert.strictEqual(store.getState().selectedModelId, null);
      assert.strictEqual(store.getState().selectedModelDetails, null);
    });
  });

  describe('3. URL Serialization & Parsing (Two-Way Sync)', () => {
    test('serializeStateToQuery: serializes state into clean URL query string', () => {
      const query = serializeStateToQuery({
        query: 'llama',
        filters: { pipelineTag: 'text-generation', library: 'transformers', sort: 'likes7d' },
        selectedModelId: 'meta-llama/Llama-3'
      });

      assert.ok(query.startsWith('?'));
      const params = new URLSearchParams(query);
      assert.strictEqual(params.get('q'), 'llama');
      assert.strictEqual(params.get('task'), 'text-generation');
      assert.strictEqual(params.get('lib'), 'transformers');
      assert.strictEqual(params.get('sort'), 'likes7d');
      assert.strictEqual(params.get('model'), 'meta-llama/Llama-3');
    });

    test('serializeStateToQuery: omits default sort and empty fields to keep URL clean', () => {
      const query = serializeStateToQuery({
        query: '',
        filters: { pipelineTag: '', library: '', sort: 'downloads' },
        selectedModelId: null
      });

      assert.strictEqual(query, '');
    });

    test('parseQueryToState: parses URL query string back into state fields', () => {
      const parsed = parseQueryToState('?q=stable-diffusion&task=image-to-image&lib=diffusers&sort=likes7d&model=stabilityai%2Fsdxl');

      assert.strictEqual(parsed.query, 'stable-diffusion');
      assert.strictEqual(parsed.filters.pipelineTag, 'image-to-image');
      assert.strictEqual(parsed.filters.library, 'diffusers');
      assert.strictEqual(parsed.filters.sort, 'likes7d');
      assert.strictEqual(parsed.selectedModelId, 'stabilityai/sdxl');
    });

    test('roundtrip: serialize and parse are fully symmetric', () => {
      const original = {
        query: 'whisper',
        filters: { pipelineTag: 'automatic-speech-recognition', library: 'transformers', sort: 'likes7d' },
        selectedModelId: 'openai/whisper-tiny'
      };

      const serialized = serializeStateToQuery(original);
      const reconstructed = parseQueryToState(serialized);

      assert.strictEqual(reconstructed.query, original.query);
      assert.deepStrictEqual(reconstructed.filters, original.filters);
      assert.strictEqual(reconstructed.selectedModelId, original.selectedModelId);
    });
  });

  describe('4. Store Subscriptions & Two-Way Sync Bindings', () => {
    test('subscribe: notifies listeners on state changes and allows unsubscribe', () => {
      const store = new ModelExplorerStore();
      let callCount = 0;
      let lastState = null;

      const unsubscribe = store.subscribe((state) => {
        callCount++;
        lastState = state;
      });

      store.startSearch({ query: 'flux' });
      assert.strictEqual(callCount, 1);
      assert.strictEqual(lastState.query, 'flux');

      unsubscribe();
      store.setResults([]);
      assert.strictEqual(callCount, 1); // No new notification after unsubscribe
    });

    test('rehydrateFromURL: initializes store from URL query string on load or popstate', () => {
      const store = new ModelExplorerStore();
      rehydrateFromURL(store, '?q=bert&task=fill-mask&sort=downloads');

      const state = store.getState();
      assert.strictEqual(state.query, 'bert');
      assert.strictEqual(state.filters.pipelineTag, 'fill-mask');
      assert.strictEqual(state.filters.sort, 'downloads');
    });

    test('syncToURL: pushes state changes to history API without reload', () => {
      let pushedUrl = '';
      const historyMock = {
        pushState: (_state, _title, url) => {
          pushedUrl = url;
        },
        replaceState: () => { }
      };

      const store = new ModelExplorerStore();
      store.startSearch({ query: 'gemma', filters: { pipelineTag: 'text-generation' } });
      syncToURL(store, historyMock);

      assert.ok(pushedUrl.includes('q=gemma'));
      assert.ok(pushedUrl.includes('task=text-generation'));
    });
  });

});

describe('Milestone 3: Debounced Search Controls & Structured Skeletons', () => {

  describe('1. Debounce & Formatting Utilities', () => {
    test('debounce: coalesces rapid invocations into single call after delay', async () => {
      const { debounce } = await import('./utils.js');
      let calls = [];
      const debounced = debounce((val) => calls.push(val), 50);

      debounced('w');
      debounced('wh');
      debounced('whi');
      debounced('whis');
      debounced('whisper');

      assert.strictEqual(calls.length, 0);

      await new Promise((r) => setTimeout(r, 80));

      assert.strictEqual(calls.length, 1);
      assert.strictEqual(calls[0], 'whisper');
    });

    test('debounce.cancel: prevents pending execution', async () => {
      const { debounce } = await import('./utils.js');
      let executed = false;
      const debounced = debounce(() => { executed = true; }, 50);

      debounced();
      debounced.cancel();

      await new Promise((r) => setTimeout(r, 70));
      assert.strictEqual(executed, false);
    });

    test('formatNumber: formats counts with compact K/M notation', async () => {
      const { formatNumber } = await import('./utils.js');
      assert.strictEqual(formatNumber(1250000), '1.3M');
      assert.strictEqual(formatNumber(45600), '45.6K');
      assert.strictEqual(formatNumber(340), '340');
      assert.strictEqual(formatNumber(0), '0');
    });

    test('escapeHtml: sanitizes malicious HTML to prevent XSS injection', async () => {
      const { escapeHtml } = await import('./utils.js');
      assert.strictEqual(escapeHtml('<script>alert("xss")</script>'), '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
      assert.strictEqual(escapeHtml("Model's & \"Weights\""), 'Model&#039;s &amp; &quot;Weights&quot;');
    });
  });

  describe('2. Skeleton Loaders & CLS Prevention', () => {
    test('renderSkeletonGrid: generates exactly 6 structured cards with a11y attributes', async () => {
      const { renderSkeletonGrid } = await import('./templates.js');
      const html = renderSkeletonGrid(6);

      assert.ok(html.includes('aria-busy="true"'));
      assert.ok(html.includes('aria-label="Loading models"'));

      // Count occurrences of skeleton-card
      const cardMatches = html.match(/class="skeleton-card"/g) || [];
      assert.strictEqual(cardMatches.length, 6);

      // Verify all skeleton cards are marked aria-hidden="true" to avoid screen-reader chatter
      const hiddenMatches = html.match(/aria-hidden="true"/g) || [];
      assert.ok(hiddenMatches.length >= 6);

      // Verify structural placeholders exist inside each card (title, badges, meta)
      assert.ok(html.includes('skeleton-title'));
      assert.ok(html.includes('skeleton-badges'));
      assert.ok(html.includes('skeleton-meta'));
    });
  });

  describe('3. Search & Filter Bar Controls', () => {
    test('renderSearchBar: renders input with query, search role, and clear button', async () => {
      const { renderSearchBar } = await import('./templates.js');
      const html = renderSearchBar({ query: 'deepseek', status: 'idle' });

      assert.ok(html.includes('role="search"'));
      assert.ok(html.includes('value="deepseek"'));
      assert.ok(html.includes('id="search-input"'));
      assert.ok(html.includes('aria-label="Search open-source AI models"'));
    });

    test('renderFilterBar: marks active filter pill with aria-pressed="true"', async () => {
      const { renderFilterBar } = await import('./templates.js');
      const html = renderFilterBar({
        filters: { pipelineTag: 'text-generation', library: 'transformers', sort: 'likes7d' }
      });

      // Active task pill
      assert.ok(html.includes('data-task="text-generation" aria-pressed="true"'));
      // Inactive task pill
      assert.ok(html.includes('data-task="automatic-speech-recognition" aria-pressed="false"'));
      // Active library pill
      assert.ok(html.includes('data-lib="transformers" aria-pressed="true"'));
      // Selected sort option
      assert.ok(html.includes('value="likes7d" selected'));
    });
  });

  describe('4. Model Card & Results Region Accessibility', () => {
    test('renderModelCard: generates accessible interactive card', async () => {
      const { renderModelCard } = await import('./templates.js');
      const mockModel = {
        id: 'meta-llama/Llama-3.1-8B-Instruct',
        author: 'meta-llama',
        name: 'Llama-3.1-8B-Instruct',
        pipeline_tag: 'text-generation',
        library_name: 'transformers',
        likes: 5400,
        downloads: 1200000,
        tags: ['safetensors', 'llama'],
        lastModified: '2024-07-23T00:00:00.000Z'
      };

      const html = renderModelCard(mockModel);
      assert.ok(html.includes('role="button"'));
      assert.ok(html.includes('tabindex="0"'));
      assert.ok(html.includes('data-model-id="meta-llama/Llama-3.1-8B-Instruct"'));
      assert.ok(html.includes('Llama-3.1-8B-Instruct'));
      assert.ok(html.includes('meta-llama'));
      assert.ok(html.includes('1.2M')); // Formatted downloads
      assert.ok(html.includes('text-generation'));
      assert.ok(html.includes('transformers'));
    });

    test('renderResultsGrid: contains aria-live="polite" region with announced count', async () => {
      const { renderResultsGrid } = await import('./templates.js');
      const mockModels = [
        { id: 'openai/whisper-tiny', author: 'openai', name: 'whisper-tiny', pipeline_tag: 'audio', downloads: 100, likes: 10, tags: [] }
      ];

      const html = renderResultsGrid(mockModels, { query: 'whisper' });
      assert.ok(html.includes('aria-live="polite"'));
      assert.ok(html.includes('Found 1 model for "whisper"'));
      assert.ok(html.includes('data-model-id="openai/whisper-tiny"'));
    });
  });

});

describe('Milestone 4: Edge States & Recovery (Empty & Error UI)', () => {

  describe('1. Empty State UI', () => {
    test('renderEmptyState: renders accessible status container with clear filters action', async () => {
      const { renderEmptyState } = await import('./templates.js');
      const html = renderEmptyState({ query: 'non-existent-model-xyz', filters: { pipelineTag: 'audio' } });

      assert.ok(html.includes('role="status"'));
      assert.ok(html.includes('non-existent-model-xyz'));
      assert.ok(html.includes('btn-clear-filters'));
      assert.ok(html.includes('No models found'));
    });

    test('renderEmptyState: sanitizes query string to prevent XSS injection', async () => {
      const { renderEmptyState } = await import('./templates.js');
      const html = renderEmptyState({ query: '<img src=x onerror=alert(1)>' });

      assert.ok(!html.includes('<img src=x onerror=alert(1)>'));
      assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
    });
  });

  describe('2. Error State & Retry Mechanism', () => {
    test('renderErrorState: renders accessible alert with retry button', async () => {
      const { renderErrorState } = await import('./templates.js');
      const html = renderErrorState({
        errorMessage: 'Network connection failed: Failed to fetch',
        canRetry: true
      });

      assert.ok(html.includes('role="alert"'));
      assert.ok(html.includes('aria-live="assertive"'));
      assert.ok(html.includes('Network connection failed'));
      assert.ok(html.includes('btn-retry'));
      assert.ok(html.includes('Retry Search'));
    });

    test('renderErrorState: includes rate-limit specific guidance when retryAfter is present', async () => {
      const { renderErrorState } = await import('./templates.js');
      const html = renderErrorState({
        errorMessage: 'Hugging Face API rate limit reached',
        retryAfter: 30,
        canRetry: true
      });

      assert.ok(html.includes('rate limit'));
      assert.ok(html.includes('30 seconds'));
      assert.ok(html.includes('btn-retry'));
    });
  });

  describe('3. State Isolation & Clean Boundaries (Trade-off 5)', () => {
    test('renderMainContent: renders only skeletons during loading', async () => {
      const { renderMainContent } = await import('./templates.js');
      const html = renderMainContent({ status: 'loading', query: 'whisper', results: [] });

      assert.ok(html.includes('skeleton-grid'));
      assert.ok(!html.includes('btn-retry'));
      assert.ok(!html.includes('btn-clear-filters'));
    });

    test('renderMainContent: renders only error state on failure without stale cards or skeletons', async () => {
      const { renderMainContent } = await import('./templates.js');
      // Even if results array had items, status === 'error' MUST NOT show cards
      const html = renderMainContent({
        status: 'error',
        errorMessage: 'Hugging Face API unavailable',
        results: [{ id: 'stale/model' }]
      });

      assert.ok(html.includes('role="alert"'));
      assert.ok(html.includes('btn-retry'));
      assert.ok(!html.includes('stale/model'));
      assert.ok(!html.includes('skeleton-grid'));
    });

    test('renderMainContent: renders empty state on empty status without cards or error banners', async () => {
      const { renderMainContent } = await import('./templates.js');
      const html = renderMainContent({ status: 'empty', query: 'xyz', results: [] });

      assert.ok(html.includes('role="status"'));
      assert.ok(html.includes('btn-clear-filters'));
      assert.ok(!html.includes('btn-retry'));
      assert.ok(!html.includes('skeleton-grid'));
    });

    test('renderMainContent: renders results grid on success status', async () => {
      const { renderMainContent } = await import('./templates.js');
      const html = renderMainContent({
        status: 'success',
        query: 'whisper',
        results: [{ id: 'openai/whisper-large-v3', author: 'openai', name: 'whisper-large-v3', pipeline_tag: 'audio', downloads: 100, likes: 50, tags: [] }]
      });

      assert.ok(html.includes('results-container'));
      assert.ok(html.includes('data-model-id="openai/whisper-large-v3"'));
      assert.ok(!html.includes('btn-retry'));
      assert.ok(!html.includes('skeleton-grid'));
    });
  });

});

describe('Milestone 5: Details View & A11y Focus Management', () => {

  describe('1. Details View Template & Telemetry', () => {
    test('renderModelDetails: renders heading with tabindex="-1" and accessible back button', async () => {
      const { renderModelDetails } = await import('./templates.js');
      const mockDetails = {
        id: 'meta-llama/Llama-3.1-8B-Instruct',
        author: 'meta-llama',
        name: 'Llama-3.1-8B-Instruct',
        pipeline_tag: 'text-generation',
        library_name: 'transformers',
        license: 'llama3.1',
        likes: 5200,
        downloads: 3400000,
        safetensors: { total: 8030261248 },
        siblings: [{ rfilename: 'config.json', size: 1024 }],
        spaces: ['meta-llama/llama-chat']
      };

      const html = renderModelDetails(mockDetails);

      // A11y: Primary heading must have tabindex="-1" to accept programmatic focus
      assert.ok(html.includes('id="details-heading"'));
      assert.ok(html.includes('tabindex="-1"'));
      assert.ok(html.includes('Llama-3.1-8B-Instruct'));

      // Clear navigation back button
      assert.ok(html.includes('id="btn-back-to-results"'));
      assert.ok(html.includes('Back to results'));

      // Telemetry readouts
      assert.ok(html.includes('3.4M')); // Formatted downloads
      assert.ok(html.includes('8.0B parameters') || html.includes('8.0B')); // Parameter size
      assert.ok(html.includes('llama3.1')); // License

      // Python code snippet
      assert.ok(html.includes('from transformers import pipeline'));
      assert.ok(html.includes('meta-llama/Llama-3.1-8B-Instruct'));

      // Connected Spaces
      assert.ok(html.includes('meta-llama/llama-chat'));
    });

    test('renderModelDetails: sanitizes content to prevent injection', async () => {
      const { renderModelDetails } = await import('./templates.js');
      const mockDetails = {
        id: 'malicious/model',
        author: '<script>alert(1)</script>',
        name: 'SafeModel',
        pipeline_tag: 'text-generation',
        license: 'MIT" onmouseover="alert(1)'
      };

      const html = renderModelDetails(mockDetails);
      assert.ok(!html.includes('<script>alert(1)</script>'));
      assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
      assert.ok(!html.includes('MIT" onmouseover'));
    });
    test('renderDetailsSkeleton: generates structured zero-CLS placeholder', async () => {
      const { renderDetailsSkeleton } = await import('./templates.js');
      const html = renderDetailsSkeleton();

      assert.ok(html.includes('details-skeleton'));
      assert.ok(html.includes('aria-busy="true"'));
      assert.ok(html.includes('btn-back-to-results'));
      assert.ok(html.includes('skeleton-telemetry'));
    });
  });

  describe('2. Code Snippet Generator', () => {
    test('generateUsageSnippet: creates valid Python snippet based on pipeline tag', async () => {
      const { generateUsageSnippet } = await import('./utils.js');

      const speechSnippet = generateUsageSnippet('openai/whisper-large-v3', 'automatic-speech-recognition');
      assert.ok(speechSnippet.includes('automatic-speech-recognition'));
      assert.ok(speechSnippet.includes('openai/whisper-large-v3'));

      const textSnippet = generateUsageSnippet('meta-llama/Llama-3.1-8B', 'text-generation');
      assert.ok(textSnippet.includes('text-generation'));
      assert.ok(textSnippet.includes('meta-llama/Llama-3.1-8B'));
    });
  });

  describe('3. Focus Management Coordinator (Trade-off 4)', () => {
    test('focus coordinator: stores trigger element and restores focus on return with preventScroll', async () => {
      const { FocusCoordinator } = await import('./focus-manager.js');

      let focusedElement = null;
      let focusOptions = null;
      let scrolledTo = null;

      // Mock window global
      globalThis.window = {
        scrollY: 450,
        scrollTo: (opts) => { scrolledTo = opts; }
      };

      const mockCardButton = {
        id: 'card-btn-1',
        focus: (opts) => {
          focusedElement = 'card-btn-1';
          focusOptions = opts;
        }
      };

      const mockHeading = {
        id: 'details-heading',
        focus: (opts) => {
          focusedElement = 'details-heading';
          focusOptions = opts;
        }
      };

      const mockContainer = {
        querySelector: (sel) => {
          if (sel === '#details-heading') return mockHeading;
          return null;
        }
      };

      const coordinator = new FocusCoordinator();

      // Step 1: User clicks card at scroll offset 450 -> record trigger element and scrollY
      coordinator.recordTrigger(mockCardButton);

      // Step 2: Details view mounts -> programmatic focus with preventScroll: true
      coordinator.focusDetailsHeading(mockContainer);
      assert.strictEqual(focusedElement, 'details-heading');
      assert.deepStrictEqual(focusOptions, { preventScroll: true });

      // Step 3: User clicks "Back to results" -> restore exact scroll position and focus
      coordinator.restoreTriggerFocus();
      assert.strictEqual(focusedElement, 'card-btn-1');
      assert.deepStrictEqual(focusOptions, { preventScroll: true });
      assert.deepStrictEqual(scrolledTo, { top: 450, behavior: 'instant' });
    });
  });

});





