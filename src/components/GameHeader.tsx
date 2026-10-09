import React from 'react';
import { Volume2, VolumeX, HelpCircle, RotateCcw, Trophy, Sparkles } from 'lucide-react';
import { GameMode } from '../game/types';

interface GameHeaderProps {
  score: number;
  highScore: number;
  levelName: string;
  levelNumber: number;
  mode: GameMode;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenHelp: () => void;
  onRestart: () => void;
  onOpenLevelSelect: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  score,
  highScore,
  levelName,
  levelNumber,
  mode,
  isMuted,
  onToggleMute,
  onOpenHelp,
  onRestart,
  onOpenLevelSelect,
}) => {
  return (
    <header className="w-full max-w-4xl mx-auto flex items-center justify-between gap-4 px-4 py-3 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      {/* Zone 1: Wordmark & Level Badge */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center shadow-sm shadow-sky-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold tracking-tight text-lg sm:text-xl text-white">
            Bubble Arcade
          </span>
        </div>

        <button
          onClick={onOpenLevelSelect}
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700/60"
          title="Change Level or Game Mode"
        >
          {mode === 'LEVELS' ? (
            <>
              <span className="text-sky-400">Level {levelNumber}:</span>
              <span className="max-w-[110px] truncate">{levelName}</span>
            </>
          ) : (
            <span className="text-amber-400">Endless Arcade</span>
          )}
        </button>
      </div>

      {/* Zone 2: Clean unboxed stats (Score & High Score) */}
      <div className="flex items-center gap-4 sm:gap-6 text-sm">
        <div className="flex flex-col items-center sm:items-start">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Score</span>
          <span className="font-bold text-base sm:text-lg text-white tabular-nums tracking-tight">
            {score.toLocaleString()}
          </span>
        </div>

        <div className="hidden xs:flex flex-col items-center sm:items-start">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-amber-400/80 flex items-center gap-1">
            <Trophy className="w-2.5 h-2.5" /> High
          </span>
          <span className="font-bold text-base sm:text-lg text-amber-300 tabular-nums tracking-tight">
            {highScore.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Zone 3: Functional header actions */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={onRestart}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors border border-transparent hover:border-slate-700/60"
          title="Restart Current Board"
          aria-label="Restart current game"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleMute}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors border border-transparent hover:border-slate-700/60"
          title={isMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
          aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        <button
          onClick={onOpenHelp}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors border border-transparent hover:border-slate-700/60"
          title="How to Play"
          aria-label="How to play instructions"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
