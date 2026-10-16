import type { Metadata } from "next";
import Link from "next/link";
import { CropMarks } from "@/components/Marks";

export const metadata: Metadata = { title: "Ajuda" };

const topics = [
  {
    title: "Log in",
    text: "Para começar NUNCA esqueça de fazer Login. Somente através dele é que os projetos são salvos e enviados para impressão, caso não tenha cadastro conosco basta clicar em “Cadastre-se”.",
  },
  {
    title: "Criar layout",
    text: "No ClickImpresso você poderá criar o Seu LayOut ou enviar um arquivo pronto, clicando “Crie Seu Layout” você terá as opções de produtos, selecione o produto, em seguida selecione o formato e finalmente o layout que mais lhe agrada, lembrando que todos os produtos possuem um Layout em branco para que você possa desenvolver o seu projeto desde o início.",
  },
  {
    title: "Meus pedidos",
    text: "Esta área mantém todos os seus arquivos ou Layouts desenvolvidos no ClickImpresso, aqui você poderá visualizar seus Layouts, edita-los, calcular o custo de impressão, adiciona-los ao carrinho de compra ou excluí-los.",
  },
  {
    title: "Carrinho de compra",
    text: "Aqui estarão organizados os layouts do seu pedido, você poderá adicionar quantos Layouts quiser para efetuar o pagamento de uma única vez, dentro do carrinho de compras você irá visualizar a lista de compras, a soma dos valores e a opção de frete, verifique a sua listas de compras e clique em “Compra via Internet”, depois é só escolher a forma de pagamento.",
  },
];

export default function HelpPage() {
  return (
    <div className="wrap" style={{ paddingBottom: "clamp(48px, 6vw, 96px)" }}>
      <header className="page-hero">
        <h1 className="display">Manual de uso</h1>
        <p className="lede">
          Através de nosso site criar photobooks, cartões, banners,... ficou muito mais fácil e rápido! Com ações muito
          práticas e diretas, em muito pouco tempo você tem seu projeto pronto.
        </p>
      </header>
      <div className="text-sheet">
        <CropMarks />
        <div className="help-grid">
          {topics.map((t) => (
            <article key={t.title}>
              <h2 className="h-sub">{t.title}</h2>
              <p>{t.text}</p>
            </article>
          ))}
        </div>
        <p>
          Ainda com dúvida? <Link href="/contato">Fale com a loja mais próxima</Link> ou chame no WhatsApp.
        </p>
      </div>
    </div>
  );
}
