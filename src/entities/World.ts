import Species, { Seeker } from "../core/Species";
import type { SpeciesType } from "../core/Species";
import Vec2 from "../core/Vec2";
import type Canvas from "../systems/Canvas";
import Creature from "./Creature";
import Food from "./Food";

type Effect = {
  pos: Vec2;
  startTime: number;
  color: string;
  kind: "spawn" | "death";
};

type PendingSpawn = { at: number; species: Species };

export interface SpeciesStat {
  atStart: number;
  survived: number;
  died: number;
  born: number;
  avgFeedScore: number;
}

export interface DayStat {
  byType: Partial<Record<SpeciesType, SpeciesStat>>;
  foodTotal: number;
  foodEaten: number;
}

const SPAWN_DURATION = 0.7;
const DEATH_DURATION = 0.45;
const SPAWN_RADIUS = 6;

export class World {
  canvas: Canvas;
  ctx: CanvasRenderingContext2D;

  creatures: Creature[] = [];
  foods: Food[] = [];
  effects: Effect[] = [];
  pendingSpawns: PendingSpawn[] = [];
  highlighted: Creature | null = null;

  lastDayCheck = -1;
  checkEvery = 1;

  abundance: number;
  day: number = 0;
  lastDayStat: DayStat | null = null;
  static time = 0;

  constructor(canvas: Canvas, abundance: number = 100) {
    this.canvas = canvas;
    this.ctx = canvas.context;
    this.abundance = abundance;
  }

  sow() {
    this.foods = [];
    for (let i = 0; i < this.abundance; i++) {
      this.foods.push(new Food());
    }
  }

  addFood(n: number) {
    for (let i = 0; i < n; i++) {
      this.foods.push(new Food());
    }
  }

  populate(n: number, species: Species = Seeker) {
    for (let i = 0; i < n; i++) {
      this.creatures.push(new Creature(species));
    }
  }

  scheduleSpawn(delay: number, species: Species) {
    this.pendingSpawns.push({ at: World.time + delay, species });
  }

  spawnBulk(n: number, species: Species) {
    const interval = Math.min(0.08, 0.5 / Math.max(1, n));
    for (let i = 0; i < n; i++) {
      this.scheduleSpawn(i * interval, species);
    }
  }

  frame(dt: number) {
    World.time += dt;
    this.update(dt);
    this.draw();

    if (this.lastDayCheck + this.checkEvery < World.time) {
      this.lastDayCheck = World.time;
      if (this.isDayEnded()) {
        this.nextDay();
      }
    }
  }

  update(dt: number) {
    const now = World.time;
    const ready = this.pendingSpawns.filter((p) => p.at <= now);
    if (ready.length > 0) {
      this.pendingSpawns = this.pendingSpawns.filter((p) => p.at > now);
      for (const p of ready) {
        const c = new Creature(p.species);
        this.creatures.push(c);
        this.effects.push({ pos: c.pos, startTime: now, color: p.species.color, kind: "spawn" });
      }
    }
    this.creatures.forEach((c) => c.update(dt));
    this.foods.forEach((f) => f.update());
  }

  isDayEnded() {
    if (this.pendingSpawns.length > 0) return false;
    const foodRemaining = this.foods.some((f) => !f.hasBeenEaten);
    const allDone = this.creatures.every(
      (c) =>
        c.status === "sleeping" ||
        (c.status === "eating" && !!c.target?.hasBeenEaten),
    );
    return !foodRemaining || allDone;
  }

  private spawnNear(parent: Creature): Creature {
    const angle = Math.random() * Math.PI * 2;
    const dist = 2 + Math.random() * SPAWN_RADIUS;
    const pos = new Vec2(
      Math.max(5, Math.min(95, parent.pos.x + Math.cos(angle) * dist)),
      Math.max(5, Math.min(95, parent.pos.y + Math.sin(angle) * dist)),
    );
    this.effects.push({ pos, startTime: World.time, color: parent.species.color, kind: "spawn" });
    return new Creature(parent.species, pos);
  }

  nextDay() {
    this.day += 1;

    const statMap = new Map<SpeciesType, SpeciesStat>();
    for (const c of this.creatures) {
      const t = c.species.type;
      if (!statMap.has(t)) {
        statMap.set(t, { atStart: 0, survived: 0, died: 0, born: 0, avgFeedScore: 0 });
      }
      const s = statMap.get(t)!;
      s.atStart++;
      s.avgFeedScore += c.feedScore;
    }
    for (const [, s] of statMap) {
      if (s.atStart > 0) s.avgFeedScore /= s.atStart;
    }

    const foodEaten = this.foods.filter((f) => f.hasBeenEaten).length;
    const foodTotal = this.foods.length;

    const survivors: Creature[] = [];
    for (const c of this.creatures) {
      const surviveChance = Math.min(1, c.feedScore * 2);
      if (Math.random() >= surviveChance) {
        this.effects.push({ pos: c.pos, startTime: World.time, color: c.species.color, kind: "death" });
        statMap.get(c.species.type)!.died++;
        continue;
      }
      statMap.get(c.species.type)!.survived++;
      survivors.push(c);
      const reproduceChance = Math.max(0, (c.feedScore - 0.5) * 2);
      if (Math.random() < reproduceChance) {
        survivors.push(this.spawnNear(c));
        statMap.get(c.species.type)!.born++;
      }
    }

    const byType: Partial<Record<SpeciesType, SpeciesStat>> = {};
    for (const [type, stat] of statMap) byType[type] = stat;
    this.lastDayStat = { byType, foodTotal, foodEaten };

    this.creatures = survivors;
    this.creatures.forEach((c) => c.nextDay());

    Food.instances = [];
    Food.grid.clear();
    this.foods = [];
    this.sow();
  }

  draw() {
    this.ctx.fillStyle = "#130e0e";
    this.ctx.fillRect(0, 0, this.canvas.element.width, this.canvas.element.height);

    this.drawEffects();

    this.creatures.forEach((c) =>
      c.draw(this.canvas.context, (v) => this.canvas.place(v), c === this.highlighted),
    );
    this.foods.forEach((f) =>
      f.draw(this.canvas.context, (v) => this.canvas.place(v)),
    );
  }

  private drawEffects() {
    const ctx = this.ctx;
    this.effects = this.effects.filter((e) => {
      const dur = e.kind === "death" ? DEATH_DURATION : SPAWN_DURATION;
      return World.time - e.startTime < dur;
    });

    for (const e of this.effects) {
      const dur = e.kind === "death" ? DEATH_DURATION : SPAWN_DURATION;
      const t = (World.time - e.startTime) / dur;
      const p = this.canvas.place(e.pos);

      ctx.save();

      if (e.kind === "spawn") {
        ctx.globalAlpha = (1 - t) * 0.45;
        ctx.beginPath();
        ctx.arc(p.x, p.y, t * 11, 0, Math.PI * 2);
        ctx.strokeStyle = e.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else {
        ctx.globalAlpha = (1 - t) * 0.55;
        ctx.beginPath();
        ctx.arc(p.x, p.y, (1 - t) * 7, 0, Math.PI * 2);
        ctx.fillStyle = e.color;
        ctx.fill();
      }

      ctx.restore();
    }
  }
}
