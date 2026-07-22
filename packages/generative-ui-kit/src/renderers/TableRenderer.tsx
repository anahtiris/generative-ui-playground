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
    <div className="rounded-lg border border-gray-300 dark:border-gray-600 text-black dark:text-white p-4 space-y-3">
      <h3 className="font-semibold">{title}</h3>
      <table className="text-sm w-full">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="text-left border-b border-gray-300 dark:border-gray-600 py-1 font-medium">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {columns.map((c) => (
                <td key={c.key} className="border-t border-gray-200 dark:border-gray-700 py-1">
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
