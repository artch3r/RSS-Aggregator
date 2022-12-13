const render = (state, elements, i18next) => (path, value) => {
  console.log(state);
  if (path === 'rssForm.state') {
    switch (value) {
      case 'invalid':
        elements.urlInput.classList.add('is-invalid');
        elements.feedback.classList.remove('text-success');
        elements.feedback.classList.add('text-danger');
        break;
      case 'added':
        elements.urlInput.classList.remove('is-invalid');
        elements.feedback.classList.remove('text-danger');
        elements.feedback.classList.add('text-success');
        elements.form.reset();
        elements.urlInput.focus();
        break;
      default:
        break;
    }
  }

  if (path === 'rssForm.error') {
    // eslint-disable-next-line no-param-reassign
    elements.feedback.textContent = i18next.t(`errors.${state.rssForm.error}`);
  }
};

export default render;
