import { StorageService } from "./services/storage-service";

export class Widget {
  static type = "base";
  static title = "Базовый виджет";
  static description = "Базовый виджет";
  static icon = "📦";

  constructor(id) {
    if (new.target === Widget) {
      throw new Error("Cannot instantiate abstract Widget class");
    }

    this.id = id;
    this.state = {};
    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized) return;

    try {
      await this.loadState();
      await this.setupEventListeners();
      this.isInitialized = true;
    } catch (error) {
      console.error(`Widget ${this.constructor.type} initialization failed:`, error);
      throw error;
    }
  }

  async destroy() {
    this.isInitialized = false;
    this.cleanupEventListeners();
  }

  render() {
    throw new Error("Render method must be implemented by subclass");
  }

  async setupEventListeners() {
    // Для переопределения в подклассах
  }

  cleanupEventListeners() {
    // Для переопределения в подклассах
  }

  saveState() {
    const savedState = StorageService.get("widget-states") || {};
    savedState[this.id] = this.state;
    StorageService.set("widget-states", savedState);
  }

  async loadState() {
    const savedState = StorageService.get("widget-states") || {};
    this.state = savedState[this.id] || {};
  }

  updateState(newState) {
    this.state = { ...this.state, ...newState };
    this.saveState();
    this.onStateUpdate();
  }

  onStateUpdate() {
    // Для переопределения в подклассах
  }

  getDefaultTemplate(header, content, actions = "") {
    return `
      <div class="widget-header" data-draggable>
        <h3>${header}</h3>
        <div class="widget-actions">
          ${actions}
          <button class="btn-remove" data-action="remove" title="Remove widget">×</button>
        </div>
      </div>
      <div class="widget-content">
        ${content}
      </div>
    `;
  }
}
