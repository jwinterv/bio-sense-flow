import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Cpu,
  Layers3,
  Pencil,
  Plus,
  Ruler,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { AppLayout } from "@/layouts/AppLayout";
import { Panel } from "@/components/industrial/Panel";
import { DataTable, type Column } from "@/components/industrial/DataTable";
import { StatusBadge } from "@/components/industrial/StatusBadge";
import { Drawer } from "@/components/industrial/Drawer";
import { Loading } from "@/components/industrial/Feedback";
import { cn } from "@/lib/utils";
import {
  createHaste,
  deleteHaste,
  getHastes,
  updateHaste,
} from "@/services/hastesService";
import {
  createSensor,
  deleteSensor,
  getLimites,
  getSensores,
  updateLimites,
} from "@/services/sensoresService";
import { getLeiras, updateLeira } from "@/services/leirasService";
import type {
  EntityStatus,
  Haste,
  Leira,
  Limites,
  Sensor,
  SensorType,
} from "@/types";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações · BioMonitor" },
      { name: "description", content: "Administração de hastes, sensores, limites e leiras." },
    ],
  }),
  component: ConfiguracoesPage,
});

type Tab = "hastes" | "sensores" | "limites" | "leira";

const tabs: { id: Tab; label: string; icon: typeof Cpu }[] = [
  { id: "hastes", label: "Hastes", icon: Layers3 },
  { id: "sensores", label: "Sensores", icon: Cpu },
  { id: "limites", label: "Limites", icon: SlidersHorizontal },
  { id: "leira", label: "Leira", icon: Ruler },
];

function ConfiguracoesPage() {
  const [tab, setTab] = useState<Tab>("hastes");

  return (
    <AppLayout
      title="Configurações"
      subtitle="Administração do sistema, sensores e parâmetros operacionais"
    >
      <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-surface p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition-colors",
              tab === t.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-accent",
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "hastes" && <HastesTab />}
      {tab === "sensores" && <SensoresTab />}
      {tab === "limites" && <LimitesTab />}
      {tab === "leira" && <LeiraTab />}
    </AppLayout>
  );
}

/* ------------- HASTES ------------- */

function HastesTab() {
  const [hastes, setHastes] = useState<Haste[] | null>(null);
  const [editing, setEditing] = useState<Haste | null>(null);
  const [creating, setCreating] = useState(false);

  const reload = () => getHastes().then(setHastes);
  useEffect(() => {
    reload();
  }, []);

  const cols: Column<Haste>[] = [
    { key: "nome", header: "Nome", render: (h) => <span className="font-medium">{h.nome}</span> },
    { key: "id", header: "Identificação", render: (h) => <span className="font-mono text-xs">{h.identificacao}</span> },
    { key: "x", header: "X (m)", align: "right", render: (h) => h.coordenadaX.toFixed(2) },
    { key: "y", header: "Y (m)", align: "right", render: (h) => h.coordenadaY.toFixed(2) },
    { key: "status", header: "Status", render: (h) => <StatusBadge status={h.status} /> },
    {
      key: "acoes",
      header: "",
      align: "right",
      render: (h) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => setEditing(h)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-primary"
            aria-label="Editar"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={async () => {
              if (confirm(`Excluir ${h.nome}?`)) {
                await deleteHaste(h.id);
                reload();
              }
            }}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
            aria-label="Excluir"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Panel
        title="Hastes instaladas"
        subtitle="As coordenadas serão utilizadas pelo Heatmap 3D"
        action={
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Adicionar haste
          </button>
        }
        bodyClassName="p-0"
      >
        {!hastes ? <Loading /> : <DataTable columns={cols} data={hastes} rowKey={(h) => h.id} />}
      </Panel>

      <Drawer
        open={!!editing || creating}
        onClose={() => {
          setEditing(null);
          setCreating(false);
        }}
        title={editing ? `Editar ${editing.nome}` : "Nova haste"}
        subtitle={editing?.identificacao}
      >
        <HasteForm
          initial={editing ?? undefined}
          onSubmit={async (values) => {
            if (editing) await updateHaste(editing.id, values);
            else
              await createHaste({
                leiraId: "leira-01",
                temperatura: 0,
                ultimaLeitura: new Date().toISOString(),
                ...values,
              } as Omit<Haste, "id">);
            setEditing(null);
            setCreating(false);
            reload();
          }}
        />
      </Drawer>
    </>
  );
}

function HasteForm({
  initial,
  onSubmit,
}: {
  initial?: Haste;
  onSubmit: (values: Partial<Haste>) => Promise<void>;
}) {
  const [values, setValues] = useState({
    nome: initial?.nome ?? "",
    identificacao: initial?.identificacao ?? "",
    coordenadaX: initial?.coordenadaX ?? 0,
    coordenadaY: initial?.coordenadaY ?? 0,
    status: (initial?.status ?? "online") as EntityStatus,
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(values);
      }}
      className="space-y-4"
    >
      <Field label="Nome">
        <input
          required
          value={values.nome}
          onChange={(e) => setValues((v) => ({ ...v, nome: e.target.value }))}
          className={inputCls}
        />
      </Field>
      <Field label="Identificação">
        <input
          required
          value={values.identificacao}
          onChange={(e) =>
            setValues((v) => ({ ...v, identificacao: e.target.value }))
          }
          className={inputCls}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Coordenada X (m)">
          <input
            type="number"
            step="0.1"
            value={values.coordenadaX}
            onChange={(e) =>
              setValues((v) => ({ ...v, coordenadaX: +e.target.value }))
            }
            className={inputCls}
          />
        </Field>
        <Field label="Coordenada Y (m)">
          <input
            type="number"
            step="0.1"
            value={values.coordenadaY}
            onChange={(e) =>
              setValues((v) => ({ ...v, coordenadaY: +e.target.value }))
            }
            className={inputCls}
          />
        </Field>
      </div>
      <Field label="Status">
        <select
          value={values.status}
          onChange={(e) =>
            setValues((v) => ({ ...v, status: e.target.value as EntityStatus }))
          }
          className={inputCls}
        >
          <option value="online">Online</option>
          <option value="offline">Offline</option>
          <option value="manutencao">Manutenção</option>
        </select>
      </Field>
      <p className="text-xs text-muted-foreground">
        Futuramente será possível arrastar a haste sobre a planta da leira.
      </p>
      <div className="pt-2">
        <button
          type="submit"
          className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Salvar
        </button>
      </div>
    </form>
  );
}

/* ------------- SENSORES ------------- */

function SensoresTab() {
  const [sensores, setSensores] = useState<Sensor[] | null>(null);
  const [creating, setCreating] = useState(false);

  const reload = () => getSensores().then(setSensores);
  useEffect(() => {
    reload();
  }, []);

  const cols: Column<Sensor>[] = [
    { key: "nome", header: "Nome", render: (s) => <span className="font-medium">{s.nome}</span> },
    { key: "tipo", header: "Tipo", render: (s) => <span className="capitalize">{s.tipo}</span> },
    { key: "haste", header: "Haste", render: (s) => <span className="font-mono text-xs">{s.hasteId}</span> },
    { key: "un", header: "Unidade", render: (s) => s.unidade },
    { key: "valor", header: "Valor atual", align: "right", render: (s) => <span className="font-mono">{s.valorAtual.toFixed(2)}</span> },
    { key: "status", header: "Status", render: (s) => <StatusBadge status={s.status} /> },
    {
      key: "del",
      header: "",
      align: "right",
      render: (s) => (
        <button
          onClick={async () => {
            if (confirm(`Excluir ${s.nome}?`)) {
              await deleteSensor(s.id);
              reload();
            }
          }}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      ),
    },
  ];

  return (
    <>
      <Panel
        title="Sensores"
        subtitle="Cada sensor pertence a uma haste"
        action={
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Adicionar sensor
          </button>
        }
        bodyClassName="p-0"
      >
        {!sensores ? <Loading /> : <DataTable columns={cols} data={sensores} rowKey={(s) => s.id} />}
      </Panel>

      <Drawer open={creating} onClose={() => setCreating(false)} title="Novo sensor">
        <SensorForm
          onSubmit={async (v) => {
            await createSensor(v as Omit<Sensor, "id">);
            setCreating(false);
            reload();
          }}
        />
      </Drawer>
    </>
  );
}

function SensorForm({ onSubmit }: { onSubmit: (v: Omit<Sensor, "id">) => Promise<void> }) {
  const [v, setV] = useState<Omit<Sensor, "id">>({
    hasteId: "haste-1",
    nome: "",
    tipo: "temperatura",
    unidade: "°C",
    status: "online",
    valorAtual: 0,
  });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(v); }} className="space-y-4">
      <Field label="Nome">
        <input required value={v.nome} onChange={(e) => setV({ ...v, nome: e.target.value })} className={inputCls} />
      </Field>
      <Field label="Tipo">
        <select value={v.tipo} onChange={(e) => setV({ ...v, tipo: e.target.value as SensorType })} className={inputCls}>
          <option value="temperatura">Temperatura</option>
          <option value="umidade">Umidade</option>
          <option value="ph">pH</option>
          <option value="npk">NPK</option>
        </select>
      </Field>
      <Field label="Unidade">
        <input required value={v.unidade} onChange={(e) => setV({ ...v, unidade: e.target.value })} className={inputCls} />
      </Field>
      <Field label="Haste">
        <input required value={v.hasteId} onChange={(e) => setV({ ...v, hasteId: e.target.value })} className={inputCls} />
      </Field>
      <button className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
        Salvar
      </button>
    </form>
  );
}

/* ------------- LIMITES ------------- */

function LimitesTab() {
  const [limites, setLimites] = useState<Limites | null>(null);
  useEffect(() => {
    getLimites().then(setLimites);
  }, []);

  if (!limites) return <Loading />;

  return (
    <Panel title="Limites operacionais" subtitle="Faixas usadas para gerar alertas automáticos">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await updateLimites(limites);
          alert("Limites atualizados.");
        }}
        className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"
      >
        <LimitPair
          label="Temperatura"
          unit="°C"
          min={limites.tempMin}
          max={limites.tempMax}
          onMin={(v) => setLimites({ ...limites, tempMin: v })}
          onMax={(v) => setLimites({ ...limites, tempMax: v })}
        />
        <LimitPair
          label="Umidade"
          unit="%"
          min={limites.umidadeMin}
          max={limites.umidadeMax}
          onMin={(v) => setLimites({ ...limites, umidadeMin: v })}
          onMax={(v) => setLimites({ ...limites, umidadeMax: v })}
        />
        <LimitPair
          label="pH"
          unit=""
          min={limites.phMin}
          max={limites.phMax}
          onMin={(v) => setLimites({ ...limites, phMin: v })}
          onMax={(v) => setLimites({ ...limites, phMax: v })}
        />
        <div className="md:col-span-2 pt-2">
          <button className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            Salvar limites
          </button>
        </div>
      </form>
    </Panel>
  );
}

function LimitPair({
  label,
  unit,
  min,
  max,
  onMin,
  onMax,
}: {
  label: string;
  unit: string;
  min: number;
  max: number;
  onMin: (v: number) => void;
  onMax: (v: number) => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="text-sm font-semibold text-foreground">{label}</p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Field label={`Mínimo (${unit || "un"})`}>
          <input type="number" step="0.1" value={min} onChange={(e) => onMin(+e.target.value)} className={inputCls} />
        </Field>
        <Field label={`Máximo (${unit || "un"})`}>
          <input type="number" step="0.1" value={max} onChange={(e) => onMax(+e.target.value)} className={inputCls} />
        </Field>
      </div>
    </div>
  );
}

/* ------------- LEIRA ------------- */

function LeiraTab() {
  const [leiras, setLeiras] = useState<Leira[] | null>(null);
  const [current, setCurrent] = useState<Leira | null>(null);

  useEffect(() => {
    getLeiras().then((l) => {
      setLeiras(l);
      setCurrent(l[0] ?? null);
    });
  }, []);

  if (!leiras || !current) return <Loading />;

  return (
    <Panel title="Leira" subtitle="Arquitetura preparada para múltiplas leiras futuramente">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await updateLeira(current.id, current);
          alert("Leira atualizada.");
        }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl"
      >
        <div className="md:col-span-3">
          <Field label="Nome">
            <input value={current.nome} onChange={(e) => setCurrent({ ...current, nome: e.target.value })} className={inputCls} />
          </Field>
        </div>
        <Field label="Comprimento (m)">
          <input type="number" step="0.1" value={current.comprimento} onChange={(e) => setCurrent({ ...current, comprimento: +e.target.value })} className={inputCls} />
        </Field>
        <Field label="Largura (m)">
          <input type="number" step="0.1" value={current.largura} onChange={(e) => setCurrent({ ...current, largura: +e.target.value })} className={inputCls} />
        </Field>
        <div className="md:col-span-3">
          <button className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            Salvar
          </button>
        </div>
      </form>
    </Panel>
  );
}

/* ------------- helpers ------------- */

const inputCls =
  "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
