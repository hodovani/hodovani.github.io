/**
 * Common Utilities for Hugging Face Model Explorer
 */

/**
 * Debounces execution of a function by delayMs milliseconds
 * Exposes a .cancel() method to abort pending timer execution.
 */
export function debounce(fn, delayMs = 350) {
  let timer = null;

  function debounced(...args) {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, delayMs);
  }

  debounced.cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  return debounced;
}

/**
 * Formats numeric metrics (downloads, likes) using compact notation (K, M)
 */
export function formatNumber(num) {
  const n = Number(num) || 0;

  if (n >= 1_000_000) {
    return (n / 1_000_000).toFixed(1) + 'M';
  }

  if (n >= 1_000) {
    return (n / 1_000).toFixed(1) + 'K';
  }

  return String(n);
}

/**
 * Generates ready-to-use Python transformers code snippet for a model
 */
export function generateUsageSnippet(modelId, pipelineTag = 'text-generation') {
  const safeId = String(modelId || '').trim();
  const safeTag = String(pipelineTag || 'text-generation').trim();

  if (safeTag === 'automatic-speech-recognition') {
    return [
      '# Transcribe audio using Hugging Face Transformers',
      'from transformers import pipeline',
      '',
      `transcriber = pipeline("automatic-speech-recognition", model="${safeId}")`,
      'result = transcriber("audio.mp3")',
      'print(result["text"])'
    ].join('\n');
  }

  if (safeTag === 'text-generation') {
    return [
      '# Generate text with Transformers pipeline',
      'from transformers import pipeline',
      '',
      `generator = pipeline("text-generation", model="${safeId}")`,
      'output = generator("Explain quantum mechanics simply:", max_length=128)',
      'print(output[0]["generated_text"])'
    ].join('\n');
  }

  return [
    `# Load ${safeId} with Transformers`,
    'from transformers import pipeline',
    '',
    `pipe = pipeline("${safeTag}", model="${safeId}")`,
    'output = pipe("Your input here")',
    'print(output)'
  ].join('\n');
}

/**
 * Formats parameter counts into human-readable notation (e.g. 8.0B parameters)
 */
export function formatParameters(total) {
  const num = Number(total);
  if (!num || isNaN(num) || num <= 0) return 'Not specified';

  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)}B parameters`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M parameters`;
  }
  return `${formatNumber(num)} parameters`;
}

/**
 * Sanitizes input strings to prevent Cross-Site Scripting (XSS)
 */
export function escapeHtml(str) {
  if (str == null) {
    return '';
  }

  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


