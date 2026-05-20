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
  eatTime = 5;
  targeting: Creature[] = [];
  pos: Vec2;

  constructor() {
    this.pos = new Vec2().random(5);
    Food.instances.push(this);
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

    // highlight
    ctx.beginPath();
  }

  update() {
    if (this.eating.since && this.eating.since + this.eatTime < World.time) {
      this.hasBeenEaten = true;

      this.targeting.forEach((c) => {
        c.target = undefined;
      });
    }
  }

  eat(creature: Creature) {
    if (!this.eating.c1) {
      this.eating.c1 = creature;
      this.eating.since = World.time;
    } else if (!this.eating.c2) {
      this.eating.c2 = creature;
    } else {
      creature.target = Food.nearest(creature.pos);
    }
  }

  static nearest(from: Vec2) {
    let nearest = this.instances[0];
    let nearestDistance = this.instances[0].pos.distance(from);

    this.instances.forEach((f, i) => {
      if (i === 0) return;

      const distance = f.pos.distance(from);
      if (distance < nearestDistance && !f.eating.c2) {
        nearest = f;
        nearestDistance = distance;
      }
    });

    return nearest;
  }
}
