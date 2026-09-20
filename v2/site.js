(() => {
  const dialog = document.getElementById('booking-placeholder');
  // Replace this placeholder once the booking address is supplied.
  const bookingLink = '[CAL BOOKING LINK]';
  document.querySelectorAll('[data-book-call]').forEach(button => button.addEventListener('click', () => {
    if (bookingLink.startsWith('https://')) { window.location.assign(bookingLink); return; }
    dialog.showModal();
  }));
  dialog?.querySelector('[data-close-booking]')?.addEventListener('click', () => dialog.close());

  const sampleDialog = document.getElementById('sample-intro');
  if (sampleDialog) {
    sampleDialog.showModal();
    sampleDialog.querySelector('[data-close-sample]')?.addEventListener('click', () => sampleDialog.close());
  }

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
