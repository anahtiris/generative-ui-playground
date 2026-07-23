"use client";

export interface TableColumn {
  key: string;
  label: string;
}

export function TableRenderer({
  title,
  columns,
  rows,
}: {
  title: string;
  columns: TableColumn[];
  rows: Record<string, unknown>[];
}) {
  return (
    <div className="rounded-[var(--gui-radius)] border border-[var(--gui-border)] bg-[var(--gui-bg)] text-[var(--gui-text)] p-4 space-y-3">
      <h3 className="font-semibold">{title}</h3>
      <table className="text-sm w-full">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="text-left border-b border-[var(--gui-border)] py-1 font-medium">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {columns.map((c) => (
                <td key={c.key} className="border-t border-[var(--gui-border-subtle)] py-1">
                  {String(row[c.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
