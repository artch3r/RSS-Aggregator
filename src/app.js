import * as yup from 'yup';
import onChange from 'on-change';
import axios from 'axios';
import { uniqueId } from 'lodash';
import render from './render.js';

const state = {
  rssForm: {
    state: 'filling',
    error: '',
  },
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

const app = (i18next) => {
  const watchedState = onChange(state, render(state, elements, i18next));

  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const input = formData.get('url');
    validate(input)
      .then(() => {
        state.rssForm.error = '';
        watchedState.rssForm.state = 'sending';
        return getData(input);
      })
      .then((response) => {
        const data = parse(response.data.contents);
        try {
          const feedTitle = data.querySelector('title').textContent;
          const feedDescription = data.querySelector('description').textContent;
          const feedId = uniqueId();
          state.feeds.push({
            link: input,
            title: feedTitle,
            description: feedDescription,
            id: feedId,
          });

          const posts = data.querySelectorAll('item');
          posts.forEach((post) => {
            const postLink = post.querySelector('link').textContent;
            const postTitle = post.querySelector('title').textContent;
            const postDescription = post.querySelector('description').textContent;
            const postDate = post.querySelector('pubDate').textContent;
            state.posts.push({
              link: postLink,
              title: postTitle,
              description: postDescription,
              date: postDate,
              id: uniqueId(),
              feedId,
            });
          });

          watchedState.rssForm.state = 'added';
        } catch (e) {
          watchedState.rssForm.state = 'invalid';
          watchedState.rssForm.error = 'Not RSS';
        }
      })
      .catch((e) => {
        watchedState.rssForm.state = 'invalid';
        watchedState.rssForm.error = e.message.key ?? e.message;
      });
  });
};

export default app;
