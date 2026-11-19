import { useEffect, useRef } from 'react';

export function AuroraBackdrop({ isDark }: { isDark: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let rafId = 0;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const nodeCount = Math.min(44, Math.max(20, Math.floor(width / 34)));
    const nodes = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: 1 + Math.random() * 1.4,
    }));

    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    const renderFrame = () => {
      ctx.clearRect(0, 0, width, height);
      const dotColor = isDark ? 'rgba(148, 163, 184, 0.35)' : 'rgba(124, 58, 237, 0.16)';
      const lineColor = isDark ? 'rgba(124, 58, 237, 0.09)' : 'rgba(124, 58, 237, 0.06)';

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (!prefersReduced) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < 0 || n.x > width) n.vx *= -1;
          if (n.y < 0 || n.y > height) n.vy *= -1;
        }
        ctx.fillStyle = dotColor;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < nodes.length; j++) {
          const m = nodes[j];
          const dx = n.x - m.x;
          const dy = n.y - m.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 19000) {
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(m.x, m.y);
            ctx.stroke();
          }
        }
      }

      if (!prefersReduced) {
        rafId = requestAnimationFrame(renderFrame);
      }
    };

    renderFrame();

    return () => {
      window.removeEventListener('resize', onResize);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isDark]);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {/* Subtle violet & electric-blue aurora gradients */}
      <div
        className="aurora-layer absolute -top-40 -left-32 h-[540px] w-[540px] rounded-full blur-[120px]"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(124,58,237,0.28) 0%, rgba(56,189,248,0.12) 55%, transparent 75%)'
            : 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, rgba(56,189,248,0.08) 55%, transparent 75%)',
        }}
      />
      <div
        className="aurora-layer absolute -bottom-44 -right-24 h-[520px] w-[520px] rounded-full blur-[130px]"
        style={{
          animationDelay: '-8s',
          background: isDark
            ? 'radial-gradient(circle, rgba(56,189,248,0.2) 0%, rgba(232,121,249,0.12) 55%, transparent 75%)'
            : 'radial-gradient(circle, rgba(56,189,248,0.1) 0%, rgba(232,121,249,0.08) 55%, transparent 75%)',
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
