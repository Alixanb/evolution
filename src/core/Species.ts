export type SpeciesType = "seeker" | "raider" | "swift" | "titan";

// feedScore: 0 → death  0.25 → 50% survive  0.5 → survive  0.75 → survive + 50% repro  1 → survive + repro
const distributionMap: Record<string, [number, number]> = {
  "raider|raider":  [0,    0   ],
  "raider|seeker":  [0.75, 0.25],
  "raider|swift":   [0.25, 0.75],
  "raider|titan":   [0,    1   ],
  "seeker|seeker":  [0.5,  0.5 ],
  "seeker|swift":   [0.5,  0.5 ],
  "seeker|titan":   [0.25, 0.75],
  "swift|swift":    [0.5,  0.5 ],
  "swift|titan":    [0.25, 0.75],
  "titan|titan":    [0,    0   ],
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
  desc: string;

  constructor(name: string, color: string, speed: number, type: SpeciesType, desc: string) {
    this.name = name;
    this.color = color;
    this.speed = speed;
    this.type = type;
    this.desc = desc;
  }
}

export const Seeker = new Species("seeker", "#50b6c9", 5, "seeker", "Shares food. Loses to raiders & titans.");
export const Raider = new Species("raider", "#ec2626", 5, "raider", "Steals food. Beats seekers, loses to titans.");
export const Swift  = new Species("swift",  "#e9d628", 8, "swift",  "Fastest. Beats seekers, resists raiders.");
export const Titan  = new Species("titan",  "#b77be8", 3, "titan",  "Dominant but sterile with other titans.");
