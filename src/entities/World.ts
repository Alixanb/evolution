import Species, { Seeker } from "../core/Species";
import Vec2 from "../core/Vec2";
import type Canvas from "../systems/Canvas";
import Creature from "./Creature";
import Food from "./Food";

type SpawnEffect = {
  pos: Vec2;
  startTime: number;
  color: string;
};

const EFFECT_DURATION = 1.2;
const SPAWN_RADIUS = 6;

export class World {
  canvas: Canvas;
  ctx: CanvasRenderingContext2D;

  creatures: Creature[] = [];
  foods: Food[] = [];
  effects: SpawnEffect[] = [];
  lastDayCheck = -1;
  checkEvery = 1;

  abundance: number;
  day: number = 0;
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

  populate(n: number, species: Species = Seeker) {
    for (let i = 0; i < n; i++) {
      this.creatures.push(new Creature(species));
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
    this.creatures.forEach((c) => c.update(dt));
    this.foods.forEach((f) => f.update());
  }

  isDayEnded() {
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
    this.effects.push({ pos, startTime: World.time, color: parent.species.color });
    return new Creature(parent.species, pos);
  }

  nextDay() {
    this.day += 1;

    const survivors: Creature[] = [];
    for (const c of this.creatures) {
      if (c.feedScore < 0.25) continue;
      survivors.push(c);
      if (c.feedScore >= 0.5) survivors.push(this.spawnNear(c));
      if (c.feedScore >= 0.75) survivors.push(this.spawnNear(c));
    }

    this.creatures = survivors;
    this.creatures.forEach((c) => c.nextDay());

    Food.instances = [];
    Food.grid.clear();
    this.foods = [];
    this.sow();
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.element.width, this.canvas.element.height);

    this.drawEffects();

    this.creatures.forEach((c) =>
      c.draw(this.canvas.context, (v) => this.canvas.place(v)),
    );
    this.foods.forEach((f) =>
      f.draw(this.canvas.context, (v) => this.canvas.place(v)),
    );
  }

  private drawEffects() {
    const ctx = this.ctx;
    this.effects = this.effects.filter(
      (e) => World.time - e.startTime < EFFECT_DURATION,
    );

    for (const e of this.effects) {
      const t = (World.time - e.startTime) / EFFECT_DURATION;
      const p = this.canvas.place(e.pos);

      ctx.save();
      ctx.globalAlpha = (1 - t) * 0.8;
      ctx.shadowColor = e.color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(p.x, p.y, t * 22, 0, Math.PI * 2);
      ctx.strokeStyle = e.color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // second ring, slightly delayed
      if (t > 0.15) {
        const t2 = (t - 0.15) / (1 - 0.15);
        ctx.globalAlpha = (1 - t2) * 0.4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, t2 * 30, 0, Math.PI * 2);
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.restore();
    }
  }
}
