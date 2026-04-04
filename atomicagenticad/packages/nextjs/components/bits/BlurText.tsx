"use client";

// Blur-in text animation — words fade + unblur in sequence
// Triggers on scroll into view (or immediately if `immediate` is true)

import { useEffect, useRef, useState } from "react";

type BlurTextProps = {
  text: string;
  className?: string;
  delay?: number;    // ms stagger per word
  duration?: number; // ms per word transition
  immediate?: boolean;
};

export const BlurText = ({ text, className = "", delay = 80, duration = 500, immediate = false }: BlurTextProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (immediate) {
      const t = setTimeout(() => setVisible(true), 50);
      return () => clearTimeout(t);
    }
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [immediate]);

  const words = text.split(" ");

  return (
    <span ref={ref} className={className} aria-label={text}>
      {words.map((word, i) => (
        <span
          key={i}
          className="inline-block"
          style={{
            opacity: visible ? 1 : 0,
            filter: visible ? "blur(0px)" : "blur(10px)",
            transform: visible ? "translateY(0)" : "translateY(10px)",
            transition: `opacity ${duration}ms ease ${i * delay}ms, filter ${duration}ms ease ${i * delay}ms, transform ${duration}ms ease ${i * delay}ms`,
          }}
        >
          {word}
          {i < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </span>
  );
};
