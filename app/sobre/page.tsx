import type { Metadata } from "next";
import Link from "next/link";
import { CropMarks } from "@/components/Marks";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = { title: "Sobre" };

export default function AboutPage() {
  return (
    <div className="wrap" style={{ paddingBottom: "clamp(48px, 6vw, 96px)" }}>
      <header className="page-hero">
        <h1 className="display">Gráfica expressa com 16 lojas no Rio Grande do Sul com qualidade premiada</h1>
      </header>
      <article className="text-sheet">
        <CropMarks />
        <p>
          A Click Impresso faz parte do Grupo Impresul, referência no setor gráfico há mais de 56 anos e reconhecida como
          a gráfica mais premiada do Sul do Brasil. Nosso prestígio junto ao mercado e à comunidade nacional é resultado
          de um compromisso constante com qualidade de impressão, prazo rápido e atendimento personalizado.
        </p>
        <p>
          Em nosso site, você encontra impressão online rápida e prática de uma ampla variedade de produtos: folhetos,
          flyers, panfletos, cartões de visita, catálogos, PhotoBooks, folders, cartazes e muito mais. É possível criar
          seu material gráfico diretamente na plataforma, escolhendo modelos prontos, desenvolvendo um layout exclusivo
          ou enviando seu arquivo finalizado.
        </p>
        <p>
          Com apenas alguns cliques, você personaliza, escolhe a forma de pagamento e recebe seu material impresso em
          qualquer lugar do Brasil, com a agilidade de uma gráfica expressa e a qualidade de uma gráfica offset e digital
          de alto padrão.
        </p>
        <p>
          Seja para pequenas e médias empresas, profissionais liberais ou clientes individuais, a Click Impresso é a
          solução ideal para impressões rápidas, de alta qualidade e com preço competitivo.
        </p>
        <p>
          Nosso parque gráfico está localizado na Avenida Protásio Alves, 6441, em Porto Alegre/RS, com mais de 10 mil m²
          de estrutura moderna, pronta para atender desde tiragens pequenas até grandes volumes com tecnologia de ponta. É
          da nossa matriz que sai, todos os dias, centenas de produtos que são distribuídos para nossas 16 lojas e também
          para as casas dos nossos clientes.
        </p>
        <p>
          Click Impresso – sua gráfica rápida e online no Rio Grande do Sul para todo o tipo de produtos personalizados,
          cartões de visita, flyers, panfletos, catálogos e muito mais.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
          <Link className="btn btn-primary" href="/produtos">
            Ver produtos <Icon name="arrowRight" size={18} />
          </Link>
          <Link className="btn btn-ghost" href="/contato">
            Encontrar uma loja
          </Link>
        </div>
      </article>
    </div>
  );
}
