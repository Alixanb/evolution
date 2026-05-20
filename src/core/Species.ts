export default class Species {
  name: string;
  color: string;

  constructor(name: string, color: string) {
    this.name = name;
    this.color = color;
  }
}

export const Seeker = new Species("seekers", "rgb(58, 149, 232)");
export const Raider = new Species("raider", "rgb(232, 58, 68)");
