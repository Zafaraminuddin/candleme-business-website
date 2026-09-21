(() => {
  const navigation = document.querySelector('.v2-nav');
  const navLinks = navigation?.querySelector('.v2-nav-links');
  if (navLinks) {
    const compactNavigation = window.matchMedia('(max-width: 1180px)');
    const toggle = document.createElement('button');
    const toggleLabel = document.createElement('span');
    const toggleIcon = document.createElement('span');
    navLinks.id = 'primary-navigation-links';
    toggle.type = 'button';
    toggle.className = 'v2-menu-toggle';
    toggle.setAttribute('aria-controls', navLinks.id);
    toggle.setAttribute('aria-expanded', 'false');
    toggleLabel.textContent = 'Menu';
    toggleIcon.className = 'v2-menu-icon';
    toggleIcon.setAttribute('aria-hidden', 'true');
    toggle.append(toggleLabel, toggleIcon);
    navLinks.before(toggle);
    navLinks.querySelectorAll('br').forEach(lineBreak => lineBreak.after(document.createTextNode(' ')));
    navigation.classList.add('has-mobile-menu');

    const setMenuOpen = open => {
      navigation.classList.toggle('is-menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggleLabel.textContent = open ? 'Close' : 'Menu';
    };
    toggle.addEventListener('click', () => setMenuOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    navLinks.addEventListener('click', event => {
      if (event.target.closest('a, button')) setMenuOpen(false);
    });
    document.addEventListener('click', event => {
      if (!navigation.contains(event.target)) setMenuOpen(false);
    });
    navigation.addEventListener('keydown', event => {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setMenuOpen(false);
        toggle.focus();
      }
    });
    compactNavigation.addEventListener('change', () => setMenuOpen(false));
  }

  const dialog = document.getElementById('booking-placeholder');
  // Replace this placeholder once the booking address is supplied.
  const bookingLink = 'https://cal.com/zafar-amin-eshaen/15min';
  document.querySelectorAll('[data-book-call]').forEach(button => button.addEventListener('click', () => {
    if (bookingLink.startsWith('https://')) { window.location.assign(bookingLink); return; }
    dialog.showModal();
  }));
  dialog?.querySelector('[data-close-booking]')?.addEventListener('click', () => dialog.close());

  const sampleDialog = document.getElementById('sample-intro');
  if (sampleDialog) {
    const openSampleDialog = () => {
      if (sampleDialog.open) return;
      try {
        sampleDialog.showModal();
      } catch (error) {
        sampleDialog.setAttribute('open', '');
      }
    };
    if (document.readyState === 'complete') {
      openSampleDialog();
    } else {
      window.addEventListener('load', openSampleDialog, { once: true });
    }
    sampleDialog.querySelector('[data-close-sample]')?.addEventListener('click', () => sampleDialog.close());
  }

  const recoveryViewer = document.getElementById('recovery-viewer');
  const recoveryViewerImage = recoveryViewer?.querySelector('[data-recovery-viewer-image]');
  if (recoveryViewer && recoveryViewerImage) {
    document.querySelectorAll('[data-recovery-view]').forEach(button => button.addEventListener('click', () => {
      recoveryViewerImage.src = button.dataset.recoveryView;
      recoveryViewerImage.alt = button.dataset.recoveryAlt || 'Enlarged screen preview';
      if (typeof recoveryViewer.showModal === 'function') recoveryViewer.showModal();
      else recoveryViewer.setAttribute('open', '');
    }));
    recoveryViewer.querySelector('[data-close-recovery]')?.addEventListener('click', () => recoveryViewer.close());
    recoveryViewer.addEventListener('click', event => {
      if (event.target === recoveryViewer) recoveryViewer.close();
    });
  }

  document.querySelectorAll('.v2-section h2, .v2-grid > .v2-card, .onboarding-example-grid > li').forEach((item, index) => {
    if (!item.hasAttribute('data-reveal')) item.setAttribute('data-reveal', '');
    item.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 55}ms`);
  });

  const revealItems = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.14 });
    revealItems.forEach(item => revealObserver.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('is-visible'));
  }
})();
