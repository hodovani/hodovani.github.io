/**
 * Pure validation functions for AI Guardrail Policy Builder
 *
 * Why JS validation is used alongside HTML5 constraints:
 * 1. Custom, Helpful Error Text:
 *    Native HTML5 pattern failure displays generic browser text (e.g. "Please match the requested format").
 *    In JS, we provide clear, actionable feedback (e.g. "Only letters, numbers, spaces, dashes, and underscores allowed").
 * 2. Multi-Element Constraints:
 *    HTML5 cannot natively enforce "select at least 1 of N checkboxes" (e.g. targetRoutes, redactionEntities).
 * 3. Step 4 Review Step / Offscreen State:
 *    In a multi-step workflow, earlier step inputs are unmounted from the DOM. A JS data object is needed
 *    to verify the overall payload when clicking "Activate Policy" on the review screen.
 */

export function validateField(data, fieldName) {
  const val = data[fieldName];
  let err = '';

  switch (fieldName) {
    // Step 1
    case 'policyName':
      if (!val || !val.trim()) {
        err = 'Policy name is required.';
      } else if (val.trim().length < 3) {
        err = 'Policy name must be at least 3 characters.';
      } else if (val.trim().length > 50) {
        err = 'Policy name cannot exceed 50 characters.';
      } else if (!/^[a-zA-Z0-9_\-\s]+$/.test(val.trim())) {
        err = 'Only letters, numbers, spaces, dashes, and underscores allowed.';
      }
      break;

    case 'targetRoutes':
      if (!Array.isArray(val) || val.length === 0) {
        err = 'Select at least one target gateway model route.';
      }
      break;

    case 'environment':
      if (!val) err = 'Select an environment.';
      break;

    case 'enforcementMode':
      if (!val) err = 'Select an enforcement mode.';
      break;

    // Step 2
    case 'redactionEntities':
      if (!Array.isArray(val) || val.length === 0) {
        err = 'Select at least one entity category to redact.';
      }
      break;

    case 'hallucinationThreshold':
      const num = Number(val);
      if (isNaN(num) || num < 50 || num > 99) {
        err = 'Threshold must be between 50% and 99%.';
      }
      break;

    // Step 3
    case 'fallbackMessage':
      if (!val || !val.trim()) {
        err = 'Fallback message is required.';
      } else if (val.trim().length < 15) {
        err = 'Fallback message must be at least 15 characters.';
      }
      break;

    case 'alertWebhookUrl':
      if (!val || !val.trim()) {
        err = 'Webhook URL is required.';
      } else {
        try {
          const url = new URL(val.trim());
          if (!['http:', 'https:'].includes(url.protocol)) {
            err = 'Webhook URL must start with http:// or https://';
          }
        } catch (_) {
          err = 'Enter a valid URL (e.g., https://hooks.slack.com/services/...)';
        }
      }
      break;

    case 'securityEmail':
      if (!val || !val.trim()) {
        err = 'Security email is required.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) {
        err = 'Enter a valid email address (e.g. security@company.com).';
      }
      break;

    case 'rateLimitSpike':
      const rate = Number(val);
      if (isNaN(rate) || rate < 1 || rate > 5000 || !Number.isInteger(rate)) {
        err = 'Must be an integer between 1 and 5,000 req/min.';
      }
      break;

    // Step 4
    case 'complianceConfirmed':
      if (!val) {
        err = 'You must confirm policy verification before activating.';
      }
      break;
  }

  return err;
}

export function validateStep(data, stepNumber) {
  const fields = {
    1: ['policyName', 'environment', 'targetRoutes', 'enforcementMode'],
    2: ['redactionEntities', 'hallucinationThreshold'],
    3: ['fallbackMessage', 'alertWebhookUrl', 'securityEmail', 'rateLimitSpike'],
    4: ['complianceConfirmed']
  }[stepNumber] || [];

  const errors = {};
  let isValid = true;

  fields.forEach((fieldName) => {
    const err = validateField(data, fieldName);
    if (err) {
      errors[fieldName] = err;
      isValid = false;
    }
  });

  return { isValid, errors };
}

export function validateAll(data) {
  let allValid = true;
  let allErrors = {};

  for (let s = 1; s <= 4; s++) {
    const { isValid, errors } = validateStep(data, s);
    if (!isValid) {
      allValid = false;
      Object.assign(allErrors, errors);
    }
  }

  return { isValid: allValid, errors: allErrors };
}
