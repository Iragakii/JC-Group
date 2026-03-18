/* ═══════════════════════════════════════════════════════════════
   SERVICE PAGE — Multiple Spline Scenes
   ═══════════════════════════════════════════════════════════════ */

export const service = {
  path: '/service',
  interaction: {
    allowWheelScroll: true,
    blockWheelZoom: false,
  },
  scenes: [
    {
      id: 'canvas3d',
      sceneUrl: 'https://prod.spline.design/f7oW4pfZQBPr54uj/scene.splinecode',
      zoom: 1,
    },
    {
      id: 'canvas3d-2',
      sceneUrl: 'https://prod.spline.design/v94irsfwxTtJoG1L/scene.splinecode',
    },
  ],
};
