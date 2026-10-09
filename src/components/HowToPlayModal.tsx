import React from 'react';
import { X, Target, Sparkles, Layers, ShieldAlert, MousePointer, Keyboard, Smartphone } from 'lucide-react';
import { ALL_COLORS, BUBBLE_COLORS } from '../game/constants';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">How to Play Bubble Shooter</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close rules"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Core Rules */}
        <div className="space-y-4 my-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">1. Aim & Shoot</h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-0.5">
                Move your mouse or drag with your finger to aim the laser guide. Click or release to shoot the loaded bubble. Bounce shots off the side walls to reach tricky pockets!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">2. Match 3 or More</h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-0.5">
                Connect three or more bubbles of the same color to pop them. Consecutive pops increase your Combo Multiplier for huge bonus scores!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">3. Disconnect Clusters (Orphan Drop)</h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-0.5">
                Bubbles that lose their connection to the top ceiling will tumble down. Drop large clusters for massive point cascades!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">4. Watch the Limit</h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-0.5">
                Don't let bubbles cross the bottom Danger Line, and watch your remaining shots. Clear the board to win!
              </p>
            </div>
          </div>
        </div>

        {/* Color Symbols Guide (Accessibility) */}
        <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 mb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Color Symbols (Color-Blind Friendly)
          </span>
          <div className="grid grid-cols-3 gap-2">
            {ALL_COLORS.map((col) => {
              const meta = BUBBLE_COLORS[col];
              return (
                <div key={col} className="flex items-center gap-1.5 text-xs text-slate-300">
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                    style={{ backgroundColor: meta.fill }}
                  />
                  <span className="capitalize">{meta.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Controls Guide */}
        <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 mb-5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Controls & Shortcuts
          </span>
          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-400">
                <MousePointer className="w-3.5 h-3.5" /> Aim & Shoot:
              </span>
              <span className="font-medium text-white">Move cursor + Left Click</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Smartphone className="w-3.5 h-3.5" /> Mobile Touch:
              </span>
              <span className="font-medium text-white">Drag to aim, release to shoot</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Keyboard className="w-3.5 h-3.5" /> Swap Bubble:
              </span>
              <span className="font-medium text-sky-400 font-mono">Space, C, or Swap Button</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-sm text-white transition-colors shadow-md shadow-indigo-600/20"
        >
          Got It, Let's Play!
        </button>
      </div>
    </div>
  );
};
