import type { NextConfig } from "next";

// Deploy no GitHub Pages: GH_PAGES=1 gera um site estático em /out servido sob /<repo>.
// Export estático não suporta PPR/cacheComponents, então ficam só fora desse modo.
const pages = process.env.GH_PAGES === "1";

const nextConfig: NextConfig = pages
  ? {
      output: "export",
      basePath: "/click-impresso-site",
      trailingSlash: true,
      images: { unoptimized: true },
    }
  : {
      cacheComponents: true,
      partialPrefetching: true,
    };

export default nextConfig;
