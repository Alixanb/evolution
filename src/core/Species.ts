export default class Species {
  name: string;
  color: string;
  speed: number;

  constructor(name: string, color: string, speed: number) {
    this.name = name;
    this.color = color;
    this.speed = speed;
  }
}

export const Seeker = new Species("seekers", "rgb(58, 149, 232)", 1);
export const Raider = new Species("raider", "rgb(232, 58, 68)", 1);
