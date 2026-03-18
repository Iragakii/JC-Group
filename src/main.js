/* ═══════════════════════════════════════════════════════════════
   MAIN.JS — Entry Point
   Wires together the router, pages, and Spline scene loader.
   ═══════════════════════════════════════════════════════════════ */

import { Application } from '@splinetool/runtime';
import { Router } from './router.js';
import { home } from './pages/home.js';
import { service } from './pages/service.js';
import { about } from './pages/about.js';

// ─── DOM ───────────────────────────────────────────────────────
const canvas = document.getElementById('canvas3d');
const loader = document.getElementById('loader');
const navLinks = document.querySelectorAll('.glass-nav-link');

// ─── Spline instance ──────────────────────────────────────────
let spline = null;

async function loadScene(sceneUrl) {
  // Show loader, hide canvas
  loader.classList.remove('hidden');
  canvas.classList.remove('loaded');

  try {
    if (spline) {
      spline.dispose();
      spline = null;
    }

    spline = new Application(canvas);
    await spline.load(sceneUrl);

    console.log('✅ Scene loaded:', sceneUrl);

    loader.classList.add('hidden');
    canvas.classList.add('loaded');

    // Remove watermark
    if (spline._renderer && spline._renderer.pipeline) {
      spline._renderer.pipeline.setWatermark(null);
    }

    // Disable ALL camera orbit controls (zoom, rotate, pan)
    // Only the built-in Spline mouse-follow event (drone) stays active
    const controls = spline._eventManager?.controlsManager?.orbitControls
                  || spline.controls?.orbitControls;
    if (controls) {
      controls.enableZoom = false;
      controls.enableRotate = false;
      controls.enablePan = false;
      controls.enabled = false;
    }

    // Block wheel events at capture phase as extra safety
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
    }, { passive: false, capture: true });

    // Zoom camera closer so drone + text are not so far
    spline.setZoom(1);
  } catch (err) {
    console.error('❌ Failed to load scene:', err);
    loader.classList.add('hidden');
  }
}

// ─── Routes (imported from page modules) ───────────────────────
const routes = [home, service, about];

// ─── Init router ───────────────────────────────────────────────
const router = new Router(routes, (route) => {
  loadScene(route.sceneUrl);
});

router.bindLinks(navLinks);

// ─── Initial page load ────────────────────────────────────────
router.resolve(window.location.pathname);
