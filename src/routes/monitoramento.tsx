import { createFileRoute } from "@tanstack/react-router";
import { Droplets, FlaskConical, RefreshCw, Sprout, Thermometer } from "lucide-react";
import { useState } from "react";
import { AppLayout } from "@/layouts/AppLayout";
import { Panel, StatCard } from "@/components/industrial/Panel";
import { Heatmap3D } from "@/components/industrial/Heatmap3D";
import { StatusBadge } from "@/components/industrial/StatusBadge";
import { DataTable, type Column } from "@/components/industrial/DataTable";
import { Drawer } from "@/components/industrial/Drawer";
import { Loading } from "@/components/industrial/Feedback";
import { useAsync } from "@/hooks/useAsync";
import { getMonitoramento } from "@/services/dashboardService";
import type { Haste } from "@/types";

export const Route = createFileRoute("/monitoramento")({
  head: () => ({
    meta: [
      { title: "Monitoramento · BioMonitor" },
      { name: "description", content: "Detalhes da leira monitorada em tempo real." },
    ],
  }),
  component: MonitoramentoPage,
});

function MonitoramentoPage() {
  const { data, loading, reload } = useAsync(getMonitoramento, []);
  const [selected, setSelected] = useState<Haste | null>(null);

  const columns: Column<Haste>[] = [
    {
      key: "nome",
      header: "Haste",
      render: (h) => (
        <div>
          <p className="font-medium">{h.nome}</p>
          <p className="text-xs text-muted-foreground">{h.identificacao}</p>
        </div>
      ),
    },
    {
      key: "coord",
      header: "Coord (X, Y)",
      render: (h) => (
        <span className="font-mono text-xs text-muted-foreground">
          {h.coordenadaX.toFixed(1)}, {h.coordenadaY.toFixed(1)}
        </span>
      ),
    },
    {
      key: "temp",
      header: "Temperatura",
      align: "right",
      render: (h) => (
        <span className="font-mono">{h.temperatura.toFixed(1)}°C</span>
      ),
    },
    {
      key: "status",
      header: "Estado",
      render: (h) => <StatusBadge status={h.status} />,
    },
    {
      key: "ultima",
      header: "Última leitura",
      align: "right",
      render: (h) => (
        <span className="text-xs text-muted-foreground">
          {new Date(h.ultimaLeitura).toLocaleString("pt-BR")}
        </span>
      ),
    },
  ];

  if (loading || !data) {
    return (
      <AppLayout title="Monitoramento">
        <Loading />
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Monitoramento"
      subtitle={`${data.leira.nome} · atualizado ${new Date(data.ultimaAtualizacao).toLocaleTimeString("pt-BR")}`}
      headerAction={
        <button
          onClick={reload}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary hover:text-primary transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Atualizar
        </button>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Temp. média"
          value={data.temperaturaMedia}
          unit="°C"
          tone="primary"
          icon={<Thermometer className="h-4 w-4" />}
        />
        <StatCard
          label="Umidade"
          value={data.umidadeMedia}
          unit="%"
          tone="success"
          icon={<Droplets className="h-4 w-4" />}
        />
        <StatCard
          label="pH"
          value={data.phMedio}
          icon={<FlaskConical className="h-4 w-4" />}
        />
        <StatCard
          label="NPK"
          value={data.npkMedio}
          unit="pts"
          tone="success"
          icon={<Sprout className="h-4 w-4" />}
        />
      </div>

      <Panel
        title="Heatmap 3D"
        subtitle={`Leira ${data.leira.comprimento}m × ${data.leira.largura}m`}
      >
        <Heatmap3D height={400} />
      </Panel>

      <Panel
        title="Hastes"
        subtitle="Clique em uma linha para ver detalhes"
        bodyClassName="p-0"
      >
        <DataTable
          columns={columns}
          data={data.hastes}
          rowKey={(h) => h.id}
          onRowClick={setSelected}
        />
      </Panel>

      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.nome}
        subtitle={selected?.identificacao}
        width="max-w-lg"
      >
        {selected && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="Temperatura"
                value={selected.temperatura.toFixed(1)}
                unit="°C"
                tone="primary"
                icon={<Thermometer className="h-4 w-4" />}
              />
              <StatCard
                label="Estado"
                value={<StatusBadge status={selected.status} />}
              />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Localização
              </p>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <div className="rounded-md border border-border bg-surface p-3">
                  <p className="text-xs text-muted-foreground">Coordenada X</p>
                  <p className="font-mono text-lg">{selected.coordenadaX.toFixed(2)} m</p>
                </div>
                <div className="rounded-md border border-border bg-surface p-3">
                  <p className="text-xs text-muted-foreground">Coordenada Y</p>
                  <p className="font-mono text-lg">{selected.coordenadaY.toFixed(2)} m</p>
                </div>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Última leitura
              </p>
              <p className="mt-1 text-sm text-foreground">
                {new Date(selected.ultimaLeitura).toLocaleString("pt-BR")}
              </p>
            </div>
          </div>
        )}
      </Drawer>
    </AppLayout>
  );
}
