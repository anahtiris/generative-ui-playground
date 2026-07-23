"use client";

import { useMemo, useState } from "react";

export interface TableColumn {
  key: string;
  label: string;
}

type SortDir = "asc" | "desc";

export function TableRenderer({
  title,
  columns,
  rows,
}: {
  title: string;
  columns: TableColumn[];
  rows: Record<string, unknown>[];
}) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function toggleSort(key: string) {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
      return;
    }
    setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
  }

  const visibleRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = query
      ? rows.filter((row) => columns.some((c) => String(row[c.key] ?? "").toLowerCase().includes(query)))
      : rows;

    if (!sortKey) return filtered;
    const sorted = [...filtered].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") return av - bv;
      return String(av ?? "").localeCompare(String(bv ?? ""));
    });
    return sortDir === "asc" ? sorted : sorted.reverse();
  }, [rows, columns, search, sortKey, sortDir]);

  return (
    <div className="rounded-[var(--gui-radius)] border border-[var(--gui-border)] bg-[var(--gui-bg)] text-[var(--gui-text)] p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold">{title}</h3>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search…"
          className="rounded-[var(--gui-radius)] border border-[var(--gui-border)] bg-[var(--gui-bg)] px-2 py-1 text-sm"
        />
      </div>
      <table className="text-sm w-full">
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                onClick={() => toggleSort(c.key)}
                className="text-left border-b border-[var(--gui-border)] py-1 font-medium cursor-pointer select-none hover:text-[var(--gui-text-muted)]"
              >
                {c.label}
                {sortKey === c.key ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visibleRows.map((row, i) => (
            <tr key={i}>
              {columns.map((c) => (
                <td key={c.key} className="border-t border-[var(--gui-border-subtle)] py-1">
                  {String(row[c.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
          {visibleRows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="border-t border-[var(--gui-border-subtle)] py-3 text-center text-[var(--gui-text-muted)]">
                No matching rows.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
