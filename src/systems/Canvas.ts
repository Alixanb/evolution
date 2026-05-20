import Vec2, { GRID_SIZE } from "../core/Vec2";

export { GRID_SIZE };

export default class Canvas {
  element: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  size: Vec2;
  ratio: Vec2;

  constructor(ref: string) {
    const element = document.querySelector<HTMLCanvasElement>(ref);
    if (!element)
      throw new Error("Unable to fetch canvas element with string " + ref);

    const context = element.getContext("2d");
    if (!context) throw new Error("Unable to get canvas context");

    this.element = element;
    this.context = context;
    this.size = GRID_SIZE;
    this.ratio = new Vec2(1, 1);

    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  private resize() {
    this.element.width = window.innerWidth;
    this.element.height = window.innerHeight;
    this.ratio = new Vec2(window.innerWidth, window.innerHeight).divided(this.size);
  }

  place(vec2: Vec2) {
    return vec2.multiply(this.ratio);
  }
}
