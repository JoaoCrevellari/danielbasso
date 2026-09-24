import { Botao } from "./Botao";
import { Titulo } from "./Titulo";

/**
 * Fechamento padrão das páginas: faixa escura com título, texto curto e a ação principal.
 * Mesma altura e estrutura em todas as páginas.
 */
export function ChamadaFinal({
  titulo,
  texto,
  cta,
  secundario,
}: {
  titulo: string;
  texto?: string;
  cta?: { rotulo: string; link: string };
  secundario?: { rotulo: string; link: string };
}) {
  return (
    <section className="superficie-escura grao bg-petroleo-900">
      <div
        className="container-site section-y grid gap-8 md:grid-cols-12 md:items-center md:gap-10"
        data-revelar-grupo
      >
        <div className="md:col-span-8">
          <Titulo as="h2" className="type-h1 text-gelo">
            {titulo}
          </Titulo>
          {texto && (
            <p className="mt-4 max-w-[52ch] text-[1.0625rem] leading-relaxed text-gelo/70">
              {texto}
            </p>
          )}
        </div>
        {(cta?.rotulo || secundario?.rotulo) && (
          <div className="flex flex-col gap-3 sm:flex-row md:col-span-4 md:flex-col md:items-stretch">
            {cta?.rotulo && (
              <Botao href={cta.link} variante="ouro">
                {cta.rotulo}
              </Botao>
            )}
            {secundario?.rotulo && (
              <Botao href={secundario.link} variante="contorno-claro">
                {secundario.rotulo}
              </Botao>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
