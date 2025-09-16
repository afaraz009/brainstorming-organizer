"use client"

import { useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, GripVertical } from "lucide-react"
import type { Feature } from "@/app/page"
import { getTagColor } from "@/lib/tag-colors"

interface FeatureCardProps {
  feature: Feature
  index: number
  onEdit: () => void
  onView: () => void
  onMove: (featureId: string, newPhase: string, newIndex: number) => void
  isDragging?: boolean
}

export function FeatureCard({ feature, onEdit, onView, isDragging = false }: FeatureCardProps) {
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: feature.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isCurrentlyDragging = isDragging || isSortableDragging

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation()

    // Clear any existing timeout
    if (clickTimeout) {
      clearTimeout(clickTimeout)
      setClickTimeout(null)
    }

    // Set timeout for single click
    const timeout = setTimeout(() => {
      onView()
      setClickTimeout(null)
    }, 200)

    setClickTimeout(timeout)
  }

  const handleCardDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()

    // Clear single click timeout
    if (clickTimeout) {
      clearTimeout(clickTimeout)
      setClickTimeout(null)
    }

    // Execute double click action immediately
    onEdit()
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`bg-card shadow-sm shadow-gray-200/60 dark:shadow-gray-800/60 hover:shadow-lg hover:shadow-gray-200/80 dark:hover:shadow-gray-800/80 hover:-translate-y-1 transition-all duration-200 cursor-pointer group border border-border/50 ${
        isCurrentlyDragging ? "opacity-50 shadow-lg" : ""
      }`}
      onClick={handleCardClick}
      onDoubleClick={handleCardDoubleClick}
      {...attributes}
      {...listeners}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold leading-tight break-words flex-1">
            {feature.title}
          </CardTitle>
          <div className="flex items-center gap-1 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
            >
              <Edit className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="text-xs text-muted-foreground mb-2 text-pretty font-normal">
          {feature.description || "Click to add description..."}
        </CardDescription>

        {feature.tags && feature.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {feature.tags.map((tag) => (
              <span
                key={tag}
                className={`text-xs font-medium px-2.5 py-1 rounded-full border shadow-sm transition-transform hover:scale-105 ${getTagColor(tag)}`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
