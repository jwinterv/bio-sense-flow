import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  Bell,
  Droplets,
  FlaskConical,
  Sprout,
  Thermometer,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppLayout } from "@/layouts/AppLayout";
import { Panel, StatCard } from "@/components/industrial/Panel";
import { StatusBadge } from "@/components/industrial/StatusBadge";
import { Heatmap3D } from "@/components/industrial/Heatmap3D";
import { Loading } from "@/components/industrial/Feedback";
import { DataTable, type Column } from "@/components/industrial/DataTable";
import { useAsync } from "@/hooks/useAsync";
import { getDashboard } from "@/services/dashboardService";
import type { Alerta, Haste, SeriePonto } from "@/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · BioMonitor" },
      { name: "description", content: "Visão geral da leira em tempo real." },
    ],
  }),
  component: DashboardPage,
});

const chartAxis = {
  stroke: "var(--color-muted-foreground)",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
} as const;

function formatHour(ts: string) {
  return new Date(ts).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TempChart({ data }: { data: SeriePonto[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="gradTemp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.5} />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="timestamp" tickFormatter={formatHour} {...chartAxis} minTickGap={40} />
        <YAxis unit="°" {...chartAxis} width={35} />
        <Tooltip
          contentStyle={{
            background: "var(--color-popover)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            fontSize: 12,
          }}
          labelFormatter={(v) => formatHour(v as string)}
          formatter={(v: number) => [`${v.toFixed(1)} °C`, "Temperatura"]}
        />
        <Area
          type="monotone"
          dataKey="valor"
          stroke="var(--color-primary)"
          strokeWidth={2}
          fill="url(#gradTemp)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function UmidChart({ data }: { data: SeriePonto[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="timestamp" tickFormatter={formatHour} {...chartAxis} minTickGap={40} />
        <YAxis unit="%" {...chartAxis} width={35} />
        <Tooltip
          contentStyle={{
            background: "var(--color-popover)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            fontSize: 12,
          }}
          labelFormatter={(v) => formatHour(v as string)}
          formatter={(v: number) => [`${v.toFixed(1)} %`, "Umidade"]}
        />
        <Line
          type="monotone"
          dataKey="valor"
          stroke="var(--color-success)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

const hastesColumns: Column<Haste>[] = [
  {
    key: "nome",
    header: "Haste",
    render: (h) => (
      <div>
        <p className="font-medium text-foreground">{h.nome}</p>
        <p className="text-xs text-muted-foreground">{h.identificacao}</p>
      </div>
    ),
  },
  {
    key: "temp",
    header: "Temp.",
    align: "right",
    render: (h) => (
      <span className="font-mono text-sm">{h.temperatura.toFixed(1)}°C</span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (h) => <StatusBadge status={h.status} />,
  },
  {
    key: "hora",
    header: "Última leitura",
    align: "right",
    render: (h) => (
      <span className="text-xs text-muted-foreground">
        {formatHour(h.ultimaLeitura)}
      </span>
    ),
  },
];

function DashboardPage() {
  const { data, loading } = useAsync(getDashboard, []);

  if (loading || !data) {
    return (
      <AppLayout title="Dashboard" subtitle="Visão geral da operação">
        <Loading />
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Dashboard"
      subtitle="Visão consolidada da bioconversão em tempo real"
    >
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard
          label="Temperatura média"
          value={data.temperaturaMedia}
          unit="°C"
          icon={<Thermometer className="h-4 w-4" />}
          tone="primary"
          trend="up"
          trendLabel="+0.4°C nas últimas 2h"
        />
        <StatCard
          label="Temperatura máxima"
          value={data.temperaturaMax}
          unit="°C"
          icon={<Thermometer className="h-4 w-4" />}
          tone="primary"
          trend="up"
        />
        <StatCard
          label="Umidade média"
          value={data.umidadeMedia}
          unit="%"
          icon={<Droplets className="h-4 w-4" />}
          tone="success"
          trend="flat"
          trendLabel="Dentro da faixa ideal"
        />
        <StatCard
          label="Alertas ativos"
          value={data.alertasAtivos}
          icon={<AlertTriangle className="h-4 w-4" />}
          tone={data.alertasAtivos > 0 ? "destructive" : "success"}
          trendLabel={data.alertasAtivos > 0 ? "Requer atenção" : "Sem incidentes"}
        />
      </div>

      <div className="mt-4 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <Sprout className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Última leitura</p>
              <p className="text-2xl font-semibold text-foreground">
                {data.ultimaLeitura.toLocaleString("pt-BR")}
              </p>
            </div>
          </div>
          <div className="rounded-full border border-primary/20 bg-background/70 px-3 py-1 text-sm font-medium text-primary">
            Atualização em tempo real
          </div>
        </div>
      </div>

      <Panel
        title="Distribuição Térmica da Leira"
        subtitle="Visualização volumétrica das hastes instaladas"
        bodyClassName="p-0"
      >
        <div className="p-5 pt-0">
          <Heatmap3D height={380} />
        </div>
      </Panel>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Panel
          title="Temperatura — últimas 24h"
          icon={<Thermometer className="h-4 w-4" />}
        >
          <TempChart data={data.historicoTemperatura} />
        </Panel>
        <Panel title="Umidade — últimas 24h" icon={<Droplets className="h-4 w-4" />}>
          <UmidChart data={data.historicoUmidade} />
        </Panel>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Panel title="Últimos alertas" icon={<Bell className="h-4 w-4" />} bodyClassName="p-0">
          <ul className="divide-y divide-border/50">
            {data.ultimosAlertas.map((a: Alerta) => (
              <li key={a.id} className="flex items-start gap-3 px-5 py-3">
                <StatusBadge status={a.severidade} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {a.tipo} · {a.hasteNome}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {a.mensagem}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatHour(a.data)}
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Status das hastes" bodyClassName="p-0">
          <DataTable
            columns={hastesColumns}
            data={data.hastes}
            rowKey={(h) => h.id}
          />
        </Panel>
      </div>
    </AppLayout>
  );
}
