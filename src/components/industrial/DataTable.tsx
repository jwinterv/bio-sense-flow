import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface Column<T> {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  empty?: ReactNode;
  rowKey: (row: T) => string;
}

export function DataTable<T>({
  columns,
  data,
  onRowClick,
  empty,
  rowKey,
}: DataTableProps<T>) {
  if (data.length === 0 && empty) {
    return <>{empty}</>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-0 text-sm">
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className={cn(
                  "sticky top-0 bg-surface/60 backdrop-blur px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground border-b border-border",
                  c.align === "right" && "text-right",
                  c.align === "center" && "text-center",
                  c.className,
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                "transition-colors",
                i % 2 === 0 ? "bg-transparent" : "bg-surface/40",
                onRowClick && "cursor-pointer hover:bg-primary/10",
              )}
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={cn(
                    "px-4 py-3 border-b border-border/50 text-foreground/90",
                    c.align === "right" && "text-right tabular-nums",
                    c.align === "center" && "text-center",
                  )}
                >
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
