/* eslint-disable no-param-reassign */
import * as yup from 'yup';
import onChange from 'on-change';
import axios from 'axios';
import { uniqueId } from 'lodash';
import render from './render.js';

const validate = (input, watchedState) => {
  yup.setLocale({
    string: {
      url: () => ({ key: 'notUrl' }),
    },
    mixed: {
      notOneOf: () => ({ key: 'alreadyInList' }),
    },
  });
  const strSchema = yup.string().url();
  const links = watchedState.feeds.map((feed) => feed.link);
  const uniqueSchema = yup.mixed().notOneOf(links);
  return strSchema.validate(input).then((url) => uniqueSchema.validate(url));
};

const getData = (url) => {
  const proxyUrl = new URL('/get', 'https://allorigins.hexlet.app');
  proxyUrl.searchParams.append('disableCache', 'true');
  proxyUrl.searchParams.append('url', url);
  return axios.get(proxyUrl).catch(() => {
    throw new Error('networkError');
  });
};

const parsePost = (post) => {
  const postLink = post.querySelector('link').textContent;
  const postTitle = post.querySelector('title').textContent;
  const postDescription = post.querySelector('description').textContent;
  const postDate = post.querySelector('pubDate').textContent;
  return {
    link: postLink,
    title: postTitle,
    description: postDescription,
    date: postDate,
  };
};

const parse = (rss, input) => {
  const parser = new DOMParser();
  const data = parser.parseFromString(rss, 'application/xml');
  try {
    const feedTitle = data.querySelector('title').textContent;
    const feedDescription = data.querySelector('description').textContent;
    const feed = {
      link: input,
      title: feedTitle,
      description: feedDescription,
    };
    const posts = [...data.querySelectorAll('item')].map(parsePost);
    return { feed, posts };
  } catch (e) {
    throw new Error('notRss');
  }
};

const addIds = (posts, feedId) => {
  posts.forEach((post) => {
    post.id = uniqueId();
    post.feedId = feedId;
  });
};

const handleData = (data, watchedState) => {
  const { feed, posts } = data;
  feed.id = uniqueId();
  watchedState.feeds.push(feed);
  addIds(posts, feed.id);
  watchedState.posts.push(...posts);
  watchedState.formState = 'added';
};

const updatePosts = (watchedState) => {
  watchedState.feeds.forEach((feed) => {
    getData(feed.link).then((response) => {
      const { posts } = parse(response.data.contents);
      const displayedPostsTitles = watchedState.posts.map((post) => post.title);
      const newPosts = posts.filter((post) => !displayedPostsTitles.includes(post.title));
      addIds(newPosts, feed.id);
      watchedState.posts.unshift(...newPosts);
    });
  });

  return setTimeout(updatePosts, 5000, watchedState);
};

const app = (i18next) => {
  const state = {
    formState: 'filling',
    error: '',
    feeds: [],
    posts: [],
    uiState: {
      displayedPost: null,
      viewedPostIds: new Set(),
    },
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
    modalHref: document.querySelector('.full-article'),
  };

  const watchedState = onChange(state, render(state, elements, i18next));

  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const input = formData.get('url');
    validate(input, watchedState)
      .then(() => {
        state.error = '';
        watchedState.formState = 'sending';
        return getData(input);
      })
      .then((response) => {
        const data = parse(response.data.contents, input);
        handleData(data, watchedState);
      })
      .catch((e) => {
        watchedState.formState = 'invalid';
        watchedState.error = e.message.key ?? e.message;
      });
  });

  elements.postsList.addEventListener('click', (event) => {
    const currentPost = watchedState.posts.find((post) => post.id === event.target.dataset.id);
    if (currentPost) {
      watchedState.uiState.viewedPostIds.add(currentPost.id);
      watchedState.uiState.displayedPost = currentPost;
    }
  });

  updatePosts(watchedState);
};

export default app;
