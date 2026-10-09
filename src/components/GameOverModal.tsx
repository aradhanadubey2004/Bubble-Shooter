import React from 'react';
import { Trophy, RotateCcw, ArrowRight, Star, AlertTriangle, Home, Flame } from 'lucide-react';
import { GameStats, LevelConfig } from '../game/types';

interface GameOverModalProps {
  type: 'VICTORY' | 'GAMEOVER';
  reason?: 'OUT_OF_SHOTS' | 'DANGER_BREACHED';
  stats: GameStats;
  highScore: number;
  currentLevel: LevelConfig;
  hasNextLevel: boolean;
  onRestart: () => void;
  onNextLevel: () => void;
  onOpenLevelSelect: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  type,
  reason,
  stats,
  highScore,
  currentLevel,
  hasNextLevel,
  onRestart,
  onNextLevel,
  onOpenLevelSelect,
}) => {
  const isVictory = type === 'VICTORY';
  const isNewHighScore = stats.score > highScore;

  // Calculate star rating (1 to 3 stars based on shots remaining)
  let stars = 1;
  if (isVictory) {
    const shotRatio = stats.shotsLeft / currentLevel.maxShots;
    if (shotRatio >= 0.45) stars = 3;
    else if (shotRatio >= 0.2) stars = 2;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-center text-slate-100 flex flex-col items-center">
        {/* Header Icon */}
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg ${
            isVictory
              ? 'bg-gradient-to-tr from-amber-500 to-emerald-400 text-slate-950 shadow-amber-500/20'
              : 'bg-gradient-to-tr from-rose-500 to-amber-500 text-white shadow-rose-500/20'
          }`}
        >
          {isVictory ? (
            <Trophy className="w-8 h-8 fill-current" />
          ) : (
            <AlertTriangle className="w-8 h-8" />
          )}
        </div>

        {/* Title */}
        <h2 className="text-2xl font-black tracking-tight text-white mb-1">
          {isVictory ? 'Level Complete!' : 'Game Over'}
        </h2>
        <p className="text-sm text-slate-400 mb-4">
          {isVictory
            ? `You cleared all bubbles in ${currentLevel.name}!`
            : reason === 'OUT_OF_SHOTS'
            ? 'Ran out of shots before clearing the board.'
            : 'Bubbles crossed the danger line!'}
        </p>

        {/* Stars for victory */}
        {isVictory && (
          <div className="flex items-center justify-center gap-2 mb-4">
            {[1, 2, 3].map((starNum) => (
              <Star
                key={starNum}
                className={`w-7 h-7 transition-all ${
                  starNum <= stars
                    ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                    : 'text-slate-700'
                }`}
              />
            ))}
          </div>
        )}

        {/* Score Card */}
        <div className="w-full bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 mb-5">
          <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
            <span className="text-xs text-slate-400 font-medium">Final Score</span>
            <span className="text-lg font-bold text-white tabular-nums">
              {stats.score.toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2.5 text-center">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Popped</span>
              <span className="text-sm font-bold text-sky-400 tabular-nums">
                {stats.bubblesPopped}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Dropped</span>
              <span className="text-sm font-bold text-emerald-400 tabular-nums">
                {stats.orphansDropped}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Max Combo</span>
              <span className="text-sm font-bold text-amber-400 tabular-nums">
                {stats.maxCombo}x
              </span>
            </div>
          </div>

          {isNewHighScore && (
            <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-center gap-1.5 text-xs font-bold text-amber-400">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>New Personal Record!</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          {isVictory && hasNextLevel ? (
            <button
              onClick={onNextLevel}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-98 transition-all"
            >
              <span>Next Level</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : null}

          <button
            onClick={onRestart}
            className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-98 ${
              isVictory && hasNextLevel
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>

          <button
            onClick={onOpenLevelSelect}
            className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors flex items-center justify-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Select Level / Mode</span>
          </button>
        </div>
      </div>
    </div>
  );
};
