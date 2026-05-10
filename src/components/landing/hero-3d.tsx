"use client"

import { useRef, useMemo, useState, Suspense } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera, Environment, Float, Center } from "@react-three/drei"
import * as THREE from "three"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { motion } from "framer-motion"
import Link from "next/link"

import { BRAND_CONFIG } from "@/constants/brand.constant"

// Animated background particles
function ParticleField({ color }: { color: string }) {
  const particlesRef = useRef<THREE.Points>(null)
  const particlesCount = 1500

  const positions = useMemo(() => {
    const positions = new Float32Array(particlesCount * 3)
    for (let i = 0; i < particlesCount * 3; i += 3) {
      positions[i] = (Math.sin(i) * 10000 % 1 - 0.5) * 30
      positions[i + 1] = (Math.sin(i + 1) * 10000 % 1 - 0.5) * 30
      positions[i + 2] = (Math.sin(i + 2) * 10000 % 1 - 0.5) * 30
    }
    return positions
  }, [])

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.03
      particlesRef.current.rotation.x = state.clock.elapsedTime * 0.02
    }
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color={color}
        sizeAttenuation
        transparent
        opacity={0.4}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// Floating minimal boxes representing content
function ContentBox({ position, delay, color }: { position: [number, number, number]; delay: number; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3 + delay
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2 + delay
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + delay) * 0.2
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.8} floatIntensity={0.8}>
      <mesh ref={meshRef} position={position}>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial
          color={color}
          metalness={0.9}
          roughness={0.1}
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.9}
        />
      </mesh>
    </Float>
  )
}

function Scene3D() {
  const primaryColor = BRAND_CONFIG.colors.primary[500]
  const secondaryColor = BRAND_CONFIG.colors.secondary[500]

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 10]} />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      <Environment preset="night" />
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} color={primaryColor} intensity={2} />
      <pointLight position={[-10, -10, -10]} color={secondaryColor} intensity={2} />
      
      <ParticleField color={primaryColor} />
      
      <ContentBox position={[3, 2, -2]} delay={0} color={primaryColor} />
      <ContentBox position={[-4, 1, -3]} delay={1} color={secondaryColor} />
      <ContentBox position={[2, -3, -1]} delay={2} color={primaryColor} />
      <ContentBox position={[-2, -2, 2]} delay={3} color={secondaryColor} />
    </>
  )
}

export function Hero3D() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
      {/* 3D Canvas Background */}
      <div className="absolute inset-0 z-0">
        <Canvas dpr={[1, 2]}>
          <Suspense fallback={null}>
            <Scene3D />
          </Suspense>
        </Canvas>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 container px-4 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-6 max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-4">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Neural Network Active</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none italic">
            Automate <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-accent">Everything</span>
          </h1>

          <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            The minimal engine for professional YouTube automation. High performance. Zero friction. 
            Join the elite circle of autonomous creators.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link href="/dashboard">
              <Button size="lg" className="h-14 px-10 rounded-2xl bg-white text-black hover:bg-slate-200 font-black uppercase tracking-widest text-xs transition-transform hover:scale-105 active:scale-95">
                Launch Interface
              </Button>
            </Link>
            <Link href="/dashboard/studio">
              <Button size="lg" variant="outline" className="h-14 px-10 rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10 font-black uppercase tracking-widest text-xs transition-transform hover:scale-105 active:scale-95">
                View Studio
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Decorative lines */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute top-0 left-0 w-px h-full bg-linear-to-b from-transparent via-white/5 to-transparent" />
      <div className="absolute top-0 right-0 w-px h-full bg-linear-to-b from-transparent via-white/5 to-transparent" />
    </section>
  )
}
