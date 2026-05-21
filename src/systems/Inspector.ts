import Vec2 from "../core/Vec2";
import Creature from "../entities/Creature";
import Food from "../entities/Food";
import type { World } from "../entities/World";
import type Canvas from "./Canvas";

type Entity = Creature | Food;

export default class Inspector {
  private panel: HTMLElement;
  private bodyEl: HTMLElement;
  private selected: Entity | null = null;
  private world: World;
  private canvas: Canvas;

  constructor(canvas: Canvas, world: World) {
    this.canvas = canvas;
    this.world = world;
    const { panel, body } = this.buildPanel();
    this.panel = panel;
    this.bodyEl = body;
    canvas.element.addEventListener("click", (e) => this.pick(e));
  }

  private buildPanel(): { panel: HTMLElement; body: HTMLElement } {
    const panel = document.createElement("div");
    panel.className = "inspector-panel";

    const body = document.createElement("div");
    body.className = "inspector-body";

    panel.appendChild(body);
    document.body.appendChild(panel);
    return { panel, body };
  }

  private pick(e: MouseEvent) {
    const click = this.canvas.unplace(new Vec2(e.clientX, e.clientY));
    const RADIUS = 3;

    let best: Entity | null = null;
    let bestDist = RADIUS;

    for (const c of this.world.creatures) {
      const d = c.pos.distance(click);
      if (d < bestDist) { best = c; bestDist = d; }
    }

    for (const f of this.world.foods) {
      if (f.hasBeenEaten) continue;
      const d = f.pos.distance(click);
      if (d < bestDist) { best = f; bestDist = d; }
    }

    this.selected = best;
    this.world.highlighted = best instanceof Creature ? best : null;
    if (!best) this.panel.style.display = "none";
  }

  refresh() {
    if (this.world.highlighted && !this.world.creatures.includes(this.world.highlighted)) {
      this.world.highlighted = null;
      this.selected = null;
      this.panel.style.display = "none";
      return;
    }
    if (!this.selected) return;

    this.panel.style.display = "block";
    if (this.selected instanceof Creature) {
      this.panel.style.boxShadow = `4px 4px 0 ${this.selected.species.color}`;
      this.bodyEl.innerHTML = this.renderCreature(this.selected);
    } else {
      this.panel.style.boxShadow = `4px 4px 0 #6cb973`;
      this.bodyEl.innerHTML = this.renderFood(this.selected);
    }
  }

  private row(label: string, value: unknown) {
    return `<div class="inspector-row"><span class="inspector-key">${label}</span><span>${value}</span></div>`;
  }

  private header(label: string, color: string) {
    return `<div class="inspector-header" style="color:${color}">${label.toUpperCase()}</div>`;
  }

  private renderCreature(c: Creature) {
    return [
      this.header(c.species.name, c.species.color),
      this.row("status", c.status),
      this.row("pos", c.pos.log()),
      this.row("vel", c.vel.log()),
      this.row("speed", c.speed),
      this.row("target", c.target ? c.target.pos.log() : "—"),
    ].join("");
  }

  private renderFood(f: Food) {
    return [
      this.header("food", "#6cb973"),
      this.row("pos", f.pos.log()),
      this.row("eaten", f.hasBeenEaten),
      this.row("c1", f.eating.c1?.species.name ?? "—"),
      this.row("c2", f.eating.c2?.species.name ?? "—"),
      this.row("since", f.eating.since?.toFixed(2) ?? "—"),
      this.row("targets", f.targeting.length),
    ].join("");
  }
}
