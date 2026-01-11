import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { cn } from "~/lib/utils";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

interface AdminDataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField?: keyof T;
  className?: string;
  emptyMessage?: string;
}

export function AdminDataTable<T extends { [key: string]: any }>({
  columns,
  data,
  keyField = "id", // Default to 'id', can be '_id'
  className,
  emptyMessage = "No data found."
}: AdminDataTableProps<T>) {
  return (
    <div className={cn("rounded-md border border-zinc-200 dark:border-zinc-800 overflow-hidden", className)}>
      <Table>
        <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
          <TableRow className="border-zinc-200 dark:border-zinc-800 hover:bg-transparent">
            {columns.map((col, index) => (
              <TableHead 
                key={index} 
                className={cn("text-zinc-600 dark:text-zinc-400 font-medium", col.className)}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data && data.length > 0 ? (
            data.map((item, rowIndex) => (
              <TableRow 
                key={String(item[keyField] || rowIndex)} 
                className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
              >
                {columns.map((col, colIndex) => (
                  <TableCell key={colIndex} className="py-3">
                    {col.cell 
                      ? col.cell(item) 
                      : (col.accessorKey ? item[col.accessorKey] : null)
                    }
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-zinc-500">
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
