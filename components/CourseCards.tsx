// import React, { useRef } from 'react'
// import { Html, useScroll } from '@react-three/drei'
// import { useFrame } from '@react-three/fiber'
// import * as THREE from 'three'
// import './CourseCard.css'

// const cardsData = [
//   { title: "1. Web Foundations", description: "Understand how the internet works before writing a single line of backend code.", learn: ["Client ↔ Server Communication", "HTTP & HTTPS", "Request–Response Lifecycle", "Routing & APIs"] },
//   { title: "2. Backend Architecture", description: "Learn how production backends are structured using industry-standard design patterns.", learn: ["Controllers", "Services", "Repositories", "Middleware", "Dependency Injection"] },
//   { title: "3. Data & Storage", description: "Master how applications store, retrieve, and optimize data efficiently.", learn: ["PostgreSQL", "Database Design", "Indexing", "Caching with Redis", "Search Engines"] },
//   { title: "4. Secure & Reliable Systems", description: "Build applications that are secure, fault-tolerant, and production-ready.", learn: ["Authentication & Authorization", "Validation", "Error Handling", "Logging & Monitoring", "Backend Security"] },
//   { title: "5. Scaling Modern Backends", description: "Learn how large-scale applications handle millions of users without breaking.", learn: ["Background Jobs & Queues", "Load Balancing", "Horizontal Scaling", "Performance Optimization", "Concurrency & Parallelism"] },
// ];

// /* 
//   CARD CONFIGURATION:
//   - side: 'left' or 'right'
//   - offset: distance from screen edge (e.g. '8vw')
//   - top: vertical position on screen ('50%')
//   - showMin / showMax: Scroll timeline window (0.00 to 0.40)
//   - startScale / endScale: Card size as it flows towards the screen
// */
// const cardConfigs = [
//   { side: 'left',  offset: '80vw', top: '50%', showMin: 0.00, showMax: 0.08, startScale: 0.70, endScale: 1.15 }, // Card 1 - Left
//   { side: 'right', offset: '8vw', top: '50%', showMin: 0.08, showMax: 0.16, startScale: 0.70, endScale: 1.15 }, // Card 2 - Right
//   { side: 'left',  offset: '8vw', top: '50%', showMin: 0.16, showMax: 0.24, startScale: 0.70, endScale: 1.15 }, // Card 3 - Left
//   { side: 'right', offset: '8vw', top: '50%', showMin: 0.24, showMax: 0.32, startScale: 0.70, endScale: 1.15 }, // Card 4 - Right
//   { side: 'left',  offset: '8vw', top: '50%', showMin: 0.32, showMax: 0.40, startScale: 0.70, endScale: 1.15 }, // Card 5 - Left
// ];

// function CardSlot({ data, cfg }: { data: typeof cardsData[0]; cfg: typeof cardConfigs[0] }) {
//   const htmlRef = useRef<HTMLDivElement>(null)
//   const wasVisible = useRef(false)
//   const scroll = useScroll()

//   useFrame(() => {
//     const t = scroll.offset
//     const show = t >= cfg.showMin && t <= cfg.showMax

//     if (!show) {
//       if (wasVisible.current && htmlRef.current) {
//         htmlRef.current.style.opacity = '0'
//         htmlRef.current.style.pointerEvents = 'none'
//         wasVisible.current = false
//       }
//       return
//     }
//     wasVisible.current = true

//     // Scroll progress within this card's window (0 to 1)
//     const localT = THREE.MathUtils.clamp((t - cfg.showMin) / (cfg.showMax - cfg.showMin), 0, 1)

//     // Flow towards the screen: scale increases from startScale to endScale with scroll
//     const currentScale = THREE.MathUtils.lerp(cfg.startScale, cfg.endScale, localT)

//     // Smooth fade in & fade out
//     const fade = Math.min(localT / 0.15, (1 - localT) / 0.15, 1)

//     if (htmlRef.current) {
//       htmlRef.current.style.transform = `translateY(-50%) scale(${currentScale})`
//       htmlRef.current.style.opacity = String(fade)
//       htmlRef.current.style.pointerEvents = 'auto'
//     }
//   })

//   const isLeft = cfg.side === 'left'

//   return (
//     <Html>
//       <div
//         ref={htmlRef}
//         className="course-card-wrapper"
//         style={{
//           position: 'fixed',
//           top: cfg.top,
//           left: isLeft ? cfg.offset : 'auto',
//           right: isLeft ? 'auto' : cfg.offset,
//           transform: `translateY(-50%) scale(${cfg.startScale})`,
//           opacity: 0,
//           pointerEvents: 'none',
//           zIndex: 20,
//           transformOrigin: isLeft ? 'left center' : 'right center'
//         }}
//       >
//         <div className="course-card">
//           <div className="course-card-inner">
//             <h2 className="course-card-title">{data.title}</h2>
//             <p className="course-card-desc">{data.description}</p>
//             <h3 className="course-card-subtitle">You&apos;ll Learn</h3>
//             <ul className="course-card-list">
//               {data.learn.map((item, i) => (
//                 <li key={i}>
//                   <span className="course-card-bullet" />
//                   {item}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </div>
//       </div>
//     </Html>
//   )
// }

// export default function CourseCards() {
//   return (
//     <group>
//       {cardsData.map((data, index) => (
//         <CardSlot key={index} data={data} cfg={cardConfigs[index]} />
//       ))}
//     </group>
//   )
// } 
