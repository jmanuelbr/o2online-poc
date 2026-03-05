import { createOptimizedPicture } from '../../scripts/aem.js';

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

  block.textContent = '';
  block.append(ul);
}
