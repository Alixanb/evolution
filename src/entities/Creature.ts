import type Species from "../core/Species";
import Vec2 from "../core/Vec2";
import Food from "./Food";

type CreatureStatus = "searching" | "walking" | "eating";

export default class Creature {
  species: Species;
  pos: Vec2 = new Vec2();
  vel: Vec2 = new Vec2();
  eatingTime = 1;
  speed = 5;
  target?: Food;
  status: CreatureStatus = "searching";

  constructor(species: Species, pos = new Vec2().random(10)) {
    this.species = species;
    this.pos = pos;
  }

  update(dt: number) {
    switch (this.status) {
      case "searching":
        if (!this.target) {
          this.target = Food.nearest(this.pos);
        }
        this.startMoving();
        break;
      case "walking":
        this.isAtDestination(dt);
        break;
    }

    this.pos = this.pos.add(this.vel.multiply(dt));
  }

  startMoving() {
    this.status = "walking";

    if (!this.target) return;

    this.vel = this.target?.pos
      .substract(this.pos)
      .normalize()
      .multiply(this.speed);
  }

  isAtDestination(dt: number) {
    if (!this.target) throw new Error("No target while walking");

    if (this.pos.distance(this.target.pos) < 1) {
      this.vel = new Vec2();
      return true;
    }
  }

  draw(ctx: CanvasRenderingContext2D, place: (vec2: Vec2) => Vec2) {
    const ctxPos = place(this.pos);

    ctx.beginPath();
    ctx.arc(ctxPos.x, ctxPos.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = this.species.color;
    ctx.fill();
  }
}
