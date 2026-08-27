/**
 * Accessibility Focus Coordinator - Milestone 5 & Jump Prevention
 * Manages programmatic focus trapping and restoration between the results grid and details view.
 * Prevents abrupt viewport jumps by leveraging preventScroll and preserving scroll offset.
 */

export class FocusCoordinator {
  constructor() {
    this._triggerElement = null;
    this._savedScrollY = 0;
  }

  /**
   * Remembers the element that triggered the details view and its scroll position
   */
  recordTrigger(element) {
    this._triggerElement = element || null;
    if (typeof window !== 'undefined' && typeof window.scrollY === 'number') {
      this._savedScrollY = window.scrollY;
    }
  }

  /**
   * Programmatically shifts focus to the primary heading without viewport jumping
   */
  focusDetailsHeading(container = globalThis.document) {
    if (!container) return;

    const heading = container.querySelector?.('#details-heading') || container.querySelector?.('h1');
    if (heading && typeof heading.focus === 'function') {
      heading.focus({ preventScroll: true });
    }
  }

  /**
   * Restores focus back to the recorded trigger element and restores exact scroll offset
   */
  restoreTriggerFocus() {
    if (this._triggerElement && typeof this._triggerElement.focus === 'function') {
      if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
        window.scrollTo({ top: this._savedScrollY, behavior: 'instant' });
      }
      this._triggerElement.focus({ preventScroll: true });
      this._triggerElement = null;
    }
  }
}
