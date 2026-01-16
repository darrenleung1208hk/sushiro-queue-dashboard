import React, { useState, useMemo, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Users, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Store } from '@/lib/types';
import { QUEUE_PRIORITY } from '@/lib/constants';
import { cn, getQueuePriority } from '@/lib/utils';

type SortField = 'store' | 'region' | 'district' | 'waiting' | 'current' | null;
type SortDirection = 'asc' | 'desc';

type ColumnKey =
  | 'store'
  | 'region'
  | 'district'
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
    key: 'waiting',
    labelKey: 'store.waiting',
    defaultVisible: true,
    sortable: true,
    align: 'center',
  },
  {
    key: 'current',
    labelKey: 'store.current',
    defaultVisible: false,
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

// Grid template for consistent column alignment
const GRID_TEMPLATE = 'minmax(120px, 1fr) 100px minmax(140px, 1fr)';

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
  isFirst,
  isLast,
}: SortableHeaderProps & { isFirst?: boolean; isLast?: boolean }) => {
  const isActive = currentSort === field;

  return (
    <div
      role="columnheader"
      aria-sort={
        isActive ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'
      }
      tabIndex={0}
      className={cn(
        'px-2 sm:px-3 py-2 sm:py-3 font-medium text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors select-none whitespace-nowrap',
        isFirst && 'pl-4 sm:pl-3',
        isLast && 'pr-4 sm:pr-3',
        className
      )}
      onClick={() => onSort(field)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSort(field);
        }
      }}
    >
      <div
        className={cn(
          'flex items-center gap-0.5 sm:gap-1',
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
    </div>
  );
};

// Filter to only show default visible columns
const VISIBLE_COLUMNS = COLUMNS.filter((col) => col.defaultVisible);

// Animated table row with snappy spring animation
const TableRow = ({
  children,
  onAnimationStart,
  onAnimationEnd,
}: {
  children: React.ReactNode;
  onAnimationStart: () => void;
  onAnimationEnd: () => void;
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  return (
    <motion.div
      role="row"
      layout
      onLayoutAnimationStart={() => {
        setIsAnimating(true);
        onAnimationStart();
      }}
      onLayoutAnimationComplete={() => {
        setIsAnimating(false);
        onAnimationEnd();
      }}
      transition={{
        layout: {
          type: 'spring',
          stiffness: 500,
          damping: 35,
          mass: 0.8,
        },
      }}
      className={cn(
        'grid border-b border-border last:border-b-0 transition-colors',
        !isAnimating && 'hover:bg-muted/30'
      )}
      style={{ gridTemplateColumns: GRID_TEMPLATE }}
    >
      {children}
    </motion.div>
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
  const [animatingCount, setAnimatingCount] = useState(0);

  const handleAnimationStart = useCallback(() => {
    setAnimatingCount((prev) => prev + 1);
  }, []);

  const handleAnimationEnd = useCallback(() => {
    setAnimatingCount((prev) => Math.max(0, prev - 1));
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

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
        case 'waiting':
          // Closed stores sort to the end when ascending, beginning when descending
          const aIsClosed = a.storeStatus === 'CLOSED';
          const bIsClosed = b.storeStatus === 'CLOSED';
          if (aIsClosed && !bIsClosed) comparison = 1;
          else if (!aIsClosed && bIsClosed) comparison = -1;
          else comparison = a.waitingGroup - b.waitingGroup;
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
      <div
        role="table"
        aria-label={t('table.store')}
        className="-mx-4 sm:mx-0 border-y sm:border border-border sm:rounded-lg overflow-hidden bg-card"
      >
        <div className="overflow-x-auto">
          <div className="min-w-full text-sm">
            {/* Header */}
            <div role="rowgroup" className="bg-muted/50 border-b border-border">
              <div
                role="row"
                className="grid"
                style={{ gridTemplateColumns: GRID_TEMPLATE }}
              >
                <div
                  role="columnheader"
                  className="text-left pl-4 sm:pl-3 pr-2 sm:pr-3 py-2 sm:py-3 font-medium text-muted-foreground"
                >
                  {t('table.store')}
                </div>
                <div
                  role="columnheader"
                  className="text-center px-2 sm:px-3 py-2 sm:py-3 font-medium text-muted-foreground"
                >
                  {t('store.waiting')}
                </div>
                <div
                  role="columnheader"
                  className="text-left pl-2 sm:pl-3 pr-4 sm:pr-3 py-2 sm:py-3 font-medium text-muted-foreground"
                >
                  {t('store.currentQueue')}
                </div>
              </div>
            </div>
            {/* Body */}
            <div role="rowgroup">
              {Array.from({ length: 10 }).map((_, index) => (
                <div
                  key={index}
                  role="row"
                  className="grid border-b border-border last:border-b-0 hover:bg-muted/30"
                  style={{ gridTemplateColumns: GRID_TEMPLATE }}
                >
                  <div
                    role="cell"
                    className="pl-4 sm:pl-3 pr-2 sm:pr-3 py-2 sm:py-3"
                  >
                    <Skeleton className="h-4 w-20 sm:w-28" />
                  </div>
                  <div
                    role="cell"
                    className="px-2 sm:px-3 py-2 sm:py-3 text-center"
                  >
                    <Skeleton className="h-5 w-12 sm:w-14 mx-auto" />
                  </div>
                  <div
                    role="cell"
                    className="pl-2 sm:pl-3 pr-4 sm:pr-3 py-2 sm:py-3"
                  >
                    <Skeleton className="h-5 w-20 sm:w-28" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderCellContent = (
    store: Store,
    columnKey: ColumnKey,
    isFirst: boolean,
    isLast: boolean
  ) => {
    const isOpen = store.storeStatus === 'OPEN';
    const storeName = locale === 'zh-HK' ? store.name : store.nameEn;
    const waitTier = getQueuePriority(store.waitingGroup);
    const queueLength = store.storeQueue.length;

    const cellPadding = cn(
      'px-2 sm:px-3 py-2 sm:py-3',
      isFirst && 'pl-4 sm:pl-3',
      isLast && 'pr-4 sm:pr-3'
    );

    switch (columnKey) {
      case 'store':
        return (
          <div
            role="cell"
            className={cn(cellPadding, 'font-medium text-foreground')}
          >
            {storeName}
          </div>
        );
      case 'region':
        return (
          <div
            role="cell"
            className={cn(
              cellPadding,
              'text-muted-foreground whitespace-nowrap'
            )}
          >
            {t(`common.regions.${store.region}`)}
          </div>
        );
      case 'district':
        return (
          <div
            role="cell"
            className={cn(
              cellPadding,
              'text-muted-foreground whitespace-nowrap'
            )}
          >
            {t(`common.districts.${store.area}`)}
          </div>
        );
      case 'waiting':
        return (
          <div role="cell" className={cn(cellPadding, 'text-center')}>
            {isOpen ? (
              <div
                className={cn(
                  'inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded-md',
                  waitTier === QUEUE_PRIORITY.HIGH &&
                    'bg-destructive/10 text-destructive',
                  waitTier === QUEUE_PRIORITY.MEDIUM &&
                    'bg-warning/10 text-warning',
                  waitTier === QUEUE_PRIORITY.LOW &&
                    'bg-success/10 text-primary'
                )}
              >
                <Users className="h-3 w-3" />
                <span className="font-semibold">{store.waitingGroup}</span>
              </div>
            ) : (
              <Badge
                variant="destructive"
                className="text-[10px] px-1 sm:px-1.5 py-0.5 h-5"
              >
                {t('store.status.closed')}
              </Badge>
            )}
          </div>
        );
      case 'current':
        return (
          <div
            role="cell"
            className={cn(
              cellPadding,
              'text-center font-medium text-foreground'
            )}
          >
            {queueLength > 0 ? `#${store.storeQueue[0]}` : '--'}
          </div>
        );
      case 'currentQueue':
        return (
          <div role="cell" className={cellPadding}>
            <div className="flex flex-wrap gap-0.5 sm:gap-1">
              {queueLength > 0 ? (
                <>
                  {store.storeQueue.slice(0, 3).map((ticket, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-[10px] px-1 sm:px-1.5 py-0.5 h-5"
                    >
                      #{ticket}
                    </Badge>
                  ))}
                  {queueLength > 3 && (
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1 sm:px-1.5 py-0.5 h-5"
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
                  className="text-[10px] px-1 sm:px-1.5 py-0.5 h-5 text-muted-foreground"
                >
                  {t('store.noTickets')}
                </Badge>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      role="table"
      aria-label={t('table.store')}
      className="-mx-4 sm:mx-0 border-y sm:border border-border sm:rounded-lg overflow-hidden bg-card animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
    >
      <div
        className={cn(
          'overflow-x-auto',
          animatingCount > 0 && 'overflow-hidden'
        )}
      >
        <div className="min-w-full text-sm">
          {/* Header */}
          <div role="rowgroup" className="bg-muted/50 border-b border-border">
            <div
              role="row"
              className="grid"
              style={{ gridTemplateColumns: GRID_TEMPLATE }}
            >
              {VISIBLE_COLUMNS.map((column, index, arr) => {
                const isFirst = index === 0;
                const isLast = index === arr.length - 1;
                return column.sortable ? (
                  <SortableHeader
                    key={column.key}
                    field={column.key as SortField}
                    currentSort={sortField}
                    direction={sortDirection}
                    onSort={handleSort}
                    className={`text-${column.align}`}
                    isFirst={isFirst}
                    isLast={isLast}
                  >
                    {t(column.labelKey)}
                  </SortableHeader>
                ) : (
                  <div
                    key={column.key}
                    role="columnheader"
                    className={cn(
                      `text-${column.align} px-2 sm:px-3 py-2 sm:py-3 font-medium text-muted-foreground`,
                      isFirst && 'pl-4 sm:pl-3',
                      isLast && 'pr-4 sm:pr-3'
                    )}
                  >
                    {t(column.labelKey)}
                  </div>
                );
              })}
            </div>
          </div>
          {/* Body */}
          <div role="rowgroup">
            {sortedStores.map((store) => (
              <TableRow
                key={store.shopId}
                onAnimationStart={handleAnimationStart}
                onAnimationEnd={handleAnimationEnd}
              >
                {VISIBLE_COLUMNS.map((column, index, arr) => (
                  <React.Fragment key={column.key}>
                    {renderCellContent(
                      store,
                      column.key,
                      index === 0,
                      index === arr.length - 1
                    )}
                  </React.Fragment>
                ))}
              </TableRow>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
