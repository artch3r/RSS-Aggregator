import * as yup from 'yup';
import onChange from 'on-change';
import axios from 'axios';
import { uniqueId } from 'lodash';
import render from './render.js';

const state = {
  formState: 'filling',
  error: '',
  feeds: [],
  posts: [],
};

const elements = {
  form: document.querySelector('.rss-form'),
  urlInput: document.querySelector('#url-input'),
  submit: document.querySelector('[type="submit"]'),
  feedback: document.querySelector('.feedback'),
  postsList: document.querySelector('.posts'),
  feedsList: document.querySelector('.feeds'),
  modalHeader: document.querySelector('.modal-header'),
  modalBody: document.querySelector('.modal-body'),
};

const getData = (url) => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${url}`);

const parse = (data) => {
  const parser = new DOMParser();
  return parser.parseFromString(data, 'application/xml');
};

const validate = (input) => {
  yup.setLocale({
    string: {
      url: () => ({ key: 'Not URL' }),
    },
    mixed: {
      notOneOf: () => ({ key: 'Already in list' }),
    },
  });
  const strSchema = yup.string().url();
  const links = state.feeds.map((feed) => feed.link);
  const uniqueSchema = yup.mixed().notOneOf(links);
  return strSchema.validate(input).then((url) => uniqueSchema.validate(url));
};

const parsePost = (post, feedId) => {
  const postLink = post.querySelector('link').textContent;
  const postTitle = post.querySelector('title').textContent;
  const postDescription = post.querySelector('description').textContent;
  const postDate = post.querySelector('pubDate').textContent;
  return {
    link: postLink,
    title: postTitle,
    description: postDescription,
    date: postDate,
    id: uniqueId(),
    feedId,
  };
};

const updatePosts = (watchedState) => {
  state.feeds.forEach((feed) => {
    getData(feed.link).then((response) => {
      // eslint-disable-next-line no-param-reassign
      watchedState.error = '';
      const data = parse(response.data.contents);
      const posts = data.querySelectorAll('item');
      const displayedPostsTitles = state.posts.map((post) => post.title);
      const newPosts = [...posts].filter((post) => {
        const title = post.querySelector('title').textContent;
        return !displayedPostsTitles.includes(title);
      });
      newPosts.forEach((post) => {
        watchedState.posts.push(parsePost(post, feed.id));
      });
    })
      .catch((e) => {
        // eslint-disable-next-line no-param-reassign
        watchedState.error = e.message;
      });
  });

  return setTimeout(updatePosts, 5000, watchedState);
};

const handleData = (data, watchedState, input) => {
  const feedTitle = data.querySelector('title').textContent;
  const feedDescription = data.querySelector('description').textContent;
  const feedId = uniqueId();
  watchedState.feeds.push({
    link: input,
    title: feedTitle,
    description: feedDescription,
    id: feedId,
  });

  const posts = data.querySelectorAll('item');
  posts.forEach((post) => {
    watchedState.posts.push(parsePost(post, feedId));
  });
};

const app = (i18next) => {
  const watchedState = onChange(state, render(state, elements, i18next));

  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const input = formData.get('url');
    validate(input)
      .then(() => {
        state.error = '';
        watchedState.formState = 'sending';
        return getData(input);
      })
      .then((response) => {
        const data = parse(response.data.contents);
        try {
          handleData(data, watchedState, input);
          watchedState.formState = 'added';
        } catch (e) {
          watchedState.formState = 'invalid';
          watchedState.error = 'Not RSS';
        }
      })
      .catch((e) => {
        watchedState.formState = 'invalid';
        watchedState.error = e.message.key ?? e.message;
      });
  });

  updatePosts(watchedState);
};

export default app;
