import React, { useRef } from "react";
import { motion } from "motion/react";
import { Award, ShieldCheck, Zap, Server, Network } from "lucide-react";
import { GlowButton, GlassCircleButton } from "./ui/PremiumButtons";

export default function AboutSection() {
  const nextSectionRef = useRef<HTMLDivElement>(null);

  const scrollToNext = () => {
    nextSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-[#05050f] text-white min-h-screen relative overflow-hidden font-sans">
      
      {/* SECTION 1: SPACE HERO */}
      <section className="relative min-h-[90vh] flex flex-col justify-between pt-36 pb-16 px-6 md:px-12 lg:px-20 overflow-hidden z-10">
        
        {/* Background Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[900px] h-[600px] md:h-[900px] bg-blue-900/15 blur-[120px] rounded-full z-0 pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-[#0044ff]/10 blur-[80px] rounded-full z-0 pointer-events-none" />

        {/* Top Header Label */}
        <div className="relative z-10">
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-[#00d2ff] font-mono text-[12px] uppercase tracking-[0.25em] font-semibold"
          >
            Reimagining Connected Systems
          </motion.p>
        </div>

        {/* Center Headline Grid */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto">
          <div className="lg:col-span-8">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              className="text-[40px] sm:text-[54px] md:text-[68px] font-bold leading-[1.05] tracking-tight text-white max-w-4xl"
            >
              We build platforms that ignite capability by <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-200 to-white">reimagining what's possible</span> at the edge.
            </motion.h1>
          </div>
          
          {/* Pulsing Interactive Circle Button */}
          <div className="lg:col-span-4 flex lg:justify-end justify-start relative">
            <motion.button 
              onClick={scrollToNext}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border border-white/20 bg-white/5 backdrop-blur-md flex items-center justify-center relative cursor-pointer group shadow-2xl hover:border-white/40 transition-colors"
            >
              {/* Spinning Orbit Ring */}
              <div className="absolute inset-2 rounded-full border border-dashed border-white/10 group-hover:border-white/20 animate-[spin_20s_linear_infinite]" />
              
              {/* Glowing Center Pulse */}
              <div className="w-3 h-3 rounded-full bg-white relative">
                <div className="absolute inset-0 rounded-full bg-white/40 animate-ping scale-[2.5]" />
              </div>
            </motion.button>
          </div>
        </div>

        {/* Bottom Left Capsule Label */}
        <div className="relative z-10 flex justify-between items-end border-t border-white/5 pt-8">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-[12px] font-mono text-gray-400 tracking-wider"
          >
            Autonomous Future
          </motion.div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-[12px] font-mono text-gray-500 hidden sm:block"
          >
            Scroll to explore • UNITINCAN
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: BOLD REALITIES SECTION (WHITE CONTAINER OVERLAP) */}
      <div ref={nextSectionRef} className="rounded-t-[48px] bg-white text-gray-900 px-6 md:px-12 lg:px-20 py-24 md:py-32 relative z-20 -mt-10 shadow-[0_-20px_50px_rgba(0,0,0,0.3)]">
        
        {/* Row 1: Split typography and intro */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20 md:mb-28">
          <div className="lg:col-span-6">
            <h2 className="text-[32px] md:text-[52px] leading-[1.1] font-bold tracking-tight text-gray-900 max-w-lg">
              For crafting bold edge solutions.
            </h2>
          </div>
          <div className="lg:col-span-6 flex flex-col items-start pt-2">
            <p className="text-[12px] font-mono tracking-[0.2em] text-[#0044ff] font-bold uppercase mb-6">
              Innovating for a Connected Edge
            </p>
            <p className="text-[18px] md:text-[20px] text-gray-600 leading-relaxed max-w-xl mb-8">
              We design and construct intelligent nodes that deploy instantly, process logic locally, and route telemetry with military-grade safety. From complex hardware pipelines to low-latency cloud synchronization, we build systems that scale.
            </p>
            <GlowButton>Explore Platform</GlowButton>
          </div>
        </div>

        {/* Row 2: Two custom animated SVG visual cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1: Data Stream Waveform */}
          <div className="aspect-[1.45/1] rounded-3xl overflow-hidden bg-[#070714] border border-gray-100 flex flex-col justify-between p-8 relative group shadow-sm hover:shadow-xl transition-all duration-500">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 blur-[60px] rounded-full pointer-events-none" />
            
            {/* Visual illustration container */}
            <div className="w-full flex-grow flex items-center justify-center">
              <svg viewBox="0 0 400 200" className="w-full h-full max-h-[160px]">
                <style>{`
                  @keyframes pulseWave1 {
                    0% { stroke-dashoffset: 800; }
                    100% { stroke-dashoffset: 0; }
                  }
                  .wave-path-1 {
                    stroke-dasharray: 400;
                    animation: pulseWave1 10s linear infinite;
                  }
                  .wave-path-2 {
                    stroke-dasharray: 400;
                    animation: pulseWave1 14s linear infinite reverse;
                  }
                `}</style>
                <defs>
                  <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0044ff" stopOpacity="0.1" />
                    <stop offset="50%" stopColor="#00d2ff" stopOpacity="1" />
                    <stop offset="100%" stopColor="#0044ff" stopOpacity="0.2" />
                  </linearGradient>
                </defs>
                {/* Background Grid */}
                <g stroke="rgba(255,255,255,0.03)" strokeWidth="1">
                  <line x1="0" y1="40" x2="400" y2="40" />
                  <line x1="0" y1="100" x2="400" y2="100" />
                  <line x1="0" y1="160" x2="400" y2="160" />
                  <line x1="80" y1="0" x2="80" y2="200" />
                  <line x1="200" y1="0" x2="200" y2="200" />
                  <line x1="320" y1="0" x2="320" y2="200" />
                </g>
                <path
                  d="M 10 100 Q 100 20 200 100 T 390 100"
                  fill="none"
                  stroke="url(#glowGrad)"
                  strokeWidth="3.5"
                  className="wave-path-1"
                />
                <path
                  d="M 10 100 Q 100 180 200 100 T 390 100"
                  fill="none"
                  stroke="rgba(0, 210, 255, 0.25)"
                  strokeWidth="1.5"
                  className="wave-path-2"
                />
                <circle cx="200" cy="100" r="5" fill="#00d2ff" className="animate-pulse" />
              </svg>
            </div>

            <div className="relative z-10 border-t border-white/5 pt-4">
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-gray-500">Telemetry Stream</span>
              <h3 className="text-white text-lg font-semibold mt-1">Real-time Stream Waveform</h3>
            </div>
          </div>

          {/* Card 2: Secure Container Block */}
          <div className="aspect-[1.45/1] rounded-3xl overflow-hidden bg-[#070714] border border-gray-100 flex flex-col justify-between p-8 relative group shadow-sm hover:shadow-xl transition-all duration-500">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 blur-[60px] rounded-full pointer-events-none" />

            {/* Visual illustration container */}
            <div className="w-full flex-grow flex items-center justify-center">
              <svg viewBox="0 0 400 200" className="w-full h-full max-h-[160px]">
                <style>{`
                  @keyframes floatCube {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-10px) rotate(2deg); }
                  }
                  .floating-cube-group {
                    animation: floatCube 6s ease-in-out infinite;
                    transform-origin: center;
                  }
                `}</style>
                <defs>
                  <linearGradient id="cubeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00d2ff" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#0044ff" stopOpacity="0.2" />
                  </linearGradient>
                </defs>
                <g className="floating-cube-group">
                  {/* Outer wireframe cube */}
                  {/* Top face */}
                  <polygon points="200,45 260,75 200,105 140,75" fill="rgba(0, 68, 255, 0.08)" stroke="url(#cubeGrad)" strokeWidth="1.5" />
                  {/* Left face */}
                  <polygon points="140,75 200,105 200,165 140,135" fill="rgba(0, 68, 255, 0.04)" stroke="url(#cubeGrad)" strokeWidth="1.5" />
                  {/* Right face */}
                  <polygon points="200,105 260,75 260,135 200,165" fill="rgba(0, 210, 255, 0.04)" stroke="url(#cubeGrad)" strokeWidth="1.5" />

                  {/* Inner secure core block */}
                  <polygon points="200,75 230,90 200,105 170,90" fill="#00d2ff" stroke="#ffffff" strokeWidth="1" opacity="0.8" />
                  <polygon points="170,90 200,105 200,135 170,120" fill="#0044ff" stroke="#ffffff" strokeWidth="1" opacity="0.8" />
                  <polygon points="200,105 230,90 230,120 200,135" fill="#0022aa" stroke="#ffffff" strokeWidth="1" opacity="0.8" />

                  {/* Floating particles around cube */}
                  <circle cx="120" cy="80" r="2.5" fill="#00d2ff" className="animate-pulse" />
                  <circle cx="280" cy="120" r="2" fill="#0044ff" className="animate-pulse" />
                  <circle cx="260" cy="50" r="1.5" fill="#ffffff" />
                </g>
              </svg>
            </div>

            <div className="relative z-10 border-t border-white/5 pt-4">
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-gray-500">Security Layers</span>
              <h3 className="text-white text-lg font-semibold mt-1">Zero-Trust Cryp-Containers</h3>
            </div>
          </div>

        </div>

        {/* SECTION 3: PIONEERS QUOTE ROW */}
        <div className="border-t border-gray-100 mt-28 pt-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8">
            <p className="text-[24px] sm:text-[32px] md:text-[36px] font-bold text-gray-900 leading-[1.25] tracking-tight">
              For over 19 years, we've worked alongside enterprises and hardware pioneers to rediscover their essence and stand out.
            </p>
            <p className="text-[17px] md:text-[19px] text-gray-400 mt-6 leading-relaxed max-w-3xl">
              Through hardware engineering, cryptographic protocols, and visual telemetry orchestration, we design networks that connect, protect, and drive real impact—on facilities and on operational excellence.
            </p>
          </div>
          <div className="lg:col-span-4 flex lg:justify-end pt-2">
            <span className="text-[12px] font-mono tracking-wider text-gray-400 uppercase">
              Making a difference
            </span>
          </div>
        </div>

        {/* SECTION 4: FUSION METRICS DASHBOARD (DARK SPACE CARD) */}
        <div className="mt-28 rounded-[32px] overflow-hidden relative bg-[#04040f] border border-gray-800 text-white p-8 md:p-16 flex flex-col justify-between min-h-[520px]">
          
          {/* Subtle starry backdrop */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,68,255,0.15)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />
          <div className="absolute inset-0 opacity-15 pointer-events-none" style={{ backgroundImage: `radial-gradient(white 1px, transparent 0)`, backgroundSize: '24px 24px' }} />

          {/* Heading */}
          <div className="relative z-10 max-w-2xl">
            <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-blue-400 mb-4 block">Proven Performance</span>
            <h3 className="text-[26px] sm:text-[36px] md:text-[44px] leading-tight font-bold tracking-tight text-white">
              Every node is a fusion of logic, safety and performance.
            </h3>
          </div>

          {/* Stats Grid */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 pt-16 mt-12 border-t border-white/10">
            
            {/* Stat 1 */}
            <div className="flex flex-col justify-between group">
              <div>
                <span className="text-[48px] md:text-[68px] font-light leading-none tracking-tight block text-white group-hover:text-blue-400 transition-colors duration-300">
                  200+
                </span>
                <span className="text-white/50 text-[14px] font-medium tracking-wide mt-2 block">
                  Connected Edge Systems
                </span>
              </div>
              <GlassCircleButton size={40} className="mt-8" />
            </div>

            {/* Stat 2 */}
            <div className="flex flex-col justify-between group border-t md:border-t-0 md:border-l border-white/10 pt-8 md:pt-0 md:pl-8">
              <div>
                <span className="text-[48px] md:text-[68px] font-light leading-none tracking-tight block text-white group-hover:text-blue-400 transition-colors duration-300">
                  99.99%
                </span>
                <span className="text-white/50 text-[14px] font-medium tracking-wide mt-2 block">
                  Telemetry Delivery Uptime
                </span>
              </div>
              <GlassCircleButton size={40} className="mt-8" />
            </div>

            {/* Stat 3 */}
            <div className="flex flex-col justify-between group border-t md:border-t-0 md:border-l border-white/10 pt-8 md:pt-0 md:pl-8">
              <div>
                <span className="text-[48px] md:text-[68px] font-light leading-none tracking-tight block text-white group-hover:text-blue-400 transition-colors duration-300">
                  10X
                </span>
                <span className="text-white/50 text-[14px] font-medium tracking-wide mt-2 block">
                  Faster Pipeline Compilation
                </span>
              </div>
              <GlassCircleButton size={40} className="mt-8" />
            </div>

          </div>
        </div>

        {/* SECTION 5: AWARDS / ACHIEVEMENTS */}
        <div className="mt-28 pt-20 border-t border-gray-100 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-4 flex items-center gap-3">
            <Award className="text-[#0044ff]" size={28} />
            <h3 className="text-[24px] md:text-[32px] font-bold tracking-tight text-gray-900">
              2026 achievements
            </h3>
          </div>
          <div className="lg:col-span-8">
            <p className="text-[20px] md:text-[26px] text-gray-800 font-semibold leading-snug mb-4">
              We support enterprise evolution by hardening security protocols and projecting what automation can become.
            </p>
            <p className="text-gray-500 text-[15px] leading-relaxed max-w-lg">
              We elevate brands and edge networks to stay relevant, unique, and always one step ahead. Through our rigorous architectural standards, we deliver the future of connected intelligence.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
