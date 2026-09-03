import React, { useEffect, useState } from "react";
import {
  Search,
  X,
  Package,
  Star,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Check,
} from "lucide-react";
import { Input, Button } from "~/components/ui";
import { useProductSearch } from "~/hooks/useAuthApi";
import {
  PRODUCT_SEARCH_MIN_CHARS,
  type Product,
} from "~/lib/products/product";

const PAGE_SIZE = 10;

interface SupplementProductPickerProps {
  /** Selected product id (empty string when nothing is selected). */
  value: string;
  /** Selected product display name, used to render the chip. */
  valueName?: string;
  /** Fires with the picked product's id + title, or ("", "") on clear. */
  onChange: (productId: string, productName: string) => void;
  invalid?: boolean;
  id?: string;
}

const stockLabel = (status: string) =>
  status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const ProductRow: React.FC<{ product: Product; onSelect: () => void }> = ({
  product,
  onSelect,
}) => {
  const image = product.images[0]?.url;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-[#F8F7FF] transition-colors"
    >
      <span className="w-10 h-10 rounded-lg bg-[#F0F0F3] flex items-center justify-center overflow-hidden shrink-0">
        {image ? (
          <img
            src={image}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <Package size={16} className="text-[#8E8E93]" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-[#1B173A] truncate">
          {product.title}
        </span>
        <span className="flex items-center gap-2 text-xs text-[#8E8E93]">
          <span className="truncate">{product.brand}</span>
          <span className="flex items-center gap-0.5 shrink-0">
            <Star size={11} className="text-[#F5A623] fill-[#F5A623]" />
            {product.rating}
          </span>
        </span>
      </span>
      <span className="text-[11px] font-semibold text-[#1A7F45] bg-[#E6F6EC] px-2 py-0.5 rounded-full shrink-0">
        {stockLabel(product.stockStatus)}
      </span>
    </button>
  );
};

const SupplementProductPicker: React.FC<SupplementProductPickerProps> = ({
  value,
  valueName,
  onChange,
  invalid,
  id,
}) => {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);

  // Debounce the raw input so we only query once typing settles.
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Any change to the query text resets pagination back to the first page.
  useEffect(() => {
    setPage(1);
  }, [debounced]);

  const hasQuery = search.trim().length >= PRODUCT_SEARCH_MIN_CHARS;
  const canSearch = debounced.length >= PRODUCT_SEARCH_MIN_CHARS;

  const { data, isFetching, isError, refetch } = useProductSearch({
    page,
    limit: PAGE_SIZE,
    search: canSearch ? debounced : undefined,
  });

  const results = data?.results ?? [];
  const totalPages = data?.pages ?? 1;

  const select = (product: Product) => {
    onChange(product.id, product.title);
    setSearch("");
    setDebounced("");
    setPage(1);
  };

  const clear = () => onChange("", "");

  // A selected product replaces the search box with a summary chip.
  if (value) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-lg border border-[#5850DE]/30 bg-white px-3 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-6 h-6 rounded-md bg-[#E8E6FC] text-[#5850DE] flex items-center justify-center shrink-0">
            <Check size={13} />
          </span>
          <span className="text-sm font-semibold text-[#1B173A] truncate">
            {valueName || "Selected product"}
          </span>
        </div>
        <button
          type="button"
          onClick={clear}
          aria-label="Remove selected product"
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[#60646C] hover:bg-red-50 hover:text-red-500 transition-colors shrink-0"
        >
          <X size={15} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search
          size={15}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8E8E93] pointer-events-none"
        />
        <Input
          id={id}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products by name or brand..."
          className={`pl-8 ${invalid ? "border-red-500" : ""}`}
        />
      </div>

      {/* Nothing shows until at least PRODUCT_SEARCH_MIN_CHARS characters. */}
      {hasQuery && (
        <div className="rounded-xl border border-[#E0E1E6] bg-white overflow-hidden">
          {!canSearch || isFetching ? (
            <div className="flex items-center gap-2 px-3 py-3 text-xs text-[#8E8E93]">
              <Loader2 size={14} className="animate-spin text-[#5850DE]" />
              Searching…
            </div>
          ) : isError ? (
            <div className="flex items-center justify-between px-3 py-3">
              <span className="text-xs text-red-500">
                Couldn't load products.
              </span>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : results.length === 0 ? (
            <p className="px-3 py-3 text-xs text-[#8E8E93]">
              No products found for “{debounced}”.
            </p>
          ) : (
            <>
              <ul className="max-h-64 overflow-y-auto divide-y divide-[#F0F0F3]">
                {results.map((product) => (
                  <li key={product.id}>
                    <ProductRow
                      product={product}
                      onSelect={() => select(product)}
                    />
                  </li>
                ))}
              </ul>

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-3 py-2 border-t border-[#E0E1E6] bg-[#FAFAFB]">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page <= 1 || isFetching}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft size={14} />
                    Prev
                  </Button>
                  <span className="text-[11px] font-semibold text-[#60646C]">
                    Page {page} of {totalPages}
                    {data ? ` · ${data.total} results` : ""}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages || isFetching}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="flex items-center gap-1"
                  >
                    Next
                    <ChevronRight size={14} />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SupplementProductPicker;
