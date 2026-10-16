import Link from "next/link";
import { Icon } from "../Icon";
import { HeroVideo } from "./HeroVideo";

export function Hero() {
  return (
    <section className="hv" aria-labelledby="hero-title">
      <HeroVideo src="/video/offset-hero.mp4" poster="/video/offset-hero-poster.jpg" />
      <div className="hv-shade" aria-hidden="true" />
      <div className="wrap hv-content">
        <span className="hv-kick">
          <span className="dots" aria-hidden="true">
            <i className="swatch-c" />
            <i className="swatch-m" />
            <i className="swatch-y" />
            <i className="swatch-k" />
          </span>
          Gráfica expressa do Grupo Impresul
        </span>
        <h1 id="hero-title" className="hv-title">
          Impressão rápida com qualidade premiada.
        </h1>
        <p className="hv-lede">
          Cartões, flyers, brindes e comunicação visual saindo do nosso parque gráfico de 10&nbsp;mil&nbsp;m² em Porto
          Alegre para 18 lojas e para todo o Brasil.
        </p>
        <div className="hv-actions">
          <Link href="/produtos" className="btn btn-primary btn-lg">
            Ver produtos e preços
            <span className="arrow">
              <Icon name="arrowRight" size={16} />
            </span>
          </Link>
          <a href="#processos" className="btn btn-lg hv-ghost">
            Como imprimimos
          </a>
        </div>
        <dl className="hv-proof">
          <div>
            <dt>Grupo Impresul</dt>
            <dd className="num">56+ anos</dd>
          </div>
          <div>
            <dt>Lojas</dt>
            <dd className="num">18</dd>
          </div>
          <div>
            <dt>Produtos</dt>
            <dd className="num">+5.000</dd>
          </div>
        </dl>
      </div>
      <p className="hv-hint" aria-hidden="true">
        Passe o cursor sobre a máquina
      </p>
    </section>
  );
}
