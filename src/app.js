import * as yup from 'yup';
import onChange from 'on-change';
import render from './render.js';

const app = (i18next) => {
  const elements = {
    form: document.querySelector('.rss-form'),
    urlInput: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
  };

  const state = {
    rssForm: {
      state: 'filling',
      error: '',
    },
    feeds: [],
  };

  const watchedState = onChange(state, render(state, elements, i18next));

  const strSchema = yup.string().url();

  const validate = (input) => {
    const uniqueSchema = yup.mixed().notOneOf(state.feeds);
    return strSchema.validate(input).then((url) => uniqueSchema.validate(url));
  };

  elements.form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const input = formData.get('url');
    validate(input)
      .then(() => {
        state.feeds.push(input);
        watchedState.rssForm.error = '';
        watchedState.rssForm.state = 'added';
      })
      .catch((error) => {
        watchedState.rssForm.state = 'invalid';
        watchedState.rssForm.error = error.type;
      });
  });
};

export default app;
