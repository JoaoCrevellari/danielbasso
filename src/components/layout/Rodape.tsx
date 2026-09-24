import { Link } from "@tanstack/react-router";

import { NAV_PRINCIPAL, NAV_SECUNDARIA } from "@/lib/site";
import { useConfig } from "./ConfigContext";
import { Logo } from "./Logo";
import { RedesSociais } from "./RedesSociais";

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

        <div className="mt-8 grid gap-8 border-t border-linha pt-8 md:mt-14 md:grid-cols-[1.4fr_1fr_1fr] md:gap-10 md:pt-12">
          <div className="flex flex-col gap-6">
            <Logo claro />
            <p className="max-w-sm text-sm leading-relaxed text-gelo/60 max-md:hidden">
              Cursos, mentorias, treinamentos corporativos e livros sobre reconstrução, autogoverno
              e liderança.
            </p>
            <RedesSociais claro className="-ml-3" />
          </div>

          <nav aria-label="Rodapé">
            <ul className="grid grid-cols-2 gap-x-6 gap-y-1 md:grid-cols-1">
              {NAV_PRINCIPAL.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="inline-flex min-h-10 items-center text-[0.9375rem] text-gelo/70 transition-colors hover:text-ouro"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-1">
            {NAV_SECUNDARIA.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="inline-flex min-h-10 items-center text-[0.9375rem] text-gelo/70 transition-colors hover:text-ouro"
              >
                {item.label}
              </Link>
            ))}
            {config.contato.email && (
              <a
                href={`mailto:${config.contato.email}`}
                className="mt-4 text-[0.9375rem] break-all text-gelo/90 transition-colors hover:text-ouro"
              >
                {config.contato.email}
              </a>
            )}
            {config.contato.cidade && (
              <p className="text-sm text-gelo/50">{config.contato.cidade}</p>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-linha pt-6 md:mt-14 text-xs text-gelo/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {ano} Daniel Basso. Todos os direitos reservados.</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link to="/privacidade" className="transition-colors hover:text-gelo">
              Privacidade
            </Link>
            <Link to="/entrar" className="transition-colors hover:text-gelo">
              Área restrita
            </Link>
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
      </div>
    </footer>
  );
}
