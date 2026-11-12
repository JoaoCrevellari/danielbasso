/**
 * Gera public/compartilhamento-v3.jpg (1200×630), a imagem que aparece quando o link do
 * site é enviado no WhatsApp ou nas redes. Parte da v2 (foto, logo e fundo) e troca a
 * frase de assinatura pela frase da campanha (pedido do Daniel, 12/11/2026).
 *
 * A frase antiga é apagada com um filtro de mediana (some com as letras finas e mantém o
 * degradê do fundo), aplicado com bordas suaves para não aparecer remendo. O texto novo
 * usa a Newsreader itálica, a mesma do site.
 *
 * Uso: node scripts/gerar-compartilhamento.mjs
 */
import sharp from "sharp";

const BASE = "public/compartilhamento-v2.jpg";
const SAIDA = "public/compartilhamento-v3.jpg";
const FONTE =
  "node_modules/@fontsource-variable/newsreader/files/newsreader-latin-opsz-italic.woff2";

const CENTRO_X = 437; // centro da coluna do logo
// Área da frase antiga, com folga para a borda suave.
const AREA = { left: 290, top: 362, width: 300, height: 96 };
const BORDA = 18;

const limpo = await sharp(BASE).extract(AREA).median(25).blur(3).toBuffer();
const mascara = await sharp(
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${AREA.width}" height="${AREA.height}">
      <filter id="f"><feGaussianBlur stdDeviation="${BORDA / 2}"/></filter>
      <rect x="${BORDA}" y="${BORDA}" width="${AREA.width - 2 * BORDA}" height="${AREA.height - 2 * BORDA}" fill="#fff" filter="url(#f)"/>
    </svg>`,
  ),
)
  .extractChannel(0)
  .toBuffer();
const remendo = await sharp(limpo).joinChannel(mascara).png().toBuffer();

const frase = await sharp({
  text: {
    text:
      '<span foreground="#F5F5F2">Você não perdeu o controle\nda sua vida. Você </span>' +
      '<span foreground="#E6C36A">entregou,\nsem perceber.</span>',
    font: "Newsreader Italic 25",
    fontfile: FONTE,
    width: 340,
    align: "centre",
    rgba: true,
    spacing: 6,
  },
})
  .png()
  .toBuffer();
const { width: lf = 0, height: af = 0 } = await sharp(frase).metadata();

await sharp(BASE)
  .composite([
    { input: remendo, left: AREA.left, top: AREA.top },
    { input: frase, left: Math.round(CENTRO_X - lf / 2), top: 376 },
  ])
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile(SAIDA);

console.log(`${SAIDA}: frase ${lf}×${af}`);
