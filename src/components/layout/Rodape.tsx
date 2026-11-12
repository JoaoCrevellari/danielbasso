import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "@phosphor-icons/react";

import { urlSegura } from "@/lib/url-segura";

import { useConfig } from "./ConfigContext";
import { LogoCompleto } from "./Logo";
import { RedesSociais } from "./RedesSociais";

/** Rodapé enxuto e centralizado: frase, logo, redes e créditos (a navegação fica no menu). */
export function Rodape() {
  const config = useConfig();
  const ano = new Date().getFullYear();
  const conheca = (config.conheca?.itens ?? [])
    .map((c) => ({ ...c, link: urlSegura(c.link) }))
    .filter((c): c is typeof c & { link: string } => !!c.nome && !!c.link);

  return (
    <footer data-sem-flutuante className="superficie-escura grao bg-petroleo-950">
      <div className="container-site pt-12 pb-8 text-center md:pt-20">
        <p
          data-revelar
          className="mx-auto max-w-[24ch] font-serif text-[clamp(1.6rem,4.2vw,2.9rem)] leading-[1.12] font-[380] tracking-[-0.02em] text-balance text-gelo md:max-w-none"
        >
          {config.rodape.frase}
        </p>

        <div className="mt-8 flex flex-col items-center gap-6 border-t border-linha pt-10 md:mt-14 md:pt-14">
          <LogoCompleto />
          <RedesSociais claro className="flex-wrap justify-center" />
        </div>

        {conheca.length > 0 && (
          <div className="mt-8 flex flex-col items-center gap-3 border-t border-linha pt-6 md:mt-10 md:flex-row md:justify-center md:gap-5">
            <p className="type-meta text-gelo/45">{config.conheca.titulo}</p>
            <ul className="flex flex-col items-center gap-2 md:flex-row md:gap-5">
              {conheca.map((c) => (
                <li key={c.link}>
                  <a
                    href={c.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex min-h-11 items-center gap-1.5 text-[0.9rem] text-gelo/75 transition-colors hover:text-gelo"
                  >
                    {c.nome}
                    {c.nota && <span className="text-gelo/45">({c.nota})</span>}
                    <ArrowUpRight
                      aria-hidden
                      className="size-3.5 text-ouro-claro transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

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
