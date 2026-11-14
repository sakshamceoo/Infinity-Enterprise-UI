import { useEffect, useRef } from "react";

export default function DotField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return undefined;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let dots = [];
    let running = true;
    let visible = true;
    let raf = 0;
    const mouse = { x: 0, y: 0, inside: false };

    const seed = () => {
      const count = Math.max(56, Math.min(150, Math.floor((width * height) / 12000)));
      dots = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 1.5 + 0.7,
      }));
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      seed();
    };

    const onMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      mouse.inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
    };

    const draw = () => {
      if (!running) return;
      if (visible) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, height);
        const reach = Math.min(150, width * 0.16);

        if (!reduce) {
          for (const dot of dots) {
            if (mouse.inside) {
              const dx = dot.x - mouse.x;
              const dy = dot.y - mouse.y;
              const dist = Math.hypot(dx, dy) || 1;
              if (dist < reach) {
                const push = ((reach - dist) / reach) * 0.42;
                dot.vx += (dx / dist) * push;
                dot.vy += (dy / dist) * push;
              }
            }
            dot.vx *= 0.965;
            dot.vy *= 0.965;
            dot.x += dot.vx;
            dot.y += dot.vy;
            if (dot.x <= 0 || dot.x >= width) dot.vx *= -1;
            if (dot.y <= 0 || dot.y >= height) dot.vy *= -1;
            dot.x = Math.max(0, Math.min(width, dot.x));
            dot.y = Math.max(0, Math.min(height, dot.y));
          }
        }

        const link = Math.min(120, width * 0.12);
        ctx.lineWidth = 1;
        for (let i = 0; i < dots.length; i += 1) {
          for (let j = i + 1; j < dots.length; j += 1) {
            const a = dots[i];
            const b = dots[j];
            const dist = Math.hypot(a.x - b.x, a.y - b.y);
            if (dist < link) {
              ctx.strokeStyle = `rgba(184, 155, 98, ${(1 - dist / link) * 0.35})`;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
        }

        const midX = width / 2;
        const midY = height / 2;
        for (const dot of dots) {
          const fromCenter = Math.hypot(dot.x - midX, dot.y - midY);
          const fade = Math.min(1, Math.max(0.08, (fromCenter - 70) / 140));
          ctx.fillStyle = `rgba(244, 241, 232, ${0.9 * fade})`;
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      if (!reduce) raf = requestAnimationFrame(draw);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });

    resize();
    observer.observe(canvas);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(draw);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="morph-dots" aria-hidden="true" />;
}
