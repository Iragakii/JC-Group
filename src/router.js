/* ═══════════════════════════════════════════════════════════════
   ROUTER — Simple SPA Client-Side Router
   ═══════════════════════════════════════════════════════════════ */

export class Router {
  constructor(routes, onNavigate) {
    this.routes = routes;
    this.onNavigate = onNavigate;

    // Handle browser back/forward
    window.addEventListener('popstate', () => {
      this.resolve(window.location.pathname);
    });
  }

  // Register nav link click handlers
  bindLinks(navLinks) {
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        const path = href === '#' ? '/' : href;
        this.navigateTo(path);
      });
    });
  }

  // Navigate to a path
  navigateTo(path) {
    window.history.pushState({}, '', path);
    this.resolve(path);
  }

  // Resolve the current path to a route
  resolve(path) {
    const route = this.routes.find(r => r.path === path) || this.routes[0];
    this.updateActiveNav(path);
    this.onNavigate(route);
  }

  // Update active class on nav links
  updateActiveNav(path) {
    document.querySelectorAll('.glass-nav-link').forEach(link => {
      const href = link.getAttribute('href');
      if (href === path || (href === '#' && path === '/')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
}
