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

  substract(vec2: Vec2) {
    return new Vec2(this.x - vec2.x, this.y - vec2.y);
  }

  bool() {
    return this.x === 0 && this.y === 0;
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

  length() {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  normalize() {
    const len = this.length();
    if (len === 0) return new Vec2(0, 0);
    return new Vec2(this.x / len, this.y / len);
  }

  log() {
    return `Vec2(${Math.floor(this.x)},${Math.floor(this.y)})`;
  }
}

export const GRID_SIZE = new Vec2(100, 100);
