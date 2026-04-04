"use client";

// Adapted from react-bits (https://react-bits.dev) — Particles background
// Dependencies: ogl

import { useEffect, useRef, useCallback } from "react";
import { Renderer, Camera, Geometry, Program, Mesh } from "ogl";

type ParticlesProps = {
  particleCount?: number;
  particleSpread?: number;
  speed?: number;
  particleColors?: string[];
  particleBaseSize?: number;
  sizeRandomness?: number;
  alphaParticles?: boolean;
  moveParticlesOnHover?: boolean;
  particleHoverFactor?: number;
  cameraDistance?: number;
  disableRotation?: boolean;
  className?: string;
};

const hexToVec3 = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255]
    : [1, 1, 1];
};

export const Particles = ({
  particleCount = 200,
  particleSpread = 10,
  speed = 0.05,
  particleColors = ["#93c5fd", "#bfdbfe", "#dbeafe"],
  particleBaseSize = 80,
  sizeRandomness = 1,
  alphaParticles = true,
  moveParticlesOnHover = false,
  particleHoverFactor = 1,
  cameraDistance = 20,
  disableRotation = false,
  className = "",
}: ParticlesProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rendererRef = useRef<Renderer | null>(null);
  const animationRef = useRef<number>(0);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseRef.current = {
      x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
      y: -(((e.clientY - rect.top) / rect.height) * 2 - 1),
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const renderer = new Renderer({ alpha: true, antialias: false });
    rendererRef.current = renderer;
    const { gl } = renderer;
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";
    container.appendChild(gl.canvas);

    const camera = new Camera(gl, { fov: 15 });
    camera.position.z = cameraDistance;

    const resize = () => {
      renderer.setSize(container.offsetWidth, container.offsetHeight);
      camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
    };
    window.addEventListener("resize", resize);
    resize();

    const count = particleCount;
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count * 4);
    const colorData = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions.set(
        [(Math.random() - 0.5) * particleSpread, (Math.random() - 0.5) * particleSpread, (Math.random() - 0.5) * particleSpread],
        i * 3,
      );
      randoms.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
      const col = hexToVec3(particleColors[Math.floor(Math.random() * particleColors.length)]);
      colorData.set(col, i * 3);
    }

    const geometry = new Geometry(gl, {
      position: { size: 3, data: positions },
      random: { size: 4, data: randoms },
      color: { size: 3, data: colorData },
    });

    const program = new Program(gl, {
      vertex: `
        attribute vec3 position;
        attribute vec4 random;
        attribute vec3 color;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        uniform float uSpread;
        uniform float uBaseSize;
        uniform float uSizeRandom;
        varying vec4 vRandom;
        varying vec3 vColor;
        void main() {
          vRandom = random;
          vColor = color;
          vec3 pos = position;
          pos.x += sin(uTime * random.x + random.y * 6.28) * 0.3;
          pos.y += cos(uTime * random.z + random.w * 6.28) * 0.3;
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = (uBaseSize + uSizeRandom * (random.x - 0.5)) * (1.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragment: `
        precision highp float;
        varying vec4 vRandom;
        varying vec3 vColor;
        uniform bool uAlpha;
        void main() {
          vec2 uv = gl_PointCoord.xy - 0.5;
          float dist = length(uv);
          if (dist > 0.5) discard;
          float alpha = uAlpha ? (1.0 - smoothstep(0.2, 0.5, dist)) : 1.0;
          gl_FragColor = vec4(vColor, alpha * 0.8);
        }
      `,
      uniforms: {
        uTime: { value: 0 },
        uSpread: { value: particleSpread },
        uBaseSize: { value: particleBaseSize },
        uSizeRandom: { value: sizeRandomness * 20 },
        uAlpha: { value: alphaParticles },
      },
      transparent: true,
      depthTest: false,
    });

    const mesh = new Mesh(gl, { mode: gl.POINTS, geometry, program });

    if (moveParticlesOnHover) container.addEventListener("mousemove", handleMouseMove);

    let t = 0;
    const update = () => {
      animationRef.current = requestAnimationFrame(update);
      t += speed * 0.01;
      program.uniforms.uTime.value = t;
      if (!disableRotation) {
        mesh.rotation.y = t * 0.05;
        mesh.rotation.x = t * 0.03;
      }
      if (moveParticlesOnHover) {
        camera.position.x += (mouseRef.current.x * particleHoverFactor - camera.position.x) * 0.05;
        camera.position.y += (mouseRef.current.y * particleHoverFactor - camera.position.y) * 0.05;
        camera.lookAt([0, 0, 0]);
      }
      renderer.render({ scene: mesh, camera });
    };
    update();

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
      if (moveParticlesOnHover) container.removeEventListener("mousemove", handleMouseMove);
      if (container.contains(gl.canvas)) container.removeChild(gl.canvas);
      renderer.gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [
    particleCount, particleSpread, speed, particleColors, particleBaseSize,
    sizeRandomness, alphaParticles, moveParticlesOnHover, particleHoverFactor,
    cameraDistance, disableRotation, handleMouseMove,
  ]);

  return <div ref={containerRef} className={`absolute inset-0 ${className}`} />;
};
