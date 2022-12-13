import './styles.scss';
import 'bootstrap';
import i18next from 'i18next';
import app from './app.js';
import resources from './locales/index.js';

const runApp = () => {
  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    debug: false,
    resources,
  })
    .then(() => {
      app(i18nextInstance);
    });
};

runApp();
