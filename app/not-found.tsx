import Link from "next/link";
import { Icon } from "@/components/Icon";

export default function NotFound() {
  return (
    <div className="wrap not-found">
      <p className="display">404</p>
      <h1 className="h-sub">Essa página saiu fora do refile.</h1>
      <p className="lede">O endereço pode ter mudado. Busque o produto ou volte para o início.</p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link className="btn btn-primary" href="/produtos">
          Ver produtos <Icon name="arrowRight" size={18} />
        </Link>
        <Link className="btn btn-ghost" href="/">
          Início
        </Link>
      </div>
    </div>
  );
}
