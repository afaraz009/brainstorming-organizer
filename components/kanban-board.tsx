"use client"

import { useState } from "react"
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { KanbanColumn } from "./kanban-column"
import { FeatureCard } from "./feature-card"
import type { Feature } from "@/app/page"

interface KanbanBoardProps {
  features: Feature[]
  onFeatureMove: (featureId: string, newPhase: string, newIndex: number) => void
  onEditFeature: (feature: Feature) => void
}

export function KanbanBoard({ features, onFeatureMove, onEditFeature }: KanbanBoardProps) {
  const [activeFeature, setActiveFeature] = useState<Feature | null>(null)

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  // Get unique phases and group features by phase
  const phases = Array.from(new Set(features.map((f) => f.phase)))
  const featuresByPhase = phases.reduce(
    (acc, phase) => {
      acc[phase] = features.filter((f) => f.phase === phase)
      return acc
    },
    {} as Record<string, Feature[]>,
  )

  // Color mapping for different phases
  const getPhaseColor = (phase: string, index: number) => {
    const colors = [
      "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800",
      "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800",
      "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800",
      "bg-purple-50 border-purple-200 dark:bg-purple-950/20 dark:border-purple-800",
      "bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-800",
      "bg-cyan-50 border-cyan-200 dark:bg-cyan-950/20 dark:border-cyan-800",
    ]
    return colors[index % colors.length]
  }

  const getPhaseHeaderColor = (phase: string, index: number) => {
    const colors = [
      "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-100",
      "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-100",
      "bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-100",
      "bg-purple-100 text-purple-900 dark:bg-purple-900/30 dark:text-purple-100",
      "bg-rose-100 text-rose-900 dark:bg-rose-900/30 dark:text-rose-100",
      "bg-cyan-100 text-cyan-900 dark:bg-cyan-900/30 dark:text-cyan-100",
    ]
    return colors[index % colors.length]
  }

  const handleDragStart = (event: DragStartEvent) => {
    const feature = features.find((f) => f.id === event.active.id)
    setActiveFeature(feature || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveFeature(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Find the active feature
    const activeFeature = features.find((f) => f.id === activeId)
    if (!activeFeature) return

    // Determine if we're dropping on a column or another feature
    const isOverColumn = phases.includes(overId)
    const targetPhase = isOverColumn ? overId : features.find((f) => f.id === overId)?.phase

    if (!targetPhase) return

    // If dropping in the same position, do nothing
    if (activeFeature.phase === targetPhase && activeId === overId) return

    // Calculate the new index
    const targetFeatures = features.filter((f) => f.phase === targetPhase)
    let newIndex = targetFeatures.length

    if (!isOverColumn) {
      // Dropping on another feature
      const overFeature = features.find((f) => f.id === overId)
      if (overFeature) {
        newIndex = targetFeatures.findIndex((f) => f.id === overId)
        // If moving within the same phase, adjust for the removal
        if (activeFeature.phase === targetPhase) {
          const activeIndex = targetFeatures.findIndex((f) => f.id === activeId)
          if (activeIndex < newIndex) {
            newIndex -= 1
          }
        }
      }
    }

    onFeatureMove(activeId, targetPhase, newIndex)
  }

  if (phases.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/25">
        <div className="text-center">
          <p className="text-lg font-medium text-muted-foreground mb-2">No features to display</p>
          <p className="text-sm text-muted-foreground">
            {features.length === 0 ? "Add some features to get started" : "No features match the current filter"}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4 min-h-[500px]">
          {phases.map((phase, index) => (
            <KanbanColumn
              key={phase}
              phase={phase}
              features={featuresByPhase[phase]}
              onEditFeature={onEditFeature}
              colorClass={getPhaseColor(phase, index)}
              headerColorClass={getPhaseHeaderColor(phase, index)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeFeature ? (
            <div className="rotate-3 opacity-90">
              <FeatureCard feature={activeFeature} index={0} onEdit={() => {}} onMove={() => {}} isDragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
