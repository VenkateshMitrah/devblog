export default async function decorate(block) {
  const DATA_URL              = '/scripts/author-validation/data/authors.json';
  const DEFAULT_FALLBACK_IMAGE = 'https://main--milo--adobecom.aem.live/libs/blocks/article-header/adobe-logo.svg';
  const AUTHOR_IMAGE_BASE      = '/images/authors/';

  const getAuthorImage = ({ docImage, image, slug }) =>
  docImage?.trim() || image?.trim() || `${AUTHOR_IMAGE_BASE}${slug}.png`;

  function badge(condition, type, label) {
    return condition ? `<span class="author-name-badge ${type}">${label}</span>` : '';
  }

  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error(`Failed to fetch authors.json: ${response.status}`);

    const authorsData = await response.json();
    const authors = authorsData
      .filter((a) => a.hasDoc)
      .sort((a, b) => a.name.localeCompare(b.name));

    if (!authors.length) {
      block.innerHTML = '<div class="authors-error"><p>No authors with individual profile pages found.</p></div>';
      return;
    }

    const container = document.createElement('div');
    container.className = 'authors-list-container';

    authors.forEach((author) => {
      const allLinksHtml = [
        author.linkedin
          ? `<a href="${author.linkedin}" target="_blank" rel="noopener noreferrer">LinkedIn</a>`
          : '<span class="missing">No LinkedIn</span>',
        ...(author.links || []).map(
          ({ url, label }) =>
            `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`
        ),
      ].join('');

      // Missing field warnings
      const missingFields = [
        !author.title    && 'Title',
        !author.linkedin && 'LinkedIn',
      ].filter(Boolean);

      const card = document.createElement('div');
      card.className = 'author-card';
      card.innerHTML = `
        <div class="author-card-image">
          <img src="${getAuthorImage(author)}"
               alt="${author.name}"
               loading="lazy"
               onerror="this.onerror=null;this.src='${DEFAULT_FALLBACK_IMAGE}';">
        </div>
        <div class="author-card-content">
          <h3 class="author-name">
            <a href="${author.profileUrl}" target="_blank" rel="noopener noreferrer">
              <span class="author-name-with-badges">
                <span>${author.name}</span>
                ${badge(String(author.isAdobeEmployee)     === 'true', 'adobe',    'Adobe')}
                ${badge(String(author.isDeveloperChampion) === 'true', 'champion', 'Champion')}
              </span>
            </a>
          </h3>
          <p class="author-title">
            ${author.title || '<span class="missing">Missing Title</span>'}
          </p>
          <div class="author-links">${allLinksHtml}</div>
          ${missingFields.length
            ? `<p class="missing-info">Missing: ${missingFields.join(', ')}</p>`
            : ''}
        </div>
      `;
      container.appendChild(card);
    });

    block.textContent = '';
    block.appendChild(container);

  } catch (error) {
    console.error('Error loading authors:', error);
    block.innerHTML = `
      <div class="authors-error">
        <p><strong>Unable to load author data.</strong></p>
        <p>${error.message}</p>
      </div>
    `;
  }
}