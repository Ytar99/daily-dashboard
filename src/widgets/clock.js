import { Widget } from "../widget";

export class ClockWidget extends Widget {
  constructor(id) {
    super(id);
    this.loadState();
    this.intervalId = null;
  }

  render() {
    return `
      <div class="widget-header">
        <div class="widget-title">Часы</div>
        <div class="widget-actions">
          <button class="widget-btn" data-action="remove">✕</button>
        </div>
      </div>
      <div class="clock-widget">
        <div class="time" id="time-${this.id}">00:00:00</div>
        <div class="date" id="date-${this.id}">1 января 2023</div>
      </div>
    `;
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
