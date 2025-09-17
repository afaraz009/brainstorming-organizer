"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { FilterIcon, X } from "lucide-react"

interface FilterProps {
  allTags: string[]
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
}

export function Filter({ allTags, selectedTags, onTagsChange }: FilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredTags = allTags.filter((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag))
    } else {
      onTagsChange([...selectedTags, tag])
    }
  }

  const handleClearAll = () => {
    onTagsChange([])
  }

  const handleSelectAll = () => {
    onTagsChange([...allTags])
  }


  if (allTags.length === 0) {
    return (
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="outline" className="flex items-center gap-2 bg-transparent" disabled>
          <FilterIcon className="w-4 h-4" />
          No tags available
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center gap-2 bg-transparent"
          >
            <FilterIcon className="w-4 h-4" />
            Filter by Tags
            {selectedTags.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {selectedTags.length}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Filter by Tags</DialogTitle>
          </DialogHeader>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={handleSelectAll} className="h-auto py-1 px-2 text-xs">
            Select All
          </Button>
          <Button variant="ghost" size="sm" onClick={handleClearAll} className="h-auto py-1 px-2 text-xs">
            Clear All
          </Button>
        </div>

          {/* Search */}
          <div className="relative">
            <Input
              placeholder="Search tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

            {/* Tag List */}
            <div className="max-h-48 overflow-y-auto space-y-2">
              {filteredTags.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {searchTerm ? "No tags match your search" : "No tags available"}
                </p>
              ) : (
                filteredTags.map((tag) => (
                  <div key={tag} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tag-${tag}`}
                      checked={selectedTags.includes(tag)}
                      onCheckedChange={() => handleTagToggle(tag)}
                    />
                    <Label htmlFor={`tag-${tag}`} className="text-sm font-normal cursor-pointer flex-1">
                      {tag}
                    </Label>
                  </div>
                ))
              )}
            </div>

            {selectedTags.length > 0 && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-2">Selected tags:</p>
                <div className="flex flex-wrap gap-1">
                  {selectedTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
        </DialogContent>
      </Dialog>

      {/* Active Filter Display */}
      {selectedTags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Filtering by:</span>
          {selectedTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              {tag}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTagToggle(tag)}
                className="h-auto p-0 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          <Button variant="ghost" size="sm" onClick={handleClearAll} className="h-auto py-1 px-2 text-xs">
            Clear All
          </Button>
        </div>
      )}
    </div>
  )
}
