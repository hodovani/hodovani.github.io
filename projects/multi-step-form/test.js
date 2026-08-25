/**
 * Comprehensive Unit Test Suite for AI Guardrail Policy Builder
 * Uses Node.js native test runner (node:test & node:assert) - Zero dependencies
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { DEFAULT_FORM_DATA, TARGET_ROUTES, ENVIRONMENTS, ENFORCEMENT_MODES, REDACTION_ENTITIES, STEP_DEFINITIONS } from './config.js';
import { validateField, validateStep, validateAll } from './validation.js';
import { saveFormDraft, loadSavedDraft, clearFormDraft } from './storage.js';
import { THEMES, getSavedTheme, saveThemePreference, applyTheme } from './theme.js';

// Global localStorage mock for Node environment
const storageMock = new Map();
globalThis.localStorage = {
  getItem: (key) => storageMock.get(key) || null,
  setItem: (key, val) => storageMock.set(key, String(val)),
  removeItem: (key) => storageMock.delete(key),
  clear: () => storageMock.clear()
};

describe('Config & Schema Definitions', () => {
  test('DEFAULT_FORM_DATA contains all required step fields', () => {
    assert.strictEqual(typeof DEFAULT_FORM_DATA.policyName, 'string');
    assert.strictEqual(DEFAULT_FORM_DATA.environment, 'production');
    assert.ok(Array.isArray(DEFAULT_FORM_DATA.targetRoutes));
    assert.ok(Array.isArray(DEFAULT_FORM_DATA.redactionEntities));
    assert.strictEqual(typeof DEFAULT_FORM_DATA.injectionSensitivity, 'number');
    assert.strictEqual(typeof DEFAULT_FORM_DATA.hallucinationThreshold, 'number');
    assert.strictEqual(typeof DEFAULT_FORM_DATA.fallbackMessage, 'string');
    assert.strictEqual(typeof DEFAULT_FORM_DATA.alertWebhookUrl, 'string');
    assert.strictEqual(typeof DEFAULT_FORM_DATA.securityEmail, 'string');
    assert.strictEqual(typeof DEFAULT_FORM_DATA.rateLimitSpike, 'number');
    assert.strictEqual(DEFAULT_FORM_DATA.complianceConfirmed, false);
  });

  test('Option lists (routes, environments, modes, redactions, themes) are populated', () => {
    assert.ok(TARGET_ROUTES.length >= 4);
    assert.ok(ENVIRONMENTS.length >= 3);
    assert.ok(ENFORCEMENT_MODES.length >= 3);
    assert.ok(REDACTION_ENTITIES.length >= 4);
    assert.ok(THEMES.length >= 4);
  });

  test('STEP_DEFINITIONS contains exactly 4 ordered steps', () => {
    assert.strictEqual(STEP_DEFINITIONS.length, 4);
    assert.deepStrictEqual(STEP_DEFINITIONS.map(s => s.step), [1, 2, 3, 4]);
  });
});

describe('Validation Engine: validateField()', () => {
  describe('Step 1: Scope & Routes', () => {
    test('policyName: requires minimum 3 and max 50 alphanumeric characters', () => {
      assert.match(validateField({ policyName: '' }, 'policyName'), /required/i);
      assert.match(validateField({ policyName: '   ' }, 'policyName'), /required/i);
      assert.match(validateField({ policyName: 'ab' }, 'policyName'), /at least 3 characters/i);
      assert.match(validateField({ policyName: 'a'.repeat(51) }, 'policyName'), /cannot exceed 50 characters/i);
      assert.match(validateField({ policyName: 'bad$name!' }, 'policyName'), /only letters, numbers/i);
      assert.strictEqual(validateField({ policyName: 'Prod-Claude_Guardrail 01' }, 'policyName'), '');
    });

    test('targetRoutes: requires at least one route selected', () => {
      assert.match(validateField({ targetRoutes: [] }, 'targetRoutes'), /select at least one/i);
      assert.match(validateField({ targetRoutes: null }, 'targetRoutes'), /select at least one/i);
      assert.strictEqual(validateField({ targetRoutes: ['claude-3-7'] }, 'targetRoutes'), '');
    });

    test('environment: requires a valid environment', () => {
      assert.match(validateField({ environment: '' }, 'environment'), /select an environment/i);
      assert.strictEqual(validateField({ environment: 'production' }, 'environment'), '');
    });

    test('enforcementMode: requires an enforcement mode', () => {
      assert.match(validateField({ enforcementMode: '' }, 'enforcementMode'), /select an enforcement mode/i);
      assert.strictEqual(validateField({ enforcementMode: 'block' }, 'enforcementMode'), '');
    });
  });

  describe('Step 2: Threat Detection & PII', () => {
    test('redactionEntities: requires at least one entity category', () => {
      assert.match(validateField({ redactionEntities: [] }, 'redactionEntities'), /select at least one/i);
      assert.strictEqual(validateField({ redactionEntities: ['api_keys'] }, 'redactionEntities'), '');
    });

    test('hallucinationThreshold: requires numeric integer between 50 and 99', () => {
      assert.match(validateField({ hallucinationThreshold: 49 }, 'hallucinationThreshold'), /between 50% and 99%/i);
      assert.match(validateField({ hallucinationThreshold: 100 }, 'hallucinationThreshold'), /between 50% and 99%/i);
      assert.match(validateField({ hallucinationThreshold: 'invalid' }, 'hallucinationThreshold'), /between 50% and 99%/i);
      assert.strictEqual(validateField({ hallucinationThreshold: 50 }, 'hallucinationThreshold'), '');
      assert.strictEqual(validateField({ hallucinationThreshold: 85 }, 'hallucinationThreshold'), '');
      assert.strictEqual(validateField({ hallucinationThreshold: 99 }, 'hallucinationThreshold'), '');
    });
  });

  describe('Step 3: Fallbacks & Incident Alerts', () => {
    test('fallbackMessage: requires at least 15 characters', () => {
      assert.match(validateField({ fallbackMessage: '' }, 'fallbackMessage'), /required/i);
      assert.match(validateField({ fallbackMessage: 'Too short' }, 'fallbackMessage'), /at least 15 characters/i);
      assert.strictEqual(validateField({ fallbackMessage: 'This request was blocked by security policy #01.' }, 'fallbackMessage'), '');
    });

    test('alertWebhookUrl: requires valid http/https URL', () => {
      assert.match(validateField({ alertWebhookUrl: '' }, 'alertWebhookUrl'), /required/i);
      assert.match(validateField({ alertWebhookUrl: 'not-a-url' }, 'alertWebhookUrl'), /enter a valid url/i);
      assert.match(validateField({ alertWebhookUrl: 'ftp://bad-scheme.com' }, 'alertWebhookUrl'), /must start with http/i);
      assert.strictEqual(validateField({ alertWebhookUrl: 'https://hooks.slack.com/services/T00/B00/test' }, 'alertWebhookUrl'), '');
    });

    test('securityEmail: requires valid email syntax', () => {
      assert.match(validateField({ securityEmail: '' }, 'securityEmail'), /required/i);
      assert.match(validateField({ securityEmail: 'bad-email' }, 'securityEmail'), /valid email address/i);
      assert.match(validateField({ securityEmail: 'sec@company' }, 'securityEmail'), /valid email address/i);
      assert.strictEqual(validateField({ securityEmail: 'secops@company.internal' }, 'securityEmail'), '');
    });

    test('rateLimitSpike: requires integer between 1 and 5000', () => {
      assert.match(validateField({ rateLimitSpike: 0 }, 'rateLimitSpike'), /between 1 and 5,000/i);
      assert.match(validateField({ rateLimitSpike: -5 }, 'rateLimitSpike'), /between 1 and 5,000/i);
      assert.match(validateField({ rateLimitSpike: 5001 }, 'rateLimitSpike'), /between 1 and 5,000/i);
      assert.match(validateField({ rateLimitSpike: 10.5 }, 'rateLimitSpike'), /integer/i);
      assert.strictEqual(validateField({ rateLimitSpike: 1 }, 'rateLimitSpike'), '');
      assert.strictEqual(validateField({ rateLimitSpike: 120 }, 'rateLimitSpike'), '');
      assert.strictEqual(validateField({ rateLimitSpike: 5000 }, 'rateLimitSpike'), '');
    });
  });

  describe('Step 4: Verification Confirmation', () => {
    test('complianceConfirmed: requires boolean true', () => {
      assert.match(validateField({ complianceConfirmed: false }, 'complianceConfirmed'), /must confirm/i);
      assert.strictEqual(validateField({ complianceConfirmed: true }, 'complianceConfirmed'), '');
    });
  });
});

describe('Step & Form Aggregation: validateStep() & validateAll()', () => {
  test('validateStep() reports valid for complete step and invalid for missing fields', () => {
    const invalidStep1 = validateStep({ ...DEFAULT_FORM_DATA, policyName: '' }, 1);
    assert.strictEqual(invalidStep1.isValid, false);
    assert.ok(invalidStep1.errors.policyName);

    const validStep1 = validateStep({ ...DEFAULT_FORM_DATA, policyName: 'Valid-Policy' }, 1);
    assert.strictEqual(validStep1.isValid, true);
    assert.strictEqual(Object.keys(validStep1.errors).length, 0);
  });

  test('validateAll() checks all 4 steps and passes when all fields are valid', () => {
    const validFullData = {
      ...DEFAULT_FORM_DATA,
      policyName: 'Production-Guardrail-Shield',
      complianceConfirmed: true
    };
    const result = validateAll(validFullData);
    assert.strictEqual(result.isValid, true);
    assert.strictEqual(Object.keys(result.errors).length, 0);
  });
});

describe('Storage & Draft Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('saveFormDraft() serializes and loadSavedDraft() restores state correctly', () => {
    const testData = { ...DEFAULT_FORM_DATA, policyName: 'Draft-Test-Policy' };
    saveFormDraft(testData, 3);

    const loaded = loadSavedDraft();
    assert.strictEqual(loaded.data.policyName, 'Draft-Test-Policy');
    assert.strictEqual(loaded.currentStep, 3);
  });

  test('clearFormDraft() wipes persisted draft from storage', () => {
    saveFormDraft({ ...DEFAULT_FORM_DATA, policyName: 'To-Be-Cleared' }, 2);
    clearFormDraft();

    const loaded = loadSavedDraft();
    assert.strictEqual(loaded.data.policyName, '');
    assert.strictEqual(loaded.currentStep, 1);
  });
});

describe('Theme Preferences Module', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('defaults to system theme when no preference is stored', () => {
    assert.strictEqual(getSavedTheme(), 'system');
  });

  test('saves and applies theme preference correctly', () => {
    saveThemePreference('dark');
    assert.strictEqual(getSavedTheme(), 'dark');

    // Mock DOM host element
    const mockEl = {
      attrs: new Map(),
      setAttribute(k, v) { this.attrs.set(k, v); },
      removeAttribute(k) { this.attrs.delete(k); }
    };

    applyTheme(mockEl, 'dark');
    assert.strictEqual(mockEl.attrs.get('data-theme'), 'dark');

    applyTheme(mockEl, 'system');
    assert.strictEqual(mockEl.attrs.has('data-theme'), false);
  });
});

describe('View Templates Module: templates.js', () => {
  test('escapeHtml() sanitizes malicious input strings', async () => {
    const { escapeHtml } = await import('./templates.js');
    assert.strictEqual(escapeHtml('<script>alert("xss")</script>'), '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    assert.strictEqual(escapeHtml("Tom & Jerry's"), 'Tom &amp; Jerry&#039;s');
    assert.strictEqual(escapeHtml(123), 123);
  });

  test('renderAppHeader() highlights the active theme button', async () => {
    const { renderAppHeader } = await import('./templates.js');
    const html = renderAppHeader('high-contrast');
    assert.ok(html.includes('data-theme="high-contrast"'));
    assert.ok(html.includes('theme-btn active'));
  });

  test('renderStepper() marks completed and current active step tabs', async () => {
    const { renderStepper } = await import('./templates.js');
    const html = renderStepper(3, 4);
    assert.ok(html.includes('✓')); // Steps 1 and 2 completed
    assert.ok(html.includes('data-step="3"'));
    assert.ok(html.includes('aria-current="step"'));
  });

  test('renderSuccessScreen() embeds policy ID and cURL code block', async () => {
    const { renderSuccessScreen } = await import('./templates.js');
    const html = renderSuccessScreen('gw_pol_test123');
    assert.ok(html.includes('gw_pol_test123'));
    assert.ok(html.includes('curl -X POST'));
    assert.ok(html.includes('btn-copy-id'));
  });
});
