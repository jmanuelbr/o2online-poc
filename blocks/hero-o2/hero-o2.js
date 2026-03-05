export default function decorate(block) {
  const picture = block.querySelector('picture');

  if (!picture) {
    block.classList.add('no-image');
    return;
  }

  // Remove picture from row structure
  picture.remove();

  // Collect remaining content (headings, paragraphs, buttons)
  const content = document.createElement('div');
  content.className = 'hero-o2-content';

  block.querySelectorAll('h1, h2, h3, h4, h5, h6, p, .button-wrapper').forEach((el) => {
    content.append(el);
  });

  // Clear leftover row divs
  while (block.firstChild) block.firstChild.remove();

  // Rebuild: picture (absolute background) + content overlay
  block.append(picture);
  block.append(content);
}
