import type { Metadata } from "next";
import { WherePage } from "@/components/map/WherePage";

export const metadata: Metadata = { title: "Onde estamos" };

export default function Page() {
  return <WherePage />;
}
