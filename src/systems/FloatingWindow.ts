import { getDistribution, Raider, Seeker, Swift, Titan } from "../core/Species";
import type Species from "../core/Species";

let topZ = 300;

export function bringToFront(el: HTMLElement) {
  el.style.zIndex = String(++topZ);
}

export function createFloatingWindow(
  title: string,
  width: number,
  minWidth = 200,
  minHeight = 80,
): { panel: HTMLElement; body: HTMLElement } {
  const panel = document.createElement("div");
  panel.className = "draggable-window";
  panel.style.width = `${width}px`;

  const titlebar = document.createElement("div");
  titlebar.className = "window-titlebar";

  const titleEl = document.createElement("span");
  titleEl.className = "window-title";
  titleEl.textContent = title;

  const closeBtn = document.createElement("button");
  closeBtn.className = "panel-close";
  closeBtn.textContent = "×";
  closeBtn.addEventListener("click", () => { panel.style.display = "none"; });

  titlebar.appendChild(titleEl);
  titlebar.appendChild(closeBtn);

  const body = document.createElement("div");
  body.className = "window-body";

  const grip = document.createElement("div");
  grip.className = "window-resize-grip";

  panel.appendChild(titlebar);
  panel.appendChild(body);
  panel.appendChild(grip);

  panel.addEventListener("mousedown", () => bringToFront(panel), true);
  initDrag(titlebar, panel);
  initResize(grip, panel, minWidth, minHeight);

  return { panel, body };
}

function initDrag(titlebar: HTMLElement, panel: HTMLElement) {
  let dragging = false;
  let ox = 0, oy = 0;

  titlebar.addEventListener("mousedown", (e) => {
    if ((e.target as HTMLElement).closest(".panel-close")) return;
    dragging = true;
    const r = panel.getBoundingClientRect();
    panel.style.right = "auto";
    panel.style.left = `${r.left}px`;
    panel.style.top = `${r.top}px`;
    ox = e.clientX - r.left;
    oy = e.clientY - r.top;
    e.preventDefault();
  });

  document.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    panel.style.left = `${e.clientX - ox}px`;
    panel.style.top = `${e.clientY - oy}px`;
  });

  document.addEventListener("mouseup", () => { dragging = false; });
}

function initResize(grip: HTMLElement, panel: HTMLElement, minW: number, minH: number) {
  let resizing = false;
  let sx = 0, sy = 0, sw = 0, sh = 0;

  grip.addEventListener("mousedown", (e) => {
    resizing = true;
    sx = e.clientX; sy = e.clientY;
    const r = panel.getBoundingClientRect();
    sw = r.width; sh = r.height;
    e.preventDefault();
    e.stopPropagation();
  });

  document.addEventListener("mousemove", (e) => {
    if (!resizing) return;
    panel.style.width  = `${Math.max(minW, sw + e.clientX - sx)}px`;
    panel.style.height = `${Math.max(minH, sh + e.clientY - sy)}px`;
  });

  document.addEventListener("mouseup", () => { resizing = false; });
}

function scoreLabel(v: number): string {
  if (v === 0)    return "100% die";
  if (v === 0.25) return "50% survive";
  if (v === 0.5)  return "survive";
  if (v === 0.75) return "survive + 50% repro";
  return "survive + repro";
}

function scoreClass(v: number): string {
  if (v === 0)    return "score-bad";
  if (v === 0.25) return "score-warn";
  if (v === 0.5)  return "score-ok";
  return "score-good";
}

export function openSpeciesPopup(species: Species, anchor?: HTMLElement): HTMLElement {
  const label = species.name[0].toUpperCase() + species.name.slice(1);
  const { panel, body } = createFloatingWindow(label, 280, 220, 150);
  body.className = "window-body species-popup-body";

  const desc = document.createElement("p");
  desc.className = "popup-desc";
  desc.textContent = species.desc;
  body.appendChild(desc);

  const table = document.createElement("table");
  table.className = "popup-table";

  const thead = table.createTHead();
  const hRow = thead.insertRow();
  for (const t of ["Vs", "Mine", "Theirs"]) {
    const th = document.createElement("th");
    th.textContent = t;
    hRow.appendChild(th);
  }

  const tbody = table.createTBody();
  for (const other of [Seeker, Raider, Swift, Titan]) {
    const [myScore, theirScore] = getDistribution(species.type, other.type);
    const tr = tbody.insertRow();

    const tdName = tr.insertCell();
    const dot = document.createElement("span");
    dot.className = "popup-dot";
    dot.style.background = other.color;
    tdName.appendChild(dot);
    tdName.append(" " + other.name[0].toUpperCase() + other.name.slice(1));

    const tdMine = tr.insertCell();
    tdMine.textContent = scoreLabel(myScore);
    tdMine.className = scoreClass(myScore);

    const tdTheirs = tr.insertCell();
    tdTheirs.textContent = scoreLabel(theirScore);
    tdTheirs.className = scoreClass(theirScore);
  }

  body.appendChild(table);

  if (anchor) {
    const r = anchor.getBoundingClientRect();
    panel.style.left = `${Math.min(r.right + 10, window.innerWidth - 300)}px`;
    panel.style.top  = `${Math.max(r.top - 10, 10)}px`;
  } else {
    panel.style.left = `${Math.round((window.innerWidth - 280) / 2)}px`;
    panel.style.top  = `${Math.round((window.innerHeight - 270) / 2)}px`;
  }

  document.body.appendChild(panel);
  bringToFront(panel);
  return panel;
}
