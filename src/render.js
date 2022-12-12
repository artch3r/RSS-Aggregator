const render = (state, elements) => (path, value) => {
  console.log(state);
  if (path === 'rssForm.state') {
    switch (value) {
      case 'invalid':
        elements.urlInput.classList.add('is-invalid');
        elements.feedback.classList.remove('text-success');
        elements.feedback.classList.add('text-danger');
        // eslint-disable-next-line no-param-reassign
        elements.feedback.textContent = state.rssForm.message;
        break;
      case 'added':
        elements.urlInput.classList.remove('is-invalid');
        elements.feedback.classList.remove('text-danger');
        elements.feedback.classList.add('text-success');
        // eslint-disable-next-line no-param-reassign
        elements.feedback.textContent = state.rssForm.message;
        elements.form.reset();
        elements.urlInput.focus();
        break;
      default:
        break;
    }
  }
};

export default render;
