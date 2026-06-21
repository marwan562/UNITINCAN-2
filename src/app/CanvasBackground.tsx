import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// Grid configuration (wide aspect ratio to span the entire screen width)
const GRID_SIZE_X = 110;
const GRID_SIZE_Z = 45;
const COUNT = GRID_SIZE_X * GRID_SIZE_Z;
const SPACING_X = 0.24;
const SPACING_Z = 0.24;

function WavingDots() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  
  // Track mouse globally across screen
  const mouse = useRef({ x: 0, y: 0 });
  const currentMouse = useRef({ x: 0, z: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Pre-allocate ThreeJS objects to avoid garbage collection overhead
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);
  
  // Colors for height-based gradient mapping: deep royal blue -> electric sky blue -> white
  const deepBlue = useMemo(() => new THREE.Color("#0a22aa"), []);
  const vibrantBlue = useMemo(() => new THREE.Color("#3b82f6"), []);
  const whiteColor = useMemo(() => new THREE.Color("#ffffff"), []);

  // Camera adjustment
  const { camera } = useThree();
  useEffect(() => {
    camera.lookAt(0, -0.6, 0);
  }, [camera]);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();
    const { width: viewportWidth, height: viewportHeight } = state.viewport;

    // Smoothly ease mouse coordinates mapped dynamically to the 3D viewport dimensions
    const targetMouseX = mouse.current.x * (viewportWidth * 0.55);
    const targetMouseZ = -mouse.current.y * (viewportHeight * 0.55) - 0.5;
    currentMouse.current.x += (targetMouseX - currentMouse.current.x) * 0.08;
    currentMouse.current.z += (targetMouseZ - currentMouse.current.z) * 0.08;

    // Position light to follow the eased cursor position
    if (lightRef.current) {
      lightRef.current.position.set(currentMouse.current.x, 2.2, currentMouse.current.z);
    }

    let i = 0;
    const maxHalfX = ((GRID_SIZE_X - 1) / 2) * SPACING_X;
    const maxHalfZ = ((GRID_SIZE_Z - 1) / 2) * SPACING_Z;

    for (let x = 0; x < GRID_SIZE_X; x++) {
      for (let z = 0; z < GRID_SIZE_Z; z++) {
        // Calculate centered positions
        const posX = (x - (GRID_SIZE_X - 1) / 2) * SPACING_X;
        const posZ = (z - (GRID_SIZE_Z - 1) / 2) * SPACING_Z;
        
        // Dynamic distance from center for radial wave calculations
        const distFromCenter = Math.sqrt(posX * posX + posZ * posZ);
        
        // Multi-layered waves for natural organic complexity
        const wave1 = Math.sin(distFromCenter * 0.45 - time * 1.25) * 0.45;
        const wave2 = Math.cos(posX * 0.35 + time * 0.9) * Math.sin(posZ * 0.35 + time * 1.1) * 0.25;
        
        // Mouse displacement calculation (ripple)
        const dx = posX - currentMouse.current.x;
        const dz = posZ - currentMouse.current.z;
        const distToMouse = Math.sqrt(dx * dx + dz * dz);
        
        let mouseDisplacement = 0;
        if (distToMouse < 4.0) {
          const influence = Math.pow((4.0 - distToMouse) / 4.0, 2);
          // Ripple wave radiating away from mouse coordinates
          mouseDisplacement = Math.sin(distToMouse * 2.8 - time * 3.5) * 0.28 * influence;
        }
        
        const posY = wave1 + wave2 + mouseDisplacement;
        
        // Position instance
        tempObject.position.set(posX, posY, posZ);
        
        // Smooth border vignette (elliptical fade out size at limits of grid)
        const dxNormalized = posX / maxHalfX;
        const dzNormalized = posZ / maxHalfZ;
        const ellipseDist = Math.sqrt(dxNormalized * dxNormalized + dzNormalized * dzNormalized);
        const edgeFactor = Math.max(0, 1 - ellipseDist);
        const smoothEdge = Math.pow(edgeFactor, 1.2);
        
        // Halftone scale modulation based on wave height: larger peaks, smaller valleys
        const scaleVal = (0.075 + posY * 0.038) * smoothEdge;
        tempObject.scale.set(scaleVal, scaleVal, scaleVal);
        
        tempObject.updateMatrix();
        meshRef.current.setMatrixAt(i, tempObject.matrix);
        
        // Interpolate colors based on height
        const heightFactor = (posY + 0.7) / 1.4;
        const clampedHeight = Math.max(0, Math.min(1, heightFactor));
        
        if (clampedHeight < 0.4) {
          tempColor.lerpColors(deepBlue, vibrantBlue, clampedHeight / 0.4);
        } else {
          tempColor.lerpColors(vibrantBlue, whiteColor, (clampedHeight - 0.4) / 0.6);
        }
        
        meshRef.current.setColorAt(i, tempColor);
        i++;
      }
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Dynamic light focusing specularity near the cursor */}
      <pointLight 
        ref={lightRef} 
        intensity={4.5} 
        distance={12} 
        color="#88ccff" 
      />
      
      <instancedMesh ref={meshRef} args={[null as any, null as any, COUNT]}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshStandardMaterial 
          roughness={0.15} 
          metalness={0.2}
        />
      </instancedMesh>
    </group>
  );
}

export default function CanvasBackground() {
  return (
    <div style={{ 
      width: "100%", 
      height: "100%", 
      position: "absolute", 
      inset: 0, 
      zIndex: 0, 
      pointerEvents: "none",
      background: "radial-gradient(circle at 50% 40%, rgba(0, 68, 255, 0.06) 0%, rgba(255, 255, 255, 0) 70%)"
    }}>
      <Canvas camera={{ position: [0, 4.4, 7.8], fov: 48 }}>
        <fog attach="fog" args={["#ffffff", 7.0, 12.0]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 12, -2]} intensity={0.7} color="#ffffff" />
        <WavingDots />
      </Canvas>
      {/* Frosted Glass vignette bottom cover */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "140px",
        background: "linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1))",
        pointerEvents: "none"
      }} />
    </div>
  );
}
