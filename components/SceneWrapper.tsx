'use client'

import dynamic from 'next/dynamic'

const LandingScene = dynamic(() => import('./LandingScene'), { ssr: false })

export default function SceneWrapper() {
  return <LandingScene />
}
