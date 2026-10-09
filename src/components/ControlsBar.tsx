import React from 'react';
import { ArrowLeftRight, Pause, Play, AlertCircle } from 'lucide-react';
import { BubbleColor, GameMode } from '../game/types';
import { BUBBLE_COLORS } from '../game/constants';

interface ControlsBarProps {
  nextColor: BubbleColor;
  currentColor: BubbleColor;
  shotsLeft: number;
  maxShots: number;
  missesLeft: number; // for endless mode
  mode: GameMode;
  isPaused: boolean;
  onSwap: () => void;
  onTogglePause: () => void;
}

export const ControlsBar: React.FC<ControlsBarProps> = ({
  nextColor,
  currentColor,
  shotsLeft,
  maxShots,
  missesLeft,
  mode,
  isPaused,
  onSwap,
  onTogglePause,
}) => {
  const nextMeta = BUBBLE_COLORS[nextColor];
  const currentMeta = BUBBLE_COLORS[currentColor];

  const shotPercentage = Math.round((shotsLeft / maxShots) * 100);
  const isLowShots = shotsLeft <= 5;

  return (
    <div className="w-full max-w-[420px] mx-auto mt-2 px-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-lg flex items-center justify-between gap-3 text-slate-200">
      {/* Shots Left / Misses Counter */}
      <div className="flex flex-col min-w-[90px]">
        {mode === 'LEVELS' ? (
          <>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Shots
              </span>
              {isLowShots && (
                <span className="flex items-center text-rose-400 text-[10px] font-bold animate-pulse">
                  <AlertCircle className="w-2.5 h-2.5 mr-0.5" /> LOW
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-1.5">
              <span
                className={`text-xl font-black tabular-nums tracking-tight ${
                  isLowShots ? 'text-rose-400' : 'text-white'
                }`}
              >
                {shotsLeft}
              </span>
              <span className="text-xs text-slate-500 font-medium">/ {maxShots}</span>
            </div>
          </>
        ) : (
          <>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Ceiling Drop
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full border ${
                    i < missesLeft
                      ? 'bg-amber-400 border-amber-300 shadow-sm shadow-amber-400/40'
                      : 'bg-slate-800 border-slate-700'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bubble Preview & Swap Button */}
      <div className="flex items-center gap-2">
        {/* Next Bubble Slot */}
        <div className="flex items-center gap-1.5 bg-slate-950/60 px-2 py-1 rounded-lg border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Next</span>
          <div
            className="w-6 h-6 rounded-full border border-white/20 shadow-inner flex items-center justify-center transition-transform"
            style={{
              backgroundColor: nextMeta.fill,
              boxShadow: `0 0 10px ${nextMeta.glow}`,
            }}
          >
            <div className="w-2 h-2 rounded-full bg-white/60 -mt-1 -ml-1" />
          </div>
        </div>

        {/* Swap action button */}
        <button
          onClick={onSwap}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-600/90 hover:bg-indigo-500 text-white font-semibold text-xs transition-all active:scale-95 shadow-sm shadow-indigo-500/20"
          title="Swap current and next bubble (Shortcut: Space or C)"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>Swap</span>
        </button>
      </div>

      {/* Pause / Resume Button */}
      <div className="flex items-center">
        <button
          onClick={onTogglePause}
          className={`p-2 rounded-lg border transition-colors ${
            isPaused
              ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700'
          }`}
          title={isPaused ? 'Resume Game' : 'Pause Game'}
        >
          {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
