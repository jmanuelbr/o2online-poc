/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-value block
 *
 * Source: https://o2online.es/
 * Base Block: cards
 *
 * Block Structure (from cards markdown example):
 * - Row per card: [Image/Icon] | [Title + Description]
 *
 * Source HTML Pattern (from captured DOM):
 * <article class="bloque_cards">
 *   <div class="container">
 *     <div class="row">
 *       <div class="col-md-6 col-lg-3 mb-4"> or col-lg-4
 *         <div class="card">
 *           <img class="card-img-top" src="..." alt="">
 *           <div class="card-body">
 *             <h3 class="card-title">Title</h3>
 *             <p class="card-text">Description</p>
 *           </div>
 *         </div>
 *       </div>
 *     </div>
 *   </div>
 * </article>
 *
 * Used for both "Why Choose O2" (4 cards) and "Advantages" (6 cards) sections.
 *
 * Generated: 2026-03-04
 */
export default function parse(element, { document }) {
  // Extract card items - VALIDATED: source uses .card within column divs
  const cards = Array.from(element.querySelectorAll('.card'));

  // Build cells array - each row is [image, text content]
  const cells = [];

  cards.forEach((card) => {
    // Extract icon/image - VALIDATED: source uses img.card-img-top
    const img = card.querySelector('img.card-img-top') ||
                card.querySelector('img');

    // Extract title - VALIDATED: source uses h3.card-title
    const title = card.querySelector('.card-title') ||
                  card.querySelector('h3, h4');

    // Extract description - VALIDATED: source uses p.card-text
    const desc = card.querySelector('.card-text') ||
                 card.querySelector('.card-body p');

    // Build text cell
    const textCell = [];
    if (title) textCell.push(title);
    if (desc) textCell.push(desc);

    // Only add row if we have meaningful content
    if (img || textCell.length > 0) {
      cells.push([img || '', textCell.length > 0 ? textCell : '']);
    }
  });

  // Create block using WebImporter utility
  const block = WebImporter.Blocks.createBlock(document, { name: 'Cards-Value', cells });

  // Replace original element with structured block table
  element.replaceWith(block);
}
