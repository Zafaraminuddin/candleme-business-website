(() => {
  const dialog = document.getElementById('booking-placeholder');
  // Replace this placeholder once the booking address is supplied.
  const bookingLink = '[CAL BOOKING LINK]';
  document.querySelectorAll('[data-book-call]').forEach(button => button.addEventListener('click', () => {
    if (bookingLink.startsWith('https://')) { window.location.assign(bookingLink); return; }
    dialog.showModal();
  }));
  dialog?.querySelector('[data-close-booking]')?.addEventListener('click', () => dialog.close());
})();
