import { setLibs, getLibs } from '../../scripts/devblog/devblog.js';
import { SITE } from '../../scripts/devblog/devblog.js';

setLibs(SITE.prodLibsPath);

const miloBlock = await import(`${getLibs()}/blocks/author-header/author-header.js`);
const { loadStyle, createTag } = await import(`${getLibs()}/utils/utils.js`);

export default async function init(blockEl) {
  await miloBlock.default(blockEl);

  blockEl.classList.add('author-header');

  loadStyle(`${getLibs()}/blocks/author-header/author-header.css`);
  loadStyle('/blocks/author-header/author-header.css');

  const section = blockEl.closest('.section');
  const socialBlock = section?.querySelector('.more-information');

  if (!socialBlock) return;

  const items = socialBlock.querySelectorAll(':scope > div');

  let headingText = '';
  const className = socialBlock.className;
  headingText = className.split(' ')[0].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const heading = createTag('h3', { class: 'author-more-title' }, headingText);

  const ul = createTag('ul', { class: 'author-more-list' });

  let isAdobeEmployee = false;

  items.forEach((item) => {
    const label = item.children[0]?.textContent?.trim();
    const valueText = item.children[1]?.textContent?.trim()?.toLowerCase();

    if (label?.toLowerCase() === 'isadobeemployee') {
      if (valueText === 'true') {
        isAdobeEmployee = true;
      }
      return;
    }

    const linkEl = item.querySelector('a') || item.querySelector('.embed-twitter a');
    if (!linkEl?.href || !label) return;

    const li = createTag('li', { class: 'author-more-item' });
    li.append(createTag('a', { href: linkEl.href, target: '_blank', rel: 'noopener', class: 'author-more-link' }, label));
    ul.append(li);
  });


  // adding badge

  if (isAdobeEmployee) {
    const title = blockEl.querySelector('.author-header-title');

    if (title) {
      const badge = createTag('span', { class: 'author-name-badge' });
      const textLogo = createTag('img', { class: 'author-name-badge-text-logo', src: '/img/icons/adobe-badge.svg', alt: 'Adobe' });
      badge.append(textLogo);
      title.append(badge);
    }
  }

  const wrapper = createTag('div', { class: 'author-more-info' });
  wrapper.append(heading, ul);
  blockEl.append(wrapper);
  socialBlock.remove();
}