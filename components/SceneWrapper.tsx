'use client'

import { useState, useEffect } from 'react'
import LandingScene from './LandingScene'

export default function SceneWrapper() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return <LandingScene />
}
