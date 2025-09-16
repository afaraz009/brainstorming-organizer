"use client"

import { useState } from "react"
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable"
import { KanbanColumn } from "./kanban-column"
import { FeatureCard } from "./feature-card"
import type { Feature } from "@/app/page"

interface KanbanBoardProps {
  features: Feature[]
  onFeatureMove: (featureId: string, newPhase: string, newIndex: number) => void
  onColumnReorder: (phases: string[]) => void
  onEditFeature: (feature: Feature) => void
  onViewFeature: (feature: Feature) => void
  onAddFeature: (title: string, phase: string) => void
  columnOrder?: string[]
}

export function KanbanBoard({ features, onFeatureMove, onColumnReorder, onEditFeature, onViewFeature, onAddFeature, columnOrder }: KanbanBoardProps) {
  const [activeFeature, setActiveFeature] = useState<Feature | null>(null)
  const [activeColumn, setActiveColumn] = useState<string | null>(null)

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  // Get unique phases and group features by phase
  const detectedPhases = Array.from(new Set(features.map((f) => f.phase)))
  const phases = columnOrder && columnOrder.length > 0 ? columnOrder : detectedPhases
  const featuresByPhase = phases.reduce(
    (acc, phase) => {
      acc[phase] = features.filter((f) => f.phase === phase)
      return acc
    },
    {} as Record<string, Feature[]>,
  )

  // Color mapping for different phases - muted for better card contrast
  const getPhaseColor = (phase: string, index: number) => {
    const colors = [
      "bg-blue-50/40 border-blue-200/50 dark:bg-blue-950/5 dark:border-blue-900/30",
      "bg-amber-50/40 border-amber-200/50 dark:bg-amber-950/5 dark:border-amber-900/30",
      "bg-green-50/40 border-green-200/50 dark:bg-green-950/5 dark:border-green-900/30",
      "bg-purple-50/40 border-purple-200/50 dark:bg-purple-950/5 dark:border-purple-900/30",
      "bg-rose-50/40 border-rose-200/50 dark:bg-rose-950/5 dark:border-rose-900/30",
      "bg-cyan-50/40 border-cyan-200/50 dark:bg-cyan-950/5 dark:border-cyan-900/30",
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
    const activeId = event.active.id as string

    // Check if we're dragging a feature or a column
    const feature = features.find((f) => f.id === activeId)
    if (feature) {
      setActiveFeature(feature)
    } else if (phases.includes(activeId)) {
      setActiveColumn(activeId)
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // If we're dragging a column, don't do anything here
    if (phases.includes(activeId)) return

    // Find the active feature
    const activeFeature = features.find((f) => f.id === activeId)
    if (!activeFeature) return

    // Determine if we're dragging over a column or another feature
    const isOverColumn = phases.includes(overId)
    const targetPhase = isOverColumn ? overId : features.find((f) => f.id === overId)?.phase

    if (!targetPhase || targetPhase === activeFeature.phase) {
      return
    }

    // Optimistically update the feature's phase
    onFeatureMove(activeId, targetPhase, 999) // Use a high index to move to the end
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveFeature(null)
    setActiveColumn(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Handle column reordering
    if (phases.includes(activeId)) {
      if (phases.includes(overId) && activeId !== overId) {
        const oldIndex = phases.indexOf(activeId)
        const newIndex = phases.indexOf(overId)

        const newPhases = [...phases]
        newPhases.splice(oldIndex, 1)
        newPhases.splice(newIndex, 0, activeId)

        onColumnReorder(newPhases)
      }
      return
    }

    // Handle feature movement
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
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {/* Change from flex to grid for responsiveness */}
        <div className="flex gap-6 overflow-x-auto justify-start">
          <SortableContext items={phases} strategy={horizontalListSortingStrategy}>
            {phases.map((phase, index) => (
              <KanbanColumn
                key={phase}
                phase={phase}
                features={featuresByPhase[phase]}
                onEditFeature={onEditFeature}
                onViewFeature={onViewFeature}
                onAddFeature={onAddFeature}
                colorClass={getPhaseColor(phase, index)}
                headerColorClass={getPhaseHeaderColor(phase, index)}
              />
            ))}
          </SortableContext>
        </div>

        <DragOverlay>
          {activeFeature ? (
            <div className="rotate-3 opacity-90">
              <FeatureCard feature={activeFeature} index={0} onEdit={() => {}} onView={() => {}} onMove={() => {}} isDragging />
            </div>
          ) : activeColumn ? (
            <div className="rotate-3 opacity-90">
              <KanbanColumn
                phase={activeColumn}
                features={featuresByPhase[activeColumn] || []}
                onEditFeature={() => {}}
                onViewFeature={() => {}}
                onAddFeature={() => {}}
                colorClass={getPhaseColor(activeColumn, phases.indexOf(activeColumn))}
                headerColorClass={getPhaseHeaderColor(activeColumn, phases.indexOf(activeColumn))}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
