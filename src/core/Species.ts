export type SpeciesType = "seeker" | "raider";

// keys are in alphabetical sort order (raider < seeker)
const distributionMap: Record<string, [number, number]> = {
  "raider|raider": [0, 0],
  "raider|seeker": [0.75, 0.25], // raider gets 0.75, seeker gets 0.25
  "seeker|seeker": [0.5, 0.5],
};

export function getDistribution(
  a: SpeciesType,
  b: SpeciesType,
): [number, number] {
  const sorted = [a, b].sort() as [SpeciesType, SpeciesType];
  const [s0, s1] = distributionMap[sorted.join("|")] ?? [0, 0];
  return a === sorted[0] ? [s0, s1] : [s1, s0];
}

export default class Species {
  name: string;
  color: string;
  speed: number;
  type: SpeciesType;

  constructor(name: string, color: string, speed: number, type: SpeciesType) {
    this.name = name;
    this.color = color;
    this.speed = speed;
    this.type = type;
  }
}

export const Seeker = new Species("seekers", "rgb(58, 149, 232)", 1, "seeker");
export const Raider = new Species("raider", "rgb(232, 58, 68)", 1, "raider");
