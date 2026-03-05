/* eslint-disable */
/* global WebImporter */

/**
 * Transformer for O2 Online Spain website cleanup
 * Purpose: Remove non-content elements (cookie consent, footer, navigation, tracking)
 * Applies to: o2online.es (all templates)
 * Generated: 2026-03-04
 *
 * SELECTORS EXTRACTED FROM:
 * - Captured DOM during migration workflow (cleaned.html)
 * - HTML analysis from page structure identification
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove cookie consent banner
    // EXTRACTED: Found <div id="onetrust-consent-sdk"> in captured DOM
    // EXTRACTED: Found <div id="onetrust-banner-sdk"> and <div id="onetrust-pc-sdk">
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '#onetrust-banner-sdk',
      '#onetrust-pc-sdk',
      '.onetrust-pc-dark-filter',
    ]);

    // Remove footer - handled by dedicated EDS footer
    // EXTRACTED: Found <footer class="position-relative"> in captured DOM
    WebImporter.DOMUtils.remove(element, [
      'footer',
    ]);

    // Remove navigation header - handled by dedicated EDS header
    // EXTRACTED: Found <nav> and header elements in captured DOM
    WebImporter.DOMUtils.remove(element, [
      'nav',
      'header',
    ]);

    // Remove iframes and hidden inputs
    // EXTRACTED: Found <iframe> and <input> elements at bottom of captured DOM
    WebImporter.DOMUtils.remove(element, [
      'iframe',
      'input',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Remove remaining non-content elements
    WebImporter.DOMUtils.remove(element, [
      'noscript',
      'link',
      'source',
    ]);
  }
}
