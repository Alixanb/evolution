import type Species from "../core/Species";
import Vec2 from "../core/Vec2";

export default class Creature {
  species: Species;
  pos: Vec2 = new Vec2();
  vel: Vec2 = new Vec2();

  constructor(species: Species, pos = new Vec2().random()) {
    this.species = species;
    this.pos = pos;
  }

  update(dt: number) {
    this.pos = this.pos.add(this.vel.multiply(dt));
  }

  draw(ctx: CanvasRenderingContext2D, place: (vec2: Vec2) => Vec2) {
    const ctxPos = place(this.pos);

    ctx.beginPath();
    ctx.arc(ctxPos.x, ctxPos.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = this.species.color;
    ctx.fill();
  }
}
