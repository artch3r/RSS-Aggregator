/* eslint-disable no-param-reassign */
const createList = (itemsType, state) => {
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

  switch (itemsType) {
    case 'feeds':
      cardTitle.textContent = 'Фиды';
      state.feeds.forEach((feed) => {
        const liEl = document.createElement('li');
        liEl.classList.add('list-group-item', 'border-0', 'border-end-0');
        const feedTitle = document.createElement('h3');
        feedTitle.textContent = feed.title;
        liEl.append(feedTitle);
        const pEl = document.createElement('p');
        pEl.classList.add('m-0', 'small', 'text-black-50');
        pEl.textContent = feed.description;
        liEl.append(pEl);
        list.prepend(liEl);
      });
      break;
    case 'posts':
      cardTitle.textContent = 'Посты';
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
        const buttonEl = document.createElement('button');
        buttonEl.setAttribute('type', 'button');
        buttonEl.setAttribute('data-id', post.id);
        buttonEl.setAttribute('data-bs-toggle', 'modal');
        buttonEl.setAttribute('data-bs-target', '#modal');
        buttonEl.classList.add('btn', 'btn-outline-primary', 'btn-sm');
        buttonEl.textContent = 'Просмотр';
        liEl.append(aEl);
        liEl.append(buttonEl);
        list.prepend(liEl);
      });
      break;
    default:
      break;
  }

  card.append(list);
  return card;
};

const render = (state, elements, i18next) => (path, value) => {
  if (path === 'formState') {
    switch (value) {
      case 'invalid':
        elements.submit.disabled = false;
        elements.urlInput.classList.add('is-invalid');
        elements.feedback.classList.remove('text-success');
        elements.feedback.classList.remove('text-warning');
        elements.feedback.classList.add('text-danger');
        break;
      case 'sending':
        elements.submit.disabled = true;
        elements.urlInput.classList.remove('is-invalid');
        elements.feedback.classList.remove('text-danger');
        elements.feedback.classList.remove('text-success');
        elements.feedback.classList.add('text-warning');
        elements.feedback.textContent = i18next.t('status.sending');
        break;
      case 'added': {
        elements.submit.disabled = false;
        elements.postsList.innerHTML = '';
        elements.feedsList.innerHTML = '';
        const feeds = createList('feeds', state);
        elements.feedsList.append(feeds);
        const posts = createList('posts', state);
        elements.postsList.append(posts);
        elements.urlInput.classList.remove('is-invalid');
        elements.feedback.classList.remove('text-danger');
        elements.feedback.classList.remove('text-warning');
        elements.feedback.classList.add('text-success');
        elements.feedback.textContent = i18next.t('status.success');
        elements.form.reset();
        elements.urlInput.focus();
        break;
      }
      default:
        break;
    }
  }

  if (path === 'error') {
    elements.feedback.classList.add('text-danger');
    elements.feedback.textContent = i18next.t(`errors.${state.error}`);
  }

  if (path === 'posts') {
    elements.postsList.innerHTML = '';
    const posts = createList('posts', state);
    elements.postsList.append(posts);
  }
};

export default render;
