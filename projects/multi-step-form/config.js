/**
 * Configuration & default schemas for AI Guardrail Policy Builder
 */

export const STORAGE_KEY = 'ai_guardrail_policy_form_draft_v1';

export const DEFAULT_FORM_DATA = {
  // Step 1: Scope & Routes
  policyName: '',
  environment: 'production',
  targetRoutes: ['claude-3-7', 'gpt-4o'],
  enforcementMode: 'block',

  // Step 2: Threat Detection & PII
  redactionEntities: ['api_keys', 'pii'],
  injectionSensitivity: 0.7,
  hallucinationThreshold: 85,
  bannedKeywords: 'internal_secret, confidential_project_x',

  // Step 3: Fallbacks & Alerts
  fallbackMessage: 'This request was blocked by enterprise AI security policy #SEC-AI-01.',
  alertWebhookUrl: 'https://hooks.slack.com/services/T00/B00/guardrail-alerts',
  securityEmail: 'ai-security@company.internal',
  rateLimitSpike: 120,

  // Step 4 Confirmation˚˚˚
  complianceConfirmed: false
};

export const TARGET_ROUTES = [
  { id: 'route-claude', value: 'claude-3-7', name: 'Anthropic Claude 3.7 (/v1/messages)' },
  { id: 'route-gpt4', value: 'gpt-4o', name: 'OpenAI GPT-4o (/v1/chat/completions)' },
  { id: 'route-gemini', value: 'gemini-2-flash', name: 'Google Gemini 2.0 (/v1beta/models)' },
  { id: 'route-llama', value: 'llama-3-3', name: 'Meta Llama 3.3 (/v1/completions)' }
];

export const ENVIRONMENTS = [
  { id: 'env-prod', value: 'production', label: 'Production' },
  { id: 'env-staging', value: 'staging', label: 'Staging' },
  { id: 'env-dev', value: 'development', label: 'Development' }
];

export const ENFORCEMENT_MODES = [
  { id: 'mode-block', value: 'block', title: 'Block & Terminate (Drop request on violation)' },
  { id: 'mode-sanitize', value: 'sanitize', title: 'Sanitize & Anonymize (Mask tokens in-flight)' },
  { id: 'mode-monitor', value: 'monitor', title: 'Monitor & Flag Only (Audit logs only)' }
];

export const REDACTION_ENTITIES = [
  { id: 'redact-keys', value: 'api_keys', title: 'API Keys & Secrets' },
  { id: 'redact-pii', value: 'pii', title: 'PII (SSN, names, addresses)' },
  { id: 'redact-finance', value: 'financial', title: 'Financial (Credit cards, IBANs)' },
  { id: 'redact-hipaa', value: 'hipaa', title: 'Health Records (HIPAA)' }
];

export const STEP_DEFINITIONS = [
  { step: 1, title: 'Scope & Target Routes' },
  { step: 2, title: 'Threat Detection & PII' },
  { step: 3, title: 'Fallbacks & Alerts' },
  { step: 4, title: 'Review & Confirm' }
];
