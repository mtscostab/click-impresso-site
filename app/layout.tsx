import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";
import "./world.css";
import { CartProvider } from "@/lib/cart";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CookieNotice, Toast, WhatsFab } from "@/components/Overlays";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { allCategories } from "@/lib/catalog";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Click Impresso - Gráfica Porto Alegre",
    template: "%s · Click Impresso",
  },
  description:
    "Gráfica expressa do Grupo Impresul: impressos, brindes e comunicação visual com preço por quantidade, prazo claro e 18 lojas no RS e em Curitiba.",
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  themeColor: "#f1f0ec",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={archivo.variable}>
      <body>
        <SmoothScroll />
        <CartProvider>
          <a href="#conteudo" className="skip-link">
            Pular para o conteúdo
          </a>
          <Header
            cats={allCategories("categoria").map(({ slug, name, count }) => ({ slug, name, count }))}
            segs={allCategories("segmento").map(({ slug, name, count }) => ({ slug, name, count }))}
          />
          <main id="conteudo" tabIndex={-1}>{children}</main>
          <Footer />
          <WhatsFab />
          <CookieNotice />
          <Toast />
        </CartProvider>
      </body>
    </html>
  );
}
