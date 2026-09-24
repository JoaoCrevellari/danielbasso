import { createFileRoute } from "@tanstack/react-router";

import { PaginaOferta } from "@/components/site/PaginaOferta";
import { carregarDetalhe, headDetalhe } from "@/lib/rotas-conteudo";

export const Route = createFileRoute("/mentorias/$slug")({
  loader: ({ params }) => carregarDetalhe("mentoria", params.slug),
  head: ({ loaderData }) => headDetalhe(loaderData?.item),
  component: Pagina,
});

function Pagina() {
  const { item, relacionados } = Route.useLoaderData();
  return <PaginaOferta item={item} relacionados={relacionados} />;
}
