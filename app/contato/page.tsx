import type { Metadata } from "next";
import { CropMarks } from "@/components/Marks";
import { Icon } from "@/components/Icon";
import { ContactForm } from "@/components/ContactForm";
import { StoresSection } from "@/components/StoresSection";

export const metadata: Metadata = { title: "Contato e lojas" };

export default function ContactPage() {
  return (
    <>
      <div className="wrap" style={{ paddingBottom: "clamp(48px, 6vw, 88px)" }}>
        <header className="page-hero">
          <h1 className="display">Contato</h1>
        </header>
        <div className="text-sheet">
          <CropMarks />
          <div className="contact-grid">
            <div className="contact-lines">
              <a href="tel:+555133810978">
                <Icon name="phone" /> <span className="num">51 3381 0978</span>
              </a>
              <a href="mailto:atendimento@clickimpresso.com.br">
                <Icon name="mail" /> atendimento@clickimpresso.com.br
              </a>
              <p>
                <Icon name="pin" /> Av. Protásio Alves, 6441 · Porto Alegre - RS
              </p>
            </div>
            <ContactForm />
          </div>
        </div>
      </div>
      <StoresSection />
    </>
  );
}
