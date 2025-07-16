/** biome-ignore-all lint/correctness/useExhaustiveDependencies: <explanation> */
/** biome-ignore-all lint/a11y/useSemanticElements: <explanation> */
/** biome-ignore-all lint/style/noNestedTernary: <explanation> */
'use client';

import type { ProteinAnalysis } from '@repo/database/src/protein-schema';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@repo/design-system/components/ui/alert-dialog';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Button } from '@repo/design-system/components/ui/button';
import { Checkbox } from '@repo/design-system/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/design-system/components/ui/dropdown-menu';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from '@repo/design-system/components/ui/pagination';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@repo/design-system/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/design-system/components/ui/table';
import { cn } from '@repo/design-system/lib/utils';
import {
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type Row,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table';
import {
  ChevronDownIcon,
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  CircleAlertIcon,
  CircleXIcon,
  Columns3Icon,
  CopyIcon,
  EllipsisIcon,
  EyeIcon,
  FilterIcon,
  ListFilterIcon,
  TrashIcon,
} from 'lucide-react';
import { useId, useMemo, useRef, useState } from 'react';
import { ProteinDetailsDialog } from '~/components/protein-details-dialog';
import { useProteinAnalysisStore } from '~/providers/protein-analysis-store-provider';

interface ProteinTableProps {
  data: ProteinAnalysis[];
  onCopySequence?: (sequence: string) => void;
  onViewDetails?: (protein: ProteinAnalysis) => void;
  onDeleteProteins?: (proteins: ProteinAnalysis[]) => void;
}

// Custom filter function for sequence searching
const sequenceFilterFn: FilterFn<ProteinAnalysis> = (
  row,
  _columnId,
  filterValue
) => {
  const searchTerm = (filterValue ?? '').toLowerCase();
  const sequence = row.original.sequence.toLowerCase();
  return sequence.includes(searchTerm);
};

// Filter function for stability status, similar to the example
const stabilityFilterFn: FilterFn<ProteinAnalysis> = (
  row,
  columnId,
  filterValue: string[]
) => {
  if (!filterValue?.length) {
    return true;
  }
  const status = row.getValue(columnId) as string;
  return filterValue.includes(status);
};

const columns: ColumnDef<ProteinAnalysis>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all"
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label="Select row"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    size: 28,
    enableSorting: false,
    enableHiding: false,
  },
  {
    header: 'Sequence',
    accessorKey: 'sequence',
    cell: ({ row }) => {
      const sequence = row.getValue('sequence') as string;
      return (
        <div className="max-w-32 font-mono text-sm">
          <span className="block truncate">
            {sequence.length > 20
              ? `${sequence.substring(0, 20)}...`
              : sequence}
          </span>
          <span className="text-muted-foreground text-xs">
            {row.original.length} AA
          </span>
        </div>
      );
    },
    size: 140,
    filterFn: sequenceFilterFn,
    enableHiding: false,
  },
  {
    header: 'Molecular Weight',
    accessorKey: 'molecularWeight',
    cell: ({ row }) => (
      <div className="text-right">
        <div className="font-medium">
          {Number(row.getValue('molecularWeight')).toFixed(2)}
        </div>
        <div className="text-muted-foreground text-xs">Da</div>
      </div>
    ),
    size: 120,
  },
  {
    header: 'pI',
    accessorKey: 'isoelectricPoint',
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {Number(row.getValue('isoelectricPoint')).toFixed(2)}
      </div>
    ),
    size: 80,
  },
  {
    header: 'Stability',
    accessorKey: 'instabilityIndex',
    cell: ({ row }) => {
      const instabilityIndex = Number(row.original.instabilityIndex);
      const isStable = instabilityIndex <= 40;
      return (
        <div className="space-y-1">
          <Badge
            className="text-xs"
            variant={isStable ? 'default' : 'destructive'}
          >
            {isStable ? 'Stable' : 'Unstable'}
          </Badge>
          <div className="text-muted-foreground text-xs">
            {instabilityIndex.toFixed(2)}
          </div>
        </div>
      );
    },
    size: 100,
    filterFn: stabilityFilterFn,
    accessorFn: (row) =>
      Number(row.instabilityIndex) > 40 ? 'Unstable' : 'Stable',
  },
  {
    header: 'Aromaticity',
    accessorKey: 'aromaticity',
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {Number(row.getValue('aromaticity')).toFixed(3)}
      </div>
    ),
    size: 100,
  },
  {
    header: 'GRAVY',
    accessorKey: 'gravy',
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {Number(row.getValue('gravy')).toFixed(2)}
      </div>
    ),
    size: 80,
  },
  {
    header: 'Charge (pH 7)',
    accessorKey: 'chargeAtPh7',
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {Number(row.getValue('chargeAtPh7')).toFixed(2)}
      </div>
    ),
    size: 100,
  },
  {
    header: 'Secondary Structure',
    accessorKey: 'helixFraction',
    cell: ({ row }) => (
      <div className="space-y-1">
        <div className="grid grid-cols-3 gap-1 text-xs">
          <div className="text-center">
            <div className="font-medium text-blue-600">
              {(Number(row.original.helixFraction) * 100).toFixed(0)}%
            </div>
            <div className="text-muted-foreground">H</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-green-600">
              {(Number(row.original.turnFraction) * 100).toFixed(0)}%
            </div>
            <div className="text-muted-foreground">T</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-purple-600">
              {(Number(row.original.sheetFraction) * 100).toFixed(0)}%
            </div>
            <div className="text-muted-foreground">S</div>
          </div>
        </div>
      </div>
    ),
    size: 140,
    enableSorting: false,
  },
  {
    id: 'actions',
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row, table }) => {
      const meta = table.options.meta as {
        onDeleteProtein?: (protein: ProteinAnalysis) => void;
      };
      return <RowActions onDeleteProtein={meta?.onDeleteProtein} row={row} />;
    },
    size: 60,
    enableHiding: false,
  },
];

export function ProteinTable({ data, onDeleteProteins }: ProteinTableProps) {
  const id = useId();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'molecularWeight',
      desc: false,
    },
  ]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDeleteSingle = (protein: ProteinAnalysis) => {
    if (onDeleteProteins) {
      onDeleteProteins([protein]);
    }
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    enableSortingRemoval: false,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    meta: {
      onDeleteProtein: handleDeleteSingle,
    },
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
    },
  });

  const stabilityColumn = table.getColumn('instabilityIndex');

  // Get unique stability values
  const uniqueStabilityValues = useMemo(() => {
    const values = Array.from(
      stabilityColumn?.getFacetedUniqueValues().keys() ?? []
    );
    return values.sort();
  }, [stabilityColumn?.getFacetedUniqueValues()]);

  // Get counts for each stability status
  const stabilityCounts = useMemo(() => {
    return stabilityColumn?.getFacetedUniqueValues() ?? new Map();
  }, [stabilityColumn?.getFacetedUniqueValues()]);

  const selectedStability = useMemo(() => {
    const filterValue = stabilityColumn?.getFilterValue() as string[];
    return filterValue ?? [];
  }, [stabilityColumn?.getFilterValue()]);

  const handleStabilityChange = (checked: boolean, value: string) => {
    const filterValue = stabilityColumn?.getFilterValue() as string[];
    const newFilterValue = filterValue ? [...filterValue] : [];

    if (checked) {
      newFilterValue.push(value);
    } else {
      const index = newFilterValue.indexOf(value);
      if (index > -1) {
        newFilterValue.splice(index, 1);
      }
    }

    stabilityColumn?.setFilterValue(
      newFilterValue.length ? newFilterValue : undefined
    );
  };

  const handleCopySelected = () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const sequences = selectedRows.map((row) => row.original.sequence);
    const fastaContent = sequences
      .map((seq, index) => `>Protein_${index + 1}\n${seq}`)
      .join('\n\n');

    navigator.clipboard.writeText(fastaContent);
    table.resetRowSelection();
  };

  const handleDeleteSelected = () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const proteinsToDelete = selectedRows.map((row) => row.original);

    if (onDeleteProteins) {
      onDeleteProteins(proteinsToDelete);
    }

    table.resetRowSelection();
  };

  return (
    <div className="space-y-4">
      <ProteinDetailsDialog />
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Filter by sequence */}
          <div className="relative">
            <Input
              aria-label="Filter by sequence"
              className={cn(
                'peer min-w-60 ps-9',
                Boolean(table.getColumn('sequence')?.getFilterValue()) && 'pe-9'
              )}
              id={`${id}-input`}
              onChange={(e) =>
                table.getColumn('sequence')?.setFilterValue(e.target.value)
              }
              placeholder="Search sequences..."
              ref={inputRef}
              type="text"
              value={
                (table.getColumn('sequence')?.getFilterValue() ?? '') as string
              }
            />
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
              <ListFilterIcon aria-hidden="true" size={16} />
            </div>
            {Boolean(table.getColumn('sequence')?.getFilterValue()) && (
              <button
                aria-label="Clear filter"
                className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md text-muted-foreground/80 outline-none transition-[color,box-shadow] hover:text-foreground focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => {
                  table.getColumn('sequence')?.setFilterValue('');
                  if (inputRef.current) {
                    inputRef.current.focus();
                  }
                }}
                type="button"
              >
                <CircleXIcon aria-hidden="true" size={16} />
              </button>
            )}
          </div>

          {/* Filter by stability */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <FilterIcon
                  aria-hidden="true"
                  className="-ms-1 opacity-60"
                  size={16}
                />
                Stability
                {selectedStability.length > 0 && (
                  <span className="-me-1 inline-flex h-5 max-h-full items-center rounded border bg-background px-1 font-[inherit] font-medium text-[0.625rem] text-muted-foreground/70">
                    {selectedStability.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto min-w-36 p-3">
              <div className="space-y-3">
                <div className="font-medium text-muted-foreground text-xs">
                  Stability Status
                </div>
                <div className="space-y-3">
                  {uniqueStabilityValues.map((value, i) => (
                    <div className="flex items-center gap-2" key={value}>
                      <Checkbox
                        checked={selectedStability.includes(value)}
                        id={`${id}-stability-${i}`}
                        onCheckedChange={(checked: boolean) =>
                          handleStabilityChange(checked, value)
                        }
                      />
                      <Label
                        className="flex grow justify-between gap-2 font-normal"
                        htmlFor={`${id}-stability-${i}`}
                      >
                        {value}{' '}
                        <span className="ms-2 text-muted-foreground text-xs">
                          {stabilityCounts.get(value) || 0}
                        </span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Toggle columns visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Columns3Icon
                  aria-hidden="true"
                  className="-ms-1 opacity-60"
                  size={16}
                />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      checked={column.getIsVisible()}
                      className="capitalize"
                      key={column.id}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                      onSelect={(event) => event.preventDefault()}
                    >
                      {column.id === 'instabilityIndex'
                        ? 'Stability'
                        : column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-3">
          {/* Delete selected proteins */}
          {table.getSelectedRowModel().rows.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <TrashIcon
                    aria-hidden="true"
                    className="-ms-1 opacity-60"
                    size={16}
                  />
                  Delete
                  <span className="-me-1 inline-flex h-5 max-h-full items-center rounded border bg-background px-1 font-[inherit] font-medium text-[0.625rem] text-muted-foreground/70">
                    {table.getSelectedRowModel().rows.length}
                  </span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
                  <div
                    aria-hidden="true"
                    className="flex size-9 shrink-0 items-center justify-center rounded-full border"
                  >
                    <CircleAlertIcon className="opacity-80" size={16} />
                  </div>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete{' '}
                      {table.getSelectedRowModel().rows.length} selected{' '}
                      {table.getSelectedRowModel().rows.length === 1
                        ? 'protein'
                        : 'proteins'}
                      .
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteSelected}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {/* Copy selected sequences */}
          {table.getSelectedRowModel().rows.length > 0 && (
            <Button onClick={handleCopySelected} variant="outline">
              <CopyIcon
                aria-hidden="true"
                className="-ms-1 opacity-60"
                size={16}
              />
              Copy FASTA
              <span className="-me-1 inline-flex h-5 max-h-full items-center rounded border bg-background px-1 font-[inherit] font-medium text-[0.625rem] text-muted-foreground/70">
                {table.getSelectedRowModel().rows.length}
              </span>
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-md border bg-background">
        <Table className="table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow className="hover:bg-transparent" key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      className="h-11"
                      key={header.id}
                      style={{ width: `${header.getSize()}px` }}
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <div
                          className={cn(
                            'flex h-full cursor-pointer select-none items-center justify-between gap-2'
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              header.column.getToggleSortingHandler()?.(e);
                            }
                          }}
                          role="button"
                          tabIndex={0}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: (
                              <ChevronUpIcon
                                aria-hidden="true"
                                className="shrink-0 opacity-60"
                                size={16}
                              />
                            ),
                            desc: (
                              <ChevronDownIcon
                                aria-hidden="true"
                                className="shrink-0 opacity-60"
                                size={16}
                              />
                            ),
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  data-state={row.getIsSelected() && 'selected'}
                  key={row.id}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell className="py-3 last:py-0" key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  className="h-24 text-center"
                  colSpan={columns.length}
                >
                  No protein analysis results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-8">
        {/* Results per page */}
        <div className="flex items-center gap-3">
          <Label className="max-sm:sr-only" htmlFor={`${id}-pagesize`}>
            Rows per page
          </Label>
          <Select
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
            value={table.getState().pagination.pageSize.toString()}
          >
            <SelectTrigger
              className="w-fit whitespace-nowrap"
              id={`${id}-pagesize`}
            >
              <SelectValue placeholder="Select number of results" />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 25, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize.toString()}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page number information */}
        <div className="flex grow justify-end whitespace-nowrap text-muted-foreground text-sm">
          <p
            aria-live="polite"
            className="whitespace-nowrap text-muted-foreground text-sm"
          >
            <span className="text-foreground">
              {table.getState().pagination.pageIndex *
                table.getState().pagination.pageSize +
                1}
              -
              {Math.min(
                Math.max(
                  table.getState().pagination.pageIndex *
                    table.getState().pagination.pageSize +
                    table.getState().pagination.pageSize,
                  0
                ),
                table.getRowCount()
              )}
            </span>{' '}
            of{' '}
            <span className="text-foreground">
              {table.getRowCount().toString()}
            </span>
          </p>
        </div>

        {/* Pagination buttons */}
        <div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button
                  aria-label="Go to first page"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  disabled={!table.getCanPreviousPage()}
                  onClick={() => table.firstPage()}
                  size="icon"
                  variant="outline"
                >
                  <ChevronFirstIcon aria-hidden="true" size={16} />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  aria-label="Go to previous page"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  disabled={!table.getCanPreviousPage()}
                  onClick={() => table.previousPage()}
                  size="icon"
                  variant="outline"
                >
                  <ChevronLeftIcon aria-hidden="true" size={16} />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  aria-label="Go to next page"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  disabled={!table.getCanNextPage()}
                  onClick={() => table.nextPage()}
                  size="icon"
                  variant="outline"
                >
                  <ChevronRightIcon aria-hidden="true" size={16} />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  aria-label="Go to last page"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  disabled={!table.getCanNextPage()}
                  onClick={() => table.lastPage()}
                  size="icon"
                  variant="outline"
                >
                  <ChevronLastIcon aria-hidden="true" size={16} />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}

function RowActions({
  row,
  onDeleteProtein,
}: {
  row: Row<ProteinAnalysis>;
  onDeleteProtein?: (protein: ProteinAnalysis) => void;
}) {
  const openProteinDetails = useProteinAnalysisStore(
    (state) => state.openProteinDetails
  );

  const handleCopySequence = () => {
    navigator.clipboard.writeText(row.original.sequence);
  };

  const handleCopyFasta = () => {
    const fastaContent = `>Protein_${row.index + 1}\n${row.original.sequence}`;
    navigator.clipboard.writeText(fastaContent);
  };

  const handleViewDetails = () => {
    openProteinDetails(row.original);
  };

  const handleDelete = () => {
    if (onDeleteProtein) {
      onDeleteProtein(row.original);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex justify-end">
          <Button
            aria-label="Protein actions"
            className="shadow-none"
            size="icon"
            variant="ghost"
          >
            <EllipsisIcon aria-hidden="true" size={16} />
          </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleCopySequence}>
            <CopyIcon aria-hidden="true" className="mr-2 h-4 w-4" />
            Copy Sequence
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopyFasta}>
            <CopyIcon aria-hidden="true" className="mr-2 h-4 w-4" />
            Copy FASTA
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleViewDetails}>
            <EyeIcon aria-hidden="true" className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={handleDelete}
        >
          <TrashIcon aria-hidden="true" className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
