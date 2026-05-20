import Vec2 from "../core/Vec2";

export default class Food {
  static instances: Food[];
  pos: Vec2;

  constructor() {
    this.pos = new Vec2().random(5);
    Food.instances.push(this);
  }

  draw(ctx: CanvasRenderingContext2D, place: (vec2: Vec2) => Vec2) {
    const ctxPos = place(this.pos);

    ctx.beginPath();
    ctx.arc(ctxPos.x, ctxPos.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = "rgb(27, 133, 25)";
    ctx.fill();
  }

  static nearest(from: Vec2) {
    let nearest = this.instances[0];
    let nearestDistance = this.instances[0].pos.distance(from);

    this.instances.forEach((f, i) => {
      if (i === 0) return;

      const distance = f.pos.distance(from);
      if (distance < nearestDistance) {
        nearest = f;
        nearestDistance = distance;
      }
    });
  }
}
