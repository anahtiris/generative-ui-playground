"use client";

import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface Widget {
  kind: "line_chart" | "bar_chart" | "stat_card" | "table";
  title: string;
  data?: Record<string, unknown>[];
}

export function DashboardRenderer({ title, widgets }: { title: string; widgets: Widget[] }) {
  return (
    <div className="rounded-[var(--gui-radius)] border border-[var(--gui-border)] bg-[var(--gui-bg)] text-[var(--gui-text)] p-4 space-y-4">
      <h3 className="font-semibold">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {widgets.map((w, i) => (
          <div key={i} className="rounded-[var(--gui-radius)] border border-[var(--gui-border-subtle)] p-3">
            <p className="text-sm text-[var(--gui-text-muted)] mb-2">{w.title}</p>
            {renderWidget(w)}
          </div>
        ))}
      </div>
    </div>
  );
}

function renderWidget(w: Widget) {
  const data = w.data ?? [];
  const keys = data[0] ? Object.keys(data[0]) : [];
  const [xKey, yKey] = keys;

  switch (w.kind) {
    case "stat_card": {
      const first = data[0] as Record<string, unknown> | undefined;
      return <p className="text-3xl font-bold">{String(first?.value ?? "—")}</p>;
    }
    case "line_chart":
      // recharts renders raw SVG attributes, not Tailwind classes — colors
      // must be real values, so these read the same CSS variables directly
      // rather than via a (purge-fragile) utility class.
      return (
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={data}>
            <XAxis dataKey={xKey} fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Line type="monotone" dataKey={yKey} stroke="var(--gui-chart-1)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      );
    case "bar_chart":
      return (
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={data}>
            <XAxis dataKey={xKey} fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Bar dataKey={yKey} fill="var(--gui-chart-2)" />
          </BarChart>
        </ResponsiveContainer>
      );
    case "table":
      return (
        <table className="text-sm w-full">
          <thead>
            <tr>
              {keys.map((k) => (
                <th key={k} className="text-left border-b border-[var(--gui-border)] py-1 font-medium">
                  {k}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                {Object.values(row).map((v, j) => (
                  <td key={j} className="border-t border-[var(--gui-border-subtle)] py-1">
                    {String(v)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    default:
      return null;
  }
}
