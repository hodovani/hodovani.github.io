/**
 * AI Guardrail Form Web Component (<ai-guardrail-form>)
 * Controller & State Machine for Multi-Step AI Gateway Configuration
 */

import { DEFAULT_FORM_DATA, STEP_DEFINITIONS } from './config.js';
import { validateField, validateStep, validateAll } from './validation.js';
import { loadSavedDraft, saveFormDraft, clearFormDraft } from './storage.js';
import { getSavedTheme, applyTheme } from './theme.js';
import { renderAppHeader, renderFormBody, renderSuccessScreen } from './templates.js';

export class AIGuardrailForm extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.currentStep = 1;
    this.totalSteps = 4;
    this.isSubmitted = false;
    this.generatedPolicyId = '';
    this.theme = 'system';

    this.formData = { ...DEFAULT_FORM_DATA };
    this.touched = {};
    this.errors = {};
    this.saveTimeout = null;

    const saved = loadSavedDraft();
    this.formData = saved.data;
    this.currentStep = saved.currentStep;
  }

  connectedCallback() {
    this.initTheme();
    this.render();
    this.setupEventListeners();
  }

  initTheme() {
    this.theme = getSavedTheme();
    applyTheme(this, this.theme);
  }

  setTheme(theme) {
    this.theme = theme;
    applyTheme(this, theme);
    this.render();
  }

  saveDraft() {
    clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      saveFormDraft(this.formData, this.currentStep);
      this.updateSaveIndicator('Draft saved');
    }, 300);
  }

  clearDraft() {
    if (confirm('Reset all fields and clear draft?')) {
      clearFormDraft();
      this.formData = { ...DEFAULT_FORM_DATA };
      this.touched = {};
      this.errors = {};
      this.currentStep = 1;
      this.isSubmitted = false;
      this.render();
      this.focusStepHeader();
      this.announce('Draft cleared. Reset to step 1.');
    }
  }

  updateSaveIndicator(text) {
    const el = this.shadowRoot.querySelector('#save-indicator');
    if (el) el.textContent = text;
  }

  runFieldValidation(fieldName) {
    const err = validateField(this.formData, fieldName);
    if (err) this.errors[fieldName] = err;
    else delete this.errors[fieldName];
    return !err;
  }

  runStepValidation(stepNumber, markTouched = true) {
    const fields = {
      1: ['policyName', 'environment', 'targetRoutes', 'enforcementMode'],
      2: ['redactionEntities', 'hallucinationThreshold'],
      3: ['fallbackMessage', 'alertWebhookUrl', 'securityEmail', 'rateLimitSpike'],
      4: ['complianceConfirmed']
    }[stepNumber] || [];

    if (markTouched) {
      fields.forEach((f) => { this.touched[f] = true; });
    }

    const { isValid, errors } = validateStep(this.formData, stepNumber);
    fields.forEach((f) => {
      if (errors[f]) this.errors[f] = errors[f];
      else delete this.errors[f];
    });

    return isValid;
  }

  runAllValidation(markTouched = false) {
    const { isValid, errors } = validateAll(this.formData);
    this.errors = { ...errors };
    if (markTouched) {
      Object.keys(this.formData).forEach((k) => { this.touched[k] = true; });
    }
    return isValid;
  }

  goToStep(stepNumber) {
    if (stepNumber < 1 || stepNumber > this.totalSteps) return;

    if (stepNumber < this.currentStep) {
      this.currentStep = stepNumber;
      this.render();
      this.saveDraft();
      this.focusStepHeader();
      return;
    }

    const currentValid = this.runStepValidation(this.currentStep, true);
    if (!currentValid) {
      this.render();
      this.focusFirstInvalidField();
      this.announce('Please resolve the errors below before continuing.');
      return;
    }

    this.currentStep = stepNumber;
    this.render();
    this.saveDraft();
    this.focusStepHeader();
    this.announce(`Step ${this.currentStep} of ${this.totalSteps}: ${this.getStepTitle(this.currentStep)}`);
  }

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.goToStep(this.currentStep + 1);
    } else if (this.currentStep === this.totalSteps) {
      this.submitPolicy();
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.goToStep(this.currentStep - 1);
    }
  }

  submitPolicy() {
    const isValid = this.runAllValidation(true);
    if (!isValid) {
      this.render();
      this.focusFirstInvalidField();
      this.announce('Form contains errors. Please review prior steps.');
      return;
    }

    this.generatedPolicyId = `gw_pol_${Math.random().toString(36).substring(2, 11)}`;
    this.isSubmitted = true;
    clearFormDraft();
    this.render();
    this.focusStepHeader();
    this.announce(`Guardrail Policy successfully activated with ID ${this.generatedPolicyId}`);
  }

  getStepTitle(step) {
    return STEP_DEFINITIONS[step - 1]?.title || '';
  }

  announce(message) {
    const announcer = this.shadowRoot.querySelector('#sr-announcer');
    if (announcer) announcer.textContent = message;
  }

  focusStepHeader() {
    setTimeout(() => {
      const heading = this.shadowRoot.querySelector('#step-heading');
      if (heading) heading.focus();
    }, 50);
  }

  focusFirstInvalidField() {
    setTimeout(() => {
      const firstInvalid = this.shadowRoot.querySelector('[aria-invalid="true"], .has-error input, .has-error textarea, .has-error select');
      if (firstInvalid) firstInvalid.focus();
    }, 50);
  }

  setupEventListeners() {
    this.shadowRoot.addEventListener('click', (e) => {
      const themeBtn = e.target.closest('[data-theme]');
      if (themeBtn) {
        this.setTheme(themeBtn.dataset.theme);
        return;
      }

      const stepBtn = e.target.closest('.step-indicator-btn');
      if (stepBtn && !stepBtn.disabled) {
        const stepNum = parseInt(stepBtn.dataset.step, 10);
        this.goToStep(stepNum);
        return;
      }

      const jumpBtn = e.target.closest('.jump-edit-btn');
      if (jumpBtn) {
        const stepNum = parseInt(jumpBtn.dataset.step, 10);
        this.goToStep(stepNum);
        return;
      }

      if (e.target.closest('#btn-next')) {
        this.nextStep();
        return;
      }

      if (e.target.closest('#btn-prev')) {
        this.prevStep();
        return;
      }

      if (e.target.closest('#btn-reset')) {
        this.clearDraft();
        return;
      }

      if (e.target.closest('#btn-copy-id')) {
        this.copyPolicyId();
        return;
      }

      if (e.target.closest('#btn-export-json')) {
        this.exportJson();
        return;
      }

      if (e.target.closest('#btn-new-policy')) {
        this.formData = { ...DEFAULT_FORM_DATA };
        this.touched = {};
        this.errors = {};
        this.currentStep = 1;
        this.isSubmitted = false;
        this.render();
        this.focusStepHeader();
      }
    });

    this.shadowRoot.addEventListener('input', (e) => {
      this.handleFieldInput(e.target);
    });

    this.shadowRoot.addEventListener('change', (e) => {
      this.handleFieldInput(e.target);
    });

    this.shadowRoot.addEventListener('focusout', (e) => {
      const field = e.target.name;
      if (field && !this.touched[field]) {
        this.touched[field] = true;
        this.runFieldValidation(field);
        this.updateFieldErrorDOM(field);
      }
    });

    this.shadowRoot.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        if (e.target.closest('#btn-prev') || e.target.closest('#btn-reset') || e.target.closest('.theme-btn') || e.target.closest('.jump-edit-btn')) {
          return;
        }
        e.preventDefault();
        this.nextStep();
      }
    });
  }

  handleFieldInput(target) {
    const { name, type, value, checked } = target;
    if (!name) return;

    if (name === 'targetRoutes' || name === 'redactionEntities') {
      const checkboxes = this.shadowRoot.querySelectorAll(`input[name="${name}"]:checked`);
      this.formData[name] = Array.from(checkboxes).map((c) => c.value);
    } else if (type === 'checkbox') {
      this.formData[name] = checked;
    } else if (type === 'number') {
      this.formData[name] = value === '' ? '' : Number(value);
    } else if (name === 'injectionSensitivity') {
      this.formData[name] = parseFloat(value);
      const valDisplay = this.shadowRoot.querySelector('#sensitivity-value');
      if (valDisplay) valDisplay.textContent = this.formData[name];
    } else {
      this.formData[name] = value;
    }

    if (this.touched[name]) {
      this.runFieldValidation(name);
      this.updateFieldErrorDOM(name);
    }

    this.updateSaveIndicator('Unsaved changes...');
    this.saveDraft();

    if (name === 'complianceConfirmed' && this.currentStep === 4) {
      const nextBtn = this.shadowRoot.querySelector('#btn-next');
      if (nextBtn) nextBtn.disabled = !this.formData.complianceConfirmed;
    }
  }

  updateFieldErrorDOM(fieldName) {
    const errText = this.shadowRoot.querySelector(`#err-${fieldName}`);
    const formGroup = this.shadowRoot.querySelector(`[data-field-group="${fieldName}"]`);
    const input = this.shadowRoot.querySelector(`[name="${fieldName}"]`);

    const hasError = this.touched[fieldName] && !!this.errors[fieldName];

    if (errText) {
      errText.textContent = this.errors[fieldName] || '';
    }

    if (formGroup) {
      formGroup.classList.toggle('has-error', hasError);
    }

    if (input && input.type !== 'radio' && input.type !== 'checkbox') {
      if (hasError) input.setAttribute('aria-invalid', 'true');
      else input.removeAttribute('aria-invalid');
    }
  }

  copyPolicyId() {
    if (!this.generatedPolicyId) return;
    navigator.clipboard.writeText(this.generatedPolicyId).then(() => {
      const btn = this.shadowRoot.querySelector('#btn-copy-id');
      if (btn) {
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = 'Copy Policy ID'; }, 2000);
      }
    });
  }

  exportJson() {
    const payload = {
      policyId: this.generatedPolicyId,
      createdAt: new Date().toISOString(),
      configuration: { ...this.formData }
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.formData.policyName || 'guardrail-policy'}-${this.formData.environment}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  render() {
    const title = this.getStepTitle(this.currentStep);
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="./form.css">
      <div class="form-wrapper" role="region" aria-label="AI Guardrail Policy Builder">
        <div id="sr-announcer" class="sr-only" aria-live="polite" aria-atomic="true"></div>

        ${renderAppHeader(this.theme)}

        ${this.isSubmitted 
          ? renderSuccessScreen(this.generatedPolicyId) 
          : renderFormBody(this.currentStep, this.totalSteps, title, this.formData, this.errors, this.touched)
        }
      </div>
    `;
  }
}

if (!customElements.get('ai-guardrail-form')) {
  customElements.define('ai-guardrail-form', AIGuardrailForm);
}
