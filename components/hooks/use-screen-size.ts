'use client'

import { useState, useEffect } from 'react'

interface ScreenSize {
  width: number
  height: number
  lessThan: (breakpoint: string) => boolean
  greaterThan: (breakpoint: string) => boolean
}

const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

export function useScreenSize(): ScreenSize {
  const [screenSize, setScreenSize] = useState<{ width: number; height: number }>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  })

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    handleResize() // Call once to set initial size

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const lessThan = (breakpoint: string): boolean => {
    const breakpointValue = breakpoints[breakpoint as keyof typeof breakpoints]
    return screenSize.width < breakpointValue
  }

  const greaterThan = (breakpoint: string): boolean => {
    const breakpointValue = breakpoints[breakpoint as keyof typeof breakpoints]
    return screenSize.width > breakpointValue
  }

  return {
    ...screenSize,
    lessThan,
    greaterThan,
  }
}