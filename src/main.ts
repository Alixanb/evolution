import { Raider, Seeker } from "./core/Species";
import { World } from "./entities/World";
import "./style.css";
import Canvas from "./systems/Canvas";
import ControlPanel from "./systems/ControlPanel";
import Inspector from "./systems/Inspector";

const canvas = new Canvas("#canvas");
const world = new World(canvas, 100);
const inspector = new Inspector(canvas, world);
const panel = new ControlPanel(world);

world.populate(10, Seeker);
world.populate(10, Raider);
world.sow();

let lastTime = 0;

function loop(timestamp: number) {
  const dt = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  if (!panel.paused) {
    world.frame(dt * panel.speed);
  }

  inspector.refresh();
  panel.refresh(World.time);

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
