/* eslint-disable no-param-reassign */
const createFeeds = (state) => {
  const feeds = [];
  state.feeds.forEach((feed) => {
    const liEl = document.createElement('li');
    liEl.classList.add('list-group-item', 'border-0', 'border-end-0');
    const feedTitle = document.createElement('h3');
    feedTitle.classList.add('h6', 'm-0');
    feedTitle.textContent = feed.title;
    liEl.append(feedTitle);
    const pEl = document.createElement('p');
    pEl.classList.add('m-0', 'small', 'text-black-50');
    pEl.textContent = feed.description;
    liEl.append(pEl);
    feeds.push(liEl);
  });
  return feeds;
};

const createButton = (post, elements) => {
  const buttonEl = document.createElement('button');
  buttonEl.setAttribute('type', 'button');
  buttonEl.setAttribute('data-id', post.id);
  buttonEl.setAttribute('data-bs-toggle', 'modal');
  buttonEl.setAttribute('data-bs-target', '#modal');
  buttonEl.classList.add('btn', 'btn-outline-primary', 'btn-sm');
  buttonEl.textContent = 'Просмотр';
  buttonEl.addEventListener('click', () => {
    elements.modalHeader.textContent = post.title;
    elements.modalBody.textContent = post.description;
  });
  return buttonEl;
};

const createPosts = (state, elements) => {
  const posts = [];
  state.posts.forEach((post) => {
    const liEl = document.createElement('li');
    liEl.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const aEl = document.createElement('a');
    aEl.setAttribute('href', post.link);
    aEl.setAttribute('data-id', post.id);
    aEl.setAttribute('target', '_blank');
    aEl.setAttribute('rel', 'noopener noreferrer');
    aEl.classList.add('fw-bold');
    aEl.textContent = post.title;
    const buttonEl = createButton(post, elements);
    liEl.append(aEl);
    liEl.append(buttonEl);
    posts.push(liEl);
  });
  return posts;
};

const createList = (itemsType, state, i18next, elements) => {
  const card = document.createElement('div');
  card.classList.add('card', 'border-0');
  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');
  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  const list = document.createElement('ul');
  list.classList.add('list-group', 'border-0', 'rounded-0');
  cardBody.append(cardTitle);
  card.append(cardBody);
  cardTitle.textContent = i18next.t(`items.${itemsType}`);
  switch (itemsType) {
    case 'feeds':
      list.append(...createFeeds(state));
      break;
    case 'posts':
      list.append(...createPosts(state, elements));
      break;
    default:
      break;
  }
  card.append(list);
  return card;
};

const renderInvalid = (elements) => {
  elements.submit.disabled = false;
  elements.urlInput.classList.add('is-invalid');
  elements.feedback.classList.remove('text-success');
  elements.feedback.classList.remove('text-warning');
  elements.feedback.classList.add('text-danger');
};

const renderSending = (elements, i18next) => {
  elements.submit.disabled = true;
  elements.urlInput.classList.remove('is-invalid');
  elements.feedback.classList.remove('text-danger');
  elements.feedback.classList.remove('text-success');
  elements.feedback.classList.add('text-warning');
  elements.feedback.textContent = i18next.t('status.sending');
};

const renderAdded = (state, elements, i18next) => {
  elements.submit.disabled = false;
  elements.urlInput.classList.remove('is-invalid');
  elements.feedback.classList.remove('text-danger');
  elements.feedback.classList.remove('text-warning');
  elements.feedback.classList.add('text-success');
  elements.feedback.textContent = i18next.t('status.success');
  elements.form.reset();
  elements.urlInput.focus();
};

const renderState = (state, elements, i18next, value) => {
  switch (value) {
    case 'invalid':
      renderInvalid(elements);
      break;
    case 'sending':
      renderSending(elements, i18next);
      break;
    case 'added': {
      renderAdded(state, elements, i18next);
      break;
    }
    default:
      break;
  }
};

const renderError = (state, elements, i18next) => {
  elements.feedback.classList.add('text-danger');
  elements.feedback.textContent = i18next.t(`errors.${state.error}`);
};

const renderFeeds = (state, elements, i18next) => {
  elements.feedsList.innerHTML = '';
  const feeds = createList('feeds', state, i18next);
  elements.feedsList.append(feeds);
};

const renderPosts = (state, elements, i18next) => {
  elements.postsList.innerHTML = '';
  const posts = createList('posts', state, i18next, elements);
  elements.postsList.append(posts);
};

const render = (state, elements, i18next) => (path, value) => {
  switch (path) {
    case 'formState':
      renderState(state, elements, i18next, value);
      break;
    case 'error':
      renderError(state, elements, i18next);
      break;
    case 'feeds':
      renderFeeds(state, elements, i18next);
      break;
    case 'posts':
      renderPosts(state, elements, i18next);
      break;
    default:
      break;
  }
};

export default render;
