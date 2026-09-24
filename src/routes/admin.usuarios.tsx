/**
 * Usuários do painel (só administradores): listar, convidar por e-mail, mudar papel e
 * remover acesso. Depende da chave de serviço no servidor para listar e convidar.
 */
import { Link, createFileRoute } from "@tanstack/react-router";
import { Info, Lock, UserPlus, UserGear } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";

import { QK, useAdmin } from "@/components/admin/contexto";
import { Modal, useConfirmar } from "@/components/admin/Dialogo";
import { useToast } from "@/components/admin/Toast";
import {
  Cartao,
  Esqueleto,
  EstadoErro,
  EstadoVazio,
  Girando,
  Selo,
  TopoPagina,
  acao,
  classeCampo,
  classeSelect,
  estiloSelect,
} from "@/components/admin/ui";
import { dataCurta, mensagemErro, relativo } from "@/lib/admin/formato";
import type { Papel } from "@/lib/admin/perfil.functions";
import { PAPEIS, rotuloPapel } from "@/lib/admin/rotulos";
import {
  convidarUsuarioFn,
  listarUsuariosFn,
  mudarPapelFn,
  removerAcessoFn,
  type UsuarioPainel,
} from "@/lib/admin/usuarios.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/usuarios")({
  head: () => ({
    meta: [{ title: "Usuários | Painel" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: UsuariosPagina,
});

function UsuariosPagina() {
  const { admin } = useAdmin();
  if (!admin) {
    return (
      <EstadoVazio
        icone={<Lock />}
        titulo="Área dos administradores"
        texto="Só administradores podem ver e gerenciar os usuários do painel."
        acao={
          <Link to="/admin" className={acao("secundario")}>
            Voltar à visão geral
          </Link>
        }
      />
    );
  }
  return <Usuarios />;
}

function Usuarios() {
  const qc = useQueryClient();
  const toast = useToast();
  const confirmar = useConfirmar();
  const [convidar, setConvidar] = useState(false);
  const q = useQuery({ queryKey: QK.usuarios, queryFn: () => listarUsuariosFn() });
  const semChave = q.data?.semChave;

  const mudar = useMutation({
    mutationFn: (v: { userId: string; papel: Papel }) => mudarPapelFn({ data: v }),
    onSuccess: (_r, v) => {
      qc.invalidateQueries({ queryKey: QK.usuarios });
      toast.sucesso(`Papel alterado para ${rotuloPapel(v.papel).toLowerCase()}.`);
    },
    onError: (e) => toast.erro(mensagemErro(e)),
  });

  const remover = useMutation({
    mutationFn: (userId: string) => removerAcessoFn({ data: { userId } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.usuarios });
      toast.sucesso("Acesso removido.");
    },
    onError: (e) => toast.erro(mensagemErro(e)),
  });

  const comAcesso = (q.data?.usuarios ?? []).filter((u) => u.papel);
  const semAcesso = (q.data?.usuarios ?? []).filter((u) => !u.papel);

  return (
    <>
      <TopoPagina
        titulo="Usuários"
        descricao="Quem pode entrar no painel. Administradores gerenciam tudo; editores cuidam de conteúdo, páginas, mídia e leads."
        acoes={
          <button
            type="button"
            className={acao("primario")}
            onClick={() => setConvidar(true)}
            disabled={!!semChave}
          >
            <UserPlus aria-hidden className="size-4" />
            Convidar pessoa
          </button>
        }
      />

      {semChave && (
        <div className="mb-5 flex gap-3 rounded-[2px] border border-ouro/50 bg-ouro/[0.08] px-4 py-4 text-sm text-grafite md:px-5">
          <Info aria-hidden weight="fill" className="mt-0.5 size-5 shrink-0 text-ouro-texto" />
          <div>
            <p className="font-medium">Módulo limitado: falta a chave de serviço do Supabase</p>
            <p className="mt-1 text-cinza">
              Para listar os e-mails de todos os usuários e enviar convites, o servidor precisa da
              variável{" "}
              <code className="rounded-[2px] bg-papel px-1.5 py-0.5 font-mono text-[0.8125rem]">
                SUPABASE_SERVICE_ROLE_KEY
              </code>
              . Configure em Cloudflare → Workers → o projeto → Settings → Variables and Secrets
              (como <em>Secret</em>) ou no arquivo{" "}
              <code className="font-mono text-[0.8125rem]">.env</code> em desenvolvimento. A chave
              fica só no servidor e nunca vai para o navegador. Enquanto isso, a lista abaixo mostra
              os papéis cadastrados, e só o seu e-mail aparece.
            </p>
          </div>
        </div>
      )}

      {q.isError ? (
        <EstadoErro mensagem={mensagemErro(q.error)} onTentar={() => q.refetch()} />
      ) : q.isPending ? (
        <Cartao aria-hidden>
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b border-linha px-5 py-4 last:border-0"
            >
              <Esqueleto className="size-10 shrink-0 rounded-full" />
              <div className="flex-1">
                <Esqueleto className="h-4 w-48" />
                <Esqueleto className="mt-2 h-3 w-32" />
              </div>
              <Esqueleto className="h-11 w-36" />
            </div>
          ))}
        </Cartao>
      ) : (
        <div className="space-y-6">
          <section>
            <h2 className="mb-2 text-sm font-medium text-cinza">Com acesso ({comAcesso.length})</h2>
            <Cartao>
              <ul>
                {comAcesso.map((u) => (
                  <LinhaUsuario
                    key={u.id}
                    u={u}
                    ocupado={
                      (mudar.isPending && mudar.variables?.userId === u.id) ||
                      (remover.isPending && remover.variables === u.id)
                    }
                    onPapel={(papel) => mudar.mutate({ userId: u.id, papel })}
                    onRemover={async () => {
                      const ok = await confirmar({
                        titulo: "Remover o acesso?",
                        descricao: (
                          <>
                            <strong>{u.email ?? "Esta pessoa"}</strong> não vai mais conseguir
                            entrar no painel. A conta de login continua existindo e o acesso pode
                            ser devolvido depois.
                          </>
                        ),
                        confirmar: "Remover acesso",
                        perigo: true,
                      });
                      if (ok) remover.mutate(u.id);
                    }}
                  />
                ))}
              </ul>
            </Cartao>
          </section>

          {semAcesso.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-medium text-cinza">
                Contas sem acesso ao painel ({semAcesso.length})
              </h2>
              <Cartao>
                <ul>
                  {semAcesso.map((u) => (
                    <LinhaUsuario
                      key={u.id}
                      u={u}
                      ocupado={mudar.isPending && mudar.variables?.userId === u.id}
                      onPapel={(papel) => mudar.mutate({ userId: u.id, papel })}
                    />
                  ))}
                </ul>
              </Cartao>
            </section>
          )}

          <dl className="grid gap-3 sm:grid-cols-2">
            {PAPEIS.map((p) => (
              <div
                key={p.value}
                className="rounded-[2px] border border-linha bg-papel/60 px-4 py-3"
              >
                <dt className="text-sm font-medium text-grafite">{p.label}</dt>
                <dd className="mt-0.5 text-sm text-cinza">{p.descricao}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <ModalConvite aberto={convidar} onFechar={() => setConvidar(false)} />
    </>
  );
}

function LinhaUsuario({
  u,
  ocupado,
  onPapel,
  onRemover,
}: {
  u: UsuarioPainel;
  ocupado?: boolean;
  onPapel: (p: Papel) => void;
  onRemover?: () => void;
}) {
  const inicial = (u.email ?? "?").charAt(0).toUpperCase();
  return (
    <li className="flex flex-col gap-3 border-b border-linha px-4 py-4 last:border-0 sm:flex-row sm:items-center md:px-5">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span
          aria-hidden
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-petroleo text-sm font-medium text-gelo"
        >
          {u.email ? inicial : <UserGear className="size-5" />}
        </span>
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2">
            <span className="truncate font-medium text-grafite">
              {u.email ?? "E-mail indisponível sem a chave de serviço"}
            </span>
            {u.voce && <Selo tom="petroleo">Você</Selo>}
            {!u.confirmado && <Selo tom="ouro">Convite pendente</Selo>}
          </p>
          <p className="text-xs text-cinza">
            {u.ultimoAcesso
              ? `Último acesso ${relativo(u.ultimoAcesso)}`
              : u.convidadoEm
                ? `Desde ${dataCurta(u.convidadoEm)}`
                : u.email
                  ? ""
                  : `ID ${u.id.slice(0, 8)}`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 pl-[3.25rem] sm:pl-0">
        <label className="sr-only" htmlFor={`papel-${u.id}`}>
          Papel de {u.email ?? u.id}
        </label>
        <select
          id={`papel-${u.id}`}
          value={u.papel ?? ""}
          disabled={ocupado || u.voce}
          onChange={(e) => e.target.value && onPapel(e.target.value as Papel)}
          className={cn(classeSelect, "w-40 md:min-h-9 md:py-1.5")}
          style={estiloSelect}
          title={u.voce ? "Você não pode mudar o próprio papel" : undefined}
        >
          {!u.papel && <option value="">Dar acesso como…</option>}
          {PAPEIS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
        {ocupado && <Girando className="text-petroleo" />}
        {onRemover && !u.voce && (
          <button
            type="button"
            className={acao("fantasma", "sm", "text-terracota-texto")}
            onClick={onRemover}
            disabled={ocupado}
          >
            Remover
          </button>
        )}
      </div>
    </li>
  );
}

function ModalConvite({ aberto, onFechar }: { aberto: boolean; onFechar: () => void }) {
  const qc = useQueryClient();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [papel, setPapel] = useState<Papel>("editor");
  const [erro, setErro] = useState<string | null>(null);

  const convite = useMutation({
    mutationFn: () => convidarUsuarioFn({ data: { email: email.trim(), papel } }),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: QK.usuarios });
      toast.sucesso(
        r.jaExistia
          ? `${email.trim()} já tinha conta: o acesso foi liberado.`
          : `Convite enviado para ${email.trim()}.`,
      );
      setEmail("");
      setPapel("editor");
      onFechar();
    },
    onError: (e) => setErro(mensagemErro(e)),
  });

  function enviar(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setErro("Informe um e-mail válido.");
      return;
    }
    convite.mutate();
  }

  return (
    <Modal
      aberto={aberto}
      onFechar={onFechar}
      titulo="Convidar pessoa"
      descricao="Ela recebe um e-mail com um link para criar a senha e entrar no painel."
      rodape={
        <>
          <button type="button" className={acao("secundario")} onClick={onFechar}>
            Cancelar
          </button>
          <button
            type="submit"
            form="form-convite"
            className={acao("primario")}
            disabled={convite.isPending}
          >
            {convite.isPending && <Girando />}
            Enviar convite
          </button>
        </>
      }
    >
      <form id="form-convite" onSubmit={enviar} noValidate className="space-y-5">
        <div>
          <label htmlFor="convite-email" className="mb-1.5 block text-sm font-medium text-grafite">
            E-mail
          </label>
          <input
            id="convite-email"
            type="email"
            inputMode="email"
            autoCapitalize="none"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={erro ? true : undefined}
            aria-describedby={erro ? "convite-erro" : undefined}
            className={classeCampo}
          />
        </div>
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-grafite">Papel</legend>
          <div className="space-y-2">
            {PAPEIS.map((p) => (
              <label
                key={p.value}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-[2px] border px-4 py-3 transition-colors",
                  papel === p.value
                    ? "border-petroleo bg-petroleo-50"
                    : "border-linha bg-papel hover:border-petroleo/40",
                )}
              >
                <input
                  type="radio"
                  name="papel"
                  value={p.value}
                  checked={papel === p.value}
                  onChange={() => setPapel(p.value)}
                  className="mt-1 accent-[var(--color-petroleo)]"
                />
                <span>
                  <span className="block text-sm font-medium text-grafite">{p.label}</span>
                  <span className="block text-xs text-cinza">{p.descricao}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        {erro && (
          <p id="convite-erro" role="alert" className="text-sm font-medium text-terracota-texto">
            {erro}
          </p>
        )}
      </form>
    </Modal>
  );
}
