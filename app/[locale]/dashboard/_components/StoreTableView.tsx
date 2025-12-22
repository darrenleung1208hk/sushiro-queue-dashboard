import React, { useState, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
  Users,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Settings2,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Store } from '@/lib/types';
import { QUEUE_PRIORITY } from '@/lib/constants';
import { cn, getQueuePriority } from '@/lib/utils';

type SortField =
  | 'store'
  | 'region'
  | 'district'
  | 'status'
  | 'waiting'
  | 'current'
  | null;
type SortDirection = 'asc' | 'desc';

type ColumnKey =
  | 'store'
  | 'region'
  | 'district'
  | 'status'
  | 'waiting'
  | 'current'
  | 'currentQueue';

interface ColumnConfig {
  key: ColumnKey;
  labelKey: string;
  defaultVisible: boolean;
  sortable: boolean;
  align: 'left' | 'center';
}

const COLUMNS: ColumnConfig[] = [
  {
    key: 'store',
    labelKey: 'table.store',
    defaultVisible: true,
    sortable: true,
    align: 'left',
  },
  {
    key: 'region',
    labelKey: 'table.region',
    defaultVisible: false,
    sortable: true,
    align: 'left',
  },
  {
    key: 'district',
    labelKey: 'table.district',
    defaultVisible: false,
    sortable: true,
    align: 'left',
  },
  {
    key: 'status',
    labelKey: 'table.status',
    defaultVisible: true,
    sortable: true,
    align: 'center',
  },
  {
    key: 'waiting',
    labelKey: 'store.waiting',
    defaultVisible: true,
    sortable: true,
    align: 'center',
  },
  {
    key: 'current',
    labelKey: 'store.current',
    defaultVisible: true,
    sortable: true,
    align: 'center',
  },
  {
    key: 'currentQueue',
    labelKey: 'store.currentQueue',
    defaultVisible: true,
    sortable: false,
    align: 'left',
  },
];

interface StoreTableViewProps {
  stores: Store[];
  isLoading?: boolean;
}

interface SortableHeaderProps {
  field: SortField;
  currentSort: SortField;
  direction: SortDirection;
  onSort: (field: SortField) => void;
  children: React.ReactNode;
  className?: string;
}

const SortableHeader = ({
  field,
  currentSort,
  direction,
  onSort,
  children,
  className,
}: SortableHeaderProps) => {
  const isActive = currentSort === field;

  return (
    <th
      className={cn(
        'px-4 py-3 font-medium text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors select-none',
        className
      )}
      onClick={() => onSort(field)}
    >
      <div
        className={cn(
          'flex items-center gap-1',
          className?.includes('text-center') && 'justify-center'
        )}
      >
        {children}
        {isActive ? (
          direction === 'asc' ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-50" />
        )}
      </div>
    </th>
  );
};

export const StoreTableView = ({
  stores,
  isLoading = false,
}: StoreTableViewProps) => {
  const t = useTranslations();
  const locale = useLocale();
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [visibleColumns, setVisibleColumns] = useState<Set<ColumnKey>>(() => {
    return new Set(
      COLUMNS.filter((col) => col.defaultVisible).map((col) => col.key)
    );
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleColumn = (columnKey: ColumnKey) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(columnKey)) {
        // Don't allow hiding all columns - keep at least store column
        if (next.size > 1 || columnKey === 'store') {
          next.delete(columnKey);
        }
      } else {
        next.add(columnKey);
      }
      return next;
    });
  };

  const isColumnVisible = (key: ColumnKey) => visibleColumns.has(key);

  const sortedStores = useMemo(() => {
    if (!sortField) return stores;

    return [...stores].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'store':
          const nameA = locale === 'zh-HK' ? a.name : a.nameEn;
          const nameB = locale === 'zh-HK' ? b.name : b.nameEn;
          comparison = nameA.localeCompare(nameB, locale);
          break;
        case 'region':
          comparison = a.region.localeCompare(b.region, locale);
          break;
        case 'district':
          comparison = a.area.localeCompare(b.area, locale);
          break;
        case 'status':
          comparison = a.storeStatus.localeCompare(b.storeStatus);
          break;
        case 'waiting':
          comparison = a.waitingGroup - b.waitingGroup;
          break;
        case 'current':
          const currentA = a.storeQueue[0] ?? '';
          const currentB = b.storeQueue[0] ?? '';
          comparison = currentA.localeCompare(currentB);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [stores, sortField, sortDirection, locale]);

  if (isLoading) {
    return (
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  {t('table.store')}
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  {t('table.region')}
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  {t('table.district')}
                </th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">
                  {t('table.status')}
                </th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">
                  {t('store.waiting')}
                </th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">
                  {t('store.current')}
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  {t('store.currentQueue')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {Array.from({ length: 10 }).map((_, index) => (
                <tr key={index} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-28" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Skeleton className="h-5 w-12 mx-auto" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Skeleton className="h-4 w-8 mx-auto" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Skeleton className="h-4 w-12 mx-auto" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-5 w-28" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const renderCellContent = (store: Store, columnKey: ColumnKey) => {
    const isOpen = store.storeStatus === 'OPEN';
    const storeName = locale === 'zh-HK' ? store.name : store.nameEn;
    const waitTier = getQueuePriority(store.waitingGroup);
    const queueLength = store.storeQueue.length;

    switch (columnKey) {
      case 'store':
        return (
          <td className="px-4 py-3 font-medium text-foreground">{storeName}</td>
        );
      case 'region':
        return (
          <td className="px-4 py-3 text-muted-foreground">
            {t(`common.regions.${store.region}`)}
          </td>
        );
      case 'district':
        return (
          <td className="px-4 py-3 text-muted-foreground">
            {t(`common.districts.${store.area}`)}
          </td>
        );
      case 'status':
        return (
          <td className="px-4 py-3 text-center">
            <Badge
              variant={isOpen ? 'default' : 'destructive'}
              className="text-[10px] px-1.5 py-0.5 h-5"
            >
              {t(`store.status.${store.storeStatus.toLowerCase()}`)}
            </Badge>
          </td>
        );
      case 'waiting':
        return (
          <td className="px-4 py-3 text-center">
            <div
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-md',
                waitTier === QUEUE_PRIORITY.HIGH &&
                  'bg-destructive/10 text-destructive',
                waitTier === QUEUE_PRIORITY.MEDIUM &&
                  'bg-warning/10 text-warning',
                waitTier === QUEUE_PRIORITY.LOW && 'bg-success/10 text-primary'
              )}
            >
              <Users className="h-3 w-3" />
              <span className="font-semibold">{store.waitingGroup}</span>
            </div>
          </td>
        );
      case 'current':
        return (
          <td className="px-4 py-3 text-center font-medium text-foreground">
            {queueLength > 0 ? `#${store.storeQueue[0]}` : '--'}
          </td>
        );
      case 'currentQueue':
        return (
          <td className="px-4 py-3">
            <div className="flex flex-wrap gap-1">
              {queueLength > 0 ? (
                <>
                  {store.storeQueue.slice(0, 3).map((ticket, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-[10px] px-1.5 py-0.5 h-5"
                    >
                      #{ticket}
                    </Badge>
                  ))}
                  {queueLength > 3 && (
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0.5 h-5"
                    >
                      {t('store.moreTickets', {
                        count: queueLength - 3,
                      })}
                    </Badge>
                  )}
                </>
              ) : (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0.5 h-5 text-muted-foreground"
                >
                  {t('store.noTickets')}
                </Badge>
              )}
            </div>
          </td>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
      {/* Column Selector */}
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <Settings2 className="h-3.5 w-3.5" />
              <span className="text-xs">{t('table.columns')}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>{t('table.toggleColumns')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {COLUMNS.map((column) => (
              <DropdownMenuCheckboxItem
                key={column.key}
                checked={isColumnVisible(column.key)}
                onCheckedChange={() => toggleColumn(column.key)}
              >
                {t(column.labelKey)}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                {COLUMNS.filter((col) => isColumnVisible(col.key)).map(
                  (column) =>
                    column.sortable ? (
                      <SortableHeader
                        key={column.key}
                        field={column.key as SortField}
                        currentSort={sortField}
                        direction={sortDirection}
                        onSort={handleSort}
                        className={`text-${column.align}`}
                      >
                        {t(column.labelKey)}
                      </SortableHeader>
                    ) : (
                      <th
                        key={column.key}
                        className={`text-${column.align} px-4 py-3 font-medium text-muted-foreground`}
                      >
                        {t(column.labelKey)}
                      </th>
                    )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedStores.map((store) => (
                <tr
                  key={store.shopId}
                  className="hover:bg-muted/30 transition-colors"
                >
                  {COLUMNS.filter((col) => isColumnVisible(col.key)).map(
                    (column) => (
                      <React.Fragment key={column.key}>
                        {renderCellContent(store, column.key)}
                      </React.Fragment>
                    )
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
