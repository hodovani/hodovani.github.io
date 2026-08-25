/**
 * Theme management module
 * Supports system, light, dark, and high-contrast preferences
 */

export const THEME_STORAGE_KEY = 'ai_guardrail_theme';

export const THEMES = [
  { id: 'system', label: 'System' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'high-contrast', label: 'Contrast' }
];

export function getSavedTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) || 'system';
  } catch (_) {
    return 'system';
  }
}

export function saveThemePreference(theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (_) {}
}

export function applyTheme(element, theme) {
  saveThemePreference(theme);
  if (theme === 'system') {
    element.removeAttribute('data-theme');
  } else {
    element.setAttribute('data-theme', theme);
  }
}
