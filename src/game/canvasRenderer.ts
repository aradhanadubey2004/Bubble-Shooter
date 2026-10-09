import {
  BUBBLE_COLORS,
  BUBBLE_DIAMETER,
  BUBBLE_RADIUS,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  DANGER_LINE_Y,
  LAUNCHER_X,
  LAUNCHER_Y,
} from './constants';
import { getBubbleCenter, snapToGrid } from './grid';
import { Bubble, BubbleColor, FallingBubble, PopParticle, Projectile, ScoreFloater } from './types';

/**
 * Draws an accessible symbol inside the bubble for color-blind friendly clarity.
 */
function drawBubbleSymbol(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  symbol: string
) {
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.lineWidth = 1;

  const s = radius * 0.38;

  ctx.beginPath();
  switch (symbol) {
    case 'diamond':
      ctx.moveTo(x, y - s);
      ctx.lineTo(x + s, y);
      ctx.lineTo(x, y + s);
      ctx.lineTo(x - s, y);
      ctx.closePath();
      break;

    case 'circle':
      ctx.arc(x, y, s * 0.75, 0, Math.PI * 2);
      break;

    case 'triangle':
      ctx.moveTo(x, y - s);
      ctx.lineTo(x + s * 0.9, y + s * 0.7);
      ctx.lineTo(x - s * 0.9, y + s * 0.7);
      ctx.closePath();
      break;

    case 'star': {
      const spikes = 5;
      const outerR = s;
      const innerR = s * 0.45;
      let rot = (Math.PI / 2) * 3;
      const step = Math.PI / spikes;
      ctx.moveTo(x, y - outerR);
      for (let i = 0; i < spikes; i++) {
        let px = x + Math.cos(rot) * outerR;
        let py = y + Math.sin(rot) * outerR;
        ctx.lineTo(px, py);
        rot += step;
        px = x + Math.cos(rot) * innerR;
        py = y + Math.sin(rot) * innerR;
        ctx.lineTo(px, py);
        rot += step;
      }
      ctx.closePath();
      break;
    }

    case 'square':
      ctx.rect(x - s * 0.65, y - s * 0.65, s * 1.3, s * 1.3);
      break;

    case 'hexagon': {
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const px = x + Math.cos(angle) * s * 0.85;
        const py = y + Math.sin(angle) * s * 0.85;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      break;
    }
  }

  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

/**
 * Draws a single polished glossy 3D bubble.
 */
export function drawBubble(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: BubbleColor,
  radius = BUBBLE_RADIUS,
  alpha = 1,
  scale = 1
) {
  if (alpha <= 0) return;
  const meta = BUBBLE_COLORS[color];
  const r = radius * scale;

  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

  // Outer subtle glow
  ctx.beginPath();
  ctx.arc(x, y, r + 2, 0, Math.PI * 2);
  ctx.fillStyle = meta.glow;
  ctx.fill();

  // Main 3D Spherical Radial Gradient
  const grad = ctx.createRadialGradient(
    x - r * 0.35,
    y - r * 0.35,
    r * 0.1,
    x,
    y,
    r
  );
  grad.addColorStop(0, meta.light);
  grad.addColorStop(0.5, meta.fill);
  grad.addColorStop(1, meta.dark);

  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // Dark rim outline
  ctx.strokeStyle = meta.dark;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Specular reflection highlight oval (top left)
  const hlGrad = ctx.createLinearGradient(
    x - r * 0.5,
    y - r * 0.5,
    x,
    y
  );
  hlGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
  hlGrad.addColorStop(1, 'rgba(255, 255, 255, 0.05)');

  ctx.save();
  ctx.beginPath();
  ctx.ellipse(
    x - r * 0.3,
    y - r * 0.32,
    r * 0.38,
    r * 0.22,
    -Math.PI / 4,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = hlGrad;
  ctx.fill();
  ctx.restore();

  // Secondary subtle bottom reflection
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(
    x + r * 0.25,
    y + r * 0.35,
    r * 0.3,
    r * 0.12,
    -Math.PI / 4,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.fill();
  ctx.restore();

  // Central accessible symbol
  drawBubbleSymbol(ctx, x, y, r, meta.symbol);

  ctx.restore();
}

/**
 * Renders the canvas backdrop, ceiling beam, side rails, and hex dots.
 */
export function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  // Deep arcade slate background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, '#090f1f');
  bgGrad.addColorStop(0.5, '#0c152d');
  bgGrad.addColorStop(1, '#080d1a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle background hexagonal dot grid
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
  const dotSpacingX = 32;
  const dotSpacingY = 28;
  for (let py = 16; py < height - 60; py += dotSpacingY) {
    const shift = (Math.floor(py / dotSpacingY) % 2) * (dotSpacingX / 2);
    for (let px = 8 + shift; px < width; px += dotSpacingX) {
      ctx.beginPath();
      ctx.arc(px, py, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // Top metallic ceiling bar
  const ceilingGrad = ctx.createLinearGradient(0, 0, 0, 16);
  ceilingGrad.addColorStop(0, '#334155');
  ceilingGrad.addColorStop(0.5, '#1e293b');
  ceilingGrad.addColorStop(1, '#0f172a');
  ctx.fillStyle = ceilingGrad;
  ctx.fillRect(0, 0, width, 14);

  // Ceiling border and rivets
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 14);
  ctx.lineTo(width, 14);
  ctx.stroke();

  // Rivets on ceiling
  ctx.fillStyle = '#64748b';
  for (let rx = 24; rx < width; rx += 48) {
    ctx.beginPath();
    ctx.arc(rx, 7, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Side guide rails
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(1, 14);
  ctx.lineTo(1, height - 70);
  ctx.moveTo(width - 1, 14);
  ctx.lineTo(width - 1, height - 70);
  ctx.stroke();
}

/**
 * Draws the bottom danger line where bubbles crossing means Game Over.
 */
export function drawDangerLine(
  ctx: CanvasRenderingContext2D,
  width: number,
  timeMs: number,
  warningActive: boolean
) {
  ctx.save();
  const y = DANGER_LINE_Y;
  const pulse = Math.sin(timeMs / 200) * 0.5 + 0.5;

  if (warningActive) {
    // Glowing red danger zone warning
    ctx.fillStyle = `rgba(239, 68, 68, ${0.08 + pulse * 0.12})`;
    ctx.fillRect(0, y, width, CANVAS_HEIGHT - y - 60);

    ctx.strokeStyle = `rgba(239, 68, 68, ${0.7 + pulse * 0.3})`;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([8, 6]);
    ctx.lineDashOffset = -timeMs * 0.04;
  } else {
    // Subtle amber / gold alert line
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.lineDashOffset = -timeMs * 0.02;
  }

  ctx.beginPath();
  ctx.moveTo(8, y);
  ctx.lineTo(width - 8, y);
  ctx.stroke();
  ctx.setLineDash([]);

  // Tiny label indicator
  ctx.font = '600 10px "Outfit", sans-serif';
  ctx.fillStyle = warningActive ? '#ef4444' : 'rgba(245, 158, 11, 0.6)';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText(warningActive ? 'DANGER ZONE' : 'LIMIT', width - 12, y - 4);

  ctx.restore();
}

/**
 * Calculates and draws the trajectory dotted line with wall reflection,
 * plus a ghost preview circle where the projectile will snap.
 */
export function drawTrajectory(
  ctx: CanvasRenderingContext2D,
  angleRad: number,
  grid: (Bubble | null)[][],
  currentColor: BubbleColor
) {
  ctx.save();

  let curX = LAUNCHER_X;
  let curY = LAUNCHER_Y;
  let dirX = Math.cos(angleRad);
  let dirY = Math.sin(angleRad);

  const step = 8;
  const dots: Array<{ x: number; y: number }> = [];
  let ghostSnap: { row: number; col: number } | null = null;
  let collided = false;

  const maxSteps = 120;
  let bounces = 0;

  for (let i = 0; i < maxSteps; i++) {
    curX += dirX * step;
    curY += dirY * step;

    // Wall bounce
    if (curX <= BUBBLE_RADIUS) {
      curX = BUBBLE_RADIUS;
      dirX = -dirX;
      bounces++;
      if (bounces > 2) break;
    } else if (curX >= CANVAS_WIDTH - BUBBLE_RADIUS) {
      curX = CANVAS_WIDTH - BUBBLE_RADIUS;
      dirX = -dirX;
      bounces++;
      if (bounces > 2) break;
    }

    // Ceiling hit
    if (curY <= BUBBLE_RADIUS + 14) {
      curY = BUBBLE_RADIUS + 14;
      collided = true;
      ghostSnap = snapToGrid(curX, curY, grid);
      dots.push({ x: curX, y: curY });
      break;
    }

    // Collision check against existing bubbles
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        const bubble = grid[r][c];
        if (bubble) {
          const distSq = (curX - bubble.x) ** 2 + (curY - bubble.y) ** 2;
          if (distSq <= (BUBBLE_DIAMETER - 4) ** 2) {
            collided = true;
            ghostSnap = snapToGrid(curX, curY, grid, bubble);
            break;
          }
        }
      }
      if (collided) break;
    }

    dots.push({ x: curX, y: curY });
    if (collided) break;
  }

  // Draw trajectory dots
  const meta = BUBBLE_COLORS[currentColor];
  for (let i = 0; i < dots.length; i++) {
    const pt = dots[i];
    const alpha = Math.max(0.2, 0.85 - (i / dots.length) * 0.45);
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, i % 2 === 0 ? 3 : 2, 0, Math.PI * 2);
    ctx.fillStyle = meta.light;
    ctx.globalAlpha = alpha;
    ctx.fill();
  }

  // Draw ghost preview where the bubble will attach
  if (ghostSnap) {
    const targetPos = getBubbleCenter(ghostSnap.row, ghostSnap.col);
    ctx.globalAlpha = 0.45;
    drawBubble(ctx, targetPos.x, targetPos.y, currentColor, BUBBLE_RADIUS, 0.45, 0.95);

    // Glowing target ring around snap slot
    ctx.beginPath();
    ctx.arc(targetPos.x, targetPos.y, BUBBLE_RADIUS + 3, 0, Math.PI * 2);
    ctx.strokeStyle = meta.light;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.restore();
}

/**
 * Draws the rotating launcher cannon and base.
 */
export function drawLauncher(
  ctx: CanvasRenderingContext2D,
  angleRad: number,
  loadedColor: BubbleColor,
  recoil: number
) {
  ctx.save();
  const cx = LAUNCHER_X;
  const cy = LAUNCHER_Y;

  // Base circular turntable plate
  const baseGrad = ctx.createRadialGradient(cx, cy + 12, 10, cx, cy + 12, 42);
  baseGrad.addColorStop(0, '#334155');
  baseGrad.addColorStop(0.7, '#1e293b');
  baseGrad.addColorStop(1, '#0f172a');

  ctx.beginPath();
  ctx.arc(cx, cy + 12, 40, 0, Math.PI * 2);
  ctx.fillStyle = baseGrad;
  ctx.fill();
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Chrome ring on turntable
  ctx.beginPath();
  ctx.arc(cx, cy + 12, 32, 0, Math.PI * 2);
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Swiveling arrow / cannon barrel
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angleRad + Math.PI / 2); // 0 angle is straight up

  // Apply recoil push backwards
  const recoilY = recoil * 8;

  // Cannon barrel shaft
  const barrelGrad = ctx.createLinearGradient(-14, -30, 14, -30);
  barrelGrad.addColorStop(0, '#1e293b');
  barrelGrad.addColorStop(0.5, '#475569');
  barrelGrad.addColorStop(1, '#0f172a');

  ctx.fillStyle = barrelGrad;
  ctx.beginPath();
  ctx.roundRect(-12, -48 + recoilY, 24, 40, [6, 6, 0, 0]);
  ctx.fill();
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Aiming arrow tip
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.moveTo(0, -56 + recoilY);
  ctx.lineTo(8, -46 + recoilY);
  ctx.lineTo(-8, -46 + recoilY);
  ctx.closePath();
  ctx.fill();

  ctx.restore();

  // Loaded bubble resting inside the chamber
  drawBubble(ctx, cx, cy, loadedColor, BUBBLE_RADIUS, 1, 1);

  ctx.restore();
}

/**
 * Draws bursting particles from popped bubbles.
 */
export function drawParticles(ctx: CanvasRenderingContext2D, particles: PopParticle[]) {
  ctx.save();
  for (const p of particles) {
    if (p.alpha <= 0) continue;
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Draws floating falling bubbles (orphans that were disconnected from ceiling).
 */
export function drawFallingBubbles(ctx: CanvasRenderingContext2D, falling: FallingBubble[]) {
  for (const b of falling) {
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.rotation);
    drawBubble(ctx, 0, 0, b.color, BUBBLE_RADIUS, b.alpha, 1);
    ctx.restore();
  }
}

/**
 * Draws floating score indicators (+100, COMBO x2! +500).
 */
export function drawScoreFloaters(ctx: CanvasRenderingContext2D, floaters: ScoreFloater[]) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (const f of floaters) {
    if (f.alpha <= 0) continue;
    ctx.save();
    ctx.globalAlpha = f.alpha;
    ctx.translate(f.x, f.y);
    ctx.scale(f.scale, f.scale);

    // Dark stroke text
    ctx.font = '800 15px "Outfit", sans-serif';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.lineWidth = 3;
    ctx.strokeText(f.text, 0, 0);

    ctx.fillStyle = f.color;
    ctx.fillText(f.text, 0, 0);
    ctx.restore();
  }
  ctx.restore();
}
