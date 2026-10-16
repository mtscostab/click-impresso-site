import * as THREE from "three";

export const INK = {
  c: "#00a0e3",
  m: "#e6007e",
  y: "#ffed00",
  k: "#15161a",
} as const;

export type Channel = keyof typeof INK;

/** Família real servida pelo next/font (o nome é gerado), para o canvas usar a mesma Archivo. */
const F = () => (typeof document !== "undefined" ? getComputedStyle(document.body).fontFamily : "Arial, sans-serif");

const W = 1024;
const H = 704;

function canvas(w = W, h = H) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

function toTexture(c: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/**
 * Arte de um folheto Click separada em quatro chapas.
 * Cada chapa é desenhada só com a tinta dela sobre branco; empilhadas em multiplicação
 * formam a arte final colorida, como na impressão em quatro cores.
 */
function drawChannel(ch: Channel, ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = INK[ch];
  ctx.strokeStyle = INK[ch];

  const blob = (x: number, y: number, r: number) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  };

  if (ch === "c") {
    blob(560, 300, 210);
    blob(380, 380, 110);
    ctx.fillRect(0, 610, W, 94);
    ctx.globalAlpha = 0.35;
    ctx.fillRect(64, 64, 300, 40);
    ctx.globalAlpha = 1;
  }
  if (ch === "m") {
    blob(700, 250, 90);
    blob(820, 250, 52);
    ctx.fillRect(0, 610, W * 0.45, 94);
    ctx.fillRect(64, 520, 260, 54);
  }
  if (ch === "y") {
    blob(250, 230, 96);
    blob(340, 320, 70);
    ctx.fillRect(W * 0.6, 610, W * 0.4, 94);
    ctx.globalAlpha = 0.5;
    blob(900, 120, 60);
    ctx.globalAlpha = 1;
  }
  if (ch === "k") {
    ctx.font = `800 150px ${F()}`;
    ctx.textBaseline = "alphabetic";
    ctx.fillText("Click.", 400, 520);
    ctx.font = `500 48px ${F()}`;
    ctx.fillText("i m p r e s s o", 470, 572);
    ctx.font = `700 30px ${F()}`;
    ctx.fillText("GRÁFICA EXPRESSA", 64, 94);
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) ctx.fillRect(64, 140 + i * 22, 220 - i * 30, 6);
  }
}

const cache = new Map<string, THREE.Texture>();

export function channelTexture(ch: Channel) {
  const key = "ch-" + ch;
  if (cache.has(key)) return cache.get(key)!;
  const c = canvas();
  drawChannel(ch, c.getContext("2d")!);
  const t = toTexture(c);
  cache.set(key, t);
  return t;
}

/** Chapa de alumínio: a separação de um canal vista como chapa (tinta sobre metal claro). */
export function plateTexture(ch: Channel) {
  const key = "plate-" + ch;
  if (cache.has(key)) return cache.get(key)!;
  const c = canvas();
  const ctx = c.getContext("2d")!;
  drawChannel(ch, ctx);
  // troca o branco por alumínio e mantém a tinta
  const img = ctx.getImageData(0, 0, W, H);
  for (let i = 0; i < img.data.length; i += 4) {
    const r = img.data[i];
    const g = img.data[i + 1];
    const b = img.data[i + 2];
    if (r > 245 && g > 245 && b > 245) {
      img.data[i] = 205;
      img.data[i + 1] = 212;
      img.data[i + 2] = 220;
    }
  }
  ctx.putImageData(img, 0, 0);
  const t = toTexture(c);
  cache.set(key, t);
  return t;
}

/** Arte final já composta (para pilhas impressas e cartões). */
export function compositeTexture() {
  const key = "composite";
  if (cache.has(key)) return cache.get(key)!;
  const c = canvas();
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = "multiply";
  for (const ch of ["c", "m", "y", "k"] as Channel[]) {
    const layer = canvas();
    drawChannel(ch, layer.getContext("2d")!);
    ctx.drawImage(layer, 0, 0);
  }
  const t = toTexture(c);
  cache.set(key, t);
  return t;
}

/** Imagem do logotipo (recortada sem o selo de Curitiba) desenhada sobre um fundo. */
export function logoTexture(opts: { bg: string; w?: number; h?: number; scale?: number; onLoad?: () => void }) {
  const key = `logo-${opts.bg}-${opts.w}-${opts.h}-${opts.scale}`;
  if (cache.has(key)) return cache.get(key)!;
  const w = opts.w ?? 1024;
  const h = opts.h ?? 512;
  const c = canvas(w, h);
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = opts.bg;
  ctx.fillRect(0, 0, w, h);
  const t = toTexture(c);
  const img = new Image();
  img.onload = () => {
    const sw = 610;
    const sh = 426;
    const s = (opts.scale ?? 0.6) * Math.min(w / sw, h / sh);
    ctx.drawImage(img, 0, 0, sw, sh, (w - sw * s) / 2, (h - sh * s) / 2, sw * s, sh * s);
    t.needsUpdate = true;
    opts.onLoad?.();
  };
  img.src = "/img/logotipo.png";
  cache.set(key, t);
  return t;
}

/** Cartão de visita: frente azul-marinho com padrão e logo branco aproximado. */
export function cardTexture() {
  const key = "card";
  if (cache.has(key)) return cache.get(key)!;
  const c = canvas(900, 500);
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#1d2d5c";
  ctx.fillRect(0, 0, 900, 500);
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  for (let x = 0; x < 900; x += 60)
    for (let y = 0; y < 500; y += 60) {
      ctx.beginPath();
      ctx.arc(x + ((y / 60) % 2) * 30, y, 18, 0, Math.PI * 2);
      ctx.fill();
    }
  const dots: [string, number, number, number][] = [
    [INK.y, 520, 170, 44],
    [INK.c, 600, 200, 70],
    [INK.m, 660, 175, 30],
  ];
  for (const [col, x, y, r] of dots) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#fff";
  ctx.font = `800 110px ${F()}`;
  ctx.fillText("Click.", 470, 360);
  ctx.font = `500 34px ${F()}`;
  ctx.fillText("i m p r e s s o", 520, 405);
  const t = toTexture(c);
  cache.set(key, t);
  return t;
}

export function photoTexture(src: string) {
  const key = "photo-" + src;
  if (cache.has(key)) return cache.get(key)!;
  const t = new THREE.TextureLoader().load(src);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  cache.set(key, t);
  return t;
}

/** Tela do painel de controle da impressora. */
export function screenTexture(lines: string[], accent: string) {
  const key = "screen-" + lines.join("|") + accent;
  if (cache.has(key)) return cache.get(key)!;
  const c = canvas(512, 320);
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 512, 320);
  g.addColorStop(0, "#0d1420");
  g.addColorStop(1, "#162338");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 320);
  ctx.fillStyle = accent;
  ctx.fillRect(24, 24, 120, 8);
  ctx.fillStyle = "#e8eef8";
  ctx.font = `600 30px ${F()}`;
  lines.forEach((l, i) => ctx.fillText(l, 24, 84 + i * 42));
  const bars = [INK.c, INK.m, INK.y, "#9aa3b2"];
  bars.forEach((b, i) => {
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(24 + i * 120, 250, 100, 40);
    ctx.fillStyle = b;
    ctx.fillRect(24 + i * 120, 250, 40 + i * 14, 40);
  });
  const t = toTexture(c);
  cache.set(key, t);
  return t;
}
