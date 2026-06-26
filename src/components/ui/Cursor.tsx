"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";

// ─── CURSOR STATES ───
type CursorVariant =
  | "default"
  | "hover"
  | "text"
  | "image"
  | "drag"
  | "hidden"
  | "loading";

// ─── SPRING CONFIGS for buttery-smooth physics ───
const SPRING_CONFIG = { stiffness: 500, damping: 35, mass: 0.3 };
const TRAIL_SPRING  = { stiffness: 250, damping: 28, mass: 0.5 };

export default function Cursor() {
  const [variant, setVariant] = useState<CursorVariant>("default");
  const [isVisible, setIsVisible] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [cursorLabel, setCursorLabel] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(true);
  const rafRef = useRef<number | null>(null);

  // Motion values for ultra-smooth, GPU-accelerated transforms
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  // Inner dot — snappy, follows instantly
  const dotX = useSpring(cursorX, SPRING_CONFIG);
  const dotY = useSpring(cursorY, SPRING_CONFIG);

  // Outer ring — trails behind with elegant lag
  const ringX = useSpring(cursorX, TRAIL_SPRING);
  const ringY = useSpring(cursorY, TRAIL_SPRING);

  // Detect mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      const isTouchDevice =
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        window.innerWidth < 768;
      setIsMobile(isTouchDevice);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Determine variant from element
  const getVariantFromElement = useCallback((target: HTMLElement): { variant: CursorVariant; label: string | null } => {
    // Explicit data attributes take priority
    const cursorEl = target.closest("[data-cursor]") as HTMLElement | null;
    if (cursorEl) {
      const type = cursorEl.getAttribute("data-cursor") as CursorVariant;
      const label = cursorEl.getAttribute("data-cursor-label") || null;
      return { variant: type, label };
    }

    // Image containers
    if (
      target.tagName === "IMG" ||
      target.closest("picture") ||
      target.closest("[class*='img']") ||
      target.closest(".img-luxury")
    ) {
      return { variant: "image", label: null };
    }

    // Text inputs / textareas
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.getAttribute("contenteditable") === "true"
    ) {
      return { variant: "text", label: null };
    }

    // Clickable elements
    if (
      target.tagName === "A" ||
      target.tagName === "BUTTON" ||
      target.closest("a") ||
      target.closest("button") ||
      target.closest("[role='button']") ||
      target.closest("label[for]") ||
      target.closest("select") ||
      target.closest("[tabindex]") ||
      window.getComputedStyle(target).cursor === "pointer"
    ) {
      const label = (target.closest("[data-cursor-label]") as HTMLElement)?.getAttribute("data-cursor-label") || null;
      return { variant: "hover", label };
    }

    return { variant: "default", label: null };
  }, []);

  useEffect(() => {
    if (isMobile) return;

    // Hide the default cursor across the entire page
    const style = document.createElement("style");
    style.id = "cursor-hide";
    style.textContent = `
      *, *::before, *::after {
        cursor: none !important;
      }
    `;
    document.head.appendChild(style);

    const handleMouseMove = (e: MouseEvent) => {
      // Use requestAnimationFrame for perfectly synced updates
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        cursorX.set(e.clientX);
        cursorY.set(e.clientY);
      });
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const { variant: v, label } = getVariantFromElement(e.target as HTMLElement);
      setVariant(v);
      setCursorLabel(label);
    };

    const handleMouseDown = () => setIsPressed(true);
    const handleMouseUp   = () => setIsPressed(false);

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => {
      setIsVisible(false);
      setVariant("default");
      setCursorLabel(null);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseover", handleMouseOver, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.documentElement.addEventListener("mouseenter", handleMouseEnter);
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.getElementById("cursor-hide")?.remove();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.documentElement.removeEventListener("mouseenter", handleMouseEnter);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isMobile, isVisible, cursorX, cursorY, getVariantFromElement]);

  // ─── Don't render on mobile ───
  if (isMobile) return null;

  // ─── Variant-based styles ───
  const getDotSize = () => {
    switch (variant) {
      case "hover":   return 6;
      case "text":    return 2;
      case "image":   return 0;
      case "drag":    return 4;
      case "hidden":  return 0;
      default:        return 5;
    }
  };

  const getRingSize = () => {
    switch (variant) {
      case "hover":   return 56;
      case "text":    return 4;
      case "image":   return 80;
      case "drag":    return 64;
      case "hidden":  return 0;
      default:        return 36;
    }
  };

  const getRingBorderWidth = () => {
    switch (variant) {
      case "hover":  return 2;
      case "text":   return 0;
      case "image":  return 1.5;
      default:       return 1.5;
    }
  };

  const getRingBorderRadius = () => {
    switch (variant) {
      case "hover": return "50%";
      case "image": return "50%";
      default:      return "50%";
    }
  };

  const dotSize  = getDotSize();
  const ringSize = getRingSize();

  return (
    <>
      {/* ─── INNER DOT: Precise pointer ─── */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none mix-blend-difference"
        style={{
          x: dotX,
          y: dotY,
          width: dotSize,
          height: dotSize,
          translateX: -(dotSize / 2),
          translateY: -(dotSize / 2),
          zIndex: 99999,
        }}
        animate={{
          scale: isPressed ? 0.6 : 1,
          opacity: isVisible && variant !== "hidden" ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 800, damping: 35 }}
      >
        <div
          className="w-full h-full bg-white rounded-full"
          style={{
            boxShadow: "0 0 6px rgba(255,255,255,0.3)",
          }}
        />
      </motion.div>

      {/* ─── OUTER RING: Elegant trailing follower ─── */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none mix-blend-difference"
        style={{
          x: ringX,
          y: ringY,
          zIndex: 99998,
        }}
        animate={{
          width: ringSize,
          height: ringSize,
          translateX: -(ringSize / 2),
          translateY: -(ringSize / 2),
          borderWidth: getRingBorderWidth(),
          borderRadius: getRingBorderRadius(),
          opacity: isVisible && variant !== "hidden" ? (variant === "text" ? 0 : 0.85) : 0,
          scale: isPressed ? 0.85 : 1,
          backgroundColor:
            variant === "hover"
              ? "rgba(255,255,255,0.08)"
              : variant === "image"
              ? "rgba(255,255,255,0.04)"
              : "transparent",
          rotate: variant === "drag" ? 45 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 25,
          mass: 0.4,
          borderWidth: { duration: 0.2 },
          backgroundColor: { duration: 0.25 },
        }}
      >
        <div
          className="w-full h-full border-white"
          style={{
            borderWidth: "inherit",
            borderRadius: "inherit",
            borderStyle: "solid",
            borderColor: "white",
          }}
        />
      </motion.div>

      {/* ─── CURSOR LABEL: Contextual hover text ─── */}
      <AnimatePresence>
        {cursorLabel && isVisible && (
          <motion.div
            className="fixed top-0 left-0 pointer-events-none mix-blend-difference"
            style={{
              x: ringX,
              y: ringY,
              zIndex: 99997,
            }}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{
              opacity: 1,
              scale: 1,
              translateX: -(ringSize / 2),
              translateY: -(ringSize / 2),
            }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <div
              className="flex items-center justify-center text-white font-display font-bold uppercase tracking-widest"
              style={{
                width: ringSize,
                height: ringSize,
                fontSize: "8px",
                letterSpacing: "0.15em",
              }}
            >
              {cursorLabel}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── TEXT CURSOR: Elegant blinking I-beam ─── */}
      <AnimatePresence>
        {variant === "text" && isVisible && (
          <motion.div
            className="fixed top-0 left-0 pointer-events-none"
            style={{
              x: dotX,
              y: dotY,
              zIndex: 99997,
            }}
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{
              opacity: 1,
              scaleY: 1,
              translateX: -0.75,
              translateY: -12,
            }}
            exit={{ opacity: 0, scaleY: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <motion.div
              className="bg-white mix-blend-difference"
              style={{ width: "1.5px", height: "24px", borderRadius: "1px" }}
              animate={{ opacity: [1, 0] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── IMAGE CURSOR: "View" label with crosshair feel ─── */}
      <AnimatePresence>
        {variant === "image" && isVisible && (
          <motion.div
            className="fixed top-0 left-0 pointer-events-none mix-blend-difference"
            style={{
              x: ringX,
              y: ringY,
              zIndex: 99997,
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: 1,
              scale: 1,
              translateX: -(ringSize / 2),
              translateY: -(ringSize / 2),
            }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <div
              className="flex items-center justify-center text-white font-display font-bold uppercase tracking-widest"
              style={{
                width: ringSize,
                height: ringSize,
                fontSize: "9px",
                letterSpacing: "0.12em",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
              </svg>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── CLICK RIPPLE: Subtle pulse on mouse-down ─── */}
      <AnimatePresence>
        {isPressed && isVisible && (
          <motion.div
            className="fixed top-0 left-0 pointer-events-none mix-blend-difference"
            style={{
              x: dotX,
              y: dotY,
              zIndex: 99996,
            }}
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 2.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div
              className="border border-white rounded-full"
              style={{
                width: 20,
                height: 20,
                marginLeft: -10,
                marginTop: -10,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
