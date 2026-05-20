import { Seeker } from "./core/Species";
import { World } from "./entities/World";
import "./style.css";
import Canvas from "./systems/Canvas";
import Debug from "./systems/Debug";
import Inspector from "./systems/Inspector";

const canvas = new Canvas("#canvas");
const debug = new Debug();
const world = new World(canvas, 3);
const inspector = new Inspector(canvas, world);
world.populate(5, Seeker);
// world.populate(50, Raider);
world.sow();

let lastTime = 0;

function loop(timestamp: number) {
  const dt = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  world.frame(dt);
  inspector.refresh();

  debug.set("time", World.time.toFixed(2));
  debug.set("day", world.day);

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
