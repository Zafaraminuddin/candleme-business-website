(() => {
  'use strict';
  const form = document.getElementById('pilot-request');
  if (!form || !form.classList.contains('pilot-flow')) return;
  const $ = id => document.getElementById(id);
  const storageKey = 'candleme-pilot-request-v2';
  const requiredIds = ['business', 'email', 'name', 'website', 'totalLocations', 'pilotLocations'];
  const panels = [...form.querySelectorAll('[data-pilot-step]')];
  let step = 1, requestId = 'pilot-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
  let clearArmed = false, clearTimer, submitted = false;
  let storageAvailable = true;
  const endpoint = form.dataset.submissionEndpoint.trim();
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fields = [...form.querySelectorAll('input, select, textarea')];
  const selectedMethod = () => form.querySelector('[name="locationMethod"]:checked').value;
  const textValues = () => {
    const values = {};
    fields.forEach(field => {
      if (!field.name || field.type === 'file' || (field.type === 'radio' && !field.checked)) return;
      values[field.name] = field.value;
    });
    return values;
  };
  function persist() {
    try {
      localStorage.setItem(storageKey, JSON.stringify({...textValues(), _step: step, _requestId: requestId}));
      storageAvailable = true;
      $('pilotSaveStatus').textContent = 'Draft saved on this device. Nothing sent yet.';
    } catch (_) {
      storageAvailable = false;
      $('pilotSaveStatus').textContent = 'This browser can’t save your draft. Download your request before leaving.';
    }
    $('clearPilotDraft').hidden = !fields.some(field => field.type !== 'radio' && field.type !== 'file' && field.value.trim());
  }
  function restore() {
    try {
      const draft = JSON.parse(localStorage.getItem(storageKey) || '{}');
      if (!draft || typeof draft !== 'object' || Array.isArray(draft)) return;
      fields.forEach(field => {
        if (field.type === 'file' || typeof draft[field.name] !== 'string') return;
        if (field.type === 'radio') field.checked = field.value === draft[field.name];
        else field.value = draft[field.name];
      });
      if (typeof draft._requestId === 'string') requestId = draft._requestId;
      if ([1, 2, 3].includes(draft._step)) step = draft._step;
      if (draft.business || draft.email) {
        $('pilotSaveStatus').textContent = 'Your draft has been restored on this device. Nothing sent yet.';
        $('clearPilotDraft').hidden = false;
      }
    } catch (_) { storageAvailable = false; }
  }
  function selectMethod() {
    form.querySelectorAll('[data-location-panel]').forEach(panel => {
      panel.hidden = panel.dataset.locationPanel !== selectedMethod();
      panel.querySelectorAll('input,textarea').forEach(field => { field.disabled = panel.hidden; });
    });
  }
  function updatePhone() {
    const hasPhone = Boolean($('phone').value.trim());
    form.querySelector('.call-time-field').hidden = !hasPhone;
    $('bestCallTime').disabled = !hasPhone;
  }
  function normalizeWebsite(field) {
    let value = field.value.trim();
    if (value && !/^[a-z][a-z\d+.-]*:/i.test(value)) value = 'https://' + value;
    field.value = value;
  }
  function isWebsite(value) {
    try { const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(value) ? value : 'https://' + value); return /^https?:$/.test(url.protocol) && !!url.hostname && !url.username && !url.password; }
    catch (_) { return false; }
  }
  function setConstraints() {
    requiredIds.forEach(id => $(id).setCustomValidity(''));
    ['business', 'name'].forEach(id => { if ($(id).value && !$(id).value.trim()) $(id).setCustomValidity('Please enter ' + (id === 'business' ? 'your business name.' : 'your name.')); });
    if ($('website').value && !isWebsite($('website').value.trim())) $('website').setCustomValidity('Enter a business website beginning with https:// or http://.');
    const upper = {'1': 1, '2 to 5': 5, '6 to 20': 20, '21 to 50': 50, '51 to 200': 200}[$('totalLocations').value];
    if (upper && Number($('pilotLocations').value) > upper) $('pilotLocations').setCustomValidity('Pilot locations cannot exceed your total business locations.');
  }
  function updateProgress() {
    setConstraints();
    const count = requiredIds.filter(id => {
      const field = $(id);
      return field.value.trim() && (id === 'website' ? isWebsite(field.value.trim()) : field.validity.valid);
    }).length;
    const percentage = Math.round(count / requiredIds.length * 100);
    $('pilotPercent').textContent = percentage + '%';
    $('pilotProgress').style.setProperty('--pilot-fill', percentage + '%');
    $('pilotProgress').setAttribute('aria-valuenow', String(percentage));
    $('pilotProgress').setAttribute('aria-valuetext', count + ' of 6 required details complete');
  }
  function showStep(next, focus = true) {
    step = next;
    panels.forEach(panel => { panel.hidden = Number(panel.dataset.pilotStep) !== step; });
    $('pilotOptionalSetup').hidden = step !== 3;
    $('pilotStepCaption').textContent = step === 3 ? 'Ready when you are' : 'Step ' + step + ' of 2';
    $('pilotProgressTitle').textContent = ['Your business', 'Your pilot', 'Ready to share'][step - 1];
    form.querySelectorAll('[data-pilot-marker]').forEach(marker => {
      const number = Number(marker.dataset.pilotMarker);
      if (number === step) marker.setAttribute('aria-current', 'step');
      else marker.removeAttribute('aria-current');
      marker.classList.toggle('is-complete', number < step);
    });
    $('pilotPersonalGreeting').textContent = $('business').value.trim() ? 'Let’s shape the pilot for ' + $('business').value.trim() + '. We’ll help with setup.' : 'Tell us a little about your pilot. We’ll help with setup.';
    if (step === 3) renderSummary();
    updateProgress();
    if (focus) {
      form.scrollIntoView({block: 'start', behavior: reduceMotion ? 'instant' : 'smooth'});
      $('pilot-heading-' + step).focus({preventScroll: true});
    }
  }
  function validate(ids) {
    ['website', 'locationsWebsite'].forEach(id => normalizeWebsite($(id)));
    setConstraints();
    const invalid = ids.map($).find(field => !field.validity.valid);
    if (!invalid) return true;
    const panel = invalid.closest('[data-pilot-step]');
    if (panel && Number(panel.dataset.pilotStep) !== step) showStep(Number(panel.dataset.pilotStep));
    const details = invalid.closest('details');
    if (details) details.open = true;
    invalid.focus(); invalid.reportValidity();
    return false;
  }
  function renderSummary() {
    const root = $('pilotReviewSummary'); root.replaceChildren();
    const entries = [['Business', $('business').value], ['Contact', $('name').value], ['Email', $('email').value], ['Website', $('website').value], ['Business locations', $('totalLocations').value], ['Pilot locations', $('pilotLocations').value]];
    entries.forEach(([label, value]) => {
      const item = document.createElement('div'), term = document.createElement('dt'), detail = document.createElement('dd');
      term.textContent = label; detail.textContent = value; item.append(term, detail); root.append(item);
    });
  }
  function getPlan() {
    if (typeof window.candlemePilotPlan !== 'function') return {};
    const plan = window.candlemePilotPlan();
    if (plan === null) {
      $('pilotOptionalSetup').hidden = false;
      document.querySelector('#destinations .planner-editor-disclosure').open = true;
      $('editor').scrollIntoView({block: 'center'});
      return null;
    }
    return plan;
  }
  function requestText(plan = {}, compact = false) {
    const v = textValues();
    const rows = ['CandleMe pilot request', 'Request reference: ' + requestId, '', 'Business: ' + v.business, 'Contact: ' + v.name, 'Email: ' + v.email, 'Website: ' + v.website, 'Total locations: ' + v.totalLocations, 'Pilot locations: ' + v.pilotLocations];
    if (v.phone.trim()) rows.push('Phone: ' + v.phone, 'Best time to call: ' + (v.bestCallTime || 'Not specified'));
    if (compact) { rows.push('', 'Full details are in my attached CandleMe pilot request.'); return rows.join('\n'); }
    if (v.notes.trim()) rows.push('', 'Additional information:', v.notes.trim());
    rows.push('', 'Pilot locations:');
    if (selectedMethod() === '1') rows.push($('locationFile').files.length ? 'Location file: ' + $('locationFile').files[0].name + ' (attach original separately when emailing)' : 'Location file to follow.');
    else if (selectedMethod() === '2') rows.push(v.locationsWebsite || 'Location-page link to follow.', v.includedLocations || 'Locations to confirm together.');
    else rows.push(v.locationsManual.trim() || 'Location details to follow.');
    const names = ['Keeper Door', 'Lightway', 'Gateway', 'Doorway'];
    if (plan.slots?.some(slot => slot.url)) {
      rows.push('', 'Optional destination plan:');
      plan.slots.forEach((slot, index) => { if (slot.url && plan.enabled?.[Math.floor(index / 3)]) rows.push(names[Math.floor(index / 3)] + ' / ' + (index % 3 + 1) + ': ' + slot.label + ' | ' + slot.url); });
    }
    rows.push('', 'Please follow up with me about this pilot.');
    return rows.join('\n');
  }
  function configureEmail(plan = {}) {
    const body = requestText(plan);
    const longRequest = encodeURIComponent(body).length > 1600;
    $('emailPilot').href = 'mailto:connect@candlemenow.com?subject=' + encodeURIComponent('Pilot request: ' + $('business').value.trim()) + '&body=' + encodeURIComponent(longRequest ? requestText(plan, true) : body);
    $('pilotDeliveryNote').textContent = longRequest ? 'Download your request and attach it to the email. Email opens your mail app with a short introduction; review it and press Send there.' : 'Email opens your mail app with your request prepared. Review it and press Send there. Nothing has been sent yet.';
    if ($('locationFile').files.length) $('pilotDeliveryNote').textContent += ' Attach your original location file to the email too.';
  }
  function prepareShare() {
    if (!validate(requiredIds)) return null;
    if (!$('locationsWebsite').disabled && $('locationsWebsite').value && !validate(['locationsWebsite'])) return null;
    const plan = getPlan();
    if (plan === null) return null;
    persist(); renderSummary(); if (!endpoint) configureEmail(plan);
    return plan;
  }
  restore(); selectMethod(); updatePhone();
  if (step > 1 && !requiredIds.slice(0, 2).every(id => $(id).value.trim() && $(id).validity.valid)) step = 1;
  if (step === 3 && !requiredIds.every(id => $(id).value.trim() && $(id).validity.valid)) step = 2;
  showStep(step, false);
  $('emailPilot').hidden = Boolean(endpoint);
  $('sendPilotOnline').hidden = !endpoint;
  if (endpoint) $('pilotDeliveryNote').textContent = 'Send your request securely, or download a copy for your records.';
  else configureEmail();
  fields.forEach(field => field.addEventListener('input', () => {
    if (submitted) { submitted = false; $('request-success').hidden = true; $('sendPilotOnline').disabled = false; $('sendPilotOnline').textContent = 'Send my request'; }
    if (field.id === 'phone') updatePhone();
    if (field.name === 'locationMethod') selectMethod();
    updateProgress(); persist();
    if (step === 3) { renderSummary(); if (!endpoint) configureEmail(); }
  }));
  ['website', 'locationsWebsite'].forEach(id => $(id).addEventListener('blur', () => { normalizeWebsite($(id)); updateProgress(); persist(); }));
  $('totalLocations').addEventListener('change', () => {
    if ($('totalLocations').value === '1' && !$('pilotLocations').value) $('pilotLocations').value = '1';
    updateProgress(); persist();
  });
  $('pilotContinue').addEventListener('click', () => { if (validate(['business', 'email'])) { showStep(2); persist(); } });
  form.querySelectorAll('[data-pilot-back]').forEach(button => button.addEventListener('click', () => { showStep(Number(button.dataset.pilotBack)); persist(); }));
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (step === 1) { $('pilotContinue').click(); return; }
    if (!validate(requiredIds)) return;
    showStep(3); persist(); if (!endpoint) configureEmail();
  });
  $('emailPilot').addEventListener('click', event => { if (prepareShare() === null) event.preventDefault(); });
  $('downloadPilot').addEventListener('click', () => {
    const plan = prepareShare(); if (plan === null) return;
    const blob = new Blob([requestText(plan)], {type: 'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob), link = document.createElement('a');
    link.href = url; link.download = 'CandleMe-Pilot-Request.txt'; document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    $('pilotSaveStatus').textContent = 'Download prepared. Keep this copy or attach it to your email. Nothing sent yet.';
  });
  $('sendPilotOnline').addEventListener('click', async () => {
    const plan = prepareShare(); if (plan === null || !endpoint) return;
    const button = $('sendPilotOnline'); button.disabled = true; button.textContent = 'Sending…';
    const data = new FormData(form); data.append('requestId', requestId); data.append('destinationPlan', JSON.stringify(plan));
    try {
      const response = await fetch(endpoint, {method: 'POST', body: data});
      if (!response.ok) throw new Error('Request not accepted');
      submitted = true; $('request-success').hidden = false; $('request-success').textContent = 'Your pilot request has been sent. We’ll follow up using the email you provided.';
      $('pilotSaveStatus').textContent = storageAvailable ? 'Sent. Your draft is also saved on this device.' : 'Sent. Download a copy for your records.';
      button.textContent = 'Request sent ✓';
    } catch (_) {
      $('request-success').hidden = false; $('request-success').textContent = 'We couldn’t confirm delivery. Your details are still here. Try again or email your request.';
      $('emailPilot').hidden = false; configureEmail(plan);
      button.disabled = false; button.textContent = 'Try sending again';
    }
  });
  $('clearPilotDraft').addEventListener('click', () => {
    if (!clearArmed) {
      clearArmed = true; $('clearPilotDraft').textContent = 'Confirm clear';
      clearTimer = setTimeout(() => { clearArmed = false; $('clearPilotDraft').textContent = 'Clear draft'; }, 5000); return;
    }
    clearTimeout(clearTimer); clearArmed = false;
    try { localStorage.removeItem(storageKey); } catch (_) {}
    form.reset(); requestId = 'pilot-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
    $('clearPilotDraft').textContent = 'Clear draft'; $('clearPilotDraft').hidden = true;
    $('request-success').hidden = true; submitted = false; $('sendPilotOnline').disabled = false; $('sendPilotOnline').textContent = 'Send my request';
    selectMethod(); updatePhone(); showStep(1);
    $('pilotSaveStatus').textContent = 'Draft cleared. Your optional destination plan is unchanged.';
  });
})();
