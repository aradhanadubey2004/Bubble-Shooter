import React from 'react';
import { X, Play, Infinity, CheckCircle2 } from 'lucide-react';
import { GAME_LEVELS } from '../game/levels';
import { GameMode } from '../game/types';

interface LevelSelectModalProps {
  isOpen: boolean;
  currentLevelId: number;
  unlockedLevel: number;
  currentMode: GameMode;
  onSelectLevel: (levelId: number) => void;
  onSelectMode: (mode: GameMode) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  isOpen,
  currentLevelId,
  unlockedLevel,
  currentMode,
  onSelectLevel,
  onSelectMode,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white tracking-tight">Select Level & Mode</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex p-1 bg-slate-950/80 rounded-xl border border-slate-800/80 my-4">
          <button
            onClick={() => onSelectMode('LEVELS')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              currentMode === 'LEVELS'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Puzzle Levels</span>
          </button>
          <button
            onClick={() => onSelectMode('ARCADE')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              currentMode === 'ARCADE'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Infinity className="w-3.5 h-3.5" />
            <span>Endless Arcade</span>
          </button>
        </div>

        {currentMode === 'LEVELS' ? (
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
              Campaign Levels
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              {GAME_LEVELS.map((lvl) => {
                const isSelected = lvl.id === currentLevelId;
                const isUnlocked = lvl.id <= unlockedLevel;

                return (
                  <button
                    key={lvl.id}
                    disabled={!isUnlocked}
                    onClick={() => {
                      onSelectLevel(lvl.id);
                      onClose();
                    }}
                    className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 shadow-md shadow-indigo-500/10'
                        : isUnlocked
                        ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 text-slate-200'
                        : 'bg-slate-950/30 border-slate-900 opacity-40 cursor-not-allowed text-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-sky-400">Level {lvl.id}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                    </div>
                    <span className="text-sm font-semibold text-white truncate block">
                      {lvl.name}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate block mt-0.5">
                      {lvl.colors.length} colors · {lvl.maxShots} shots
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 my-2 text-center">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3">
              <Infinity className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Endless Arcade Mode</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Test your endurance! The ceiling drops 1 row every 5 non-matching shots. Pop bubbles, prevent the line from crossing the danger threshold, and achieve the highest possible score!
            </p>
            <button
              onClick={() => {
                onSelectMode('ARCADE');
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
            >
              Start Endless Arcade
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
