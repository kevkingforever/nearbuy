"use client"

import Link from "next/link"
import type { CategoryResponse } from "@/lib/api/types"

interface CategoryGridProps {
  categories: CategoryResponse[]
}

const categoryIcons: Record<string, string> = {
  electronics: "📱",
  vehicles: "🚗",
  property: "🏠",
  "property-land": "🏠",
  fashion: "👗",
  farm: "🌾",
  "farm-produce": "🌾",
  furniture: "🛋️",
  "furniture-home": "🛋️",
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  // Show max 6 categories in grid
  const displayCategories = categories.slice(0, 6)

  return (
    <div className="grid grid-cols-3 gap-2 px-5 pb-4">
      {displayCategories.map((category) => (
        <Link
          key={category.id}
          href={`/browse?category=${category.slug}`}
          className="bg-card border border-border rounded-md py-3.5 px-2 text-center shadow-sm transition-all active:scale-[0.96]"
        >
          <div className="text-[22px] mb-1">
            {categoryIcons[category.slug.toLowerCase()] || "📦"}
          </div>
          <div className="text-[10px] font-extrabold text-ink-3">
            {category.name}
          </div>
        </Link>
      ))}
    </div>
  )
}
