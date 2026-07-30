'use client'

import React, { useEffect, useRef } from 'react'
import { scrollStore } from './scrollStore'
import './CourseCard.css'

const cardsData = [
  {
    title: '1. Web Foundations',
    description: 'Understand how the internet works before writing a single line of backend code.',
    learn: ['Client to Server Communication', 'HTTP & HTTPS', 'Request-Response Lifecycle', 'Routing & APIs'],
  },
  {
    title: '2. Backend Architecture',
    description: 'Learn how production backends are structured using industry-standard design patterns.',
    learn: ['Controllers', 'Services', 'Repositories', 'Middleware', 'Dependency Injection'],
  },
  {
    title: '3. Data & Storage',
    description: 'Master how applications store, retrieve, and optimize data efficiently.',
    learn: ['PostgreSQL', 'Database Design', 'Indexing', 'Caching with Redis', 'Search Engines'],
  },
  {
    title: '4. Secure & Reliable Systems',
    description: 'Build applications that are secure, fault-tolerant, and production-ready.',
    learn: ['Authentication & Authorization', 'Validation', 'Error Handling', 'Logging & Monitoring', 'Backend Security'],
  },
  {
    title: '5. Scaling Modern Backends',
    description: 'Learn how large-scale applications handle millions of users without breaking.',
    learn: ['Background Jobs & Queues', 'Load Balancing', 'Horizontal Scaling', 'Performance Optimization', 'Concurrency & Parallelism'],
  },
]

const SLOTS = {
  left: { xOffset: '20vw', yOffset: '0vh' },
  right: { xOffset: '20vw', yOffset: '0vh' },
}

const cardConfigs = [
  { side: 'left', showMin: 0.000, showMax: 0.075 },
  { side: 'right', showMin: 0.075, showMax: 0.150 },
  { side: 'left', showMin: 0.150, showMax: 0.225 },
  { side: 'right', showMin: 0.225, showMax: 0.300 },
  { side: 'left', showMin: 0.295, showMax: 0.375 },
] as const

const SCALE_START = 0.74
const SCALE_END = 1.06
const EXIT_START = 0.72
const EXIT_TRAVEL_VW = 38
const FADE_IN_END = 0.12
const OFFSET_EPSILON = 0.00025

function clamp(v: number, a: number, b: number) {
  return Math.min(Math.max(v, a), b)
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function smoothstep(t: number) {
  return t * t * (3 - 2 * t)
}

export default function CourseCardsOverlay() {
  const refs = useRef<(HTMLDivElement | null)[]>([])
  const wasVisible = useRef<boolean[]>(cardConfigs.map(() => false))
  const lastRenderedOffset = useRef(-1)

  useEffect(() => {
    let raf = 0

    const tick = () => {
      const t = scrollStore.offset

      if (Math.abs(t - lastRenderedOffset.current) < OFFSET_EPSILON) {
        raf = requestAnimationFrame(tick)
        return
      }
      lastRenderedOffset.current = t

      cardConfigs.forEach((cfg, i) => {
        const el = refs.current[i]
        if (!el) return

        const show = t >= cfg.showMin && t <= cfg.showMax
        if (!show) {
          if (wasVisible.current[i]) {
            el.style.opacity = '0'
            el.style.pointerEvents = 'none'
            wasVisible.current[i] = false
          }
          return
        }
        wasVisible.current[i] = true

        const localT = clamp((t - cfg.showMin) / (cfg.showMax - cfg.showMin), 0, 1)
        const growT = Math.min(localT / EXIT_START, 1)
        const scale = lerp(SCALE_START, SCALE_END, growT)

        const exitT = clamp((localT - EXIT_START) / (1 - EXIT_START), 0, 1)
        const exitEase = smoothstep(exitT)
        const exitDirection = cfg.side === 'left' ? -1 : 1
        const translateXvw = exitDirection * exitEase * EXIT_TRAVEL_VW

        const fadeIn = Math.min(localT / FADE_IN_END, 1)
        const fadeOut = 1 - exitEase
        const opacity = Math.min(fadeIn, fadeOut)

        el.style.opacity = String(opacity)
        el.style.pointerEvents = opacity > 0.05 ? 'auto' : 'none'
        el.style.transform = `translate3d(${translateXvw}vw, 0, 0) scale(${scale})`
      })

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <>
      {cardsData.map((data, i) => {
        const cfg = cardConfigs[i]
        const isLeft = cfg.side === 'left'
        const slot = isLeft ? SLOTS.left : SLOTS.right

        return (
          <div
            key={data.title}
            style={{
              position: 'fixed',
              top: `calc(50% + ${slot.yOffset})`,
              left: isLeft ? slot.xOffset : 'auto',
              right: isLeft ? 'auto' : slot.xOffset,
              transform: 'translateY(-50%)',
              zIndex: 20,
            }}
          >
            <div
              ref={(el) => {
                refs.current[i] = el
              }}
              className="course-card-wrapper"
              style={{
                opacity: 0,
                pointerEvents: 'none',
                transformOrigin: 'center center',
                willChange: 'transform, opacity',
              }}
            >
              <div className="course-card">
                <div className="course-card-inner">
                  <h2 className="course-card-title">{data.title}</h2>
                  <p className="course-card-desc">{data.description}</p>
                  <h3 className="course-card-subtitle">You&apos;ll Learn</h3>
                  <ul className="course-card-list">
                    {data.learn.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </>
  )
}
