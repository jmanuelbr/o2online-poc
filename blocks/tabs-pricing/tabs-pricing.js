// eslint-disable-next-line import/no-unresolved
import { toClassName } from '../../scripts/aem.js';

/** Tab icon SVG URLs keyed by service name */
const TAB_ICONS = {
  fibra: 'https://dlvt1u0vrr0ux.cloudfront.net/media/public/icon-router.svg',
  movil: 'https://dlvt1u0vrr0ux.cloudfront.net/media/public/iconmovil.svg',
  tv: 'https://dlvt1u0vrr0ux.cloudfront.net/media/public/icon-tv.svg',
};

/**
 * Determines which icons to display for a tab based on its label text.
 * @param {string} label The tab label
 * @returns {string[]} Array of icon URLs
 */
function getTabIcons(label) {
  const text = label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const icons = [];
  if (text.includes('fibra')) icons.push(TAB_ICONS.fibra);
  if (text.includes('movil')) icons.push(TAB_ICONS.movil);
  if (text.includes('tv')) icons.push(TAB_ICONS.tv);
  return icons;
}

/** Logo URLs for entertainment providers */
const LOGO_MAP = {
  'movistar+': {
    src: 'https://dlvt1u0vrr0ux.cloudfront.net/media/public/icon-round-tarifa-mplus.png',
    alt: 'Movistar+',
  },
  netflix: {
    src: 'https://dlvt1u0vrr0ux.cloudfront.net/media/public/icon-round-tarifa-netflix.png',
    alt: 'Netflix',
  },
};

/**
 * Transforms the entertainment text paragraph into a label + logo images.
 * e.g. "Entretenimiento: Movistar+ y Netflix" → label + two 40px round images
 * @param {HTMLElement} p The paragraph element
 */
function decorateEntertainment(p) {
  const text = p.textContent.trim();
  if (!text.toLowerCase().includes('entretenimiento')) return;

  p.classList.add('tabs-pricing-entertainment');
  const label = document.createElement('p');
  label.className = 'tabs-pricing-entertainment-label';
  label.textContent = 'Entretenimiento';

  const logos = document.createElement('div');
  logos.className = 'tabs-pricing-logos';

  Object.entries(LOGO_MAP).forEach(([key, { src, alt }]) => {
    if (text.toLowerCase().includes(key)) {
      const img = document.createElement('img');
      img.src = src;
      img.alt = alt;
      img.width = 40;
      img.height = 40;
      img.loading = 'lazy';
      logos.append(img);
    }
  });

  p.replaceWith(label, logos);
}

/**
 * Restructures the price paragraph so the euro amount is large
 * and "/mes precio final" is small.
 * Input:  <strong>38€/mes</strong> precio final
 * Output: <span class="price-value">38€</span><span class="price-detail">/mes precio final</span>
 * @param {HTMLElement} p The price paragraph element
 */
function decoratePrice(p) {
  const fullText = p.textContent.trim();
  const match = fullText.match(/^(\d+€)\/?(.*)$/);
  if (!match) return;

  const [, amount, rest] = match;
  p.textContent = '';

  const valueSpan = document.createElement('span');
  valueSpan.className = 'tabs-pricing-price-value';
  valueSpan.textContent = amount;

  const detailSpan = document.createElement('span');
  detailSpan.className = 'tabs-pricing-price-detail';
  detailSpan.innerHTML = `<strong>/mes</strong> ${rest.replace(/^mes\s*/, '')}`.trim();

  p.append(valueSpan, detailSpan);
}

/**
 * Splits flat panel content (separated by <hr>) into individual card divs.
 * Each card gets HR separators, logo images, and restructured prices.
 * @param {HTMLElement} panel The tab panel element
 */
function buildCards(panel) {
  const contentDiv = panel.querySelector(':scope > div');
  if (!contentDiv) return;

  const children = [...contentDiv.children];
  const cardsContainer = document.createElement('div');
  cardsContainer.className = 'tabs-pricing-cards';

  let currentCard = document.createElement('div');
  currentCard.className = 'tabs-pricing-card';

  children.forEach((child) => {
    if (child.tagName === 'HR') {
      if (currentCard.children.length > 0) {
        cardsContainer.append(currentCard);
        currentCard = document.createElement('div');
        currentCard.className = 'tabs-pricing-card';
      }
    } else {
      const strong = child.querySelector(':scope > strong');
      const link = child.querySelector('a');

      if (child.tagName === 'P' && strong && !link && child.childNodes.length === 1) {
        const text = strong.textContent;
        if (text.includes('€')) {
          child.classList.add('tabs-pricing-price');
        } else if (currentCard.children.length === 0) {
          child.classList.add('tabs-pricing-title');
        }
      } else if (child.tagName === 'P' && link) {
        child.classList.add('tabs-pricing-cta');
      } else if (child.tagName === 'P' && child.textContent.includes('€')) {
        child.classList.add('tabs-pricing-price');
      }

      currentCard.append(child);
    }
  });

  if (currentCard.children.length > 0) {
    cardsContainer.append(currentCard);
  }

  // Post-process each card: add separators, logos, price formatting
  cardsContainer.querySelectorAll('.tabs-pricing-card').forEach((card) => {
    const title = card.querySelector('.tabs-pricing-title');
    const price = card.querySelector('.tabs-pricing-price');

    // Insert HR after title
    if (title && title.nextElementSibling) {
      title.after(document.createElement('hr'));
    }

    // Insert HR before price
    if (price) {
      price.before(document.createElement('hr'));
      decoratePrice(price);
    }

    // Replace entertainment text with logos
    [...card.querySelectorAll('p')].forEach((p) => {
      if (!p.className && p.textContent.toLowerCase().includes('entretenimiento')) {
        decorateEntertainment(p);
      }
    });
  });

  contentDiv.replaceWith(cardsContainer);
}

/** Image URL for the decorative banner illustration */
const BANNER_IMAGE = 'https://dlvt1u0vrr0ux.cloudfront.net/media/public/foto-lma-faldon.png';

/**
 * Transforms the "Añade líneas adicionales" link into a pill-shaped banner
 * matching the original O2 design: white pill, split text, decorative image.
 * @param {HTMLElement} block The block element (used to find the parent section)
 */
function decorateBanner(block) {
  const section = block.closest('.section');
  if (!section) return;

  const wrapper = section.querySelector(':scope > .default-content-wrapper:last-child');
  if (!wrapper) return;

  const link = wrapper.querySelector('a[href*="lineas-adicionales"]');
  if (!link) return;

  const fullText = link.textContent.trim();
  // Split at the colon: label "Añade líneas adicionales a tu tarifa" + prices "40GB 5€ …"
  const colonIdx = fullText.indexOf(':');
  const labelText = colonIdx > -1 ? fullText.substring(0, colonIdx).trim() : fullText;
  const pricesText = colonIdx > -1 ? fullText.substring(colonIdx + 1).trim() : '';

  // Build banner structure
  const banner = document.createElement('a');
  banner.className = 'tabs-pricing-banner';
  banner.href = link.href;
  banner.setAttribute('aria-label', labelText);

  const content = document.createElement('div');
  content.className = 'tabs-pricing-banner-content';

  const labelSpan = document.createElement('span');
  labelSpan.className = 'tabs-pricing-banner-label';
  labelSpan.textContent = labelText;
  content.append(labelSpan);

  if (pricesText) {
    const pricesSpan = document.createElement('span');
    pricesSpan.className = 'tabs-pricing-banner-prices';
    // Highlight price amounts (e.g. "5€") in a darker blue
    pricesSpan.innerHTML = pricesText.replace(
      /(\d+€)/g,
      '<span class="tabs-pricing-banner-price-amount">$1</span>',
    );
    content.append(pricesSpan);
  }

  banner.append(content);

  const img = document.createElement('img');
  img.className = 'tabs-pricing-banner-img';
  img.src = BANNER_IMAGE;
  img.alt = '';
  img.setAttribute('role', 'presentation');
  img.width = 104;
  img.height = 80;
  img.loading = 'lazy';
  banner.append(img);

  // Replace the original paragraph with the banner
  const paragraph = link.closest('p') || link.parentElement;
  paragraph.replaceWith(banner);
}

export default async function decorate(block) {
  // build tablist
  const tablist = document.createElement('div');
  tablist.className = 'tabs-pricing-list';
  tablist.setAttribute('role', 'tablist');

  // decorate tabs and tabpanels
  const tabs = [...block.children].map((child) => child.firstElementChild);
  tabs.forEach((tab, i) => {
    const id = toClassName(tab.textContent);

    // decorate tabpanel
    const tabpanel = block.children[i];
    tabpanel.className = 'tabs-pricing-panel';
    tabpanel.id = `tabpanel-${id}`;
    tabpanel.setAttribute('aria-hidden', !!i);
    tabpanel.setAttribute('aria-labelledby', `tab-${id}`);
    tabpanel.setAttribute('role', 'tabpanel');

    // build tab button
    const button = document.createElement('button');
    button.className = 'tabs-pricing-tab';
    button.id = `tab-${id}`;

    // Add service icons above the tab label
    const tabLabel = tab.textContent.trim();
    const icons = getTabIcons(tabLabel);
    if (icons.length) {
      const iconsRow = document.createElement('span');
      iconsRow.className = 'tabs-pricing-tab-icons';
      icons.forEach((src) => {
        const img = document.createElement('img');
        img.src = src;
        img.alt = '';
        img.width = 24;
        img.height = 24;
        img.loading = 'eager';
        iconsRow.append(img);
      });
      button.append(iconsRow);
    }

    const labelSpan = document.createElement('span');
    labelSpan.className = 'tabs-pricing-tab-label';
    labelSpan.textContent = tabLabel;

    button.append(labelSpan);

    button.setAttribute('aria-controls', `tabpanel-${id}`);
    button.setAttribute('aria-selected', !i);
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');
    button.addEventListener('click', () => {
      block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
        panel.setAttribute('aria-hidden', true);
      });
      tablist.querySelectorAll('button').forEach((btn) => {
        btn.setAttribute('aria-selected', false);
      });
      tabpanel.setAttribute('aria-hidden', false);
      button.setAttribute('aria-selected', true);
    });
    tablist.append(button);
    tab.remove();

    // Build card structure from HR-separated content
    buildCards(tabpanel);
  });

  block.prepend(tablist);

  // Decorate the "additional lines" banner below the pricing cards
  decorateBanner(block);
}
