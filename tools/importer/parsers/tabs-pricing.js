/* eslint-disable */
/* global WebImporter */

/**
 * Parser for tabs-pricing block
 *
 * Source: https://o2online.es/
 * Base Block: tabs
 *
 * Block Structure (from tabs markdown example):
 * - Row per tab: [Tab Label] | [Tab Content]
 *
 * Source HTML Pattern (from captured DOM):
 * <article class="caja-tarifa-rf">
 *   <ul class="nav nav-tabs"> (tab navigation with li > a items)
 *   <div class="tab-content"> (tab panels with .tab-pane divs)
 *     Each panel contains .card elements with plan details
 * </article>
 *
 * Generated: 2026-03-04
 */
export default function parse(element, { document }) {
  // Extract tab labels - VALIDATED: source uses ul.nav-tabs > li > a
  const tabLinks = Array.from(element.querySelectorAll('.nav-tabs a, .nav-tabs button, [role="tab"]'));

  // Extract tab panels - VALIDATED: source uses .tab-content > .tab-pane
  const tabPanels = Array.from(element.querySelectorAll('.tab-pane, .tab-content > div, [role="tabpanel"]'));

  // Build cells array - each row is [label, content]
  const cells = [];

  // Match tabs to panels
  const tabCount = Math.min(tabLinks.length, tabPanels.length);
  for (let i = 0; i < tabCount; i++) {
    const label = tabLinks[i];
    const panel = tabPanels[i];

    if (label && panel) {
      cells.push([label, panel]);
    }
  }

  // Fallback: if no tabs found, treat entire element as single tab
  if (cells.length === 0) {
    const heading = element.querySelector('h2, h3, [class*="title"]');
    const content = element.querySelector('.container') || element;
    if (heading && content) {
      cells.push([heading, content]);
    }
  }

  // Create block using WebImporter utility
  const block = WebImporter.Blocks.createBlock(document, { name: 'Tabs-Pricing', cells });

  // Replace original element with structured block table
  element.replaceWith(block);
}
