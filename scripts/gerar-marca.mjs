/**
 * Gera os arquivos da marca a partir do logo enviado (JPG 1024 px, fundo azul chapado):
 *   public/marca/icone.png  – só o monograma "db", branco com transparência (usado como
 *                             máscara em CSS, então a cor vem do site: ouro, petróleo…)
 *   public/marca/logo.png   – logo completo com fundo transparente (ouro + branco)
 *   favicon / ícones do app – monograma dourado sobre o azul petróleo
 * Uso: node scripts/gerar-marca.mjs scripts/marca-original.jpg
 * Quando chegar o logo em vetor (SVG/PDF), prefira usá-lo no lugar destes PNGs.
 */
import sharp from "sharp";

const origem = process.argv[2];
if (!origem) throw new Error("Informe o caminho do logo (JPG/PNG).");

const FUNDO = [0, 56, 73];
const OURO = [250, 187, 56];
const BRANCO = [255, 255, 255];
const PETROLEO = { r: 0, g: 63, b: 92 };

const { data, info } = await sharp(origem).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width;

/** Quanto do pixel é a cor `c` sobre o fundo (0–1) e o erro dessa explicação. */
function mistura(p, c) {
  const d = c.map((v, i) => v - FUNDO[i]);
  const q = p.map((v, i) => v - FUNDO[i]);
  const n = d.reduce((s, v) => s + v * v, 0);
  const a = Math.max(0, Math.min(1, q.reduce((s, v, i) => s + v * d[i], 0) / n));
  const erro = q.reduce((s, v, i) => s + (v - a * d[i]) ** 2, 0);
  return [a, erro];
}

function recorte(x0, y0, x1, y1, cores, corSaida) {
  const w = x1 - x0, h = y1 - y0;
  const out = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = ((y + y0) * W + (x + x0)) * 3;
      const p = [data[i], data[i + 1], data[i + 2]];
      let melhor = [0, Infinity, cores[0]];
      for (const c of cores) {
        const [a, e] = mistura(p, c);
        if (e < melhor[1]) melhor = [a, e, c];
      }
      let [a, , c] = melhor;
      if (a < 0.04) a = 0; // ruído do JPG no fundo
      const cor = corSaida ?? c;
      const o = (y * w + x) * 4;
      out[o] = cor[0]; out[o + 1] = cor[1]; out[o + 2] = cor[2]; out[o + 3] = Math.round(a * 255);
    }
  return sharp(out, { raw: { width: w, height: h, channels: 4 } });
}

// Caixas medidas no arquivo original (monograma: 347–654 × 155–447).
const icone = await recorte(343, 151, 659, 452, [OURO], BRANCO).png().toBuffer();
await sharp(icone).toFile("public/marca/icone.png");
await recorte(36, 151, 990, 650, [OURO, BRANCO]).png().toFile("public/marca/logo.png");

// Ícones: monograma dourado centralizado no azul petróleo.
const iconeOuro = await recorte(343, 151, 659, 452, [OURO]).png().toBuffer();
for (const [nome, lado, raio] of [
  ["favicon-48.png", 48, 0.18],
  ["apple-touch-icon.png", 180, 0],
  ["icon-192.png", 192, 0],
  ["icon-512.png", 512, 0],
]) {
  const tam = Math.round(lado * 0.62);
  const marca = await sharp(iconeOuro).resize(tam, tam, { fit: "inside" }).toBuffer();
  const r = Math.round(lado * raio);
  const base = sharp({
    create: { width: lado, height: lado, channels: 4, background: { ...PETROLEO, alpha: 1 } },
  });
  let img = base.composite([{ input: marca, gravity: "center" }]);
  if (r) {
    const mascara = Buffer.from(
      `<svg width="${lado}" height="${lado}"><rect width="${lado}" height="${lado}" rx="${r}" fill="#fff"/></svg>`,
    );
    img = sharp(await img.png().toBuffer()).composite([{ input: mascara, blend: "dest-in" }]);
  }
  await img.png().toFile(`public/${nome}`);
}
console.log("ok");
