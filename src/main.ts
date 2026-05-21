import type Species from "./core/Species";
import { Raider, Seeker, Swift, Titan } from "./core/Species";
import { World } from "./entities/World";
import "./style.css";
import Canvas from "./systems/Canvas";
import HUD from "./systems/HUD";
import Inspector from "./systems/Inspector";
import LandingScreen from "./systems/LandingScreen";

const canvas = new Canvas("#canvas");
const landing = new LandingScreen();
const settings = await landing.start();

const canvasEl = document.querySelector<HTMLCanvasElement>("#canvas")!;
canvasEl.style.display = "block";

const world = new World(canvas, settings.abundance);
const inspector = new Inspector(canvas, world);
const hud = new HUD(world);
hud.speed = settings.speed;

world.sow();

const allToSpawn: Species[] = [
  ...new Array<Species>(settings.seekers).fill(Seeker),
  ...new Array<Species>(settings.raiders).fill(Raider),
  ...new Array<Species>(settings.swifts).fill(Swift),
  ...new Array<Species>(settings.titans).fill(Titan),
];
for (let i = allToSpawn.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [allToSpawn[i], allToSpawn[j]] = [allToSpawn[j], allToSpawn[i]];
}
const spawnInterval = allToSpawn.length > 1 ? Math.min(0.08, 1.2 / allToSpawn.length) : 0;
allToSpawn.forEach((sp, i) => world.scheduleSpawn(i * spawnInterval, sp));

let lastTime: number | null = null;

function loop(timestamp: number) {
  if (lastTime === null) {
    lastTime = timestamp;
    requestAnimationFrame(loop);
    return;
  }
  const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
  lastTime = timestamp;

  if (!hud.paused) {
    world.frame(dt * hud.speed);
  }

  inspector.refresh();
  hud.refresh(World.time);

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
