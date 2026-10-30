"use client";

import { useEffect, useRef } from "react";

export type OrbState = "idle" | "listening" | "thinking" | "speaking";
type NeuralOrbProps = { state?: OrbState; audioLevel?: number; className?: string; label?: string };

export function NeuralOrb({ state = "idle", audioLevel = 0, className = "", label = "ANA luminous neural sphere" }: NeuralOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<OrbState>(state);
  const levelRef = useRef(audioLevel);

  useEffect(() => {
    stateRef.current = state;
    levelRef.current = Math.max(0, Math.min(1, audioLevel));
  }, [state, audioLevel]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: 0, y: 0 };
    let width = 1;
    let height = 1;
    let time = 0;
    let frame = 0;
    let lastFrame = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.7);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = (event.clientX - rect.left) / rect.width - 0.5;
      pointer.y = (event.clientY - rect.top) / rect.height - 0.5;
    };
    const onPointerLeave = () => { pointer.x = 0; pointer.y = 0; };
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);

    const draw = (timestamp: number) => {
      if (timestamp - lastFrame < 30 && !reducedMotion) {
        frame = requestAnimationFrame(draw);
        return;
      }
      lastFrame = timestamp;
      time += reducedMotion ? 0.002 : 0.012;
      const ctx = context;
      const cx = width / 2;
      const cy = height / 2;
      const currentState = stateRef.current;
      const micLevel = levelRef.current;
      const synthetic = currentState === "speaking"
        ? 0.16 + Math.abs(Math.sin(time * 4.8)) * 0.2
        : currentState === "thinking" ? 0.08 + Math.abs(Math.sin(time * 2.1)) * 0.08 : 0;
      const energy = Math.max(micLevel, synthetic);
      const hue = currentState === "listening" ? 190 : currentState === "speaking" ? 268 : currentState === "thinking" ? 244 : 254;
      const spin = time * (currentState === "thinking" ? 1.45 : currentState === "listening" ? 0.9 : 0.58);
      const radius = Math.min(width, height) * (0.285 + energy * 0.035);
      const px = pointer.x;
      const py = pointer.y;

      ctx.clearRect(0, 0, width, height);
      const atmosphere = ctx.createRadialGradient(cx + px * 15, cy + py * 15, 0, cx, cy, radius * 1.95);
      atmosphere.addColorStop(0, "hsla(" + hue + ", 100%, 68%, " + (0.2 + energy * 0.2) + ")");
      atmosphere.addColorStop(0.42, "hsla(" + (hue + 19) + ", 95%, 46%, 0.1)");
      atmosphere.addColorStop(1, "rgba(53, 48, 142, 0)");
      ctx.fillStyle = atmosphere;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.translate(cx + px * 8, cy + py * 8);
      ctx.rotate(spin * 0.24);
      for (let ring = 0; ring < 3; ring += 1) {
        ctx.beginPath();
        ctx.ellipse(0, 0, radius * (1.33 + ring * 0.105), radius * (0.53 + ring * 0.04), spin * (ring % 2 ? -0.34 : 0.27) + ring * 0.8, 0, Math.PI * 2);
        ctx.strokeStyle = "hsla(" + (hue + ring * 18) + ", 95%, 78%, " + (0.12 - ring * 0.022) + ")";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();

      const body = ctx.createRadialGradient(cx - radius * 0.36 + px * 12, cy - radius * 0.4 + py * 12, radius * 0.02, cx, cy, radius * 1.1);
      body.addColorStop(0, "#fffaff");
      body.addColorStop(0.09, "hsl(" + (hue + 8) + ", 100%, 92%)");
      body.addColorStop(0.24, "hsl(" + (hue + 4) + ", 100%, 69%)");
      body.addColorStop(0.49, "hsl(" + (hue - 7) + ", 91%, 42%)");
      body.addColorStop(0.73, "hsl(" + (hue + 22) + ", 91%, 21%)");
      body.addColorStop(1, "#090815");
      ctx.save();
      ctx.shadowColor = "hsla(" + hue + ", 100%, 67%, " + (0.56 + energy * 0.42) + ")";
      ctx.shadowBlur = radius * (0.4 + energy * 0.5);
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = body;
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.986, 0, Math.PI * 2);
      ctx.clip();
      for (let band = 0; band < 9; band += 1) {
        const phase = spin * (band % 2 ? 1 : -0.76) + band * 1.63;
        ctx.beginPath();
        for (let step = 0; step <= 170; step += 1) {
          const angle = (step / 170) * Math.PI * 2;
          const turbulence = Math.sin(angle * 3 + phase) * 0.12 + Math.cos(angle * 5 - phase * 0.78) * 0.055;
          const r = radius * (0.22 + band * 0.082 + turbulence + energy * 0.028 * Math.sin(angle * 8 + phase));
          const x = Math.cos(angle + phase * 0.07) * r * (0.83 + px * 0.13);
          const y = Math.sin(angle + phase * 0.07) * r * (0.78 + py * 0.13);
          if (step === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = "hsla(" + (hue + band * 11 - 24) + ", 100%, " + (70 + band * 2) + "%, " + (0.13 + energy * 0.08) + ")";
        ctx.lineWidth = 1.1 + band * 0.15;
        ctx.shadowColor = "hsl(" + (hue + band * 8) + ", 100%, 72%)";
        ctx.shadowBlur = 9;
        ctx.stroke();
      }
      ctx.restore();

      for (let index = 0; index < 52; index += 1) {
        const angle = index * 2.399 + spin * (index % 3 === 0 ? 1 : -0.53);
        const ratio = 0.16 + 0.76 * (((index * 37) % 103) / 103);
        const r = radius * ratio;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r * 0.91;
        const alpha = 0.2 + 0.58 * ((Math.sin(angle * 3 + spin) + 1) / 2);
        ctx.beginPath();
        ctx.arc(x, y, (index % 6 === 0 ? 1.55 : 0.72) + energy * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(239, 233, 255, " + alpha + ")";
        ctx.shadowColor = "#ae9bff";
        ctx.shadowBlur = 8;
        ctx.fill();
      }

      // Delicate energy meridians turn the core into a living field rather than a glass marble.
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.98, 0, Math.PI * 2);
      ctx.clip();
      for (let meridian = 0; meridian < 6; meridian += 1) {
        const phase = spin * (meridian % 2 ? -0.72 : 0.55) + meridian * 1.047;
        ctx.beginPath();
        for (let step = 0; step <= 100; step += 1) {
          const angle = (step / 100) * Math.PI * 2;
          const wave = Math.sin(angle * 2 + phase) * 0.12 + Math.cos(angle * 4 - phase) * 0.055;
          const x = Math.cos(angle + phase * 0.16) * radius * (0.18 + wave);
          const y = Math.sin(angle + phase * 0.16) * radius * (0.82 + wave);
          if (step === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = "hsla(" + (hue + meridian * 9) + ", 100%, 91%, " + (0.12 + energy * 0.1) + ")";
        ctx.lineWidth = 0.8;
        ctx.shadowColor = "hsla(" + (hue + 12) + ", 100%, 78%, .7)";
        ctx.shadowBlur = 7;
        ctx.stroke();
      }
      ctx.restore();

      // Small motes orbit outside the core to make its motion legible at a glance.
      for (let mote = 0; mote < 13; mote += 1) {
        const angle = spin * (mote % 2 ? -0.72 : 0.9) + mote * 0.483;
        const orbitX = radius * (1.2 + (mote % 4) * 0.105);
        const orbitY = radius * (0.52 + (mote % 3) * 0.12);
        const x = cx + Math.cos(angle) * orbitX;
        const y = cy + Math.sin(angle) * orbitY;
        const pulse = 0.35 + ((Math.sin(time * 3 + mote) + 1) * 0.5) * 0.65;
        ctx.beginPath();
        ctx.arc(x, y, (mote % 4 === 0 ? 1.7 : 0.85) + energy * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = "hsla(" + (hue + mote * 7) + ", 100%, 88%, " + pulse + ")";
        ctx.shadowColor = "hsl(" + (hue + 14) + ", 100%, 75%)";
        ctx.shadowBlur = 12;
        ctx.fill();
      }

      const highlight = ctx.createRadialGradient(cx - radius * 0.34 + px * 7, cy - radius * 0.42 + py * 7, 0, cx - radius * 0.2, cy - radius * 0.25, radius * 0.68);
      highlight.addColorStop(0, "rgba(255, 255, 255, 0.43)");
      highlight.addColorStop(0.24, "rgba(206, 191, 255, 0.14)");
      highlight.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = highlight;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.985, 0, Math.PI * 2);
      ctx.strokeStyle = "hsla(" + (hue + 20) + ", 100%, 88%, 0.62)";
      ctx.lineWidth = 1;
      ctx.shadowColor = "hsl(" + hue + ", 100%, 72%)";
      ctx.shadowBlur = 15;
      ctx.stroke();

      if (!reducedMotion) frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} role="img" aria-label={label} />;
}
