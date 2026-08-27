/**
 * Hugging Face Model Service Layer - Milestone 1
 * Pure JavaScript, zero-dependency client with AbortController cancellation & error normalization.
 */

export const HF_API_BASE = 'https://huggingface.co/api';

/**
 * Known ML libraries on Hugging Face Hub
 */
const KNOWN_LIBRARIES = new Set([
  'transformers',
  'safetensors',
  'gguf',
  'diffusers',
  'timm',
  'pytorch',
  'onnx',
  'vllm',
  'nemo',
  'flair',
  'spacy',
  'fastai'
]);

/**
 * Base domain error class
 */
export class ModelServiceError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.name = 'ModelServiceError';
    this.status = status;
    this.details = details;
  }
}

/**
 * Thrown when Hugging Face returns HTTP 429
 */
export class RateLimitError extends ModelServiceError {
  constructor(message = 'Rate limit exceeded', status = 429, retryAfter = 60) {
    super(message, status);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * Thrown when a model or resource is not found (HTTP 404)
 */
export class NotFoundError extends ModelServiceError {
  constructor(message = 'Resource not found', status = 404) {
    super(message, status);
    this.name = 'NotFoundError';
  }
}

/**
 * Thrown when the user is offline or network fails
 */
export class NetworkError extends ModelServiceError {
  constructor(message = 'Network connection failed') {
    super(message, 0);
    this.name = 'NetworkError';
  }
}

/**
 * Builds standard query URL for model search and filtering
 */
export function buildSearchUrl({
  query = '',
  pipelineTag = '',
  library = '',
  sort = 'downloads',
  direction = '-1',
  limit = 20
} = {}) {
  const url = new URL(`${HF_API_BASE}/models`);

  url.searchParams.set('limit', String(limit));
  url.searchParams.set('full', 'true');
  url.searchParams.set('direction', String(direction));

  if (query && query.trim()) {
    url.searchParams.set('search', query.trim());
  }

  if (pipelineTag && pipelineTag.trim()) {
    url.searchParams.set('filter', pipelineTag.trim());
  }

  if (library && library.trim()) {
    url.searchParams.set('library', library.trim());
  }

  if (sort && sort.trim()) {
    url.searchParams.set('sort', sort.trim());
  }

  return url.toString();
}

/**
 * Normalizes raw HF model listing item to typed ModelSummary
 */
export function mapModelSummary(raw = {}) {
  const fullId = raw.id || '';
  let author = 'community';
  let name = fullId;

  if (fullId.includes('/')) {
    const parts = fullId.split('/');
    author = parts[0] || 'community';
    name = parts.slice(1).join('/');
  }

  const tags = Array.isArray(raw.tags) ? raw.tags : [];

  // Extract library name from raw field or tags
  let libraryName = raw.library_name || null;
  if (!libraryName) {
    for (const tag of tags) {
      if (KNOWN_LIBRARIES.has(tag)) {
        libraryName = tag;
        break;
      }
    }
  }

  return {
    id: fullId,
    author,
    name,
    pipeline_tag: raw.pipeline_tag || 'other',
    library_name: libraryName,
    likes: Number(raw.likes) || 0,
    downloads: Number(raw.downloads) || 0,
    tags,
    lastModified: raw.lastModified || null,
    private: Boolean(raw.private)
  };
}

/**
 * Normalizes rich HF model details to ModelDetails
 */
export function mapModelDetails(raw = {}) {
  const summary = mapModelSummary(raw);

  // Extract license from cardData or tags
  let license = raw.cardData?.license || null;
  if (!license && summary.tags) {
    const licenseTag = summary.tags.find(t => t.startsWith('license:'));
    if (licenseTag) {
      license = licenseTag.replace(/^license:/, '');
    }
  }

  const siblings = Array.isArray(raw.siblings)
    ? raw.siblings.map(s => ({
        rfilename: s.rfilename,
        size: typeof s.size === 'number' ? s.size : undefined
      }))
    : [];

  return {
    ...summary,
    description: raw.description || raw.cardData?.description || null,
    license: license || 'unknown',
    sha: raw.sha || '',
    createdAt: raw.createdAt || raw.lastModified || '',
    cardData: raw.cardData || null,
    safetensors: raw.safetensors || null,
    siblings,
    spaces: Array.isArray(raw.spaces) ? raw.spaces : []
  };
}

/**
 * Handles HTTP response status and normalizes errors
 */
async function handleResponse(response) {
  if (response.ok) {
    return response.json();
  }

  if (response.status === 429) {
    const retryHeader = response.headers?.get?.('retry-after');
    const retryAfter = retryHeader ? parseInt(retryHeader, 10) : 60;
    throw new RateLimitError('Hugging Face API rate limit reached. Please wait before retrying.', 429, retryAfter);
  }

  if (response.status === 404) {
    throw new NotFoundError('Model not found on Hugging Face Hub.', 404);
  }

  let serverDetails = '';
  try {
    const body = await response.json();
    if (body?.error) serverDetails = `: ${body.error}`;
    else if (body?.message) serverDetails = `: ${body.message}`;
  } catch {
    // Ignore JSON parsing errors for error bodies
  }

  const statusTextPart = response.statusText ? ` ${response.statusText}` : '';
  throw new ModelServiceError(`Hugging Face API error (${response.status}${statusTextPart})${serverDetails}`, response.status);
}

/**
 * Searches models on the Hugging Face Hub with cancellation support
 */
export async function searchModels(params = {}, { signal, fetchFn = globalThis.fetch } = {}) {
  const url = buildSearchUrl(params);

  try {
    const response = await fetchFn(url, {
      signal,
      headers: {
        'Accept': 'application/json'
      }
    });

    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(mapModelSummary) : [];
  } catch (err) {
    if (err.name === 'AbortError') {
      throw err;
    }
    if (err instanceof ModelServiceError) {
      throw err;
    }
    if (err instanceof TypeError || err.message?.includes('fetch')) {
      throw new NetworkError(`Network connection failed: ${err.message}`);
    }
    throw new ModelServiceError(err.message, 500);
  }
}

/**
 * Fetches deep model metadata for a specific model ID
 */
export async function getModelDetails(modelId, { signal, fetchFn = globalThis.fetch } = {}) {
  if (!modelId || !modelId.trim()) {
    throw new NotFoundError('Invalid model ID specified', 404);
  }

  const url = `${HF_API_BASE}/models/${modelId.trim()}`;

  try {
    const response = await fetchFn(url, {
      signal,
      headers: {
        'Accept': 'application/json'
      }
    });

    const data = await handleResponse(response);
    return mapModelDetails(data);
  } catch (err) {
    if (err.name === 'AbortError') {
      throw err;
    }
    if (err instanceof ModelServiceError) {
      throw err;
    }
    if (err instanceof TypeError || err.message?.includes('fetch')) {
      throw new NetworkError(`Network connection failed: ${err.message}`);
    }
    throw new ModelServiceError(err.message, 500);
  }
}
