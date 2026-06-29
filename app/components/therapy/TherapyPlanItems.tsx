import React, { useState } from "react";
import {
  ListChecks,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Beaker,
  Repeat,
  Clock,
  CalendarDays,
  Package,
  Hourglass,
  Info,
  ShieldAlert,
} from "lucide-react";
import { Button, Select } from "~/components/ui";
import { useTherapyPlanItems } from "~/hooks/useAuthApi";
import {
  TYPE_LABELS,
  STATUS_LABELS,
  FREQUENCY_LABELS,
  TIMING_LABELS,
  TYPE_OPTIONS,
  STATUS_OPTIONS,
  TherapyItemType,
  TherapyItemStatus,
  type TherapyPlanItem,
} from "~/lib/therapy/therapy-item";

const PAGE_SIZE = 10;
const ALL = "all";

const STATUS_STYLE: Record<TherapyItemStatus, string> = {
  [TherapyItemStatus.PENDING]: "bg-[#FFF4E5] text-[#B25E09]",
  [TherapyItemStatus.ACTIVE]: "bg-[#E6F6EC] text-[#1A7F45]",
  [TherapyItemStatus.IN_PROGRESS]: "bg-[#E1F0FD] text-[#1768A6]",
  [TherapyItemStatus.DONE]: "bg-[#E8E6FC] text-[#5850DE]",
  [TherapyItemStatus.COMPLETED]: "bg-[#E8E6FC] text-[#5850DE]",
  [TherapyItemStatus.SKIPPED]: "bg-[#F0F0F3] text-[#60646C]",
  [TherapyItemStatus.STOPPED]: "bg-[#F0F0F3] text-[#60646C]",
  [TherapyItemStatus.CANCELLED]: "bg-red-50 text-red-500",
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

/* -------------------------------------------------------------------------- */
/*  Single item row                                                           */
/* -------------------------------------------------------------------------- */

const Detail: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}> = ({ icon, label, value }) => (
  <div className="flex items-start gap-2">
    <span className="text-[#8E8E93] mt-0.5">{icon}</span>
    <div className="min-w-0">
      <p className="text-[11px] font-bold text-[#8E8E93] uppercase">{label}</p>
      <p className="text-sm text-[#1B173A] break-words">{value}</p>
    </div>
  </div>
);

const ItemRow: React.FC<{ item: TherapyPlanItem }> = ({ item }) => {
  const frequency = item.frequency
    ? item.customFrequencyNote && item.frequency === "custom"
      ? item.customFrequencyNote
      : FREQUENCY_LABELS[item.frequency]
    : null;

  const timing = item.timing
    ? item.customTimingNote && item.timing === "custom"
      ? item.customTimingNote
      : TIMING_LABELS[item.timing]
    : null;

  return (
    <div className="rounded-2xl border border-[#E0E1E6] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase text-[#5850DE] bg-[#E8E6FC] px-2 py-0.5 rounded-full">
              {TYPE_LABELS[item.type] ?? item.type}
            </span>
            <h4 className="text-sm font-bold text-[#1B173A] break-words">
              {item.title}
            </h4>
          </div>
          {item.description && (
            <p className="text-sm text-[#60646C] mt-1.5 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>
        <span
          className={`shrink-0 text-[11px] font-bold uppercase px-2 py-1 rounded-full ${
            STATUS_STYLE[item.status] ?? "bg-[#F0F0F3] text-[#60646C]"
          }`}
        >
          {STATUS_LABELS[item.status] ?? item.status}
        </span>
      </div>

      {/* Detail grid — only fields that are present */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 mt-4">
        {item.amount && (
          <Detail icon={<Beaker size={14} />} label="Amount" value={item.amount} />
        )}
        {frequency && (
          <Detail icon={<Repeat size={14} />} label="Frequency" value={frequency} />
        )}
        {timing && (
          <Detail icon={<Clock size={14} />} label="Timing" value={timing} />
        )}
        {item.dueDate && (
          <Detail
            icon={<CalendarDays size={14} />}
            label="Due date"
            value={formatDate(item.dueDate)}
          />
        )}
        {item.duration && (
          <Detail
            icon={<Hourglass size={14} />}
            label="Duration"
            value={item.duration}
          />
        )}
        {item.supplementProduct && (
          <Detail
            icon={<Package size={14} />}
            label="Supplement"
            value={item.supplementProduct}
          />
        )}
        {item.instructions && (
          <Detail
            icon={<Info size={14} />}
            label="Instructions"
            value={item.instructions}
          />
        )}
        {item.safetyNote && (
          <Detail
            icon={<ShieldAlert size={14} />}
            label="Safety note"
            value={item.safetyNote}
          />
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Items section                                                             */
/* -------------------------------------------------------------------------- */

interface TherapyPlanItemsProps {
  planId: string;
}

const TherapyPlanItems: React.FC<TherapyPlanItemsProps> = ({ planId }) => {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<TherapyItemType | undefined>();
  const [statusFilter, setStatusFilter] = useState<
    TherapyItemStatus | undefined
  >();

  const { data, isLoading, isError, refetch, isFetching } = useTherapyPlanItems(
    planId,
    { page, limit: PAGE_SIZE, type: typeFilter, status: statusFilter },
  );

  // Reset to the first page whenever a filter changes.
  const onTypeChange = (value: string) => {
    setTypeFilter(value === ALL ? undefined : (value as TherapyItemType));
    setPage(1);
  };
  const onStatusChange = (value: string) => {
    setStatusFilter(value === ALL ? undefined : (value as TherapyItemStatus));
    setPage(1);
  };

  const items = data?.results ?? [];
  const totalPages = data?.pages ?? 1;

  return (
    <div>
      {/* Header + filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h3 className="text-base font-bold text-[#1B173A] flex items-center gap-2">
          <ListChecks size={18} className="text-[#5850DE]" />
          Plan Items
          {data && (
            <span className="text-sm font-semibold text-[#8E8E93]">
              ({data.total})
            </span>
          )}
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-40">
            <Select
              value={typeFilter ?? ALL}
              onChange={onTypeChange}
              options={[{ value: ALL, label: "All types" }, ...TYPE_OPTIONS]}
            />
          </div>
          <div className="w-40">
            <Select
              value={statusFilter ?? ALL}
              onChange={onStatusChange}
              options={[
                { value: ALL, label: "All statuses" },
                ...STATUS_OPTIONS,
              ]}
            />
          </div>
        </div>
      </div>

      {/* States */}
      {isLoading ? (
        <div className="flex items-center gap-2 text-gray-600 py-6">
          <Loader2 size={18} className="animate-spin text-[#5850DE]" />
          <span className="font-medium text-sm">Loading items...</span>
        </div>
      ) : isError ? (
        <div className="text-center py-6">
          <p className="text-sm text-[#8E8E93] italic mb-3">
            Couldn't load plan items.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-[#8E8E93] italic py-6 text-center">
          {typeFilter || statusFilter
            ? "No items match the selected filters."
            : "This plan has no items yet."}
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <ItemRow key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && !isError && totalPages > 1 && (
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#E0E1E6]">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || isFetching}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="flex items-center gap-1.5"
          >
            <ChevronLeft size={15} />
            Previous
          </Button>
          <span className="text-xs font-semibold text-[#60646C]">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || isFetching}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="flex items-center gap-1.5"
          >
            Next
            <ChevronRight size={15} />
          </Button>
        </div>
      )}
    </div>
  );
};

export default TherapyPlanItems;
