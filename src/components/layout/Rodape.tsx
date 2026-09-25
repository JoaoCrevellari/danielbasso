import { Link } from "@tanstack/react-router";

import { useConfig } from "./ConfigContext";
import { LogoCompleto } from "./Logo";
import { RedesSociais } from "./RedesSociais";

/** Rodapé enxuto e centralizado: frase, logo, redes e créditos (a navegação fica no menu). */
export function Rodape() {
  const config = useConfig();
  const ano = new Date().getFullYear();

  return (
    <footer data-sem-flutuante className="superficie-escura grao bg-petroleo-950">
      <div className="container-site pt-12 pb-8 text-center md:pt-20">
        <p
          data-revelar
          className="font-serif text-[min(4.4vw,2.9rem)] leading-[1.1] font-[380] tracking-[-0.02em] whitespace-nowrap text-gelo"
        >
          {config.rodape.frase}
        </p>

        <div className="mt-8 flex flex-col items-center gap-6 border-t border-linha pt-10 md:mt-14 md:pt-14">
          <LogoCompleto />
          <RedesSociais claro className="justify-center" />
        </div>

        <div className="mt-8 flex flex-col items-center gap-4 border-t border-linha pt-6 text-xs text-gelo/45 md:mt-12">
          <p className="leading-relaxed">
            © {ano} Daniel Basso.
            <br />
            Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacidade" className="transition-colors hover:text-gelo">
              Privacidade
            </Link>
            <Link to="/termos" className="transition-colors hover:text-gelo">
              Termos de Uso
            </Link>
          </div>
          <a
            href="https://ylink.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-gelo"
          >
            Desenvolvido pela <span className="font-medium text-gelo/70">Ylink</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
