import { Link } from "@tanstack/react-router";
import { CheckCircle, CircleNotch, WarningCircle } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState, type FormEvent } from "react";

import { contextoDoVisitante, registrar } from "@/lib/analytics";
import { enviarLeadFn, type LeadEntrada } from "@/lib/leads.functions";
import { cn } from "@/lib/utils";
import { classeBotao } from "./Botao";
import { CampoArea, CampoSelecao, CampoTexto, mascararTelefone } from "./Campo";

type Tipo = LeadEntrada["kind"];

type Props = {
  tipo: Tipo;
  /** Item de interesse (curso, mentoria…): vira o assunto do lead. */
  item?: { id: string; titulo: string };
  empresa?: boolean | "obrigatoria";
  mensagem?: boolean | "obrigatoria";
  rotuloMensagem?: string;
  assuntos?: string[];
  botao?: string;
  sucesso?: { titulo: string; texto: string };
  escuro?: boolean;
  /** Campos extras gravados em `data` (ex.: tamanho da equipe). */
  extra?: Record<string, unknown>;
  className?: string;
};

type Erros = Partial<Record<"name" | "email" | "phone" | "company" | "message" | "geral", string>>;

/**
 * Formulário único de captação. Valida no navegador, revalida no servidor e mostra
 * os estados completos: enviando, erro por campo, erro geral e confirmação.
 */
export function FormularioLead({
  tipo,
  item,
  empresa,
  mensagem = true,
  rotuloMensagem = "Mensagem",
  assuntos,
  botao = "Enviar",
  sucesso = {
    titulo: "Mensagem recebida",
    texto: "Obrigado pelo contato. Respondo em até dois dias úteis.",
  },
  escuro,
  extra,
  className,
}: Props) {
  const reduzir = useReducedMotion();
  const [estado, setEstado] = useState<"livre" | "enviando" | "ok">("livre");
  const [erros, setErros] = useState<Erros>({});
  const [telefone, setTelefone] = useState("");

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const v = (k: string) => String(f.get(k) ?? "").trim();
    const dados = {
      name: v("name"),
      email: v("email"),
      phone: v("phone"),
      company: v("company") || undefined,
      message: v("message") || undefined,
      subject: item?.titulo ?? (v("subject") || undefined),
      website: v("website") || undefined,
    };

    const novos: Erros = {};
    if (dados.name.length < 2) novos.name = "Informe seu nome.";
    if (!dados.email && !dados.phone) novos.email = "Informe um e-mail ou WhatsApp.";
    if (dados.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(dados.email))
      novos.email = "Confira o e-mail.";
    if (dados.phone && dados.phone.replace(/\D/g, "").length < 10) novos.phone = "Inclua o DDD.";
    if (empresa === "obrigatoria" && !dados.company) novos.company = "Informe a empresa.";
    if (mensagem === "obrigatoria" && !dados.message) novos.message = "Escreva uma mensagem.";
    setErros(novos);
    if (Object.keys(novos).length) {
      const primeiro = e.currentTarget.querySelector<HTMLElement>("[aria-invalid='true']");
      primeiro?.focus();
      return;
    }

    setEstado("enviando");
    try {
      await enviarLeadFn({
        data: {
          kind: tipo,
          ...dados,
          item_id: item?.id,
          data: extra,
          ...contextoDoVisitante(),
        },
      });
      registrar("lead", { label: item?.titulo ?? tipo });
      setEstado("ok");
    } catch (err) {
      setEstado("livre");
      setErros({
        geral:
          err instanceof Error && err.message.length < 140
            ? err.message
            : "Não foi possível enviar agora. Tente de novo em instantes.",
      });
    }
  }

  return (
    <div className={cn("relative", className)}>
      <AnimatePresence mode="wait" initial={false}>
        {estado === "ok" ? (
          <motion.div
            key="ok"
            role="status"
            initial={reduzir ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-start gap-4 py-6"
          >
            <CheckCircle
              className={cn("size-10", escuro ? "text-ouro" : "text-salvia")}
              weight="light"
            />
            <p
              className={cn(
                "font-serif text-[1.75rem] leading-tight",
                escuro ? "text-gelo" : "text-petroleo",
              )}
            >
              {sucesso.titulo}
            </p>
            <p className={cn("max-w-md", escuro ? "text-gelo/70" : "text-cinza")}>
              {sucesso.texto}
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            noValidate
            onSubmit={enviar}
            exit={reduzir ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-2 gap-x-3 gap-y-4 md:gap-5"
          >
            <div className="col-span-2">
              <CampoTexto
                name="name"
                rotulo="Nome"
                autoComplete="name"
                erro={erros.name}
                escuro={escuro}
                required
              />
            </div>
            <CampoTexto
              name="email"
              type="email"
              rotulo="E-mail"
              autoComplete="email"
              inputMode="email"
              erro={erros.email}
              escuro={escuro}
            />
            <CampoTexto
              name="phone"
              type="tel"
              rotulo="WhatsApp"
              autoComplete="tel-national"
              inputMode="tel"
              value={telefone}
              onChange={(e) => setTelefone(mascararTelefone(e.target.value))}
              placeholder="(11) 90000-0000"
              erro={erros.phone}
              escuro={escuro}
            />
            {empresa && (
              <div className="col-span-2">
                <CampoTexto
                  name="company"
                  rotulo="Empresa"
                  autoComplete="organization"
                  opcional={empresa !== "obrigatoria"}
                  erro={erros.company}
                  escuro={escuro}
                />
              </div>
            )}
            {assuntos && assuntos.length > 0 && !item && (
              <div className="col-span-2">
                <CampoSelecao name="subject" rotulo="Assunto" opcoes={assuntos} escuro={escuro} />
              </div>
            )}
            {mensagem && (
              <div className="col-span-2">
                <CampoArea
                  name="message"
                  rotulo={rotuloMensagem}
                  opcional={mensagem !== "obrigatoria"}
                  erro={erros.message}
                  escuro={escuro}
                  rows={3}
                />
              </div>
            )}
            {/* Armadilha para robôs: invisível e fora da ordem de foco */}
            <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label>
                Site
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            {erros.geral && (
              <p
                role="alert"
                className="col-span-2 flex items-start gap-2 rounded-[2px] bg-terracota/10 px-4 py-3 text-[0.9rem] text-terracota-texto"
              >
                <WarningCircle className="mt-0.5 size-5 shrink-0" />
                {erros.geral}
              </p>
            )}

            <div className="col-span-2 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <p className={cn("text-[0.8125rem]", escuro ? "text-gelo/55" : "text-cinza")}>
                Ao enviar, você concorda com a{" "}
                <Link to="/privacidade" className="underline underline-offset-2">
                  Política de Privacidade
                </Link>
                .
              </p>
              <button
                type="submit"
                disabled={estado === "enviando"}
                className={classeBotao(escuro ? "ouro" : "primario", "w-full sm:w-auto")}
              >
                {estado === "enviando" ? (
                  <>
                    <CircleNotch className="size-4 animate-spin" /> Enviando
                  </>
                ) : (
                  botao
                )}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
