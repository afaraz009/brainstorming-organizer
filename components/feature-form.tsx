"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight, X } from "lucide-react"
import type { Feature } from "@/app/page"

interface EditableComponentItemProps {
  component: string
  index: number
  onUpdate: (newComponent: string) => void
  onRemove: () => void
}

function EditableComponentItem({ component, onUpdate, onRemove }: EditableComponentItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(component)

  const handleSave = () => {
    if (editValue.trim() && editValue.trim() !== component) {
      onUpdate(editValue.trim())
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(component)
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
      <div className="flex items-center gap-2 flex-1">
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="flex-1 h-7 text-sm"
          autoFocus
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
    )
  }

  return (
    <div className="flex items-center justify-between flex-1 group">
      <span
        className="flex-1 cursor-pointer hover:bg-muted/50 px-1 py-0.5 rounded text-sm"
        onClick={() => setIsEditing(true)}
      >
        {component}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  )
}

interface FeatureFormProps {
  feature?: Feature | null
  existingPhases: string[]
  allTags: string[]
  onSave: (feature: Omit<Feature, "id"> | Feature) => void
  onCancel: () => void
}

export function FeatureForm({ feature, existingPhases, allTags, onSave, onCancel }: FeatureFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [userProblem, setUserProblem] = useState("")
  const [keyComponents, setKeyComponents] = useState<string[]>([])
  const [componentInput, setComponentInput] = useState("")
  const [phase, setPhase] = useState("")
  const [newPhase, setNewPhase] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEditing = !!feature

  // Collapsible states - Keep everything collapsed by default except title
  const [detailsOpen, setDetailsOpen] = useState(false)

  useEffect(() => {
    if (feature) {
      setTitle(feature.title)
      setDescription(feature.description || "")
      setUserProblem(feature["User Problem"] || "")
      setKeyComponents(feature.KeyComponents || [])
      setPhase(feature.phase)
      setTags(feature.tags || [])
    } else {
      // Reset form for new feature
      setTitle("")
      setDescription("")
      setUserProblem("")
      setKeyComponents([])
      setComponentInput("")
      setPhase("")
      setNewPhase("")
      setTags([])
      setTagInput("")
      setTagPopoverOpen(false)
    }
    setErrors({})
  }, [feature])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) {
      newErrors.title = "Title is required"
    }


    const selectedPhase = phase === "new" ? newPhase : phase
    if (!selectedPhase.trim()) {
      newErrors.phase = "Phase is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim()
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag])
      setTagInput("")
    }
  }

  const handleTagToggle = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag))
    } else {
      setTags([...tags, tag])
    }
  }

  const handleAddComponent = () => {
    const trimmedComponent = componentInput.trim()
    if (trimmedComponent && !keyComponents.includes(trimmedComponent)) {
      setKeyComponents([...keyComponents, trimmedComponent])
      setComponentInput("")
    }
  }

  const handleRemoveComponent = (componentToRemove: string) => {
    setKeyComponents(keyComponents.filter((component) => component !== componentToRemove))
  }

  const handleComponentInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      handleAddComponent()
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const selectedPhase = phase === "new" ? newPhase : phase
    const featureData = {
      title: title.trim(),
      description: description.trim(),
      "User Problem": userProblem.trim(),
      KeyComponents: keyComponents,
      phase: selectedPhase.trim(),
      tags,
    }

    if (isEditing && feature) {
      onSave({ ...feature, ...featureData })
    } else {
      onSave(featureData)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Feature" : "Add New Feature"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the feature details. Only title is required." : "Create a new feature. Only title is required."}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title - Always visible */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleSubmit(e as any)
                  }
                }}
                placeholder="Enter feature title"
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
            </div>

            {/* Details Section - Combines all other fields */}
            <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
              <CollapsibleTrigger asChild>
                <Button type="button" variant="ghost" className="w-full justify-between p-0 h-auto">
                  <h3 className="text-sm font-medium">Details</h3>
                  {detailsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 mt-4">
                {/* Phase */}
                <div className="space-y-2">
                  <Label htmlFor="phase">Phase *</Label>
                  <Select value={phase} onValueChange={setPhase}>
                    <SelectTrigger className={errors.phase ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select a phase" />
                    </SelectTrigger>
                    <SelectContent>
                      {existingPhases.map((existingPhase) => (
                        <SelectItem key={existingPhase} value={existingPhase}>
                          {existingPhase}
                        </SelectItem>
                      ))}
                      <SelectItem value="new">+ Create New Phase</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.phase && <p className="text-sm text-destructive">{errors.phase}</p>}
                </div>

                {/* New Phase Input */}
                {phase === "new" && (
                  <div className="space-y-2">
                    <Label htmlFor="newPhase">New Phase Name</Label>
                    <Input
                      id="newPhase"
                      value={newPhase}
                      onChange={(e) => setNewPhase(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleSubmit(e as any)
                        }
                      }}
                      placeholder="Enter new phase name"
                      className={errors.phase ? "border-destructive" : ""}
                    />
                  </div>
                )}

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        e.preventDefault()
                        handleSubmit(e as any)
                      }
                    }}
                    placeholder="Describe the feature"
                    rows={3}
                    className={errors.description ? "border-destructive" : ""}
                  />
                  {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                </div>

                {/* User Problem */}
                <div className="space-y-2">
                  <Label htmlFor="userProblem">User Problem</Label>
                  <Textarea
                    id="userProblem"
                    value={userProblem}
                    onChange={(e) => setUserProblem(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        e.preventDefault()
                        handleSubmit(e as any)
                      }
                    }}
                    placeholder="What user problem does this solve?"
                    rows={2}
                  />
                </div>

                {/* Key Components */}
                <div className="space-y-2">
                  <Label htmlFor="components">Key Components</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        id="components"
                        value={componentInput}
                        onChange={(e) => setComponentInput(e.target.value)}
                        onKeyDown={handleComponentInputKeyDown}
                        placeholder="Add a key component"
                        className="flex-1"
                      />
                      <Button type="button" onClick={handleAddComponent} variant="outline" size="sm">
                        Add
                      </Button>
                    </div>
                    {keyComponents.length > 0 && (
                      <ul className="space-y-1 bg-muted/30 p-3 rounded-md">
                        {keyComponents.map((component, index) => (
                          <li key={index} className="flex items-start group">
                            <span className="mr-2 mt-0.5">•</span>
                            <EditableComponentItem
                              component={component}
                              index={index}
                              onUpdate={(newComponent) => {
                                const newComponents = [...keyComponents]
                                newComponents[index] = newComponent
                                setKeyComponents(newComponents)
                              }}
                              onRemove={() => handleRemoveComponent(component)}
                            />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Add key components or technologies needed for this feature
                  </p>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <div className="space-y-2">
                    <Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={tagPopoverOpen}
                          className="w-full justify-between"
                          type="button"
                        >
                          {tags.length > 0 ? `${tags.length} tag${tags.length > 1 ? 's' : ''} selected` : "Select tags..."}
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                        <div className="max-h-60 overflow-y-auto">
                          <div className="p-2">
                            <div className="flex gap-2 mb-2">
                              <Input
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleTagInputKeyDown}
                                placeholder="Add custom tag..."
                                className="flex-1 h-8"
                              />
                              <Button type="button" onClick={handleAddTag} size="sm" className="h-8">
                                Add
                              </Button>
                            </div>
                          </div>
                          <div className="border-t">
                            {allTags.map((tag) => (
                              <div
                                key={tag}
                                className="flex items-center space-x-2 p-2 hover:bg-accent cursor-pointer"
                                onClick={() => handleTagToggle(tag)}
                              >
                                <Checkbox
                                  id={tag}
                                  checked={tags.includes(tag)}
                                  onChange={() => handleTagToggle(tag)}
                                />
                                <label htmlFor={tag} className="text-sm cursor-pointer flex-1">
                                  {tag}
                                </label>
                              </div>
                            ))}
                            {allTags.length === 0 && (
                              <div className="p-2 text-sm text-muted-foreground text-center">
                                No existing tags. Add custom tags above.
                              </div>
                            )}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                            {tag}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveTag(tag)}
                              className="h-auto p-0 hover:bg-transparent"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Select from existing tags or add custom ones
                  </p>
                </div>
              </CollapsibleContent>
            </Collapsible>

          </form>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit}>{isEditing ? "Update Feature" : "Add Feature"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
