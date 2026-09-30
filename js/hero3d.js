/* Scena 3D della home: nodo lucido al centro, forme che fluttuano e particelle.
   Reagisce al mouse e allo scroll. Se WebGL non è disponibile resta lo sfondo sfumato. */
(() => {
  'use strict';
  const canvas = document.getElementById('hero3d');
  if (!canvas || !window.THREE) return;
  const T = window.THREE;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let renderer;
  try {
    renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputEncoding = T.sRGBEncoding;

  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 12);

  const PEACH = 0xf0b39a, LILAC = 0xb7a4f5, PAPER = 0xf2ede6;

  // luci
  scene.add(new T.AmbientLight(0xffffff, 0.18));
  const key = new T.DirectionalLight(0xffffff, 0.45);
  key.position.set(2, 5, 6);
  scene.add(key);
  const warm = new T.PointLight(PEACH, 1.6, 40);
  const cool = new T.PointLight(LILAC, 2, 40);
  scene.add(warm, cool);

  const group = new T.Group();
  scene.add(group);

  // nodo centrale
  const knot = new T.Mesh(
    new T.TorusKnotGeometry(1.45, 0.44, 260, 40, 2, 3),
    new T.MeshPhysicalMaterial({ color: 0xd8cfd9, metalness: 0.45, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.08 })
  );
  group.add(knot);

  // forme che fluttuano (posizioni fisse, così la composizione è sempre la stessa)
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const geos = [
    new T.IcosahedronGeometry(0.42, 0),
    new T.SphereGeometry(0.3, 32, 32),
    new T.TorusGeometry(0.36, 0.12, 24, 64),
    new T.OctahedronGeometry(0.38, 0),
    new T.BoxGeometry(0.5, 0.5, 0.5),
  ];
  const colors = [PEACH, LILAC, 0x8f84a8];
  const floaters = [];
  for (let i = 0; i < 14; i++) {
    const wire = i % 5 === 3;
    const mat = wire
      ? new T.MeshBasicMaterial({ color: colors[i % 3], wireframe: true, transparent: true, opacity: 0.55 })
      : new T.MeshStandardMaterial({ color: colors[i % 3], metalness: 0.3, roughness: 0.35 });
    const m = new T.Mesh(geos[i % geos.length], mat);
    const a = rnd() * Math.PI * 2, r = 3 + rnd() * 2.6, z = (rnd() - 0.5) * 4;
    m.userData = { x: Math.cos(a) * r, y: Math.sin(a) * r * 0.62, z, sp: 0.4 + rnd() * 0.7, ph: rnd() * 6, rs: (rnd() - 0.5) * 1.6 };
    m.scale.setScalar(0.6 + rnd() * 0.8);
    group.add(m);
    floaters.push(m);
  }

  // particelle
  const N = 600, pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (rnd() - 0.5) * 26;
    pos[i * 3 + 1] = (rnd() - 0.5) * 16;
    pos[i * 3 + 2] = (rnd() - 0.5) * 10 - 2;
  }
  const pg = new T.BufferGeometry();
  pg.setAttribute('position', new T.BufferAttribute(pos, 3));
  const dust = new T.Points(pg, new T.PointsMaterial({ color: PAPER, size: 0.035, transparent: true, opacity: 0.55 }));
  scene.add(dust);

  // dimensioni e posizione in base allo schermo
  function layout() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const wide = w > 900;
    group.position.set(wide ? 3 : 0.4, wide ? 0.3 : 2.4, 0);
    group.userData.scale = wide ? 1 : w > 600 ? 0.8 : 0.62;
  }
  layout();
  addEventListener('resize', layout);
  if ('ResizeObserver' in window) new ResizeObserver(layout).observe(canvas);

  // mouse e scroll
  let mx = 0, my = 0, tx = 0, ty = 0;
  addEventListener('pointermove', (e) => { mx = e.clientX / innerWidth * 2 - 1; my = e.clientY / innerHeight * 2 - 1; }, { passive: true });

  // disegna solo quando la hero è visibile
  let visible = true;
  if ('IntersectionObserver' in window) new IntersectionObserver((en) => (visible = en[0].isIntersecting)).observe(canvas);

  const clock = new T.Clock();
  const ease = (x) => 1 - Math.pow(1 - Math.min(x, 1), 3);
  function frame() {
    const t = still ? 2 : clock.getElapsedTime();
    const intro = still ? 1 : ease(t / 1.8);
    const sy = scrollY;

    tx += (mx - tx) * 0.05;
    ty += (my - ty) * 0.05;

    group.scale.setScalar((group.userData.scale || 1) * (0.4 + 0.6 * intro));
    group.rotation.y = tx * 0.35 + sy * 0.0012;
    group.rotation.x = ty * 0.2;

    knot.rotation.x = t * 0.16 + sy * 0.002;
    knot.rotation.y = t * 0.22;

    floaters.forEach((m) => {
      const d = m.userData;
      m.position.set(d.x * (0.6 + 0.4 * intro), d.y + Math.sin(t * d.sp + d.ph) * 0.35, d.z);
      m.rotation.x = t * d.rs;
      m.rotation.y = t * d.rs * 0.8;
    });

    dust.rotation.y = t * 0.02 + tx * 0.08;
    dust.position.y = sy * 0.004;

    warm.position.set(Math.cos(t * 0.5) * 7, 3 + Math.sin(t * 0.7) * 2, 6);
    cool.position.set(-Math.cos(t * 0.4) * 7, -3 + Math.cos(t * 0.6) * 2, 5);

    camera.position.y = -sy * 0.003;
    renderer.render(scene, camera);
  }
  function loop() {
    requestAnimationFrame(loop);
    if (visible && canvas.offsetParent !== null) frame();
  }
  if (still) { frame(); addEventListener('resize', frame); } else loop();
})();
