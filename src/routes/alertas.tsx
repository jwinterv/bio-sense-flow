import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout } from "@/layouts/AppLayout";
import { Panel } from "@/components/industrial/Panel";
import { DataTable, type Column } from "@/components/industrial/DataTable";
import { StatusBadge } from "@/components/industrial/StatusBadge";
import { Loading, EmptyState } from "@/components/industrial/Feedback";
import { useAsync } from "@/hooks/useAsync";
import { getAlertas, type AlertaFiltros } from "@/services/alertasService";
import { mockHastes } from "@/services/mockData";
import type { Alerta, Severity } from "@/types";
import { Bell } from "lucide-react";

export const Route = createFileRoute("/alertas")({
  head: () => ({
    meta: [
      { title: "Alertas · BioMonitor" },
      { name: "description", content: "Todos os alertas gerados pelo sistema." },
    ],
  }),
  component: AlertasPage,
});

function AlertasPage() {
  const [filtros, setFiltros] = useState<AlertaFiltros>({});
  const { data, loading } = useAsync(() => getAlertas(filtros), [
    filtros.periodo,
    filtros.severidade,
    filtros.hasteId,
  ]);

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
    { key: "haste", header: "Haste", render: (a) => a.hasteNome },
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
                  periodo: (e.target.value || undefined) as AlertaFiltros["periodo"],
                }))
              }
              className="rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="">Todos</option>
              <option value="24h">Últimas 24h</option>
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
            </select>
          </label>
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
              Haste
            </span>
            <select
              value={filtros.hasteId ?? ""}
              onChange={(e) =>
                setFiltros((f) => ({
                  ...f,
                  hasteId: e.target.value || undefined,
                }))
              }
              className="rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="">Todas</option>
              {mockHastes.map((h) => (
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
            data={data}
            rowKey={(a) => a.id}
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
    </AppLayout>
  );
}
