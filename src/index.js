import './styles.scss';
import 'bootstrap';
import i18next from 'i18next';
import app from './app.js';
import resources from './locales/index.js';

const runApp = async () => {
  const i18nextInstance = i18next.createInstance();
  await i18nextInstance.init({
    lng: 'ru',
    debug: false,
    resources,
  });

  app(i18nextInstance);
};

runApp();
