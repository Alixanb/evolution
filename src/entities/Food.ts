import Vec2 from "../core/Vec2";
import type Creature from "./Creature";
import { World } from "./World";

export default class Food {
  static instances: Food[] = [];
  hasBeenEaten = false;
  eating: {
    c1?: Creature;
    c2?: Creature;
    since?: number;
  } = {};
  eatTime = 0.5;
  targeting: Creature[] = [];
  pos: Vec2;

  constructor() {
    this.pos = new Vec2().random(5);
    Food.instances.push(this);
  }

  get isFull() {
    return !!(this.eating.c1 && this.eating.c2);
  }

  eat(creature: Creature) {
    if (this.hasBeenEaten) {
      creature.resetTarget();
      return;
    }
    if (!this.eating.c1) {
      this.eating.c1 = creature;
      this.eating.since = World.time;
    } else if (!this.eating.c2) {
      this.eating.c2 = creature;
      // food is now full — redirect everyone else
      this.targeting
        .filter((c) => c !== this.eating.c1 && c !== this.eating.c2)
        .forEach((c) => c.resetTarget());
      this.targeting = [this.eating.c1, this.eating.c2];
    } else {
      creature.resetTarget();
    }
  }

  update() {
    if (this.hasBeenEaten) return;
    if (this.eating.since && this.eating.since + this.eatTime < World.time) {
      this.hasBeenEaten = true;
      for (const c of this.targeting) {
        if (c === this.eating.c1 || c === this.eating.c2) {
          c.hasFed = true;
          c.status = "sleeping";
        } else {
          c.resetTarget();
        }
      }
      this.targeting = [];
    }
  }

  draw(ctx: CanvasRenderingContext2D, place: (vec2: Vec2) => Vec2) {
    if (this.hasBeenEaten) return;

    const p = place(this.pos);
    const r = 4;

    ctx.shadowColor = "rgb(60, 220, 60)";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fillStyle = "rgb(35, 170, 35)";
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.arc(p.x - 1, p.y - 1, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.fill();
  }

  static nearest(from: Vec2): Food | undefined {
    const available = Food.instances.filter(
      (f) => !f.hasBeenEaten && !f.isFull,
    );
    if (!available.length) return undefined;

    let nearest = available[0];
    let nearestDist = nearest.pos.distance(from);

    for (let i = 1; i < available.length; i++) {
      const d = available[i].pos.distance(from);
      if (d < nearestDist) {
        nearest = available[i];
        nearestDist = d;
      }
    }

    return nearest;
  }
}
