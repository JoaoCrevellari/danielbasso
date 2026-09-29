/**
 * Primeiro acesso de quem foi convidado para a equipe: confere o link (uso único, 7 dias),
 * a pessoa cria a senha, a conta é criada no servidor e ela já entra no painel.
 */
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle, Eye, EyeSlash, LinkBreak, WarningCircle } from "@phosphor-icons/react";
import { useEffect, useState, type FormEvent } from "react";

import { acao, classeCampo, Girando } from "@/components/admin/ui";
import { aceitarConviteFn, verConviteFn, type EstadoConvite } from "@/lib/convite.functions";
import { mensagemErro } from "@/lib/admin/formato";

export const Route = createFileRoute("/convite/$token")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Criar acesso | Painel Daniel Basso" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "referrer", content: "no-referrer" },
    ],
  }),
  component: Convite,
});

function Convite() {
  const { token } = Route.useParams();
  const [estado, setEstado] = useState<EstadoConvite | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    verConviteFn({ data: { token } })
      .then(setEstado)
      .catch((e) => setErro(mensagemErro(e)));
  }, [token]);

  return (
    <section className="flex min-h-dvh items-center justify-center bg-gelo px-4 py-12">
      <div className="w-full max-w-md rounded-[2px] border border-linha bg-papel p-6 shadow-[0_24px_60px_-40px_rgb(0_20_30/0.45)] sm:p-9">
        <div className="mb-7 flex flex-col leading-none">
          <span className="font-serif text-[1.4rem] text-petroleo">Daniel Basso</span>
          <span className="mt-1 text-[0.6rem] font-medium tracking-[0.24em] text-ouro-texto uppercase">
            Painel
          </span>
        </div>
        {erro ? (
          <Indisponivel titulo="Não foi possível abrir o convite" texto={erro} />
        ) : !estado ? (
          <div className="flex items-center gap-2 py-8 text-cinza" role="status">
            <Girando /> Conferindo o convite…
          </div>
        ) : estado.estado === "valido" ? (
          <CriarSenha token={token} nome={estado.nome} email={estado.email} />
        ) : (
          <Indisponivel
            titulo={
              estado.estado === "usado"
                ? "Este convite já foi usado"
                : estado.estado === "expirado"
                  ? "Este convite expirou"
                  : "Convite inválido"
            }
            texto={
              estado.estado === "usado"
                ? "Cada link vale para um cadastro. Se o acesso já é seu, entre com e-mail e senha."
                : "Peça a um administrador do painel um link novo."
            }
          />
        )}
      </div>
    </section>
  );
}

function Indisponivel({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div role="alert">
      <LinkBreak aria-hidden className="size-9 text-terracota-texto" />
      <h1 className="mt-4 font-serif text-[1.8rem] leading-tight text-petroleo">{titulo}</h1>
      <p className="mt-3 text-[0.9375rem] text-cinza">{texto}</p>
      <Link to="/entrar" className={acao("secundario", "md", "mt-8 w-full")}>
        Ir para o login
      </Link>
    </div>
  );
}

function CriarSenha({ token, nome, email }: { token: string; nome: string; email: string }) {
  const navigate = useNavigate();
  const [senha, setSenha] = useState("");
  const [confirma, setConfirma] = useState("");
  const [ver, setVer] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pronto, setPronto] = useState(false);

  async function criar(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    if (senha.length < 10) return setErro("A senha precisa de pelo menos 10 caracteres.");
    if (senha !== confirma) return setErro("As duas senhas não são iguais.");
    setEnviando(true);
    try {
      const r = await aceitarConviteFn({ data: { token, senha } });
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase.auth.signInWithPassword({ email: r.email, password: senha });
      setPronto(true);
      if (!error) setTimeout(() => navigate({ to: "/admin", replace: true }), 900);
      else navigate({ to: "/entrar", replace: true });
    } catch (err) {
      setErro(mensagemErro(err));
      setEnviando(false);
    }
  }

  if (pronto) {
    return (
      <div role="status">
        <CheckCircle aria-hidden weight="fill" className="size-9 text-salvia" />
        <h1 className="mt-4 font-serif text-[1.8rem] leading-tight text-petroleo">Acesso criado</h1>
        <p className="mt-3 flex items-center gap-2 text-[0.9375rem] text-cinza">
          <Girando /> Abrindo o painel…
        </p>
      </div>
    );
  }

  const primeiroNome = nome.split(/\s+/)[0];
  return (
    <>
      <h1 className="font-serif text-[1.8rem] leading-tight text-petroleo">
        Olá, {primeiroNome}. Crie sua senha
      </h1>
      <p className="mt-2 text-[0.9375rem] text-cinza">
        Seu acesso ao painel será com o e-mail{" "}
        <strong className="font-medium text-grafite">{email}</strong>. Este link vale para um
        cadastro só.
      </p>
      <form onSubmit={criar} noValidate className="mt-6 space-y-5">
        <input type="email" autoComplete="username" value={email} readOnly hidden />
        <div>
          <label htmlFor="senha" className="mb-1.5 block text-sm font-medium text-grafite">
            Senha
          </label>
          <div className="relative">
            <input
              id="senha"
              type={ver ? "text" : "password"}
              autoComplete="new-password"
              autoFocus
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
            Pelo menos 10 caracteres. Uma frase curta é fácil de lembrar e difícil de adivinhar.
          </p>
        </div>
        <div>
          <label htmlFor="confirma" className="mb-1.5 block text-sm font-medium text-grafite">
            Repita a senha
          </label>
          <input
            id="confirma"
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
              <Girando /> Criando acesso…
            </>
          ) : (
            "Criar acesso"
          )}
        </button>
      </form>
    </>
  );
}
