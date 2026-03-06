import { createOptimizedPicture } from '../../scripts/aem.js';

/** Gradient background images for light-themed cards */
const GRADIENT_BACKGROUNDS = {
  'dispositivos-moviles': 'https://dlvt1u0vrr0ux.cloudfront.net/media/public/gradient-dispos.jpg',
  'oferta-esimflag': 'https://dlvt1u0vrr0ux.cloudfront.net/media/public/gradient-esim.svg',
};

/**
 * Detect card theme (dark / light / image) from its link URL.
 * - "light" cards have gradient backgrounds with dark text (Samsung, eSIM)
 * - "image" cards use the card picture as a full background (Goya)
 * - "dark" cards have solid black backgrounds with white text (default)
 * @param {string} href Card link URL
 * @returns {{ theme: string, variant: string }} Theme and variant identifiers
 */
function detectCardStyle(href) {
  if (href.includes('movistar-plus')) return { theme: 'image', variant: 'goya' };
  if (href.includes('dispositivos-moviles')) return { theme: 'light', variant: 'samsung' };
  if (href.includes('oferta-esimflag')) return { theme: 'light', variant: 'esim' };
  return { theme: 'dark', variant: 'laliga' };
}

/**
 * Apply per-card theming: backgrounds, data attributes, and text reordering.
 * @param {HTMLElement} li The card list item
 */
function applyCardTheme(li) {
  const link = li.querySelector('.cards-promo-card-link');
  if (!link) return;

  const { theme, variant } = detectCardStyle(link.href);
  li.dataset.theme = theme;
  li.dataset.variant = variant;

  if (theme === 'light') {
    // Apply gradient background from URL pattern
    const bgEntry = Object.entries(GRADIENT_BACKGROUNDS)
      .find(([pattern]) => link.href.includes(pattern));
    if (bgEntry) {
      li.style.backgroundImage = `url('${bgEntry[1]}')`;
      li.style.backgroundSize = 'cover';
    }
  } else if (theme === 'image') {
    // Use the card image as the full card background
    const imgEl = li.querySelector('.cards-promo-card-image img');
    if (imgEl) {
      li.style.backgroundImage = `url('${imgEl.src}')`;
      li.style.backgroundSize = 'cover';
      li.querySelector('.cards-promo-card-image')?.remove();
    }
  }
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-promo-card-image';
      } else {
        div.className = 'cards-promo-card-body';
      }
    });

    // Wrap entire card in a link if a link exists in the body
    const bodyLink = li.querySelector('.cards-promo-card-body a');
    if (bodyLink) {
      const a = document.createElement('a');
      a.href = bodyLink.href;
      a.className = 'cards-promo-card-link';

      // Replace inner <a> with a <span> to avoid nested links, keep text visible
      const span = document.createElement('span');
      span.className = 'cards-promo-card-cta';
      span.textContent = bodyLink.textContent;
      bodyLink.replaceWith(span);

      // Move all children into the anchor
      while (li.firstChild) a.append(li.firstChild);
      li.append(a);
    }

    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });

  // Apply per-card theming after all cards are built
  ul.querySelectorAll('li').forEach((li) => applyCardTheme(li));

  block.textContent = '';
  block.append(ul);
}
