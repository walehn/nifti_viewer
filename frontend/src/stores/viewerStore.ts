import { create } from 'zustand'

// NiiVue slice types
export const SLICE_TYPE = {
  AXIAL: 0,
  CORONAL: 1,
  SAGITTAL: 2,
  MULTIPLANAR: 3,
  RENDER: 4,
} as const

// CT windowing presets
export const WINDOW_PRESETS = {
  abdomen: { center: 65, width: 420, label: 'Abdomen' },
  liver: { center: 60, width: 150, label: 'Liver' },
  bone: { center: 300, width: 1500, label: 'Bone' },
  lung: { center: -600, width: 1500, label: 'Lung' },
  brain: { center: 40, width: 80, label: 'Brain' },
  softTissue: { center: 50, width: 350, label: 'Soft Tissue' },
} as const

export type WindowPreset = keyof typeof WINDOW_PRESETS

interface VolumeInfo {
  dimensions: number[]
  spacing: number[]
}

interface ViewerState {
  // Slice
  sliceType: number
  currentSlice: number
  maxSlice: number

  // Windowing
  windowCenter: number
  windowWidth: number
  currentPreset: WindowPreset | null

  // Volume info
  volumeInfo: VolumeInfo | null

  // Actions
  setSliceType: (type: number) => void
  setCurrentSlice: (slice: number) => void
  setMaxSlice: (max: number) => void
  setWindowLevel: (center: number, width: number) => void
  applyPreset: (preset: WindowPreset) => void
  setVolumeInfo: (info: VolumeInfo) => void
  reset: () => void
}

const initialState = {
  sliceType: SLICE_TYPE.AXIAL,
  currentSlice: 0,
  maxSlice: 0,
  windowCenter: 65,
  windowWidth: 420,
  currentPreset: 'abdomen' as WindowPreset,
  volumeInfo: null,
}

export const useViewerStore = create<ViewerState>((set) => ({
  ...initialState,

  setSliceType: (type) => set({ sliceType: type }),

  setCurrentSlice: (slice) => set({ currentSlice: slice }),

  setMaxSlice: (max) => set({ maxSlice: max }),

  setWindowLevel: (center, width) => set({
    windowCenter: center,
    windowWidth: width,
    currentPreset: null,
  }),

  applyPreset: (preset) => {
    const p = WINDOW_PRESETS[preset]
    set({
      windowCenter: p.center,
      windowWidth: p.width,
      currentPreset: preset,
    })
  },

  setVolumeInfo: (info) => set({ volumeInfo: info }),

  reset: () => set(initialState),
}))
