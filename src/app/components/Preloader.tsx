import { useEffect, useState } from "react";
import { motion } from "motion/react";
import DashboardDots2D from "./DashboardDots2D";

interface PreloaderProps {
  onComplete: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const duration = 2000; // 2 seconds total loading
    const intervalTime = 20;
    const steps = duration / intervalTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const currentProgress = Math.min(Math.round((currentStep / steps) * 100), 100);
      setProgress(currentProgress);

      if (currentStep >= steps) {
        clearInterval(timer);
        // Wait a tiny bit at 100% before completing
        setTimeout(() => {
          onComplete();
        }, 400);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
      <motion.div
        key="preloader"
        initial={{ y: 0 }}
        exit={{ y: "-100%", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "#0044ff",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "40px 24px",
          color: "#ffffff",
          overflow: "hidden"
        }}
      >
        <DashboardDots2D />

        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 500, textTransform: "uppercase", letterSpacing: 1, position: "relative", zIndex: 10 }}>
          <span>Unitincan</span>
          <span>Loading...</span>
        </div>

        <div style={{ alignSelf: "center", display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 10 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            style={{ fontFamily: "var(--font-pixel)", fontSize: "clamp(6rem, 15vw, 12rem)", lineHeight: 1 }}
          >
            {progress}%
          </motion.div>
        </div>

        <div style={{ width: "100%", height: 2, background: "rgba(255,255,255,0.2)", position: "relative", overflow: "hidden", zIndex: 10 }}>
          <motion.div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              height: "100%",
              background: "#ffffff",
            }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1, ease: "linear" }}
          />
        </div>
      </motion.div>
  );
}
