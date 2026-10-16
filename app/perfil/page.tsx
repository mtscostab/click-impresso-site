import type { Metadata } from "next";
import { Profile } from "@/components/Profile";

export const metadata: Metadata = { title: "Meu perfil" };

export default function Page() {
  return <Profile />;
}
