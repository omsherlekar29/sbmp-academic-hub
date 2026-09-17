// Subtle scroll-based fade-in for cards. Zero config.
export function initPolish(){
  if (!('IntersectionObserver' in window)) return;
  const targets = document.querySelectorAll(
    '.card, .quick-tile, .subject-card, .notice-item, .calendar-card, .unit'
  );
  targets.forEach(el => el.classList.add('fade-init'));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('fade-in');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -40px 0px', threshold: 0.05 });

  targets.forEach(el => io.observe(el));
}