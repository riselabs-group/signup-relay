const card = () => document.getElementById('signup');
document.addEventListener('click', (event) => {
  const trigger = event.target.closest('.primary');
  if (!trigger) return;
  const target = card();
  if (!target) return;
  target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  window.setTimeout(() => {
    target.classList.remove('signup-focus');
    void target.offsetWidth;
    target.classList.add('signup-focus');
    window.setTimeout(() => target.classList.remove('signup-focus'), 1300);
    target.querySelector('input')?.focus({ preventScroll: true });
  }, 420);
});
