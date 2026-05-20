export default class Vec2 {
  x: number;
  y: number;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  add(vec2: Vec2) {
    return new Vec2(this.x + vec2.x, this.y + vec2.y);
  }

  multiply(n: number): Vec2;
  multiply(vec2: Vec2): Vec2;

  multiply(arg: number | Vec2) {
    if (arg instanceof Vec2) {
      return new Vec2(this.x * arg.x, this.y * arg.y);
    }
    return new Vec2(this.x * arg, this.y * arg);
  }

  divided(n: number): Vec2;
  divided(vec2: Vec2): Vec2;

  divided(arg: number | Vec2): Vec2 {
    if (arg instanceof Vec2) {
      return new Vec2(this.x / arg.x, this.y / arg.y);
    }
    return new Vec2(this.x / arg, this.y / arg);
  }

  random(padding = 0) {
    return new Vec2(
      Math.floor(Math.random() * (GRID_SIZE.x - padding * 2) + padding),
      Math.floor(Math.random() * (GRID_SIZE.y - padding * 2) + padding),
    );
  }

  distance(vec2: Vec2) {
    return Math.sqrt((this.x - vec2.x) ** 2 + (this.y - vec2.y) ** 2);
  }

  log() {
    return `Vec2(${this.x},${this.y})`;
  }
}

export const GRID_SIZE = new Vec2(100, 100);
