"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { FeatureCard } from "./feature-card"
import type { Feature } from "@/app/page"

interface KanbanColumnProps {
  phase: string
  features: Feature[]
  onEditFeature: (feature: Feature) => void
  colorClass: string
  headerColorClass: string
}

export function KanbanColumn({ phase, features, onEditFeature, colorClass, headerColorClass }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: phase,
  })

  return (
    <div className={`flex-shrink-0 w-80 ${colorClass} rounded-lg border-2 p-4 ${isOver ? "ring-2 ring-primary" : ""}`}>
      {/* Column Header */}
      <div className={`${headerColorClass} rounded-lg px-4 py-3 mb-4`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">{phase}</h3>
          <span className="text-sm font-medium bg-white/20 dark:bg-black/20 px-2 py-1 rounded-full">
            {features.length}
          </span>
        </div>
      </div>

      {/* Feature Cards */}
      <div ref={setNodeRef} className="space-y-3 min-h-[400px]">
        <SortableContext items={features.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          {features.length === 0 ? (
            <div className="flex items-center justify-center h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg">
              <p className="text-sm text-muted-foreground">No features in this phase</p>
            </div>
          ) : (
            features.map((feature, index) => (
              <FeatureCard
                key={feature.id}
                feature={feature}
                index={index}
                onEdit={() => onEditFeature(feature)}
                onMove={() => {}}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  )
}
