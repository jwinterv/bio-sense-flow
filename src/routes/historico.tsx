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
import { 
  getHistorico, 
  getHastes,
  type HistoricoFiltros 
} from "@/services/dashboardService";

export const Route = createFileRoute("/historico")({
  head: () => ({
    meta: [
      { title: "Histórico" },
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

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
      />
      {label}
    </label>
  );
}

function HistoricoPage() {
  const [filtros, setFiltros] = useState<HistoricoFiltros>({
    periodo: "24h",
    sensores: ["temperatura"],
    hastes: [],
    sensorId: "ambos",
  });

  const { data: hastes } = useAsync(getHastes, []);

  const { data, loading } = useAsync(() => getHistorico(filtros), [
    filtros.periodo,
    filtros.sensores,
    filtros.hastes,
    filtros.sensorId,
    filtros.inicio,
    filtros.fim,
  ]);

  const chartData = data
    ? (() => {

        const pontos: Record<string, any> = {};

        data.series.forEach((serie) => {
          serie.dados.forEach((ponto) => {

            if (!pontos[ponto.timestamp]) {
              pontos[ponto.timestamp] = {
                timestamp: ponto.timestamp,
              };
            }

            pontos[ponto.timestamp][serie.nome] =
              ponto.valor;

          });
        });

        return Object.values(pontos);

      })()
    : [];

    const sensorColors: Record<string, string> = {
      temperatura: "#ef4444",
      umidade: "#3b82f6",
      salinidade: "#22c55e",
      ssd: "#a855f7",
      nitrogenio: "#f97316",
      fosforo: "#eab308",
      potassio: "#14b8a6",
      condutividade: "#ec4899",
      ph: "#6366f1",
      metano: "#78716c",
      amonia: "#92400e",
    };

  return (
    <AppLayout title="Histórico" subtitle="Séries temporais dos sensores">
      <Panel title="Filtros">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Select
            label="Período"
            value={filtros.periodo ?? "24h"}
            onChange={(v) => setFiltros((f) => ({ ...f, periodo: v as HistoricoFiltros["periodo"] }))}
            options={[
              { value:"1h", label:"Última hora" },
              { value:"6h", label:"Últimas 6 horas" },
              { value:"12h", label:"Últimas 12 horas" },
              { value:"24h", label:"Últimas 24 horas" },
              { value:"7d", label:"Últimos 7 dias" },
              { value:"30d", label:"Últimos 30 dias" },
              { value:"custom", label:"Personalizado" },
            ]}
          />
          {filtros.periodo === "custom" && (
            <div className="col-span-2 md:col-span-4 grid grid-cols-2 gap-4 mt-4">

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
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Sensores
            </span>

            <div className="grid grid-cols-2 gap-2 mt-2">

              {[
                ["temperatura", "Temperatura"],
                ["umidade", "Umidade"],
                ["salinidade", "Salinidade"],
                ["ssd", "SSD"],
                ["nitrogenio", "Nitrogênio"],
                ["fosforo", "Fósforo"],
                ["potassio", "Potássio"],
                ["condutividade", "Condutividade"],
                ["ph", "pH"],
                ["metano", "Metano"],
                ["amonia", "Amônia"],
              ].map(([id, nome]) => (

                <Checkbox
                  key={id}
                  label={nome}
                  checked={filtros.sensores.includes(id)}
                  onChange={() => {
                    setFiltros((f) => ({
                      ...f,
                      sensores: f.sensores.includes(id)
                        ? f.sensores.filter((s) => s !== id)
                        : [...f.sensores, id],
                    }));
                  }}
                />

              ))}

            </div>
          </div>
          <Select
            label="Haste"
            value={filtros.hastes[0] ?? ""}
            onChange={(v) =>
              setFiltros((f) => ({
                ...f,
                hastes: v ? [v] : [],
              }))
            }
            options={[
              {
                value: "",
                label: "Todas",
              },

              ...(hastes ?? []).map((h) => ({
                value: h.id,
                label: h.nome,
              })),
            ]}
          />
          <Select
            label="Sensor NPK"
            value={filtros.sensorId}
            onChange={(v) =>
              setFiltros((f) => ({
                ...f,
                sensorId: v as HistoricoFiltros["sensorId"],
              }))
            }
            options={[
              {
                value: "ambos",
                label: "Ambos",
              },
              {
                value: "1",
                label: "Sensor 1",
              },
              {
                value: "2",
                label: "Sensor 2",
              },
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
              data={chartData}
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
              {filtros.sensores.map((sensor) => (
                <Area
                  key={sensor}
                  type="monotone"
                  dataKey={sensor}
                  stroke={sensorColors[sensor] ?? "var(--color-primary)"}
                  strokeWidth={2}
                  fill="none"
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Panel>
    </AppLayout>
  );
}
