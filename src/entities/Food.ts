import { getDistribution } from "../core/Species";
import SpatialGrid from "../core/SpatialGrid";
import Vec2, { GRID_SIZE } from "../core/Vec2";
import type Creature from "./Creature";
import { World } from "./World";

export default class Food {
  static instances: Food[] = [];
  static grid = new SpatialGrid<Food>(GRID_SIZE.x, GRID_SIZE.y);
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
    Food.grid.insert(this);
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
      Food.grid.remove(this);

      const c1 = this.eating.c1;
      const c2 = this.eating.c2;

      if (c1 && c2) {
        const [s1, s2] = getDistribution(c1.species.type, c2.species.type);
        c1.feedScore = s1;
        c2.feedScore = s2;
      } else if (c1) {
        c1.feedScore = 1;
      }

      if (c1) c1.status = "sleeping";
      if (c2) c2.status = "sleeping";

      for (const c of this.targeting) {
        if (c !== c1 && c !== c2) c.resetTarget();
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
    return Food.grid.nearest(from, (f) => !f.isFull);
  }
}
