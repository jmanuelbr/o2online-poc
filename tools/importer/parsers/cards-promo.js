/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-promo block
 *
 * Source: https://o2online.es/
 * Base Block: cards
 *
 * Block Structure (from cards markdown example):
 * - Row per card: [Image] | [Title + Description + Link]
 *
 * Source HTML Pattern (from captured DOM):
 * <article class="bloque_carrusel">
 *   <div class="owl-carousel">
 *     <div class="item"> (each carousel item)
 *       <a href="...">
 *         <img src="..." alt="">
 *         <div class="body">
 *           <h3>Title</h3>
 *           <p>Description</p>
 *         </div>
 *       </a>
 *     </div>
 *   </div>
 * </article>
 *
 * Generated: 2026-03-04
 */
export default function parse(element, { document }) {
  // Extract card items - VALIDATED: source uses .item or .owl-item within carousel
  const items = Array.from(
    element.querySelectorAll('.item, .owl-item, .col-md-6, .col-lg-3')
  );

  // Build cells array - each row is [image, text content]
  const cells = [];

  items.forEach((item) => {
    // Extract image - VALIDATED: each item has img.card-img-top or img inside link
    const img = item.querySelector('img');

    // Extract text content
    const title = item.querySelector('h3, h4, .card-title, [class*="title"]');
    const desc = item.querySelector('p, .card-text, [class*="text"]');
    const link = item.querySelector('a[href]');

    // Build text cell
    const textCell = [];
    if (title) textCell.push(title);
    if (desc) textCell.push(desc);

    // Add link if separate from wrapper
    if (link && link !== item.closest('a') && !textCell.includes(link)) {
      textCell.push(link);
    }

    // Only add row if we have content
    if (img || textCell.length > 0) {
      cells.push([img || '', textCell.length > 0 ? textCell : '']);
    }
  });

  // Create block using WebImporter utility
  const block = WebImporter.Blocks.createBlock(document, { name: 'Cards-Promo', cells });

  // Replace original element with structured block table
  element.replaceWith(block);
}
