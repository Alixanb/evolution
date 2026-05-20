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

  random() {
    return new Vec2(
      Math.floor(Math.random() * GRID_SIZE.x),
      Math.floor(Math.random() * GRID_SIZE.y),
    );
  }

  log() {
    return `Vec2(${this.x},${this.y})`;
  }
}

export const GRID_SIZE = new Vec2(100, 100);
