import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

interface ScrubTextRevealProps {
  text: string;
  className?: string;
}

export default function ScrubTextReveal({ text, className = "" }: ScrubTextRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Format text with <br/> for \n newlines
  const content = text.split("\n").map((line, i, arr) => (
    <React.Fragment key={i}>
      {line}
      {i < arr.length - 1 && <br />}
    </React.Fragment>
  ));

  useEffect(() => {
    // We wrap in a short timeout to ensure the DOM has painted the text
    // before SplitText calculates the physical dimensions.
    const timer = setTimeout(() => {
      if (!containerRef.current) return;
      
      const ctx = gsap.context(() => {
        // Use official GSAP SplitText plugin
        const split = new SplitText(containerRef.current, { type: "words, chars" });
        
        // Set initial state for characters
        gsap.set(split.chars, { opacity: 0.3, color: "inherit" });
        
        // Scrub animation
        gsap.to(split.chars, {
          opacity: 1,
          color: "#000000",
          textShadow: "none",
          stagger: 0.1,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
            end: "bottom 30%",
            scrub: 1,
          }
        });
      }, containerRef);
      
      return () => ctx.revert();
    }, 50);

    return () => clearTimeout(timer);
  }, [text]);

  return (
    <div ref={containerRef} className={className}>
      {content}
    </div>
  );
}
