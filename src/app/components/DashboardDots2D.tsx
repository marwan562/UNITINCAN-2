import { useRef, useEffect } from "react";

export default function DashboardDots2D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    // Track mouse position globally
    let mouseX = -1000;
    let mouseY = -1000;
    let targetMouseX = -1000;
    let targetMouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseX = e.clientX - rect.left;
      targetMouseY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      targetMouseX = -1000;
      targetMouseY = -1000;
    };

    window.addEventListener("mousemove", handleMouseMove);
    canvas.parentElement?.addEventListener("mouseleave", handleMouseLeave);

    // Grid configuration
    const spacing = 12;
    let time = 0;

    // Smoothed mouse positions for easing ripples
    let currentMouseX = -1000;
    let currentMouseY = -1000;

    // Render loop function
    let isLoopRunning = false;
    let isIntersecting = false;

    const render = () => {
      if (!isIntersecting) {
        isLoopRunning = false;
        return;
      }
      isLoopRunning = true;
      time += 0.02;

      ctx.clearRect(0, 0, width, height);

      // Ease mouse coords
      if (targetMouseX === -1000) {
        currentMouseX += (-1000 - currentMouseX) * 0.1;
        currentMouseY += (-1000 - currentMouseY) * 0.1;
      } else {
        if (currentMouseX === -1000) {
          currentMouseX = targetMouseX;
          currentMouseY = targetMouseY;
        } else {
          currentMouseX += (targetMouseX - currentMouseX) * 0.08;
          currentMouseY += (targetMouseY - currentMouseY) * 0.08;
        }
      }

      const cols = Math.ceil(width / spacing) + 1;
      const rows = Math.ceil(height / spacing) + 1;

      // Render dot matrix
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * spacing;
          const y = r * spacing;

          // Distance from screen center for base waves
          const dxCenter = x - width / 2;
          const dyCenter = y - height / 2;
          const distCenter = Math.sqrt(dxCenter * dxCenter + dyCenter * dyCenter);

          // Overlapping sine waves for natural wave motion
          const wave1 = Math.sin(distCenter * 0.008 - time * 1.25) * 6;
          const wave2 = Math.cos(x * 0.015 + time * 0.9) * Math.sin(y * 0.015 + time * 1.1) * 3;

          // Mouse ripple logic
          let displacementX = 0;
          let displacementY = 0;
          let mouseInfluence = 0;

          if (currentMouseX !== -1000) {
            const dxMouse = x - currentMouseX;
            const dyMouse = y - currentMouseY;
            const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

            if (distMouse < 180) {
              const force = Math.pow((180 - distMouse) / 180, 2);
              const angle = Math.atan2(dyMouse, dxMouse);
              // Ripple wave radiating away from mouse
              const ripple = Math.sin(distMouse * 0.06 - time * 4.0) * 12 * force;
              
              displacementX = Math.cos(angle) * ripple;
              displacementY = Math.sin(angle) * ripple;
              mouseInfluence = force;
            }
          }

          // Final coordinates
          const drawX = x + displacementX;
          const drawY = y + wave1 + wave2 + displacementY;

          // Height factor mapped to a -1 to 1 range
          const heightFactor = (wave1 + wave2) / 9;
          const clampedHeight = Math.max(-1, Math.min(1, heightFactor));

          // Halftone scale: peaks are larger, valleys are smaller
          const baseRadius = 2.0;
          const scale = 1.0 + clampedHeight * 0.5 + mouseInfluence * 0.4;
          const radius = Math.max(0.6, baseRadius * scale);

          // Color mapping: electric sky blue (#88ccff) to pure white (#ffffff)
          // Low-lying valley coordinates have low opacity to create depth.
          const colorPct = (clampedHeight + 1) / 2; // 0 to 1
          let colorStr: string;

          if (colorPct < 0.4) {
            // Dark valleys: thin sky blue lines blending with background
            const alpha = 0.15 + (colorPct / 0.4) * 0.25;
            colorStr = `rgba(136, 204, 255, ${alpha})`;
          } else {
            // Bright peaks: glowing sky blue fading to crisp white
            const ratio = (colorPct - 0.4) / 0.6;
            const r = Math.round(136 + (255 - 136) * ratio);
            const g = Math.round(204 + (255 - 204) * ratio);
            colorStr = `rgb(${r}, ${g}, 255)`;
          }

          ctx.beginPath();
          ctx.arc(drawX, drawY, radius, 0, Math.PI * 2);
          ctx.fillStyle = colorStr;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    // IntersectionObserver to pause loop when section is scrolled out of view
    const observer = new IntersectionObserver(
      ([entry]) => {
        isIntersecting = entry.isIntersecting;
        if (isIntersecting && !isLoopRunning) {
          render();
        }
      },
      { threshold: 0.01 }
    );
    observer.observe(canvas);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      canvas.parentElement?.removeEventListener("mouseleave", handleMouseLeave);
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 1,
      }}
    />
  );
}
