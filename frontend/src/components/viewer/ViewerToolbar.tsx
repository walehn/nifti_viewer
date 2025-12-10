import { Button } from '@/components/ui/button'
import { useViewerStore, SLICE_TYPE, WINDOW_PRESETS, type WindowPreset } from '@/stores/viewerStore'
import { Grid2X2, Rows3, Columns3, Square } from 'lucide-react'

export function ViewerToolbar() {
  const {
    sliceType,
    setSliceType,
    currentSlice,
    maxSlice,
    currentPreset,
    applyPreset,
    windowCenter,
    windowWidth,
  } = useViewerStore()

  return (
    <div className="flex items-center gap-4">
      {/* Slice info */}
      <div className="text-sm text-muted-foreground px-3 py-1 bg-secondary rounded">
        Slice: {currentSlice + 1} / {maxSlice + 1}
      </div>

      {/* Window info */}
      <div className="text-sm text-muted-foreground px-3 py-1 bg-secondary rounded">
        W: {windowWidth} L: {windowCenter}
      </div>

      {/* Windowing presets */}
      <div className="flex items-center gap-1">
        {(Object.entries(WINDOW_PRESETS) as [WindowPreset, typeof WINDOW_PRESETS[WindowPreset]][]).map(
          ([key, preset]) => (
            <Button
              key={key}
              variant={currentPreset === key ? 'default' : 'ghost'}
              size="sm"
              onClick={() => applyPreset(key)}
              className="text-xs"
            >
              {preset.label}
            </Button>
          )
        )}
      </div>

      {/* View type buttons */}
      <div className="flex items-center gap-1 border-l border-border pl-4">
        <Button
          variant={sliceType === SLICE_TYPE.AXIAL ? 'default' : 'ghost'}
          size="icon"
          onClick={() => setSliceType(SLICE_TYPE.AXIAL)}
          title="Axial View"
        >
          <Square className="w-4 h-4" />
        </Button>
        <Button
          variant={sliceType === SLICE_TYPE.CORONAL ? 'default' : 'ghost'}
          size="icon"
          onClick={() => setSliceType(SLICE_TYPE.CORONAL)}
          title="Coronal View"
        >
          <Rows3 className="w-4 h-4" />
        </Button>
        <Button
          variant={sliceType === SLICE_TYPE.SAGITTAL ? 'default' : 'ghost'}
          size="icon"
          onClick={() => setSliceType(SLICE_TYPE.SAGITTAL)}
          title="Sagittal View"
        >
          <Columns3 className="w-4 h-4" />
        </Button>
        <Button
          variant={sliceType === SLICE_TYPE.MULTIPLANAR ? 'default' : 'ghost'}
          size="icon"
          onClick={() => setSliceType(SLICE_TYPE.MULTIPLANAR)}
          title="Multiplanar View"
        >
          <Grid2X2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
