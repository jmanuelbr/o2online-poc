import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // Group h5 headings + following content into column divs for flex layout
  const linksSection = footer.querySelector('.section:first-child .default-content-wrapper');
  if (linksSection) {
    const children = [...linksSection.children];
    if (children.some((c) => c.tagName === 'H5')) {
      const colDivs = [];
      let currentCol = null;

      children.forEach((child) => {
        if (child.tagName === 'H5') {
          currentCol = document.createElement('div');
          currentCol.className = 'footer-col';
          colDivs.push(currentCol);
        }
        if (currentCol) currentCol.append(child);
      });

      linksSection.textContent = '';
      colDivs.forEach((col) => linksSection.append(col));
    }
  }

  // Add copyright text to the last section
  const sections = footer.querySelectorAll('.section');
  const lastSection = sections[sections.length - 1];
  if (lastSection) {
    const wrapper = lastSection.querySelector('.default-content-wrapper');
    if (wrapper) {
      const copyrightP = document.createElement('p');
      copyrightP.className = 'footer-copyright';
      copyrightP.textContent = '\u00A9 O2 Espa\u00F1a 2026';
      wrapper.prepend(copyrightP);
    }
  }

  block.append(footer);
}
