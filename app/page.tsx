'use client'
import SceneWrapper from '@/components/SceneWrapper'
import ScrollUIOverlay from '@/components/ScrollUIOverlay'
import { div } from 'three/src/nodes/math/OperatorNode.js'
import { useRouter } from 'next/navigation'
import FuzzyText from '@/components/FuzzyText'
export default function Home() {
  const router = useRouter()
  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh", gap: "2rem" }}>

      <div>
        <FuzzyText
          fontSize="clamp(3rem, 8vw, 8rem)"
          fontWeight={900}
          color="#ffffff"
          baseIntensity={0.2}
          hoverIntensity={0.5}
          enableHover={false}
          glitchMode
          glitchInterval={3000}
          glitchDuration={300}
        >
          StackView
        </FuzzyText>
      </div>
      <br />

      <button style={{ color: "white", backgroundColor: "black", padding: "10px", borderRadius: "10px", cursor: "pointer" }} onClick={() => router.push("/dashboard")}>Go to Dashboard</button>
    </div>

  )
}
