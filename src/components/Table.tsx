import { ReactNode } from "react";

export interface Column<T> {
  key: string;
  header: ReactNode;
  /** Extra classes for both the header and cells in this column (e.g. "font-mono"). */
  className?: string;
  render: (row: T) => ReactNode;
}

/**
 * Dense, bordered data table. Compact padding + small text, monospace cells via
 * per-column className, sticky header, and a horizontal-scroll wrapper so wide
 * math columns never break the page layout.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  empty = "Nothing to show.",
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T, i: number) => string;
  empty?: ReactNode;
}) {
  if (rows.length === 0) {
    return <div className="px-1 py-6 text-sm text-neutral-500">{empty}</div>;
  }
  return (
    <div className="overflow-x-auto border border-neutral-800">
      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-0 bg-neutral-900">
          <tr className="text-left">
            {columns.map((c) => (
              <th
                key={c.key}
                className={`whitespace-nowrap border-b border-neutral-700 px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 ${
                  c.className ?? ""
                }`}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={rowKey(row, i)}
              className="border-b border-neutral-800/70 odd:bg-neutral-900/40 hover:bg-neutral-800/40"
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={`px-2.5 py-1.5 align-top text-neutral-200 ${c.className ?? ""}`}
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
