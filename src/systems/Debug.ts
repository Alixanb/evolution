export default class Debug {
  private element: HTMLElement;
  private fields: Map<string, string> = new Map();

  constructor() {
    this.element = document.createElement("div");
    Object.assign(this.element.style, {
      position: "fixed",
      top: "12px",
      right: "12px",
      background: "rgba(0,0,0,0.6)",
      color: "#00ff99",
      fontFamily: "monospace",
      fontSize: "12px",
      padding: "8px 12px",
      borderRadius: "4px",
      lineHeight: "1.8",
      pointerEvents: "none",
      zIndex: "9999",
      minWidth: "140px",
    });
    document.body.appendChild(this.element);
  }

  set(key: string, value: unknown) {
    this.fields.set(key, String(value));
    this.element.innerHTML = [...this.fields.entries()]
      .map(([k, v]) => `<div><span style="opacity:0.5">${k}</span>  ${v}</div>`)
      .join("");
  }
}
