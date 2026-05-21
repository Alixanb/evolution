import type Vec2 from "./Vec2";

export default class SpatialGrid<T extends { pos: Vec2 }> {
  private cells = new Map<string, T[]>();
  readonly cellSize: number;
  private cols: number;
  private rows: number;

  constructor(worldWidth: number, worldHeight: number, cellSize = 10) {
    this.cellSize = cellSize;
    this.cols = Math.ceil(worldWidth / cellSize);
    this.rows = Math.ceil(worldHeight / cellSize);
  }

  private key(cx: number, cy: number): string {
    return `${cx},${cy}`;
  }

  private cellOf(pos: Vec2): [number, number] {
    return [
      Math.floor(pos.x / this.cellSize),
      Math.floor(pos.y / this.cellSize),
    ];
  }

  insert(item: T) {
    const [cx, cy] = this.cellOf(item.pos);
    const k = this.key(cx, cy);
    const cell = this.cells.get(k);
    if (cell) cell.push(item);
    else this.cells.set(k, [item]);
  }

  remove(item: T) {
    const [cx, cy] = this.cellOf(item.pos);
    const cell = this.cells.get(this.key(cx, cy));
    if (!cell) return;
    const i = cell.indexOf(item);
    if (i !== -1) cell.splice(i, 1);
  }

  nearest(from: Vec2, filter?: (item: T) => boolean): T | undefined {
    const [cx, cy] = this.cellOf(from);
    const maxR = Math.max(this.cols, this.rows);

    let best: T | undefined;
    let bestDist = Infinity;

    for (let r = 0; r <= maxR; r++) {
      if (r > 1 && (r - 1) * this.cellSize > bestDist) break;

      for (let dx = -r; dx <= r; dx++) {
        for (let dy = -r; dy <= r; dy++) {
          if (Math.abs(dx) < r && Math.abs(dy) < r) continue;

          const nx = cx + dx;
          const ny = cy + dy;
          if (nx < 0 || ny < 0 || nx >= this.cols || ny >= this.rows) continue;

          const items = this.cells.get(this.key(nx, ny));
          if (!items) continue;

          for (const item of items) {
            if (filter && !filter(item)) continue;
            const d = item.pos.distance(from);
            if (d < bestDist) {
              best = item;
              bestDist = d;
            }
          }
        }
      }
    }

    return best;
  }

  clear() {
    this.cells.clear();
  }
}
