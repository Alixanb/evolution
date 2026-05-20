import Vec2 from "../core/Vec2";

export default class Food {
  pos: vec2;
  constructor() {
    pos = new Vec2().random();
  }
}
