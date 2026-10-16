import type { Metadata } from "next";

export const metadata: Metadata = { title: "Meu carrinho" };

export default function CartLayout({ children }: LayoutProps<"/carrinho">) {
  return children;
}
