"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, X, ChevronLeft, ChevronRight, Pin, PinOff } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import type { Feature } from "@/app/page"

// Tag color mapping - same as in feature-card.tsx
const getTagColor = (tag: string) => {
  const tagLower = tag.toLowerCase()

  // Priority/Status tags
  if (tagLower.includes('mvp') || tagLower.includes('priority') || tagLower.includes('urgent')) {
    return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700'
  }
  if (tagLower.includes('security') || tagLower.includes('auth') || tagLower.includes('critical')) {
    return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700'
  }
  if (tagLower.includes('feature') || tagLower.includes('enhancement') || tagLower.includes('new')) {
    return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700'
  }
  if (tagLower.includes('backend') || tagLower.includes('api') || tagLower.includes('server')) {
    return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700'
  }
  if (tagLower.includes('frontend') || tagLower.includes('ui') || tagLower.includes('ux')) {
    return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700'
  }
  if (tagLower.includes('testing') || tagLower.includes('qa') || tagLower.includes('test')) {
    return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700'
  }
  if (tagLower.includes('high priority')) {
    return 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-700'
  }

  // Default color
  return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600'
}

interface FeatureDetailViewProps {
  feature: Feature | null
  isOpen: boolean
  onClose: () => void
  onEdit: () => void
  allFeatures?: Feature[]
  onNavigate?: (feature: Feature) => void
}

export function FeatureDetailView({ feature, isOpen, onClose, onEdit, allFeatures = [], onNavigate }: FeatureDetailViewProps) {
  const [width, setWidth] = useState(480)
  const [isResizing, setIsResizing] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  // Navigation logic
  const currentIndex = feature ? allFeatures.findIndex(f => f.id === feature.id) : -1
  const canGoBack = feature ? currentIndex > 0 : false
  const canGoForward = feature ? currentIndex < allFeatures.length - 1 : false

  const handlePrevious = () => {
    if (feature && canGoBack && onNavigate) {
      onNavigate(allFeatures[currentIndex - 1])
    }
  }

  const handleNext = () => {
    if (feature && canGoForward && onNavigate) {
      onNavigate(allFeatures[currentIndex + 1])
    }
  }

  // Resize functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true)
    const startX = e.clientX
    const startWidth = width

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = startWidth - (e.clientX - startX)
      setWidth(Math.max(300, Math.min(800, newWidth)))
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  // Keyboard navigation
  useEffect(() => {
    if (!feature || !isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && canGoBack) {
        e.preventDefault()
        handlePrevious()
      } else if (e.key === 'ArrowRight' && canGoForward) {
        e.preventDefault()
        handleNext()
      } else if (e.key === 'e' || e.key === 'E') {
        e.preventDefault()
        onEdit()
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, canGoBack, canGoForward, handlePrevious, handleNext, onEdit, onClose, feature])

  if (!feature) return null

  if (!isOpen) return null

  if (!isOpen) return null

  return (
    <div
      ref={modalRef}
      className={`fixed top-0 right-0 h-full bg-background border-l border-border shadow-xl z-40 overflow-y-auto ${isResizing ? 'select-none' : ''}`}
      style={{ width: `${width}px` }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-border cursor-col-resize hover:bg-primary/50" onMouseDown={handleMouseDown} />
      <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-lg font-semibold pr-8 truncate">{feature.title}</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onEdit()
                  onClose()
                }}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navigation Controls */}
          {allFeatures.length > 1 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={!canGoBack}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground px-2">
                  {currentIndex + 1} of {allFeatures.length}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNext}
                  disabled={!canGoForward}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Phase Badge */}
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-sm">
                  {feature.phase.replace("Phase ", "")}
                </Badge>
              </div>
            </div>
          )}

          {/* Keyboard shortcuts hint */}
          {allFeatures.length > 1 && (
            <div className="text-xs text-muted-foreground text-center py-2 border-t border-border/30 mb-4">
              ←→ Navigate • E: Edit • Esc: Close
            </div>
          )}

        <div className="space-y-6 mt-4">

          {/* Description */}
          {feature.description && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
              <p className="text-sm leading-relaxed">{feature.description}</p>
            </div>
          )}

          {/* User Problem */}
          {feature["User Problem"] && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">User Problem</h3>
              <div className="text-sm leading-relaxed bg-muted/50 p-3 rounded-md">
                {feature["User Problem"]}
              </div>
            </div>
          )}

          {/* User Flow */}
          {feature["User Flow"] && feature["User Flow"].length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">User Flow</h3>
              <ol className="text-sm leading-relaxed space-y-1">
                {feature["User Flow"].map((flow, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">{index + 1}.</span>
                    <span>{flow}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Key Components */}
          {feature.KeyComponents && feature.KeyComponents.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Key Components</h3>
              <ul className="text-sm leading-relaxed space-y-1">
                {feature.KeyComponents.map((component, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{component}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags */}
          {feature.tags && feature.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {feature.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`text-sm font-medium px-3 py-1.5 rounded-full border shadow-sm ${getTagColor(tag)}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        </div>
    </div>
  )
}