"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

interface FilterState {
  radius: number
  verifiedOnly: boolean
  deliveryOnly: boolean
  minPrice: string
  maxPrice: string
}

interface FilterSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
}

const radiusOptions = [
  { value: 0, label: "Any" },
  { value: 1, label: "<1km" },
  { value: 5, label: "<5km" },
  { value: 10, label: "<10km" },
]

export function FilterSheet({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
}: FilterSheetProps) {
  const handleApply = () => {
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-[22px] font-extrabold">Filter</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-4">
          {/* Distance */}
          <div>
            <label className="text-[10px] font-extrabold tracking-widest text-ink-3 uppercase mb-2 block">
              Distance
            </label>
            <div className="flex gap-2 flex-wrap">
              {radiusOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onFiltersChange({ ...filters, radius: opt.value })}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-colors ${
                    filters.radius === opt.value
                      ? "bg-primary text-white"
                      : "bg-background border border-border text-ink-2"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Verified Only */}
          <div>
            <label className="text-[10px] font-extrabold tracking-widest text-ink-3 uppercase mb-2 block">
              Verified only
            </label>
            <div className="flex items-center justify-between bg-background rounded-md p-3 border border-border">
              <span className="text-[13px] font-bold">Show only ID-verified sellers</span>
              <button
                onClick={() => onFiltersChange({ ...filters, verifiedOnly: !filters.verifiedOnly })}
                className={`toggle ${filters.verifiedOnly ? "on" : ""}`}
              />
            </div>
          </div>

          {/* Delivery Only */}
          <div>
            <label className="text-[10px] font-extrabold tracking-widest text-ink-3 uppercase mb-2 block">
              Delivery
            </label>
            <div className="flex items-center justify-between bg-background rounded-md p-3 border border-border">
              <span className="text-[13px] font-bold">Delivery available only</span>
              <button
                onClick={() => onFiltersChange({ ...filters, deliveryOnly: !filters.deliveryOnly })}
                className={`toggle ${filters.deliveryOnly ? "on" : ""}`}
              />
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="text-[10px] font-extrabold tracking-widest text-ink-3 uppercase mb-2 block">
              Price range
            </label>
            <div className="flex gap-2.5">
              <input
                type="number"
                placeholder="Min GHS"
                value={filters.minPrice}
                onChange={(e) => onFiltersChange({ ...filters, minPrice: e.target.value })}
                className="flex-1 bg-background border border-border rounded-md px-3.5 py-3 text-sm outline-none focus:border-primary transition-colors"
              />
              <input
                type="number"
                placeholder="Max GHS"
                value={filters.maxPrice}
                onChange={(e) => onFiltersChange({ ...filters, maxPrice: e.target.value })}
                className="flex-1 bg-background border border-border rounded-md px-3.5 py-3 text-sm outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleApply}
          className="w-full bg-primary text-white py-3.5 rounded-md font-black text-[15px] mt-5 transition-all active:scale-[0.98]"
        >
          Apply Filters
        </button>
      </SheetContent>
    </Sheet>
  )
}
