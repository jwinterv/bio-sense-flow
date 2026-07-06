import { createFileRoute } from "@tanstack/react-router";
import { BatteryCharging, Droplets, FlaskConical, Gauge, RefreshCw, Sprout, Thermometer, Zap } from "lucide-react";
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
import type { Haste, MonitoramentoResumo } from "@/types";

export const Route = createFileRoute("/monitoramento")({
  head: () => ({
    meta: [
      { title: "Monitoramento · BioMonitor" },
      { name: "description", content: "Detalhes da leira monitorada em tempo real." },
    ],
  }),
  component: MonitoramentoPage,
});

function buildSoilMetrics(data: MonitoramentoResumo) {
  return [
    {
      key: "temperatura",
      label: "Temperatura",
      value: data.temperaturaMedia.toFixed(1),
      unit: "°C",
      tone: "primary" as const,
      icon: <Thermometer className="h-4 w-4" />,
    },
    {
      key: "umidade",
      label: "Umidade",
      value: data.umidadeMedia.toFixed(1),
      unit: "%",
      tone: "success" as const,
      icon: <Droplets className="h-4 w-4" />,
    },
    {
      key: "salinidade",
      label: "Salinidade",
      value: (1.8 + data.umidadeMedia / 100).toFixed(2),
      unit: "g/L",
      icon: <FlaskConical className="h-4 w-4" />,
    },
    {
      key: "solidos",
      label: "Sólidos dissolvidos",
      value: Math.round(420 + data.temperaturaMedia * 11).toString(),
      unit: "mg/L",
      icon: <Sprout className="h-4 w-4" />,
    },
    {
      key: "nitrogenio",
      label: "Nitrogênio",
      value: Math.round(44 + data.umidadeMedia / 2).toString(),
      unit: "mg/L",
      icon: <Sprout className="h-4 w-4" />,
    },
    {
      key: "fosforo",
      label: "Fósforo",
      value: Math.round(18 + data.phMedio).toString(),
      unit: "mg/L",
      icon: <Sprout className="h-4 w-4" />,
    },
    {
      key: "potassio",
      label: "Potássio",
      value: Math.round(230 + data.temperaturaMedia * 3).toString(),
      unit: "mg/L",
      icon: <Sprout className="h-4 w-4" />,
    },
    {
      key: "condutividade",
      label: "Condutividade",
      value: Math.round(1180 + data.umidadeMedia * 7).toString(),
      unit: "uS/cm",
      icon: <FlaskConical className="h-4 w-4" />,
    },
  ];
}

function buildGasMetrics(data: MonitoramentoResumo) {
  return [
    {
      key: "amonia",
      label: "Amônia",
      value: Math.round(6 + data.temperaturaMedia / 2).toString(),
      unit: "ppm",
      tone: "warning" as const,
      icon: <FlaskConical className="h-4 w-4" />,
    },
    {
      key: "metano",
      label: "Metano",
      value: Math.round(10 + data.umidadeMedia / 4).toString(),
      unit: "ppm",
      tone: "destructive" as const,
      icon: <FlaskConical className="h-4 w-4" />,
    },
  ];
}

function buildHeatmapValues(variable: string, data: MonitoramentoResumo) {
  const baseTemp = data.temperaturaMedia;
  const baseUmidade = data.umidadeMedia;
  const basePh = data.phMedio;

  switch (variable) {
    case "umidade":
      return [
        { x: 1, y: 1, value: baseUmidade - 3 },
        { x: 2, y: 1, value: baseUmidade + 2 },
        { x: 3, y: 1, value: baseUmidade - 1 },
        { x: 4, y: 1, value: baseUmidade + 4 },
        { x: 1, y: 2, value: baseUmidade + 1 },
        { x: 2, y: 2, value: baseUmidade - 2 },
        { x: 3, y: 2, value: baseUmidade + 3 },
        { x: 4, y: 2, value: baseUmidade - 4 },
        { x: 1, y: 3, value: baseUmidade + 5 },
        { x: 2, y: 3, value: baseUmidade + 2 },
        { x: 3, y: 3, value: baseUmidade - 2 },
        { x: 4, y: 3, value: baseUmidade + 1 },
        { x: 1, y: 4, value: baseUmidade - 1 },
        { x: 2, y: 4, value: baseUmidade + 3 },
        { x: 3, y: 4, value: baseUmidade + 2 },
        { x: 4, y: 4, value: baseUmidade - 3 },
      ];
    case "salinidade":
      return [
        { x: 1, y: 1, value: 1.7 },
        { x: 2, y: 1, value: 1.9 },
        { x: 3, y: 1, value: 2.1 },
        { x: 4, y: 1, value: 2.0 },
        { x: 1, y: 2, value: 1.8 },
        { x: 2, y: 2, value: 2.3 },
        { x: 3, y: 2, value: 1.9 },
        { x: 4, y: 2, value: 2.4 },
        { x: 1, y: 3, value: 2.2 },
        { x: 2, y: 3, value: 2.1 },
        { x: 3, y: 3, value: 2.0 },
        { x: 4, y: 3, value: 2.3 },
        { x: 1, y: 4, value: 1.9 },
        { x: 2, y: 4, value: 2.2 },
        { x: 3, y: 4, value: 2.0 },
        { x: 4, y: 4, value: 1.8 },
      ];
    case "ph":
      return [
        { x: 1, y: 1, value: basePh - 0.3 },
        { x: 2, y: 1, value: basePh + 0.2 },
        { x: 3, y: 1, value: basePh + 0.1 },
        { x: 4, y: 1, value: basePh - 0.2 },
        { x: 1, y: 2, value: basePh + 0.3 },
        { x: 2, y: 2, value: basePh - 0.1 },
        { x: 3, y: 2, value: basePh + 0.2 },
        { x: 4, y: 2, value: basePh },
        { x: 1, y: 3, value: basePh + 0.1 },
        { x: 2, y: 3, value: basePh - 0.2 },
        { x: 3, y: 3, value: basePh + 0.3 },
        { x: 4, y: 3, value: basePh },
        { x: 1, y: 4, value: basePh - 0.1 },
        { x: 2, y: 4, value: basePh + 0.2 },
        { x: 3, y: 4, value: basePh },
        { x: 4, y: 4, value: basePh - 0.3 },
      ];
    case "amonia":
      return [
        { x: 1, y: 1, value: 8 },
        { x: 2, y: 1, value: 11 },
        { x: 3, y: 1, value: 9 },
        { x: 4, y: 1, value: 7 },
        { x: 1, y: 2, value: 10 },
        { x: 2, y: 2, value: 13 },
        { x: 3, y: 2, value: 12 },
        { x: 4, y: 2, value: 8 },
        { x: 1, y: 3, value: 9 },
        { x: 2, y: 3, value: 11 },
        { x: 3, y: 3, value: 10 },
        { x: 4, y: 3, value: 7 },
        { x: 1, y: 4, value: 8 },
        { x: 2, y: 4, value: 12 },
        { x: 3, y: 4, value: 9 },
        { x: 4, y: 4, value: 11 },
      ];
    case "metano":
      return [
        { x: 1, y: 1, value: 12 },
        { x: 2, y: 1, value: 14 },
        { x: 3, y: 1, value: 10 },
        { x: 4, y: 1, value: 13 },
        { x: 1, y: 2, value: 15 },
        { x: 2, y: 2, value: 18 },
        { x: 3, y: 2, value: 16 },
        { x: 4, y: 2, value: 14 },
        { x: 1, y: 3, value: 13 },
        { x: 2, y: 3, value: 17 },
        { x: 3, y: 3, value: 12 },
        { x: 4, y: 3, value: 15 },
        { x: 1, y: 4, value: 11 },
        { x: 2, y: 4, value: 16 },
        { x: 3, y: 4, value: 13 },
        { x: 4, y: 4, value: 14 },
      ];
    case "temperatura":
    default:
      return [
        { x: 1, y: 1, value: baseTemp - 0.6 },
        { x: 2, y: 1, value: baseTemp + 0.2 },
        { x: 3, y: 1, value: baseTemp - 0.3 },
        { x: 4, y: 1, value: baseTemp + 0.4 },
        { x: 1, y: 2, value: baseTemp + 0.3 },
        { x: 2, y: 2, value: baseTemp - 0.2 },
        { x: 3, y: 2, value: baseTemp + 0.5 },
        { x: 4, y: 2, value: baseTemp - 0.4 },
        { x: 1, y: 3, value: baseTemp + 0.2 },
        { x: 2, y: 3, value: baseTemp - 0.1 },
        { x: 3, y: 3, value: baseTemp + 0.3 },
        { x: 4, y: 3, value: baseTemp - 0.5 },
        { x: 1, y: 4, value: baseTemp - 0.2 },
        { x: 2, y: 4, value: baseTemp + 0.4 },
        { x: 3, y: 4, value: baseTemp + 0.1 },
        { x: 4, y: 4, value: baseTemp - 0.3 },
      ];
  }
}

function getHeatmapUnit(type: "solo" | "gasoso", variable: string) {
  if (type === "solo") {
    if (variable === "ph") return "pH";
    if (variable === "umidade") return "%";
    if (variable === "salinidade") return "g/L";
    return "°C";
  }

  return "ppm";
}

function MonitoramentoPage() {
  const { data, loading, reload } = useAsync(getMonitoramento, []);
  const [selected, setSelected] = useState<Haste | null>(null);
  const [heatmapCount, setHeatmapCount] = useState<1 | 2>(1);
  const [singleHeatmapVariable, setSingleHeatmapVariable] = useState("temperatura");
  const [heatmapOneVariable, setHeatmapOneVariable] = useState("temperatura");
  const [heatmapTwoVariable, setHeatmapTwoVariable] = useState("amonia");

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

  const soilMetrics = buildSoilMetrics(data);
  const gasMetrics = buildGasMetrics(data);
  const soilHeatmapValues = buildHeatmapValues(heatmapOneVariable, data);
  const gasHeatmapValues = buildHeatmapValues(heatmapTwoVariable, data);
  const singleHeatmapValues = buildHeatmapValues(singleHeatmapVariable, data);
  const deviceMetrics = [
    {
      key: "inclinação",
      label: "Inclinação da haste",
      value: "4.2",
      unit: "°",
      tone: "warning" as const,
      icon: <Gauge className="h-4 w-4" />,
    },
    {
      key: "tensao",
      label: "Tensão",
      value: "12.4",
      unit: "V",
      tone: "success" as const,
      icon: <BatteryCharging className="h-4 w-4" />,
    },
    {
      key: "placa",
      label: "Temperatura da placa",
      value: "41.8",
      unit: "°C",
      tone: "primary" as const,
      icon: <Thermometer className="h-4 w-4" />,
    },
    {
      key: "corrente",
      label: "Corrente",
      value: "18.6",
      unit: "mA",
      tone: "default" as const,
      icon: <Zap className="h-4 w-4" />,
    },
  ];
  const heatmapOptions = [
    { value: "temperatura", label: "Temperatura" },
    { value: "umidade", label: "Umidade" },
    { value: "salinidade", label: "Salinidade" },
    { value: "ph", label: "pH" },
    { value: "amonia", label: "Amônia" },
    { value: "metano", label: "Metano" },
  ];

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

      <div className="mt-4 space-y-4">
        <Panel title="Sensores do solo" subtitle="Variáveis principais da camada de cultivo">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {soilMetrics.map((metric) => (
              <StatCard
                key={metric.key}
                label={metric.label}
                value={metric.value}
                unit={metric.unit}
                tone={metric.tone}
                icon={metric.icon}
              />
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-border bg-surface/80 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  pH do solo
                </p>
                <p className="mt-1 text-sm text-foreground">Indicador de alcalinidade e equilíbrio nutricional</p>
              </div>
              <span className="text-xl font-semibold text-primary">{data.phMedio.toFixed(1)}</span>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-border/70">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-success"
                style={{ width: `${Math.min(100, Math.max(10, ((data.phMedio - 4) / 6) * 100))}%` }}
              />
            </div>
          </div>
        </Panel>

        <Panel title="Sensores gasosos" subtitle="Amônia e metano em ppm">
          <div className="grid gap-3 md:grid-cols-2">
            {gasMetrics.map((metric) => (
              <StatCard
                key={metric.key}
                label={metric.label}
                value={metric.value}
                unit={metric.unit}
                tone={metric.tone}
                icon={metric.icon}
              />
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-4 rounded-lg border border-border bg-surface/70 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Heatmaps
            </p>
            <p className="mt-1 text-sm text-foreground">
              Escolha se deseja avaliar um ou dois gráficos simultaneamente.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {heatmapCount === 1 ? (
              <select
                value={singleHeatmapVariable}
                onChange={(event) => setSingleHeatmapVariable(event.target.value)}
                className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground"
              >
                {heatmapOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <>
                <select
                  value={heatmapOneVariable}
                  onChange={(event) => setHeatmapOneVariable(event.target.value)}
                  className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground"
                >
                  {heatmapOptions.map((option) => (
                    <option key={`one-${option.value}`} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  value={heatmapTwoVariable}
                  onChange={(event) => setHeatmapTwoVariable(event.target.value)}
                  className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground"
                >
                  {heatmapOptions.map((option) => (
                    <option key={`two-${option.value}`} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </>
            )}
            <select
              value={heatmapCount}
              onChange={(event) => setHeatmapCount(Number(event.target.value) as 1 | 2)}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground"
            >
              <option value={1}>1 gráfico</option>
              <option value={2}>2 gráficos</option>
            </select>
          </div>
        </div>
      </div>

      {heatmapCount === 1 ? (
        <div className="mt-4">
          <Panel
            title="Heatmap"
            subtitle="Selecione a variável para visualizar"
          >
            <Heatmap3D
              title="Visualização"
              unit={getHeatmapUnit("solo", singleHeatmapVariable)}
              values={singleHeatmapValues}
              height={320}
            />
          </Panel>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <Panel
            title="Heatmap 1"
            subtitle="Variável selecionada"
          >
            <Heatmap3D
              title="Visualização 1"
              unit={getHeatmapUnit("solo", heatmapOneVariable)}
              values={soilHeatmapValues}
              height={320}
            />
          </Panel>

          <Panel
            title="Heatmap 2"
            subtitle="Variável selecionada"
          >
            <Heatmap3D
              title="Visualização 2"
              unit={getHeatmapUnit("gasoso", heatmapTwoVariable)}
              values={gasHeatmapValues}
              height={320}
            />
          </Panel>
        </div>
      )}

      <Panel title="Dados do dispositivo" subtitle="Parâmetros elétricos e mecânicos da haste">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {deviceMetrics.map((metric) => (
            <StatCard
              key={metric.key}
              label={metric.label}
              value={metric.value}
              unit={metric.unit}
              tone={metric.tone}
              icon={metric.icon}
            />
          ))}
        </div>
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
