/**
 * LocalStorage draft management utilities
 */

import { STORAGE_KEY, DEFAULT_FORM_DATA } from './config.js';

export function loadSavedDraft() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        data: { ...DEFAULT_FORM_DATA, ...parsed.data },
        currentStep: (parsed.currentStep >= 1 && parsed.currentStep <= 4) ? parsed.currentStep : 1
      };
    }
  } catch (e) {
    console.warn('Could not load draft from localStorage', e);
  }
  return { data: { ...DEFAULT_FORM_DATA }, currentStep: 1 };
}

export function saveFormDraft(data, currentStep) {
  try {
    const payload = {
      data,
      currentStep,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (e) {
    console.warn('Could not save draft to localStorage', e);
    return false;
  }
}

export function clearFormDraft() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear draft from localStorage', e);
  }
}
