import { nomeEtapa } from "@/content/fields";
import { cn } from "@/lib/utils";

const COR_ETAPA: Record<string, string> = {
  reconstrucao: "text-terracota-texto border-terracota/40",
  autogoverno: "text-petroleo border-petroleo/30",
  transformacao: "text-salvia-texto border-salvia/45",
  lideranca: "text-ouro-texto border-ouro/50",
  performance: "text-grafite border-grafite/30",
};

export function SeloEtapa({
  etapa,
  claro,
  className,
}: {
  etapa?: string;
  claro?: boolean;
  className?: string;
}) {
  const nome = nomeEtapa(etapa);
  if (!nome || !etapa) return null;
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-full border px-3 text-[0.75rem] font-medium tracking-[0.02em]",
        claro ? "border-gelo/30 text-gelo/85" : COR_ETAPA[etapa],
        className,
      )}
    >
      {nome}
    </span>
  );
}

const STATUS: Record<string, { rotulo: string; cor: string }> = {
  aberto: { rotulo: "Inscrições abertas", cor: "bg-salvia/15 text-salvia-texto" },
  espera: { rotulo: "Lista de espera", cor: "bg-ouro/15 text-ouro-texto" },
  "em-breve": { rotulo: "Em breve", cor: "bg-petroleo/8 text-petroleo" },
  encerrado: { rotulo: "Encerrado", cor: "bg-grafite/8 text-cinza" },
  lancado: { rotulo: "Disponível", cor: "bg-salvia/15 text-salvia-texto" },
  "pre-venda": { rotulo: "Pré-venda", cor: "bg-ouro/15 text-ouro-texto" },
};

export function SeloStatus({ status, className }: { status?: string; className?: string }) {
  const s = status ? STATUS[status] : undefined;
  if (!s) return null;
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
