import SceneWrapper from '@/components/SceneWrapper'
import ScrollUIOverlay from '@/components/ScrollUIOverlay'

export default function Home() {
  return (
    <main className="relative w-screen h-screen overflow-hidden">
      <SceneWrapper />
      <ScrollUIOverlay />
    </main>
  )
}
