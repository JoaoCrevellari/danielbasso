/**
 * Redefinição de senha e primeiro acesso por convite.
 *
 * - Sem sessão: pede o e-mail e envia o link (resetPasswordForEmail), sem revelar se a
 *   conta existe.
 * - Voltando pelo link de recuperação ou de convite, o Supabase abre uma sessão a partir
 *   da URL; aqui a pessoa define a nova senha (updateUser).
 */
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle, Eye, EyeSlash, WarningCircle } from "@phosphor-icons/react";
import { useEffect, useState, type FormEvent } from "react";

import { acao, classeCampo, Girando } from "@/components/admin/ui";
import { useSupabaseSession } from "@/lib/auth/useSupabaseSession";

export const Route = createFileRoute("/redefinir-senha")({
  head: () => ({
    meta: [
      { title: "Redefinir senha | Painel Daniel Basso" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: RedefinirSenha,
});

type Origem = "recuperacao" | "convite" | null;

function lerOrigemDaUrl(): { origem: Origem; erro: string | null } {
  const bruto = `${window.location.hash.replace(/^#/, "")}&${window.location.search.replace(/^\?/, "")}`;
  const p = new URLSearchParams(bruto);
  const tipo = p.get("type");
  const erroCodigo = p.get("error_code") ?? p.get("error");
  let erro: string | null = null;
  if (erroCodigo) {
    erro = /expired/i.test(`${erroCodigo} ${p.get("error_description") ?? ""}`)
      ? "Este link expirou. Peça um novo abaixo."
      : "Este link não é mais válido. Peça um novo abaixo.";
  }
  return {
    origem: tipo === "invite" ? "convite" : tipo === "recovery" ? "recuperacao" : null,
    erro,
  };
}

function RedefinirSenha() {
  const [url, setUrl] = useState<{ origem: Origem; erro: string | null }>({
    origem: null,
    erro: null,
  });
  // Lê a URL antes de o cliente do Supabase consumir o fragmento com os tokens.
  useEffect(() => {
    setUrl(lerOrigemDaUrl());
  }, []);
  const { session, loading } = useSupabaseSession();

  return (
    <section className="pt-cabecalho">
      <div className="container-site flex min-h-[70dvh] items-center justify-center py-16 md:py-24">
        <div className="w-full max-w-md rounded-[2px] border border-linha bg-papel p-6 shadow-[0_24px_60px_-40px_rgb(0_20_30/0.45)] sm:p-9">
          {loading ? (
            <div className="flex items-center gap-2 py-10 text-cinza" role="status">
              <Girando /> Verificando o link…
            </div>
          ) : session && !url.erro ? (
            <NovaSenha convite={url.origem === "convite"} email={session.user.email ?? ""} />
          ) : (
            <PedirLink erroLink={url.erro} />
          )}
        </div>
      </div>
    </section>
  );
}

function PedirLink({ erroLink }: { erroLink: string | null }) {
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setErro("Informe um e-mail válido.");
      return;
    }
    setEnviando(true);
    const { supabase } = await import("@/integrations/supabase/client");
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    setEnviando(false);
    if (error && (error.status === 429 || /rate limit/i.test(error.message))) {
      setErro("Muitos pedidos seguidos. Aguarde alguns minutos e tente de novo.");
      return;
    }
    // Mesmo com outros erros, não revela se o e-mail existe.
    setEnviado(true);
  }

  if (enviado) {
    return (
      <div role="status">
        <CheckCircle aria-hidden weight="fill" className="size-9 text-salvia" />
        <h1 className="mt-4 font-serif text-[1.8rem] leading-tight text-petroleo">
          Confira seu e-mail
        </h1>
        <p className="mt-3 text-[0.9375rem] text-cinza">
          Se houver uma conta com{" "}
          <strong className="font-medium text-grafite">{email.trim()}</strong>, você vai receber um
          link para criar uma nova senha em alguns minutos. Olhe também a caixa de spam.
        </p>
        <Link to="/entrar" className={acao("secundario", "md", "mt-8 w-full")}>
          Voltar para o login
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="font-serif text-[1.8rem] leading-tight text-petroleo">Redefinir senha</h1>
      <p className="mt-2 text-[0.9375rem] text-cinza">
        Informe o e-mail de acesso ao painel. Enviaremos um link para você criar uma nova senha.
      </p>
      {erroLink && (
        <p
          role="alert"
          className="mt-5 flex items-start gap-2 rounded-[2px] border border-terracota/35 bg-terracota/[0.06] px-3.5 py-3 text-sm text-terracota-texto"
        >
          <WarningCircle aria-hidden weight="bold" className="mt-0.5 size-4 shrink-0" />
          {erroLink}
        </p>
      )}
      <form onSubmit={enviar} noValidate className="mt-6 space-y-5">
        <div>
          <label htmlFor="email-rec" className="mb-1.5 block text-sm font-medium text-grafite">
            E-mail
          </label>
          <input
            id="email-rec"
            type="email"
            inputMode="email"
            autoComplete="username"
            autoCapitalize="none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={erro ? true : undefined}
            aria-describedby={erro ? "erro-rec" : undefined}
            className={classeCampo}
          />
          {erro && (
            <p
              id="erro-rec"
              role="alert"
              className="mt-1.5 text-[0.8125rem] font-medium text-terracota-texto"
            >
              {erro}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={enviando}
          className={acao("primario", "md", "w-full min-h-12")}
        >
          {enviando ? (
            <>
              <Girando /> Enviando…
            </>
          ) : (
            "Enviar link"
          )}
        </button>
      </form>
      <p className="mt-6 text-sm">
        <Link
          to="/entrar"
          className="text-petroleo underline decoration-ouro/60 underline-offset-4"
        >
          Lembrei a senha
        </Link>
      </p>
    </>
  );
}

function NovaSenha({ convite, email }: { convite: boolean; email: string }) {
  const navigate = useNavigate();
  const [senha, setSenha] = useState("");
  const [confirma, setConfirma] = useState("");
  const [ver, setVer] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pronto, setPronto] = useState(false);

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    if (senha.length < 8) {
      setErro("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    if (senha !== confirma) {
      setErro("As duas senhas não são iguais.");
      return;
    }
    setEnviando(true);
    const { supabase } = await import("@/integrations/supabase/client");
    const { error } = await supabase.auth.updateUser({ password: senha });
    setEnviando(false);
    if (error) {
      if (/different from the old|same_password/i.test(`${error.code ?? ""} ${error.message}`)) {
        setErro("A nova senha precisa ser diferente da anterior.");
      } else if (/weak|password should/i.test(error.message)) {
        setErro("Senha fraca. Use pelo menos 8 caracteres, misturando letras e números.");
      } else {
        setErro("Não foi possível salvar a senha. Peça um novo link e tente de novo.");
      }
      return;
    }
    setPronto(true);
  }

  if (pronto) {
    return (
      <div role="status">
        <CheckCircle aria-hidden weight="fill" className="size-9 text-salvia" />
        <h1 className="mt-4 font-serif text-[1.8rem] leading-tight text-petroleo">
          Senha definida
        </h1>
        <p className="mt-3 text-[0.9375rem] text-cinza">
          Pronto. Você já pode usar o painel com a nova senha.
        </p>
        <button
          type="button"
          onClick={() => navigate({ to: "/admin", replace: true })}
          className={acao("primario", "md", "mt-8 w-full min-h-12")}
        >
          Ir para o painel
        </button>
      </div>
    );
  }

  return (
    <>
      <h1 className="font-serif text-[1.8rem] leading-tight text-petroleo">
        {convite ? "Crie sua senha" : "Defina uma nova senha"}
      </h1>
      <p className="mt-2 text-[0.9375rem] text-cinza">
        {convite ? "Boas-vindas ao painel. " : ""}Acesso de{" "}
        <strong className="font-medium text-grafite">{email}</strong>.
      </p>
      <form onSubmit={salvar} noValidate className="mt-6 space-y-5">
        <div>
          <label htmlFor="nova-senha" className="mb-1.5 block text-sm font-medium text-grafite">
            Nova senha
          </label>
          <div className="relative">
            <input
              id="nova-senha"
              type={ver ? "text" : "password"}
              autoComplete="new-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              aria-describedby="ajuda-senha"
              className={`${classeCampo} pr-12`}
            />
            <button
              type="button"
              onClick={() => setVer((v) => !v)}
              aria-label={ver ? "Ocultar senha" : "Mostrar senha"}
              aria-pressed={ver}
              className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-cinza hover:text-petroleo"
            >
              {ver ? (
                <EyeSlash aria-hidden className="size-5" />
              ) : (
                <Eye aria-hidden className="size-5" />
              )}
            </button>
          </div>
          <p id="ajuda-senha" className="mt-1.5 text-[0.8125rem] text-cinza">
            Pelo menos 8 caracteres.
          </p>
        </div>
        <div>
          <label htmlFor="confirma-senha" className="mb-1.5 block text-sm font-medium text-grafite">
            Repita a senha
          </label>
          <input
            id="confirma-senha"
            type={ver ? "text" : "password"}
            autoComplete="new-password"
            value={confirma}
            onChange={(e) => setConfirma(e.target.value)}
            aria-invalid={erro ? true : undefined}
            aria-describedby={erro ? "erro-senha" : undefined}
            className={classeCampo}
          />
        </div>
        {erro && (
          <p
            id="erro-senha"
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
          className={acao("primario", "md", "w-full min-h-12")}
        >
          {enviando ? (
            <>
              <Girando /> Salvando…
            </>
          ) : (
            "Salvar senha"
          )}
        </button>
      </form>
    </>
  );
}
