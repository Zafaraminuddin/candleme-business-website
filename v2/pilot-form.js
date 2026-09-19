(() => {
  const form = document.getElementById('pilot-request');
  if (!form) return;
  const selectMethod = () => {
    const method = form.querySelector('[name="locationMethod"]:checked').value;
    form.querySelectorAll('[data-location-panel]').forEach(panel => {
      panel.hidden = panel.dataset.locationPanel !== method;
      panel.querySelectorAll('input,textarea').forEach(input => { input.disabled = panel.hidden; });
    });
  };
  form.querySelectorAll('[name="locationMethod"]').forEach(input => input.addEventListener('change', selectMethod));
  selectMethod();
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const endpoint = form.getAttribute('action');
    const success = document.getElementById('request-success');
    success.hidden = true;
    if (endpoint === '[FORM ENDPOINT]') {
      document.querySelector('[data-book-call]').click();
      return;
    }
    const button = form.querySelector('[type="submit"]');
    button.disabled = true;
    try {
      const response = await fetch(endpoint, {method:'POST', body:new FormData(form)});
      if (!response.ok) throw new Error('Submission failed');
      success.hidden = false;
      success.scrollIntoView({block:'center'});
    } catch (_) {
      // Retain all entered details and offer the configured call option.
      document.querySelector('[data-book-call]').click();
    } finally { button.disabled = false; }
  });
})();
