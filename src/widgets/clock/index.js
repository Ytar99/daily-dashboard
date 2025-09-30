import { Widget } from "../../widget";
import templateHtml from "./template.html?raw";

import "./styles.css";

const templates = {
  id: "{{id}}",
};

export class ClockWidget extends Widget {
  static type = "clock";
  static title = "Часы";
  static description = "Отображает текущее время и дату";
  static icon = "⏰";

  constructor(id) {
    super(id);
    this.loadState();
    this.intervalId = null;
  }

  render() {
    return templateHtml.trim().replaceAll(templates.id, this.id);
  }

  init() {
    this.updateTime();
    this.intervalId = setInterval(() => this.updateTime(), 1000);
  }

  updateTime() {
    const now = new Date();
    const timeElement = document.getElementById(`time-${this.id}`);
    const dateElement = document.getElementById(`date-${this.id}`);

    if (timeElement) {
      timeElement.textContent = now.toLocaleTimeString();
    }

    if (dateElement) {
      dateElement.textContent = now.toLocaleDateString("ru-RU", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  }

  destroy() {
    // Очищаем интервал
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
