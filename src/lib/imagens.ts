/**
 * Tamanhos das imagens enviadas pelo painel (bucket "media").
 *
 * Ao enviar uma foto, o painel grava a imagem principal com a largura no nome
 * (ex.: 2026/09/retrato-a1b2c3-w1600.webp) e, ao lado, versões menores com a largura antes
 * da extensão (retrato-a1b2c3-w1600.480.webp, .960.webp, .1440.webp), só as menores que a
 * original. Pelo nome, o site sabe quais tamanhos existem e monta o srcset sem consultar
 * nada; o celular baixa a versão que cabe na tela.
 */
export const LARGURAS_MIDIA = [480, 960, 1440] as const;

const PRINCIPAL = /^(.*-w(\d{3,4}))\.webp$/;
const VARIANTE = /-w\d{3,4}\.\d{3,4}\.webp$/;

/** Arquivo de tamanho menor (não aparece na biblioteca de mídia). */
export function ehVariante(caminho: string) {
  return VARIANTE.test(caminho);
}

/** Larguras menores que existem para uma imagem principal (vazio se não tiver). */
export function variantesDe(caminhoOuUrl: string): { largura: number; caminho: string }[] {
  const semBusca = caminhoOuUrl.split("?")[0];
  const m = semBusca.match(PRINCIPAL);
  if (!m) return [];
  const original = Number(m[2]);
  return LARGURAS_MIDIA.filter((w) => w < original).map((w) => ({
    largura: w,
    caminho: `${m[1]}.${w}.webp`,
  }));
}

/** srcset de uma imagem do bucket "media" com versões menores; null se não houver. */
export function srcSetMidia(url: string, larguraMax: number) {
  if (!url.includes("/storage/v1/object/public/media/")) return null;
  const m = url.split("?")[0].match(PRINCIPAL);
  if (!m) return null;
  const original = Number(m[2]);
  const menores = variantesDe(url).filter((v) => v.largura <= larguraMax * 2);
  if (!menores.length) return null;
  return {
    src: url,
    srcSet: [...menores.map((v) => `${v.caminho} ${v.largura}w`), `${url} ${original}w`].join(", "),
  };
}
