/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-o2 block
 *
 * Source: https://o2online.es/
 * Base Block: hero
 *
 * Block Structure (from markdown example):
 * - Row 1: Background image (optional)
 * - Row 2: Content (heading + subheading)
 *
 * Source HTML Pattern (from captured DOM):
 * <article class="cabecera">
 *   <div class="container">
 *     <h1>O2 tu compañía de Fibra y Móvil</h1>
 *     <p>Tranquilidad desde el primer momento...</p>
 *   </div>
 * </article>
 * Background image is CSS background-image on article or child div.
 *
 * Generated: 2026-03-04
 */
export default function parse(element, { document }) {
  // Extract heading - VALIDATED: source uses h1 inside article.cabecera
  const heading = element.querySelector('h1') ||
                  element.querySelector('h2') ||
                  element.querySelector('[class*="title"]');

  // Extract subheading/description - VALIDATED: source uses p tag after heading
  const description = element.querySelector('p') ||
                      element.querySelector('[class*="subtitle"]');

  // Extract background image if present
  // VALIDATED: source page uses background-image CSS or inline img
  const bgImage = element.querySelector('img');

  // Build cells array matching hero block structure
  const cells = [];

  // Row 1: Background image (optional)
  if (bgImage) {
    cells.push([bgImage]);
  }

  // Row 2: Content (heading + subheading combined in one cell)
  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (description) contentCell.push(description);
  cells.push(contentCell);

  // Create block using WebImporter utility
  const block = WebImporter.Blocks.createBlock(document, { name: 'Hero-O2', cells });

  // Replace original element with structured block table
  element.replaceWith(block);
}
