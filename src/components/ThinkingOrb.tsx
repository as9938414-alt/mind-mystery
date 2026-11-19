import { motion } from 'motion/react';

interface ThinkingOrbProps {
  state?: 'idle' | 'thinking' | 'pulse' | 'suspense';
  confidencePct?: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export function ThinkingOrb({
  state = 'idle',
  confidencePct = 35,
  size = 'md',
  label,
}: ThinkingOrbProps) {
  const dim = size === 'lg' ? 'h-40 w-40 sm:h-48 sm:w-48' : size === 'sm' ? 'h-20 w-20' : 'h-28 w-28 sm:h-32 sm:w-32';
  const intensity = Math.max(0.25, Math.min(1, confidencePct / 100));

  const scaleAnim =
    state === 'suspense'
      ? [1, 1.14, 0.96, 1.18, 1]
      : state === 'thinking'
      ? [1, 1.08, 1]
      : state === 'pulse'
      ? [1, 1.12, 1]
      : [1, 1.035, 1];

  const duration = state === 'suspense' ? 1.1 : state === 'thinking' ? 1.4 : state === 'pulse' ? 0.55 : 4.2;

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      <div className={`relative flex items-center justify-center ${dim}`}>
        {/* Outer aura halo */}
        <motion.div
          animate={{ scale: scaleAnim, opacity: [0.45 * intensity + 0.2, 0.85 * intensity + 0.15, 0.45 * intensity + 0.2] }}
          transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full blur-2xl"
          style={{
            background:
              state === 'suspense'
                ? 'radial-gradient(circle, rgba(232,121,249,0.75) 0%, rgba(124,58,237,0.5) 55%, transparent 75%)'
                : 'radial-gradient(circle, rgba(124,58,237,0.65) 0%, rgba(56,189,248,0.45) 55%, transparent 75%)',
          }}
        />

        {/* Rotating orbital neural ring 1 */}
        <motion.svg
          viewBox="0 0 120 120"
          className="absolute inset-0 h-full w-full"
          animate={{ rotate: 360 }}
          transition={{ duration: state === 'suspense' ? 3.5 : 14, repeat: Infinity, ease: 'linear' }}
        >
          <defs>
            <linearGradient id="orbRingGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#E879F9" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="url(#orbRingGrad1)"
            strokeWidth="1.4"
            strokeDasharray="68 24 14 20"
          />
        </motion.svg>

        {/* Counter-rotating orbital neural ring 2 */}
        <motion.svg
          viewBox="0 0 120 120"
          className="absolute inset-2 h-[calc(100%-16px)] w-[calc(100%-16px)]"
          animate={{ rotate: -360 }}
          transition={{ duration: state === 'suspense' ? 2.4 : 10, repeat: Infinity, ease: 'linear' }}
        >
          <circle
            cx="60"
            cy="60"
            r="46"
            fill="none"
            stroke="rgba(56, 189, 248, 0.5)"
            strokeWidth="1"
            strokeDasharray="18 14 42 18"
          />
        </motion.svg>

        {/* Core crystalline neural sphere */}
        <motion.div
          animate={{ scale: scaleAnim }}
          transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
          className="relative flex h-[62%] w-[62%] items-center justify-center rounded-full shadow-inner"
          style={{
            background:
              state === 'suspense'
                ? 'radial-gradient(circle at 32% 28%, #F5D0FE 0%, #9333EA 45%, #1E1B4B 95%)'
                : 'radial-gradient(circle at 32% 28%, #BAE6FD 0%, #7C3AED 48%, #0F1630 96%)',
            boxShadow:
              'inset 0 0 22px rgba(255,255,255,0.35), 0 0 30px rgba(124,58,237,0.45)',
          }}
        >
          {/* Inner neural lattice lines */}
          <svg viewBox="0 0 64 64" className="h-[72%] w-[72%] opacity-75">
            <g stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" fill="none">
              <circle cx="32" cy="32" r="10" />
              <path d="M32 10 L32 22 M32 42 L32 54 M10 32 L22 32 M42 32 L54 32" />
              <path d="M17 17 L25 25 M39 39 L47 47 M47 17 L39 25 M25 39 L17 47" opacity="0.65" />
            </g>
            <circle cx="32" cy="32" r="3.2" fill="#FFFFFF" />
          </svg>
        </motion.div>
      </div>
      {label && (
        <p className="mt-3 text-center text-xs font-medium tracking-wide text-slate-600 dark:text-slate-300">
          {label}
        </p>
      )}
    </div>
  );
}
