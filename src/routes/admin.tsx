/**
 * Layout do painel /admin.
 *
 * Renderiza só no navegador (ssr: false): a sessão do Supabase vive no localStorage.
 * Guarda: sem sessão → /entrar?redirect=…; sessão sem papel de equipe → "Sem permissão".
 * Os papéis vêm de uma server function autenticada (RLS: cada um vê os próprios).
 */
import {
  Outlet,
  createFileRoute,
  redirect,
  useNavigate,
  useRouter,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { Lock } from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

import { AdminProvider, QK, type AdminCtx } from "@/components/admin/contexto";
import { ConfirmarProvider } from "@/components/admin/Dialogo";
import { Shell } from "@/components/admin/Shell";
import { ToastProvider } from "@/components/admin/Toast";
import { Girando, acao } from "@/components/admin/ui";
import { ehErroDeSessao, mensagemErro } from "@/lib/admin/formato";
import { meuPerfilFn } from "@/lib/admin/perfil.functions";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async ({ location, context }) => {
    const { supabase } = await import("@/integrations/supabase/client");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/entrar", search: { redirect: location.href } });
    }
    try {
      const perfil = await context.queryClient.ensureQueryData({
        queryKey: QK.perfil,
        queryFn: () => meuPerfilFn(),
        staleTime: 5 * 60_000,
      });
      return { perfil };
    } catch (err) {
      if (ehErroDeSessao(err)) {
        await supabase.auth.signOut().catch(() => undefined);
        throw redirect({ to: "/entrar", search: { redirect: location.href } });
      }
      throw err;
    }
  },
  head: () => ({
    meta: [{ title: "Painel | Daniel Basso" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  pendingComponent: CarregandoPainel,
  errorComponent: ErroPainel,
  component: LayoutAdmin,
});

function CarregandoPainel() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-gelo" role="status">
      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-col items-center leading-none">
          <span className="font-serif text-[1.5rem] text-petroleo">Daniel Basso</span>
          <span className="mt-1 text-[0.6rem] font-medium tracking-[0.24em] text-ouro-texto uppercase">
            Painel
          </span>
        </div>
        <span className="flex items-center gap-2 text-sm text-cinza">
          <Girando /> Carregando…
        </span>
      </div>
    </div>
  );
}

function ErroPainel({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  return (
    <div className="flex min-h-dvh items-center justify-center bg-gelo px-6" role="alert">
      <div className="max-w-md text-center">
        <p className="font-serif text-2xl text-petroleo">O painel não pôde ser carregado</p>
        <p className="mt-3 text-sm text-cinza">{mensagemErro(error)}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            className={acao("primario")}
            onClick={() => {
              router.invalidate();
              reset();
            }}
          >
            Tentar de novo
          </button>
          <a href="/entrar" className={acao("secundario")}>
            Ir para o login
          </a>
        </div>
      </div>
    </div>
  );
}

function SemPermissao({ email, sair }: { email: string | null; sair: () => void }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-gelo px-6">
      <div className="max-w-md text-center">
        <span className="mx-auto inline-flex size-14 items-center justify-center rounded-full bg-petroleo-50 text-petroleo">
          <Lock aria-hidden className="size-6" />
        </span>
        <h1 className="mt-6 font-serif text-[2rem] leading-tight text-petroleo">Sem permissão</h1>
        <p className="mt-3 text-[0.9375rem] text-cinza">
          {email ? (
            <>
              A conta <strong className="font-medium text-grafite">{email}</strong> ainda não tem
              acesso ao painel.
            </>
          ) : (
            "Esta conta ainda não tem acesso ao painel."
          )}{" "}
          Peça a um administrador para liberar o seu acesso.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <button type="button" className={acao("primario")} onClick={sair}>
            Sair
          </button>
          <a href="/" className={acao("secundario")}>
            Voltar ao site
          </a>
        </div>
      </div>
    </div>
  );
}

function LayoutAdmin() {
  const { perfil } = Route.useRouteContext();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const ctx = useMemo<AdminCtx>(
    () => ({
      ...perfil,
      admin: perfil.papeis.includes("admin"),
      sair: async () => {
        const { supabase } = await import("@/integrations/supabase/client");
        await supabase.auth.signOut().catch(() => undefined);
        qc.removeQueries({ queryKey: ["admin"] });
        navigate({ to: "/entrar", replace: true });
      },
    }),
    [perfil, qc, navigate],
  );

  // Sessão encerrada em outra aba ou expirada: volta para o login.
  useEffect(() => {
    let cancelar: (() => void) | undefined;
    import("@/integrations/supabase/client").then(({ supabase }) => {
      const { data } = supabase.auth.onAuthStateChange((evento) => {
        if (evento === "SIGNED_OUT") {
          qc.removeQueries({ queryKey: ["admin"] });
          navigate({
            to: "/entrar",
            search: { redirect: window.location.pathname },
            replace: true,
          });
        }
      });
      cancelar = () => data.subscription.unsubscribe();
    });
    return () => cancelar?.();
  }, [navigate, qc]);

  if (!perfil.papeis.length) return <SemPermissao email={perfil.email} sair={ctx.sair} />;

  return (
    <AdminProvider value={ctx}>
      <ToastProvider>
        <ConfirmarProvider>
          <Shell>
            <Outlet />
          </Shell>
        </ConfirmarProvider>
      </ToastProvider>
    </AdminProvider>
  );
}
