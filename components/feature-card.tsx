"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, GripVertical } from "lucide-react"
import type { Feature } from "@/app/page"

interface FeatureCardProps {
  feature: Feature
  index: number
  onEdit: () => void
  onMove: (featureId: string, newPhase: string, newIndex: number) => void
  isDragging?: boolean
}

export function FeatureCard({ feature, onEdit, isDragging = false }: FeatureCardProps) {
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

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`bg-card hover:shadow-md transition-shadow cursor-pointer group ${
        isCurrentlyDragging ? "opacity-50 shadow-lg" : ""
      }`}
      {...attributes}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base font-medium leading-tight text-balance flex-1">{feature.title}</CardTitle>
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
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 cursor-grab active:cursor-grabbing"
              {...listeners}
            >
              <GripVertical className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="text-sm mb-3 text-pretty">{feature.description}</CardDescription>
        {feature.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {feature.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
