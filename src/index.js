import './styles.scss';
import 'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';
import render from './render.js';

const elements = {
  form: document.querySelector('.rss-form'),
  urlInput: document.querySelector('#url-input'),
  feedback: document.querySelector('.feedback'),
};

const state = {
  rssForm: {
    state: 'filling',
    message: '',
    error: '',
  },
  feeds: [],
};

const watchedState = onChange(state, render(state, elements));

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
      state.rssForm.message = 'RSS успешно загружен';
      watchedState.rssForm.state = 'added';
    })
    .catch((error) => {
      switch (error.type) {
        case 'url':
          state.rssForm.message = 'Ссылка должна быть валидным URL';
          break;
        case 'notOneOf':
          state.rssForm.message = 'RSS уже существует';
          break;
        default:
          break;
      }
      console.log(error.type);
      watchedState.rssForm.state = 'invalid';
    });
});
