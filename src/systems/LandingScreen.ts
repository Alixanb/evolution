import type Species from "../core/Species";
import { Raider, Seeker, Swift, Titan } from "../core/Species";
import { openSpeciesPopup } from "./FloatingWindow";

const SPECIES_MAP: Partial<Record<string, Species>> = {
  seekers: Seeker,
  raiders: Raider,
  swifts:  Swift,
  titans:  Titan,
};

export interface SimSettings {
  seekers: number;
  raiders: number;
  swifts: number;
  titans: number;
  abundance: number;
  speed: number;
}

interface SliderDef {
  key: keyof SimSettings;
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
  colorClass: string;
  desc?: string;
}

const SLIDERS: SliderDef[] = [
  { key: "seekers",   label: "Seekers",    min: 0,  max: 50,  step: 1,  default: 3,   colorClass: "cyan",   desc: "Share food equally. Lose to most predators." },
  { key: "raiders",   label: "Raiders",    min: 0,  max: 50,  step: 1,  default: 3,   colorClass: "red",    desc: "Steal food. Beat seekers, lose to titans." },
  { key: "swifts",    label: "Swifts",     min: 0,  max: 50,  step: 1,  default: 0,   colorClass: "yellow", desc: "Fastest. Beat seekers, resist raiders." },
  { key: "titans",    label: "Titans",     min: 0,  max: 50,  step: 1,  default: 0,   colorClass: "purple", desc: "Dominant but sterile when two meet." },
  { key: "abundance", label: "Food / day", min: 10, max: 500, step: 10, default: 100, colorClass: "green" },
  { key: "speed",     label: "Speed",      min: 1,  max: 50,  step: 1,  default: 1,   colorClass: "muted" },
];

export default class LandingScreen {
  private el: HTMLElement;
  private openPopups: HTMLElement[] = [];
  private values: SimSettings = {
    seekers: 3,
    raiders: 3,
    swifts: 0,
    titans: 0,
    abundance: 100,
    speed: 1,
  };

  constructor() {
    this.el = document.getElementById("landing")!;
    this.build();
  }

  private build() {
    const left = document.createElement("div");
    left.className = "landing-left";

    const title = document.createElement("h1");
    title.className = "landing-title";
    title.textContent = "Sim";

    const sub = document.createElement("p");
    sub.className = "landing-sub";
    sub.textContent = "Natural Selection Simulator";

    left.appendChild(title);
    left.appendChild(sub);

    const panel = document.createElement("div");
    panel.className = "landing-panel";

    const body = document.createElement("div");
    body.className = "landing-panel-body";

    const panelLabel = document.createElement("div");
    panelLabel.className = "landing-panel-label";
    panelLabel.textContent = "Configure";

    const grid = document.createElement("div");
    grid.className = "settings-grid";

    for (const def of SLIDERS) {
      grid.appendChild(this.buildSlider(def));
    }

    const btn = document.createElement("button");
    btn.className = "btn-start";
    btn.textContent = "Start Simulation";

    const footer = document.createElement("div");
    footer.className = "landing-footer";
    footer.innerHTML = `
      <span class="footer-label">More Projects</span>
      <a href="https://galaxy.alixan.dev/" target="_blank" class="footer-link">Galaxy Simulation</a>
    `;

    body.appendChild(panelLabel);
    body.appendChild(grid);
    body.appendChild(btn);
    body.appendChild(footer);
    panel.appendChild(body);

    this.el.appendChild(left);
    this.el.appendChild(panel);
  }

  private buildSlider(def: SliderDef): HTMLElement {
    const row = document.createElement("div");
    row.className = "setting-row";

    const header = document.createElement("div");
    header.className = "setting-header";

    const label = document.createElement("span");
    label.className = "setting-label";
    label.textContent = def.label;

    const valueEl = document.createElement("span");
    valueEl.className = "setting-value";
    valueEl.textContent = String(def.default);

    header.appendChild(label);
    header.appendChild(valueEl);

    const sp = SPECIES_MAP[def.key];
    if (sp) {
      const infoBtn = document.createElement("button");
      infoBtn.className = "info-btn";
      infoBtn.textContent = "i";
      infoBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const popup = openSpeciesPopup(sp, e.currentTarget as HTMLElement);
        this.openPopups.push(popup);
      });
      header.appendChild(infoBtn);
    }

    const input = document.createElement("input");
    input.type = "range";
    input.className = def.colorClass;
    input.min = String(def.min);
    input.max = String(def.max);
    input.step = String(def.step);
    input.value = String(def.default);

    input.addEventListener("input", () => {
      const v = parseFloat(input.value);
      this.values[def.key] = v as never;
      valueEl.textContent = def.step < 1 ? v.toFixed(1) : String(v);
    });

    row.appendChild(header);
    row.appendChild(input);

    if (def.desc) {
      const desc = document.createElement("p");
      desc.className = "setting-desc";
      desc.textContent = def.desc;
      row.appendChild(desc);
    }

    return row;
  }

  start(): Promise<SimSettings> {
    return new Promise((resolve) => {
      const btn = this.el.querySelector<HTMLButtonElement>(".btn-start")!;
      btn.addEventListener("click", () => {
        this.openPopups.forEach((p) => p.remove());
        this.openPopups = [];
        this.el.classList.add("fade-out");
        setTimeout(() => {
          this.el.style.display = "none";
          resolve({ ...this.values });
        }, 500);
      });
    });
  }
}
