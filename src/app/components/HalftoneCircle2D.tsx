import { useRef, useEffect } from "react";

export default function HalftoneCircle2D() {
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

    // Mouse coordinates relative to the circle center
    let mouseX = -1000;
    let mouseY = -1000;
    let targetMouseX = -1000;
    let targetMouseY = -1000;

    let rotationSpeed = 0.25;
    let targetRotationSpeed = 0.25;
    let currentAngle = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      
      const mx = e.clientX - rect.left - cx;
      const my = e.clientY - rect.top - cy;
      const dist = Math.sqrt(mx * mx + my * my);
      
      const R = Math.min(rect.width, rect.height) * 0.42;

      // Only hover if cursor is inside the 2D halftone model circle
      if (dist < R) {
        targetMouseX = mx;
        targetMouseY = my;
        targetRotationSpeed = 0.95; // Accelerate rotation speed on hover
      } else {
        targetMouseX = -1000;
        targetMouseY = -1000;
        targetRotationSpeed = 0.25; // Revert to baseline speed
      }
    };

    const handleMouseLeave = () => {
      targetMouseX = -1000;
      targetMouseY = -1000;
      targetRotationSpeed = 0.25;
    };

    window.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    // Grid spacing
    const spacing = 9.5;

    // Animation variables
    let isIntersecting = false;
    let isLoopRunning = false;

    const render = () => {
      if (!isIntersecting) {
        isLoopRunning = false;
        return;
      }
      isLoopRunning = true;

      // Ease rotation speed and update angle
      rotationSpeed += (targetRotationSpeed - rotationSpeed) * 0.06;
      currentAngle += rotationSpeed * 0.035;

      // Ease mouse tracking positions for smooth local displacement ripples
      if (targetMouseX === -1000) {
        mouseX += (-1000 - mouseX) * 0.1;
        mouseY += (-1000 - mouseY) * 0.1;
      } else {
        if (mouseX === -1000) {
          mouseX = targetMouseX;
          mouseY = targetMouseY;
        } else {
          mouseX += (targetMouseX - mouseX) * 0.08;
          mouseY += (targetMouseY - mouseY) * 0.08;
        }
      }

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const R = Math.min(width, height) * 0.42;

      const cols = Math.ceil((2 * R) / spacing);
      const rows = Math.ceil((2 * R) / spacing);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          // Centered coordinate
          const x = (c - (cols - 1) / 2) * spacing;
          const y = (r - (rows - 1) / 2) * spacing;

          const dist = Math.sqrt(x * x + y * y);
          // Crop elements outside the circle boundary
          if (dist > R) continue;

          const theta = Math.atan2(y, x);
          const u = dist / R; // normalized distance from center (0 to 1)

          // Lobe pattern math: sin^2(2*theta - currentAngle) * radial bell curve
          // This generates exactly 4 lobes separated by a vertical & horizontal white cross.
          const density = Math.pow(Math.sin(2 * theta - currentAngle), 2) * (u * (1 - u) * 4);

          // Localized ripple displacement (only pushes dots within hovered region)
          let dx = 0;
          let dy = 0;
          let mouseInfluence = 0;

          if (mouseX !== -1000) {
            const dxMouse = x - mouseX;
            const dyMouse = y - mouseY;
            const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

            if (distMouse < 75) {
              const force = Math.pow((75 - distMouse) / 75, 2);
              const angle = Math.atan2(dyMouse, dxMouse);
              const push = force * 6; // push force
              
              dx = Math.cos(angle) * push;
              dy = Math.sin(angle) * push;
              mouseInfluence = force;
            }
          }

          const drawX = cx + x + dx;
          const drawY = cy + y + dy;

          // Scale: peaks are large (glowing cores), valleys are tiny (thin borders)
          const maxRadius = 3.6;
          const baseRadius = 0.7;
          const radius = baseRadius + density * (maxRadius - baseRadius) + mouseInfluence * 0.45;

          // Colors: mix electric sky blue (#3b82f6), brand blue (#0044ff), and crisp white (#ffffff)
          let colorStr: string;
          
          if (density > 0.45) {
            // Hot core: vibrant sky blue blending to pure white
            const ratio = (density - 0.45) / 0.55;
            const rVal = Math.round(59 + (255 - 59) * ratio);     // #3b82f6 is (59, 130, 246)
            const gVal = Math.round(130 + (255 - 130) * ratio);
            colorStr = `rgb(${rVal}, ${gVal}, 255)`;
          } else {
            // Cool shroud: brand blue blending to electric sky blue
            const ratio = density / 0.45;
            const rVal = Math.round(0 + (59 - 0) * ratio);        // #0044ff is (0, 68, 255)
            const gVal = Math.round(68 + (130 - 68) * ratio);
            colorStr = `rgba(${rVal}, ${gVal}, 255, ${0.2 + ratio * 0.8})`;
          }

          ctx.beginPath();
          ctx.arc(drawX, drawY, radius, 0, Math.PI * 2);
          ctx.fillStyle = colorStr;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    // IntersectionObserver to pause loop when out of view
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
      canvas.removeEventListener("mouseleave", handleMouseLeave);
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
        cursor: "pointer"
      }}
    />
  );
}
