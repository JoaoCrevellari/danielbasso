/**
 * Login do painel (e-mail + senha, Supabase Auth). Aceita ?redirect= só para caminhos
 * internos. Quem já tem sessão vai direto para o destino.
 */
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Eye, EyeSlash, WarningCircle } from "@phosphor-icons/react";
import { useEffect, useState, type FormEvent } from "react";

import { acao, classeCampo, Girando } from "@/components/admin/ui";
import { useConfig } from "@/components/layout/ConfigContext";
import { caminhoInterno } from "@/lib/url-segura";

export const Route = createFileRoute("/entrar")({
  validateSearch: (s: Record<string, unknown>): { redirect?: string } => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Entrar | Painel Daniel Basso" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Entrar,
});

function traduzirErroLogin(
  err: { message?: string; status?: number; code?: string } | null,
): string {
  const m = err?.message ?? "";
  if (err?.code === "invalid_credentials" || /invalid login credentials/i.test(m)) {
    return "E-mail ou senha incorretos.";
  }
  if (err?.code === "email_not_confirmed" || /email not confirmed/i.test(m)) {
    return "Este e-mail ainda não foi confirmado. Abra o link que enviamos para ativar o acesso.";
  }
  if (err?.status === 429 || /rate limit|too many/i.test(m)) {
    return "Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.";
  }
  if (/fetch|network/i.test(m)) return "Sem conexão com o servidor. Verifique a internet.";
  return "Não foi possível entrar agora. Tente de novo em instantes.";
}

const i = (n: number) => ({ "--i": n }) as React.CSSProperties;

function Entrar() {
  const { redirect } = Route.useSearch();
  const destino = caminhoInterno(redirect, "/admin");
  const navigate = useNavigate();
  const config = useConfig();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [verSenha, setVerSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Já logado: segue para o destino.
  useEffect(() => {
    let vivo = true;
    import("@/integrations/supabase/client").then(({ supabase }) =>
      supabase.auth.getSession().then(({ data }) => {
        if (vivo && data.session) navigate({ href: destino, replace: true });
      }),
    );
    return () => {
      vivo = false;
    };
  }, [destino, navigate]);

  async function entrar(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    if (!email.trim() || !senha) {
      setErro("Informe e-mail e senha.");
      return;
    }
    setEnviando(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha,
      });
      if (error) {
        setErro(traduzirErroLogin(error));
        setEnviando(false);
        return;
      }
      navigate({ href: destino, replace: true });
    } catch (err) {
      setErro(traduzirErroLogin(err as { message?: string }));
      setEnviando(false);
    }
  }

  return (
    <div className="grid min-h-dvh bg-gelo lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      {/* Painel da marca */}
      <aside className="superficie-escura grao relative flex flex-col justify-between overflow-hidden px-6 pt-8 pb-10 sm:px-10 lg:min-h-dvh lg:px-14 lg:py-14">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_20%_100%,rgb(10_79_112/0.6),transparent_70%)]"
        />
        <div className="relative flex flex-col leading-none anima-subir">
          <span className="font-serif text-[1.6rem] font-[420] tracking-[-0.015em] text-gelo">
            Daniel Basso
          </span>
          <span className="mt-1.5 text-[0.65rem] font-medium tracking-[0.24em] text-ouro uppercase">
            Desenvolvimento Humano
          </span>
        </div>
        <div className="relative mt-12 lg:mt-0">
          <span aria-hidden className="block h-px w-12 bg-ouro/70 anima-surgir" style={i(1)} />
          <p
            className="mt-6 max-w-[18ch] font-serif text-[1.9rem] leading-[1.12] font-[380] tracking-[-0.015em] text-gelo anima-subir sm:text-[2.4rem] lg:text-[3rem]"
            style={i(2)}
          >
            {config.rodape.frase || "Profundidade intelectual aplicada à vida."}
          </p>
          <p className="mt-5 text-sm text-gelo/55 anima-subir" style={i(3)}>
            Painel de gestão do site
          </p>
        </div>
      </aside>

      {/* Formulário */}
      <main className="flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <h1
            className="font-serif text-[2.1rem] leading-tight font-[420] text-petroleo anima-subir"
            style={i(1)}
          >
            Entrar no painel
          </h1>
          <p className="mt-2 text-[0.9375rem] text-cinza anima-subir" style={i(2)}>
            Use o e-mail e a senha cadastrados pela equipe.
          </p>

          <form onSubmit={entrar} noValidate className="mt-8 space-y-5 anima-subir" style={i(3)}>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-grafite">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={erro ? true : undefined}
                aria-describedby={erro ? "erro-login" : undefined}
                className={classeCampo}
              />
            </div>
            <div>
              <div className="mb-1.5 flex items-baseline justify-between">
                <label htmlFor="senha" className="text-sm font-medium text-grafite">
                  Senha
                </label>
                <Link
                  to="/redefinir-senha"
                  className="text-sm text-petroleo underline decoration-ouro/60 underline-offset-4 hover:decoration-ouro"
                >
                  Esqueci minha senha
                </Link>
              </div>
              <div className="relative">
                <input
                  id="senha"
                  type={verSenha ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  aria-invalid={erro ? true : undefined}
                  aria-describedby={erro ? "erro-login" : undefined}
                  className={`${classeCampo} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setVerSenha((v) => !v)}
                  aria-label={verSenha ? "Ocultar senha" : "Mostrar senha"}
                  aria-pressed={verSenha}
                  className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-cinza transition-colors hover:text-petroleo"
                >
                  {verSenha ? (
                    <EyeSlash aria-hidden className="size-5" />
                  ) : (
                    <Eye aria-hidden className="size-5" />
                  )}
                </button>
              </div>
            </div>

            {erro && (
              <p
                id="erro-login"
                role="alert"
                className="flex items-start gap-2 rounded-[2px] border border-terracota/35 bg-terracota/[0.06] px-3.5 py-3 text-sm text-terracota-texto"
              >
                <WarningCircle aria-hidden weight="bold" className="mt-0.5 size-4 shrink-0" />
                {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={enviando}
              className={acao("primario", "md", "group w-full min-h-12")}
            >
              {enviando ? (
                <>
                  <Girando /> Entrando…
                </>
              ) : (
                <>
                  Entrar
                  <ArrowRight
                    aria-hidden
                    className="size-4 transition-transform duration-300 ease-[var(--ease-out)] group-hover:translate-x-1"
                  />
                </>
              )}
            </button>
          </form>

          <p className="mt-10 text-sm text-cinza">
            <a
              href="/"
              className="underline decoration-linha-forte underline-offset-4 hover:text-petroleo"
            >
              Voltar para o site
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
