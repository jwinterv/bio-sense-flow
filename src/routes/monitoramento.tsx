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
import { getHaste } from "@/services/monitoramentoService";
import { getHastesMonitoramento } from "@/services/monitoramentoService";
import type { Haste, HasteDetalhada } from "@/types";
import type { HeatmapPoint } from "@/lib/heatmap/types";

export const Route = createFileRoute("/monitoramento")({
  head: () => ({
    meta: [
      { title: "Monitoramento" },
      { name: "description", content: "Detalhes da leira monitorada em tempo real." },
    ],
  }),
  component: MonitoramentoPage,
});

function buildGasMetrics(gas?: HasteDetalhada["gas"]) {
  return [
    {
      key: "amonia",
      label: "Amônia",
      value: gas?.amonia !== null && gas?.amonia !== undefined ? gas.amonia.toFixed(1) : "--",
      unit: "ppm",
      tone: "warning" as const,
      icon: <FlaskConical className="h-4 w-4" />,
    },
    {
      key: "metano",
      label: "Metano",
      value: gas?.metano !== null && gas?.metano !== undefined ? gas.metano.toFixed(1) : "--",
      unit: "ppm",
      tone: "destructive" as const,
      icon: <FlaskConical className="h-4 w-4" />,
    },
  ];
}

function buildHeatmapPoints(
  hastes: Haste[],
  variable: string
): HeatmapPoint[] {

  return hastes.map((haste) => {

    let value = 0;

    switch (variable) {
    case "temperatura":
      value = haste.solo.temperatura ?? 0;
      break;

    case "umidade":
      value = haste.solo.umidade ?? 0;
      break;

    case "salinidade":
      value = haste.solo.salinidade ?? 0;
      break;

    case "ssd":
      value = haste.solo.ssd ?? 0;
      break;

    case "nitrogenio":
      value = haste.solo.nitrogenio ?? 0;
      break;

    case "fosforo":
      value = haste.solo.fosforo ?? 0;
      break;

    case "potassio":
      value = haste.solo.potassio ?? 0;
      break;

    case "condutividade":
      value = haste.solo.condutividade ?? 0;
      break;

    case "ph":
      value = haste.solo.ph ?? 0;
      break;
    }

    return {
      id: haste.id,
      nome: haste.nome,

      x: haste.coordenadaX,
      y: haste.coordenadaY,

      value,
    };
  });
}

function MonitoramentoPage() {
  const [selected, setSelected] = useState<HasteDetalhada | null>(null);
  const handleSelect = async (h: Haste) => {
    try {
      const detalhe = await getHaste(Number(h.id), 1);
      setSelected(detalhe);
    } catch (error) {
      console.error("Erro ao buscar detalhes da haste:", error);
    }
  };
  const [heatmapCount, setHeatmapCount] = useState<1 | 2>(1);
  const [singleHeatmapVariable, setSingleHeatmapVariable] = useState("temperatura");
  const [heatmapOneVariable, setHeatmapOneVariable] = useState("temperatura");
  const [heatmapTwoVariable, setHeatmapTwoVariable] = useState("amonia");
  const [hasteSelecionada, setHasteSelecionada] = useState<string>("1");
  const [sensorSelecionado, setSensorSelecionado] = useState<number>(1);

  // Carrega a lista global de hastes do banco
  const { data: hastesList, loading: loadingHastes } =
    useAsync(getHastesMonitoramento, []);

  // Carrega a telemetria detalhada da haste e sensor selecionados
  const { data: haste, loading: loadingHaste, reload } = useAsync(
    () => getHaste(Number(hasteSelecionada), sensorSelecionado),
    [hasteSelecionada, sensorSelecionado]
  );

  const solo = haste?.solo;
  const dispositivo = haste?.dispositivo;
  const gas = haste?.gas;

  const columns: Column<Haste>[] = [
    {
      key: "nome",
      header: "Haste",
      render: (h: Haste) => (
        <div>
          <p className="font-medium">{h.nome}</p>
        </div>
      ),
    },
    {
      key: "coord",
      header: "Coord (X, Y)",
      render: (h: Haste) => (
        <span className="font-mono text-xs text-muted-foreground">
          {h.coordenadaX !== undefined && h.coordenadaX !== null
            ? h.coordenadaX.toFixed(1)
            : "--"}
          ,{" "}
          {h.coordenadaY !== undefined && h.coordenadaY !== null
            ? h.coordenadaY.toFixed(1)
            : "--"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Estado",
      render: (h: Haste) => <StatusBadge status={h.status} />,
    },
    {
      key: "ultima",
      header: "Última leitura",
      align: "right",
      render: (h: Haste) => (
        <span className="text-xs text-muted-foreground">
          {h.ultimaLeitura ? new Date(h.ultimaLeitura).toLocaleString("pt-BR") : "--"}
        </span>
      ),
    },
  ];

  if (loadingHastes || loadingHaste || !haste) {
    return (
      <AppLayout title="Monitoramento">
        <Loading />
      </AppLayout>
    );
  }

  const soilMetrics = [
    {
      key: "temperatura",
      label: "Temperatura",
      value: solo?.temperatura !== null && solo?.temperatura !== undefined ? solo.temperatura.toFixed(1) : "--",
      unit: "°C",
      tone: "primary" as const,
      icon: <Thermometer className="h-4 w-4" />,
    },
    {
      key: "umidade",
      label: "Umidade",
      value: solo?.umidade !== null && solo?.umidade !== undefined ? solo.umidade.toFixed(1) : "--",
      unit: "%",
      tone: "success" as const,
      icon: <Droplets className="h-4 w-4" />,
    },
    {
      key: "salinidade",
      label: "Salinidade",
      value: solo?.salinidade !== null && solo?.salinidade !== undefined ? solo.salinidade.toFixed(1) : "--",
      unit: "g/L",
      icon: <FlaskConical className="h-4 w-4" />,
    },
    {
      key: "solidos",
      label: "Sólidos dissolvidos",
      value: solo?.ssd !== null && solo?.ssd !== undefined ? solo.ssd.toFixed(1) : "--",
      unit: "mg/L",
      icon: <Sprout className="h-4 w-4" />,
    },
    {
      key: "nitrogenio",
      label: "Nitrogênio",
      value: solo?.nitrogenio !== null && solo?.nitrogenio !== undefined ? solo.nitrogenio.toFixed(1) : "--",
      unit: "mg/L",
      icon: <Sprout className="h-4 w-4" />,
    },
    {
      key: "fosforo",
      label: "Fósforo",
      value: solo?.fosforo !== null && solo?.fosforo !== undefined ? solo.fosforo.toFixed(1) : "--",
      unit: "mg/L",
      icon: <Sprout className="h-4 w-4" />,
    },
    {
      key: "potassio",
      label: "Potássio",
      value: solo?.potassio !== null && solo?.potassio !== undefined ? solo.potassio.toFixed(1) : "--",
      unit: "mg/L",
      icon: <Sprout className="h-4 w-4" />,
    },
    {
      key: "condutividade",
      label: "Condutividade",
      value: solo?.condutividade !== null && solo?.condutividade !== undefined ? solo.condutividade.toFixed(1) : "--",
      unit: "uS/cm",
      icon: <FlaskConical className="h-4 w-4" />,
    },
  ];

  const gasMetrics = buildGasMetrics(gas);

  const singleHeatmapPoints =
    buildHeatmapPoints(
      hastesList ?? [],
      singleHeatmapVariable
    );

  const heatmapOnePoints =
    buildHeatmapPoints(
      hastesList ?? [],
      heatmapOneVariable
    );

  const heatmapTwoPoints =
    buildHeatmapPoints(
      hastesList ?? [],
      heatmapTwoVariable
    );

  const deviceMetrics = [
    {
      key: "inclinacao",
      label: "Inclinação da haste",
      value: dispositivo?.inclinacao !== null && dispositivo?.inclinacao !== undefined ? dispositivo.inclinacao.toFixed(1) : "--",
      unit: "°",
      tone: dispositivo?.inclinacao !== null && dispositivo?.inclinacao !== undefined && dispositivo.inclinacao > 5 ? "warning" as const : "default" as const,
      icon: <Gauge className="h-4 w-4" />,
    },
    {
      key: "tensao",
      label: "Tensão",
      value: dispositivo?.tensao !== null && dispositivo?.tensao !== undefined ? dispositivo.tensao.toFixed(1) : "--",
      unit: "V",
      tone: "success" as const,
      icon: <BatteryCharging className="h-4 w-4" />,
    },
    {
      key: "placa",
      label: "Temperatura da placa",
      value: dispositivo?.temperatura !== null && dispositivo?.temperatura !== undefined ? dispositivo.temperatura.toFixed(1) : "--",
      unit: "°C",
      tone: "primary" as const,
      icon: <Thermometer className="h-4 w-4" />,
    },
    {
      key: "corrente",
      label: "Corrente",
      value: dispositivo?.corrente !== null && dispositivo?.corrente !== undefined ? dispositivo.corrente.toFixed(1) : "--",
      unit: "mA",
      tone: "default" as const,
      icon: <Zap className="h-4 w-4" />,
    },
  ];

const heatmapOptions = [
  { value: "temperatura", label: "Temperatura" },
  { value: "umidade", label: "Umidade" },
  { value: "salinidade", label: "Salinidade" },
  { value: "ssd", label: "Sólidos Dissolvidos" },
  { value: "nitrogenio", label: "Nitrogênio" },
  { value: "fosforo", label: "Fósforo" },
  { value: "potassio", label: "Potássio" },
  { value: "condutividade", label: "Condutividade" },
  { value: "ph", label: "pH" },
];

  return (
    <AppLayout
      title="Monitoramento"
      subtitle={`${haste.nome} (${haste.localizacao}) · atualizado ${solo?.timestamp ? new Date(solo.timestamp).toLocaleTimeString("pt-BR") : new Date().toLocaleTimeString("pt-BR")}`}
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
      <Panel title="Filtros">
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Haste</label>
            <select
              value={hasteSelecionada}
              onChange={(e) => setHasteSelecionada(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              {hastesList?.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Sensor NPK</label>
            <select
              value={sensorSelecionado}
              onChange={(e) => setSensorSelecionado(Number(e.target.value))}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value={1}>Sensor 1 (Superior)</option>
              <option value={2}>Sensor 2 (Inferior)</option>
            </select>
          </div>
        </div>
      </Panel>

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
              <span className="text-xl font-semibold text-primary">
                {solo?.ph !== null && solo?.ph !== undefined ? solo.ph.toFixed(1) : "--"}
              </span>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-border/70">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-success"
                style={{ width: `${Math.min(100, Math.max(10, (((solo?.ph ?? 7) - 4) / 6) * 100))}%` }}
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
            points={singleHeatmapPoints}
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
              points={heatmapOnePoints}
              height={320}
            />
          </Panel>

          <Panel
            title="Heatmap 2"
            subtitle="Variável selecionada"
          >
            <Heatmap3D
              points={heatmapTwoPoints}
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
          data={hastesList || []}
          rowKey={(h) => h.id}
          onRowClick={handleSelect}
        />
      </Panel>

      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.nome}
        width="max-w-lg"
      >
        {selected && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="Temperatura"
                value={selected.solo.temperatura !== undefined && selected.solo.temperatura !== null ? selected.solo.temperatura.toFixed(1) : "--"}
                unit="°C"
                tone="primary"
                icon={<Thermometer className="h-4 w-4" />}
              />
              <StatCard
                label="Estado"
                value={<StatusBadge status={selected.dispositivo.status} />}
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
                {selected.solo.timestamp ? new Date(selected.solo.timestamp).toLocaleString("pt-BR") : "--"}
              </p>
            </div>
          </div>
        )}
      </Drawer>
    </AppLayout>
  );
}
