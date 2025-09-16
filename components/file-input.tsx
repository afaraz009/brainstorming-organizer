"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { ProjectData } from "@/app/page"

interface FileInputProps {
  onFileLoad: (data: ProjectData) => void
}

export function FileInput({ onFileLoad }: FileInputProps) {
  const [error, setError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const validateData = (data: any): data is ProjectData => {
    if (!data || typeof data !== "object") {
      throw new Error("Invalid JSON structure")
    }

    if (!data.projectVision || typeof data.projectVision !== "string") {
      throw new Error("Missing or invalid projectVision field")
    }

    if (!Array.isArray(data.features)) {
      throw new Error("Missing or invalid features array")
    }

    for (const feature of data.features) {
      if (!feature.title || !feature.phase) {
        throw new Error("Invalid feature structure - missing required fields")
      }
      if (feature.tags && !Array.isArray(feature.tags)) {
        throw new Error("Invalid feature structure - tags must be an array")
      }
    }

    return true
  }

  const handleFile = async (file: File) => {
    setError(null)

    if (!file.type.includes("json")) {
      setError("Please select a JSON file")
      return
    }

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      if (validateData(data)) {
        onFileLoad(data)
      }
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError("Invalid JSON format. Please check your file.")
      } else {
        setError(err instanceof Error ? err.message : "Failed to load file")
      }
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)

    const file = event.dataTransfer.files[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upload Brainstorming Data</CardTitle>
        <CardDescription>Select a JSON file containing your project vision and features</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <div className="mb-4">
            <p className="text-lg font-medium mb-2">Drop your JSON file here or click to browse</p>
            <p className="text-sm text-muted-foreground">Supports JSON files with projectVision and features data</p>
          </div>

          <Button asChild>
            <label className="cursor-pointer">
              <input type="file" accept=".json,application/json" onChange={handleFileSelect} className="hidden" />
              Choose File
            </label>
          </Button>
        </div>

        {error && (
          <Alert className="mt-4" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
