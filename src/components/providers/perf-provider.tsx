'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

type PerfInfo = {
  lowEndDevice: boolean
  slowNetwork: boolean
  saveData: boolean
  reducedMotion: boolean
}

const PerfContext = createContext<PerfInfo>({
  lowEndDevice: false,
  slowNetwork: false,
  saveData: false,
  reducedMotion: false,
})

export function PerfProvider({ children }: { children: React.ReactNode }) {
  const [info, setInfo] = useState<PerfInfo>({
    lowEndDevice: false,
    slowNetwork: false,
    saveData: false,
    reducedMotion: false,
  })

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return

    const nav = navigator as any
    const conn = nav?.connection
    const effectiveType = conn?.effectiveType as string | undefined

    // Network constraints
    const saveData = !!conn?.saveData
    const slowNetwork = !!effectiveType && ['slow-2g', '2g', '3g'].includes(effectiveType)
    
    // Hardware constraints
    const lowCpu = typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4
    const lowRam = typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 2
    
    // User preferences
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false

    const lowEndDevice = lowCpu || lowRam

    const newInfo = { lowEndDevice, slowNetwork, saveData, reducedMotion }
    setInfo(newInfo)

    // Set data attributes on HTML element for CSS targeting
    const root = document.documentElement
    root.toggleAttribute('data-low-end', lowEndDevice)
    root.toggleAttribute('data-slow-net', slowNetwork)
    root.toggleAttribute('data-save-data', saveData)
    root.toggleAttribute('data-reduced-motion', reducedMotion)

    // Log detected constraints for debugging
    if (lowEndDevice || slowNetwork || saveData || reducedMotion) {
      console.log('🔧 Performance constraints detected:', {
        lowEndDevice: lowEndDevice ? `CPU: ${navigator.hardwareConcurrency || 'unknown'}, RAM: ${nav.deviceMemory || 'unknown'}GB` : false,
        slowNetwork: slowNetwork ? effectiveType : false,
        saveData,
        reducedMotion
      })
    } else {
      console.log('⚡ Full performance mode enabled')
    }
  }, [])

  const value = useMemo(() => info, [info])
  return <PerfContext.Provider value={value}>{children}</PerfContext.Provider>
}

export function usePerf() {
  return useContext(PerfContext)
}

// Utility function for checking if any performance constraint is active
export function useIsConstrained() {
  const { lowEndDevice, slowNetwork, saveData, reducedMotion } = usePerf()
  return lowEndDevice || slowNetwork || saveData || reducedMotion
}


