(() => {
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
