/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-app block
 *
 * Source: https://o2online.es/
 * Base Block: columns
 *
 * Block Structure (from columns markdown example):
 * - Row: [Column 1 content] | [Column 2 content]
 *
 * Source HTML Pattern (from captured DOM):
 * <article id="appmio2factura" class="bloque_app_faldon bg-gradient">
 *   <div class="container">
 *     <div class="row">
 *       <div class="col-12 col-md-6"> (text column)
 *         <h2>App Mi O2</h2>
 *         <p>Description...</p>
 *         <ul class="lista-app">feature list</ul>
 *         <a><img alt="App Store"></a>
 *         <a><img alt="Google Play"></a>
 *       </div>
 *       <div class="col-12 col-md-6"> (image column)
 *         <img class="foto img-fluid" src="..." alt="">
 *       </div>
 *     </div>
 *   </div>
 * </article>
 *
 * Generated: 2026-03-04
 */
export default function parse(element, { document }) {
  // Extract columns - VALIDATED: source uses .row > .col-12.col-md-6
  const columns = Array.from(element.querySelectorAll('.row > .col-12, .row > .col-md-6, .row > [class*="col-"]'));

  // Build cells array - each cell is a column
  const cells = [];

  if (columns.length >= 2) {
    // Two column layout - take first two distinct columns
    cells.push([columns[0], columns[1]]);
  } else if (columns.length === 1) {
    // Single column fallback
    cells.push([columns[0]]);
  } else {
    // Fallback: use direct children of container
    const container = element.querySelector('.container') || element;
    const children = Array.from(container.querySelectorAll(':scope > div'));
    if (children.length >= 2) {
      cells.push([children[0], children[1]]);
    } else {
      cells.push([container]);
    }
  }

  // Create block using WebImporter utility
  const block = WebImporter.Blocks.createBlock(document, { name: 'Columns-App', cells });

  // Replace original element with structured block table
  element.replaceWith(block);
}
