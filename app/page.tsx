"use client"

import { useState } from "react"
import { FileInput } from "@/components/file-input"
import { KanbanBoard } from "@/components/kanban-board"
import { Filter } from "@/components/filter"
import { FeatureForm } from "@/components/feature-form"
import { Button } from "@/components/ui/button"
import { Plus, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export interface Feature {
  id: string
  title: string
  description: string
  tags: string[]
  phase: string
}

export interface ProjectData {
  projectVision: string
  features: Feature[]
}

export default function BrainstormingOrganizer() {
  const [projectData, setProjectData] = useState<ProjectData | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null)
  const { toast } = useToast()

  const handleFileLoad = (data: ProjectData) => {
    setProjectData(data)
  }

  const handleAddFeature = (feature: Omit<Feature, "id">) => {
    if (!projectData) return

    const newFeature: Feature = {
      ...feature,
      id: crypto.randomUUID(),
    }

    setProjectData({
      ...projectData,
      features: [...projectData.features, newFeature],
    })
    setIsFormOpen(false)
  }

  const handleEditFeature = (updatedFeature: Feature) => {
    if (!projectData) return

    setProjectData({
      ...projectData,
      features: projectData.features.map((f) => (f.id === updatedFeature.id ? updatedFeature : f)),
    })
    setEditingFeature(null)
    setIsFormOpen(false)
  }

  const handleExport = () => {
    if (!projectData) return

    try {
      const dataStr = JSON.stringify(projectData, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(dataBlob)

      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-")
      const filename = `brainstorming-data-${timestamp}.json`

      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Export Successful",
        description: `Your brainstorming data has been exported as ${filename}`,
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleFeatureMove = (featureId: string, newPhase: string, newIndexInPhase: number) => {
    setProjectData((currentData) => {
      if (!currentData) return null;

      const features = currentData.features;
      const activeFeature = features.find((f) => f.id === featureId);
      if (!activeFeature) return currentData;

      // Create a new array without the moved feature
      const remainingFeatures = features.filter(f => f.id !== featureId);
      
      // Update the feature's phase
      const updatedFeature = { ...activeFeature, phase: newPhase };

      // Find the list of items in the target phase (from the remaining items)
      const targetPhaseItems = remainingFeatures.filter(f => f.phase === newPhase);

      // Find the item that will be *after* our moved feature
      const targetItem = targetPhaseItems[newIndexInPhase];

      let finalFeatures = [];

      if (!targetItem) {
        // If there's no target item, it means we're inserting at the end of the phase.
        // Find the last item of the target phase in the remainingFeatures array to preserve order.
        const lastItemInPhase = remainingFeatures.findLast(f => f.phase === newPhase);
        if (lastItemInPhase) {
          const insertionPoint = remainingFeatures.findIndex(f => f.id === lastItemInPhase.id) + 1;
          finalFeatures = [
            ...remainingFeatures.slice(0, insertionPoint),
            updatedFeature,
            ...remainingFeatures.slice(insertionPoint)
          ];
        } else {
          // The phase is empty, so we can just append the feature.
          finalFeatures = [...remainingFeatures, updatedFeature];
        }
      } else {
        // We're inserting before the targetItem.
        const insertionPoint = remainingFeatures.findIndex(f => f.id === targetItem.id);
        finalFeatures = [
          ...remainingFeatures.slice(0, insertionPoint),
          updatedFeature,
          ...remainingFeatures.slice(insertionPoint)
        ];
      }

      return { ...currentData, features: finalFeatures };
    });
  };

  const allTags = projectData ? Array.from(new Set(projectData.features.flatMap((f) => f.tags))) : []

  const filteredFeatures =
    projectData?.features.filter(
      (feature) => selectedTags.length === 0 || selectedTags.every((tag) => feature.tags.includes(tag)),
    ) || []

  if (!projectData) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">Brainstorming Organizer</h1>
            <p className="text-muted-foreground text-lg">
              Upload your JSON file to start organizing your ideas on a Kanban board
            </p>
          </div>
          <FileInput onFileLoad={handleFileLoad} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-foreground">Brainstorming Organizer</h1>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setEditingFeature(null)
                  setIsFormOpen(true)
                }}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Feature
              </Button>
              <Button onClick={handleExport} variant="outline" className="flex items-center gap-2 bg-transparent">
                <Download className="w-4 h-4" />
                Export JSON
              </Button>
            </div>
          </div>

          <div className="bg-card p-4 rounded-lg border mb-4">
            <h2 className="text-xl font-semibold text-card-foreground mb-2">Project Vision</h2>
            <p className="text-muted-foreground">{projectData.projectVision}</p>
          </div>

          <Filter allTags={allTags} selectedTags={selectedTags} onTagsChange={setSelectedTags} />
        </div>

        <KanbanBoard
          features={filteredFeatures}
          onFeatureMove={handleFeatureMove}
          onEditFeature={(feature) => {
            setEditingFeature(feature)
            setIsFormOpen(true)
          }}
        />

        {isFormOpen && (
          <FeatureForm
            feature={editingFeature}
            existingPhases={Array.from(new Set(projectData.features.map((f) => f.phase)))}
            onSave={editingFeature ? handleEditFeature : handleAddFeature}
            onCancel={() => {
              setIsFormOpen(false)
              setEditingFeature(null)
            }}
          />
        )}
      </div>
    </div>
  )
}
