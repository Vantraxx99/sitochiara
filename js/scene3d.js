/* Scene 3D del sito (Three.js).
   Ogni <canvas class="scene3d" data-scene="..."> diventa una scena:
   una forma morbida che si deforma di continuo, con riflessi cangianti,
   anelli in orbita e particelle. Reagisce a mouse, tocco e scroll.
   Senza WebGL restano gli sfondi sfumati e gli oggetti in CSS. */
(() => {
  'use strict';
  const T = window.THREE;
  const canvases = [...document.querySelectorAll('canvas.scene3d')];
  if (!T || !canvases.length) return;

  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = matchMedia('(max-width: 760px)').matches;

  const PALETTES = {
    home:     ['#3a2d5c', '#f0b39a', '#b7a4f5'],
    about:    ['#4a2c3a', '#f4c0a6', '#e3a5c8'],
    works:    ['#231f4a', '#b7a4f5', '#8fd3d0'],
    contact:  ['#3f2a1c', '#f3cf8f', '#f0b39a'],
  };
  // posizione e dimensione della forma, in frazioni dello spazio visibile
  const LAYOUT = {
    home: { wide: [0.42, 0.05, 0.62], narrow: [0.12, 0.42, 0.62] },
    page: { wide: [0.6, 0.02, 0.5], narrow: [0.62, 0.3, 0.42] },
  };

  const NOISE = `
    vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
    vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
    vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
    float snoise(vec3 v){
      const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);
      vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
      vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
      vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
      i=mod289(i);
      vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
      float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;
      vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);
      vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);
      vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
      vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));
      vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
      vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
      vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
      p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
      vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;
      return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
    }`;

  const VERT = NOISE + `
    uniform float uTime; uniform float uAmp; uniform float uFreq;
    varying vec3 vN; varying vec3 vPos; varying float vD;
    float disp(vec3 p){
      return (snoise(p*uFreq + vec3(uTime*.22)) + .35*snoise(p*uFreq*2.3 - vec3(uTime*.17))) * uAmp;
    }
    vec3 shape(vec3 p){ vec3 n = normalize(p); return n * (1. + disp(n)); }
    void main(){
      vec3 n = normalize(position);
      vec3 t = normalize(cross(n, abs(n.y) > .99 ? vec3(1.,0.,0.) : vec3(0.,1.,0.)));
      vec3 b = cross(n, t);
      float e = .01;
      vec3 p0 = shape(n), p1 = shape(n + t*e), p2 = shape(n + b*e);
      vD = disp(n);
      vN = normalize(normalMatrix * normalize(cross(p1 - p0, p2 - p0)));
      vec4 mv = modelViewMatrix * vec4(p0, 1.);
      vPos = mv.xyz;
      gl_Position = projectionMatrix * mv;
    }`;

  const FRAG = `
    uniform vec3 uC1; uniform vec3 uC2; uniform vec3 uC3; uniform float uTime;
    varying vec3 vN; varying vec3 vPos; varying float vD;
    void main(){
      vec3 N = normalize(vN); vec3 V = normalize(-vPos);
      if (dot(N, V) < 0.) N = -N;
      float fres = pow(1. - max(dot(N, V), 0.), 2.);
      vec3 L1 = normalize(vec3(.5, .8, .6)), L2 = normalize(vec3(-.8, -.3, .5));
      float d1 = max(dot(N, L1), 0.), d2 = max(dot(N, L2), 0.);
      float spec = pow(max(dot(N, normalize(L1 + V)), 0.), 70.);
      vec3 irid = .5 + .5 * cos(6.2831 * (vec3(0., .33, .67) + fres * 1.1 + vD * 1.8 + uTime * .04));
      irid = mix(irid, uC3, .45);
      vec3 base = mix(uC1, uC2, smoothstep(-.25, .35, vD));
      vec3 col = base * (.28 + .8 * d1) + uC3 * d2 * .35;
      col = mix(col, irid, fres * .8);
      col += spec * .85 + fres * uC3 * .25;
      gl_FragColor = vec4(col, 1.);
    }`;

  function makeScene(canvas) {
    const kind = canvas.dataset.scene || 'home';
    const isHome = kind === 'home';
    const pal = (PALETTES[kind] || PALETTES.home).map((c) => new T.Color(c));

    let renderer;
    try {
      renderer = new T.WebGLRenderer({ canvas, antialias: !small, alpha: true, powerPreference: 'high-performance' });
    } catch (e) { return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 1.5 : 2));
    canvas.closest('.hero, .page-hero')?.classList.add('has-3d');

    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.z = 12;
    const root = new T.Group();
    scene.add(root);

    // forma principale
    const seg = small ? 110 : 180;
    const blobMat = new T.ShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG,
      uniforms: {
        uTime: { value: 0 }, uAmp: { value: 0.22 }, uFreq: { value: 1.1 },
        uC1: { value: pal[0] }, uC2: { value: pal[1] }, uC3: { value: pal[2] },
      },
    });
    const blob = new T.Mesh(new T.SphereGeometry(1, seg, seg), blobMat);
    root.add(blob);

    // anelli in orbita con piccoli satelliti
    const rings = [];
    [[1.65, pal[2], 0.9, 0.3], [1.95, pal[1], -0.5, 1.1]].forEach(([r, c, tilt, rot], i) => {
      const g = new T.Group();
      const ring = new T.Mesh(new T.TorusGeometry(r, 0.006, 8, 200), new T.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.55 }));
      const moon = new T.Mesh(new T.SphereGeometry(i ? 0.05 : 0.07, 24, 24), new T.MeshBasicMaterial({ color: c }));
      moon.position.x = r;
      g.add(ring, moon);
      g.rotation.set(tilt, rot, 0);
      g.userData.speed = i ? -0.35 : 0.5;
      root.add(g);
      rings.push(g);
    });

    // forme lucide che fluttuano (solo in home)
    const floaters = [];
    if (isHome) {
      scene.add(new T.AmbientLight(0xffffff, 0.25));
      const l1 = new T.PointLight(pal[1], 1.8, 40); l1.position.set(6, 4, 6);
      const l2 = new T.PointLight(pal[2], 2, 40); l2.position.set(-6, -3, 5);
      scene.add(l1, l2);
      let seed = 11;
      const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
      const geos = [new T.IcosahedronGeometry(0.3, 0), new T.OctahedronGeometry(0.28, 0), new T.TorusGeometry(0.24, 0.08, 16, 48), new T.SphereGeometry(0.2, 24, 24)];
      const count = small ? 7 : 11;
      for (let i = 0; i < count; i++) {
        const wire = i % 4 === 1;
        const mat = wire
          ? new T.MeshBasicMaterial({ color: pal[2], wireframe: true, transparent: true, opacity: 0.5 })
          : new T.MeshStandardMaterial({ color: i % 2 ? pal[1] : 0x8f84a8, metalness: 0.35, roughness: 0.3 });
        const m = new T.Mesh(geos[i % geos.length], mat);
        const a = (i / count) * Math.PI * 2 + rnd() * 0.5, r = 2.4 + rnd() * 1.4;
        m.userData = { a, r, z: (rnd() - 0.5) * 3, sp: 0.3 + rnd() * 0.5, ph: rnd() * 6, rs: (rnd() - 0.5) * 1.4 };
        m.scale.setScalar(0.7 + rnd() * 0.7);
        root.add(m);
        floaters.push(m);
      }
    }

    // particelle
    const N = small ? 260 : 520, pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 28;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 18;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 3;
    }
    const pg = new T.BufferGeometry();
    pg.setAttribute('position', new T.BufferAttribute(pos, 3));
    const dust = new T.Points(pg, new T.PointsMaterial({ color: 0xf2ede6, size: small ? 0.05 : 0.035, transparent: true, opacity: 0.5 }));
    scene.add(dust);

    // adatta posizione e dimensione allo spazio disponibile
    let baseScale = 1;
    function layout() {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      const halfH = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
      const halfW = halfH * camera.aspect;
      const L = (isHome ? LAYOUT.home : LAYOUT.page)[w > 900 ? 'wide' : 'narrow'];
      root.position.set(halfW * L[0], halfH * L[1], 0);
      baseScale = Math.min(halfW, halfH) * L[2] / 1.95;
    }
    layout();
    addEventListener('resize', layout);
    if ('ResizeObserver' in window) new ResizeObserver(layout).observe(canvas);

    // mouse / tocco: la forma si "agita" e si gira verso il puntatore
    let mx = 0, my = 0, tx = 0, ty = 0, energy = 0, lastX = 0, lastY = 0;
    addEventListener('pointermove', (e) => {
      const nx = (e.clientX / innerWidth) * 2 - 1, ny = (e.clientY / innerHeight) * 2 - 1;
      energy = Math.min(1, energy + Math.hypot(nx - lastX, ny - lastY) * 2.5);
      lastX = nx; lastY = ny; mx = nx; my = ny;
    }, { passive: true });
    let lastScroll = scrollY;

    let visible = true;
    if ('IntersectionObserver' in window) new IntersectionObserver((en) => (visible = en[0].isIntersecting)).observe(canvas);

    const clock = new T.Clock();
    const easeOut = (x) => 1 - Math.pow(1 - Math.min(Math.max(x, 0), 1), 4);
    let introStart = 0;
    CT_restart.push(() => { introStart = clock.getElapsedTime(); });

    function frame() {
      const t = still ? 3 : clock.getElapsedTime();
      const intro = still ? 1 : easeOut((t - introStart - 0.35) / 1.6);
      const sy = scrollY;
      const sv = Math.abs(sy - lastScroll);
      lastScroll = sy;
      energy = Math.min(1, energy + sv * 0.004) * 0.96;

      tx += (mx - tx) * 0.05;
      ty += (my - ty) * 0.05;

      blobMat.uniforms.uTime.value = t;
      blobMat.uniforms.uAmp.value = 0.2 + energy * 0.22 + Math.sin(t * 0.6) * 0.03;

      root.scale.setScalar(baseScale * (0.3 + 0.7 * intro));
      root.rotation.y = tx * 0.4 + sy * 0.0009;
      root.rotation.x = ty * 0.25;
      blob.rotation.y = t * 0.12;
      blob.rotation.z = t * 0.05;

      rings.forEach((g) => { g.rotation.z = t * g.userData.speed; });
      floaters.forEach((m) => {
        const d = m.userData, a = d.a + t * 0.06;
        m.position.set(Math.cos(a) * d.r * (0.5 + 0.5 * intro), Math.sin(a) * d.r * 0.7 + Math.sin(t * d.sp + d.ph) * 0.25, d.z);
        m.rotation.set(t * d.rs, t * d.rs * 0.7, 0);
      });

      dust.rotation.y = t * 0.015 + tx * 0.1;
      dust.position.y = sy * 0.004;
      camera.position.y = -sy * 0.0025;
      renderer.render(scene, camera);
    }
    function loop() {
      requestAnimationFrame(loop);
      if (visible && canvas.offsetParent !== null && !document.hidden) frame();
    }
    if (still) { frame(); addEventListener('resize', frame); } else loop();
  }

  // permette alla navigazione di far ripartire l'animazione di entrata
  const CT_restart = [];
  window.CT = window.CT || {};
  window.CT.restart3d = () => CT_restart.forEach((f) => f());

  canvases.forEach(makeScene);
})();
