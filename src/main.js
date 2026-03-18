/* ═══════════════════════════════════════════════════════════════
   MAIN.JS — Entry Point
   Wires together the router, pages, and Spline scene loader.
   Supports pages with multiple Spline scenes.
   ═══════════════════════════════════════════════════════════════ */

import { Application } from '@splinetool/runtime';
import { Router } from './router.js';
import { home } from './pages/home.js';
import { service } from './pages/service.js';
import { about } from './pages/about.js';

// ─── DOM ───────────────────────────────────────────────────────
const loader = document.getElementById('loader');
const navLinks = document.querySelectorAll('.glass-nav-link');
const sceneContainer = document.getElementById('scene-container');
const section1 = document.getElementById('scene-section-1');
const section2 = document.getElementById('scene-section-2');
const canvas1 = document.getElementById('canvas3d');
const canvas2 = document.getElementById('canvas3d-2');

// ─── Active Spline instances ───────────────────────────────────
let splineInstances = [];

function disposeAll() {
  splineInstances.forEach(app => {
    try { app.dispose(); } catch (e) { /* ignore */ }
  });
  splineInstances = [];
}

// ─── Configure a loaded Spline app ─────────────────────────────
function configureScene(app, canvasEl, multiScene = false) {
  // Remove watermark
  if (app._renderer && app._renderer.pipeline) {
    app._renderer.pipeline.setWatermark(null);
  }

  // Force matching background color across all scenes
  app.setBackgroundColor('#0b0b0b');

  // Disable zoom on orbit controls
  const controls = app._eventManager?.controlsManager?.orbitControls
    || app.controls?.orbitControls;
  if (controls) {
    controls.enableZoom = false;
  }

  if (multiScene) {
    // Multi-scene page: allow scrolling between sections
    // Disable Spline's internal scroll prevention
    if (app._eventManager) {
      app._eventManager.preventScroll = false;
      app._eventManager.preventTouchScroll = false;
    }

    // Let wheel events pass through to the scroll container
    canvasEl.style.touchAction = 'pan-y';

  } else {
    // Single-scene page: block wheel zoom entirely
    canvasEl.addEventListener('wheel', (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
    }, { passive: false, capture: true });
  }
}

// ─── Load all scenes for a page ────────────────────────────────
async function loadPage(route) {
  // Show loader
  loader.classList.remove('hidden');
  canvas1.classList.remove('loaded');
  canvas2.classList.remove('loaded');

  // Dispose previous scenes
  disposeAll();

  const scenes = route.scenes;
  const isSingle = scenes.length === 1;

  // Show/hide second section
  if (isSingle) {
    section2.classList.add('hidden');
    sceneContainer.classList.add('single-scene');
  } else {
    section2.classList.remove('hidden');
    sceneContainer.classList.remove('single-scene');
  }

  // Scroll to top
  sceneContainer.scrollTop = 0;

  try {
    // Load first scene
    const app1 = new Application(canvas1);
    await app1.load(scenes[0].sceneUrl);
    splineInstances.push(app1);
    configureScene(app1, canvas1, !isSingle);
    canvas1.classList.add('loaded');
    console.log('✅ Scene 1 loaded:', scenes[0].sceneUrl);

    // Hide loader after first scene loads
    loader.classList.add('hidden');

    // Load second scene if exists (sequentially to reduce GPU pressure)
    if (scenes.length > 1) {
      const app2 = new Application(canvas2);
      await app2.load(scenes[1].sceneUrl);
      splineInstances.push(app2);
      configureScene(app2, canvas2, true);
      canvas2.classList.add('loaded');
      console.log('✅ Scene 2 loaded:', scenes[1].sceneUrl);
    }
  } catch (err) {
    console.error('❌ Failed to load scene:', err);
    loader.classList.add('hidden');
  }
}

// ─── Routes ────────────────────────────────────────────────────
const routes = [home, service, about];

// ─── Init router ───────────────────────────────────────────────
const router = new Router(routes, (route) => {
  loadPage(route);
});

router.bindLinks(navLinks);

// ─── Initial page load ────────────────────────────────────────
router.resolve(window.location.pathname);
