'use client'

/* ── Patch JSON.stringify to survive circular Three.js objects ── */
if (typeof window !== 'undefined') {
  const _stringify = JSON.stringify
  JSON.stringify = function (
    value: unknown,
    replacer?: Parameters<typeof JSON.stringify>[1],
    space?: Parameters<typeof JSON.stringify>[2]
  ) {
    try {
      return _stringify(value, replacer as never, space)
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('circular')) {
        const seen = new WeakSet()
        return _stringify(
          value,
          function (_key, val) {
            if (typeof val === 'object' && val !== null) {
              if (seen.has(val)) return '[Circular]'
              seen.add(val)
            }
            return val
          },
          space
        )
      }
      throw err
    }
  } as typeof JSON.stringify

  const originalConsoleError = console.error
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('createRoot()')) return
    originalConsoleError(...args)
  }
}

import { useRef, useMemo, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ScrollControls, Scroll, useScroll, useGLTF } from '@react-three/drei'
import FuzzyText from './FuzzyText'
import CourseCardsOverlay from './CourseCardsOverlay'
import { scrollStore } from './scrollStore'
import {
  EffectComposer,
  Bloom,
  Vignette,
} from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'

/* ── Preload both GLB models ── */
useGLTF.preload('/aestetic_computer.glb')
useGLTF.preload('/old_computers.glb')

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Neon Retrowave Grid (floor + ceiling)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function NeonGrid() {
  const geometry = useMemo(() => {
    const positions: number[] = []
    const colors: number[] = []
    const extent = 60
    const lines = 60
    const step = (extent * 2) / lines
    const magenta = new THREE.Color('#ff00ff')
    const red = new THREE.Color('#ff0044')

    for (let i = 0; i <= lines; i++) {
      const z = -extent + i * step
      positions.push(-extent, 0, z, extent, 0, z)
      const c = i % 10 === 0 ? red : magenta
      colors.push(c.r, c.g, c.b, c.r, c.g, c.b)
    }

    for (let i = 0; i <= lines; i++) {
      const x = -extent + i * step
      positions.push(x, 0, -extent, x, 0, extent)
      colors.push(magenta.r, magenta.g, magenta.b, magenta.r, magenta.g, magenta.b)
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    return geo
  }, [])

  return (
    <>
      <lineSegments geometry={geometry} position={[0, -1, 0]}>
        <lineBasicMaterial vertexColors toneMapped={false} />
      </lineSegments>
      <lineSegments
        geometry={geometry}
        position={[0, 8, 0]}
        rotation={[Math.PI, 0, 0]}
      >
        <lineBasicMaterial vertexColors toneMapped={false} />
      </lineSegments>
    </>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   GLB Model (ref-based, no <primitive>)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function GLBModel({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  const groupRef = useRef<THREE.Group>(null!)

  useEffect(() => {
    const group = groupRef.current
    if (!group) return
    const clone = scene.clone(true)
    group.add(clone)
    return () => {
      group.remove(clone)
    }
  }, [scene])

  return <group ref={groupRef} />
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Scroll-Driven Scene Content
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function SceneContent() {
  const scroll = useScroll()
  const { camera } = useThree()

  const gridGroupRef = useRef<THREE.Group>(null!)
  const aestheticGroupRef = useRef<THREE.Group>(null!)
  const oldGroupRef = useRef<THREE.Group>(null!)
  const overlayRef = useRef<THREE.Mesh>(null!)

  const _forward = useMemo(() => new THREE.Vector3(), [])

  useFrame(() => {
    const t = scroll.offset
    scrollStore.offset = t

    /* ─── Camera ─── */
    const zoomT = Math.min(t / 0.5, 1)
    const zoomEased = 1 - Math.pow(1 - zoomT, 3)

    const transT = THREE.MathUtils.clamp((t - 0.42) / 0.16, 0, 1)
    const transSmooth = transT * transT * (3 - 2 * transT)

    // Camera zooms straight into the blue screen
    const acY = 3.9
    const acZ = THREE.MathUtils.lerp(25, 1.2, zoomEased)

    const driftT = t > 0.58 ? (t - 0.58) / 0.42 : 0
    const ocX = Math.sin(driftT * Math.PI * 0.5) * 0.3
    const ocY = 2.3 + Math.sin(driftT * Math.PI) * 0.15
    const ocZ = 8.0

    camera.position.set(
      THREE.MathUtils.lerp(0, ocX, transSmooth),
      THREE.MathUtils.lerp(acY, ocY, transSmooth),
      THREE.MathUtils.lerp(acZ, ocZ, transSmooth)
    )
    camera.lookAt(
      THREE.MathUtils.lerp(0, ocX * 0.5, transSmooth),
      THREE.MathUtils.lerp(acY, 1.0, transSmooth),
      0
    )

    /* ─── Fade-to-black overlay ─── */
    let overlayOpacity = 0
    if (t >= 0.42 && t <= 0.5) {
      overlayOpacity = THREE.MathUtils.clamp((t - 0.42) / 0.08, 0, 1)
    } else if (t > 0.5 && t <= 0.58) {
      overlayOpacity = THREE.MathUtils.clamp(1 - (t - 0.5) / 0.08, 0, 1)
    }

    if (overlayRef.current) {
      const mat = overlayRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = overlayOpacity
      overlayRef.current.visible = overlayOpacity > 0.001
      _forward.set(0, 0, -1).applyQuaternion(camera.quaternion)
      overlayRef.current.position
        .copy(camera.position)
        .addScaledVector(_forward, 0.15)
      overlayRef.current.quaternion.copy(camera.quaternion)
    }

    /* ─── Model visibility ─── */
    const showOld = t >= 0.45
    if (gridGroupRef.current) gridGroupRef.current.visible = !showOld
    if (aestheticGroupRef.current) aestheticGroupRef.current.visible = !showOld
    if (oldGroupRef.current) oldGroupRef.current.visible = showOld
  })

  return (
    <>
      <ambientLight intensity={0.15} />

      {/* ── Neon Grid ── */}
      <group ref={gridGroupRef}>
        <NeonGrid />
        <pointLight position={[0, 5, 0]} intensity={0.8} color="#ff00ff" distance={40} />
      </group>

      {/* ── Aesthetic Computer ── */}
      <group ref={aestheticGroupRef}>
        <GLBModel url="/aestetic_computer.glb" />
        <pointLight position={[0, 3, 3]} intensity={2.5} color="#00ffff" distance={15} />
        <pointLight position={[0, -0.5, 1]} intensity={1} color="#ff00ff" distance={10} />
      </group>

      {/* ── Old Computers ── */}
      <group ref={oldGroupRef} visible={false}>
        <GLBModel url="/old_computers.glb" />
        <pointLight position={[0, 3, 1]} intensity={2} color="#ffffffff" distance={15} />
        <pointLight position={[-2, 2, -1]} intensity={1.5} color="#00ff44" distance={12} />
        <pointLight position={[2, 2, -1]} intensity={1.5} color="#00ff44" distance={12} />
        <ambientLight intensity={0.05} />
      </group>

      {/* ── Fade-to-black plane ── */}
      <mesh ref={overlayRef} renderOrder={9999} visible={false}>
        <planeGeometry args={[50, 50]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0}
          depthTest={false}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── Post-processing ── */}
      <EffectComposer multisampling={0}>
        <Bloom
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          intensity={1.8}
          mipmapBlur
        />
        <Vignette
          offset={0.3}
          darkness={0.9}
          blendFunction={BlendFunction.NORMAL}
        />
      </EffectComposer>
    </>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Exported Landing Scene
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function LandingScene() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        background: '#050008',
      }}
    >
      <Canvas
        camera={{ fov: 60, near: 0.1, far: 200, position: [0, 3.9, 25] }}
        dpr={[1, 1.5]}
        gl={{ antialias: true }}
        performance={{ min: 0.5 }}
      >
        <color attach="background" args={['#050008']} />
        <Suspense fallback={null}>
          <ScrollControls pages={5} damping={0.1}>
            <SceneContent />
            <Scroll html style={{ width: '100%' }}>
              <div
                style={{
                  position: 'absolute',
                  top: '20vh',
                  left: 0,
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                  zIndex: 10,
                }}
              >
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
            </Scroll>
          </ScrollControls>
        </Suspense>
      </Canvas>
      <CourseCardsOverlay />
    </div>
  )
}
