import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  BUBBLE_COLORS,
  BUBBLE_DIAMETER,
  BUBBLE_RADIUS,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  DANGER_LINE_Y,
  LAUNCHER_X,
  LAUNCHER_Y,
  PROJECTILE_SPEED,
} from '../game/constants';
import {
  checkDangerLineBreach,
  findMatchingCluster,
  findOrphanBubbles,
  getBubbleCenter,
  getColumnsCount,
  getRemainingBoardColors,
  isGridEmpty,
  snapToGrid,
} from '../game/grid';
import { sound } from '../game/audio';
import { GAME_LEVELS, createLevelGrid } from '../game/levels';
import {
  drawBackground,
  drawBubble,
  drawDangerLine,
  drawFallingBubbles,
  drawLauncher,
  drawParticles,
  drawScoreFloaters,
  drawTrajectory,
} from '../game/canvasRenderer';
import {
  Bubble,
  BubbleColor,
  FallingBubble,
  GameMode,
  GameStats,
  GameStatus,
  LevelConfig,
  PopParticle,
  Projectile,
  ScoreFloater,
} from '../game/types';
import { ControlsBar } from './ControlsBar';
import { GameOverModal } from './GameOverModal';
import { Play, RotateCcw } from 'lucide-react';

interface BubbleGameProps {
  currentLevelId: number;
  mode: GameMode;
  highScore: number;
  restartKey?: number;
  onUpdateScore: (score: number) => void;
  onNextLevel: () => void;
  onRestartLevel: () => void;
  onOpenLevelSelect: () => void;
}

export const BubbleGame: React.FC<BubbleGameProps> = ({
  currentLevelId,
  mode,
  highScore,
  restartKey = 0,
  onUpdateScore,
  onNextLevel,
  onRestartLevel,
  onOpenLevelSelect,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Keep a ref to onUpdateScore so it never triggers re-initialization or animation loop churn
  const onUpdateScoreRef = useRef(onUpdateScore);
  useEffect(() => {
    onUpdateScoreRef.current = onUpdateScore;
  }, [onUpdateScore]);

  // Current level configuration
  const currentLevelConfig: LevelConfig =
    GAME_LEVELS.find((l) => l.id === currentLevelId) || GAME_LEVELS[0];

  // Game state
  const [gameStatus, setGameStatus] = useState<GameStatus>('PLAYING');
  const [gameOverReason, setGameOverReason] = useState<'OUT_OF_SHOTS' | 'DANGER_BREACHED' | undefined>();

  // Current shots left and misses counter
  const [shotsLeft, setShotsLeft] = useState<number>(currentLevelConfig.maxShots);
  const [missesLeft, setMissesLeft] = useState<number>(5);

  // Bubble colors
  const [currentColor, setCurrentColor] = useState<BubbleColor>('red');
  const [nextColor, setNextColor] = useState<BubbleColor>('blue');

  // Stats
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    shotsLeft: currentLevelConfig.maxShots,
    bubblesPopped: 0,
    orphansDropped: 0,
    combos: 0,
    maxCombo: 0,
  });

  // Game Loop Refs to prevent re-render thrashing
  const gridRef = useRef<(Bubble | null)[][]>([]);
  const projectileRef = useRef<Projectile | null>(null);
  const particlesRef = useRef<PopParticle[]>([]);
  const fallingBubblesRef = useRef<FallingBubble[]>([]);
  const scoreFloatersRef = useRef<ScoreFloater[]>([]);
  const aimAngleRef = useRef<number>(-Math.PI / 2); // Default straight up
  const isAimingRef = useRef<boolean>(false);
  const recoilRef = useRef<number>(0);
  const comboRef = useRef<number>(0);
  const scoreRef = useRef<number>(0);
  const shotsLeftRef = useRef<number>(currentLevelConfig.maxShots);
  const missesLeftRef = useRef<number>(5);
  const statusRef = useRef<GameStatus>('PLAYING');
  const currentColorRef = useRef<BubbleColor>('red');
  const nextColorRef = useRef<BubbleColor>('blue');

  // Keep refs in sync with state
  shotsLeftRef.current = shotsLeft;
  missesLeftRef.current = missesLeft;
  statusRef.current = gameStatus;
  currentColorRef.current = currentColor;
  nextColorRef.current = nextColor;

  // Helper to pick a random valid color
  const pickRandomColor = useCallback(
    (palette?: BubbleColor[]): BubbleColor => {
      const activeColors = getRemainingBoardColors(gridRef.current);
      if (activeColors.length > 0) {
        return activeColors[Math.floor(Math.random() * activeColors.length)];
      }
      const allowed = palette || currentLevelConfig.colors;
      return allowed[Math.floor(Math.random() * allowed.length)];
    },
    [currentLevelConfig.colors]
  );

  // Initialize board
  const initializeGame = useCallback(() => {
    const newGrid = createLevelGrid(currentLevelConfig);
    gridRef.current = newGrid;
    projectileRef.current = null;
    particlesRef.current = [];
    fallingBubblesRef.current = [];
    scoreFloatersRef.current = [];
    recoilRef.current = 0;
    comboRef.current = 0;
    scoreRef.current = 0;

    const initialShots = mode === 'LEVELS' ? currentLevelConfig.maxShots : 999;
    shotsLeftRef.current = initialShots;
    missesLeftRef.current = 5;

    setShotsLeft(initialShots);
    setMissesLeft(5);
    setGameStatus('PLAYING');
    setGameOverReason(undefined);

    const firstColor = pickRandomColor();
    const secondColor = pickRandomColor();
    setCurrentColor(firstColor);
    setNextColor(secondColor);
    currentColorRef.current = firstColor;
    nextColorRef.current = secondColor;

    setStats({
      score: 0,
      shotsLeft: initialShots,
      bubblesPopped: 0,
      orphansDropped: 0,
      combos: 0,
      maxCombo: 0,
    });
    onUpdateScoreRef.current(0);
  }, [currentLevelConfig, mode, pickRandomColor]);

  // Re-initialize only when level, mode, or restartKey changes (NOT on score updates!)
  useEffect(() => {
    initializeGame();
  }, [currentLevelId, mode, restartKey]);

  // Swap current and next bubble
  const handleSwap = useCallback(() => {
    if (projectileRef.current || statusRef.current !== 'PLAYING') return;
    const temp = currentColorRef.current;
    setCurrentColor(nextColorRef.current);
    setNextColor(temp);
    currentColorRef.current = nextColorRef.current;
    nextColorRef.current = temp;
    sound.playBounce();
  }, []);

  // Keyboard shortcut for Swap (Space, C), Restart (R), Pause (P)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space' || e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleSwap();
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        initializeGame();
      } else if (e.key.toLowerCase() === 'p' || e.code === 'Escape') {
        e.preventDefault();
        setGameStatus((prev) => (prev === 'PLAYING' ? 'PAUSED' : prev === 'PAUSED' ? 'PLAYING' : prev));
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleSwap, initializeGame]);

  // Shoot projectile
  const fireBubble = useCallback(() => {
    if (projectileRef.current || statusRef.current !== 'PLAYING') return;

    const angle = aimAngleRef.current;
    const vx = Math.cos(angle) * PROJECTILE_SPEED;
    const vy = Math.sin(angle) * PROJECTILE_SPEED;

    projectileRef.current = {
      x: LAUNCHER_X,
      y: LAUNCHER_Y,
      vx,
      vy,
      color: currentColorRef.current,
      active: true,
    };

    recoilRef.current = 1.0;
    sound.playShoot();
  }, []);

  // Mouse & Touch coordinate translation
  const updateAimFromPointer = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;

    const px = (clientX - rect.left) * scaleX;
    const py = (clientY - rect.top) * scaleY;

    const dx = px - LAUNCHER_X;
    const dy = py - LAUNCHER_Y;

    // Angle in radians (-PI to PI)
    let angle = Math.atan2(dy, dx);

    // Restrict aiming between -165 deg and -15 deg (cannot aim downwards into floor)
    const minAngle = (-165 * Math.PI) / 180;
    const maxAngle = (-15 * Math.PI) / 180;

    if (angle > 0) {
      // If pointing down, clamp to closest horizontal side
      angle = dx < 0 ? minAngle : maxAngle;
    } else {
      angle = Math.max(minAngle, Math.min(maxAngle, angle));
    }

    aimAngleRef.current = angle;
  }, []);

  // Main Canvas Render & Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      // Update recoil recovery
      if (recoilRef.current > 0) {
        recoilRef.current = Math.max(0, recoilRef.current - dt * 6);
      }

      // Update particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25; // gravity
        p.life += dt;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);
        if (p.life >= p.maxLife) {
          particlesRef.current.splice(i, 1);
        }
      }

      // Update falling bubbles
      for (let i = fallingBubblesRef.current.length - 1; i >= 0; i--) {
        const b = fallingBubblesRef.current[i];
        b.x += b.vx;
        b.y += b.vy;
        b.vy += 0.45; // gravity
        b.rotation += b.vRot;
        if (b.y > CANVAS_HEIGHT + BUBBLE_RADIUS * 2) {
          fallingBubblesRef.current.splice(i, 1);
        }
      }

      // Update score floaters
      for (let i = scoreFloatersRef.current.length - 1; i >= 0; i--) {
        const f = scoreFloatersRef.current[i];
        f.y += f.vy;
        f.alpha -= dt * 1.2;
        if (f.alpha <= 0) {
          scoreFloatersRef.current.splice(i, 1);
        }
      }

      // Update projectile physics
      const proj = projectileRef.current;
      if (proj && proj.active && statusRef.current === 'PLAYING') {
        proj.x += proj.vx;
        proj.y += proj.vy;

        // Left / Right wall bounce
        if (proj.x <= BUBBLE_RADIUS) {
          proj.x = BUBBLE_RADIUS;
          proj.vx = -proj.vx;
          sound.playBounce();
        } else if (proj.x >= CANVAS_WIDTH - BUBBLE_RADIUS) {
          proj.x = CANVAS_WIDTH - BUBBLE_RADIUS;
          proj.vx = -proj.vx;
          sound.playBounce();
        }

        // Collision detection against ceiling or bubbles
        let hit = false;
        let hitBubble: Bubble | null = null;

        // Ceiling collision
        if (proj.y <= BUBBLE_RADIUS + 14) {
          hit = true;
        }

        // Existing bubble collision: find closest bubble within collision threshold
        if (!hit) {
          const grid = gridRef.current;
          let minHitDistSq = (BUBBLE_DIAMETER - 4) ** 2;
          for (let r = 0; r < grid.length; r++) {
            for (let c = 0; c < grid[r].length; c++) {
              const b = grid[r][c];
              if (b) {
                const distSq = (proj.x - b.x) ** 2 + (proj.y - b.y) ** 2;
                if (distSq <= minHitDistSq) {
                  minHitDistSq = distSq;
                  hitBubble = b;
                  hit = true;
                }
              }
            }
          }
        }

        if (hit) {
          // Snap bubble to nearest valid supported hexagon slot (neighbor of hitBubble if one was hit)
          const slot = snapToGrid(proj.x, proj.y, gridRef.current, hitBubble);
          if (slot) {
            const { row, col } = slot;
            const center = getBubbleCenter(row, col);
            const newBubble: Bubble = {
              id: `b-${row}-${col}-${Date.now()}`,
              row,
              col,
              color: proj.color,
              x: center.x,
              y: center.y,
            };

            // Attach to grid first before checking matching cluster
            gridRef.current[row][col] = newBubble;
            sound.playAttach();

            // Decrement remaining shots in Levels mode
            if (mode === 'LEVELS') {
              const newShots = shotsLeftRef.current - 1;
              shotsLeftRef.current = newShots;
              setShotsLeft(newShots);
            }

            // Check matching cluster (3 or more)
            const cluster = findMatchingCluster(gridRef.current, row, col, proj.color);
            if (cluster.length >= 3) {
              // Consecutive combo increment
              comboRef.current += 1;
              const curCombo = comboRef.current;

              // Pop matched bubbles
              cluster.forEach((coord) => {
                const bubbleToPop = gridRef.current[coord.row][coord.col];
                if (bubbleToPop) {
                  gridRef.current[coord.row][coord.col] = null;

                  // Spawn sparkle particles
                  const meta = BUBBLE_COLORS[bubbleToPop.color];
                  for (let p = 0; p < 12; p++) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = 1.5 + Math.random() * 4.5;
                    particlesRef.current.push({
                      x: bubbleToPop.x,
                      y: bubbleToPop.y,
                      vx: Math.cos(angle) * speed,
                      vy: Math.sin(angle) * speed,
                      color: meta.fill,
                      size: 2.5 + Math.random() * 3,
                      alpha: 1,
                      life: 0,
                      maxLife: 0.4 + Math.random() * 0.35,
                    });
                  }
                }
              });

              // Score calculation
              const clusterScore = cluster.length * 20;
              const comboBonus = curCombo > 1 ? (curCombo - 1) * 50 : 0;
              const earnedScore = clusterScore + comboBonus;
              scoreRef.current += earnedScore;

              scoreFloatersRef.current.push({
                id: `floater-${Date.now()}`,
                x: center.x,
                y: center.y,
                text: curCombo > 1 ? `+${earnedScore} (${curCombo}x Combo!)` : `+${earnedScore}`,
                alpha: 1,
                vy: -1.2,
                color: curCombo > 1 ? '#f59e0b' : '#38bdf8',
                scale: curCombo > 1 ? 1.25 : 1,
              });

              sound.playPop(curCombo);

              // Check for orphan bubbles disconnected from ceiling
              const orphans = findOrphanBubbles(gridRef.current);
              if (orphans.length > 0) {
                let orphanScore = 0;
                orphans.forEach((o) => {
                  const ob = gridRef.current[o.row][o.col];
                  if (ob) {
                    gridRef.current[o.row][o.col] = null;
                    fallingBubblesRef.current.push({
                      id: `fall-${ob.id}`,
                      x: ob.x,
                      y: ob.y,
                      vx: (Math.random() - 0.5) * 4,
                      vy: -1 - Math.random() * 2,
                      color: ob.color,
                      rotation: 0,
                      vRot: (Math.random() - 0.5) * 0.2,
                      alpha: 1,
                    });
                    orphanScore += 50;
                  }
                });

                scoreRef.current += orphanScore;
                scoreFloatersRef.current.push({
                  id: `floater-orphan-${Date.now()}`,
                  x: CANVAS_WIDTH / 2,
                  y: center.y + 20,
                  text: `AVALANCHE! +${orphanScore}`,
                  alpha: 1,
                  vy: -1.5,
                  color: '#10b981',
                  scale: 1.3,
                });

                sound.playDrop(orphans.length);

                setStats((prev) => ({
                  ...prev,
                  orphansDropped: prev.orphansDropped + orphans.length,
                }));
              }

              // Update stats
              setStats((prev) => ({
                ...prev,
                score: scoreRef.current,
                bubblesPopped: prev.bubblesPopped + cluster.length,
                combos: prev.combos + (curCombo > 1 ? 1 : 0),
                maxCombo: Math.max(prev.maxCombo, curCombo),
              }));
              onUpdateScoreRef.current(scoreRef.current);
            } else {
              // Miss / no match -> reset combo
              comboRef.current = 0;

              // In Endless Arcade Mode, ceiling drops every 5 misses
              if (mode === 'ARCADE') {
                const newMisses = missesLeftRef.current - 1;
                if (newMisses <= 0) {
                  // Drop all rows down by 1
                  const oldGrid = gridRef.current;
                  const newGrid: (Bubble | null)[][] = [];

                  // Create new top row
                  const topRow: (Bubble | null)[] = [];
                  for (let c = 0; c < 8; c++) {
                    const color = pickRandomColor();
                    const { x, y } = getBubbleCenter(0, c);
                    topRow.push({
                      id: `top-${Date.now()}-${c}`,
                      row: 0,
                      col: c,
                      color,
                      x,
                      y,
                    });
                  }
                  newGrid.push(topRow);

                  // Shift remaining rows down
                  for (let r = 0; r < oldGrid.length - 1; r++) {
                    const shiftedRow: (Bubble | null)[] = [];
                    const maxCols = (r + 1) % 2 === 0 ? 8 : 7;
                    for (let c = 0; c < maxCols; c++) {
                      const prevBubble = oldGrid[r][c];
                      if (prevBubble) {
                        const { x, y } = getBubbleCenter(r + 1, c);
                        shiftedRow.push({
                          ...prevBubble,
                          row: r + 1,
                          x,
                          y,
                        });
                      } else {
                        shiftedRow.push(null);
                      }
                    }
                    newGrid.push(shiftedRow);
                  }

                  gridRef.current = newGrid;
                  missesLeftRef.current = 5;
                  setMissesLeft(5);
                  sound.playWarning();
                } else {
                  missesLeftRef.current = newMisses;
                  setMissesLeft(newMisses);
                }
              }
            }

            // Next bubble rotation
            const newCur = nextColorRef.current;
            const newNext = pickRandomColor();
            setCurrentColor(newCur);
            setNextColor(newNext);
            currentColorRef.current = newCur;
            nextColorRef.current = newNext;

            // Check Win / Loss condition
            if (isGridEmpty(gridRef.current)) {
              statusRef.current = 'VICTORY';
              setGameStatus('VICTORY');
              sound.playWin();
            } else if (checkDangerLineBreach(gridRef.current, DANGER_LINE_Y)) {
              statusRef.current = 'GAMEOVER';
              setGameStatus('GAMEOVER');
              setGameOverReason('DANGER_BREACHED');
              sound.playGameOver();
            } else if (mode === 'LEVELS' && shotsLeftRef.current <= 0) {
              statusRef.current = 'GAMEOVER';
              setGameStatus('GAMEOVER');
              setGameOverReason('OUT_OF_SHOTS');
              sound.playGameOver();
            }
          }

          projectileRef.current = null;
        }
      }

      // Check danger line warning condition
      const isDangerNear = checkDangerLineBreach(gridRef.current, DANGER_LINE_Y - BUBBLE_RADIUS * 1.5);

      // --- RENDERING PASS ---
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // 1. Background & Grid Guides
      drawBackground(ctx, CANVAS_WIDTH, CANVAS_HEIGHT);

      // 2. Danger Line
      drawDangerLine(ctx, CANVAS_WIDTH, currentTime, isDangerNear);

      // 3. Trajectory Dots & Ghost Snap
      if (!projectileRef.current && statusRef.current === 'PLAYING') {
        drawTrajectory(ctx, aimAngleRef.current, gridRef.current, currentColorRef.current);
      }

      // 4. Bubbles on Board
      const currentGrid = gridRef.current;
      for (let r = 0; r < currentGrid.length; r++) {
        for (let c = 0; c < currentGrid[r].length; c++) {
          const bubble = currentGrid[r][c];
          if (bubble) {
            drawBubble(ctx, bubble.x, bubble.y, bubble.color, BUBBLE_RADIUS, 1, 1);
          }
        }
      }

      // 5. In-flight Projectile
      const flyingProj = projectileRef.current;
      if (flyingProj && flyingProj.active) {
        drawBubble(ctx, flyingProj.x, flyingProj.y, flyingProj.color, BUBBLE_RADIUS, 1, 1);
      }

      // 6. Falling disconnected bubbles
      drawFallingBubbles(ctx, fallingBubblesRef.current);

      // 7. Sparkling Pop Particles
      drawParticles(ctx, particlesRef.current);

      // 8. Launcher Cannon & Loaded Bubble
      drawLauncher(
        ctx,
        aimAngleRef.current,
        currentColorRef.current,
        recoilRef.current
      );

      // 9. Floating Score Text
      drawScoreFloaters(ctx, scoreFloatersRef.current);

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [mode]);

  // Pointer event handlers for aiming & shooting
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isAimingRef.current = true;
    updateAimFromPointer(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    updateAimFromPointer(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isAimingRef.current) {
      updateAimFromPointer(e.clientX, e.clientY);
      fireBubble();
    }
    isAimingRef.current = false;
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-md mx-auto select-none">
      {/* Canvas Cabinet Container */}
      <div className="relative w-full aspect-[384/600] rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-800 bg-slate-950 touch-none">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="w-full h-full block cursor-crosshair"
        />

        {/* Pause Overlay */}
        {gameStatus === 'PAUSED' && (
          <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
            <h3 className="text-2xl font-black text-white mb-2">Game Paused</h3>
            <p className="text-xs text-slate-400 mb-6 max-w-xs">
              Take a breath! Press Resume or hit Space/P to continue.
            </p>
            <div className="flex flex-col gap-3 w-48">
              <button
                onClick={() => setGameStatus('PLAYING')}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Resume Game</span>
              </button>
              <button
                onClick={initializeGame}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold text-xs text-slate-300 flex items-center justify-center gap-2 border border-slate-700 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart Level</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <ControlsBar
        nextColor={nextColor}
        currentColor={currentColor}
        shotsLeft={shotsLeft}
        maxShots={currentLevelConfig.maxShots}
        missesLeft={missesLeft}
        mode={mode}
        isPaused={gameStatus === 'PAUSED'}
        onSwap={handleSwap}
        onTogglePause={() =>
          setGameStatus((prev) => (prev === 'PLAYING' ? 'PAUSED' : prev === 'PAUSED' ? 'PLAYING' : prev))
        }
      />

      {/* Victory / Defeat Modal */}
      {(gameStatus === 'VICTORY' || gameStatus === 'GAMEOVER') && (
        <GameOverModal
          type={gameStatus}
          reason={gameOverReason}
          stats={{ ...stats, score: scoreRef.current, shotsLeft }}
          highScore={highScore}
          currentLevel={currentLevelConfig}
          hasNextLevel={currentLevelId < GAME_LEVELS.length}
          onRestart={initializeGame}
          onNextLevel={onNextLevel}
          onOpenLevelSelect={onOpenLevelSelect}
        />
      )}
    </div>
  );
};
