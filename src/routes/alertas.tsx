import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppLayout } from "@/layouts/AppLayout";
import { Panel } from "@/components/industrial/Panel";
import { DataTable, type Column } from "@/components/industrial/DataTable";
import { StatusBadge } from "@/components/industrial/StatusBadge";
import { Loading, EmptyState } from "@/components/industrial/Feedback";
import { useAsync } from "@/hooks/useAsync";
import { getAlertas, type AlertaFiltros, resolverAlerta } from "@/services/alertasService";
import { getHastes } from "@/services/dashboardService";
import type { Alerta, AlertStatus,  Severity } from "@/types";
import { Bell } from "lucide-react";
import { Drawer } from "@/components/industrial/Drawer";
import { StatCard } from "@/components/industrial/Panel";

export const Route = createFileRoute("/alertas")({
  head: () => ({
    meta: [
      { title: "Alertas" },
      { name: "description", content: "Todos os alertas gerados pelo sistema." },
    ],
  }),
  component: AlertasPage,
});

function AlertasPage() {
  const { data: hastes } = useAsync(getHastes, []);

  const [filtros, setFiltros] = useState<AlertaFiltros>({
    periodo: "custom",
    severidade: undefined,
    status: undefined,
    hastes: [],
  });
  const [selected, setSelected] = useState<Alerta | null>(null);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const { data, loading } = useAsync(() => getAlertas(filtros), [
    filtros.periodo,
    filtros.severidade,
    filtros.status,
    filtros.hastes?.join(","),
    filtros.inicio,
    filtros.fim,
  ]);

  useEffect(() => {
    if (data) {
      setAlertas(data);
    }
  }, [data]);

  const columns: Column<Alerta>[] = [
    {
      key: "data",
      header: "Data",
      render: (a) => (
        <span className="text-sm text-foreground">
          {new Date(a.data).toLocaleString("pt-BR")}
        </span>
      ),
    },
    {
      key: "haste",
      header: "Haste",
      render: (a) => (
        <span className="font-medium">
          Haste {a.hasteId}
        </span>
      ),
    },
    { key: "tipo", header: "Tipo", render: (a) => a.tipo },
    {
      key: "sev",
      header: "Severidade",
      render: (a) => <StatusBadge status={a.severidade} />,
    },
    {
      key: "status",
      header: "Status",
      render: (a) => <StatusBadge status={a.status} />,
    },
    {
      key: "msg",
      header: "Mensagem",
      render: (a) => (
        <span className="text-xs text-muted-foreground">{a.mensagem}</span>
      ),
    },
  ];

async function handleResolver() {
  if (!selected) return;

  await resolverAlerta(
    String(selected.idErro),
    selected.origem
  );

  // Atualiza tabela
  setAlertas((lista) =>
    lista.map((alerta) =>
      alerta.id === String(selected.idErro)
        ? {
            ...alerta,
            status: "resolvido",
          }
        : alerta
    )
  );

  // Atualiza drawer
  setSelected({
    ...selected,
    status: "resolvido",
  });
}

  return (
    <AppLayout title="Alertas" subtitle="Central de eventos e ocorrências">
      <Panel title="Filtros">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Período
            </span>
            <select
              value={filtros.periodo ?? ""}
              onChange={(e) =>
                setFiltros((f) => ({
                  ...f,
                  periodo: e.target.value as AlertaFiltros["periodo"],
                }))
              }
              className="rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="1h">Última 1 hora</option>
              <option value="6h">Últimas 6 horas</option>
              <option value="12h">Últimas 12 horas</option>
              <option value="24h">Últimas 24 horas</option>
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="custom">Personalizado</option>
            </select>
          </label>
          {filtros.periodo === "custom" && (
            <div className="col-span-2 md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">

              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Início
                </span>

                <input
                  type="datetime-local"
                  value={filtros.inicio ?? ""}
                  onChange={(e) =>
                    setFiltros((f) => ({
                      ...f,
                      inicio: e.target.value,
                    }))
                  }
                  className="rounded-md border border-border bg-surface px-3 py-2 text-sm"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Fim
                </span>

                <input
                  type="datetime-local"
                  value={filtros.fim ?? ""}
                  onChange={(e) =>
                    setFiltros((f) => ({
                      ...f,
                      fim: e.target.value,
                    }))
                  }
                  className="rounded-md border border-border bg-surface px-3 py-2 text-sm"
                />
              </label>

            </div>
          )}
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Severidade
            </span>
            <select
              value={filtros.severidade ?? ""}
              onChange={(e) =>
                setFiltros((f) => ({
                  ...f,
                  severidade: (e.target.value || undefined) as Severity | undefined,
                }))
              }
              className="rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="">Todas</option>
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
              <option value="critica">Crítica</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Status
            </span>

            <select
              value={filtros.status ?? ""}
              onChange={(e) =>
                setFiltros((f) => ({
                  ...f,
                  status: (e.target.value || undefined) as AlertStatus | undefined,
                }))
              }
              className="rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="">Todos</option>
              <option value="ativo">Ativos</option>
              <option value="resolvido">Resolvidos</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Haste
            </span>
            <select
              value={filtros.hastes?.[0] ?? ""}
              onChange={(e) =>
                setFiltros((f) => ({
                  ...f,
                  hastes: e.target.value ? [e.target.value] : [],
                }))
              }
              className="rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="">Todas</option>
              {(hastes ?? []).map((h) => (
                <option key={h.id} value={h.id}>
                  {h.nome}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Panel>

      <Panel title="Ocorrências" bodyClassName="p-0">
        {loading || !data ? (
          <Loading />
        ) : (
          <DataTable
            columns={columns}
            data={alertas}
            rowKey={(a) => a.id}
            onRowClick={setSelected}
            empty={
              <EmptyState
                icon={<Bell className="h-5 w-5" />}
                title="Nenhum alerta encontrado"
                description="Não há registros para os filtros selecionados."
              />
            }
          />
          
        )}
      </Panel>
      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.tipo}
        subtitle={`Haste ${selected?.hasteId}`}
      >
        {selected && (
          <div className="space-y-5">

            <StatCard
              label="Severidade"
              value={<StatusBadge status={selected.severidade} />}
            />

            <StatCard
              label="Status"
              value={<StatusBadge status={selected.status} />}
            />

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Mensagem
              </p>

              <p className="mt-2 text-sm">
                {selected.mensagem}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Instrução
              </p>

              <p className="mt-2 text-sm">
                {selected.instrucao}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Data
              </p>

              <p className="mt-2 text-sm">
                {new Date(selected.data).toLocaleString("pt-BR")}
              </p>
            </div>

          </div>
        )}
        {selected && selected.status === "ativo" && (
          <button
            onClick={handleResolver}
            className="mt-6 w-full rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            Marcar como resolvido
          </button>
        )}
      </Drawer>
    </AppLayout>
  );
}
