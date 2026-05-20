import { Seeker } from "./core/Species";
import Vec2 from "./core/Vec2";
import { World } from "./entities/World";
import "./style.css";
import Canvas from "./systems/Canvas";
import Debug from "./systems/Debug";

const canvas = new Canvas("#canvas");
const debug = new Debug();
const world = new World(canvas, 100);
world.populate(50, Seeker);
// world.populate(50, Raider);
world.sow();

let lastTime = 0;

function loop(timestamp: number) {
  const dt = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  world.frame(dt);

  debug.set("time", world.time.toFixed(2));
  debug.set("position", world.creatures[0].pos.log());
  debug.set("target", world.creatures[0].target?.pos.log());
  debug.set("vel", world.creatures[0].vel.log());
  debug.set(
    "distance",
    world.creatures[0].pos.distance(
      world.creatures[0]?.target?.pos || new Vec2(),
    ),
  );

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
