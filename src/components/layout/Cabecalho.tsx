import { Link, useMatches, useRouterState } from "@tanstack/react-router";
import { List } from "@phosphor-icons/react";
import { useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useState } from "react";

import { Botao } from "@/components/site/Botao";
import { NAV_PRINCIPAL } from "@/lib/site";
import { cn } from "@/lib/utils";
import { useConfig } from "./ConfigContext";
import { Logo } from "./Logo";
import { MenuMovel } from "./MenuMovel";

/**
 * Cabeçalho fixo. Sobre aberturas escuras (rotas com staticData.cabecalho = "escuro")
 * começa transparente com texto claro e vira sólido ao rolar. Fica sempre visível.
 */
export function Cabecalho() {
  const matches = useMatches();
  const escuroNoTopo = matches.some((m) => m.staticData?.cabecalho === "escuro");
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const config = useConfig();

  const { scrollY } = useScroll();
  const [rolou, setRolou] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setRolou(y > 24));

  // Nova página: menu fechado.
  useEffect(() => {
    setMenuAberto(false);
    setRolou(window.scrollY > 24);
  }, [pathname]);

  const transparente = escuroNoTopo && !rolou;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[var(--z-header)] transition-[background-color,box-shadow,backdrop-filter] duration-300",
          transparente
            ? "bg-transparent"
            : "bg-gelo/88 shadow-[0_1px_0_var(--color-linha)] backdrop-blur-md supports-[not(backdrop-filter:blur(0))]:bg-gelo",
        )}
      >
        {config.apresentacao.aviso_exemplo && (
          <p className="flex h-[var(--aviso-h)] items-center justify-center truncate bg-ouro px-4 text-center text-[0.75rem] font-medium text-petroleo-950">
            {config.apresentacao.aviso_texto}
          </p>
        )}
        <div className="container-site flex h-[var(--header-h)] items-center justify-between gap-6">
          <Logo claro={transparente} />

          <nav aria-label="Principal" className="hidden items-center gap-7 xl:flex">
            {NAV_PRINCIPAL.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "relative py-2 text-[0.9375rem] transition-colors",
                  "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-ouro after:transition-transform after:duration-300 after:ease-[var(--ease-out)] hover:after:scale-x-100",
                  "data-[status=active]:after:scale-x-100",
                  transparente
                    ? "text-gelo/85 hover:text-gelo"
                    : "text-grafite hover:text-petroleo",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {pathname !== "/diagnostico" && (
              <Botao
                href="/diagnostico"
                variante={transparente ? "ouro" : "primario"}
                className="hidden min-h-11 px-5 text-sm md:inline-flex"
                seta={false}
              >
                Fazer o diagnóstico
              </Botao>
            )}
            <button
              type="button"
              onClick={() => setMenuAberto(true)}
              aria-label="Abrir menu"
              aria-expanded={menuAberto}
              className={cn(
                "-mr-2 inline-flex size-12 items-center justify-center rounded-full transition-colors xl:hidden",
                transparente ? "text-gelo hover:bg-gelo/10" : "text-petroleo hover:bg-petroleo/5",
              )}
            >
              <List className="size-6" weight="light" />
            </button>
          </div>
        </div>
      </header>
      <MenuMovel aberto={menuAberto} onFechar={() => setMenuAberto(false)} />
    </>
  );
}
