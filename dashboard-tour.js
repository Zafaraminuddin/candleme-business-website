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
  const videoError = document.getElementById('tour-video-error');
  let videoOpener, videoOverflow;
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
      player.src = button.dataset.video;
      document.getElementById('tour-video-download').href = button.dataset.video;
      videoDialog.showModal();
      document.body.style.overflow = 'hidden';
      playVideo();
    });
  });
  player.addEventListener('error', () => {
    if (videoDialog.open) videoError.hidden = false;
  });
  document.getElementById('tour-video-replay').addEventListener('click', () => {
    player.currentTime = 0;
    playVideo();
  });
  document.getElementById('tour-video-close').addEventListener('click', () => videoDialog.close());
  videoDialog.addEventListener('close', () => {
    player.pause();
    player.removeAttribute('src');
    player.load();
    document.body.style.overflow = videoOverflow;
    videoOpener?.focus({preventScroll: true});
  });
})();
