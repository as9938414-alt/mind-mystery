import confetti from 'canvas-confetti';
import { ArrowRight, RotateCcw, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { soundFx } from '../utils/sound';

/**
 * The Crystal Ball — a classic mathematical illusion.
 * Any two-digit number minus the sum of its digits is always a multiple of 9
 * (10a + b − (a + b) = 9a). Every multiple of 9 in the grid carries the same
 * symbol, which is reshuffled on every play so the trick never looks the same twice.
 */

// Text-only glyphs (U+FE0E forces text style) so no symbol renders as a coloured emoji and stands out.
const SYMBOLS = ['★', '☾', '♠', '♣', '♥', '♦', '♪', '♛', '✿', '♞', '✦', '♜', '✺', '▲', '●', '✚', '◆', '☯'].map(
  (g) => `${g}\uFE0E`
);

type Step = 'intro' | 'think' | 'add' | 'subtract' | 'grid' | 'gazing' | 'reveal';

function buildGrid() {
  const shuffled = [...SYMBOLS].sort(() => Math.random() - 0.5);
  const target = shuffled[0];
  // 11 multiples of 9 get the target. Six decoys share the other 89 cells (~15 each), so the
  // target symbol is no more common than any other and nothing visibly stands out.
  const decoys = shuffled.slice(1, 7);
  const decoyBag = Array.from({ length: 89 }, (_, i) => decoys[i % decoys.length]).sort(() => Math.random() - 0.5);
  const cells = Array.from({ length: 100 }, (_, n) => (n % 9 === 0 && n <= 90 ? target : decoyBag.pop()!));
  return { target, cells };
}

export function CrystalBall({ onExit }: { onExit: () => void }) {
  const [step, setStep] = useState<Step>('intro');
  const [round, setRound] = useState(0);
  const grid = useMemo(() => buildGrid(), [round]);

  const go = (next: Step) => {
    soundFx.playClick();
    setStep(next);
  };

  const gaze = () => {
    setStep('gazing');
    soundFx.playSuspense();
    window.setTimeout(() => soundFx.playSuspense(), 900);
    window.setTimeout(() => {
      setStep('reveal');
      soundFx.playSuccess();
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.55 } });
    }, 3200);
  };

  const again = () => {
    setRound((r) => r + 1);
    setStep('think');
    soundFx.playStart();
  };

  const instruction: Record<'think' | 'add' | 'subtract', { title: string; body: string; example: string }> = {
    think: {
      title: 'Think of any two-digit number',
      body: 'Anything from 10 to 99. Keep it secret — don’t say it out loud.',
      example: 'For example: 47',
    },
    add: {
      title: 'Add its two digits together',
      body: 'Just the two digits of your number.',
      example: 'For example: 4 + 7 = 11',
    },
    subtract: {
      title: 'Subtract that from your original number',
      body: 'Take your first number and subtract the total you just got.',
      example: 'For example: 47 − 11 = 36',
    },
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wider text-fuchsia-500 dark:text-fuchsia-400">THE CRYSTAL BALL</p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            I will see the symbol in your mind
          </h1>
        </div>
        <button
          type="button"
          onClick={onExit}
          className="rounded-lg border border-slate-200 dark:border-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70"
        >
          Other games
        </button>
      </div>

      <AnimatePresence mode="wait">
        {step === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="rounded-2xl border border-fuchsia-500/30 bg-gradient-to-b from-[#1a0b2e] to-[#0A1024] p-8 sm:p-12 text-center space-y-6 text-white"
          >
            <CrystalOrb />
            <p className="text-lg text-slate-200 max-w-md mx-auto">
              Do a little secret maths in your head. Then pick a symbol from a grid of 100 — and the crystal ball will show it.
            </p>
            <button
              type="button"
              onClick={() => go('think')}
              className="inline-flex items-center gap-2 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 px-8 py-4 text-base font-semibold"
            >
              <Sparkles className="w-5 h-5" /> Begin
            </button>
          </motion.div>
        )}

        {(step === 'think' || step === 'add' || step === 'subtract') && (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="rounded-2xl mm-glass p-8 sm:p-12 text-center space-y-6"
          >
            <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
              Step {step === 'think' ? 1 : step === 'add' ? 2 : 3} of 4
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              {instruction[step].title}
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-300">{instruction[step].body}</p>
            <p className="font-mono text-sm text-fuchsia-600 dark:text-fuchsia-300">{instruction[step].example}</p>
            <button
              type="button"
              onClick={() => go(step === 'think' ? 'add' : step === 'add' ? 'subtract' : 'grid')}
              className="inline-flex items-center gap-2 rounded-xl mm-btn-primary px-8 py-4 text-base font-semibold text-white"
            >
              Done <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {step === 'grid' && (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="rounded-2xl mm-glass p-4 sm:p-8 space-y-5"
          >
            <div className="text-center space-y-1">
              <p className="font-mono text-xs text-slate-500 dark:text-slate-400">Step 4 of 4</p>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Find your final number. Memorise the symbol next to it.
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Then focus on that symbol and touch the crystal ball.</p>
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1 sm:gap-1.5">
              {grid.cells.map((sym, n) => (
                <div
                  key={n}
                  className="flex items-center justify-between gap-1 rounded-md bg-slate-50 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800 px-1.5 py-1"
                >
                  <span className="font-mono text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 tabular-nums">{n}</span>
                  <span className="text-base sm:text-lg leading-none text-slate-900 dark:text-white">{sym}</span>
                </div>
              ))}
            </div>
            <div className="text-center">
              <button
                type="button"
                onClick={gaze}
                className="inline-flex items-center gap-2 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 px-8 py-4 text-base font-semibold text-white"
              >
                <Sparkles className="w-5 h-5" /> I have my symbol — read my mind
              </button>
            </div>
          </motion.div>
        )}

        {step === 'gazing' && (
          <motion.div
            key="gazing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-fuchsia-500/30 bg-gradient-to-b from-[#1a0b2e] to-[#0A1024] p-12 text-center space-y-6 text-white"
          >
            <CrystalOrb spinning />
            <p className="font-display text-2xl sm:text-3xl font-bold">Focus on your symbol…</p>
            <p className="text-sm text-fuchsia-200/80">Picture it inside the glass.</p>
          </motion.div>
        )}

        {step === 'reveal' && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-fuchsia-500/30 bg-gradient-to-b from-[#1a0b2e] to-[#0A1024] p-10 sm:p-14 text-center space-y-6 text-white"
          >
            <p className="text-xs font-semibold tracking-[0.3em] text-fuchsia-300">YOUR SYMBOL IS</p>
            <motion.div
              initial={{ scale: 0.2, rotate: -90, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 120, damping: 12 }}
              className="mx-auto w-44 h-44 sm:w-56 sm:h-56 rounded-full bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.35),rgba(168,85,247,0.35)_40%,rgba(15,23,42,0.9)_75%)] border border-fuchsia-300/40 shadow-[0_0_80px_rgba(217,70,239,0.45)] flex items-center justify-center"
            >
              <span className="text-8xl sm:text-9xl leading-none drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]">{grid.target}</span>
            </motion.div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={again}
                className="inline-flex items-center gap-2 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 px-6 py-3 text-sm font-semibold"
              >
                <RotateCcw className="w-4 h-4" /> Try a different number
              </button>
              <button
                type="button"
                onClick={onExit}
                className="rounded-xl border border-white/20 hover:bg-white/10 px-6 py-3 text-sm font-semibold"
              >
                More mind games
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CrystalOrb({ spinning = false }: { spinning?: boolean }) {
  return (
    <div className="relative mx-auto w-36 h-36">
      <div
        className={`absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.45),rgba(168,85,247,0.45)_40%,rgba(15,23,42,0.95)_75%)] border border-fuchsia-300/40 shadow-[0_0_60px_rgba(217,70,239,0.4)] ${
          spinning ? 'animate-pulse' : ''
        }`}
      />
      <div
        className={`absolute -inset-3 rounded-full border border-dashed border-fuchsia-400/40 ${spinning ? 'animate-orbit-fast' : 'animate-orbit-slow'}`}
      />
    </div>
  );
}
