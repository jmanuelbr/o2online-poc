export default function decorate(block) {
  const picture = block.querySelector('picture');

  if (!picture) {
    block.classList.add('no-image');
    return;
  }

  // Extract image URL and set as CSS background-image
  const img = picture.querySelector('img');
  if (img) {
    block.style.backgroundImage = `url('${img.src}')`;
  }

  // Remove picture element — image is now a CSS background
  picture.remove();

  // Collect remaining content (headings, paragraphs, buttons)
  const content = document.createElement('div');
  content.className = 'hero-o2-content';

  block.querySelectorAll('h1, h2, h3, h4, h5, h6, p, .button-wrapper').forEach((el) => {
    content.append(el);
  });

  // Clear leftover row divs
  while (block.firstChild) block.firstChild.remove();

  // Rebuild: content overlay only (image is CSS background)
  block.append(content);
}
