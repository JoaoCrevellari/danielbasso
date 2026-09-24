import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, CircleNotch, Clock, WarningCircle } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useState, type FormEvent } from "react";

import { Botao, classeBotao } from "@/components/site/Botao";
import { CampoTexto, mascararTelefone } from "@/components/site/Campo";
import { Titulo, semDestaque } from "@/components/site/Titulo";
import { ETAPAS, nomeEtapa } from "@/content/fields";
import type { DiagnosticoConteudo } from "@/content/paginas/diagnostico";
import { contextoDoVisitante, registrar } from "@/lib/analytics";
import { carregarPaginas } from "@/lib/conteudo";
import { enviarLeadFn } from "@/lib/leads.functions";
import { buildMeta, canonical } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/diagnostico")({
  staticData: { semFlutuante: true },
  loader: () => carregarPaginas(["diagnostico", "metodo"]),
  head: ({ loaderData }) => ({
    meta: buildMeta({
      title: "Diagnóstico de Autogoverno",
      description: semDestaque(loaderData?.diagnostico.intro.subtitulo),
      path: "/diagnostico",
    }),
    links: canonical("/diagnostico"),
  }),
  component: Diagnostico,
});

type Fase = "intro" | "perguntas" | "captura" | "resultado";
const EASE = [0.16, 1, 0.3, 1] as const;
const CHAVE = "db_diagnostico";

/** Média de 1 a 5 por etapa e a etapa-foco (menor média; empate fica com a que vem antes). */
function calcular(perguntas: { etapa: string }[], respostas: (number | null)[]) {
  const pontuacao: Record<string, number> = {};
  for (const e of ETAPAS) {
    const notas = perguntas
      .map((p, n) => (p.etapa === e.value ? respostas[n] : null))
      .filter((v): v is number => typeof v === "number");
    if (notas.length)
      pontuacao[e.value] = Math.round((notas.reduce((a, b) => a + b, 0) / notas.length) * 10) / 10;
  }
  const foco = ETAPAS.map((e) => e.value)
    .filter((k) => k in pontuacao)
    .reduce<string | null>(
      (menor, k) => (menor === null || pontuacao[k] < pontuacao[menor] ? k : menor),
      null,
    );
  return { pontuacao, foco: foco ?? "autogoverno" };
}

function Diagnostico() {
  const { diagnostico: d, metodo } = Route.useLoaderData();
  const perguntas = d.perguntas.itens.filter((p) => p.texto?.trim());
  const escala = d.escala.itens.slice(0, 5);
  const reduzir = useReducedMotion();

  const [fase, setFase] = useState<Fase>("intro");
  const [atual, setAtual] = useState(0);
  const [respostas, setRespostas] = useState<(number | null)[]>(() => perguntas.map(() => null));
  const [direcao, setDirecao] = useState(1);

  // Retoma um diagnóstico interrompido (mesma aba).
  useEffect(() => {
    try {
      const salvo = JSON.parse(sessionStorage.getItem(CHAVE) ?? "null");
      if (salvo && Array.isArray(salvo.respostas) && salvo.respostas.length === perguntas.length) {
        setRespostas(salvo.respostas);
        setFase(
          salvo.fase === "resultado" ? "resultado" : salvo.fase === "captura" ? "captura" : "intro",
        );
      }
    } catch {
      /* sem armazenamento */
    }
  }, [perguntas.length]);
  useEffect(() => {
    try {
      sessionStorage.setItem(CHAVE, JSON.stringify({ respostas, fase }));
    } catch {
      /* sem armazenamento */
    }
  }, [respostas, fase]);

  const resultado = useMemo(() => calcular(perguntas, respostas), [perguntas, respostas]);

  function comecar() {
    registrar("diagnostico_inicio");
    setFase("perguntas");
    setAtual(0);
    window.scrollTo({ top: 0, behavior: reduzir ? "instant" : "smooth" });
  }

  function responder(valor: number) {
    const novas = [...respostas];
    novas[atual] = valor;
    setRespostas(novas);
    setDirecao(1);
    window.setTimeout(() => {
      if (atual < perguntas.length - 1) setAtual((a) => a + 1);
      else setFase("captura");
    }, 260);
  }

  function voltar() {
    setDirecao(-1);
    if (atual > 0) setAtual((a) => a - 1);
    else setFase("intro");
  }

  function refazer() {
    setRespostas(perguntas.map(() => null));
    setAtual(0);
    setFase("intro");
  }

  const pergunta = perguntas[atual];
  const progresso = fase === "perguntas" ? atual / perguntas.length : fase === "intro" ? 0 : 1;

  return (
    <section className="pt-cabecalho">
      <div className="container-site flex min-h-[calc(100dvh-var(--header-h))] flex-col py-10 md:py-16">
        {/* Progresso */}
        {fase !== "intro" && fase !== "resultado" && (
          <div className="mb-10 flex items-center gap-4">
            <button
              type="button"
              onClick={
                fase === "captura"
                  ? () => {
                      setFase("perguntas");
                      setAtual(perguntas.length - 1);
                    }
                  : voltar
              }
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-linha-forte text-petroleo transition-colors hover:border-petroleo"
              aria-label="Voltar"
            >
              <ArrowLeft className="size-5" />
            </button>
            <div
              className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-linha"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={perguntas.length}
              aria-valuenow={fase === "perguntas" ? atual : perguntas.length}
              aria-label="Progresso do diagnóstico"
            >
              <motion.span
                className="absolute inset-y-0 left-0 w-full origin-left bg-ouro"
                animate={{ scaleX: progresso }}
                transition={{ duration: 0.5, ease: EASE }}
              />
            </div>
            <span className="type-meta w-14 shrink-0 text-right text-cinza">
              {fase === "perguntas" ? `${atual + 1} de ${perguntas.length}` : "Final"}
            </span>
          </div>
        )}

        <div className="flex flex-1 flex-col justify-center">
          <AnimatePresence mode="wait" custom={direcao} initial={false}>
            {fase === "intro" && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="grid gap-12 lg:grid-cols-12"
              >
                <div className="lg:col-span-7">
                  <Titulo as="h1" className="type-display pb-1 text-petroleo">
                    {d.intro.titulo}
                  </Titulo>
                  <p className="type-lead mt-7 max-w-xl text-cinza">{d.intro.subtitulo}</p>
                  <div className="mt-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                    <button type="button" onClick={comecar} className={classeBotao("primario")}>
                      {d.intro.botao}
                    </button>
                    <span className="inline-flex items-center gap-2 text-cinza">
                      <Clock className="size-5" /> {d.intro.tempo} · {perguntas.length} afirmações
                    </span>
                  </div>
                </div>
                <ol className="flex flex-col gap-3 self-center lg:col-span-4 lg:col-start-9">
                  {metodo.etapas.itens.map((e, n) => (
                    <li
                      key={e.chave}
                      className="flex items-baseline gap-4 border-b border-linha pb-3"
                    >
                      <span className="type-numeral w-5 text-ouro-texto">{n + 1}</span>
                      <span className="font-serif text-[1.35rem] text-petroleo">{e.nome}</span>
                    </li>
                  ))}
                </ol>
              </motion.div>
            )}

            {fase === "perguntas" && pergunta && (
              <motion.div
                key={`p${atual}`}
                custom={direcao}
                initial={reduzir ? { opacity: 0 } : { opacity: 0, x: direcao * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduzir ? { opacity: 0 } : { opacity: 0, x: direcao * -40 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="mx-auto w-full max-w-3xl"
              >
                <p className="type-eyebrow text-ouro-texto">{nomeEtapa(pergunta.etapa)}</p>
                <h1 className="mt-5 font-serif text-[clamp(1.55rem,1.15rem+1.6vw,2.3rem)] leading-[1.18] tracking-[-0.015em] text-petroleo">
                  {pergunta.texto}
                </h1>
                <fieldset className="mt-10">
                  <legend className="sr-only">Quanto você concorda?</legend>
                  <div className="grid gap-2.5 sm:grid-cols-5 sm:gap-3">
                    {escala.map((rotulo, n) => {
                      const valor = n + 1;
                      const marcado = respostas[atual] === valor;
                      return (
                        <button
                          key={rotulo}
                          type="button"
                          onClick={() => responder(valor)}
                          aria-pressed={marcado}
                          className={cn(
                            "group flex min-h-14 items-center gap-4 rounded-[2px] border px-5 text-left transition-all duration-200 active:scale-[0.98] sm:min-h-28 sm:flex-col sm:items-start sm:justify-between sm:px-4 sm:py-4",
                            marcado
                              ? "border-petroleo bg-petroleo text-gelo"
                              : "border-linha-forte bg-papel text-petroleo-900 hover:border-petroleo hover:bg-petroleo-50",
                          )}
                        >
                          <span
                            className={cn(
                              "type-numeral text-[1.6rem] leading-none",
                              marcado ? "text-ouro" : "text-ouro-texto",
                            )}
                          >
                            {valor}
                          </span>
                          <span className="text-[0.9375rem] leading-snug">{rotulo}</span>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              </motion.div>
            )}

            {fase === "captura" && (
              <Captura
                key="captura"
                titulo={d.captura.titulo}
                texto={d.captura.texto}
                respostas={respostas}
                resultado={resultado}
                onConcluir={() => {
                  registrar("diagnostico_fim", { label: nomeEtapa(resultado.foco) });
                  setFase("resultado");
                  window.scrollTo({ top: 0, behavior: reduzir ? "instant" : "smooth" });
                }}
              />
            )}

            {fase === "resultado" && (
              <Resultado key="resultado" d={d} resultado={resultado} onRefazer={refazer} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function Captura({
  titulo,
  texto,
  respostas,
  resultado,
  onConcluir,
}: {
  titulo: string;
  texto: string;
  respostas: (number | null)[];
  resultado: ReturnType<typeof calcular>;
  onConcluir: () => void;
}) {
  const [enviando, setEnviando] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [telefone, setTelefone] = useState("");

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const nome = String(f.get("name") ?? "").trim();
    const email = String(f.get("email") ?? "").trim();
    const novos: Record<string, string> = {};
    if (nome.length < 2) novos.name = "Informe seu nome.";
    if (!email && !telefone) novos.email = "Informe um e-mail ou WhatsApp.";
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) novos.email = "Confira o e-mail.";
    setErros(novos);
    if (Object.keys(novos).length) return;
    setEnviando(true);
    try {
      await enviarLeadFn({
        data: {
          kind: "diagnostico",
          name: nome,
          email,
          phone: telefone,
          subject: `Diagnóstico: ${nomeEtapa(resultado.foco)}`,
          website: String(f.get("website") ?? "") || undefined,
          data: { respostas, pontuacao: resultado.pontuacao, foco: resultado.foco },
          ...contextoDoVisitante(),
        },
      });
      onConcluir();
    } catch (err) {
      setErros({
        geral:
          err instanceof Error && err.message.length < 140
            ? err.message
            : "Não foi possível enviar. Tente de novo.",
      });
      setEnviando(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="mx-auto grid w-full max-w-4xl gap-10 md:grid-cols-2 md:gap-14"
    >
      <div>
        <h1 className="type-h1 text-petroleo">{titulo}</h1>
        <p className="type-lead mt-5 text-cinza">{texto}</p>
      </div>
      <form noValidate onSubmit={enviar} className="flex flex-col gap-5">
        <CampoTexto name="name" rotulo="Nome" autoComplete="name" erro={erros.name} />
        <CampoTexto
          name="email"
          type="email"
          rotulo="E-mail"
          autoComplete="email"
          inputMode="email"
          erro={erros.email}
        />
        <CampoTexto
          name="phone"
          type="tel"
          rotulo="WhatsApp"
          opcional
          autoComplete="tel-national"
          inputMode="tel"
          value={telefone}
          onChange={(e) => setTelefone(mascararTelefone(e.target.value))}
          placeholder="(11) 90000-0000"
        />
        <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <input name="website" tabIndex={-1} autoComplete="off" />
        </div>
        {erros.geral && (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-[2px] bg-terracota/10 px-4 py-3 text-[0.9rem] text-terracota-texto"
          >
            <WarningCircle className="mt-0.5 size-5 shrink-0" /> {erros.geral}
          </p>
        )}
        <button type="submit" disabled={enviando} className={classeBotao("primario", "w-full")}>
          {enviando ? (
            <>
              <CircleNotch className="size-4 animate-spin" /> Calculando
            </>
          ) : (
            "Ver meu resultado"
          )}
        </button>
        <p className="text-[0.8125rem] text-cinza">
          Ao continuar, você concorda com a{" "}
          <a href="/privacidade" className="underline underline-offset-2">
            Política de Privacidade
          </a>
          .
        </p>
      </form>
    </motion.div>
  );
}

function Resultado({
  d,
  resultado,
  onRefazer,
}: {
  d: DiagnosticoConteudo;
  resultado: ReturnType<typeof calcular>;
  onRefazer: () => void;
}) {
  const analise =
    d.resultados.itens.find((r) => r.etapa === resultado.foco) ?? d.resultados.itens[0];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="grid gap-14 lg:grid-cols-12"
    >
      <div className="lg:col-span-7">
        <p className="type-eyebrow text-ouro-texto">Seu resultado</p>
        {analise && (
          <>
            <Titulo as="h1" className="type-h1 mt-5 pb-1 text-petroleo">
              {analise.titulo}
            </Titulo>
            <p className="type-lead mt-6 max-w-xl text-grafite">{analise.texto}</p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {analise.link && (
                <Botao href={analise.link}>{`Conhecer: ${analise.recomendacao}`}</Botao>
              )}
              <Botao
                href="whatsapp"
                variante="contorno"
                mensagemWhatsApp={`Olá, Daniel. Fiz o diagnóstico e meu próximo passo é ${nomeEtapa(resultado.foco)}. Gostaria de conversar.`}
              >
                Conversar sobre o resultado
              </Botao>
            </div>
          </>
        )}
        <button
          type="button"
          onClick={onRefazer}
          className="mt-10 text-sm text-cinza underline underline-offset-4 hover:text-petroleo"
        >
          Refazer o diagnóstico
        </button>
      </div>

      {/* Perfil por etapa: cinco marcas por linha, sem barra de fundo */}
      <div className="lg:col-span-4 lg:col-start-9">
        <h2 className="type-h3 text-petroleo">Seu perfil</h2>
        <ul className="mt-6 flex flex-col">
          {ETAPAS.map((e) => {
            const nota = resultado.pontuacao[e.value] ?? 0;
            const foco = e.value === resultado.foco;
            return (
              <li
                key={e.value}
                className="flex items-center justify-between gap-4 border-b border-linha py-4"
              >
                <span
                  className={cn(
                    "font-serif text-[1.2rem]",
                    foco ? "text-ouro-texto" : "text-petroleo",
                  )}
                >
                  {e.label}
                  {foco && (
                    <span className="ml-2 font-sans text-xs tracking-wide text-ouro-texto">
                      foco
                    </span>
                  )}
                </span>
                <span className="flex items-center gap-3">
                  <span className="flex gap-1" aria-hidden>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <motion.span
                        key={n}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 + n * 0.06, duration: 0.3 }}
                        className={cn(
                          "size-2.5 rounded-full",
                          n <= Math.round(nota)
                            ? foco
                              ? "bg-ouro"
                              : "bg-petroleo"
                            : "border border-linha-forte",
                        )}
                      />
                    ))}
                  </span>
                  <span className="type-numeral w-8 text-right text-lg text-petroleo">
                    {nota.toFixed(1).replace(".", ",")}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-[0.8125rem] text-cinza">
          Médias de 1 a 5. A etapa-foco é a de menor média.
        </p>
      </div>
    </motion.div>
  );
}
