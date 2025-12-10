import { useEffect, useRef, useCallback } from 'react'
import { Niivue } from '@niivue/niivue'
import { useViewerStore } from '@/stores/viewerStore'

interface NiiVueViewerProps {
  file?: File
  url?: string
}

export function NiiVueViewer({ file, url }: NiiVueViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const nvRef = useRef<Niivue | null>(null)
  const {
    sliceType,
    windowCenter,
    windowWidth,
    setCurrentSlice,
    setMaxSlice,
    setVolumeInfo
  } = useViewerStore()

  // Store current window values in ref to apply after slice type change
  const windowRef = useRef({ center: windowCenter, width: windowWidth })
  windowRef.current = { center: windowCenter, width: windowWidth }

  // Initialize NiiVue
  useEffect(() => {
    if (!canvasRef.current) return

    const nv = new Niivue({
      backColor: [0.1, 0.1, 0.1, 1],
      crosshairColor: [1, 0.5, 0, 1],
      crosshairWidth: 1,
      show3Dcrosshair: true,
      isRadiologicalConvention: true,  // Left side of screen = Right side of patient
    })

    // Set up location change callback
    nv.onLocationChange = (data: unknown) => {
      const location = data as { vox?: number[] }
      if (location?.vox) {
        const slice = Math.round(location.vox[2])
        setCurrentSlice(slice)
      }
    }

    nv.attachToCanvas(canvasRef.current)
    nvRef.current = nv

    return () => {
      nvRef.current = null
    }
  }, [setCurrentSlice])

  // Load volume from file (only when file changes, not sliceType)
  useEffect(() => {
    const nv = nvRef.current
    if (!nv || !file) return

    const loadFile = async () => {
      try {
        const arrayBuffer = await file.arrayBuffer()
        await nv.loadFromArrayBuffer(arrayBuffer, file.name)

        if (nv.volumes.length > 0) {
          const vol = nv.volumes[0]
          const dims = vol.dims || [0, 0, 0]
          setMaxSlice(dims[3] - 1)
          setVolumeInfo({
            dimensions: [dims[1], dims[2], dims[3]],
            spacing: vol.pixDims ? [vol.pixDims[1], vol.pixDims[2], vol.pixDims[3]] : [1, 1, 1]
          })

          // Apply initial windowing
          const { center, width } = windowRef.current
          vol.cal_min = center - width / 2
          vol.cal_max = center + width / 2
        }

        nv.setSliceType(sliceType)
        nv.updateGLVolume()
      } catch (error) {
        console.error('Failed to load NIfTI file:', error)
      }
    }

    loadFile()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, setMaxSlice, setVolumeInfo])

  // Load volume from URL (only when URL changes)
  useEffect(() => {
    const nv = nvRef.current
    if (!nv || !url) return

    const loadUrl = async () => {
      try {
        await nv.loadVolumes([{ url }])

        if (nv.volumes.length > 0) {
          const vol = nv.volumes[0]
          const dims = vol.dims || [0, 0, 0]
          setMaxSlice(dims[3] - 1)
          setVolumeInfo({
            dimensions: [dims[1], dims[2], dims[3]],
            spacing: vol.pixDims ? [vol.pixDims[1], vol.pixDims[2], vol.pixDims[3]] : [1, 1, 1]
          })

          // Apply initial windowing
          const { center, width } = windowRef.current
          vol.cal_min = center - width / 2
          vol.cal_max = center + width / 2
        }

        nv.setSliceType(sliceType)
        nv.updateGLVolume()
      } catch (error) {
        console.error('Failed to load NIfTI from URL:', error)
      }
    }

    loadUrl()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, setMaxSlice, setVolumeInfo])

  // Apply windowing
  useEffect(() => {
    const nv = nvRef.current
    if (!nv || nv.volumes.length === 0) return

    const vol = nv.volumes[0]
    vol.cal_min = windowCenter - windowWidth / 2
    vol.cal_max = windowCenter + windowWidth / 2
    nv.updateGLVolume()
  }, [windowCenter, windowWidth])

  // Apply slice type change - also re-apply windowing
  useEffect(() => {
    const nv = nvRef.current
    if (!nv || nv.volumes.length === 0) return

    // Apply current windowing before changing slice type
    const vol = nv.volumes[0]
    const { center, width } = windowRef.current
    vol.cal_min = center - width / 2
    vol.cal_max = center + width / 2

    nv.setSliceType(sliceType)
    nv.updateGLVolume()
  }, [sliceType])

  // Handle wheel navigation
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const nv = nvRef.current
    if (!nv) return

    const delta = e.deltaY > 0 ? 1 : -1
    nv.moveCrosshairInVox(0, 0, delta)
  }, [])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const nv = nvRef.current
      if (!nv) return

      switch (e.key) {
        case 'ArrowUp':
        case 'ArrowRight':
          e.preventDefault()
          nv.moveCrosshairInVox(0, 0, 1)
          break
        case 'ArrowDown':
        case 'ArrowLeft':
          e.preventDefault()
          nv.moveCrosshairInVox(0, 0, -1)
          break
        case 'Home':
          e.preventDefault()
          if (nv.scene?.crosshairPos) {
            nv.scene.crosshairPos[2] = 0
            nv.updateGLVolume()
          }
          break
        case 'End':
          e.preventDefault()
          if (nv.volumes.length > 0 && nv.scene?.crosshairPos) {
            const maxZ = (nv.volumes[0].dims?.[3] || 1) - 1
            nv.scene.crosshairPos[2] = maxZ
            nv.updateGLVolume()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      onWheel={handleWheel}
      className="w-full h-full block"
      style={{ minHeight: 'calc(100vh - 80px)' }}
    />
  )
}
