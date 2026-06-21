import React, { useState } from "react";
import { motion } from "motion/react";
import { ArrowUpRight, Globe } from "lucide-react";

// 1. UNIQUE GLASS CIRCLE BUTTON WITH FLIGHT-ARROW HOVER ANIMATION
interface GlassCircleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: number;
}

export function GlassCircleButton({ size = 48, className = "", ...props }: GlassCircleButtonProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative rounded-full flex items-center justify-center cursor-pointer overflow-hidden border border-white/20 transition-all duration-500 shadow-2xl bg-white/5 backdrop-blur-md group hover:border-white/40 ${className}`}
      style={{ width: size, height: size }}
      {...props}
    >
      {/* Inner Glowing Aura */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Animated Arrow Tracing */}
      <div className="relative w-5 h-5 overflow-hidden">
        <motion.div
          animate={hovered ? { x: 22, y: -22 } : { x: 0, y: 0 }}
          transition={{ duration: 0.35, ease: [0.76, 0, 0.24, 1] }}
          className="absolute inset-0 flex items-center justify-center text-white"
        >
          <ArrowUpRight size={20} strokeWidth={2} />
        </motion.div>
        <motion.div
          initial={{ x: -22, y: 22 }}
          animate={hovered ? { x: 0, y: 0 } : { x: -22, y: 22 }}
          transition={{ duration: 0.35, ease: [0.76, 0, 0.24, 1] }}
          className="absolute inset-0 flex items-center justify-center text-[#00d2ff]"
        >
          <ArrowUpRight size={20} strokeWidth={2} />
        </motion.div>
      </div>
    </button>
  );
}

// 2. ORGANIC FLUID CAPSULE MENU (METABALL CAPSULE BAR)
interface FluidCapsuleMenuProps {
  onLinkClick?: (link: string) => void;
  onCtaClick?: () => void;
  onLogoClick?: () => void;
}

export function FluidCapsuleMenu({ onLinkClick, onCtaClick, onLogoClick }: FluidCapsuleMenuProps) {
  const links = ["Security", "Products", "Support"];

  return (
    <div className="relative select-none animate-[sweep_0px]" style={{ width: 380, height: 48 }}>
      {/* SVG Background with organic, rounded bridging neck connectors */}
      <svg
        width="380"
        height="48"
        viewBox="0 0 380 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 drop-shadow-[0_4px_20px_rgba(0,0,0,0.25)]"
      >
        <path
          d="M 24,0 
             A 24,24 0 0,0 24,48 
             C 38,48 42,34 48,34 
             C 54,34 58,48 72,48 
             L 200,48 
             C 214,48 218,34 224,34 
             C 230,34 234,48 248,48 
             L 356,48 
             A 24,24 0 0,0 356,0 
             L 248,0 
             C 234,0 230,14 224,14 
             C 218,14 214,0 200,0 
             L 72,0 
             C 58,0 54,14 48,14 
             C 42,14 38,0 24,0 Z"
          fill="#0c0c0e"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1.2"
        />
      </svg>

      {/* Interactive content layer */}
      <div className="absolute inset-0 flex items-center justify-between text-white font-sans">
        
        {/* Left Circle: Globe icon */}
        <div 
          onClick={onLogoClick} 
          className="w-12 h-12 flex items-center justify-center text-white/80 hover:text-[#00d2ff] cursor-pointer transition-colors duration-300 group"
          title="About Us"
        >
          <Globe size={18} className="group-hover:rotate-12 transition-transform duration-300" />
        </div>

        {/* Middle Pill: Links */}
        <div className="flex items-center justify-center gap-3 px-2 flex-grow text-[12px] font-medium tracking-wide">
          {links.map((link, idx) => (
            <React.Fragment key={link}>
              <span
                onClick={() => onLinkClick?.(link.toLowerCase())}
                className="text-gray-400 hover:text-[#00d2ff] cursor-pointer transition-colors duration-200 py-1"
              >
                {link}
              </span>
              {idx < links.length - 1 && (
                <span className="w-[1px] h-3 bg-white/10" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Right Pill: CTA */}
        <div className="pr-1">
          <button
            onClick={onCtaClick}
            className="h-10 px-5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 active:scale-[0.98] text-[12px] font-semibold text-white tracking-wide transition-all duration-300 cursor-pointer"
            style={{ width: 120 }}
          >
            Download App
          </button>
        </div>

      </div>
    </div>
  );
}


// 3. GLOWING ACCENT RECTANGLE BUTTON
interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function GlowButton({ children, className = "", ...props }: GlowButtonProps) {
  return (
    <button
      className={`relative px-6 py-3 rounded-xl font-semibold text-[14px] text-white overflow-hidden group transition-all duration-300 hover:scale-[1.02] shadow-md hover:shadow-xl hover:shadow-[#0044ff]/15 bg-[#0044ff] cursor-pointer border border-[#0044ff] ${className}`}
      {...props}
    >
      {/* Light sweep animation */}
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:animate-[sweep_1.5s_ease-in-out_infinite]" />
      
      {/* Glow border aura */}
      <span className="absolute -inset-px rounded-xl border border-white/20 group-hover:border-white/40 pointer-events-none transition-colors" />

      {/* Button content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
}
