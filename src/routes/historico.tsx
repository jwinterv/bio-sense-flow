import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppLayout } from "@/layouts/AppLayout";
import { Panel } from "@/components/industrial/Panel";
import { Loading } from "@/components/industrial/Feedback";
import { useAsync } from "@/hooks/useAsync";
import { getHistorico, type HistoricoFiltros } from "@/services/dashboardService";
import { mockHastes } from "@/services/mockData";

export const Route = createFileRoute("/historico")({
  head: () => ({
    meta: [
      { title: "Histórico · BioMonitor" },
      { name: "description", content: "Séries históricas de sensores e hastes." },
    ],
  }),
  component: HistoricoPage,
});

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function HistoricoPage() {
  const [filtros, setFiltros] = useState<HistoricoFiltros>({
    periodo: "24h",
    sensor: "temperatura",
    hasteId: "",
  });

  const { data, loading } = useAsync(() => getHistorico(filtros), [
    filtros.periodo,
    filtros.sensor,
    filtros.hasteId,
  ]);

  return (
    <AppLayout title="Histórico" subtitle="Séries temporais dos sensores">
      <Panel title="Filtros">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Select
            label="Período"
            value={filtros.periodo ?? "24h"}
            onChange={(v) => setFiltros((f) => ({ ...f, periodo: v as HistoricoFiltros["periodo"] }))}
            options={[
              { value: "24h", label: "Últimas 24 horas" },
              { value: "7d", label: "Últimos 7 dias" },
              { value: "30d", label: "Últimos 30 dias" },
            ]}
          />
          <Select
            label="Sensor"
            value={filtros.sensor ?? "temperatura"}
            onChange={(v) => setFiltros((f) => ({ ...f, sensor: v }))}
            options={[
              { value: "temperatura", label: "Temperatura" },
              { value: "umidade", label: "Umidade" },
              { value: "ph", label: "pH" },
              { value: "npk", label: "NPK" },
            ]}
          />
          <Select
            label="Haste"
            value={filtros.hasteId ?? ""}
            onChange={(v) => setFiltros((f) => ({ ...f, hasteId: v }))}
            options={[
              { value: "", label: "Todas" },
              ...mockHastes.map((h) => ({ value: h.id, label: h.nome })),
            ]}
          />
        </div>
      </Panel>

      <Panel title="Série histórica">
        {loading || !data ? (
          <Loading />
        ) : (
          <ResponsiveContainer width="100%" height={380}>
            <AreaChart
              data={filtros.sensor === "umidade" ? data.umidade : data.temperatura}
              margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
            >
              <defs>
                <linearGradient id="gradHist" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(v) =>
                  new Date(v).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                }
                stroke="var(--color-muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                minTickGap={40}
              />
              <YAxis
                stroke="var(--color-muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelFormatter={(v) => new Date(v as string).toLocaleString("pt-BR")}
              />
              <Area
                type="monotone"
                dataKey="valor"
                stroke="var(--color-primary)"
                strokeWidth={2}
                fill="url(#gradHist)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Panel>
    </AppLayout>
  );
}
