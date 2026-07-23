document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu
  var menuBtn = document.querySelector('.mobile-menu-btn');
  if (menuBtn) {
    menuBtn.addEventListener('click', function() {
      var mobileMenu = document.querySelector('.mobile-menu');
      if (!mobileMenu) {
        mobileMenu = document.createElement('div');
        mobileMenu.className = 'mobile-menu';
        mobileMenu.style.cssText = 'position:fixed;top:64px;left:0;right:0;bottom:0;background:rgba(15,15,26,0.98);z-index:99;padding:24px;display:flex;flex-direction:column;gap:16px;';
        var links = document.querySelectorAll('.nav-links a');
        links.forEach(function(l) {
          var a = document.createElement('a');
          a.href = l.href;
          a.textContent = l.textContent;
          a.style.cssText = 'color:var(--text-secondary);font-size:18px;font-weight:500;padding:12px 0;border-bottom:1px solid var(--border-light);';
          if (l.classList.contains('active')) a.style.color = 'var(--primary-light)';
          mobileMenu.appendChild(a);
        });
        document.body.appendChild(mobileMenu);
      } else {
        mobileMenu.remove();
      }
    });
  }

  // Scroll nav
  var nav = document.querySelector('.nav');
  window.addEventListener('scroll', function() {
    nav.style.background = window.scrollY > 50 ? 'rgba(15,15,26,0.95)' : 'rgba(15,15,26,0.85)';
  });
});
