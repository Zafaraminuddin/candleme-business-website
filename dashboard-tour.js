(() => {
  const tour = document.getElementById('dashboard-tour');
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
})();
