/**
 * Usuários do painel (só administradores): quem tem acesso, o que cada pessoa pode ver,
 * editar e apagar em cada módulo, e convites com link de uso único (7 dias).
 */
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Check,
  Copy,
  Info,
  LinkSimple,
  Lock,
  PencilSimple,
  UserPlus,
  WhatsappLogo,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";

import { QK, useAdmin } from "@/components/admin/contexto";
import { Modal, useConfirmar } from "@/components/admin/Dialogo";
import { useToast } from "@/components/admin/Toast";
import {
  Cartao,
  Esqueleto,
  EstadoErro,
  EstadoVazio,
  Girando,
  Interruptor,
  Selo,
  TopoPagina,
  acao,
  classeCampo,
} from "@/components/admin/ui";
import { dataCurta, mensagemErro, relativo } from "@/lib/admin/formato";
import {
  MODELOS,
  MODULOS,
  ROTULO_ACAO,
  normalizarPermissoes,
  resumoPermissoes,
  type Acao,
  type Modulo,
  type Permissoes,
} from "@/lib/admin/permissoes";
import {
  criarConviteFn,
  listarEquipeFn,
  removerAcessoFn,
  renovarConviteFn,
  revogarConviteFn,
  salvarMembroFn,
  type ConvitePendente,
  type MembroEquipe,
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
            Voltar ao início
          </Link>
        }
      />
    );
  }
  return <Usuarios />;
}

type Edicao = { tipo: "novo" } | { tipo: "membro"; membro: MembroEquipe } | null;

function Usuarios() {
  const qc = useQueryClient();
  const toast = useToast();
  const confirmar = useConfirmar();
  const [edicao, setEdicao] = useState<Edicao>(null);
  const [linkGerado, setLinkGerado] = useState<{
    link: string;
    nome: string;
    expiraEm: string;
  } | null>(null);
  const q = useQuery({ queryKey: QK.usuarios, queryFn: () => listarEquipeFn() });
  const semChave = q.data?.semChave;

  const remover = useMutation({
    mutationFn: (userId: string) => removerAcessoFn({ data: { userId } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.usuarios });
      toast.sucesso("Acesso removido.");
    },
    onError: (e) => toast.erro(mensagemErro(e)),
  });

  const renovar = useMutation({
    mutationFn: (c: ConvitePendente) => renovarConviteFn({ data: { id: c.id } }),
    onSuccess: (r, c) => {
      qc.invalidateQueries({ queryKey: QK.usuarios });
      setLinkGerado({ ...r, nome: c.nome });
    },
    onError: (e) => toast.erro(mensagemErro(e)),
  });

  const revogar = useMutation({
    mutationFn: (id: string) => revogarConviteFn({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.usuarios });
      toast.sucesso("Convite cancelado. O link deixou de valer.");
    },
    onError: (e) => toast.erro(mensagemErro(e)),
  });

  const membros = q.data?.membros ?? [];
  const convites = q.data?.convites ?? [];

  return (
    <>
      <TopoPagina
        titulo="Usuários"
        descricao="Quem acessa o painel e o que cada pessoa pode ver, criar e editar ou apagar."
        acoes={
          <button
            type="button"
            className={acao("primario")}
            onClick={() => setEdicao({ tipo: "novo" })}
            disabled={!!semChave}
          >
            <UserPlus aria-hidden className="size-4" />
            Novo acesso
          </button>
        }
      />

      {semChave && (
        <div className="mb-5 flex gap-3 rounded-[2px] border border-ouro/50 bg-ouro/[0.08] px-4 py-4 text-sm text-grafite md:px-5">
          <Info aria-hidden weight="fill" className="mt-0.5 size-5 shrink-0 text-ouro-texto" />
          <div>
            <p className="font-medium">Falta a chave de serviço do Supabase no servidor</p>
            <p className="mt-1 text-cinza">
              Sem a variável{" "}
              <code className="font-mono text-[0.8125rem]">SUPABASE_SERVICE_ROLE_KEY</code> não dá
              para criar acessos nem ver os e-mails da equipe. Ela fica em Cloudflare → Workers →
              danielbasso → Settings → Variables and Secrets (como Secret).
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
              <Esqueleto className="h-9 w-24" />
            </div>
          ))}
        </Cartao>
      ) : (
        <div className="space-y-7">
          <section>
            <h2 className="mb-2 text-sm font-medium text-cinza">Com acesso ({membros.length})</h2>
            <Cartao>
              <ul>
                {membros.map((m) => (
                  <LinhaMembro
                    key={m.id}
                    m={m}
                    ocupado={remover.isPending && remover.variables === m.id}
                    onEditar={() => setEdicao({ tipo: "membro", membro: m })}
                    onRemover={async () => {
                      const ok = await confirmar({
                        titulo: "Remover o acesso?",
                        descricao: (
                          <>
                            <strong>{m.nome ?? m.email ?? "Esta pessoa"}</strong> não vai mais
                            conseguir entrar no painel. Para voltar, gere um novo acesso.
                          </>
                        ),
                        confirmar: "Remover acesso",
                        perigo: true,
                      });
                      if (ok) remover.mutate(m.id);
                    }}
                  />
                ))}
              </ul>
            </Cartao>
          </section>

          {convites.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-medium text-cinza">
                Convites aguardando cadastro ({convites.length})
              </h2>
              <Cartao>
                <ul>
                  {convites.map((c) => (
                    <LinhaConvite
                      key={c.id}
                      c={c}
                      ocupado={
                        (renovar.isPending && renovar.variables?.id === c.id) ||
                        (revogar.isPending && revogar.variables === c.id)
                      }
                      onRenovar={() => renovar.mutate(c)}
                      onCancelar={async () => {
                        const ok = await confirmar({
                          titulo: "Cancelar o convite?",
                          descricao: (
                            <>
                              O link enviado para <strong>{c.nome}</strong> deixa de funcionar.
                            </>
                          ),
                          confirmar: "Cancelar convite",
                          perigo: true,
                        });
                        if (ok) revogar.mutate(c.id);
                      }}
                    />
                  ))}
                </ul>
              </Cartao>
            </section>
          )}

          <p className="flex items-start gap-2 text-sm text-cinza">
            <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
            Administradores têm acesso total, inclusive a esta página. Para o restante da equipe, as
            permissões valem no banco de dados: mesmo quem tentar burlar a tela não consegue ver ou
            alterar o que não foi liberado.
          </p>
        </div>
      )}

      <FormularioAcesso
        edicao={edicao}
        onFechar={() => setEdicao(null)}
        onConvite={(r) => {
          setEdicao(null);
          setLinkGerado(r);
        }}
      />
      <ModalLink dados={linkGerado} onFechar={() => setLinkGerado(null)} />
    </>
  );
}

function Iniciais({ texto }: { texto: string }) {
  const ini = texto
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  return (
    <span
      aria-hidden
      className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-petroleo text-sm font-medium text-gelo"
    >
      {ini || "?"}
    </span>
  );
}

function ResumoAcesso({ admin, permissoes }: { admin: boolean; permissoes: Permissoes }) {
  if (admin) return <Selo tom="petroleo">Acesso total</Selo>;
  const itens = resumoPermissoes(permissoes);
  if (!itens.length) return <Selo tom="terracota">Nenhum módulo liberado</Selo>;
  return (
    <span className="flex flex-wrap gap-1.5">
      {itens.map((i) => (
        <Selo
          key={i.modulo}
          tom={i.nivel === "total" ? "salvia" : i.nivel === "edita" ? "ouro" : "neutro"}
        >
          {i.modulo} · {i.nivel}
        </Selo>
      ))}
    </span>
  );
}

function LinhaMembro({
  m,
  ocupado,
  onEditar,
  onRemover,
}: {
  m: MembroEquipe;
  ocupado?: boolean;
  onEditar: () => void;
  onRemover: () => void;
}) {
  const titulo = m.nome ?? m.email ?? `ID ${m.id.slice(0, 8)}`;
  return (
    <li className="flex flex-col gap-3 border-b border-linha px-4 py-4 last:border-0 md:flex-row md:items-center md:px-5">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <Iniciais texto={m.nome ?? m.email ?? "?"} />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2">
            <span className="truncate font-medium text-grafite">{titulo}</span>
            {m.voce && <Selo tom="petroleo">Você</Selo>}
            {m.admin && <Selo tom="ouro">Administrador</Selo>}
          </p>
          <p className="truncate text-xs text-cinza">
            {[m.cargo, m.nome ? m.email : null].filter(Boolean).join(" · ") ||
              "Sem cargo informado"}
          </p>
          <div className="mt-2">
            <ResumoAcesso admin={m.admin} permissoes={m.permissoes} />
          </div>
          <p className="mt-1.5 text-xs text-cinza/80">
            {m.ultimoAcesso
              ? `Último acesso ${relativo(m.ultimoAcesso)}`
              : m.desde
                ? `Acesso desde ${dataCurta(m.desde)}`
                : ""}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 pl-[3.25rem] md:pl-0">
        {ocupado && <Girando className="text-petroleo" />}
        <button
          type="button"
          className={acao("secundario", "sm")}
          onClick={onEditar}
          disabled={ocupado}
        >
          <PencilSimple aria-hidden className="size-4" />
          Editar
        </button>
        {!m.voce && (
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

function LinhaConvite({
  c,
  ocupado,
  onRenovar,
  onCancelar,
}: {
  c: ConvitePendente;
  ocupado?: boolean;
  onRenovar: () => void;
  onCancelar: () => void;
}) {
  return (
    <li className="flex flex-col gap-3 border-b border-linha px-4 py-4 last:border-0 md:flex-row md:items-center md:px-5">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span
          aria-hidden
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-dashed border-linha-forte text-cinza"
        >
          <LinkSimple className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2">
            <span className="truncate font-medium text-grafite">{c.nome}</span>
            {c.expirado ? (
              <Selo tom="terracota">Link expirado</Selo>
            ) : (
              <Selo tom="ouro">Aguardando</Selo>
            )}
          </p>
          <p className="truncate text-xs text-cinza">
            {[c.cargo, c.email].filter(Boolean).join(" · ")}
          </p>
          <div className="mt-2">
            <ResumoAcesso admin={c.admin} permissoes={c.permissoes} />
          </div>
          <p className="mt-1.5 text-xs text-cinza/80">
            Criado {relativo(c.criadoEm)} ·{" "}
            {c.expirado ? "expirou" : `vale até ${dataCurta(c.expiraEm)}`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 pl-[3.25rem] md:pl-0">
        {ocupado && <Girando className="text-petroleo" />}
        <button
          type="button"
          className={acao("secundario", "sm")}
          onClick={onRenovar}
          disabled={ocupado}
        >
          <LinkSimple aria-hidden className="size-4" />
          Gerar novo link
        </button>
        <button
          type="button"
          className={acao("fantasma", "sm", "text-terracota-texto")}
          onClick={onCancelar}
          disabled={ocupado}
        >
          Cancelar
        </button>
      </div>
    </li>
  );
}

/** Grade de permissões: um módulo por linha, três ações por módulo. */
function GradePermissoes({
  valor,
  onChange,
}: {
  valor: Permissoes;
  onChange: (p: Permissoes) => void;
}) {
  function alternar(modulo: Modulo, acaoAlvo: Acao) {
    const atuais = new Set(valor[modulo] ?? []);
    if (atuais.has(acaoAlvo)) {
      // Tirar "ver" tira tudo; tirar as outras mantém o "ver".
      if (acaoAlvo === "ver") atuais.clear();
      else atuais.delete(acaoAlvo);
    } else {
      atuais.add(acaoAlvo);
      atuais.add("ver");
    }
    onChange(normalizarPermissoes({ ...valor, [modulo]: [...atuais] }));
  }

  return (
    <div className="overflow-hidden rounded-[2px] border border-linha">
      <div className="hidden grid-cols-[1fr_repeat(3,6.5rem)] border-b border-linha bg-gelo-2/60 px-4 py-2 text-xs font-medium text-cinza md:grid">
        <span>Módulo</span>
        {(["ver", "editar", "apagar"] as const).map((a) => (
          <span key={a} className="text-center">
            {ROTULO_ACAO[a]}
          </span>
        ))}
      </div>
      <ul>
        {MODULOS.map((m) => (
          <li
            key={m.chave}
            className="grid gap-2 border-b border-linha px-4 py-3 last:border-0 md:grid-cols-[1fr_repeat(3,6.5rem)] md:items-center md:gap-0"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-grafite">{m.rotulo}</p>
              <p className="text-xs text-cinza">{m.descricao}</p>
            </div>
            <div className="flex flex-wrap gap-2 md:contents">
              {(["ver", "editar", "apagar"] as const).map((a) => {
                const disponivel = m.acoes.includes(a);
                const marcado = !!valor[m.chave]?.includes(a);
                return (
                  <div key={a} className="md:flex md:justify-center">
                    {disponivel ? (
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={marcado}
                        aria-label={`${m.rotulo}: ${ROTULO_ACAO[a]}`}
                        onClick={() => alternar(m.chave, a)}
                        className={cn(
                          "inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors",
                          marcado
                            ? "border-petroleo bg-petroleo text-gelo"
                            : "border-linha-forte bg-papel text-cinza hover:border-petroleo hover:text-petroleo",
                        )}
                      >
                        {marcado && <Check aria-hidden weight="bold" className="size-3.5" />}
                        <span className="md:sr-only">{ROTULO_ACAO[a]}</span>
                        {!marcado && (
                          <span aria-hidden className="hidden size-3.5 md:inline-block" />
                        )}
                      </button>
                    ) : (
                      <span aria-hidden className="hidden text-xs text-cinza/40 md:inline">
                        –
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FormularioAcesso({
  edicao,
  onFechar,
  onConvite,
}: {
  edicao: Edicao;
  onFechar: () => void;
  onConvite: (r: { link: string; nome: string; expiraEm: string }) => void;
}) {
  const qc = useQueryClient();
  const toast = useToast();
  const membro = edicao?.tipo === "membro" ? edicao.membro : null;
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cargo, setCargo] = useState("");
  const [admin, setAdmin] = useState(false);
  const [permissoes, setPermissoes] = useState<Permissoes>({});
  const [erro, setErro] = useState<string | null>(null);

  // Preenche ao abrir.
  useEffect(() => {
    if (!edicao) return;
    setErro(null);
    setNome(membro?.nome ?? "");
    setEmail(membro?.email ?? "");
    setCargo(membro?.cargo ?? "");
    setAdmin(membro?.admin ?? false);
    setPermissoes(membro?.permissoes ?? {});
  }, [edicao, membro]);

  const salvar = useMutation({
    mutationFn: async () => {
      const base = { nome: nome.trim(), cargo: cargo.trim(), admin, permissoes };
      if (membro) {
        await salvarMembroFn({ data: { ...base, userId: membro.id } });
        return null;
      }
      return criarConviteFn({ data: { ...base, email: email.trim() } });
    },
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: QK.usuarios });
      if (membro) {
        if (membro.voce) qc.invalidateQueries({ queryKey: QK.perfil });
        toast.sucesso("Acesso atualizado.");
        onFechar();
      } else if (r) {
        onConvite({ ...r, nome: nome.trim() });
      }
    },
    onError: (e) => setErro(mensagemErro(e)),
  });

  function enviar(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    if (nome.trim().length < 2) return setErro("Informe o nome da pessoa.");
    if (!membro && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      return setErro("Informe um e-mail válido.");
    }
    if (!admin && !Object.keys(permissoes).length) {
      return setErro("Marque pelo menos uma permissão ou dê acesso de administrador.");
    }
    salvar.mutate();
  }

  return (
    <Modal
      aberto={!!edicao}
      onFechar={onFechar}
      largura="max-w-3xl"
      titulo={membro ? `Acesso de ${membro.nome ?? membro.email ?? "usuário"}` : "Novo acesso"}
      descricao={
        membro
          ? "Altere o cargo e o que a pessoa pode fazer no painel. Vale a partir do próximo carregamento da página dela."
          : "Preencha os dados e escolha as permissões. Vamos gerar um link de uso único para a pessoa criar a própria senha."
      }
      rodape={
        <>
          <button type="button" className={acao("secundario")} onClick={onFechar}>
            Cancelar
          </button>
          <button
            type="submit"
            form="form-acesso"
            className={acao("primario")}
            disabled={salvar.isPending}
          >
            {salvar.isPending && <Girando />}
            {membro ? "Salvar" : "Gerar link de acesso"}
          </button>
        </>
      }
    >
      <form id="form-acesso" onSubmit={enviar} noValidate className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label htmlFor="acesso-nome" className="mb-1.5 block text-sm font-medium text-grafite">
              Nome
            </label>
            <input
              id="acesso-nome"
              autoComplete="off"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className={classeCampo}
            />
          </div>
          <div>
            <label htmlFor="acesso-email" className="mb-1.5 block text-sm font-medium text-grafite">
              E-mail
            </label>
            <input
              id="acesso-email"
              type="email"
              inputMode="email"
              autoCapitalize="none"
              autoComplete="off"
              value={email}
              readOnly={!!membro}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(classeCampo, membro && "bg-gelo-2 text-cinza")}
            />
          </div>
          <div>
            <label htmlFor="acesso-cargo" className="mb-1.5 block text-sm font-medium text-grafite">
              Cargo <span className="font-normal text-cinza">(opcional)</span>
            </label>
            <input
              id="acesso-cargo"
              placeholder="Ex.: Estrategista de lançamentos"
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              className={classeCampo}
            />
          </div>
        </div>

        <div className="rounded-[2px] border border-linha bg-papel px-4 py-2">
          <Interruptor
            id="acesso-admin"
            ligado={admin}
            onChange={setAdmin}
            disabled={membro?.voce}
            rotulo="Administrador"
            descricao={
              membro?.voce
                ? "Você não pode tirar o seu próprio acesso de administrador."
                : "Acesso total ao painel, inclusive gerenciar usuários."
            }
          />
        </div>

        {!admin && (
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-grafite">Permissões</span>
              <span className="text-xs text-cinza">Começar de um modelo:</span>
              {MODELOS.map((m) => (
                <button
                  key={m.rotulo}
                  type="button"
                  className="min-h-8 rounded-full border border-linha-forte bg-papel px-3 text-xs font-medium text-petroleo transition-colors hover:border-petroleo"
                  onClick={() => setPermissoes(normalizarPermissoes(m.permissoes))}
                >
                  {m.rotulo}
                </button>
              ))}
            </div>
            <GradePermissoes valor={permissoes} onChange={setPermissoes} />
          </div>
        )}

        {erro && (
          <p role="alert" className="text-sm font-medium text-terracota-texto">
            {erro}
          </p>
        )}
      </form>
    </Modal>
  );
}

function ModalLink({
  dados,
  onFechar,
}: {
  dados: { link: string; nome: string; expiraEm: string } | null;
  onFechar: () => void;
}) {
  const toast = useToast();
  const [copiado, setCopiado] = useState(false);
  useEffect(() => setCopiado(false), [dados?.link]);

  async function copiar() {
    if (!dados) return;
    try {
      await navigator.clipboard.writeText(dados.link);
      setCopiado(true);
      toast.sucesso("Link copiado.");
    } catch {
      toast.erro("Não foi possível copiar. Selecione o link e copie manualmente.");
    }
  }

  const mensagem = dados
    ? `Olá, ${dados.nome.split(/\s+/)[0]}! Este é o seu link para criar a senha do painel do site Daniel Basso: ${dados.link} (vale para um cadastro, até ${dataCurta(dados.expiraEm)}).`
    : "";

  return (
    <Modal
      aberto={!!dados}
      onFechar={onFechar}
      titulo="Link de acesso gerado"
      descricao={
        dados ? (
          <>
            Envie para <strong>{dados.nome}</strong>. O link vale para um cadastro só, até{" "}
            {dataCurta(dados.expiraEm)}. Por segurança ele não aparece de novo: se perder, gere um
            novo na lista.
          </>
        ) : undefined
      }
      rodape={
        <button type="button" className={acao("primario")} onClick={onFechar}>
          Concluir
        </button>
      }
    >
      {dados && (
        <div className="space-y-3">
          <label htmlFor="link-convite" className="sr-only">
            Link de acesso
          </label>
          <input
            id="link-convite"
            readOnly
            value={dados.link}
            onFocus={(e) => e.currentTarget.select()}
            className={cn(classeCampo, "font-mono text-[0.8125rem]")}
          />
          <div className="flex flex-wrap gap-2">
            <button type="button" className={acao("primario", "sm")} onClick={copiar}>
              {copiado ? (
                <Check aria-hidden className="size-4" />
              ) : (
                <Copy aria-hidden className="size-4" />
              )}
              {copiado ? "Copiado" : "Copiar link"}
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(mensagem)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={acao("secundario", "sm")}
            >
              <WhatsappLogo aria-hidden className="size-4" />
              Enviar pelo WhatsApp
            </a>
          </div>
        </div>
      )}
    </Modal>
  );
}
