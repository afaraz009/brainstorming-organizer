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
import { X } from "lucide-react"
import type { Feature } from "@/app/page"

interface FeatureFormProps {
  feature?: Feature | null
  existingPhases: string[]
  onSave: (feature: Omit<Feature, "id"> | Feature) => void
  onCancel: () => void
}

export function FeatureForm({ feature, existingPhases, onSave, onCancel }: FeatureFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [phase, setPhase] = useState("")
  const [newPhase, setNewPhase] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEditing = !!feature

  useEffect(() => {
    if (feature) {
      setTitle(feature.title)
      setDescription(feature.description)
      setPhase(feature.phase)
      setTags(feature.tags)
    } else {
      // Reset form for new feature
      setTitle("")
      setDescription("")
      setPhase("")
      setNewPhase("")
      setTags([])
      setTagInput("")
    }
    setErrors({})
  }, [feature])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) {
      newErrors.title = "Title is required"
    }

    if (!description.trim()) {
      newErrors.description = "Description is required"
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
            {isEditing ? "Update the feature details below." : "Fill in the details for your new feature."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter feature title"
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the feature"
              rows={3}
              className={errors.description ? "border-destructive" : ""}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>

          {/* Phase */}
          <div className="space-y-2">
            <Label htmlFor="phase">Phase</Label>
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
                placeholder="Enter new phase name"
                className={errors.phase ? "border-destructive" : ""}
              />
            </div>
          )}

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="Type a tag and press Enter"
                  className="flex-1"
                />
                <Button type="button" onClick={handleAddTag} variant="outline" size="sm">
                  Add
                </Button>
              </div>
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
              Type tags separated by commas or press Enter to add them individually
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">{isEditing ? "Update Feature" : "Add Feature"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
