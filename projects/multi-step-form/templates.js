/**
 * HTML Templates and View Rendering for AI Guardrail Policy Builder (<ai-guardrail-form>)
 * Pure declarative functions generating accessible UI components
 */

import {
  TARGET_ROUTES,
  ENVIRONMENTS,
  ENFORCEMENT_MODES,
  REDACTION_ENTITIES,
  STEP_DEFINITIONS
} from './config.js';
import { THEMES } from './theme.js';

/**
 * Escapes unsafe characters for HTML injection
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Renders the top app header with title, save indicator, and theme toolbar
 * @param {string} currentTheme
 * @returns {string}
 */
export function renderAppHeader(currentTheme) {
  return `
    <header class="app-header">
      <div>
        <h1 class="form-title">AI Safety & Guardrail Policy Builder</h1>
        <span id="save-indicator" class="save-status">Draft saved</span>
      </div>

      <div class="theme-toolbar" role="toolbar" aria-label="Theme Options">
        <span>Theme:</span>
        ${THEMES.map((t) => `
          <button type="button" class="theme-btn ${currentTheme === t.id ? 'active' : ''}" data-theme="${t.id}">${t.label}</button>
        `).join('')}
      </div>
    </header>
  `;
}

/**
 * Renders the step navigation indicator
 * @param {number} currentStep
 * @param {number} totalSteps
 * @returns {string}
 */
export function renderStepper(currentStep, totalSteps) {
  return `
    <nav class="stepper-nav" aria-label="Form Steps">
      <ol class="stepper-list" role="tablist">
        ${STEP_DEFINITIONS.map(({ step, title }) => {
          const isActive = currentStep === step;
          const isPassed = currentStep > step;
          return `
            <li class="stepper-item ${isActive ? 'active' : ''} ${isPassed ? 'completed' : ''}" role="presentation">
              <button type="button" 
                      role="tab"
                      class="step-indicator-btn" 
                      data-step="${step}"
                      aria-selected="${isActive ? 'true' : 'false'}"
                      aria-current="${isActive ? 'step' : 'false'}"
                      ${step > currentStep + 1 ? 'disabled' : ''}>
                ${isPassed ? '✓' : ''} ${title}
              </button>
            </li>
          `;
        }).join('')}
      </ol>
    </nav>
  `;
}

/**
 * Renders the validation error alert summary
 * @param {Record<string, string>} errors
 * @param {Record<string, boolean>} touched
 * @returns {string}
 */
export function renderValidationSummary(errors, touched) {
  const activeErrors = Object.entries(errors).filter(([key]) => touched[key]);
  if (activeErrors.length === 0) return '';

  return `
    <div class="alert-box" role="alert">
      <strong>Please fix the following:</strong>
      <ul>
        ${activeErrors.map(([_, msg]) => `<li>${msg}</li>`).join('')}
      </ul>
    </div>
  `;
}

/**
 * Step 1: Scope & Routes
 */
export function renderStep1(formData, errors, touched) {
  return `
    <div class="form-group ${touched.policyName && errors.policyName ? 'has-error' : ''}" data-field-group="policyName">
      <label for="field-policyName" class="form-label">Policy Name *</label>
      <span id="hint-policyName" class="form-hint">Unique identifier for this guardrail policy.</span>
      <input 
        type="text" 
        id="field-policyName" 
        name="policyName" 
        class="form-control" 
        value="${escapeHtml(formData.policyName)}" 
        placeholder="e.g. Prod-Claude-Guardrail"
        required
        aria-describedby="hint-policyName err-policyName"
        ${touched.policyName && errors.policyName ? 'aria-invalid="true"' : ''}
      >
      <div id="err-policyName" class="error-text" role="alert">
        ${errors.policyName || ''}
      </div>
    </div>

    <fieldset class="form-group" data-field-group="environment">
      <legend class="form-label">Environment *</legend>
      <div class="choice-group">
        ${ENVIRONMENTS.map((env) => `
          <label class="choice-label" for="${env.id}">
            <input type="radio" id="${env.id}" name="environment" value="${env.value}" ${formData.environment === env.value ? 'checked' : ''}>
            ${env.label}
          </label>
        `).join('')}
      </div>
    </fieldset>

    <fieldset class="form-group ${touched.targetRoutes && errors.targetRoutes ? 'has-error' : ''}" data-field-group="targetRoutes">
      <legend class="form-label">Target Model Routes *</legend>
      <span id="hint-routes" class="form-hint">Select at least one active route.</span>
      <div class="choice-group" aria-describedby="hint-routes err-targetRoutes">
        ${TARGET_ROUTES.map((route) => `
          <label class="choice-label" for="${route.id}">
            <input type="checkbox" id="${route.id}" name="targetRoutes" value="${route.value}" ${formData.targetRoutes.includes(route.value) ? 'checked' : ''}>
            ${route.name}
          </label>
        `).join('')}
      </div>
      <div id="err-targetRoutes" class="error-text" role="alert">
        ${errors.targetRoutes || ''}
      </div>
    </fieldset>

    <fieldset class="form-group" data-field-group="enforcementMode">
      <legend class="form-label">Enforcement Mode *</legend>
      <div class="choice-group">
        ${ENFORCEMENT_MODES.map((mode) => `
          <label class="choice-label" for="${mode.id}">
            <input type="radio" id="${mode.id}" name="enforcementMode" value="${mode.value}" ${formData.enforcementMode === mode.value ? 'checked' : ''}>
            ${mode.title}
          </label>
        `).join('')}
      </div>
    </fieldset>
  `;
}

/**
 * Step 2: Threat Detection & PII Redaction
 */
export function renderStep2(formData, errors, touched) {
  return `
    <fieldset class="form-group ${touched.redactionEntities && errors.redactionEntities ? 'has-error' : ''}" data-field-group="redactionEntities">
      <legend class="form-label">Sensitive Data Redaction *</legend>
      <span id="hint-redaction" class="form-hint">Select entity categories to scrub.</span>
      <div class="choice-group" aria-describedby="hint-redaction err-redactionEntities">
        ${REDACTION_ENTITIES.map((item) => `
          <label class="choice-label" for="${item.id}">
            <input type="checkbox" id="${item.id}" name="redactionEntities" value="${item.value}" ${formData.redactionEntities.includes(item.value) ? 'checked' : ''}>
            ${item.title}
          </label>
        `).join('')}
      </div>
      <div id="err-redactionEntities" class="error-text" role="alert">
        ${errors.redactionEntities || ''}
      </div>
    </fieldset>

    <div class="form-group" data-field-group="injectionSensitivity">
      <label for="field-injectionSensitivity" class="form-label">
        Injection Sensitivity: <strong id="sensitivity-value">${formData.injectionSensitivity}</strong>
      </label>
      <span id="hint-sensitivity" class="form-hint">Range from 0.1 (Lenient) to 1.0 (Strict).</span>
      <input 
        type="range" 
        id="field-injectionSensitivity" 
        name="injectionSensitivity" 
        class="form-control" 
        min="0.1" 
        max="1.0" 
        step="0.05" 
        value="${formData.injectionSensitivity}"
        aria-describedby="hint-sensitivity"
      >
    </div>

    <div class="form-group ${touched.hallucinationThreshold && errors.hallucinationThreshold ? 'has-error' : ''}" data-field-group="hallucinationThreshold">
      <label for="field-hallucinationThreshold" class="form-label">Hallucination Threshold (%) *</label>
      <span id="hint-threshold" class="form-hint">Minimum certainty percentage (50% – 99%).</span>
      <input 
        type="number" 
        id="field-hallucinationThreshold" 
        name="hallucinationThreshold" 
        class="form-control" 
        value="${formData.hallucinationThreshold}" 
        min="50" 
        max="99" 
        required
        aria-describedby="hint-threshold err-hallucinationThreshold"
        ${touched.hallucinationThreshold && errors.hallucinationThreshold ? 'aria-invalid="true"' : ''}
      >
      <div id="err-hallucinationThreshold" class="error-text" role="alert">
        ${errors.hallucinationThreshold || ''}
      </div>
    </div>

    <div class="form-group" data-field-group="bannedKeywords">
      <label for="field-bannedKeywords" class="form-label">Banned Keywords (Optional)</label>
      <span id="hint-banned" class="form-hint">Comma-separated prohibited words or tokens.</span>
      <textarea 
        id="field-bannedKeywords" 
        name="bannedKeywords" 
        class="form-control" 
        rows="2" 
        aria-describedby="hint-banned"
      >${escapeHtml(formData.bannedKeywords)}</textarea>
    </div>
  `;
}

/**
 * Step 3: Fallbacks & Incident Alerts
 */
export function renderStep3(formData, errors, touched) {
  return `
    <div class="form-group ${touched.fallbackMessage && errors.fallbackMessage ? 'has-error' : ''}" data-field-group="fallbackMessage">
      <label for="field-fallbackMessage" class="form-label">Safe Fallback Message *</label>
      <span id="hint-fallback" class="form-hint">Returned to users when blocked (min 15 characters).</span>
      <textarea 
        id="field-fallbackMessage" 
        name="fallbackMessage" 
        class="form-control" 
        rows="3" 
        required
        aria-describedby="hint-fallback err-fallbackMessage"
        ${touched.fallbackMessage && errors.fallbackMessage ? 'aria-invalid="true"' : ''}
      >${escapeHtml(formData.fallbackMessage)}</textarea>
      <div id="err-fallbackMessage" class="error-text" role="alert">
        ${errors.fallbackMessage || ''}
      </div>
    </div>

    <div class="form-group ${touched.alertWebhookUrl && errors.alertWebhookUrl ? 'has-error' : ''}" data-field-group="alertWebhookUrl">
      <label for="field-alertWebhookUrl" class="form-label">Alert Webhook URL *</label>
      <span id="hint-webhook" class="form-hint">HTTP/HTTPS endpoint for alerts.</span>
      <input 
        type="url" 
        id="field-alertWebhookUrl" 
        name="alertWebhookUrl" 
        class="form-control" 
        value="${escapeHtml(formData.alertWebhookUrl)}" 
        placeholder="https://hooks.slack.com/services/..."
        required
        aria-describedby="hint-webhook err-alertWebhookUrl"
        ${touched.alertWebhookUrl && errors.alertWebhookUrl ? 'aria-invalid="true"' : ''}
      >
      <div id="err-alertWebhookUrl" class="error-text" role="alert">
        ${errors.alertWebhookUrl || ''}
      </div>
    </div>

    <div class="form-row">
      <div class="form-group ${touched.securityEmail && errors.securityEmail ? 'has-error' : ''}" data-field-group="securityEmail">
        <label for="field-securityEmail" class="form-label">SecOps Email *</label>
        <input 
          type="email" 
          id="field-securityEmail" 
          name="securityEmail" 
          class="form-control" 
          value="${escapeHtml(formData.securityEmail)}" 
          placeholder="secops@company.com"
          required
          aria-describedby="err-securityEmail"
          ${touched.securityEmail && errors.securityEmail ? 'aria-invalid="true"' : ''}
        >
        <div id="err-securityEmail" class="error-text" role="alert">
          ${errors.securityEmail || ''}
        </div>
      </div>

      <div class="form-group ${touched.rateLimitSpike && errors.rateLimitSpike ? 'has-error' : ''}" data-field-group="rateLimitSpike">
        <label for="field-rateLimitSpike" class="form-label">Spike Rate Limit (req/min) *</label>
        <input 
          type="number" 
          id="field-rateLimitSpike" 
          name="rateLimitSpike" 
          class="form-control" 
          value="${formData.rateLimitSpike}" 
          min="1" 
          max="5000" 
          required
          aria-describedby="err-rateLimitSpike"
          ${touched.rateLimitSpike && errors.rateLimitSpike ? 'aria-invalid="true"' : ''}
        >
        <div id="err-rateLimitSpike" class="error-text" role="alert">
          ${errors.rateLimitSpike || ''}
        </div>
      </div>
    </div>
  `;
}

/**
 * Step 4: Verification & Policy Review
 */
export function renderStep4Review(formData, errors, touched) {
  return `
    <div class="review-card">
      <div class="review-header">
        <h3>Step 1: Scope & Routes</h3>
        <button type="button" class="btn jump-edit-btn" data-step="1">Edit</button>
      </div>
      <dl class="review-dl">
        <dt>Policy Name:</dt><dd>${escapeHtml(formData.policyName || '—')}</dd>
        <dt>Environment:</dt><dd>${escapeHtml(formData.environment)}</dd>
        <dt>Mode:</dt><dd>${escapeHtml(formData.enforcementMode)}</dd>
        <dt>Routes:</dt><dd>${formData.targetRoutes.join(', ') || 'None'}</dd>
      </dl>
    </div>

    <div class="review-card">
      <div class="review-header">
        <h3>Step 2: Threat Detection</h3>
        <button type="button" class="btn jump-edit-btn" data-step="2">Edit</button>
      </div>
      <dl class="review-dl">
        <dt>Redaction:</dt><dd>${formData.redactionEntities.join(', ') || 'None'}</dd>
        <dt>Sensitivity:</dt><dd>${formData.injectionSensitivity}</dd>
        <dt>Threshold:</dt><dd>${formData.hallucinationThreshold}%</dd>
        <dt>Banned:</dt><dd>${escapeHtml(formData.bannedKeywords || 'None')}</dd>
      </dl>
    </div>

    <div class="review-card">
      <div class="review-header">
        <h3>Step 3: Fallbacks & Alerts</h3>
        <button type="button" class="btn jump-edit-btn" data-step="3">Edit</button>
      </div>
      <dl class="review-dl">
        <dt>Fallback:</dt><dd>${escapeHtml(formData.fallbackMessage)}</dd>
        <dt>Webhook:</dt><dd>${escapeHtml(formData.alertWebhookUrl)}</dd>
        <dt>Email:</dt><dd>${escapeHtml(formData.securityEmail)}</dd>
        <dt>Rate Limit:</dt><dd>${formData.rateLimitSpike} req/min</dd>
      </dl>
    </div>

    <div class="form-group review-confirm ${touched.complianceConfirmed && errors.complianceConfirmed ? 'has-error' : ''}" data-field-group="complianceConfirmed">
      <label class="choice-label" for="field-complianceConfirmed">
        <input 
          type="checkbox" 
          id="field-complianceConfirmed" 
          name="complianceConfirmed" 
          ${formData.complianceConfirmed ? 'checked' : ''}
          aria-describedby="err-complianceConfirmed"
          ${touched.complianceConfirmed && errors.complianceConfirmed ? 'aria-invalid="true"' : ''}
        >
        <span>I confirm this guardrail configuration has been verified.</span>
      </label>
      <div id="err-complianceConfirmed" class="error-text" role="alert">
        ${errors.complianceConfirmed || ''}
      </div>
    </div>
  `;
}

/**
 * Success Screen with Generated Policy ID and cURL Code Snippet
 */
export function renderSuccessScreen(policyId) {
  return `
    <div class="success-screen" tabindex="-1" id="step-heading">
      <h2>Policy Activated</h2>
      <p>Policy ID: <code>${policyId}</code></p>
      <p>Status: <strong>Active & Enforcing</strong></p>

      <pre><code>curl -X POST https://api.gateway.internal/v1/chat/completions \\
  -H "Authorization: Bearer $GATEWAY_KEY" \\
  -H "X-Guardrail-Policy: ${policyId}" \\
  -H "Content-Type: application/json" \\
  -d '{"model": "gpt-4o", "messages": [{"role": "user", "content": "Hello"}]}'</code></pre>

      <div class="success-actions">
        <button type="button" id="btn-copy-id" class="btn">Copy Policy ID</button>
        <button type="button" id="btn-export-json" class="btn">Export JSON</button>
        <button type="button" id="btn-new-policy" class="btn btn-primary">Create Another Policy</button>
      </div>
    </div>
  `;
}

/**
 * Form Body Container with Stepper, Dynamic Step Content, and Navigation Footer
 */
export function renderFormBody(currentStep, totalSteps, stepTitle, formData, errors, touched) {
  let stepHtml = '';
  switch (currentStep) {
    case 1: stepHtml = renderStep1(formData, errors, touched); break;
    case 2: stepHtml = renderStep2(formData, errors, touched); break;
    case 3: stepHtml = renderStep3(formData, errors, touched); break;
    case 4: stepHtml = renderStep4Review(formData, errors, touched); break;
  }

  return `
    ${renderStepper(currentStep, totalSteps)}
    ${renderValidationSummary(errors, touched)}

    <form onsubmit="return false;" novalidate>
      <h2 id="step-heading" tabindex="-1" class="step-heading">
        Step ${currentStep} of ${totalSteps}: ${stepTitle}
      </h2>

      <div class="step-fields">
        ${stepHtml}
      </div>

      <footer class="form-footer">
        <div>
          ${currentStep > 1 ? `
            <button type="button" id="btn-prev" class="btn">← Back</button>
          ` : `
            <button type="button" id="btn-reset" class="btn">Reset</button>
          `}
        </div>

        <div>
          ${currentStep < totalSteps ? `
            <button type="button" id="btn-next" class="btn btn-primary">Next →</button>
          ` : `
            <button type="button" id="btn-next" class="btn btn-primary" ${!formData.complianceConfirmed ? 'disabled' : ''}>
              Activate Policy
            </button>
          `}
        </div>
      </footer>
    </form>
  `;
}
