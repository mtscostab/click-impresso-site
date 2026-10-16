import Link from "next/link";
import { ColorBar } from "./Marks";
import { allCategories } from "@/lib/catalog";
import { whatsapp } from "@/lib/stores";

const payments = ["visa", "master", "elo", "american", "discover", "diners", "hipercard", "jcb", "boleto"];

export function Footer() {
  return (
    <footer className="site-footer">
      <ColorBar />
      <div className="wrap footer-grid">
        <div className="footer-brand">
          <img src="/img/logotipo.png" alt="Click Impresso" width={150} height={64} />
          <p>
            Gráfica expressa do Grupo Impresul. Parque gráfico na Av. Protásio Alves, 6441, Porto Alegre/RS.
          </p>
        </div>
        <nav aria-labelledby="f-prod">
          <h2 className="label" id="f-prod">Produtos</h2>
          <ul>
            {allCategories("categoria")
              .filter((c) => c.slug !== "promocao" && c.slug !== "lancamentos")
              .sort((a, b) => b.count - a.count)
              .slice(0, 8)
              .map((c) => (
                <li key={c.slug}>
                  <Link href={`/categoria/${c.slug}`}>{c.name}</Link>
                </li>
              ))}
            <li>
              <Link href="/produtos">Todos os produtos</Link>
            </li>
          </ul>
        </nav>
        <nav aria-labelledby="f-click">
          <h2 className="label" id="f-click">Click Impresso</h2>
          <ul>
            <li><Link href="/sobre">Sobre</Link></li>
            <li><Link href="/ajuda">Ajuda</Link></li>
            <li><Link href="/onde-estamos">Onde estamos</Link></li>
            <li><Link href="/#contato">Contato</Link></li>
            <li><Link href="/perfil">Meu perfil</Link></li>
            <li><Link href="/carrinho">Meu carrinho</Link></li>
            <li>
              <a href="https://www.clickimpresso.com.br/termo-de-uso" target="_blank" rel="noreferrer">
                Política de Uso, Cookies e Privacidade
              </a>
            </li>
          </ul>
        </nav>
        <div>
          <h2 className="label">WhatsApp</h2>
          <ul>
            {whatsapp.map((w) => (
              <li key={w.label}>
                <a href={w.href} target="_blank" rel="noreferrer">
                  {w.label}: <span className="num">{w.display}</span>
                </a>
              </li>
            ))}
          </ul>
          <h2 className="label" style={{ marginTop: 24 }}>Formas de pagamento</h2>
          <div className="payments">
            {payments.map((p) => (
              <img key={p} src={`/img/pagamento/${p}.png`} alt={p} height={30} />
            ))}
          </div>
        </div>
      </div>
      <div className="wrap footer-base">
        <span>© Click Impresso · Grupo Impresul</span>
        <span>atendimento@clickimpresso.com.br · 51 3381 0978</span>
      </div>
    </footer>
  );
}
