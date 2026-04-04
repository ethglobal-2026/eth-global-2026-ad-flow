"use client";

// Adapted from react-bits (https://react-bits.dev) — Aurora background
// Dependencies: ogl

import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle } from "ogl";

type AuroraProps = {
  colorStops?: [string, string, string];
  amplitude?: number;
  blend?: number;
  speed?: number;
  className?: string;
};

const hexToRgb = (hex: string): [number, number, number] => {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? [parseInt(r[1], 16) / 255, parseInt(r[2], 16) / 255, parseInt(r[3], 16) / 255] : [1, 1, 1];
};

export const Aurora = ({
  colorStops = ["#dbeafe", "#93c5fd", "#bfdbfe"],
  amplitude = 1.0,
  blend = 0.5,
  speed = 0.5,
  className = "",
}: AuroraProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const renderer = new Renderer({ alpha: true, antialias: false, premultipliedAlpha: false });
    const { gl } = renderer;
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";
    container.appendChild(gl.canvas);

    const resize = () => renderer.setSize(container.offsetWidth, container.offsetHeight);
    window.addEventListener("resize", resize);
    resize();

    const [c1, c2, c3] = colorStops.map(hexToRgb);

    const program = new Program(gl, {
      vertex: /* glsl */ `
        attribute vec2 position;
        attribute vec2 uv;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 0.0, 1.0);
        }
      `,
      fragment: /* glsl */ `
        precision highp float;
        varying vec2 vUv;
        uniform float uTime;
        uniform float uAmplitude;
        uniform float uBlend;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform vec3 uColor3;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }
        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          return mix(
            mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
            mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
            f.y
          );
        }

        void main() {
          vec2 uv = vUv;
          float t = uTime * 0.25;

          float n1 = noise(vec2(uv.x * 2.5 + t * 0.8, uv.y * 1.8 - t * 0.4));
          float n2 = noise(vec2(uv.x * 1.8 - t * 0.5, uv.y * 2.2 + t * 0.6));
          float n3 = noise(vec2(uv.x * 3.0 + t * 0.3, uv.y * 1.5 + t * 0.9));

          float wave = sin(uv.x * 2.5 + t + n1 * uAmplitude) * 0.5 + 0.5;
          wave = mix(wave, n2, uBlend * 0.6);

          vec3 col = mix(uColor1, uColor2, wave);
          col = mix(col, uColor3, n3 * 0.45);

          float alpha = 0.18 + n1 * 0.08;
          gl_FragColor = vec4(col, alpha);
        }
      `,
      uniforms: {
        uTime: { value: 0 },
        uAmplitude: { value: amplitude },
        uBlend: { value: blend },
        uColor1: { value: c1 },
        uColor2: { value: c2 },
        uColor3: { value: c3 },
      },
      transparent: true,
    });

    const geometry = new Triangle(gl);
    const mesh = new Mesh(gl, { geometry, program });

    let raf: number;
    const update = (t: number) => {
      raf = requestAnimationFrame(update);
      program.uniforms.uTime.value = t * 0.001 * speed;
      renderer.render({ scene: mesh });
    };
    raf = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      if (container.contains(gl.canvas)) container.removeChild(gl.canvas);
      renderer.gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [colorStops, amplitude, blend, speed]);

  return <div ref={containerRef} className={`absolute inset-0 ${className}`} />;
};
