import Species, { Seeker } from "../core/Species";
import type Canvas from "../systems/Canvas";
import Creature from "./Creature";

export class World {
  canvas: Canvas;
  creatures: Creature[] = [];

  constructor(canvas: Canvas) {
    this.canvas = canvas;
  }

  populate(n: number, species: Species = Seeker) {
    for (let i = 0; i < n; i++) {
      this.creatures.push(new Creature(species));
    }
  }

  frame(dt: number) {
    this.update(dt);
    this.draw();
  }

  update(dt: number) {
    this.creatures.forEach((c) => c.update(dt));
  }

  draw() {
    this.creatures.forEach((c) =>
      c.draw(this.canvas.context, (v) => this.canvas.place(v)),
    );
  }
}
