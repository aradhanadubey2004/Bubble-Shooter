/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { GameHeader } from './components/GameHeader';
import { BubbleGame } from './components/BubbleGame';
import { HowToPlayModal } from './components/HowToPlayModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { sound } from './game/audio';
import { GAME_LEVELS } from './game/levels';
import { GameMode } from './game/types';
import { Play, Sparkles, Trophy, HelpCircle, Flame, Target } from 'lucide-react';

export default function App() {
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [unlockedLevel, setUnlockedLevel] = useState<number>(1);
  const [gameMode, setGameMode] = useState<GameMode>('LEVELS');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [restartKey, setRestartKey] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isLevelSelectOpen, setIsLevelSelectOpen] = useState<boolean>(false);

  // Load high score and unlocked level from localStorage
  useEffect(() => {
    const savedHighScore = localStorage.getItem('bubble_shooter_high_score');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10) || 0);
    }
    const savedUnlocked = localStorage.getItem('bubble_shooter_unlocked_level');
    if (savedUnlocked) {
      setUnlockedLevel(parseInt(savedUnlocked, 10) || 1);
    }
  }, []);

  // Update score and high score with stable callback
  const handleUpdateScore = React.useCallback((newScore: number) => {
    setScore(newScore);
    setHighScore((prev) => {
      if (newScore > prev) {
        localStorage.setItem('bubble_shooter_high_score', String(newScore));
        return newScore;
      }
      return prev;
    });
  }, []);

  // Next level handler
  const handleNextLevel = () => {
    if (currentLevelId < GAME_LEVELS.length) {
      const nextId = currentLevelId + 1;
      setCurrentLevelId(nextId);
      if (nextId > unlockedLevel) {
        setUnlockedLevel(nextId);
        localStorage.setItem('bubble_shooter_unlocked_level', String(nextId));
      }
    }
  };

  const handleRestartLevel = () => {
    setRestartKey((prev) => prev + 1);
    setScore(0);
  };

  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const currentLevelConfig =
    GAME_LEVELS.find((l) => l.id === currentLevelId) || GAME_LEVELS[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <GameHeader
        score={score}
        highScore={highScore}
        levelName={currentLevelConfig.name}
        levelNumber={currentLevelConfig.id}
        mode={gameMode}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenHelp={() => setIsHelpOpen(true)}
        onRestart={handleRestartLevel}
        onOpenLevelSelect={() => setIsLevelSelectOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 w-full max-w-4xl mx-auto">
        {!hasStarted ? (
          /* Title Menu / Welcome Screen */
          <div className="w-full max-w-md mx-auto rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-2xl text-center flex flex-col items-center">
            {/* Logo Mascot Badge */}
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-500 flex items-center justify-center shadow-xl shadow-indigo-500/25 animate-bounce-subtle">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow">
                Arcade
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
              Bubble Shooter
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs mb-6">
              Aim, match 3 or more colors, trigger chain reactions, and drop massive clusters!
            </p>

            {/* Quick Feature Strip */}
            <div className="w-full grid grid-cols-3 gap-2.5 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3 mb-6 text-center">
              <div className="flex flex-col items-center">
                <Target className="w-4 h-4 text-sky-400 mb-1" />
                <span className="text-[10px] text-slate-400 uppercase font-semibold">8 Levels</span>
                <span className="text-xs font-bold text-white">Campaign</span>
              </div>
              <div className="flex flex-col items-center border-x border-slate-800">
                <Flame className="w-4 h-4 text-amber-400 mb-1" />
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Combos</span>
                <span className="text-xs font-bold text-white">Avalanche</span>
              </div>
              <div className="flex flex-col items-center">
                <Trophy className="w-4 h-4 text-emerald-400 mb-1" />
                <span className="text-[10px] text-slate-400 uppercase font-semibold">High Score</span>
                <span className="text-xs font-bold text-amber-300 tabular-nums">
                  {highScore > 0 ? highScore.toLocaleString() : 'Ready'}
                </span>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="w-full flex flex-col gap-3">
              <button
                onClick={() => setHasStarted(true)}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 hover:via-indigo-500 hover:to-purple-500 font-extrabold text-base text-white shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Start Game</span>
              </button>

              <button
                onClick={() => {
                  setGameMode('ARCADE');
                  setHasStarted(true);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Play Endless Arcade Mode</span>
              </button>

              <button
                onClick={() => setIsHelpOpen(true)}
                className="w-full py-2 px-4 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>How to Play & Shortcuts</span>
              </button>
            </div>
          </div>
        ) : (
          /* Active Playing Canvas & Controls */
          <BubbleGame
            currentLevelId={currentLevelId}
            mode={gameMode}
            highScore={highScore}
            restartKey={restartKey}
            onUpdateScore={handleUpdateScore}
            onNextLevel={handleNextLevel}
            onRestartLevel={handleRestartLevel}
            onOpenLevelSelect={() => setIsLevelSelectOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-3 text-xs text-slate-500 border-t border-slate-900">
        <p>Built with React, Vite & HTML5 Canvas · Responsive Arcade Gaming</p>
      </footer>

      {/* How to Play Modal */}
      <HowToPlayModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* Level Select Modal */}
      <LevelSelectModal
        isOpen={isLevelSelectOpen}
        currentLevelId={currentLevelId}
        unlockedLevel={unlockedLevel}
        currentMode={gameMode}
        onSelectLevel={(id) => {
          setCurrentLevelId(id);
          setGameMode('LEVELS');
        }}
        onSelectMode={(mode) => {
          setGameMode(mode);
        }}
        onClose={() => setIsLevelSelectOpen(false)}
      />
    </div>
  );
}
