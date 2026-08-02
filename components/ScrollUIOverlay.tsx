'use client'

import React, { useEffect, useRef } from 'react'
import { scrollStore } from './scrollStore'
import { GetStartedButton } from "@/components/ui/get-started-button"

export default function ScrollUIOverlay() {
  const btnRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf = 0
    let lastRenderedOffset = -1

    const tick = () => {
      const t = scrollStore.offset

      if (Math.abs(t - lastRenderedOffset) < 0.0001) {
        raf = requestAnimationFrame(tick)
        return
      }
      lastRenderedOffset = t

      // Text: visible at t < 0.01, fades out completely by 0.04
      if (textRef.current) {
        let textOpacity = 1
        if (t > 0.01) {
          textOpacity = Math.max(0, 1 - (t - 0.01) / 0.03)
        }
        textRef.current.style.opacity = String(textOpacity)
      }

      // Button: visible at t > 0.55, fully visible at 0.60
      if (btnRef.current) {
        let btnOpacity = 0
        if (t > 0.55) {
          btnOpacity = Math.min(1, (t - 0.55) / 0.05)
        }
        btnRef.current.style.opacity = String(btnOpacity)
        btnRef.current.style.pointerEvents = btnOpacity > 0.5 ? 'auto' : 'none'
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center justify-center">
      <div ref={textRef} className="absolute text-white/70 text-sm tracking-widest uppercase pointer-events-none whitespace-nowrap">
        Scroll to explore
      </div>
      <div ref={btnRef} className="absolute opacity-0 pointer-events-none">
        <GetStartedButton />
      </div>
    </div>
  )
}
