import { nomeEtapa } from "@/content/fields";
import { cn } from "@/lib/utils";

const COR_ETAPA: Record<string, string> = {
  clareza: "text-terracota-texto border-terracota/40",
  ordem: "text-petroleo border-petroleo/30",
  progresso: "text-salvia-texto border-salvia/45",
  excelencia: "text-ouro-texto border-ouro/50",
  legado: "text-grafite border-grafite/30",
};

export function SeloEtapa({
  etapa,
  rotulo,
  claro,
  className,
}: {
  etapa?: string;
  /** Texto próprio no lugar do nome da etapa (ex.: etiqueta das mentorias). */
  rotulo?: string;
  claro?: boolean;
  className?: string;
}) {
  const nome = rotulo || nomeEtapa(etapa);
  if (!nome) return null;
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-full border px-3 text-[0.75rem] font-medium tracking-[0.02em]",
        claro ? "border-gelo/30 text-gelo/85" : (COR_ETAPA[etapa ?? ""] ?? COR_ETAPA.legado),
        className,
      )}
    >
      {nome}
    </span>
  );
}

const STATUS: Record<string, { rotulo: string; cor: string }> = {
  disponivel: { rotulo: "Disponível", cor: "bg-salvia/15 text-salvia-texto" },
  "sob-consulta": { rotulo: "Sob consulta", cor: "bg-petroleo/8 text-petroleo" },
  aplicacao: { rotulo: "Por aplicação", cor: "bg-ouro/10 text-ouro-texto" },
  aberto: { rotulo: "Inscrições abertas", cor: "bg-salvia/15 text-salvia-texto" },
  espera: { rotulo: "Lista de espera", cor: "bg-ouro/10 text-ouro-texto" },
  "em-breve": { rotulo: "Em breve", cor: "bg-petroleo/8 text-petroleo" },
  encerrado: { rotulo: "Encerrado", cor: "bg-grafite/8 text-cinza" },
  lancado: { rotulo: "Disponível", cor: "bg-salvia/15 text-salvia-texto" },
  "pre-venda": { rotulo: "Pré-venda", cor: "bg-ouro/10 text-ouro-texto" },
};

export function SeloStatus({
  status,
  ano,
  className,
}: {
  status?: string;
  /** Livros "em breve" com ano viram "Lançamento em <ano>". */
  ano?: string;
  className?: string;
}) {
  const base = status ? STATUS[status] : undefined;
  if (!base) return null;
  const s = status === "em-breve" && ano ? { ...base, rotulo: `Lançamento em ${ano}` } : base;
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-full px-3 text-[0.75rem] font-medium",
        s.cor,
        className,
      )}
    >
      {s.rotulo}
    </span>
  );
}
