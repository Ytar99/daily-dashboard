export class Widget {
  constructor(id) {
    this.id = id;
    this.state = {};
  }

  render() {
    return "<div>Базовый виджет</div>";
  }

  init() {
    // Инициализация виджета
  }

  destroy() {
    // Очистка ресурсов виджета (переопределяется в дочерних классах)
  }

  saveState() {
    const savedState = JSON.parse(localStorage.getItem("widget-states") || "{}");
    savedState[this.id] = this.state;
    localStorage.setItem("widget-states", JSON.stringify(savedState));
  }

  loadState() {
    const savedState = JSON.parse(localStorage.getItem("widget-states") || "{}");
    this.state = savedState[this.id] || {};
  }
}
