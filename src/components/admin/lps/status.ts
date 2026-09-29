import type { StatusLp } from "@/lib/admin/lps.functions";

export const ROTULO_STATUS: Record<
  StatusLp,
  { texto: string; tom: "salvia" | "neutro" | "terracota" }
> = {
  publicada: { texto: "No ar", tom: "salvia" },
  rascunho: { texto: "Rascunho", tom: "neutro" },
  encerrada: { texto: "Encerrada", tom: "terracota" },
};
