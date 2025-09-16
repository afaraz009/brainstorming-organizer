"use client"

import { useState } from "react"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { FeatureCard } from "./feature-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, GripVertical } from "lucide-react"
import type { Feature } from "@/app/page"

interface KanbanColumnProps {
  phase: string
  features: Feature[]
  onEditFeature: (feature: Feature) => void
  onViewFeature: (feature: Feature) => void
  onAddFeature: (title: string, phase: string) => void
  colorClass: string
  headerColorClass: string
}

export function KanbanColumn({ phase, features, onEditFeature, onViewFeature, onAddFeature, colorClass, headerColorClass }: KanbanColumnProps) {
  const [newCardTitle, setNewCardTitle] = useState("")
  const [isAddingCard, setIsAddingCard] = useState(false)

  // Droppable for features
  const { setNodeRef, isOver } = useDroppable({
    id: phase,
  })

  // Sortable for column reordering
  const {
    attributes,
    listeners,
    setNodeRef: setSortableNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: phase,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleAddCard = () => {
    if (newCardTitle.trim()) {
      onAddFeature(newCardTitle.trim(), phase)
      setNewCardTitle("")
      setIsAddingCard(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddCard()
    } else if (e.key === 'Escape') {
      setNewCardTitle("")
      setIsAddingCard(false)
    }
  }

  return (
    <div
      ref={setSortableNodeRef}
      style={style}
      className={`flex-shrink-0 w-64 sm:w-72 md:w-80 xl:flex-1 xl:max-w-96 xl:min-w-72 ${colorClass} rounded-lg border-2 p-4 ${isOver ? "ring-2 ring-primary" : ""} ${isDragging ? "opacity-50" : ""}`}
    >
      {/* Column Header */}
      <div className={`${headerColorClass} rounded-lg px-4 py-3 mb-4 overflow-hidden`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab hover:cursor-grabbing p-1 hover:bg-white/10 dark:hover:bg-black/10 rounded flex-shrink-0"
            >
              <GripVertical className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-lg truncate min-w-0">{phase.replace("Phase ", "").replace(/^[0-9]+:?/, "")}</h3>
          </div>
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
                onView={() => onViewFeature(feature)}
                onMove={() => {}}
              />
            ))
          )}
        </SortableContext>

        {/* Add Card Section */}
        <div className="mt-3">
          {isAddingCard ? (
            <div className="space-y-2 p-3 border-2 border-dashed border-primary/50 rounded-lg bg-card/50">
              <Input
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter card title..."
                autoFocus
                className="text-sm"
              />
              <div className="flex gap-2 justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setNewCardTitle("")
                    setIsAddingCard(false)
                  }}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={handleAddCard} disabled={!newCardTitle.trim()}>
                  Add Card
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground border-2 border-dashed border-transparent hover:border-muted-foreground/25 h-auto py-3"
              onClick={() => setIsAddingCard(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add a card
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
