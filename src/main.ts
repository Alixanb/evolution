import { Raider, Seeker } from "./core/Species";
import { World } from "./entities/World";
import "./style.css";
import Canvas from "./systems/Canvas";

const canvas = new Canvas("#canvas");
const world = new World(canvas);
world.populate(100, Seeker);
world.populate(100, Raider);

let lastTime = 0;

function loop(timestamp: number) {
  const dt = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  world.frame(dt);

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
