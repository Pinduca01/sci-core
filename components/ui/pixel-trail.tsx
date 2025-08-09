'use client'

import React, { useEffect, useRef, useState } from 'react'

interface PixelTrailProps {
  pixelSize?: number
  fadeDuration?: number
  delay?: number
  pixelClassName?: string
}

interface Pixel {
  id: string
  x: number
  y: number
  timestamp: number
}

export const PixelTrail: React.FC<PixelTrailProps> = ({
  pixelSize = 80,
  fadeDuration = 2000,
  delay = 100,
  pixelClassName = 'rounded-full bg-orange-500',
}) => {
  const [pixels, setPixels] = useState<Pixel[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const lastPixelTime = useRef<number>(0)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now()
      
      // Apply delay between pixels
      if (now - lastPixelTime.current < delay) {
        return
      }

      const newPixel: Pixel = {
        id: `pixel-${now}-${Math.random()}`,
        x: e.clientX - pixelSize / 2,
        y: e.clientY - pixelSize / 2,
        timestamp: now,
      }

      setPixels(prev => [...prev, newPixel])
      lastPixelTime.current = now
    }

    // Add event listener to the entire window for global mouse tracking
    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [pixelSize, delay])

  useEffect(() => {
    if (fadeDuration === 0) return

    const interval = setInterval(() => {
      const now = Date.now()
      setPixels(prev => prev.filter(pixel => now - pixel.timestamp < fadeDuration))
    }, 100)

    return () => clearInterval(interval)
  }, [fadeDuration])

  const getPixelOpacity = (pixel: Pixel): number => {
    if (fadeDuration === 0) return 1
    
    const age = Date.now() - pixel.timestamp
    const opacity = Math.max(0, 1 - age / fadeDuration)
    return opacity
  }

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none overflow-hidden z-10">
      {pixels.map((pixel) => (
        <div
          key={pixel.id}
          className={pixelClassName}
          style={{
            position: 'fixed',
            left: pixel.x,
            top: pixel.y,
            width: pixelSize,
            height: pixelSize,
            opacity: getPixelOpacity(pixel),
            transition: fadeDuration > 0 ? `opacity ${fadeDuration}ms ease-out` : 'none',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        />
      ))}
    </div>
  )
}