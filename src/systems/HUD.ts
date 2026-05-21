import { Raider, Seeker, Swift, Titan } from "../core/Species";
import type Species from "../core/Species";
import type { SpeciesType } from "../core/Species";
import type { World } from "../entities/World";
import { bringToFront, createFloatingWindow, openSpeciesPopup } from "./FloatingWindow";

const CHART_COLORS = {
  seekers: "#50b6c9",
  raiders: "#ec2626",
  swifts:  "#e9d628",
  titans:  "#b77be8",
} as const;

const SPECIES_DEFS: { type: SpeciesType; label: string; color: string; obj: Species }[] = [
  { type: "seeker", label: "Seekers", color: CHART_COLORS.seekers, obj: Seeker },
  { type: "raider", label: "Raiders", color: CHART_COLORS.raiders, obj: Raider },
  { type: "swift",  label: "Swifts",  color: CHART_COLORS.swifts,  obj: Swift  },
  { type: "titan",  label: "Titans",  color: CHART_COLORS.titans,  obj: Titan  },
];

const MAX_HISTORY = 120;
const SURV_WINDOW  = 20;

class ChartSeries {
  data: number[] = [];
  color: string;
  constructor(color: string) { this.color = color; }
  push(v: number) {
    this.data.push(v);
    if (this.data.length > MAX_HISTORY) this.data.shift();
  }
}

interface StatCells {
  n: HTMLElement;
  pct: HTMLElement;
  surv: HTMLElement;
  repro: HTMLElement;
  elife: HTMLElement;
}

export default class HUD {
  private world: World;

  paused = false;
  speed = 1;

  private _lastDay = -1;
  private lastCanvasW = 0;

  private elDay!: HTMLElement;
  private elPop!: HTMLElement;
  private elSeekers!: HTMLElement;
  private elRaiders!: HTMLElement;
  private elSwifts!: HTMLElement;
  private elTitans!: HTMLElement;
  private elSleeping!: HTMLElement;
  private elPauseBtn!: HTMLButtonElement;
  private elSpeedDisplay!: HTMLElement;
  private chartCanvas!: HTMLCanvasElement;
  private sidePanel!: HTMLElement;
  private injPanel!: HTMLElement;

  private statCells: Map<SpeciesType, StatCells> = new Map();
  private elFoodEff!: HTMLElement;
  private elDeltaPop!: HTMLElement;
  private elDominant!: HTMLElement;
  private survRateHistory: Map<SpeciesType, number[]> = new Map();
  private prevTotalPop = 0;

  private injInputs: Map<SpeciesType, HTMLInputElement> = new Map();
  private foodInjInput!: HTMLInputElement;

  private series = {
    seekers: new ChartSeries(CHART_COLORS.seekers),
    raiders: new ChartSeries(CHART_COLORS.raiders),
    swifts:  new ChartSeries(CHART_COLORS.swifts),
    titans:  new ChartSeries(CHART_COLORS.titans),
  };

  constructor(world: World) {
    this.world = world;
    this.build();
  }

  private build() {
    const hud = document.getElementById("hud")!;
    hud.style.display = "block";

    const topbar = document.createElement("div");
    topbar.className = "hud-topbar";

    const wordmark = document.createElement("span");
    wordmark.className = "hud-wordmark";
    wordmark.textContent = "Evolution";

    const center = document.createElement("div");
    center.className = "hud-center";

    this.elDay = document.createElement("span");
    this.elDay.className = "hud-day";
    this.elDay.textContent = "DAY 0";

    this.elPop = document.createElement("span");
    this.elPop.className = "hud-pop";
    this.elPop.textContent = "0 creatures";

    center.appendChild(this.elDay);
    center.appendChild(this.elPop);

    const controls = document.createElement("div");
    controls.className = "hud-controls";

    this.elPauseBtn = this.makeBtn("⏸ Pause");
    this.elPauseBtn.addEventListener("click", () => {
      this.paused = !this.paused;
      this.elPauseBtn.textContent = this.paused ? "▶ Resume" : "⏸ Pause";
      this.elPauseBtn.classList.toggle("active", this.paused);
    });

    const speedDown = this.makeBtn("−");
    speedDown.addEventListener("click", () => {
      this.speed = Math.max(1, this.speed - 1);
      this.updateSpeedDisplay();
    });

    this.elSpeedDisplay = document.createElement("span");
    this.elSpeedDisplay.className = "hud-speed-display";
    this.updateSpeedDisplay();

    const speedUp = this.makeBtn("+");
    speedUp.addEventListener("click", () => {
      this.speed = Math.min(50, this.speed + 1);
      this.updateSpeedDisplay();
    });

    const skipBtn = this.makeBtn("⏭ Skip");
    skipBtn.addEventListener("click", () => this.world.nextDay());

    const sep = document.createElement("div");
    sep.className = "hud-controls-sep";

    const popBtn = this.makeBtn("Population");
    popBtn.addEventListener("click", () => {
      if (this.sidePanel.style.display === "none") {
        this.sidePanel.style.display = "";
        bringToFront(this.sidePanel);
      } else {
        this.sidePanel.style.display = "none";
      }
    });

    const injBtn = this.makeBtn("Inject");
    injBtn.addEventListener("click", () => {
      if (this.injPanel.style.display === "none") {
        this.injPanel.style.display = "";
        bringToFront(this.injPanel);
      } else {
        this.injPanel.style.display = "none";
      }
    });

    controls.appendChild(this.elPauseBtn);
    controls.appendChild(speedDown);
    controls.appendChild(this.elSpeedDisplay);
    controls.appendChild(speedUp);
    controls.appendChild(skipBtn);
    controls.appendChild(sep);
    controls.appendChild(popBtn);
    controls.appendChild(injBtn);

    topbar.appendChild(wordmark);
    topbar.appendChild(center);
    topbar.appendChild(controls);

    const stats = document.createElement("div");
    stats.className = "hud-stats";

    const makeStat = (label: string, colorClass: string, onClick?: () => void) => {
      const s = document.createElement("div");
      s.className = "hud-stat";
      const lbl = document.createElement("span");
      lbl.className = `hud-stat-label${onClick ? " clickable" : ""}`;
      lbl.textContent = label;
      if (onClick) lbl.addEventListener("click", onClick);
      const val = document.createElement("span");
      val.className = `hud-stat-val ${colorClass}`;
      val.textContent = "0";
      s.appendChild(lbl);
      s.appendChild(val);
      return { el: s, val };
    };

    const sk = makeStat("Seekers",  "cyan",   () => openSpeciesPopup(Seeker));
    const ra = makeStat("Raiders",  "red",    () => openSpeciesPopup(Raider));
    const sw = makeStat("Swifts",   "yellow", () => openSpeciesPopup(Swift));
    const ti = makeStat("Titans",   "purple", () => openSpeciesPopup(Titan));
    const sl = makeStat("Sleeping", "muted");

    this.elSeekers  = sk.val;
    this.elRaiders  = ra.val;
    this.elSwifts   = sw.val;
    this.elTitans   = ti.val;
    this.elSleeping = sl.val;

    stats.appendChild(sk.el);
    stats.appendChild(ra.el);
    stats.appendChild(sw.el);
    stats.appendChild(ti.el);
    stats.appendChild(sl.el);

    const { panel, body } = createFloatingWindow("Population", 280, 220, 200);
    this.sidePanel = panel;
    body.className = "window-body chart-body";

    // Legend
    const legend = document.createElement("div");
    legend.className = "hud-chart-legend";
    for (const [key, color] of Object.entries(CHART_COLORS)) {
      const item = document.createElement("div");
      item.className = "legend-item";
      const dot = document.createElement("div");
      dot.className = "legend-dot";
      dot.style.background = color;
      const lbl = document.createElement("span");
      lbl.textContent = key;
      item.appendChild(dot);
      item.appendChild(lbl);
      legend.appendChild(item);
    }

    // Chart canvas
    this.chartCanvas = document.createElement("canvas");
    this.chartCanvas.className = "hud-chart-canvas";

    body.appendChild(legend);
    body.appendChild(this.chartCanvas);

    // Scrollable bottom: guide + stats
    const scroll = document.createElement("div");
    scroll.className = "pop-scroll";

    const divider = document.createElement("div");
    divider.className = "hud-panel-divider";
    scroll.appendChild(divider);

    // Species guide (names clickable, no descriptions)
    const guide = document.createElement("div");
    guide.className = "hud-species-guide";

    for (const sp of [Seeker, Raider, Swift, Titan]) {
      const row = document.createElement("div");
      row.className = "hud-species-row";

      const dot = document.createElement("div");
      dot.className = "legend-dot";
      dot.style.background = sp.color;
      dot.style.flexShrink = "0";
      dot.style.marginTop = "2px";

      const name = document.createElement("span");
      name.className = "hud-species-name clickable";
      name.style.color = sp.color;
      name.textContent = sp.name[0].toUpperCase() + sp.name.slice(1);
      name.addEventListener("click", () => openSpeciesPopup(sp));

      row.appendChild(dot);
      row.appendChild(name);
      guide.appendChild(row);
    }

    scroll.appendChild(guide);

    // Stats divider
    const statsDivider = document.createElement("div");
    statsDivider.className = "hud-panel-divider";
    scroll.appendChild(statsDivider);

    // Per-species stats table
    const table = document.createElement("table");
    table.className = "stats-table";

    const thead = table.createTHead();
    const hRow = thead.insertRow();
    for (const t of ["", "N", "%", "Surv", "Repro", "E[t]"]) {
      const th = document.createElement("th");
      th.textContent = t;
      hRow.appendChild(th);
    }

    const tbody = table.createTBody();
    for (const def of SPECIES_DEFS) {
      const tr = tbody.insertRow();
      tr.className = "stats-species-row";

      const tdDot = tr.insertCell();
      const dot = document.createElement("span");
      dot.className = "popup-dot";
      dot.style.background = def.color;
      tdDot.appendChild(dot);

      const makeCell = () => {
        const td = tr.insertCell();
        td.className = "stats-val";
        td.textContent = "—";
        return td;
      };

      this.statCells.set(def.type, {
        n:     makeCell(),
        pct:   makeCell(),
        surv:  makeCell(),
        repro: makeCell(),
        elife: makeCell(),
      });
    }

    scroll.appendChild(table);

    // Global stats
    const globalDiv = document.createElement("div");
    globalDiv.className = "stats-global";

    const makeGlobal = (label: string) => {
      const row = document.createElement("div");
      row.className = "stats-global-row";
      const lbl = document.createElement("span");
      lbl.className = "stats-dim";
      lbl.textContent = label;
      const val = document.createElement("span");
      val.className = "stats-val";
      val.textContent = "—";
      row.appendChild(lbl);
      row.appendChild(val);
      globalDiv.appendChild(row);
      return val;
    };

    this.elFoodEff  = makeGlobal("Food eaten");
    this.elDeltaPop = makeGlobal("Net Δ pop");
    this.elDominant = makeGlobal("Dominant");

    scroll.appendChild(globalDiv);
    body.appendChild(scroll);

    // Position panel at top-right
    panel.style.top   = "90px";
    panel.style.right = "24px";
    document.body.appendChild(panel);

    this.buildInjectPanel();

    hud.appendChild(topbar);
    hud.appendChild(stats);
  }

  private buildInjectPanel() {
    const { panel, body } = createFloatingWindow("Inject", 220, 180, 120);
    this.injPanel = panel;
    panel.style.display = "none";
    body.className = "window-body inject-body";

    const creaturesLabel = document.createElement("div");
    creaturesLabel.className = "inject-section-label";
    creaturesLabel.textContent = "Creatures";
    body.appendChild(creaturesLabel);

    for (const def of SPECIES_DEFS) {
      const row = document.createElement("div");
      row.className = "inject-row";

      const dot = document.createElement("div");
      dot.className = "legend-dot";
      dot.style.background = def.color;
      dot.style.flexShrink = "0";

      const lbl = document.createElement("span");
      lbl.className = "inject-label";
      lbl.textContent = def.label;
      lbl.style.color = def.color;

      const input = document.createElement("input");
      input.type = "number";
      input.className = "inject-input";
      input.min = "1";
      input.max = "50";
      input.value = "5";
      this.injInputs.set(def.type, input);

      const btn = document.createElement("button");
      btn.className = "inject-btn";
      btn.textContent = "Add";
      btn.addEventListener("click", () => {
        const n = Math.max(1, Math.min(50, parseInt(input.value) || 1));
        this.world.spawnBulk(n, def.obj);
      });

      row.appendChild(dot);
      row.appendChild(lbl);
      row.appendChild(input);
      row.appendChild(btn);
      body.appendChild(row);
    }

    const divider = document.createElement("div");
    divider.className = "hud-panel-divider";
    divider.style.margin = "10px 0 8px";
    body.appendChild(divider);

    const foodLabel = document.createElement("div");
    foodLabel.className = "inject-section-label";
    foodLabel.textContent = "Food";
    body.appendChild(foodLabel);

    const foodRow = document.createElement("div");
    foodRow.className = "inject-row";

    const foodDot = document.createElement("div");
    foodDot.className = "legend-dot";
    foodDot.style.background = "#6cb973";
    foodDot.style.flexShrink = "0";

    const foodLbl = document.createElement("span");
    foodLbl.className = "inject-label";
    foodLbl.textContent = "Food";
    foodLbl.style.color = "#6cb973";

    this.foodInjInput = document.createElement("input");
    this.foodInjInput.type = "number";
    this.foodInjInput.className = "inject-input";
    this.foodInjInput.min = "1";
    this.foodInjInput.max = "500";
    this.foodInjInput.value = "20";

    const foodBtn = document.createElement("button");
    foodBtn.className = "inject-btn";
    foodBtn.textContent = "Add";
    foodBtn.addEventListener("click", () => {
      const n = Math.max(1, Math.min(500, parseInt(this.foodInjInput.value) || 1));
      this.world.addFood(n);
    });

    foodRow.appendChild(foodDot);
    foodRow.appendChild(foodLbl);
    foodRow.appendChild(this.foodInjInput);
    foodRow.appendChild(foodBtn);
    body.appendChild(foodRow);

    panel.style.top  = "90px";
    panel.style.left = "24px";
    document.body.appendChild(panel);
  }

  private makeBtn(label: string): HTMLButtonElement {
    const btn = document.createElement("button");
    btn.className = "hud-btn";
    btn.textContent = label;
    return btn;
  }

  private updateSpeedDisplay() {
    this.elSpeedDisplay.textContent = `×${this.speed}`;
  }

  refresh(_worldTime: number) {
    const { creatures } = this.world;
    const seekers  = creatures.filter((c) => c.species.type === "seeker").length;
    const raiders  = creatures.filter((c) => c.species.type === "raider").length;
    const swifts   = creatures.filter((c) => c.species.type === "swift").length;
    const titans   = creatures.filter((c) => c.species.type === "titan").length;
    const sleeping = creatures.filter((c) => c.status === "sleeping").length;

    this.elDay.textContent     = `DAY ${this.world.day}`;
    this.elPop.textContent     = `${creatures.length} creatures`;
    this.elSeekers.textContent  = String(seekers);
    this.elRaiders.textContent  = String(raiders);
    this.elSwifts.textContent   = String(swifts);
    this.elTitans.textContent   = String(titans);
    this.elSleeping.textContent = String(sleeping);

    const dayChanged = this.world.day !== this._lastDay;
    const canvasW = this.chartCanvas.offsetWidth;

    if (dayChanged) {
      this._lastDay = this.world.day;
      this.series.seekers.push(seekers);
      this.series.raiders.push(raiders);
      this.series.swifts.push(swifts);
      this.series.titans.push(titans);
      this.updateStats();
    }

    if (dayChanged || canvasW !== this.lastCanvasW) {
      this.lastCanvasW = canvasW;
      this.drawChart();
    }
  }

  private updateStats() {
    const stat = this.world.lastDayStat;
    const total = this.world.creatures.length;

    for (const def of SPECIES_DEFS) {
      const cells = this.statCells.get(def.type)!;
      const count = this.world.creatures.filter((c) => c.species.type === def.type).length;
      const s = stat?.byType[def.type];

      if (!this.survRateHistory.has(def.type)) this.survRateHistory.set(def.type, []);
      const hist = this.survRateHistory.get(def.type)!;
      if (s && s.atStart > 0) {
        hist.push(s.survived / s.atStart);
        if (hist.length > SURV_WINDOW) hist.shift();
      }

      const meanSurv = hist.length > 0 ? hist.reduce((a, b) => a + b, 0) / hist.length : 0;
      const eLife = hist.length > 0
        ? (meanSurv >= 1 ? "∞" : (1 / (1 - meanSurv)).toFixed(1))
        : "—";

      cells.n.textContent    = String(count);
      cells.pct.textContent  = total > 0 ? `${Math.round((count / total) * 100)}%` : "—";
      cells.surv.textContent = s && s.atStart > 0 ? `${Math.round((s.survived / s.atStart) * 100)}%` : "—";
      cells.repro.textContent = s && s.survived > 0 ? `${Math.round((s.born / s.survived) * 100)}%` : "—";
      cells.elife.textContent = eLife;
    }

    if (stat) {
      const eff = stat.foodTotal > 0 ? Math.round((stat.foodEaten / stat.foodTotal) * 100) : 0;
      this.elFoodEff.textContent = `${eff}%`;
    }

    const delta = total - this.prevTotalPop;
    this.elDeltaPop.textContent = delta >= 0 ? `+${delta}` : String(delta);
    this.elDeltaPop.className = `stats-val ${delta >= 0 ? "score-good" : "score-bad"}`;
    this.prevTotalPop = total;

    let domType = "—";
    let domCount = 0;
    for (const def of SPECIES_DEFS) {
      const n = this.world.creatures.filter((c) => c.species.type === def.type).length;
      if (n > domCount) { domCount = n; domType = def.label; }
    }
    this.elDominant.textContent = domCount > 0 ? domType : "—";
  }

  private drawChart() {
    const canvas = this.chartCanvas;
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    if (w < 2 || h < 2) return;
    canvas.width  = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d")!;
    const W = w, H = h;
    ctx.clearRect(0, 0, W, H);

    const n = this.series.seekers.data.length;
    if (n < 2) return;

    const pad = { top: 12, right: 8, bottom: 20, left: 6 };
    const cw = W - pad.left - pad.right;
    const ch = H - pad.top - pad.bottom;

    const stackOrder = ["seekers", "raiders", "swifts", "titans"] as const;

    const cumul: Record<string, number[]> = {};
    let cumulPrev = new Array(n).fill(0);
    for (const key of stackOrder) {
      const cur = this.series[key].data.map((v, i) => cumulPrev[i] + v);
      cumul[key] = cur;
      cumulPrev = cur;
    }
    const maxTotal = Math.max(1, ...cumulPrev);

    // Grid lines
    ctx.strokeStyle = "rgba(236,223,205,0.05)";
    ctx.lineWidth = 1;
    for (let i = 1; i <= 3; i++) {
      const y = pad.top + (ch / 4) * i;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + cw, y);
      ctx.stroke();
    }

    // Stacked areas
    const xOf = (i: number) => pad.left + (i / (n - 1)) * cw;
    const yOf = (v: number) => pad.top + ch - (v / maxTotal) * ch;

    for (let k = 0; k < stackOrder.length; k++) {
      const key = stackOrder[k];
      const lower = k > 0 ? stackOrder[k - 1] : null;

      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const x = xOf(i), y = yOf(cumul[key][i]);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      for (let i = n - 1; i >= 0; i--) {
        ctx.lineTo(xOf(i), lower ? yOf(cumul[lower][i]) : pad.top + ch);
      }
      ctx.closePath();
      ctx.fillStyle = CHART_COLORS[key] + "b0";
      ctx.fill();

      // Top edge
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const x = xOf(i), y = yOf(cumul[key][i]);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = CHART_COLORS[key] + "cc";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Labels
    ctx.fillStyle = "rgba(236,223,205,0.28)";
    ctx.font = "10px Inter, sans-serif";
    const startDay = Math.max(0, this.world.day - n + 1);
    ctx.textAlign = "left";
    ctx.fillText(`Day ${startDay}`, pad.left, H - 4);
    ctx.textAlign = "right";
    ctx.fillText(`Day ${this.world.day}`, pad.left + cw, H - 4);

    ctx.fillStyle = "rgba(236,223,205,0.22)";
    ctx.font = "9px Inter, sans-serif";
    ctx.fillText(`${maxTotal}`, pad.left + cw, pad.top + 9);
  }
}
