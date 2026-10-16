"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

// Fundo em duotone escuro; dentro da lente o vídeo aparece na cor real,
// com a borda separada em ciano, magenta e amarelo como um registro fora do lugar.
const FRAG = `
precision highp float;
uniform sampler2D map;
uniform vec2 res;
uniform vec2 videoSize;
uniform vec2 mouse;
uniform float radius;
uniform float reveal;
varying vec2 vUv;

vec2 coverUv(vec2 uv) {
  float sr = res.x / res.y;
  float vr = videoSize.x / videoSize.y;
  vec2 scale = sr > vr ? vec2(1.0, vr / sr) : vec2(sr / vr, 1.0);
  return (uv - 0.5) * scale + 0.5;
}

void main() {
  vec2 uv = coverUv(vUv);
  vec3 col = texture2D(map, uv).rgb;
  float l = dot(col, vec3(0.299, 0.587, 0.114));
  vec3 duo = mix(vec3(0.03, 0.035, 0.06), vec3(0.16, 0.27, 0.42), smoothstep(0.05, 0.95, l));

  vec2 p = vUv * res;
  float d = distance(p, mouse * res);
  float r = radius * reveal;
  float inside = 1.0 - smoothstep(r - 2.0, r + 2.0, d);

  // anel de registro CMYK na borda da lente
  float ring = smoothstep(r - 10.0, r, d) * (1.0 - smoothstep(r, r + 12.0, d)) * reveal;
  vec2 dir = normalize(p - mouse * res + 0.0001) / res;
  float c = texture2D(map, coverUv(vUv + dir * 7.0)).r;
  float m = texture2D(map, coverUv(vUv - dir * 7.0)).g;
  float y = texture2D(map, coverUv(vUv + vec2(dir.y, -dir.x) * 7.0)).b;
  vec3 split = vec3(c, m, y);

  vec3 outCol = mix(duo, col * 1.05, inside);
  outCol = mix(outCol, split, ring * 0.85);
  gl_FragColor = vec4(outCol, 1.0);
}
`;

export function HeroVideo({ src, poster }: { src: string; poster: string }) {
  const box = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [gl, setGl] = useState(true);

  useEffect(() => {
    const el = box.current;
    const v = video.current;
    if (!el || !v) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: "high-performance" });
    } catch {
      setGl(false);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.domElement.className = "hv-canvas";
    renderer.domElement.setAttribute("aria-hidden", "true");
    el.appendChild(renderer.domElement);

    const tex = new THREE.VideoTexture(v);
    tex.colorSpace = THREE.SRGBColorSpace;
    const uniforms = {
      map: { value: tex },
      res: { value: new THREE.Vector2(1, 1) },
      videoSize: { value: new THREE.Vector2(1920, 1080) },
      mouse: { value: new THREE.Vector2(0.72, 0.5) },
      radius: { value: 180 },
      reveal: { value: 1 },
    };
    const mat = new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG });
    const scene = new THREE.Scene();
    const cam = new THREE.Camera();
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

    const target = new THREE.Vector2(0.72, 0.5);
    let targetRadius = 180;

    function resize() {
      const r = el!.getBoundingClientRect();
      renderer.setSize(r.width, r.height, false);
      const dpr = renderer.getPixelRatio();
      uniforms.res.value.set(r.width * dpr, r.height * dpr);
      targetRadius = Math.max(110, Math.min(240, r.width * 0.14)) * dpr;
      uniforms.radius.value = targetRadius;
    }
    resize();
    if (el.getBoundingClientRect().width < 760) {
      target.set(0.5, 0.84);
      uniforms.mouse.value.copy(target);
    }
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    const section = el.closest("section") ?? el;
    function move(e: PointerEvent) {
      const r = el!.getBoundingClientRect();
      target.set((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height);
    }
    function down() {
      targetRadius = uniforms.radius.value * 1.6;
    }
    function up() {
      resize();
    }
    section.addEventListener("pointermove", move as EventListener);
    section.addEventListener("pointerdown", down);
    section.addEventListener("pointerup", up);

    v.addEventListener("loadedmetadata", () => uniforms.videoSize.value.set(v.videoWidth, v.videoHeight));
    v.play().catch(() => {});

    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      if (visible) v.play().catch(() => {});
      else v.pause();
    });
    io.observe(el);

    function frame() {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      // a lente acompanha o ponteiro com um leve atraso, sem animar mais nada
      uniforms.mouse.value.lerp(target, 0.14);
      uniforms.radius.value += (targetRadius - uniforms.radius.value) * 0.12;
      renderer.render(scene, cam);
    }
    frame();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      section.removeEventListener("pointermove", move as EventListener);
      section.removeEventListener("pointerdown", down);
      section.removeEventListener("pointerup", up);
      tex.dispose();
      mat.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div className="hv-media" ref={box}>
      <video
        ref={video}
        className={gl ? "hv-source" : "hv-fallback"}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        autoPlay
        preload="auto"
        aria-hidden="true"
      />
    </div>
  );
}
