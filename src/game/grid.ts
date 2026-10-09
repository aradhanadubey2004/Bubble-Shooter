import {
  BUBBLE_RADIUS,
  CANVAS_WIDTH,
  GRID_COLUMNS_EVEN,
  GRID_COLUMNS_ODD,
  MAX_GRID_ROWS,
} from './constants';
import { Bubble, BubbleColor } from './types';

const ROW_HEIGHT = BUBBLE_RADIUS * Math.sqrt(3);

/**
 * Returns the exact canvas center (x, y) for a given row and column in the staggered hexagonal grid.
 */
export function getBubbleCenter(row: number, col: number): { x: number; y: number } {
  const isOdd = row % 2 !== 0;
  const x = isOdd
    ? BUBBLE_RADIUS * 2 + col * (BUBBLE_RADIUS * 2)
    : BUBBLE_RADIUS + col * (BUBBLE_RADIUS * 2);
  const y = BUBBLE_RADIUS + row * ROW_HEIGHT;
  return { x, y };
}

/**
 * Returns max columns for a given row index.
 */
export function getColumnsCount(row: number): number {
  return row % 2 === 0 ? GRID_COLUMNS_EVEN : GRID_COLUMNS_ODD;
}

/**
 * Returns all valid neighboring grid coordinates around (row, col) in hexagonal layout.
 */
export function getGridNeighbors(row: number, col: number): Array<{ row: number; col: number }> {
  const neighbors: Array<{ row: number; col: number }> = [];
  const isOdd = row % 2 !== 0;

  // Left and Right in same row
  const horizontalDeltas = [-1, 1];
  for (const dc of horizontalDeltas) {
    const nc = col + dc;
    if (nc >= 0 && nc < getColumnsCount(row)) {
      neighbors.push({ row, col: nc });
    }
  }

  // Row above and below
  const verticalRows = [row - 1, row + 1];
  for (const nr of verticalRows) {
    if (nr < 0 || nr >= MAX_GRID_ROWS) continue;

    // In a staggered grid, neighbor column indices depend on whether current row is even or odd
    const candCols = isOdd ? [col, col + 1] : [col - 1, col];
    for (const nc of candCols) {
      if (nc >= 0 && nc < getColumnsCount(nr)) {
        neighbors.push({ row: nr, col: nc });
      }
    }
  }

  return neighbors;
}

/**
 * Find the connected cluster of matching colored bubbles using Breadth-First Search (BFS).
 */
export function findMatchingCluster(
  grid: (Bubble | null)[][],
  startRow: number,
  startCol: number,
  targetColor: BubbleColor
): Array<{ row: number; col: number }> {
  const startBubble = grid[startRow]?.[startCol];
  if (!startBubble || startBubble.color !== targetColor) {
    return [];
  }

  const visited = new Set<string>();
  const cluster: Array<{ row: number; col: number }> = [];
  const queue: Array<{ row: number; col: number }> = [{ row: startRow, col: startCol }];
  visited.add(`${startRow},${startCol}`);

  while (queue.length > 0) {
    const current = queue.shift()!;
    cluster.push(current);

    const neighbors = getGridNeighbors(current.row, current.col);
    for (const n of neighbors) {
      const key = `${n.row},${n.col}`;
      if (!visited.has(key)) {
        const neighborBubble = grid[n.row]?.[n.col];
        if (neighborBubble && neighborBubble.color === targetColor) {
          visited.add(key);
          queue.push(n);
        }
      }
    }
  }

  return cluster;
}

/**
 * Identifies all bubbles that are detached from the ceiling (orphans).
 * Returns list of coordinates for disconnected bubbles.
 */
export function findOrphanBubbles(grid: (Bubble | null)[][]): Array<{ row: number; col: number }> {
  const visited = new Set<string>();
  const queue: Array<{ row: number; col: number }> = [];

  // Start BFS from all bubbles attached to ceiling (row 0)
  for (let c = 0; c < GRID_COLUMNS_EVEN; c++) {
    if (grid[0]?.[c]) {
      queue.push({ row: 0, col: c });
      visited.add(`0,${c}`);
    }
  }

  while (queue.length > 0) {
    const current = queue.shift()!;
    const neighbors = getGridNeighbors(current.row, current.col);
    for (const n of neighbors) {
      const key = `${n.row},${n.col}`;
      if (!visited.has(key)) {
        const neighborBubble = grid[n.row]?.[n.col];
        if (neighborBubble) {
          visited.add(key);
          queue.push(n);
        }
      }
    }
  }

  // Any non-empty bubble not in visited is an orphan
  const orphans: Array<{ row: number; col: number }> = [];
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < getColumnsCount(r); c++) {
      if (grid[r]?.[c] && !visited.has(`${r},${c}`)) {
        orphans.push({ row: r, col: c });
      }
    }
  }

  return orphans;
}

/**
 * Snaps a projectile to the best valid grid slot upon collision or reaching the ceiling.
 * If hitBubble is provided, it prioritizes empty neighbors of the collided bubble.
 * If it hit the ceiling without a bubble, it prioritizes empty slots in row 0.
 */
export function snapToGrid(
  projX: number,
  projY: number,
  grid: (Bubble | null)[][],
  hitBubble?: { row: number; col: number } | null
): { row: number; col: number } | null {
  // Case 1: Projectile hit an existing bubble
  if (hitBubble) {
    const emptyNeighbors = getGridNeighbors(hitBubble.row, hitBubble.col).filter(
      (n) => grid[n.row]?.[n.col] === null
    );

    if (emptyNeighbors.length > 0) {
      let bestNeighbor: { row: number; col: number } | null = null;
      let minDistance = Infinity;

      for (const n of emptyNeighbors) {
        const center = getBubbleCenter(n.row, n.col);
        const distSq = (projX - center.x) ** 2 + (projY - center.y) ** 2;
        if (distSq < minDistance) {
          minDistance = distSq;
          bestNeighbor = n;
        }
      }

      if (bestNeighbor) {
        return bestNeighbor;
      }
    }
  }

  // Case 2: Projectile hit ceiling without touching a bubble
  if (projY <= BUBBLE_RADIUS + 16) {
    let bestCeilingSlot: { row: number; col: number } | null = null;
    let minDistance = Infinity;
    const colCount = getColumnsCount(0);

    for (let c = 0; c < colCount; c++) {
      if (grid[0]?.[c] === null) {
        const center = getBubbleCenter(0, c);
        const distSq = (projX - center.x) ** 2 + (projY - center.y) ** 2;
        if (distSq < minDistance) {
          minDistance = distSq;
          bestCeilingSlot = { row: 0, col: c };
        }
      }
    }

    if (bestCeilingSlot) {
      return bestCeilingSlot;
    }
  }

  // Case 3: General fallback search across all supported empty slots
  let closestSlot: { row: number; col: number } | null = null;
  let minDistance = Infinity;
  const maxRows = grid.length || MAX_GRID_ROWS;

  for (let r = 0; r < maxRows; r++) {
    const colCount = getColumnsCount(r);
    for (let c = 0; c < colCount; c++) {
      if (grid[r]?.[c] !== null) continue; // slot already occupied

      // Verify slot is supported: either ceiling (row 0) or has an adjacent neighbor
      let isSupported = r === 0;
      if (!isSupported) {
        const neighbors = getGridNeighbors(r, c);
        for (const n of neighbors) {
          if (grid[n.row]?.[n.col]) {
            isSupported = true;
            break;
          }
        }
      }

      if (isSupported) {
        const center = getBubbleCenter(r, c);
        const distSq = (projX - center.x) ** 2 + (projY - center.y) ** 2;
        if (distSq < minDistance) {
          minDistance = distSq;
          closestSlot = { row: r, col: c };
        }
      }
    }
  }

  return closestSlot;
}

/**
 * Checks if any bubble currently crosses or touches the danger line.
 */
export function checkDangerLineBreach(
  grid: (Bubble | null)[][],
  dangerLineY: number
): boolean {
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < getColumnsCount(r); c++) {
      const bubble = grid[r]?.[c];
      if (bubble) {
        if (bubble.y + BUBBLE_RADIUS >= dangerLineY) {
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * Returns true if all bubbles in the grid have been cleared.
 */
export function isGridEmpty(grid: (Bubble | null)[][]): boolean {
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < getColumnsCount(r); c++) {
      if (grid[r]?.[c] !== null) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Collects all active bubble colors currently on the board.
 * Useful for picking projectile colors so the launcher only offers colors that still exist on board!
 */
export function getRemainingBoardColors(grid: (Bubble | null)[][]): BubbleColor[] {
  const colors = new Set<BubbleColor>();
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < getColumnsCount(r); c++) {
      const b = grid[r]?.[c];
      if (b) {
        colors.add(b.color);
      }
    }
  }
  return Array.from(colors);
}
