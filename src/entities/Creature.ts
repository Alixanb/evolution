import type Species from "../core/Species";
import Vec2 from "../core/Vec2";
import Food from "./Food";

type CreatureStatus = "searching" | "walking" | "eating";

export default class Creature {
  species: Species;
  pos: Vec2 = new Vec2();
  vel: Vec2 = new Vec2();
  speed = 5;
  target?: Food;
  status: CreatureStatus = "searching";

  constructor(species: Species, pos = new Vec2().random(10)) {
    this.species = species;
    this.pos = pos;
  }

  seek(food: Food) {
    this.target = food;
    this.target.targeting.push(this);
  }

  stopSeeking() {
    const index = this.target?.targeting.indexOf(this);

    if (index) {
      this.target?.targeting.splice(index, 1);
    }
  }

  update(dt: number) {
    switch (this.status) {
      case "searching":
        if (!this.target) this.seek(Food.nearest(this.pos));
        this.startMoving();
        break;
      case "walking":
        if (this.isAtDestination()) {
          if (!this.target) return;

          this.vel = new Vec2();
          this.status = "eating";
          this.target.eat(this);
        }
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

  isAtDestination() {
    if (!this.target) return;

    if (this.pos.distance(this.target.pos) < 1) {
      return true;
    }
  }

  draw(ctx: CanvasRenderingContext2D, place: (vec2: Vec2) => Vec2) {
    const p = place(this.pos);
    const r = 7;

    ctx.shadowColor = this.species.color;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fillStyle = this.species.color;
    ctx.fill();
    ctx.shadowBlur = 0;

    // direction arrow
    const speed = this.vel.length();
    if (speed > 0.01) {
      const angle = Math.atan2(this.vel.y, this.vel.x);
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const tip = { x: p.x + cos * (r + 7), y: p.y + sin * (r + 7) };
      const base = { x: p.x + cos * (r + 1), y: p.y + sin * (r + 1) };
      ctx.beginPath();
      ctx.moveTo(tip.x, tip.y);
      ctx.lineTo(base.x - sin * 3, base.y + cos * 3);
      ctx.lineTo(base.x + sin * 3, base.y - cos * 3);
      ctx.closePath();
      ctx.fillStyle = this.species.color;
      ctx.fill();
    }

    // inner highlight
    ctx.beginPath();
    ctx.arc(p.x - 2, p.y - 2, 2, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fill();
  }
}
