(() => {
  const form = document.getElementById('pilot-request');
  if (!form) return;
  const storageKey = 'candleme-pilot-request-v2';
  const saveButton = document.getElementById('savePilot');
  const saveStatus = document.getElementById('pilotSaveStatus');
  const phone = document.getElementById('phone');
  const callTimeField = form.querySelector('.call-time-field');
  const callTime = document.getElementById('bestCallTime');
  const updateCallTime = () => {
    const hasPhone = Boolean(phone.value.trim());
    callTimeField.hidden = !hasPhone;
    callTime.disabled = !hasPhone;
    if (!hasPhone) callTime.value = '';
  };
  const saveDraft = () => {
    const draft = {};
    new FormData(form).forEach((value, key) => {
      if (typeof value === 'string') draft[key] = value;
    });
    localStorage.setItem(storageKey, JSON.stringify(draft));
    saveStatus.textContent = 'Saved on this device.';
  };
  const restoreDraft = () => {
    let draft;
    try { draft = JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch (_) { return; }
    Object.entries(draft).forEach(([name, value]) => {
      const fields = form.querySelectorAll(`[name="${CSS.escape(name)}"]`);
      fields.forEach(field => {
        if (field.type === 'file') return;
        if (field.type === 'radio') field.checked = field.value === value;
        else field.value = value;
      });
    });
  };
  restoreDraft();
  const selectMethod = () => {
    const method = form.querySelector('[name="locationMethod"]:checked').value;
    form.querySelectorAll('[data-location-panel]').forEach(panel => {
      panel.hidden = panel.dataset.locationPanel !== method;
      panel.querySelectorAll('input,textarea').forEach(input => { input.disabled = panel.hidden; });
    });
  };
  form.querySelectorAll('[name="locationMethod"]').forEach(input => input.addEventListener('change', selectMethod));
  selectMethod();
  updateCallTime();
  phone.addEventListener('input', updateCallTime);
  form.addEventListener('input', () => { saveStatus.textContent = 'Changes are being kept on this device.'; });
  saveButton.addEventListener('click', () => {
    if (!form.reportValidity()) return;
    saveDraft();
    document.getElementById('destinations').scrollIntoView({behavior:'smooth', block:'start'});
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    saveDraft();
    const endpoint = form.getAttribute('action');
    const success = document.getElementById('request-success');
    success.hidden = true;
    if (endpoint === '[FORM ENDPOINT]') {
      saveStatus.textContent = 'Saved on this device. Online sending will be connected before launch.';
      saveStatus.scrollIntoView({block:'center'});
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
