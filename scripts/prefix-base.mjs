// Pós-build do GitHub Pages: prefixa com o basePath os caminhos absolutos de arquivos de /public
// (imagens, vídeo, maplibre, JSONs de busca) que aparecem em HTML, JS, CSS e JSON dentro de /out.
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const base = "/click-impresso-site";
const re = /(["'`(])\/(img|video|maplibre|search-index\.json|search-cards\.json)/g;
let files = 0;
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(html|js|mjs|css|json|txt)$/.test(name)) {
      const src = readFileSync(p, "utf8");
      const out = src.replace(re, `$1${base}/$2`);
      if (out !== src) (writeFileSync(p, out), files++);
    }
  }
})(fileURLToPath(new URL("../out", import.meta.url)));
console.log("prefix-base:", files, "arquivos ajustados");
