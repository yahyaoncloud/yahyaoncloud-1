import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Inbox,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "~/lib/utils";

export interface Column<T> {
  header: string | React.ReactNode;
  accessorKey?: keyof T | string;
  cell?: (item: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  width?: string;
}

export interface TablePaginationConfig {
  page: number;
  totalPages: number;
  total?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
}

export interface AdminDataTableProps<T extends Record<string, any>> {
  columns: Column<T>[];
  data: T[];
  keyField?: keyof T;
  className?: string;
  emptyMessage?: string;
  emptyIcon?: LucideIcon;
  emptyAction?: React.ReactNode;
  emptyState?: React.ReactNode;

  // Search & Toolbar
  searchable?: boolean;
  searchPlaceholder?: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchKeys?: (keyof T)[];
  toolbarFilters?: React.ReactNode;
  toolbarActions?: React.ReactNode;

  // Sorting
  defaultSortKey?: keyof T | string;
  defaultSortDir?: "asc" | "desc";
  onSort?: (key: string, direction: "asc" | "desc" | null) => void;

  // Pagination
  pagination?: TablePaginationConfig;
  pageSize?: number; // Enable automatic client-side pagination

  // Selection & Batch Actions
  selectable?: boolean;
  selectedKeys?: (string | number)[];
  onSelectionChange?: (selectedKeys: (string | number)[], selectedItems: T[]) => void;
  batchActions?: (selectedItems: T[], clearSelection: () => void) => React.ReactNode;

  // Interactivity & Styling
  isLoading?: boolean;
  loadingRowCount?: number;
  onRowClick?: (item: T) => void;
  hoverable?: boolean;
  striped?: boolean;
  compact?: boolean;
}

export function AdminDataTable<T extends Record<string, any>>({
  columns,
  data,
  keyField = "id",
  className,
  emptyMessage = "No data found.",
  emptyIcon: EmptyIcon = Inbox,
  emptyAction,
  emptyState,

  searchable = false,
  searchPlaceholder = "Search records...",
  searchQuery: controlledSearch,
  onSearchChange: setControlledSearch,
  searchKeys,
  toolbarFilters,
  toolbarActions,

  defaultSortKey,
  defaultSortDir,
  onSort,

  pagination: controlledPagination,
  pageSize: clientPageSize,

  selectable = false,
  selectedKeys: controlledSelectedKeys,
  onSelectionChange,
  batchActions,

  isLoading = false,
  loadingRowCount = 5,
  onRowClick,
  hoverable = true,
  striped = false,
  compact = false,
}: AdminDataTableProps<T>) {
  // 1. Search State
  const [internalSearch, setInternalSearch] = useState("");
  const isSearchControlled = controlledSearch !== undefined;
  const activeSearch = isSearchControlled ? controlledSearch : internalSearch;

  const handleSearchChange = (val: string) => {
    if (!isSearchControlled) {
      setInternalSearch(val);
    }
    setControlledSearch?.(val);
    setInternalPage(1);
  };

  // 2. Sort State
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: "asc" | "desc" | null;
  }>({
    key: (defaultSortKey as string) || null,
    direction: defaultSortDir || null,
  });

  const handleSort = (key: string) => {
    let nextDir: "asc" | "desc" | null = "asc";
    if (sortConfig.key === key) {
      if (sortConfig.direction === "asc") nextDir = "desc";
      else if (sortConfig.direction === "desc") nextDir = null;
      else nextDir = "asc";
    }

    const newConfig = { key: nextDir ? key : null, direction: nextDir };
    setSortConfig(newConfig);
    onSort?.(key, nextDir);
  };

  // 3. Selection State
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<(string | number)[]>([]);
  const isSelectionControlled = controlledSelectedKeys !== undefined;
  const selectedKeySet = useMemo(() => {
    return new Set(isSelectionControlled ? controlledSelectedKeys : internalSelectedKeys);
  }, [isSelectionControlled, controlledSelectedKeys, internalSelectedKeys]);

  const getItemKey = (item: T, index: number): string | number => {
    return item[keyField] !== undefined ? item[keyField] : index;
  };

  const handleSelectRow = (item: T, index: number, checked: boolean) => {
    const key = getItemKey(item, index);
    const next = new Set(selectedKeySet);
    if (checked) {
      next.add(key);
    } else {
      next.delete(key);
    }
    const nextArr = Array.from(next);
    if (!isSelectionControlled) {
      setInternalSelectedKeys(nextArr);
    }
    const selectedItems = data.filter((d, i) => next.has(getItemKey(d, i)));
    onSelectionChange?.(nextArr, selectedItems);
  };

  const clearSelection = () => {
    if (!isSelectionControlled) {
      setInternalSelectedKeys([]);
    }
    onSelectionChange?.([], []);
  };

  // 4. Client-side Search Filtering
  const filteredData = useMemo(() => {
    if (isSearchControlled || !searchable || !activeSearch.trim()) {
      return data || [];
    }
    const q = activeSearch.toLowerCase().trim();
    return (data || []).filter((item) => {
      if (searchKeys && searchKeys.length > 0) {
        return searchKeys.some((k) => {
          const val = item[k];
          return val !== null && val !== undefined && String(val).toLowerCase().includes(q);
        });
      }
      return Object.values(item).some((val) => {
        if (typeof val === "string" || typeof val === "number") {
          return String(val).toLowerCase().includes(q);
        }
        return false;
      });
    });
  }, [data, searchable, activeSearch, isSearchControlled, searchKeys]);

  // 5. Client-side Sorting
  const sortedData = useMemo(() => {
    if (onSort || !sortConfig.key || !sortConfig.direction) {
      return filteredData;
    }
    const { key, direction } = sortConfig;
    return [...filteredData].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      if (typeof aVal === "number" && typeof bVal === "number") {
        return direction === "asc" ? aVal - bVal : bVal - aVal;
      }
      return direction === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [filteredData, sortConfig, onSort]);

  // 6. Pagination Calculations
  const [internalPage, setInternalPage] = useState(1);
  const isServerPagination = Boolean(controlledPagination);

  const finalPageSize = controlledPagination?.pageSize || clientPageSize || 0;
  const isClientPagination = !isServerPagination && finalPageSize > 0;

  const totalItems = isServerPagination
    ? controlledPagination?.total ?? data.length
    : sortedData.length;

  const totalPages = isServerPagination
    ? controlledPagination?.totalPages || 1
    : isClientPagination
    ? Math.max(1, Math.ceil(sortedData.length / finalPageSize))
    : 1;

  const currentPage = isServerPagination
    ? controlledPagination?.page || 1
    : internalPage;

  const displayData = useMemo(() => {
    if (isServerPagination || !isClientPagination) {
      return sortedData;
    }
    const start = (currentPage - 1) * finalPageSize;
    return sortedData.slice(start, start + finalPageSize);
  }, [sortedData, isServerPagination, isClientPagination, currentPage, finalPageSize]);

  const handlePageChange = (newPage: number) => {
    const clamped = Math.max(1, Math.min(newPage, totalPages));
    if (isServerPagination) {
      controlledPagination?.onPageChange?.(clamped);
    } else {
      setInternalPage(clamped);
    }
  };

  // Select all visible rows
  const allVisibleSelected = useMemo(() => {
    if (displayData.length === 0) return false;
    return displayData.every((item, idx) => selectedKeySet.has(getItemKey(item, idx)));
  }, [displayData, selectedKeySet]);

  const someVisibleSelected = useMemo(() => {
    if (displayData.length === 0) return false;
    return displayData.some((item, idx) => selectedKeySet.has(getItemKey(item, idx)));
  }, [displayData, selectedKeySet]);

  const handleSelectAll = (checked: boolean) => {
    const next = new Set(selectedKeySet);
    displayData.forEach((item, idx) => {
      const key = getItemKey(item, idx);
      if (checked) {
        next.add(key);
      } else {
        next.delete(key);
      }
    });
    const nextArr = Array.from(next);
    if (!isSelectionControlled) {
      setInternalSelectedKeys(nextArr);
    }
    const selectedItems = data.filter((d, i) => next.has(getItemKey(d, i)));
    onSelectionChange?.(nextArr, selectedItems);
  };

  const selectedItemsList = useMemo(() => {
    return data.filter((d, i) => selectedKeySet.has(getItemKey(d, i)));
  }, [data, selectedKeySet]);

  const hasToolbar = searchable || toolbarFilters || toolbarActions;

  return (
    <div className={cn("space-y-3", className)}>
      {/* 1. Table Toolbar */}
      {hasToolbar && (
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            {searchable && (
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={activeSearch}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9 pr-8 h-9 text-xs bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                />
                {activeSearch && (
                  <button
                    type="button"
                    onClick={() => handleSearchChange("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )}
            {toolbarFilters}
          </div>

          {toolbarActions && (
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              {toolbarActions}
            </div>
          )}
        </div>
      )}

      {/* 2. Batch Actions Bar (when rows are selected) */}
      {selectable && selectedKeySet.size > 0 && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 rounded-lg text-xs">
          <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-medium">
            <span>
              {selectedKeySet.size} {selectedKeySet.size === 1 ? "item" : "items"} selected
            </span>
            <button
              type="button"
              onClick={clearSelection}
              className="text-indigo-600 dark:text-indigo-400 hover:underline ml-2"
            >
              Clear selection
            </button>
          </div>
          {batchActions && (
            <div className="flex items-center gap-2">
              {batchActions(selectedItemsList, clearSelection)}
            </div>
          )}
        </div>
      )}

      {/* 3. Table Container */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/80 shadow-2xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-zinc-50/80 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
              <TableRow className="hover:bg-transparent border-zinc-200 dark:border-zinc-800">
                {selectable && (
                  <TableHead className="w-10 px-4 text-center">
                    <Checkbox
                      checked={allVisibleSelected ? true : someVisibleSelected ? "indeterminate" : false}
                      onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
                      aria-label="Select all"
                    />
                  </TableHead>
                )}

                {columns.map((col, index) => {
                  const sortKey = (col.accessorKey as string) || "";
                  const isSorted = sortConfig.key === sortKey;
                  const isSortable = col.sortable !== false && Boolean(col.accessorKey);

                  return (
                    <TableHead
                      key={index}
                      style={{ width: col.width }}
                      className={cn(
                        "text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 py-3",
                        col.align === "center" && "text-center",
                        col.align === "right" && "text-right",
                        col.headerClassName,
                        col.className
                      )}
                    >
                      {isSortable ? (
                        <button
                          type="button"
                          onClick={() => handleSort(sortKey)}
                          className={cn(
                            "group inline-flex items-center gap-1.5 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors select-none font-semibold",
                            col.align === "right" && "ml-auto",
                            col.align === "center" && "mx-auto"
                          )}
                        >
                          <span>{col.header}</span>
                          {isSorted ? (
                            sortConfig.direction === "asc" ? (
                              <ArrowUp className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                            ) : (
                              <ArrowDown className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                            )
                          ) : (
                            <ArrowUpDown className="h-3.5 w-3.5 opacity-30 group-hover:opacity-70 transition-opacity" />
                          )}
                        </button>
                      ) : (
                        col.header
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                // Shimmer Loading Skeletons
                Array.from({ length: loadingRowCount }).map((_, rIdx) => (
                  <TableRow key={`skeleton-${rIdx}`} className="border-zinc-100 dark:border-zinc-800/80">
                    {selectable && (
                      <TableCell className="px-4 text-center">
                        <div className="h-4 w-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mx-auto" />
                      </TableCell>
                    )}
                    {columns.map((_, cIdx) => (
                      <TableCell key={`skeleton-cell-${cIdx}`} className="py-4">
                        <div
                          className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"
                          style={{
                            width: `${Math.max(40, 85 - ((rIdx + cIdx) % 4) * 15)}%`,
                          }}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : displayData && displayData.length > 0 ? (
                // Render Actual Rows
                displayData.map((item, rowIndex) => {
                  const rowKey = getItemKey(item, rowIndex);
                  const isSelected = selectedKeySet.has(rowKey);

                  return (
                    <TableRow
                      key={String(rowKey)}
                      onClick={() => onRowClick?.(item)}
                      className={cn(
                        "border-zinc-100 dark:border-zinc-800/80 transition-colors text-sm",
                        hoverable && "hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40",
                        striped && rowIndex % 2 === 1 && "bg-zinc-50/40 dark:bg-zinc-950/20",
                        isSelected && "bg-indigo-50/60 dark:bg-indigo-950/30",
                        onRowClick && "cursor-pointer"
                      )}
                    >
                      {selectable && (
                        <TableCell
                          className="px-4 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) =>
                              handleSelectRow(item, rowIndex, Boolean(checked))
                            }
                            aria-label={`Select row ${rowIndex + 1}`}
                          />
                        </TableCell>
                      )}

                      {columns.map((col, colIndex) => (
                        <TableCell
                          key={colIndex}
                          className={cn(
                            compact ? "py-2 px-3 text-xs" : "py-3.5 px-4 text-sm",
                            col.align === "center" && "text-center",
                            col.align === "right" && "text-right",
                            col.className
                          )}
                        >
                          {col.cell
                            ? col.cell(item, rowIndex)
                            : col.accessorKey
                            ? String(item[col.accessorKey] ?? "")
                            : null}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })
              ) : (
                // Empty State
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (selectable ? 1 : 0)}
                    className="h-44 text-center"
                  >
                    {emptyState || (
                      <div className="flex flex-col items-center justify-center p-6 text-zinc-500 space-y-2">
                        <div className="p-3 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500">
                          <EmptyIcon className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          {emptyMessage}
                        </p>
                        {emptyAction && <div className="pt-1">{emptyAction}</div>}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* 4. Table Pagination Footer */}
        {(isServerPagination || isClientPagination) && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 gap-3 text-xs text-zinc-500">
            <div>
              {totalItems > 0 ? (
                <span>
                  Showing{" "}
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {(currentPage - 1) * (finalPageSize || 10) + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {Math.min(currentPage * (finalPageSize || 10), totalItems)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {totalItems}
                  </span>{" "}
                  records
                </span>
              ) : (
                <span>0 records</span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(1)}
                disabled={currentPage <= 1 || isLoading}
                className="h-7 w-7 bg-white dark:bg-zinc-900"
                title="First Page"
              >
                <ChevronsLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1 || isLoading}
                className="h-7 w-7 bg-white dark:bg-zinc-900"
                title="Previous Page"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>

              <span className="px-2 font-mono text-zinc-700 dark:text-zinc-300 font-medium">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || isLoading}
                className="h-7 w-7 bg-white dark:bg-zinc-900"
                title="Next Page"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage >= totalPages || isLoading}
                className="h-7 w-7 bg-white dark:bg-zinc-900"
                title="Last Page"
              >
                <ChevronsRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
