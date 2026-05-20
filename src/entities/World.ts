import Species, { Seeker } from "../core/Species";
import type Canvas from "../systems/Canvas";
import Creature from "./Creature";
import Food from "./Food";

export class World {
  canvas: Canvas;
  ctx: CanvasRenderingContext2D;

  // instances
  creatures: Creature[] = [];
  foods: Food[] = [];

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
  }

  update(dt: number) {
    this.creatures.forEach((c) => c.update(dt));
    this.foods.forEach((f) => f.update());
  }

  draw() {
    this.ctx.clearRect(
      0,
      0,
      this.canvas.element.width,
      this.canvas.element.height,
    );

    this.creatures.forEach((c) =>
      c.draw(this.canvas.context, (v) => this.canvas.place(v)),
    );

    this.foods.forEach((f) =>
      f.draw(this.canvas.context, (v) => this.canvas.place(v)),
    );
  }
}
