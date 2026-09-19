(() => {
  const tour = document.getElementById('dashboard-tour');
  if (!tour) return;
  const tabs = [...tour.querySelectorAll('[role="tab"]')];
  const panels = [...tour.querySelectorAll('[role="tabpanel"]')];
  const select = tab => {
    tabs.forEach(t => {
      const active = t === tab;
      t.setAttribute('aria-selected', String(active));
      t.tabIndex = active ? 0 : -1;
    });
    panels.forEach(p => { p.hidden = p.id !== tab.getAttribute('aria-controls'); });
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', event => {
      const target = {ArrowRight: (i + 1) % tabs.length, ArrowLeft: (i - 1 + tabs.length) % tabs.length, Home: 0, End: tabs.length - 1}[event.key];
      if (target === undefined) return;
      event.preventDefault();
      select(tabs[target]);
      tabs[target].focus({preventScroll: true});
      tabs[target].scrollIntoView({block: 'nearest', inline: 'nearest'});
    });
  });
  const requestedPanel = panels.find(panel => '#' + panel.id === location.hash);
  if (requestedPanel) select(tabs.find(tab => tab.getAttribute('aria-controls') === requestedPanel.id));
  const viewer = document.getElementById('dashboard-viewer');
  const image = document.getElementById('dashboard-viewer-image');
  const stage = viewer.querySelector('.tour-viewer-stage');
  const zoom = document.getElementById('dashboard-viewer-zoom');
  let opener, previousOverflow;
  tour.querySelectorAll('.tour-screenshot').forEach(button => {
    button.addEventListener('click', () => {
      opener = button;
      const source = button.querySelector('img');
      image.src = source.src;
      image.alt = source.alt;
      document.getElementById('dashboard-viewer-title').textContent = button.dataset.title;
      viewer.classList.remove('is-zoomed');
      zoom.textContent = 'Actual size';
      zoom.setAttribute('aria-pressed', 'false');
      previousOverflow = document.body.style.overflow;
      viewer.showModal();
      document.body.style.overflow = 'hidden';
      stage.scrollTop = stage.scrollLeft = 0;
    });
  });
  document.getElementById('dashboard-viewer-close').addEventListener('click', () => viewer.close());
  viewer.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow;
    opener?.focus({preventScroll: true});
  });
  zoom.addEventListener('click', () => {
    const active = viewer.classList.toggle('is-zoomed');
    zoom.textContent = active ? 'Fit width' : 'Actual size';
    zoom.setAttribute('aria-pressed', String(active));
  });

  // One player for the whole tour. Video bytes load only after a user asks.
  const videoDialog = document.getElementById('tour-video-dialog');
  const player = document.getElementById('tour-video-player');
  const caption = document.getElementById('tour-video-caption');
  const nativeTrack = document.getElementById('tour-video-track');
  const videoError = document.getElementById('tour-video-error');
  const captions = {
    'tour-01-overview.mp4': [
      [0, 3.75, 'Here’s your business, together in one dashboard.'],
      [3.75, 7.5, 'See how people view, save, and return.'],
      [7.5, 11.25, 'Check who has joined your team.'],
      [11.25, 15.5, 'And see where your attention is needed.']
    ],
    'tour-02-organization.mp4': [
      [0, 3.75, 'Make your CandleMe account feel like your business.'],
      [3.75, 7.5, 'Add your name and logo.'],
      [7.5, 11.25, 'Keep your website and contact details together.'],
      [11.25, 15.5, 'Then choose who can create your Candles.']
    ],
    'tour-03-pathways.mp4': [
      [0, 3.75, 'Choose where your Candle takes your customers.'],
      [3.75, 7.5, 'Booking, products, and contact details stay within reach.'],
      [7.5, 11.25, 'Give each destination the right link.'],
      [11.25, 15.5, 'You control what appears inside.']
    ],
    'tour-05-employees.mp4': [
      [0, 3, 'See who has joined your team.'],
      [3, 7, 'Your employee accounts are together in one place.'],
      [7, 11.5, 'Review roles, status, and Candle assignments.'],
      [11.5, 15.5, 'Compare with your list to spot anyone missing.']
    ],
    'tour-04-network.mp4': [
      [0, 3.75, 'Keep your organization’s Candles together in one place.'],
      [3.75, 7.5, 'See how they connect across your business.'],
      [7.5, 11.25, 'Search for the Candle you need.'],
      [11.25, 15.5, 'Then review its activity and current status.']
    ],
    'tour-06-birds-eye.mp4': [
      [0, 3.75, 'See how your Candles are organized.'],
      [3.75, 7.5, 'Search by name, unit type, or status.'],
      [7.5, 11.25, 'Review the structure in one clear view.'],
      [11.25, 15.5, 'Then open any listed Candle for a closer look.']
    ],
    'tour-07-activity.mp4': [
      [0, 3.75, 'Choose the period you want to review.'],
      [3.75, 7.5, 'See how people arrived at your Candles.'],
      [7.5, 11.25, 'Compare activity across locations and employee channels.'],
      [11.25, 15.5, 'Then export the report to review with your team.']
    ],
    'tour-08-geography.mp4': [
      [0, 3.75, 'See where your Candles are reaching people.'],
      [3.75, 7.5, 'Use the map to explore its geographic spread.'],
      [7.5, 11.25, 'Look through the places it has reached.'],
      [11.25, 15.5, 'And follow sharing across each new generation.']
    ],
    'tour-09-telemetry.mp4': [
      [0, 3.75, 'See what happens after a Candle is shared.'],
      [3.75, 7.5, 'Follow saves, shares, and return visits.'],
      [7.5, 11.25, 'Choose the activity you want to review.'],
      [11.25, 15.5, 'Then explore feedback on what people find useful.']
    ],
    'tour-10-billing.mp4': [
      [0, 3.75, 'Keep your subscription details together in one place.'],
      [3.75, 7.5, 'Review the locations included in your account.'],
      [7.5, 11.25, 'Check your plan and account history.'],
      [11.25, 15.5, 'This demo shows test amounts, not a pricing quote.']
    ],
    'tour-11-api-access.mp4': [
      [0, 3.75, 'Connect CandleMe with the tools you already use.'],
      [3.75, 7.5, 'Create a personalized link for each recipient.'],
      [7.5, 11.25, 'Choose which details your systems can pass.'],
      [11.25, 15.5, 'Then follow your campaign’s progress here.']
    ]
  };
  let videoOpener, videoOverflow, activeCaptions = [];
  const videoName = path => path.split('/').pop().split('?')[0];
  let iosFullscreen = false;
  const isNativeFullscreen = () => iosFullscreen || document.fullscreenElement === player || document.webkitFullscreenElement === player;
  const setNativeCaptionMode = showing => {
    if (player.textTracks[0]) player.textTracks[0].mode = showing ? 'showing' : 'hidden';
    if (showing) caption.hidden = true;
    else updateCaption();
  };
  const updateCaption = () => {
    const cue = activeCaptions.find(([start, end]) => player.currentTime >= start && player.currentTime < end);
    caption.textContent = cue ? cue[2] : '';
    caption.hidden = !cue || isNativeFullscreen();
  };
  const playVideo = () => player.play().catch(() => {
    // Native Play remains available if the browser declines automatic playback.
    if (player.error) videoError.hidden = false;
  });
  tour.querySelectorAll('.tour-watch').forEach(button => {
    button.addEventListener('click', () => {
      videoOpener = button;
      videoOverflow = document.body.style.overflow;
      videoError.hidden = true;
      document.getElementById('tour-video-title').textContent = button.dataset.title;
      player.setAttribute('aria-label', button.dataset.title + ': silent walkthrough');
      activeCaptions = captions[videoName(button.dataset.video)] || [];
      nativeTrack.src = 'captions/' + videoName(button.dataset.video).replace('.mp4', '.vtt');
      player.src = button.dataset.video;
      document.getElementById('tour-video-download').href = button.dataset.video;
      videoDialog.showModal();
      document.body.style.overflow = 'hidden';
      updateCaption();
      playVideo();
    });
  });
  player.addEventListener('error', () => {
    if (videoDialog.open) videoError.hidden = false;
  });
  player.addEventListener('timeupdate', updateCaption);
  player.addEventListener('seeked', updateCaption);
  player.addEventListener('loadedmetadata', updateCaption);
  nativeTrack.addEventListener('load', () => setNativeCaptionMode(isNativeFullscreen()));
  document.addEventListener('fullscreenchange', () => setNativeCaptionMode(isNativeFullscreen()));
  document.addEventListener('webkitfullscreenchange', () => setNativeCaptionMode(isNativeFullscreen()));
  player.addEventListener('webkitbeginfullscreen', () => { iosFullscreen = true; setNativeCaptionMode(true); });
  player.addEventListener('webkitendfullscreen', () => { iosFullscreen = false; setNativeCaptionMode(false); });
  document.getElementById('tour-video-replay').addEventListener('click', () => {
    player.currentTime = 0;
    playVideo();
  });
  document.getElementById('tour-video-close').addEventListener('click', () => videoDialog.close());
  videoDialog.addEventListener('close', () => {
    player.pause();
    player.removeAttribute('src');
    nativeTrack.removeAttribute('src');
    player.load();
    activeCaptions = [];
    caption.textContent = '';
    caption.hidden = true;
    document.body.style.overflow = videoOverflow;
    videoOpener?.focus({preventScroll: true});
  });
})();
