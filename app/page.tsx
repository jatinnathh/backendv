'use client'
import SceneWrapper from '@/components/SceneWrapper'
import ScrollUIOverlay from '@/components/ScrollUIOverlay'
import { div } from 'three/src/nodes/math/OperatorNode.js'
import { useRouter } from 'next/navigation'
export default function Home() {
  const router = useRouter()
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <button style={{ color: "white", backgroundColor: "black", padding: "10px", borderRadius: "10px", cursor: "pointer" }} onClick={() => router.push("/dashboard")}>Go to Dashboard</button>
    </div>
  )
}
