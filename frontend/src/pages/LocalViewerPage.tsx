import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { NiiVueViewer } from '@/components/viewer/NiiVueViewer'
import { ViewerToolbar } from '@/components/viewer/ViewerToolbar'
import { ArrowLeft, Upload, FolderOpen } from 'lucide-react'

export function LocalViewerPage() {
  const navigate = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileSelect = useCallback((selectedFile: File) => {
    if (selectedFile.name.endsWith('.nii') || selectedFile.name.endsWith('.nii.gz')) {
      setFile(selectedFile)
    } else {
      alert('Please select a NIfTI file (.nii or .nii.gz)')
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFileSelect(selectedFile)
    }
  }, [handleFileSelect])

  if (!file) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b border-border px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold">Local Viewer</h1>
        </header>

        <div className="flex-1 flex items-center justify-center p-8">
          <div
            className={`
              w-full max-w-2xl aspect-video rounded-xl border-2 border-dashed
              flex flex-col items-center justify-center gap-6 transition-colors
              ${isDragging
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-muted-foreground'
              }
            `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="p-4 rounded-full bg-secondary">
              <Upload className="w-12 h-12 text-muted-foreground" />
            </div>

            <div className="text-center">
              <p className="text-lg font-medium mb-2">
                Drag & drop a NIfTI file here
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Supports .nii and .nii.gz files
              </p>
            </div>

            <label className="cursor-pointer">
              <input
                type="file"
                accept=".nii,.nii.gz"
                onChange={handleInputChange}
                className="hidden"
              />
              <span className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 py-2 bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80">
                <FolderOpen className="w-4 h-4 mr-2" />
                Browse Files
              </span>
            </label>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">{file.name}</h1>
            <p className="text-sm text-muted-foreground">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
        <ViewerToolbar />
      </header>

      <main className="flex-1 relative">
        <NiiVueViewer file={file} />
      </main>
    </div>
  )
}
