import { Pane, type FolderApi } from "tweakpane";
import type { World } from "../entities/World";

export default class ControlPanel {
  private pane: Pane;
  world: World;

  speed = 1;
  paused = false;

  private params = {
    speed: 1,
    paused: false,
    abundance: 100,
  };

  private monitors = {
    day: 0,
    time: "0.00",
    population: 0,
    seekers: 0,
    raiders: 0,
    sleeping: 0,
  };

  private graphValues = {
    population: 0,
    seekers: 0,
    raiders: 0,
  };

  constructor(world: World) {
    this.world = world;
    this.params.abundance = world.abundance;

    this.pane = new Pane({ title: "Evolution", expanded: true });
    this.buildSimulation();
    this.buildStats();
    this.buildGraphs();
  }

  private buildSimulation() {
    const f = this.pane.addFolder({ title: "Simulation" });

    f.addBinding(this.params, "speed", {
      label: "Speed",
      min: 0.1,
      max: 20,
      step: 0.1,
    }).on("change", (ev: { value: number }) => {
      this.speed = ev.value;
    });

    f.addBinding(this.params, "paused", { label: "Pause" }).on(
      "change",
      (ev: { value: boolean }) => {
        this.paused = ev.value;
      },
    );

    f.addBinding(this.params, "abundance", {
      label: "Food / day",
      min: 1,
      max: 1000,
      step: 1,
    }).on("change", (ev: { value: number }) => {
      this.world.abundance = ev.value;
    });

    f.addButton({ title: "⏭ Skip Day" }).on("click", () => {
      this.world.nextDay();
    });
  }

  private buildStats() {
    const f = this.pane.addFolder({ title: "Stats" });

    f.addBinding(this.monitors, "day", { readonly: true, label: "Day" });
    f.addBinding(this.monitors, "time", { readonly: true, label: "Time" });
    f.addBinding(this.monitors, "population", {
      readonly: true,
      label: "Population",
    });
    f.addBinding(this.monitors, "seekers", {
      readonly: true,
      label: "Seekers",
    });
    f.addBinding(this.monitors, "raiders", {
      readonly: true,
      label: "Raiders",
    });
    f.addBinding(this.monitors, "sleeping", {
      readonly: true,
      label: "Sleeping",
    });
  }

  private buildGraphs() {
    const f = this.pane.addFolder({ title: "Graphs", expanded: false });
    this.addGraph(f, "population", "Population", 0, 500);
    this.addGraph(f, "seekers", "Seekers", 0, 500);
    this.addGraph(f, "raiders", "Raiders", 0, 500);
  }

  private addGraph(
    folder: FolderApi,
    key: keyof typeof this.graphValues,
    label: string,
    min: number,
    max: number,
  ) {
    return folder.addBinding(this.graphValues, key, {
      readonly: true,
      view: "graph",
      label,
      min,
      max,
    });
  }

  /** Add a custom folder with extra controls — call before refresh loop starts */
  addFolder(title: string): FolderApi {
    return this.pane.addFolder({ title });
  }

  /** Call every frame to sync displayed values */
  refresh(worldTime: number) {
    const { creatures } = this.world;

    this.monitors.day = this.world.day;
    this.monitors.time = worldTime.toFixed(2);
    this.monitors.population = creatures.length;
    this.monitors.seekers = creatures.filter(
      (c) => c.species.type === "seeker",
    ).length;
    this.monitors.raiders = creatures.filter(
      (c) => c.species.type === "raider",
    ).length;
    this.monitors.sleeping = creatures.filter(
      (c) => c.status === "sleeping",
    ).length;

    this.graphValues.population = this.monitors.population;
    this.graphValues.seekers = this.monitors.seekers;
    this.graphValues.raiders = this.monitors.raiders;

    this.pane.refresh();
  }
}
