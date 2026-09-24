/**
 * Faixa com as cinco etapas do método correndo na horizontal. Marca a passagem da
 * abertura para o conteúdo e apresenta o vocabulário do método logo de início.
 * O conteúdo é duplicado para o laço ser contínuo; a cópia fica oculta para leitores de tela.
 */
export function FaixaPalavras({ palavras }: { palavras: string[] }) {
  const lista = palavras.filter(Boolean);
  if (!lista.length) return null;
  const serie = (oculta?: boolean) => (
    <ul aria-hidden={oculta || undefined} className="flex shrink-0 items-center">
      {[...lista, ...lista].map((p, n) => (
        <li key={n} className="flex items-center">
          <span className="px-6 font-serif text-[1.35rem] whitespace-nowrap text-gelo/85 italic md:px-10 md:text-[1.75rem]">
            {p}
          </span>
          <span aria-hidden className="size-1.5 rotate-45 bg-ouro" />
        </li>
      ))}
    </ul>
  );
  return (
    <div
      className="overflow-hidden border-y border-gelo/10 bg-petroleo-950 py-5 md:py-6"
      aria-label="Etapas do método"
    >
      <div className="faixa-movimento flex w-max">
        {serie()}
        {serie(true)}
      </div>
    </div>
  );
}
