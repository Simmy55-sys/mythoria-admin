import type React from "react";
import { Pagination } from "./pagination";

interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  title: string;
  columns: Column<T>[];
  data: T[];
  pagination?: {
    currentPage: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
  };
}

export function DataTable<T extends Record<string, any>>({
  title,
  columns,
  data,
  pagination,
}: DataTableProps<T>) {
  // Calculate paginated data if pagination is enabled
  const displayData = pagination
    ? data.slice(
        (pagination.currentPage - 1) * pagination.itemsPerPage,
        pagination.currentPage * pagination.itemsPerPage
      )
    : data;

  const totalPages = pagination
    ? Math.ceil(data.length / pagination.itemsPerPage)
    : 1;

  return (
    <div className="bg-card border border-[#27272A] rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-[#27272A] bg-muted/30">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#27272A] bg-muted/20">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-8 text-center text-sm text-muted-foreground"
                >
                  No data available
                </td>
              </tr>
            ) : (
              displayData.map((row, idx) => (
                <tr
                  key={idx}
                  className="border-b border-[#27272A] hover:bg-muted/50 transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className="px-6 py-4 text-sm text-foreground"
                    >
                      {col.render
                        ? col.render(row[col.key], row)
                        : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {pagination && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={totalPages}
          onPageChange={pagination.onPageChange}
          itemsPerPage={pagination.itemsPerPage}
          totalItems={data.length}
        />
      )}
    </div>
  );
}
