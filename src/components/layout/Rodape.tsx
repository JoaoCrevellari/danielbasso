import { Link } from "@tanstack/react-router";

import { NAV_PRINCIPAL, NAV_SECUNDARIA } from "@/lib/site";
import { useConfig } from "./ConfigContext";
import { Logo } from "./Logo";
import { RedesSociais } from "./RedesSociais";

const COLUNAS = [NAV_PRINCIPAL.slice(0, 3), NAV_PRINCIPAL.slice(3), NAV_SECUNDARIA];

export function Rodape() {
  const config = useConfig();
  const ano = new Date().getFullYear();

  return (
    <footer data-sem-flutuante className="superficie-escura grao bg-petroleo-950">
      <div className="container-site pt-12 pb-8 md:pt-20">
        <p
          data-revelar
          className="font-serif text-[min(4.4vw,2.9rem)] leading-[1.1] font-[380] tracking-[-0.02em] whitespace-nowrap text-gelo"
        >
          {config.rodape.frase}
        </p>

        <div className="mt-8 grid gap-8 border-t border-linha pt-8 md:mt-14 md:grid-cols-[1fr_1.6fr] md:gap-10 md:pt-12">
          <div className="flex flex-col gap-6">
            <Logo claro />
            <p className="max-w-sm text-sm leading-relaxed text-gelo/60 max-md:hidden">
              Cursos, mentorias, treinamentos corporativos e livros sobre reconstrução, autogoverno
              e liderança.
            </p>
            <RedesSociais claro className="-ml-3" />
          </div>

          {/* Três colunas (3 · 4 · 3 links) em qualquer largura */}
          <nav aria-label="Rodapé" className="grid grid-cols-3 gap-x-4 md:gap-x-8">
            {COLUNAS.map((coluna, n) => (
              <ul key={n} className="flex flex-col">
                {coluna.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="inline-flex min-h-10 items-center text-[0.875rem] text-gelo/70 transition-colors hover:text-ouro md:text-[0.9375rem]"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ))}
          </nav>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4 border-t border-linha pt-6 text-center text-xs text-gelo/45 md:mt-14">
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
