import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { AppLayout } from "@/layouts/AppLayout";
import { Panel } from "@/components/industrial/Panel";
import { DataTable, type Column } from "@/components/industrial/DataTable";
import { StatusBadge } from "@/components/industrial/StatusBadge";
import { Drawer } from "@/components/industrial/Drawer";
import { Loading } from "@/components/industrial/Feedback";
import {
  createUsuario,
  deleteUsuario,
  getUsuarios,
  updateUsuario,
} from "@/services/usuariosService";
import type { Usuario, UserRole } from "@/types";

export const Route = createFileRoute("/usuarios")({
  head: () => ({
    meta: [
      { title: "Usuários · BioMonitor" },
      { name: "description", content: "Gerenciamento de usuários e perfis do sistema." },
    ],
  }),
  component: UsuariosPage,
});

const perfilLabel: Record<UserRole, string> = {
  administrador: "Administrador",
  operador: "Operador",
  visualizacao: "Visualização",
};

function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[] | null>(null);
  const [editing, setEditing] = useState<Usuario | null>(null);
  const [creating, setCreating] = useState(false);

  const reload = () => getUsuarios().then(setUsuarios);
  useEffect(() => {
    reload();
  }, []);

  const cols: Column<Usuario>[] = [
    {
      key: "nome",
      header: "Usuário",
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-semibold">
            {u.nome
              .split(" ")
              .map((s) => s[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </div>
          <div>
            <p className="font-medium">{u.nome}</p>
            <p className="text-xs text-muted-foreground">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "perfil",
      header: "Perfil",
      render: (u) => (
        <StatusBadge
          status="custom"
          className={
            u.perfil === "administrador"
              ? "border-primary/30 bg-primary/15 text-primary"
              : u.perfil === "operador"
                ? "border-warning/30 bg-warning/15 text-warning"
                : "border-border bg-muted text-muted-foreground"
          }
        >
          {perfilLabel[u.perfil]}
        </StatusBadge>
      ),
    },
    {
      key: "ativo",
      header: "Estado",
      render: (u) => <StatusBadge status={u.ativo ? "online" : "offline"}>{u.ativo ? "Ativo" : "Inativo"}</StatusBadge>,
    },
    {
      key: "acesso",
      header: "Último acesso",
      render: (u) => (
        <span className="text-xs text-muted-foreground">
          {new Date(u.ultimoAcesso).toLocaleString("pt-BR")}
        </span>
      ),
    },
    {
      key: "acoes",
      header: "",
      align: "right",
      render: (u) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => setEditing(u)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-primary"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={async () => {
              if (confirm(`Excluir ${u.nome}?`)) {
                await deleteUsuario(u.id);
                reload();
              }
            }}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AppLayout title="Usuários" subtitle="Controle de acesso e perfis">
      <Panel
        title="Usuários do sistema"
        action={
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Novo usuário
          </button>
        }
        bodyClassName="p-0"
      >
        {!usuarios ? <Loading /> : <DataTable columns={cols} data={usuarios} rowKey={(u) => u.id} />}
      </Panel>

      <Drawer
        open={!!editing || creating}
        onClose={() => {
          setEditing(null);
          setCreating(false);
        }}
        title={editing ? `Editar ${editing.nome}` : "Novo usuário"}
      >
        <UsuarioForm
          initial={editing ?? undefined}
          onSubmit={async (v) => {
            if (editing) await updateUsuario(editing.id, v);
            else await createUsuario(v);
            setEditing(null);
            setCreating(false);
            reload();
          }}
        />
      </Drawer>
    </AppLayout>
  );
}

function UsuarioForm({
  initial,
  onSubmit,
}: {
  initial?: Usuario;
  onSubmit: (v: Omit<Usuario, "id" | "ultimoAcesso">) => Promise<void>;
}) {
  const [v, setV] = useState({
    nome: initial?.nome ?? "",
    email: initial?.email ?? "",
    perfil: (initial?.perfil ?? "operador") as UserRole,
    ativo: initial?.ativo ?? true,
  });

  const cls =
    "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary";

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(v); }} className="space-y-4">
      <label className="flex flex-col gap-1">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Nome</span>
        <input required value={v.nome} onChange={(e) => setV({ ...v, nome: e.target.value })} className={cls} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">E-mail</span>
        <input required type="email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} className={cls} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Perfil</span>
        <select value={v.perfil} onChange={(e) => setV({ ...v, perfil: e.target.value as UserRole })} className={cls}>
          <option value="administrador">Administrador</option>
          <option value="operador">Operador</option>
          <option value="visualizacao">Visualização</option>
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={v.ativo} onChange={(e) => setV({ ...v, ativo: e.target.checked })} />
        Usuário ativo
      </label>
      <button className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
        Salvar
      </button>
    </form>
  );
}
