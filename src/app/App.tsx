import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
import { ArrowRight, Server, Zap, ShieldCheck, Cpu, Layers, Network, Activity, Lock, Box, CheckCircle2 } from "lucide-react";
import Preloader from "./components/Preloader";
import CanvasBackground from "./CanvasBackground";
import ScrubTextReveal from "./components/ScrubTextReveal";
import DashboardDots2D from "./components/DashboardDots2D";
import HalftoneCircle2D from "./components/HalftoneCircle2D";
import FlowBuilder from "./components/flow/FlowBuilder";
import AboutSection from "./components/AboutSection";
import { GlowButton, FluidCapsuleMenu } from "./components/ui/PremiumButtons";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState<'landing' | 'about'>('landing');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 150);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (loading || activePage !== "landing") return;

    const ctx = gsap.context(() => {
      setTimeout(() => {
        const reveals = gsap.utils.toArray(".gsap-reveal");
        reveals.forEach((el: any) => {
          gsap.from(el, {
            y: 40,
            opacity: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
            }
          });
        });
        ScrollTrigger.refresh();
      }, 50);
    });

    return () => ctx.revert();
  }, [loading, activePage]);


  return (
    <div className="bg-white text-gray-900 flex flex-col min-h-screen font-sans selection:bg-[#0044ff] selection:text-white">
      <AnimatePresence>
        {loading && <Preloader onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      <div className="flex-grow">
        <Header activePage={activePage} setActivePage={setActivePage} />

        {/* Floating Quick Nav Metaball Capsule */}
        <AnimatePresence>
          {activePage === "landing" && scrolled && (
            <motion.div
              key="floating-capsule-nav"
              initial={{ y: 80, x: "-50%", opacity: 0 }}
              animate={{ y: 0, x: "-50%", opacity: 1 }}
              exit={{ y: 80, x: "-50%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="fixed bottom-8 left-1/2 z-50 hidden md:block"
            >
              <FluidCapsuleMenu
                onLinkClick={(link) => {
                  const targetId = link === "security" ? "automation" : link === "products" ? "solutions" : "benefits";
                  document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
                }}
                onCtaClick={() => {
                  alert("Thank you for your interest! A UNITINCAN edge engineering expert will reach out shortly to schedule your demo.");
                }}
                onLogoClick={() => {
                  setActivePage("about");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <main>

          <AnimatePresence mode="wait">
            {activePage === "landing" ? (
              <motion.div
                key="landing-page"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <HeroSection animateIn={!loading} />
                <MockupSection />
                <SolutionsSection />
                <BenefitsSection />
                <BlogSection />
                <WelcomeSection setActivePage={setActivePage} />
                <GetStartedSection />

              </motion.div>
            ) : (
              <motion.div
                key="about-page"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <AboutSection />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
        <Footer activePage={activePage} setActivePage={setActivePage} />
      </div>
    </div>
  );
}


function Header({ activePage, setActivePage }: { activePage: string; setActivePage: (p: 'landing' | 'about') => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const menuTimelineRef = useRef<gsap.core.Timeline | null>(null);

  // GSAP ScrollTrigger to detect scroll position
  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        start: "top -80",
        onUpdate: (self) => {
          setScrolled(self.progress > 0);
        },
      });
    });
    return () => ctx.revert();
  }, []);

  const ctxRef = useRef<gsap.Context>();

  useEffect(() => {
    ctxRef.current = gsap.context(() => { }, overlayRef);
    return () => ctxRef.current?.revert();
  }, []);

  // GSAP menu open/close animation
  useEffect(() => {
    if (!overlayRef.current) return;

    ctxRef.current?.add(() => {
      gsap.killTweensOf([overlayRef.current, ".menu-link", ".menu-label", ".menu-cta"]);

      if (menuOpen) {
        document.body.style.overflow = "hidden";
        const tl = gsap.timeline();

        tl.to(overlayRef.current, {
          clipPath: "circle(150% at calc(100% - 48px) 40px)",
          duration: 0.8,
          ease: "power4.inOut",
        })
          .fromTo(".menu-link",
            { y: 80, opacity: 0, rotateX: -90 },
            { y: 0, opacity: 1, rotateX: 0, stagger: 0.08, duration: 0.6, ease: "power4.out" },
            "-=0.3"
          )
          .fromTo(".menu-label",
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.4, ease: "power3.out" },
            "-=0.4"
          )
          .fromTo(".menu-cta",
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, ease: "power3.out" },
            "-=0.3"
          );
      } else {
        document.body.style.overflow = "";

        // Punchy, sharp exit animation ("not soft")
        const tl = gsap.timeline();
        tl.to(".menu-link, .menu-cta, .menu-label", {
          y: 30,
          opacity: 0,
          stagger: 0.02,
          duration: 0.25,
          ease: "power3.in", // Accelerate out
        })
          .to(overlayRef.current, {
            clipPath: "circle(0% at calc(100% - 48px) 40px)",
            duration: 0.4, // Faster, sharper close
            ease: "expo.in", // Hard snap shut
          }, "-=0.15");
      }
    });
  }, [menuOpen]);

  const navItems = ["Automation", "Solutions", "Benefits", "Blog", "About"];
  const navMap: Record<string, string> = {
    "Automation": "automation",
    "Solutions": "solutions",
    "Benefits": "benefits",
    "Blog": "blog",
    "About": "about"
  };

  const handleLogoClick = () => {
    setActivePage("landing");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)]"
        style={{
          padding: scrolled ? "12px 16px 0" : "0",
        }}
      >
        <div
          className="flex items-center justify-between transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)]"
          style={{
            width: scrolled ? "min(540px, 90vw)" : "100%",
            backgroundColor: scrolled ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.8)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderRadius: scrolled ? "100px" : "0",
            padding: scrolled ? "10px 24px" : "20px 32px",
            borderBottom: scrolled ? "none" : "1px solid rgba(0,0,0,0.06)",
            boxShadow: scrolled
              ? "0 4px 30px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)"
              : "none",
          }}
        >
          {/* Logo */}
          <div onClick={handleLogoClick} className="flex items-center gap-2 cursor-pointer group">
            <span
              style={{ fontFamily: "var(--font-sans)" }}
              className="font-bold tracking-wide uppercase"
            >
              <span className={`transition-all duration-500 ${scrolled ? "text-[16px] text-[#0044ff]" : "text-xl text-black hover:text-[#0044ff]"}`}>
                UNITINCAN
              </span>
            </span>
          </div>

          {/* Desktop Nav Links — hidden when scrolled */}
          <nav
            className="hidden md:flex items-center gap-8 transition-all duration-500"
            style={{
              opacity: scrolled ? 0 : 1,
              width: scrolled ? 0 : "auto",
              overflow: "hidden",
              pointerEvents: scrolled ? "none" : "auto",
            }}
          >
            {navItems.map((item) => {
              const targetId = navMap[item];
              return (
                <a
                  key={item}
                  href={`#${targetId}`}
                  onClick={(e) => {
                    e.preventDefault();
                    if (targetId === "about") {
                      setActivePage("about");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    } else {
                      if (activePage !== "landing") {
                        setActivePage("landing");
                        setTimeout(() => {
                          document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
                        }, 150);
                      } else {
                        document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
                      }
                    }
                  }}
                  className={`text-[15px] font-medium transition-colors whitespace-nowrap ${item === "About" && activePage === "about"
                    ? "text-[#0044ff]"
                    : activePage === "about" && item !== "About"
                      ? "text-gray-400 hover:text-black"
                      : "text-gray-600 hover:text-black"
                    }`}
                >
                  {item}
                </a>
              );
            })}
          </nav>

          {/* Right side: CTA + Burger */}
          <div className="flex items-center gap-4">
            {/* Request Demo — visible only when NOT scrolled on desktop */}
            <a
              href="#"
              className="hidden sm:block text-[14px] font-semibold transition-all duration-500 whitespace-nowrap"
              style={{
                opacity: scrolled ? 0 : 1,
                width: scrolled ? 0 : "auto",
                overflow: "hidden",
                padding: scrolled ? 0 : "10px 20px",
                backgroundColor: scrolled ? "transparent" : "#eff6ff",
                color: "#0044ff",
                borderRadius: "10px",
                pointerEvents: scrolled ? "none" : "auto",
              }}
            >
              Request Demo
            </a>

            {/* Burger — visible ALWAYS when scrolled, on mobile always */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="relative flex flex-col items-center justify-center transition-all duration-500"
              style={{
                width: 36,
                height: 36,
                opacity: scrolled ? 1 : 0,
                pointerEvents: scrolled ? "auto" : "none",
                transform: scrolled ? "scale(1)" : "scale(0.5)",
              }}
              aria-label="Toggle menu"
            >
              <span
                className="block bg-gray-900 rounded-full transition-all duration-500"
                style={{
                  width: 22,
                  height: 2,
                  transform: menuOpen ? "rotate(45deg) translate(0, 0)" : "translate(0, -4px)",
                }}
              />
              <span
                className="block bg-gray-900 rounded-full transition-all duration-500"
                style={{
                  width: 22,
                  height: 2,
                  opacity: menuOpen ? 0 : 1,
                }}
              />
              <span
                className="block bg-gray-900 rounded-full transition-all duration-500"
                style={{
                  width: 22,
                  height: 2,
                  transform: menuOpen ? "rotate(-45deg) translate(0, 0)" : "translate(0, 4px)",
                }}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen menu overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-40"
        style={{
          clipPath: "circle(0% at calc(100% - 48px) 40px)",
          background: "linear-gradient(160deg, #000000 0%, #0a0a1a 40%, #001133 100%)",
        }}
      >
        <div className="flex flex-col justify-center h-full px-10 md:px-20 lg:px-32 pt-24">
          <p className="menu-label text-[12px] uppercase tracking-[0.3em] text-gray-500 font-medium mb-10">
            Navigation
          </p>
          <div className="flex flex-col gap-1">
            {navItems.map((item, i) => {
              const targetId = navMap[item];
              return (
                <div key={item} className="overflow-hidden">
                  <a
                    href={`#${targetId}`}
                    className={`menu-link block text-[clamp(36px,6vw,72px)] font-bold transition-colors duration-300 leading-[1.15] tracking-tight ${item === "About" && activePage === "about"
                      ? "text-[#0044ff]"
                      : "text-white/90 hover:text-[#0044ff]"
                      }`}
                    style={{ perspective: "600px" }}
                    onClick={(e) => {
                      setMenuOpen(false);
                      e.preventDefault();
                      setTimeout(() => {
                        if (targetId === "about") {
                          setActivePage("about");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        } else {
                          if (activePage !== "landing") {
                            setActivePage("landing");
                            setTimeout(() => {
                              document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
                            }, 150);
                          } else {
                            document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
                          }
                        }
                      }, 500);
                    }}
                  >
                    <span className="text-[#0044ff]/80 font-mono text-[14px] mr-4 align-top">

                      0{i + 1}
                    </span>
                    {item}
                  </a>
                </div>
              );
            })}
          </div>

          <div className="mt-16 flex flex-col sm:flex-row gap-4">
            <a
              href="#"
              className="menu-cta inline-flex items-center justify-center bg-[#0044ff] text-white px-8 py-4 rounded-xl text-[15px] font-semibold hover:bg-blue-600 transition-all duration-300 hover:scale-105"
              onClick={() => setMenuOpen(false)}
            >
              Request Demo
              <ArrowRight className="ml-2" size={16} />
            </a>
            <a
              href="#"
              className="menu-cta inline-flex items-center justify-center border border-white/20 text-white/70 px-8 py-4 rounded-xl text-[15px] font-semibold hover:bg-white/5 hover:text-white transition-all duration-300"
              onClick={() => setMenuOpen(false)}
            >
              Sign In
            </a>
          </div>

          {/* Decorative corner text */}
          <div className="menu-label absolute bottom-10 right-10 md:right-20 text-right">
            <p className="text-[11px] uppercase tracking-[0.2em] text-gray-600 font-medium">
              UNITINCAN © 2026
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function HeroSection({ animateIn }: { animateIn: boolean }) {
  const heroRef = useRef(null);

  useEffect(() => {
    if (!animateIn) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.1 });

      tl.from(".hero-title-line", {
        y: 100,
        opacity: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: "power4.out"
      });

      tl.from(".hero-desc", {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
      }, "-=0.8");

      tl.from(".hero-btn", {
        y: 20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out"
      }, "-=0.8");

    }, heroRef);
    return () => ctx.revert();
  }, [animateIn]);

  return (
    <div ref={heroRef} className="relative w-full overflow-hidden">
      <div className="absolute inset-0 z-0">
        <CanvasBackground />
      </div>
      <section className="pt-28 pb-20 px-4 text-center max-w-4xl mx-auto relative z-10 pointer-events-none">
        <h1 className="text-[52px] md:text-[68px] leading-[1.05] font-bold text-gray-900 tracking-tight mb-6">
          <div className="overflow-hidden inline-block"><div className="hero-title-line">Build Intelligent Systems</div></div>
          <br className="hidden md:block" />
          <div className="overflow-hidden inline-block"><div className="hero-title-line">Without The Chaos</div></div>
        </h1>

        <p className="hero-desc text-[17px] md:text-[19px] text-gray-500 leading-relaxed max-w-[640px] mx-auto mb-10">
          Design, Deploy, And Scale IoT Solutions Smoothly With Enterprise Tools That Keep Your Hardware Aligned And Connected.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center w-full gap-4 pointer-events-auto hero-btn">
          <GlowButton
            className="w-full sm:w-[200px]"
            onClick={() => document.getElementById("automation")?.scrollIntoView({ behavior: "smooth" })}
          >
            Request Demo
          </GlowButton>
          <button
            onClick={() => document.getElementById("solutions")?.scrollIntoView({ behavior: "smooth" })}
            className="bg-white text-gray-850 py-3.5 rounded-xl text-[14px] font-semibold border border-gray-250 shadow-sm hover:bg-gray-50 transition-all duration-300 hover:scale-[1.02] cursor-pointer w-full sm:w-[200px]"
          >
            Explore Platform
          </button>
        </div>

      </section>
    </div>
  );
}

function MockupSection() {
  return (
    <section id="automation" className="relative w-full overflow-hidden pt-12 pb-24">
      {/* Background with modern dynamic 2D dots */}
      <div className="absolute inset-0 bg-[#0044ff] top-[20%]">
        <DashboardDots2D />
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-white to-transparent z-10" />
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-4">
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-white rounded-t-2xl rounded-b-lg shadow-2xl overflow-hidden border border-gray-200/50 backdrop-blur-sm bg-white/95 ring-1 ring-black/5"
        >
          {/* Mac OS window header dots */}
          <div className="h-12 border-b border-gray-100 flex items-center px-5 gap-2.5 bg-gray-50/80">
            <div className="w-3.5 h-3.5 rounded-full bg-red-400"></div>
            <div className="w-3.5 h-3.5 rounded-full bg-amber-400"></div>
            <div className="w-3.5 h-3.5 rounded-full bg-green-400"></div>
          </div>
          <FlowBuilder />
        </motion.div>
      </div>
    </section>
  );
}

function SolutionsSection() {
  const [activeTab, setActiveTab] = useState(0);
  const solutions = [
    { title: "Hardware Integration Graph", icon: <Network />, desc: "A Unified View Of Your Entire Device Landscape, Mapping Relationships Across Sensors, Gateways, And Cloud Workflows." },
    { title: "Firmware Builder", icon: <Cpu />, desc: "Visually Compose And Deploy Firmware Updates Across Thousands Of Devices With Confidence." },
    { title: "IoT Automation Engine", icon: <Layers />, desc: "Trigger Complex Workflows Based On Real-Time Telemetry And Predictive AI Models." },
    { title: "Edge Security & Control", icon: <ShieldCheck />, desc: "Zero-Trust Architecture Enforced At The Edge, Securing Every Node In Your Infrastructure." }
  ];

  return (
    <section id="solutions" className="max-w-[1300px] mx-auto px-8 py-24 border-t border-gray-200">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-8">
        <div className="max-w-2xl">
          <p className="gsap-reveal text-[#0044ff] font-bold text-[13px] tracking-widest uppercase mb-4">Solutions</p>
          <ScrubTextReveal
            text="Everything You Need To Run IoT At Enterprise Scale."
            className="gsap-reveal text-[40px] md:text-[52px] leading-[1.05] font-bold tracking-tight text-gray-900"
          />
        </div>
        <div className="max-w-[360px] flex flex-col gap-6 lg:mb-2">
          <p className="gsap-reveal text-gray-600 text-[16px] leading-relaxed">
            Every device is managed, monitored, and governed within a structured enterprise-ready framework.
          </p>
          <div className="gsap-reveal">
            <a href="#" className="inline-flex items-center justify-center gap-2 bg-[#0044ff] text-white px-6 py-3.5 rounded-lg text-[15px] font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/10">
              See Platform in Action
              <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-full">
        {/* Left Tabs */}
        <div className="w-full lg:w-[440px] flex flex-col gap-4">
          {solutions.map((sol, i) => (
            <div
              key={i}
              onClick={() => setActiveTab(i)}
              className={`border rounded-2xl p-6 cursor-pointer transition-all duration-300 ${activeTab === i ? 'border-[#0044ff]/30 bg-[#eff6ff] shadow-sm' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
            >
              <div className="flex items-center gap-4 mb-3">
                <div className={`p-2.5 rounded-xl ${activeTab === i ? 'bg-[#0044ff] text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {React.cloneElement(sol.icon, { size: 22 })}
                </div>
                <h3 className={`font-semibold text-[19px] ${activeTab === i ? 'text-[#0044ff]' : 'text-gray-900'}`}>{sol.title}</h3>
              </div>
              <AnimatePresence>
                {activeTab === i && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <p className="text-[15px] text-gray-600 leading-[1.6] pt-1">
                      {sol.desc}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Right Graphic */}
        <div className="flex-1 relative border border-[#0044ff]/10 rounded-2xl overflow-hidden min-h-[500px] bg-[#0044ff] shadow-inner group">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjMDA0NGZmIj48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDBMOCA4Wk04IDBMMCA4WiIgc3Ryb2tlPSIjMWE1NmZmIiBzdHJva2Utd2lkdGg9IjEiPjwvcGF0aD4KPC9zdmc+')] opacity-40"></div>

          <div className="absolute inset-x-0 bottom-[-20%] h-[80%] rounded-full border border-white/20 flex items-center justify-center transition-transform duration-700 group-hover:scale-105">
            <div className="w-[80%] h-[80%] rounded-full border border-white/10 flex items-center justify-center relative">
              <div className="w-[60%] h-[60%] rounded-full border border-white/5 animate-pulse"></div>
            </div>
            {/* Grid lines */}
            <div className="absolute w-full h-[1px] bg-white/10"></div>
            <div className="absolute w-[1px] h-full bg-white/10"></div>
            <div className="absolute w-full h-[1px] bg-white/10 rotate-45"></div>
            <div className="absolute w-[1px] h-full bg-white/10 -rotate-45"></div>
          </div>

          {/* Floating Elements */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 z-10"
            >
              {activeTab === 0 && (
                <>
                  <FloatingNode top="35%" left="25%" icon={<Box />} delay={0} />
                  <FloatingNode top="65%" left="55%" icon={<Network />} delay={0.2} />
                  <FloatingNode top="20%" left="65%" icon={<Server />} delay={0.4} />
                </>
              )}
              {activeTab === 1 && (
                <>
                  <FloatingNode top="40%" left="40%" icon={<Cpu />} delay={0} />
                  <FloatingNode top="20%" left="20%" icon={<Box />} delay={0.2} />
                </>
              )}
              {activeTab === 2 && (
                <>
                  <FloatingNode top="50%" left="50%" icon={<Layers />} delay={0} />
                  <FloatingNode top="30%" left="70%" icon={<Zap />} delay={0.2} />
                </>
              )}
              {activeTab === 3 && (
                <>
                  <FloatingNode top="45%" left="45%" icon={<ShieldCheck />} delay={0} />
                  <FloatingNode top="15%" left="80%" icon={<Lock />} delay={0.2} />
                  <FloatingNode top="75%" left="20%" icon={<CheckCircle2 />} delay={0.4} />
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function FloatingNode({ top, left, icon, delay }: { top: string, left: string, icon: React.ReactNode, delay: number }) {
  return (
    <motion.div
      initial={{ y: 10 }}
      animate={{ y: -10 }}
      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", repeatType: "reverse", delay }}
      className="absolute w-14 h-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl flex items-center justify-center text-white"
      style={{ top, left }}
    >
      {icon}
    </motion.div>
  );
}

function BenefitsSection() {
  const benefits = [
    { title: "Rapid Deployment", desc: "Launch Enterprise-Grade Connected Hardware In Days, Not Months.", icon: <Zap /> },
    { title: "Operational Efficiency", desc: "Automate Repetitive Workflows And Free Teams For Higher-Value Engineering.", icon: <Activity /> },
    { title: "Complete Visibility", desc: "Maintain Full Governance And Policy Enforcement Across Every Edge Device.", icon: <Network /> },
    { title: "Scalable Infrastructure", desc: "Deploy Across Global Facilities Without Rebuilding Your System Architecture.", icon: <Server /> },
    { title: "Secure By Design", desc: "Protect Telemetry Data, Enforce Access Controls, And Meet Enterprise Compliance.", icon: <ShieldCheck /> }
  ];

  return (
    <section id="benefits" className="max-w-[1300px] mx-auto px-8 py-24 border-t border-gray-200">
      <div className="mb-16">
        <p className="gsap-reveal text-[#0044ff] font-bold text-[13px] tracking-widest uppercase mb-4">Benefits</p>
        <ScrubTextReveal
          text="Built To Run Production Without Friction."
          className="gsap-reveal text-[40px] md:text-[52px] leading-[1.05] font-bold tracking-tight text-gray-900 max-w-2xl"
        />
      </div>

      <div className="flex flex-col gap-6">
        {/* Top Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {benefits.slice(0, 2).map((b, i) => (
            <div key={i} className="bg-gray-50 border border-gray-200 rounded-2xl p-10 min-h-[280px] flex flex-col justify-between hover:border-gray-300 transition-colors group">
              <div className="w-14 h-14 bg-white border border-gray-200 shadow-sm rounded-xl flex items-center justify-center mb-16 text-gray-700 group-hover:text-[#0044ff] group-hover:border-[#0044ff]/30 transition-all">
                {React.cloneElement(b.icon, { size: 24 })}
              </div>
              <div>
                <h3 className="text-[22px] font-bold text-gray-900 mb-3">{b.title}</h3>
                <p className="text-[16px] text-gray-600 leading-relaxed">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {benefits.slice(2, 5).map((b, i) => (
            <div key={i} className="bg-gray-50 border border-gray-200 rounded-2xl p-10 min-h-[280px] flex flex-col justify-between hover:border-gray-300 transition-colors group">
              <div className="w-14 h-14 bg-white border border-gray-200 shadow-sm rounded-xl flex items-center justify-center mb-16 text-gray-700 group-hover:text-[#0044ff] group-hover:border-[#0044ff]/30 transition-all">
                {React.cloneElement(b.icon, { size: 24 })}
              </div>
              <div>
                <h3 className="text-[19px] font-bold text-gray-900 mb-3">{b.title}</h3>
                <p className="text-[15px] text-gray-600 leading-relaxed">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BlogSection() {
  const blogPosts = [
    {
      category: "IoT Strategy",
      title: "Scaling IoT Architectures: From 10 to 10,000 Edge Nodes",
      desc: "Key architectural decisions, hardware protocols, and load balancing strategies for enterprise IoT rollouts.",
      meta: "Marwan Hassan • June 15, 2026 • 6 min read",
      graphic: (
        <svg width="280" height="200" viewBox="0 0 280 200" xmlns="http://www.w3.org/2000/svg" className="relative z-10">
          <circle cx="140" cy="100" r="45" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx="140" cy="100" r="10" fill="#0044ff" />
          <path stroke="#0044ff" strokeWidth="1.5" strokeDasharray="3 3" d="M 140 100 L 70 50" />
          <path stroke="#0044ff" strokeWidth="1.5" strokeDasharray="3 3" d="M 140 100 L 210 50" />
          <path stroke="#0044ff" strokeWidth="1.5" strokeDasharray="3 3" d="M 140 100 L 70 150" />
          <path stroke="#0044ff" strokeWidth="1.5" strokeDasharray="3 3" d="M 140 100 L 210 150" />
          <circle cx="70" cy="50" r="14" fill="white" stroke="#cbd5e1" strokeWidth="1.5" />
          <circle cx="210" cy="50" r="14" fill="white" stroke="#cbd5e1" strokeWidth="1.5" />
          <circle cx="70" cy="150" r="14" fill="white" stroke="#cbd5e1" strokeWidth="1.5" />
          <circle cx="210" cy="150" r="14" fill="white" stroke="#cbd5e1" strokeWidth="1.5" />
          <circle cx="70" cy="50" r="6" fill="#10b981" />
          <circle cx="210" cy="50" r="6" fill="#10b981" />
          <circle cx="70" cy="150" r="6" fill="#10b981" />
          <circle cx="210" cy="150" r="6" fill="#10b981" />
        </svg>
      )
    },
    {
      category: "Engineering",
      title: "Why We Built Our Visual Automation Engine on React Flow",
      desc: "An in-depth look at visual graph orchestration, dynamic node state propagation, and the future of drag-and-drop IoT workflows.",
      meta: "Sarah Jenkins • June 08, 2026 • 8 min read",
      graphic: (
        <svg width="280" height="200" viewBox="0 0 280 200" xmlns="http://www.w3.org/2000/svg" className="relative z-10">
          <rect x="40" y="85" width="55" height="30" fill="white" stroke="#94a3b8" strokeWidth="1.5" rx="6" />
          <rect x="185" y="85" width="55" height="30" fill="white" stroke="#0044ff" strokeWidth="1.5" rx="6" />
          <path stroke="#0044ff" strokeWidth="1.5" fill="none" strokeDasharray="3 3" d="M 95 100 L 185 100" />
          <polygon points="180,96 185,100 180,104" fill="#0044ff" />
          <circle cx="67" cy="100" r="4" fill="#64748b" />
          <circle cx="212" cy="100" r="4" fill="#0044ff" />
        </svg>
      )
    },
    {
      category: "Security",
      title: "Zero-Trust Edge Security: Hardening Gateway Telemetry",
      desc: "Protecting IoT devices against side-channel exploits, telemetry spoofing, and firmware tampering at scale.",
      meta: "Alex Carter • May 28, 2026 • 5 min read",
      graphic: (
        <svg width="280" height="200" viewBox="0 0 280 200" xmlns="http://www.w3.org/2000/svg" className="relative z-10">
          <rect x="95" y="55" width="90" height="90" fill="white" stroke="#94a3b8" strokeWidth="1.5" rx="12" />
          <circle cx="140" cy="95" r="14" fill="none" stroke="#f97316" strokeWidth="2.5" />
          <rect x="135" y="95" width="10" height="18" fill="#f97316" rx="2" />
          <path stroke="#cbd5e1" strokeWidth="1.5" d="M 65 100 L 95 100" />
          <path stroke="#cbd5e1" strokeWidth="1.5" d="M 185 100 L 215 100" />
          <circle cx="65" cy="100" r="4" fill="#64748b" />
          <circle cx="215" cy="100" r="4" fill="#64748b" />
        </svg>
      )
    }
  ];

  return (
    <section id="blog" className="max-w-[1300px] mx-auto px-8 py-24 border-t border-gray-200 relative">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20 relative z-10">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-[#0044ff]/10 blur-[100px] rounded-full z-0 pointer-events-none" />

        <div className="lg:col-span-7 relative z-10">
          <p className="gsap-reveal text-[#0044ff] font-bold text-[13px] tracking-widest uppercase mb-4">Blog</p>
          <ScrubTextReveal
            text="Latest Insights From The IoT Edge."
            className="gsap-reveal text-[40px] md:text-[52px] leading-[1.05] font-bold tracking-tight text-gray-900"
          />
        </div>
        <div className="lg:col-span-5 flex items-start pt-2 relative z-10">
          <p className="gsap-reveal text-[17px] text-gray-600 leading-relaxed max-w-[480px]">
            Explore strategy guides, product updates, and deep dives from our engineering and IoT security research teams.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {blogPosts.map((post, idx) => (
          <div key={idx} className="flex flex-col bg-white border border-gray-100 hover:border-[#0044ff]/30 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer relative overflow-hidden">
            {/* Visual Graphic Header */}
            <div className="w-full bg-gray-50 rounded-2xl mb-5 relative overflow-hidden aspect-[1.45/1] flex items-center justify-center border border-gray-100 group-hover:bg-[#eff6ff]/40 transition-colors duration-300">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-[#0044ff]/5 blur-[40px] rounded-full z-0 group-hover:bg-[#0044ff]/10 transition-colors duration-300" />
              {post.graphic}
            </div>

            {/* Category */}
            <span className="text-[#0044ff] font-bold text-[11px] uppercase tracking-widest">{post.category}</span>

            {/* Title */}
            <h3 className="text-[20px] leading-[1.25] font-bold tracking-tight text-slate-900 mt-3 mb-2 pr-2 group-hover:text-[#0044ff] transition-colors duration-300">
              {post.title}
            </h3>

            {/* Description */}
            <p className="text-[14px] text-gray-500 mb-6 flex-grow leading-relaxed">
              {post.desc}
            </p>

            {/* Footer Metadata */}
            <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 border-t border-slate-100 pt-4 mt-auto">
              <span>{post.meta}</span>
              <span className="text-[#0044ff] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 flex items-center gap-1 font-semibold">
                Read Post
                <ArrowRight size={12} />
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function WelcomeSection({ setActivePage }: { setActivePage: (p: 'landing' | 'about') => void }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const handleGetToKnowClick = () => {
    setActivePage("about");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const splitPrimary = (text: string) => {
    return text.split(" ").map((word, idx) => (
      <span key={idx} className="reveal-word-primary inline-block mr-[0.22em] transition-colors" style={{ color: "rgba(10, 10, 10, 0.15)", opacity: 0 }}>
        {word}
      </span>
    ));
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      const heading = headingRef.current;
      if (!heading) return;

      const elements = heading.querySelectorAll(".reveal-word-primary, .reveal-graphic, .reveal-word-secondary");
      if (elements.length === 0) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heading,
          start: "top 70%",
          end: "bottom 35%",
          scrub: 0.8,
        }
      });

      elements.forEach((el) => {
        if (el.classList.contains("reveal-word-primary")) {
          tl.to(el, { color: "#0a0a0a", duration: 0.15, opacity: 1, }, ">-0.1");
        } else if (el.classList.contains("reveal-word-secondary")) {
          tl.to(el, { color: "#7c7c80", duration: 0.15, opacity: 1, }, ">-0.1");
        } else if (el.classList.contains("reveal-graphic")) {
          tl.fromTo(el,
            { opacity: 0, scale: 0.88 },
            { opacity: 1, scale: 1, duration: 0.35 },
            ">-0.08"
          );
        }
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);


  return (
    <section id="welcome" ref={sectionRef} className="bg-[#f8f9fa] border-t border-gray-200 py-24 md:py-32 px-6 md:px-12 lg:px-20 relative overflow-hidden">
      {/* Dynamic light gradient orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 blur-[100px] rounded-full z-0 pointer-events-none" />

      <div className="max-w-[1200px] mx-auto flex flex-col justify-between relative z-10">


        {/* Large Text Container with Inline Images */}
        <div className="relative">
          <h2 ref={headingRef} className="text-[28px] sm:text-[44px] md:text-[54px] leading-[1.25] font-bold text-gray-900 tracking-tight max-w-5xl">
            {splitPrimary("We believe edge intelligence should be seamless. By engineering zero-trust telemetry nodes,")}
            <span className="reveal-graphic inline-block align-middle w-20 sm:w-32 h-10 sm:h-16 mx-3 rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-black relative group">
              <svg viewBox="0 0 160 80" className="w-full h-full">
                <style>{`
                  @keyframes pulseSignal {
                    0%, 100% { stroke-dashoffset: 200; opacity: 0; }
                    50% { stroke-dashoffset: 0; opacity: 1; }
                  }
                  .signal-line {
                    stroke-dasharray: 100;
                    animation: pulseSignal 4s ease-in-out infinite;
                  }
                `}</style>
                <path d="M 10 65 Q 80 -10, 150 45" fill="none" stroke="url(#blueNeon)" strokeWidth="2.5" className="signal-line" />
                <defs>
                  <linearGradient id="blueNeon" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0044ff" />
                    <stop offset="100%" stopColor="#00d2ff" />
                  </linearGradient>
                </defs>
                <circle cx="10" cy="65" r="3" fill="#ffffff" />
                <circle cx="150" cy="45" r="3" fill="#00d2ff" className="animate-pulse" />
              </svg>
            </span>
            {splitPrimary("real-time evaluation engines, and collaborative code automation, we unite hardware and software under a single orchestrator.")}
            <span className="reveal-graphic inline-block align-middle w-20 sm:w-32 h-10 sm:h-16 mx-3 rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-[#050510] relative group">
              <svg viewBox="0 0 160 80" className="w-full h-full p-2">
                <rect x="8" y="12" width="45" height="4" fill="#0044ff" rx="1.5" />
                <rect x="8" y="24" width="75" height="4" fill="#3b82f6" rx="1.5" />
                <rect x="8" y="36" width="60" height="4" fill="#10b981" rx="1.5" />
                <rect x="8" y="48" width="50" height="4" fill="#f59e0b" rx="1.5" />
                <circle cx="125" cy="40" r="10" fill="none" stroke="#0044ff" strokeWidth="1.5" />
                <circle cx="125" cy="40" r="4" fill="#0044ff" className="animate-ping" />
                <circle cx="125" cy="40" r="4" fill="#00d2ff" />
              </svg>
            </span>
            {splitPrimary("Connecting the offline physical world to infinite logic streams, safely, reliably, and always one step ahead.")}
          </h2>
        </div>

        {/* Bottom Right Triggers */}
        <div className="flex justify-end items-center gap-4 mt-16 md:mt-24 gsap-reveal">
          <button
            onClick={handleGetToKnowClick}
            className="px-6 py-3 rounded-full border border-gray-300 hover:border-black font-semibold text-[12px] text-gray-800 hover:text-black tracking-wider uppercase transition-all duration-300 cursor-pointer hover:scale-[1.02] bg-white"
          >
            Get to know us
          </button>

          <button
            onClick={handleGetToKnowClick}
            className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:text-black hover:border-black transition-all hover:scale-110 cursor-pointer group bg-white"
          >
            <ArrowRight size={20} className="rotate-45 group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>

      </div>
    </section>
  );
}


function GetStartedSection() {

  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 50%",
        }
      });

      // Text fade in
      tl.from(".anim-text", {
        y: 40,
        opacity: 0,
        stagger: 0.15,
        duration: 0.4,
        ease: "power3.out",
      });

      // Halftone circle entrance scale and fade
      tl.from(".anim-circle", {
        scale: 0.75,
        opacity: 0,
        duration: 0.8,
        ease: "back.out(1.4)",
      }, "-=0.2");

      // Button connection flash
      tl.to(".target-btn", {
        backgroundColor: "#0044ff",
        color: "#ffffff",
        boxShadow: "0 10px 15px -3px rgba(0, 68, 255, 0.4)",
        duration: 0.5,
        ease: "power2.out",
      }, "+=0.1");

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full min-h-[500px] lg:h-[600px] py-16 lg:py-0 flex items-center overflow-hidden bg-[#0a0a0a]">
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#0044ff]/20 blur-[120px] rounded-full z-0 pointer-events-none" />

      {/* Dynamic 2D Halftone Circle Propeller (Inverted white & blue colors) */}
      <div className="anim-circle absolute left-[-5%] lg:left-[8%] top-1/2 -translate-y-1/2 w-full lg:w-[45%] h-[400px] lg:h-[500px] flex items-center justify-center z-0 pointer-events-auto">
        <HalftoneCircle2D />
      </div>

      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6 lg:px-8 flex justify-start lg:justify-end">
        <div className="w-full max-w-[460px] lg:mr-[5%]">
          <h2 className="anim-text text-[36px] md:text-[44px] lg:text-[54px] font-bold leading-[1.1] mb-8 lg:mb-10 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-200 to-white">
            Get started with<br />
            UNITINCAN
          </h2>


          <div className="anim-text flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8 lg:mb-10 w-full sm:w-auto">
            <GlowButton
              className="w-full sm:w-auto"
              onClick={() => document.getElementById("automation")?.scrollIntoView({ behavior: "smooth" })}
            >
              Start building
            </GlowButton>
            <button
              onClick={() => alert("Thank you for your interest! A UNITINCAN edge engineering expert will reach out shortly to schedule your demo.")}
              className="w-full sm:w-auto bg-transparent border border-white/20 text-white font-mono text-[13px] font-semibold px-8 py-3.5 rounded-xl hover:bg-white/5 transition-colors duration-300 text-center uppercase tracking-wide cursor-pointer"
            >
              Get a demo
            </button>
          </div>


          <p className="anim-text text-gray-400 text-[15px] sm:text-[16px] leading-relaxed max-w-[400px]">
            Use UNITINCAN, the agent engineering platform, to improve every step of the connected infrastructure lifecycle.
          </p>
        </div>
      </div>
    </section>
  );
}

function Footer({ activePage, setActivePage }: { activePage: string; setActivePage: (p: 'landing' | 'about') => void }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, 0]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <footer
      ref={containerRef}
      style={{
        background: "#0a0a0a",
        color: "#fff",
        padding: "80px 24px 40px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto 80px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 40,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <span style={{ fontFamily: "var(--font-sans)" }} className="text-xl font-bold tracking-wide uppercase mt-1">UNITINCAN</span>

          </div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
            © 2026 Unitincan Inc.<br />All rights reserved.
          </p>
        </div>

        <div>
          <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 20, color: "rgba(255,255,255,0.5)" }}>Product</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            <li><a href="#" style={{ color: "#fff", textDecoration: "none", fontSize: 14 }}>Changelog</a></li>
            <li><a href="#" style={{ color: "#fff", textDecoration: "none", fontSize: 14 }}>Documentation</a></li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 20, color: "rgba(255,255,255,0.5)" }}>Company</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            <li>
              <a
                href="#about"
                onClick={(e) => {
                  e.preventDefault();
                  setActivePage("about");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                style={{ color: "#fff", textDecoration: "none", fontSize: 14 }}
              >
                About
              </a>
            </li>
            <li><a href="#" style={{ color: "#fff", textDecoration: "none", fontSize: 14 }}>Careers</a></li>
            <li>
              <a
                href="#blog"
                onClick={(e) => {
                  e.preventDefault();
                  if (activePage !== "landing") {
                    setActivePage("landing");
                    setTimeout(() => {
                      document.getElementById("blog")?.scrollIntoView({ behavior: "smooth" });
                    }, 150);
                  } else {
                    document.getElementById("blog")?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                style={{ color: "#fff", textDecoration: "none", fontSize: 14 }}
              >
                Blog
              </a>
            </li>
          </ul>
        </div>


        <div>
          <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 20, color: "rgba(255,255,255,0.5)" }}>Contact</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            <li><a href="#" style={{ color: "#fff", textDecoration: "none", fontSize: 14 }}>Github</a></li>
            <li><a href="#" style={{ color: "#fff", textDecoration: "none", fontSize: 14 }}>Discord</a></li>
            <li><a href="#" style={{ color: "#fff", textDecoration: "none", fontSize: 14 }}>Twitter</a></li>
          </ul>
        </div>
      </div>

      <motion.div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          y,
          opacity
        }}
      >
        <svg
          viewBox="0 0 720 120"
          style={{ width: "100%", height: "auto", display: "block" }}
          preserveAspectRatio="xMidYMid meet"
        >
          <text
            x="50%"
            y="100"
            textAnchor="middle"
            fill="#ffffff"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "115px",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "-0.04em"
            }}
          >
            UNITINCAN
          </text>
        </svg>
      </motion.div>
    </footer>
  );
}
