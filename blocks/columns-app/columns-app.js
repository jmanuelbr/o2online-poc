export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-app-${cols.length}-cols`);

  // setup image columns & group badge links
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          picWrapper.classList.add('columns-app-img-col');
        }
      }

      // Wrap consecutive badge-link paragraphs in a flex container
      const badgeParagraphs = [...col.querySelectorAll(':scope > p > a > picture, :scope > p > a > img')].map(
        (el) => el.closest('p'),
      );
      if (badgeParagraphs.length > 1) {
        const wrapper = document.createElement('div');
        wrapper.className = 'columns-app-badges';
        badgeParagraphs[0].before(wrapper);
        badgeParagraphs.forEach((p) => wrapper.append(p));
      }
    });
  });
}
