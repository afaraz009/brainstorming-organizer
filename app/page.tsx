"use client"

import { useState, useEffect, useCallback } from "react"
import { FileInput } from "@/components/file-input"
import { KanbanBoard } from "@/components/kanban-board"
import { Filter } from "@/components/filter"
import { FeatureForm } from "@/components/feature-form"
import { FeatureDetailView } from "@/components/feature-detail-view"
import { Button } from "@/components/ui/button"
import { Plus, Download, Upload, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ThemeToggle } from "@/components/theme-toggle"

export interface Feature {
  id: string
  title: string
  description?: string
  "User Problem"?: string
  "User Flow"?: string[]
  KeyComponents?: string[]
  tags?: string[]
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
  const [viewingFeature, setViewingFeature] = useState<Feature | null>(null)
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false)
  const [columnOrder, setColumnOrder] = useState<string[]>([])
  const [showFileInput, setShowFileInput] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const { toast } = useToast()

  // Debounced save function
  const saveToStorage = useCallback((data: ProjectData) => {
    try {
      const dataToSave = {
        ...data,
        lastModified: new Date().toISOString(),
        version: '1.0'
      }
      localStorage.setItem('brainstorming-data', JSON.stringify(dataToSave))
      setHasUnsavedChanges(false)
      console.log('Data saved to localStorage:', data.features.length, 'features')
    } catch (error) {
      console.warn('Could not save data to localStorage:', error)
      toast({
        title: "Save Failed",
        description: "Changes could not be saved to local storage",
        variant: "destructive",
      })
    }
  }, [toast])

  // Manual save function
  const handleManualSave = () => {
    if (projectData) {
      saveToStorage(projectData)
      toast({
        title: "Changes Saved",
        description: "All changes have been saved to local storage",
      })
    }
  }

  // Auto-save to localStorage whenever projectData changes (debounced)
  useEffect(() => {
    if (projectData) {
      setHasUnsavedChanges(true)
      
      const timeoutId = setTimeout(() => {
        saveToStorage(projectData)
      }, 1000) // Save after 1 second of no changes
      
      return () => clearTimeout(timeoutId)
    }
  }, [projectData, saveToStorage])

  // Load from localStorage on startup
  useEffect(() => {
    const loadFromStorage = () => {
      try {
        const savedData = localStorage.getItem('brainstorming-data')
        if (savedData) {
          const parsedData = JSON.parse(savedData) as ProjectData & { lastModified?: string; version?: string }
          
          // Validate the saved data structure
          if (parsedData.features && Array.isArray(parsedData.features) && parsedData.projectVision) {
            const featuresWithIds = parsedData.features.map((f: Feature, index: number) => ({
              ...f,
              id: f.id || `feature-${index}`
            }))
            
            setProjectData({ 
              projectVision: parsedData.projectVision, 
              features: featuresWithIds 
            })
            
            const phases = Array.from(new Set(featuresWithIds.map((f: Feature) => f.phase)))
            setColumnOrder(phases)
            setHasUnsavedChanges(false) // Data loaded from storage, no unsaved changes
            
            console.log('Data loaded from localStorage:', featuresWithIds.length, 'features')
            
            if (parsedData.lastModified) {
              toast({
                title: "Data Restored",
                description: `Last saved: ${new Date(parsedData.lastModified).toLocaleString()}`,
              })
            }
          } else {
            console.warn('Invalid data structure in localStorage')
            localStorage.removeItem('brainstorming-data')
          }
        }
      } catch (error) {
        console.warn('Could not load data from localStorage:', error)
        localStorage.removeItem('brainstorming-data')
      }
    }

    // Load data on mount
    loadFromStorage()
  }, [])

  // Keyboard shortcut for saving (Ctrl+S / Cmd+S)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault()
        if (projectData && hasUnsavedChanges) {
          handleManualSave()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [projectData, hasUnsavedChanges])

  const handleFileLoad = (data: ProjectData) => {
    const featuresWithIds = data.features.map((f, index) => ({
      ...f,
      id: f.id || `feature-${index}`
    }))
    
    const newProjectData = { ...data, features: featuresWithIds }
    setProjectData(newProjectData)
    
    // Initialize column order based on the phases in the data
    const phases = Array.from(new Set(featuresWithIds.map((f) => f.phase)))
    setColumnOrder(phases)
    
    // Reset all states when loading new file
    setSelectedTags([])
    setIsFormOpen(false)
    setEditingFeature(null)
    setViewingFeature(null)
    setIsDetailViewOpen(false)
    setShowFileInput(false)
    setHasUnsavedChanges(false) // New file loaded, no unsaved changes yet
    
    // Save the new file data to localStorage immediately
    try {
      const dataToSave = {
        ...newProjectData,
        lastModified: new Date().toISOString(),
        version: '1.0'
      }
      localStorage.setItem('brainstorming-data', JSON.stringify(dataToSave))
      console.log('New file data saved to localStorage')
    } catch (error) {
      console.warn('Could not save new file data to localStorage:', error)
    }
    
    toast({
      title: "File Loaded Successfully",
      description: `Loaded ${featuresWithIds.length} features from new file`,
    })
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

    // Add the new phase to column order if it doesn't exist
    if (!columnOrder.includes(newFeature.phase)) {
      setColumnOrder([...columnOrder, newFeature.phase])
    }
  }

  const handleQuickAddFeature = (title: string, phase: string) => {
    if (!projectData) return

    const newFeature: Feature = {
      id: crypto.randomUUID(),
      title,
      description: "",
      "User Problem": "",
      KeyComponents: [],
      tags: [],
      phase,
    }

    setProjectData({
      ...projectData,
      features: [...projectData.features, newFeature],
    })

    // Add the new phase to column order if it doesn't exist
    if (!columnOrder.includes(newFeature.phase)) {
      setColumnOrder([...columnOrder, newFeature.phase])
    }
  }

  const handleEditFeature = (updatedFeature: Feature | Omit<Feature, "id">) => {
    if (!projectData) return

    // This function should only be called with complete Feature objects (with id)
    const featureWithId = updatedFeature as Feature
    setProjectData({
      ...projectData,
      features: projectData.features.map((f) => (f.id === featureWithId.id ? featureWithId : f)),
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

    // Add the new phase to column order if it doesn't exist
    if (!columnOrder.includes(newPhase)) {
      setColumnOrder([...columnOrder, newPhase])
    }
  };

  const handleColumnReorder = (newPhaseOrder: string[]) => {
    setColumnOrder(newPhaseOrder)
  }

  const allTags = projectData ? Array.from(new Set(projectData.features.flatMap((f) => f.tags || []))) : []

  const filteredFeatures =
    projectData?.features.filter(
      (feature) => selectedTags.length === 0 || selectedTags.some((tag) => (feature.tags || []).includes(tag)),
    ) || []

  if (!projectData || showFileInput) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {showFileInput ? "Load New JSON File" : "Brainstorming Organizer"}
            </h1>
            <p className="text-muted-foreground text-lg">
              {showFileInput 
                ? "Upload a new JSON file to replace the current project data" 
                : "Upload your JSON file to start organizing your ideas on a Kanban board"
              }
            </p>
            {showFileInput && (
              <Button 
                onClick={() => setShowFileInput(false)} 
                variant="outline" 
                className="mt-4"
              >
                Cancel
              </Button>
            )}
          </div>
          <FileInput onFileLoad={handleFileLoad} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className={`max-w-7xl mx-auto p-6 transition-all duration-300 ${isDetailViewOpen ? 'mr-[480px]' : ''}`}>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-foreground">Brainstorming Organizer</h1>
              {hasUnsavedChanges && (
                <span className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                  • Unsaved changes
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <ThemeToggle />
              <Button 
                onClick={() => setShowFileInput(true)} 
                variant="outline" 
                className="flex items-center gap-2 bg-transparent"
              >
                <Upload className="w-4 h-4" />
                Load New File
              </Button>
              {hasUnsavedChanges && (
                <Button 
                  onClick={handleManualSave} 
                  variant="default" 
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
              )}
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
          onColumnReorder={handleColumnReorder}
          onEditFeature={(feature) => {
            setEditingFeature(feature)
            setIsFormOpen(true)
          }}
          onViewFeature={(feature) => {
            setViewingFeature(feature)
            setIsDetailViewOpen(true)
          }}
          onAddFeature={handleQuickAddFeature}
          columnOrder={columnOrder}
        />

        {isFormOpen && (
          <FeatureForm
            feature={editingFeature}
            existingPhases={Array.from(new Set(projectData.features.map((f) => f.phase)))}
            allTags={allTags}
            onSave={editingFeature ? handleEditFeature : handleAddFeature}
            onCancel={() => {
              setIsFormOpen(false)
              setEditingFeature(null)
            }}
          />
        )}

        <FeatureDetailView
          feature={viewingFeature}
          isOpen={isDetailViewOpen}
          onClose={() => {
            setIsDetailViewOpen(false)
            setViewingFeature(null)
          }}
          onEdit={() => {
            if (viewingFeature) {
              setEditingFeature(viewingFeature)
              setIsFormOpen(true)
              setIsDetailViewOpen(false)
              setViewingFeature(null)
            }
          }}
          onSave={handleEditFeature}
          allFeatures={filteredFeatures}
          onNavigate={(feature) => {
            setViewingFeature(feature)
          }}
          onFeatureUpdate={(updatedFeature) => {
            if (projectData) {
              setProjectData({
                ...projectData,
                features: projectData.features.map((f) =>
                  f.id === updatedFeature.id ? updatedFeature : f
                )
              })
            }
          }}
        />
      </div>
    </div>
  )
}
