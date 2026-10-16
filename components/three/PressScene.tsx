"use client";

import { useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, RoundedBox } from "@react-three/drei";
import { channelTexture, compositeTexture, INK, plateTexture, screenTexture, type Channel } from "./textures";

/* ------------------------------------------------------------------ */
/* Linha do tempo do scroll (0 → 1)                                    */
/* ------------------------------------------------------------------ */

export const CHAPTERS = [
  { id: "pre", from: 0, to: 0.22 },
  { id: "offset", from: 0.22, to: 0.58 },
  { id: "acabamento", from: 0.58, to: 0.76 },
  { id: "digital", from: 0.76, to: 1 },
] as const;

const UNITS: { ch: Channel; x: number }[] = [
  { ch: "c", x: -3.75 },
  { ch: "m", x: -1.25 },
  { ch: "y", x: 1.25 },
  { ch: "k", x: 3.75 },
];
const FEED_X = -7.2;
const DELIVERY_X = 7.4;
const CUTTER_X = 11.2;
const DIGITAL_X = 18.5;

const SHEET_W = 1.7;
const SHEET_H = 1.17;
const SHEET_Y = 1.02;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const range = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
const smooth = (t: number) => t * t * (3 - 2 * t);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/** posição x da folha conforme o progresso */
function sheetX(p: number) {
  const a = range(p, 0.24, 0.56);
  const b = range(p, 0.58, 0.63);
  if (p < 0.58) return THREE.MathUtils.lerp(FEED_X, DELIVERY_X, smooth(a));
  return THREE.MathUtils.lerp(DELIVERY_X, CUTTER_X, smooth(b));
}

type Key = { p: number; pos: [number, number, number]; tgt: [number, number, number] };

const KEYS: Key[] = [
  { p: 0, pos: [-1, 7.6, 18.5], tgt: [0, 3.2, 0] },
  { p: 0.12, pos: [-2.5, 6.4, 15.5], tgt: [0, 3.3, 0] },
  { p: 0.22, pos: [-10.5, 4.6, 12.5], tgt: [-4.5, 1.5, 0] },
  { p: 0.3, pos: [-8.2, 2.6, 13], tgt: [-4.2, 1.3, 0.4] },
  { p: 0.56, pos: [5.4, 2.8, 13], tgt: [6.8, 1.3, 0.4] },
  { p: 0.64, pos: [9.2, 4.8, 10.5], tgt: [11.2, 1.6, 0] },
  { p: 0.74, pos: [12.4, 4.6, 10.5], tgt: [11.4, 2.4, 0] },
  { p: 0.84, pos: [15, 4.6, 13.5], tgt: [18.2, 1.7, 0] },
  { p: 1, pos: [24.2, 4, 11.2], tgt: [18.0, 1.6, 0] },
];

function cameraAt(p: number, pos: THREE.Vector3, tgt: THREE.Vector3) {
  let i = 0;
  while (i < KEYS.length - 2 && p > KEYS[i + 1].p) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const t = smooth(range(p, a.p, b.p));
  pos.set(
    THREE.MathUtils.lerp(a.pos[0], b.pos[0], t),
    THREE.MathUtils.lerp(a.pos[1], b.pos[1], t),
    THREE.MathUtils.lerp(a.pos[2], b.pos[2], t),
  );
  tgt.set(
    THREE.MathUtils.lerp(a.tgt[0], b.tgt[0], t),
    THREE.MathUtils.lerp(a.tgt[1], b.tgt[1], t),
    THREE.MathUtils.lerp(a.tgt[2], b.tgt[2], t),
  );
}

/* ------------------------------------------------------------------ */
/* Materiais                                                            */
/* ------------------------------------------------------------------ */

function useMats() {
  return useMemo(
    () => ({
      body: new THREE.MeshStandardMaterial({ color: "#d9dce0", metalness: 0.25, roughness: 0.38 }),
      bodyDark: new THREE.MeshStandardMaterial({ color: "#2a2e35", metalness: 0.4, roughness: 0.45 }),
      trim: new THREE.MeshStandardMaterial({ color: "#3b4049", metalness: 0.5, roughness: 0.35 }),
      steel: new THREE.MeshStandardMaterial({ color: "#b8bec7", metalness: 0.9, roughness: 0.22 }),
      roller: new THREE.MeshStandardMaterial({ color: "#1d2026", metalness: 0.2, roughness: 0.6 }),
      glass: new THREE.MeshPhysicalMaterial({ color: "#9fb6c9", metalness: 0, roughness: 0.05, transparent: true, opacity: 0.12 }),
      white: new THREE.MeshStandardMaterial({ color: "#f3f4f6", metalness: 0.1, roughness: 0.35 }),
      paper: new THREE.MeshStandardMaterial({ color: "#fbfbf9", roughness: 0.9 }),
      floor: new THREE.MeshStandardMaterial({ color: "#e9e8e4", roughness: 1 }),
    }),
    [],
  );
}

type Mats = ReturnType<typeof useMats>;

/* Folha em quatro cores: cada canal entra multiplicando o papel, como tinta sobre tinta */
function useSheetMaterial() {
  return useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          c: { value: channelTexture("c") },
          m: { value: channelTexture("m") },
          y: { value: channelTexture("y") },
          k: { value: channelTexture("k") },
          amt: { value: new THREE.Vector4(0, 0, 0, 0) },
        },
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `uniform sampler2D c; uniform sampler2D m; uniform sampler2D y; uniform sampler2D k; uniform vec4 amt; varying vec2 vUv;
          vec3 lin(vec3 s){ return pow(s, vec3(2.2)); }
          void main(){
            vec3 col = vec3(1.0);
            col *= mix(vec3(1.0), lin(texture2D(c, vUv).rgb), amt.x);
            col *= mix(vec3(1.0), lin(texture2D(m, vUv).rgb), amt.y);
            col *= mix(vec3(1.0), lin(texture2D(y, vUv).rgb), amt.z);
            col *= mix(vec3(1.0), lin(texture2D(k, vUv).rgb), amt.w);
            gl_FragColor = vec4(pow(col, vec3(1.0/2.2)), 1.0);
          }`,
        side: THREE.DoubleSide,
      }),
    [],
  );
}

/* ------------------------------------------------------------------ */
/* Peças da offset                                                      */
/* ------------------------------------------------------------------ */

function Rollers({ mats, ink, speedRef }: { mats: Mats; ink: string; speedRef: MutableRefObject<number> }) {
  const g = useRef<THREE.Group>(null);
  const inkMat = useMemo(() => new THREE.MeshStandardMaterial({ color: ink, roughness: 0.25, metalness: 0.15 }), [ink]);
  const blanket = useMemo(() => new THREE.MeshStandardMaterial({ color: "#2b3a4a", roughness: 0.7 }), []);
  useFrame((_, dt) => {
    if (!g.current) return;
    g.current.children.forEach((c, i) => {
      c.rotation.y += dt * speedRef.current * (i % 2 ? -1 : 1) * (i >= 3 ? 1.8 : 1);
    });
  });
  // cilindros com o canal de pinças aberto, para o giro ficar visível
  const open = Math.PI * 1.94;
  return (
    <group ref={g} position={[0, 0, -0.38]}>
      <mesh material={inkMat} position={[0, 2.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 1.45, 40, 1, false, 0, open]} />
      </mesh>
      <mesh material={blanket} position={[0, 1.44, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 1.45, 40, 1, false, 1, open]} />
      </mesh>
      <mesh material={mats.steel} position={[0, 0.72, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 1.45, 40, 1, false, 2, open]} />
      </mesh>
      {[0.36, -0.34, 0.02].map((x, i) => (
        <mesh key={x} material={i === 2 ? mats.steel : inkMat} position={[x, 2.66 + (i === 2 ? 0.2 : 0), 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 1.4, 24]} />
        </mesh>
      ))}
    </group>
  );
}

function PrintUnit({ x, ch, mats, speedRef, glowRef }: { x: number; ch: Channel; mats: Mats; speedRef: MutableRefObject<number>; glowRef: MutableRefObject<number[]> }) {
  const idx = UNITS.findIndex((u) => u.ch === ch);
  const lamp = useMemo(() => new THREE.MeshStandardMaterial({ color: INK[ch], emissive: INK[ch], emissiveIntensity: 0.2 }), [ch]);
  useFrame(() => {
    lamp.emissiveIntensity = 0.25 + glowRef.current[idx] * 2.4;
  });
  const vents = [0, 1, 2, 3, 4];
  return (
    <group position={[x, 0, 0]}>
      {/* laterais da torre, recortadas na frente para mostrar os cilindros */}
      <RoundedBox args={[2.3, 3.0, 0.3]} radius={0.06} position={[0, 1.86, -1.18]} material={mats.body} />
      <RoundedBox args={[0.2, 3.0, 2.5]} radius={0.05} position={[-1.05, 1.86, 0]} material={mats.body} />
      <RoundedBox args={[0.2, 3.0, 2.5]} radius={0.05} position={[1.05, 1.86, 0]} material={mats.body} />
      {/* ventilação nas laterais */}
      {vents.map((v) => (
        <mesh key={v} material={mats.trim} position={[1.152, 2.4 - v * 0.12, 0.5]}>
          <boxGeometry args={[0.01, 0.04, 0.9]} />
        </mesh>
      ))}
      {/* travessa frontal baixa com o painel de cor */}
      <RoundedBox args={[2.3, 0.42, 0.3]} radius={0.06} position={[0, 0.58, 1.12]} material={mats.body} />
      <mesh position={[0, 0.58, 1.28]} material={lamp}>
        <boxGeometry args={[0.5, 0.08, 0.01]} />
      </mesh>
      {/* tampa curva do entintador */}
      <RoundedBox args={[2.3, 0.72, 2.75]} radius={0.3} smoothness={6} position={[0, 3.62, 0]} material={mats.body} />
      <RoundedBox args={[2.32, 0.12, 2.77]} radius={0.04} position={[0, 3.28, 0]} material={mats.trim} />
      <mesh position={[0, 3.7, 1.39]} material={lamp}>
        <boxGeometry args={[1.0, 0.12, 0.02]} />
      </mesh>
      {/* corrimão sobre a torre */}
      {[-0.8, 0.8].map((z) => (
        <mesh key={z} material={mats.steel} position={[0, 4.2, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 2.1, 12]} />
        </mesh>
      ))}
      {[-0.95, 0.95].map((xx) =>
        [-0.8, 0.8].map((z) => (
          <mesh key={`${xx}${z}`} material={mats.steel} position={[xx, 4.08, z]}>
            <cylinderGeometry args={[0.025, 0.025, 0.26, 10]} />
          </mesh>
        )),
      )}
      {/* vidro de proteção */}
      <mesh position={[0, 1.95, 1.1]} material={mats.glass}>
        <boxGeometry args={[1.9, 2.3, 0.02]} />
      </mesh>
      <Rollers mats={mats} ink={INK[ch]} speedRef={speedRef} />
    </group>
  );
}

/** Base contínua e passarela frontal que unem as quatro torres. */
function PressBase({ mats }: { mats: Mats }) {
  const grate = useMemo(() => new THREE.MeshStandardMaterial({ color: "#7d838c", metalness: 0.8, roughness: 0.4 }), []);
  const left = FEED_X - 1.95;
  const right = DELIVERY_X + 2.2;
  const len = right - left;
  const mid = (left + right) / 2;
  return (
    <group>
      <RoundedBox args={[len, 0.4, 2.9]} radius={0.08} position={[mid, 0.2, 0]} material={mats.bodyDark} />
      <mesh position={[mid, 0.405, 0]} material={mats.trim}>
        <boxGeometry args={[len - 0.1, 0.01, 2.7]} />
      </mesh>
      {/* passarela */}
      <RoundedBox args={[len - 3, 0.12, 0.9]} radius={0.03} position={[mid, 0.32, 1.95]} material={grate} />
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} material={mats.bodyDark} position={[left + 1.8 + i * ((len - 3.6) / 5), 0.13, 1.95]}>
          <boxGeometry args={[0.12, 0.26, 0.7]} />
        </mesh>
      ))}
    </group>
  );
}

function Feeder({ mats, p }: { mats: Mats; p: MutableRefObject<number> }) {
  const pile = useRef<THREE.Group>(null);
  useFrame(() => {
    if (pile.current) pile.current.position.y = 0.62 + range(p.current, 0.24, 0.56) * 0.14;
  });
  return (
    <group position={[FEED_X - 0.6, 0, 0]}>
      <RoundedBox args={[0.24, 3.0, 2.6]} radius={0.06} position={[-1.2, 1.9, 0]} material={mats.body} />
      <RoundedBox args={[0.2, 3.0, 0.3]} radius={0.05} position={[1.0, 1.9, -1.15]} material={mats.body} />
      <RoundedBox args={[2.6, 0.55, 2.7]} radius={0.22} smoothness={6} position={[0, 3.3, 0]} material={mats.body} />
      <RoundedBox args={[2.62, 0.1, 2.72]} radius={0.04} position={[0, 3.0, 0]} material={mats.trim} />
      {/* cabeça de sucção */}
      <mesh material={mats.trim} position={[0.6, 2.25, 0]}>
        <boxGeometry args={[0.5, 0.25, 1.4]} />
      </mesh>
      <group ref={pile}>
        {Array.from({ length: 16 }, (_, i) => (
          <mesh key={i} material={mats.paper} position={[0, i * 0.035, 0]}>
            <boxGeometry args={[SHEET_W, 0.03, SHEET_H]} />
          </mesh>
        ))}
      </group>
      <mesh material={mats.steel} position={[0, 0.58, 0]}>
        <boxGeometry args={[2.0, 0.06, 1.5]} />
      </mesh>
    </group>
  );
}

function Delivery({ mats, p }: { mats: Mats; p: MutableRefObject<number> }) {
  const stack = useRef<THREE.Group>(null);
  const tex = compositeTexture();
  const top = useMemo(() => new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 }), [tex]);
  useFrame(() => {
    if (!stack.current) return;
    const n = Math.round(range(p.current, 0.4, 0.6) * 10);
    stack.current.children.forEach((c, i) => (c.visible = i < n));
  });
  return (
    <group position={[DELIVERY_X + 0.6, 0, 0]}>
      {/* estrutura da saída com cobertura transparente */}
      <RoundedBox args={[3.2, 0.3, 0.26]} radius={0.06} position={[0, 2.7, -1.2]} material={mats.body} />
      <RoundedBox args={[3.2, 0.3, 0.26]} radius={0.06} position={[0, 2.7, 1.2]} material={mats.body} />
      <RoundedBox args={[0.3, 2.6, 2.7]} radius={0.06} position={[1.5, 1.6, 0]} material={mats.body} />
      <mesh position={[-0.05, 2.86, 0]} material={mats.glass}>
        <boxGeometry args={[3.0, 0.02, 2.4]} />
      </mesh>
      {[-1.2, 1.2].map((z) => (
        <mesh key={z} material={mats.trim} position={[0, 1.4, z]}>
          <boxGeometry args={[3.0, 0.06, 0.06]} />
        </mesh>
      ))}
      <group ref={stack} position={[0, 0.46, 0]}>
        {Array.from({ length: 10 }, (_, i) => (
          <group key={i} position={[0, i * 0.035, 0]}>
            <mesh material={mats.paper}>
              <boxGeometry args={[SHEET_W, 0.03, SHEET_H]} />
            </mesh>
            <mesh material={top} position={[0, 0.016, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[SHEET_W, SHEET_H]} />
            </mesh>
          </group>
        ))}
      </group>
      {/* console de comando ao lado da saída */}
      <group position={[0.6, 0, 3.2]} rotation={[0, -0.35, 0]}>
        <RoundedBox args={[1.7, 1.05, 0.8]} radius={0.1} position={[0, 0.52, 0]} material={mats.bodyDark} />
        <RoundedBox args={[1.8, 0.1, 0.95]} radius={0.04} position={[0, 1.08, 0.05]} material={mats.trim} />
        <mesh position={[0, 1.5, -0.25]} rotation={[-0.35, 0, 0]}>
          <planeGeometry args={[1.4, 0.85]} />
          <meshBasicMaterial map={screenTexture(["Offset Heidelberg", "4 cores · CMYK"], INK.m)} toneMapped={false} />
        </mesh>
        <mesh position={[0, 1.5, -0.27]} rotation={[-0.35, 0, 0]} material={mats.bodyDark}>
          <boxGeometry args={[1.5, 0.95, 0.04]} />
        </mesh>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Folha que atravessa a máquina                                        */
/* ------------------------------------------------------------------ */

function TravelingSheet({ p }: { p: MutableRefObject<number> }) {
  const g = useRef<THREE.Group>(null);
  const mat = useSheetMaterial();
  useFrame(() => {
    if (!g.current) return;
    const v = p.current;
    const x = sheetX(v);
    g.current.position.x = x;
    g.current.visible = v > 0.235 && v < 0.645;
    g.current.rotation.z = Math.sin(x * 1.6) * 0.015;
    const a = mat.uniforms.amt.value as THREE.Vector4;
    const amt = UNITS.map((u) => smooth(range(x, u.x - 0.6, u.x + 0.5)));
    a.set(amt[0], amt[1], amt[2], amt[3]);
  });
  return (
    <group ref={g} position={[FEED_X, SHEET_Y, 0.5]}>
      <mesh material={mat} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[SHEET_W, SHEET_H]} />
      </mesh>
    </group>
  );
}

/* Chapas CMYK flutuando acima da máquina: a separação de cores */
function Plates({ p }: { p: MutableRefObject<number> }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const mats = useMemo(
    () =>
      UNITS.map(
        (u) =>
          new THREE.MeshStandardMaterial({
            map: plateTexture(u.ch),
            metalness: 0.55,
            roughness: 0.3,
            transparent: true,
            side: THREE.DoubleSide,
          }),
      ),
    [],
  );
  const finalMat = useMemo(() => new THREE.MeshStandardMaterial({ map: compositeTexture(), roughness: 0.7, transparent: true, side: THREE.DoubleSide }), []);
  const finalRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const v = p.current;
    const split = easeOut(range(v, 0.03, 0.12));
    const fly = smooth(range(v, 0.14, 0.22));
    const t = state.clock.elapsedTime;
    if (finalRef.current) {
      finalRef.current.position.set(0, 5.4 + Math.sin(t) * 0.05, 0.6);
      finalRef.current.rotation.set(-0.25, 0, 0);
      const s = 1 - split * 0.4;
      finalRef.current.scale.setScalar(2.4 * s);
      finalMat.opacity = 1 - range(v, 0.04, 0.1);
      finalRef.current.visible = finalMat.opacity > 0.01;
    }
    refs.current.forEach((m, i) => {
      if (!m) return;
      const u = UNITS[i];
      const fanX = THREE.MathUtils.lerp(0, u.x, split);
      const fanZ = THREE.MathUtils.lerp(0.6 - i * 0.02, 0.4, split);
      const y = THREE.MathUtils.lerp(5.4, 3.95, fly) + Math.sin(t * 1.2 + i) * 0.05 * (1 - fly);
      m.position.set(fanX, y, fanZ);
      m.rotation.set(THREE.MathUtils.lerp(-0.25, -Math.PI / 2, fly), 0, 0);
      m.scale.setScalar(THREE.MathUtils.lerp(2.4 * (1 - split * 0.25), 1.2, fly));
      mats[i].opacity = clamp01(range(v, 0.02, 0.06)) * (1 - range(v, 0.2, 0.235));
      m.visible = mats[i].opacity > 0.01;
    });
  });
  return (
    <group>
      <mesh ref={finalRef} material={finalMat}>
        <planeGeometry args={[1, 0.6875]} />
      </mesh>
      {UNITS.map((u, i) => (
        <mesh key={u.ch} ref={(el) => void (refs.current[i] = el)} material={mats[i]}>
          <planeGeometry args={[1, 0.6875]} />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Acabamento: guilhotina e cartões                                     */
/* ------------------------------------------------------------------ */

function Cutter({ p, mats }: { p: MutableRefObject<number>; mats: Mats }) {
  const blade = useRef<THREE.Group>(null);
  const cards = useRef<THREE.Group>(null);
  const sheetMat = useMemo(() => new THREE.MeshStandardMaterial({ map: compositeTexture(), roughness: 0.8 }), []);
  const cardGeoms = useMemo(() => {
    // corta a arte em 8 cartões (4 x 2), cada um com o pedaço certo da textura
    const list: { geo: THREE.PlaneGeometry; x: number; z: number }[] = [];
    const cols = 4;
    const rows = 2;
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const w = SHEET_W / cols;
        const h = SHEET_H / rows;
        const geo = new THREE.PlaneGeometry(w * 0.96, h * 0.96);
        const uv = geo.attributes.uv as THREE.BufferAttribute;
        for (let i = 0; i < uv.count; i++) {
          uv.setXY(i, (c + uv.getX(i)) / cols, (rows - 1 - r + uv.getY(i)) / rows);
        }
        list.push({ geo, x: -SHEET_W / 2 + w * (c + 0.5), z: -SHEET_H / 2 + h * (r + 0.5) });
      }
    return list;
  }, []);

  useFrame((state) => {
    const v = p.current;
    const drop = range(v, 0.63, 0.665);
    const lift = range(v, 0.665, 0.7);
    const down = drop < 1 ? drop * drop : 1 - smooth(lift);
    if (blade.current) blade.current.position.y = 2.6 - 1.42 * down;
    const spread = easeOut(range(v, 0.665, 0.75));
    const t = state.clock.elapsedTime;
    if (cards.current) {
      cards.current.visible = v > 0.645;
      cards.current.children.forEach((c, i) => {
        const d = cardGeoms[i];
        const angle = (i / cardGeoms.length) * Math.PI * 2;
        c.position.set(
          d.x * (1 + spread * 1.5),
          SHEET_Y + 0.05 + spread * (1.3 + (i < 4 ? 0.75 : 0)) + Math.sin(t * 1.4 + i) * 0.05 * spread,
          d.z * (1 - spread * 0.6) + spread * 1.2,
        );
        c.rotation.set(-Math.PI / 2 + spread * (Math.PI / 2 - 0.4), spread * ((i % 4) - 1.5) * 0.18, spread * (i % 2 ? 0.08 : -0.08));
        c.scale.setScalar(1 + spread * 0.25);
      });
    }
  });

  return (
    <group position={[CUTTER_X, 0, 0.2]}>
      <RoundedBox args={[3, 0.9, 2.6]} radius={0.08} position={[0, 0.45, -0.2]} material={mats.bodyDark} />
      <mesh position={[0, 0.91, -0.2]} material={mats.steel}>
        <boxGeometry args={[2.8, 0.02, 2.4]} />
      </mesh>
      <RoundedBox args={[0.3, 3.2, 0.5]} radius={0.06} position={[-1.35, 2.3, -0.9]} material={mats.body} />
      <RoundedBox args={[0.3, 3.2, 0.5]} radius={0.06} position={[1.35, 2.3, -0.9]} material={mats.body} />
      <RoundedBox args={[3, 0.5, 0.6]} radius={0.08} position={[0, 3.9, -0.9]} material={mats.body} />
      <group ref={blade} position={[0, 2.6, 0]}>
        <RoundedBox args={[2.6, 0.5, 0.3]} radius={0.04} material={mats.trim} />
        <mesh position={[0, -0.3, 0.05]} material={mats.steel}>
          <boxGeometry args={[2.5, 0.12, 0.04]} />
        </mesh>
      </group>
      <group ref={cards}>
        {cardGeoms.map((c, i) => (
          <mesh key={i} geometry={c.geo} material={sheetMat} />
        ))}
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Impressão digital (produção digital Konica Minolta)                 */
/* ------------------------------------------------------------------ */

function DigitalPress({ p, mats }: { p: MutableRefObject<number>; mats: Mats }) {
  const out = useRef<THREE.Group>(null);
  const led = useMemo(() => new THREE.MeshStandardMaterial({ color: INK.c, emissive: INK.c, emissiveIntensity: 1.5 }), []);
  const sheetMat = useMemo(() => new THREE.MeshStandardMaterial({ map: compositeTexture(), roughness: 0.8, side: THREE.DoubleSide }), []);
  const dark = useMemo(() => new THREE.MeshStandardMaterial({ color: "#4a505a", metalness: 0.3, roughness: 0.4 }), []);
  const seam = useMemo(() => new THREE.MeshStandardMaterial({ color: "#c9ccd1", roughness: 0.5 }), []);
  useFrame((state) => {
    const v = p.current;
    const active = range(v, 0.76, 0.84);
    led.emissiveIntensity = 0.4 + active * (1.5 + Math.sin(state.clock.elapsedTime * 6) * 0.5);
    if (!out.current) return;
    const t = state.clock.elapsedTime;
    const n = out.current.children.length;
    out.current.children.forEach((c, i) => {
      const cyc = ((t * 0.45 + i / n) % 1) * active;
      c.position.set(2.15 + cyc * 1.1, 1.42 - cyc * 0.1 - i * 0.003, 0.1);
      c.rotation.set(-Math.PI / 2, 0, -0.08);
      c.visible = active > 0.02;
    });
  });
  return (
    <group position={[DIGITAL_X, 0, 0]}>
      {/* módulo de alimentação com três gavetas e pilha de papel na bandeja lateral */}
      <RoundedBox args={[2.1, 2.0, 2.3]} radius={0.12} position={[-2.85, 1.0, 0]} material={mats.white} />
      {[0.5, 1.08, 1.66].map((y) => (
        <group key={y}>
          <mesh position={[-2.85, y - 0.24, 1.155]} material={seam}>
            <boxGeometry args={[2.0, 0.02, 0.01]} />
          </mesh>
          <mesh position={[-2.85, y, 1.17]} material={dark}>
            <boxGeometry args={[0.7, 0.06, 0.03]} />
          </mesh>
        </group>
      ))}
      <RoundedBox args={[0.24, 0.36, 2.3]} radius={0.06} position={[-2.85, 0.18, 0]} material={dark} />
      {/* corpo principal com portas frontais */}
      <RoundedBox args={[3.3, 2.5, 2.4]} radius={0.14} position={[-0.05, 1.25, 0]} material={mats.white} />
      <RoundedBox args={[3.32, 0.32, 2.42]} radius={0.1} position={[-0.05, 0.16, 0]} material={dark} />
      <mesh position={[-0.05, 1.9, 1.205]} material={led}>
        <boxGeometry args={[2.6, 0.04, 0.02]} />
      </mesh>
      {[-0.9, 0.8].map((x) => (
        <mesh key={x} position={[x, 1.0, 1.205]} material={seam}>
          <boxGeometry args={[0.015, 1.45, 0.01]} />
        </mesh>
      ))}
      {[-1.15, 0.6].map((x) => (
        <mesh key={x} position={[x, 1.25, 1.22]} material={dark}>
          <boxGeometry args={[0.05, 0.4, 0.04]} />
        </mesh>
      ))}
      {/* scanner no topo e painel touch */}
      <RoundedBox args={[2.5, 0.34, 2.1]} radius={0.1} position={[-0.3, 2.66, -0.05]} material={dark} />
      <mesh position={[-0.3, 2.84, -0.05]} material={mats.glass}>
        <boxGeometry args={[2.1, 0.01, 1.6]} />
      </mesh>
      {/* braço do painel: parafusado no tampo do corpo, segura a tela acima dele */}
      <mesh position={[1.25, 2.52, 0.85]} material={dark}>
        <cylinderGeometry args={[0.16, 0.18, 0.05, 24]} />
      </mesh>
      <mesh position={[1.25, 3.06, 0.85]} material={mats.steel}>
        <cylinderGeometry args={[0.045, 0.045, 1.08, 12]} />
      </mesh>
      <group position={[1.27, 3.62, 0.93]} rotation={[-0.38, -0.4, 0]}>
        <RoundedBox args={[1.05, 0.68, 0.06]} radius={0.03} material={dark} />
        <mesh position={[0, 0, 0.035]}>
          <planeGeometry args={[0.96, 0.59]} />
          <meshBasicMaterial map={screenTexture(["Konica Minolta", "Produção digital"], INK.c)} toneMapped={false} />
        </mesh>
      </group>
      {/* empilhador de saída */}
      <RoundedBox args={[1.7, 0.95, 2.1]} radius={0.1} position={[2.55, 0.48, 0]} material={mats.white} />
      <mesh position={[2.55, 1.32, 0.1]} rotation={[0, 0, -0.08]} material={mats.steel}>
        <boxGeometry args={[1.7, 0.04, 1.45]} />
      </mesh>
      <group ref={out}>
        {Array.from({ length: 5 }, (_, i) => (
          <mesh key={i} material={sheetMat}>
            <planeGeometry args={[SHEET_W * 0.7, SHEET_H * 0.7]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Câmera e cena                                                         */
/* ------------------------------------------------------------------ */

function Rig({ p, smoothP }: { p: MutableRefObject<number>; smoothP: MutableRefObject<number> }) {
  const { camera, size, pointer } = useThree();
  const pos = useMemo(() => new THREE.Vector3(), []);
  const tgt = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(0, 3, 0), []);
  useFrame((_, dt) => {
    smoothP.current = THREE.MathUtils.damp(smoothP.current, p.current, 4.5, dt);
    cameraAt(smoothP.current, pos, tgt);
    const narrow = size.width / size.height < 1;
    if (narrow) {
      pos.sub(tgt).multiplyScalar(1.22).add(tgt);
      tgt.y += 0.4;
    } else {
      // enquadra a máquina à direita, deixando o texto respirar à esquerda
      const pan = size.width > 1100 ? 2.4 : 1.2;
      pos.x -= pan;
      tgt.x -= pan;
      pos.y += 0.6;
      tgt.y += 0.5;
    }
    pos.x += pointer.x * 0.6;
    pos.y += pointer.y * 0.35;
    camera.position.lerp(pos, 1 - Math.exp(-dt * 6));
    look.lerp(tgt, 1 - Math.exp(-dt * 6));
    camera.lookAt(look);
  });
  return null;
}

function Scene({ progress }: { progress: MutableRefObject<number> }) {
  const mats = useMats();
  const smoothP = useRef(0);
  const speed = useRef(1);
  const glow = useRef([0, 0, 0, 0]);
  useFrame(() => {
    const v = smoothP.current;
    const x = sheetX(v);
    speed.current = v > 0.22 && v < 0.6 ? 4.5 : 1.2;
    glow.current = UNITS.map((u) => (v > 0.22 && v < 0.6 ? Math.max(0, 1 - Math.abs(x - u.x) / 1.3) : 0));
  });

  return (
    <>
      <Rig p={progress} smoothP={smoothP} />
      <color attach="background" args={["#eceae6"]} />
      <fog attach="fog" args={["#eceae6", 18, 42]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[6, 12, 8]} intensity={1.4} castShadow={false} />
      <Environment resolution={256} frames={1}>
        <Lightformer intensity={2.2} position={[0, 6, 4]} scale={[14, 3, 1]} />
        <Lightformer intensity={1.2} position={[-10, 3, 2]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} />
        <Lightformer intensity={1.2} position={[10, 3, -2]} rotation-y={-Math.PI / 2} scale={[8, 3, 1]} />
        <Lightformer intensity={0.8} color={INK.c} position={[-6, 1, -6]} scale={[6, 2, 1]} />
        <Lightformer intensity={0.8} color={INK.m} position={[6, 1, -6]} scale={[6, 2, 1]} />
      </Environment>

      <group>
        <PressBase mats={mats} />
        <Feeder mats={mats} p={smoothP} />
        {UNITS.map((u) => (
          <PrintUnit key={u.ch} x={u.x} ch={u.ch} mats={mats} speedRef={speed} glowRef={glow} />
        ))}
        <Delivery mats={mats} p={smoothP} />
        <TravelingSheet p={smoothP} />
        <Plates p={smoothP} />
        <Cutter p={smoothP} mats={mats} />
        <DigitalPress p={smoothP} mats={mats} />
      </group>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[6, -0.001, 0]} material={mats.floor}>
        <planeGeometry args={[80, 40]} />
      </mesh>
      <ContactShadows position={[6, 0.001, 0]} scale={[44, 14]} resolution={1024} blur={2.4} opacity={0.5} far={5} frames={1} />
    </>
  );
}

export default function PressScene({ progress }: { progress: MutableRefObject<number> }) {
  return (
    <Canvas
      camera={{ fov: 34, position: [0, 8, 17], near: 0.1, far: 80 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <Scene progress={progress} />
    </Canvas>
  );
}
