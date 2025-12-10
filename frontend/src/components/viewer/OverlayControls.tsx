import { Button } from '@/components/ui/button'
import { useViewerStore } from '@/stores/viewerStore'
import { Eye, EyeOff, Layers, X } from 'lucide-react'

interface OverlayControlsProps {
  onLoadSegmentation: () => void
  onClearSegmentation: () => void
}

export function OverlayControls({ onLoadSegmentation, onClearSegmentation }: OverlayControlsProps) {
  const {
    hasOverlay,
    overlayVisible,
    overlayOpacity,
    overlayFileName,
    setOverlayVisible,
    setOverlayOpacity,
  } = useViewerStore()

  if (!hasOverlay) {
    return (
      <div className="flex items-center gap-2 border-l border-border pl-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onLoadSegmentation}
          className="text-xs"
        >
          <Layers className="w-4 h-4 mr-2" />
          Load Segmentation
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 border-l border-border pl-4">
      {/* Overlay file name */}
      <div
        className="text-xs text-muted-foreground px-2 py-1 bg-secondary rounded truncate max-w-32"
        title={overlayFileName || ''}
      >
        {overlayFileName}
      </div>

      {/* Visibility toggle */}
      <Button
        variant={overlayVisible ? 'default' : 'ghost'}
        size="icon"
        onClick={() => setOverlayVisible(!overlayVisible)}
        title={overlayVisible ? 'Hide Overlay' : 'Show Overlay'}
      >
        {overlayVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
      </Button>

      {/* Opacity slider */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Opacity:</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={overlayOpacity}
          onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
          className="w-20 h-2 accent-primary cursor-pointer"
          disabled={!overlayVisible}
        />
        <span className="text-xs text-muted-foreground w-8">
          {Math.round(overlayOpacity * 100)}%
        </span>
      </div>

      {/* Clear button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClearSegmentation}
        title="Remove Segmentation"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  )
}
