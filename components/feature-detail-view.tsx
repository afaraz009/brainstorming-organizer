"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Edit, X, ChevronLeft, ChevronRight, Pin, PinOff, Save, Plus, Trash2 } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import type { Feature } from "@/app/page"
import { getTagColor } from "@/lib/tag-colors"

interface EditableFlowItemProps {
  flow: string
  index: number
  onUpdate: (newFlow: string) => void
  onRemove: () => void
}

function EditableFlowItem({ flow, index, onUpdate, onRemove }: EditableFlowItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(flow)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  const handleSave = () => {
    if (editValue.trim() && editValue.trim() !== flow) {
      onUpdate(editValue.trim())
    }
    setIsEditing(false)
    setEditValue(flow)
  }

  const handleCancel = () => {
    setEditValue(flow)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSave()
    } else if (e.key === "Escape") {
      e.preventDefault()
      handleCancel()
    }
  }

  if (isEditing) {
    return (
      <li className="flex items-start">
        <span className="mr-2">{index + 1}.</span>
        <div className="flex items-center gap-2 flex-1">
          <Input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className="flex-1 h-7 text-sm"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleSave}
            className="h-7 w-7 p-0"
          >
            ✓
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="h-7 w-7 p-0"
          >
            ✕
          </Button>
        </div>
      </li>
    )
  }

  return (
    <li className="flex items-start group">
      <span className="mr-2">{index + 1}.</span>
      <span
        className="flex-1 cursor-pointer hover:bg-muted/50 px-1 py-0.5 rounded text-sm"
        onClick={() => setIsEditing(true)}
      >
        {flow}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
      >
        <X className="h-3 w-3" />
      </Button>
    </li>
  )
}

interface FeatureDetailViewProps {
  feature: Feature | null
  isOpen: boolean
  onClose: () => void
  onEdit: () => void
  onSave?: (feature: Feature) => void
  allFeatures?: Feature[]
  onNavigate?: (feature: Feature) => void
  onFeatureUpdate?: (feature: Feature) => void
}

export function FeatureDetailView({ feature, isOpen, onClose, onEdit, onSave, allFeatures = [], onNavigate, onFeatureUpdate }: FeatureDetailViewProps) {
  const [width, setWidth] = useState(480)
  const [isResizing, setIsResizing] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedFeature, setEditedFeature] = useState<Feature | null>(null)
  const [localFeature, setLocalFeature] = useState<Feature | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Update local feature when feature prop changes
  useEffect(() => {
    setLocalFeature(feature)
    if (feature) {
      setEditedFeature({ ...feature })
      setIsEditing(false)
    }
  }, [feature])

  const handleUpdateUserFlow = (index: number, newFlow: string) => {
    if (!localFeature || !onFeatureUpdate) return

    const updatedFeature = {
      ...localFeature,
      "User Flow": localFeature["User Flow"]?.map((flow, i) => i === index ? newFlow : flow) || []
    }
    setLocalFeature(updatedFeature)
    onFeatureUpdate(updatedFeature)
  }

  const handleRemoveUserFlow = (index: number) => {
    if (!localFeature || !onFeatureUpdate) return

    const updatedFeature = {
      ...localFeature,
      "User Flow": localFeature["User Flow"]?.filter((_, i) => i !== index) || []
    }
    setLocalFeature(updatedFeature)
    onFeatureUpdate(updatedFeature)
  }
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

  const handleEdit = () => {
    if (onSave && feature) {
      setIsEditing(true)
      setEditedFeature({ ...feature })
    } else {
      onEdit()
      onClose()
    }
  }

  const handleSave = () => {
    if (editedFeature && onSave) {
      onSave(editedFeature)
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedFeature(feature ? { ...feature } : null)
  }

  const handleAddFlowItem = () => {
    if (editedFeature) {
      setEditedFeature({
        ...editedFeature,
        "User Flow": [...(editedFeature["User Flow"] || []), ""]
      })
    }
  }

  const handleRemoveFlowItem = (index: number) => {
    if (editedFeature) {
      setEditedFeature({
        ...editedFeature,
        "User Flow": (editedFeature["User Flow"] || []).filter((_, i) => i !== index)
      })
    }
  }

  const handleAddComponent = () => {
    if (editedFeature) {
      setEditedFeature({
        ...editedFeature,
        KeyComponents: [...(editedFeature.KeyComponents || []), ""]
      })
    }
  }

  const handleRemoveComponent = (index: number) => {
    if (editedFeature) {
      setEditedFeature({
        ...editedFeature,
        KeyComponents: (editedFeature.KeyComponents || []).filter((_, i) => i !== index)
      })
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
      // Don't interfere if user is typing in an input field
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return
      }

      if (e.key === 'ArrowLeft' && canGoBack) {
        e.preventDefault()
        handlePrevious()
      } else if (e.key === 'ArrowRight' && canGoForward) {
        e.preventDefault()
        handleNext()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, canGoBack, canGoForward, handlePrevious, handleNext, onEdit, onClose, feature])

  if (!localFeature) return null

  if (!isOpen) return null

  return (
    <div
      ref={modalRef}
      className={`fixed top-0 right-0 h-full bg-background border-l border-border shadow-xl z-40 overflow-y-auto ${isResizing ? 'select-none' : ''}`}
      style={{ width: `${width}px` }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-border cursor-col-resize hover:bg-primary/50" onMouseDown={handleMouseDown} />
      <div className="p-6 pr-8">
          <div className="flex items-start justify-between mb-4">
            {isEditing && editedFeature ? (
              <Input
                value={editedFeature.title}
                onChange={(e) => setEditedFeature({ ...editedFeature, title: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleSave()
                  } else if (e.key === 'Escape') {
                    e.preventDefault()
                    handleCancel()
                  }
                }}
                className="text-lg font-semibold border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="Feature title"
              />
            ) : (
              <h2 className="text-lg font-semibold pr-8 break-words">{localFeature?.title}</h2>
            )}
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSave}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              )}
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
                  {localFeature.phase.replace("Phase ", "")}
                </Badge>
              </div>
            </div>
          )}

          {/* Keyboard shortcuts hint */}
          {allFeatures.length > 1 && (
            <div className="text-xs text-muted-foreground text-center py-2 border-t border-border/30 mb-4">
              ←→ Navigate • Esc: Close • Enter: Save (when editing)
            </div>
          )}

        <div className="space-y-6 mt-4">

          {/* Description */}
          {(isEditing || localFeature?.description) && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
              {isEditing && editedFeature ? (
                <Textarea
                  value={editedFeature.description || ""}
                  onChange={(e) => setEditedFeature({ ...editedFeature, description: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      e.preventDefault()
                      handleSave()
                    } else if (e.key === 'Escape') {
                      e.preventDefault()
                      handleCancel()
                    }
                  }}
                  className="text-sm leading-relaxed min-h-[80px]"
                  placeholder="Feature description"
                />
              ) : (
                <p className="text-sm leading-relaxed">{localFeature?.description}</p>
              )}
            </div>
          )}

          {/* User Problem */}
          {(isEditing || localFeature?.["User Problem"]) && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">User Problem</h3>
              {isEditing && editedFeature ? (
                <Textarea
                  value={editedFeature["User Problem"] || ""}
                  onChange={(e) => setEditedFeature({ ...editedFeature, "User Problem": e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      e.preventDefault()
                      handleSave()
                    } else if (e.key === 'Escape') {
                      e.preventDefault()
                      handleCancel()
                    }
                  }}
                  className="text-sm leading-relaxed min-h-[80px] bg-muted/50"
                  placeholder="What user problem does this feature solve?"
                />
              ) : (
                <div className="text-sm leading-relaxed bg-muted/50 p-3 rounded-md">
                  {localFeature?.["User Problem"]}
                </div>
              )}
            </div>
          )}

          {/* User Flow */}
          {(isEditing || (localFeature && localFeature["User Flow"] && localFeature["User Flow"].length > 0)) && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">User Flow</h3>
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAddFlowItem}
                    className="h-8 px-2 flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Add Step
                  </Button>
                )}
              </div>
              {isEditing && editedFeature ? (
                <div className="space-y-2">
                  {(editedFeature["User Flow"] || []).map((flow, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-sm mt-2 text-muted-foreground min-w-[20px]">{index + 1}.</span>
                      <Input
                        value={flow}
                        onChange={(e) => {
                          const newFlow = [...(editedFeature["User Flow"] || [])]
                          newFlow[index] = e.target.value
                          setEditedFeature({ ...editedFeature, "User Flow": newFlow })
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleSave()
                          } else if (e.key === 'Escape') {
                            e.preventDefault()
                            handleCancel()
                          }
                        }}
                        className="text-sm flex-1"
                        placeholder="User flow step"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFlowItem(index)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <ol className="text-sm leading-relaxed space-y-1">
                  {localFeature?.["User Flow"]?.map((flow, index) => (
                    <EditableFlowItem
                      key={index}
                      flow={flow}
                      index={index}
                      onUpdate={(newFlow) => handleUpdateUserFlow(index, newFlow)}
                      onRemove={() => handleRemoveUserFlow(index)}
                    />
                  ))}
                </ol>
              )}
            </div>
          )}

          {/* Key Components */}
          {(isEditing || (localFeature?.KeyComponents && localFeature.KeyComponents.length > 0)) && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Key Components</h3>
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAddComponent}
                    className="h-8 px-2 flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Add Component
                  </Button>
                )}
              </div>
              {isEditing && editedFeature ? (
                <div className="space-y-2">
                  {(editedFeature.KeyComponents || []).map((component, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-sm mt-2 text-muted-foreground">•</span>
                      <Input
                        value={component}
                        onChange={(e) => {
                          const newComponents = [...(editedFeature.KeyComponents || [])]
                          newComponents[index] = e.target.value
                          setEditedFeature({ ...editedFeature, KeyComponents: newComponents })
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleSave()
                          } else if (e.key === 'Escape') {
                            e.preventDefault()
                            handleCancel()
                          }
                        }}
                        className="text-sm flex-1"
                        placeholder="Key component"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveComponent(index)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <ul className="text-sm leading-relaxed space-y-1">
                  {localFeature?.KeyComponents?.map((component, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{component}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Tags */}
          {localFeature?.tags && localFeature.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {localFeature.tags.map((tag) => (
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