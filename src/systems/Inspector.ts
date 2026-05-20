import Vec2 from "../core/Vec2";
import Creature from "../entities/Creature";
import Food from "../entities/Food";
import type { World } from "../entities/World";
import type Canvas from "./Canvas";

type Entity = Creature | Food;

export default class Inspector {
  private panel: HTMLElement;
  private selected: Entity | null = null;
  private world: World;
  private canvas: Canvas;

  constructor(canvas: Canvas, world: World) {
    this.canvas = canvas;
    this.world = world;
    this.panel = this.buildPanel();
    canvas.element.addEventListener("click", (e) => this.pick(e));
  }

  private buildPanel(): HTMLElement {
    const el = document.createElement("div");
    Object.assign(el.style, {
      position: "fixed",
      bottom: "12px",
      right: "12px",
      background: "rgba(10,10,20,0.85)",
      color: "#d0d0d0",
      fontFamily: "monospace",
      fontSize: "12px",
      padding: "10px 14px",
      borderRadius: "6px",
      lineHeight: "2",
      pointerEvents: "none",
      zIndex: "9999",
      minWidth: "200px",
      display: "none",
      borderTop: "2px solid #555",
    });
    document.body.appendChild(el);
    return el;
  }

  private pick(e: MouseEvent) {
    const click = this.canvas.unplace(new Vec2(e.clientX, e.clientY));
    const RADIUS = 3;

    let best: Entity | null = null;
    let bestDist = RADIUS;

    for (const c of this.world.creatures) {
      const d = c.pos.distance(click);
      if (d < bestDist) {
        best = c;
        bestDist = d;
      }
    }

    for (const f of this.world.foods) {
      if (f.hasBeenEaten) continue;
      const d = f.pos.distance(click);
      if (d < bestDist) {
        best = f;
        bestDist = d;
      }
    }

    this.selected = best;
    if (!best) this.panel.style.display = "none";
  }

  refresh() {
    if (!this.selected) return;

    const isCreature = this.selected instanceof Creature;
    this.panel.style.borderTopColor = isCreature
      ? this.selected.species.color
      : "rgb(27, 133, 25)";
    this.panel.style.display = "block";
    this.panel.innerHTML = isCreature
      ? this.renderCreature(this.selected)
      : this.renderFood(this.selected as Food);
  }

  private row(label: string, value: unknown) {
    return `<div><span style="opacity:0.45;width:60px;display:inline-block">${label}</span>${value}</div>`;
  }

  private header(label: string, color: string) {
    return `<div style="color:${color};font-weight:bold;margin-bottom:4px;letter-spacing:1px">${label.toUpperCase()}</div>`;
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
      this.header("food", "rgb(27, 133, 25)"),
      this.row("pos", f.pos.log()),
      this.row("eaten", f.hasBeenEaten),
      this.row("c1", f.eating.c1?.species.name ?? "—"),
      this.row("c2", f.eating.c2?.species.name ?? "—"),
      this.row("since", f.eating.since?.toFixed(2) ?? "—"),
      this.row("targets", f.targeting.length),
    ].join("");
  }
}
