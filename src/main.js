import { Application } from '@splinetool/runtime';
import { Router } from './router.js';
import { home } from './pages/home.js';
import { service } from './pages/service.js';
import { about } from './pages/about.js';

const loader = document.getElementById('loader');
const navLinks = document.querySelectorAll('.glass-nav-link');
const sceneContainer = document.getElementById('scene-container');
const section2 = document.getElementById('scene-section-2');
const canvas1 = document.getElementById('canvas3d');
const canvas2 = document.getElementById('canvas3d-2');

let splineInstances = [];
let cleanupSceneSync = () => {};

function disposeAll() {
  cleanupSceneSync();
  cleanupSceneSync = () => {};

  splineInstances.forEach((app) => {
    try {
      app.dispose();
    } catch (error) {
      console.warn('Failed to dispose Spline app:', error);
    }
  });

  splineInstances = [];
  canvas1.onwheel = null;
  canvas2.onwheel = null;
}

function getScenes(route) {
  if (!route || !Array.isArray(route.scenes)) {
    return [];
  }

  return route.scenes.filter((scene) => scene && typeof scene.sceneUrl === 'string');
}

function getInteraction(route, scenes) {
  return {
    allowWheelScroll: scenes.length > 1,
    blockWheelZoom: scenes.length === 1,
    ...(route?.interaction ?? {}),
  };
}

function syncAppDomRect(app) {
  if (!app?._eventManager?.eventContext) {
    return;
  }

  app._eventManager.eventContext.domRect = app.canvas.getBoundingClientRect();
}

function setupSceneContainerSync(apps) {
  const syncAll = () => {
    apps.forEach(syncAppDomRect);
  };

  sceneContainer.addEventListener('scroll', syncAll, { passive: true });
  window.addEventListener('resize', syncAll);
  syncAll();

  return () => {
    sceneContainer.removeEventListener('scroll', syncAll);
    window.removeEventListener('resize', syncAll);
  };
}

function configureScene(app, canvasEl, interaction, scene) {
  if (app._renderer?.pipeline) {
    app._renderer.pipeline.setWatermark(null);
  }

  app.setBackgroundColor('#0b0b0b');

  if (typeof scene?.zoom === 'number') {
    app.setZoom(scene.zoom);
  }

  const controls = app._eventManager?.controlsManager?.orbitControls
    || app.controls?.orbitControls;

  if (controls) {
    controls.enableZoom = false;
    controls.enableRotate = false;
    controls.enablePan = false;
  }

  if (app._eventManager) {
    app._eventManager.preventZoom = true;
    app._eventManager.preventScroll = !interaction.allowWheelScroll;
    app._eventManager.preventTouchScroll = !interaction.allowWheelScroll;
  }

  canvasEl.style.touchAction = interaction.allowWheelScroll ? 'pan-y' : 'auto';
}

async function loadPage(route) {
  loader.classList.remove('hidden');
  canvas1.classList.remove('loaded');
  canvas2.classList.remove('loaded');

  disposeAll();

  const scenes = getScenes(route);

  if (scenes.length === 0) {
    console.error('No valid scenes found for route:', route);
    section2.classList.add('hidden');
    sceneContainer.classList.add('single-scene');
    loader.classList.add('hidden');
    return;
  }

  const isSingle = scenes.length === 1;
  const interaction = getInteraction(route, scenes);

  if (isSingle) {
    section2.classList.add('hidden');
    sceneContainer.classList.add('single-scene');
  } else {
    section2.classList.remove('hidden');
    sceneContainer.classList.remove('single-scene');
  }

  sceneContainer.scrollTop = 0;

  try {
    const app1 = new Application(canvas1);
    await app1.load(scenes[0].sceneUrl);
    splineInstances.push(app1);
    configureScene(app1, canvas1, interaction, scenes[0]);
    canvas1.classList.add('loaded');

    loader.classList.add('hidden');

    if (scenes.length > 1) {
      const app2 = new Application(canvas2);
      await app2.load(scenes[1].sceneUrl);
      splineInstances.push(app2);
      configureScene(app2, canvas2, interaction, scenes[1]);
      canvas2.classList.add('loaded');
    }

    cleanupSceneSync = setupSceneContainerSync(splineInstances);

  } catch (error) {
    console.error('Failed to load scene:', error);
    loader.classList.add('hidden');
  }
}

const routes = [home, service, about];

const router = new Router(routes, (route) => {
  loadPage(route);
});

router.bindLinks(navLinks);
router.resolve(window.location.pathname);
