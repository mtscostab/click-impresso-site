import { CartClient } from "@/components/CartClient";
import { featured, toCard } from "@/lib/catalog";

export default function CartPage() {
  return <CartClient suggestions={featured().slice(0, 10).map(toCard)} />;
}
