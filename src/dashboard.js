import { StorageService } from "./services/storage-service";
import { WidgetManager } from "./widget-manager";
import { ThemeManager } from "./theme-manager";
import { WidgetRenderer } from "./widget-renderer";
import { WIDGET_REGISTRY, DEFAULT_CONFIG } from "./config";

export class Dashboard {
  container = null;
  config = null;
  widgetManager = null;
  storageService = null;
  themeManager = null;
  widgetRenderer = null;
  widgets = null;
  widgetInstances = null;

  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error(`Container with id "${containerId}" not found`);
    }

    this.config = { ...DEFAULT_CONFIG, ...options };
    this.widgetManager = options.widgetManager || new WidgetManager();
    this.storageService = options.storageService || StorageService;
    this.themeManager = options.themeManager || new ThemeManager(this.storageService);
    this.widgetRenderer = options.widgetRenderer || new WidgetRenderer();

    this.initializeWidgets();
    this.setupEventListeners = this.setupEventListeners.bind(this);
  }

  async init() {
    try {
      await this.initializeWidgetRegistry();
      this.render();
      this.setupEventListeners();
      await this.loadWidgets();
      this.themeManager.applySavedTheme();

      console.log("Dashboard initialized successfully");
    } catch (error) {
      console.error("Dashboard initialization failed:", error);
      this.showFatalError(error);
    }
  }

  async initializeWidgetRegistry() {
    console.log("Registering widgets...");

    for (const WidgetClass of WIDGET_REGISTRY) {
      try {
        this.widgetManager.registerWidget(WidgetClass);
        console.log(`✓ Registered widget: ${WidgetClass.title}`);
      } catch (error) {
        console.warn(`✗ Failed to register widget ${WidgetClass.type}:`, error);
      }
    }
  }

  initializeWidgets() {
    this.widgets = this.storageService.getArray("dashboard-widgets", []);
    this.widgetInstances = new Map();
  }

  render() {
    this.container.innerHTML = this.getTemplate();
    this.applyTheme(this.themeManager.getCurrentTheme());
  }

  getTemplate() {
    const currentTheme = this.themeManager.getCurrentTheme();

    return `
      <div class="dashboard">
        <header class="dashboard-header">
          <h1>Daily Dashboard</h1>
          <div class="header-controls">
            <select class="theme-selector" id="themeSelector">
              ${this.config.themes
                .map(
                  (theme) =>
                    `<option value="${theme}" ${theme === currentTheme ? "selected" : ""}>
                  ${this.getThemeDisplayName(theme)}
                </option>`
                )
                .join("")}
            </select>
            <button class="add-widget-btn" id="addWidgetBtn">
              <span>+</span> Добавить виджет
            </button>
          </div>
        </header>
        
        <div class="dashboard-content">
          <div class="widgets-container" id="widgetsContainer"></div>
        </div>
        
        <!-- Модальное окно добавления виджетов -->
        <div class="modal" id="widgetModal">
          <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Добавить виджет</h2>
            <div class="widgets-list" id="widgetsList"></div>
          </div>
        </div>
      </div>
    `;
  }

  getThemeDisplayName(theme) {
    const themeNames = {
      light: "Светлая",
      dark: "Темная",
      blue: "Синяя",
      green: "Зеленая",
    };
    return themeNames[theme] || theme;
  }

  setupEventListeners() {
    // Делегирование событий для лучшей производительности
    this.container.addEventListener("click", (event) => {
      this.handleContainerClick(event);
    });

    this.container.addEventListener("change", (event) => {
      if (event.target.id === "themeSelector") {
        this.themeManager.changeTheme(event.target.value);
      }
    });

    // Глобальные обработчики
    window.addEventListener("click", (event) => {
      if (event.target.id === "widgetModal") {
        this.closeWidgetModal();
      }
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        this.closeWidgetModal();
      }
    });

    // Обработчик изменения размера окна
    window.addEventListener("resize", () => {
      this.handleWindowResize();
    });
  }

  handleContainerClick(event) {
    const target = event.target;

    if (target.id === "addWidgetBtn" || target.closest("#addWidgetBtn")) {
      this.openWidgetModal();
      return;
    }

    if (target.classList.contains("close") || target.closest(".close")) {
      this.closeWidgetModal();
      return;
    }

    if (target.closest('[data-action="remove"]')) {
      const widgetElement = target.closest(".widget");
      if (widgetElement) {
        const widgetId = widgetElement.id.replace("widget-", "");
        this.removeWidget(widgetId);
      }
      return;
    }

    if (target.classList.contains("widget-item") || target.closest(".widget-item")) {
      const widgetItem = target.closest(".widget-item");
      if (widgetItem) {
        const type = widgetItem.dataset.type;
        this.addWidget(type);
        this.closeWidgetModal();
      }
    }
  }

  async loadWidgets() {
    try {
      console.log("Loading saved widgets:", this.widgets.length);

      // Очищаем контейнер перед загрузкой
      const widgetsContainer = document.getElementById("widgetsContainer");
      if (widgetsContainer) {
        widgetsContainer.innerHTML = "";
      }

      // Очищаем предыдущие экземпляры
      this.widgetInstances.clear();

      // Загружаем виджеты последовательно
      for (const widgetConfig of this.widgets) {
        await this.renderWidget(widgetConfig);
      }

      console.log(`Successfully loaded ${this.widgets.length} widgets`);
    } catch (error) {
      console.error("Failed to load widgets:", error);
      this.showNotification("Ошибка загрузки виджетов", "error");
    }
  }

  async renderWidget(config) {
    try {
      // Проверяем валидность конфигурации
      if (!this.isValidWidgetConfig(config)) {
        console.warn("Invalid widget config:", config);
        this.showNotification("Неверная конфигурация виджета", "warning");
        return;
      }

      const widgetInstance = this.widgetManager.createWidget(config.type, config.id);
      if (!widgetInstance) {
        throw new Error(`Тип виджета "${config.type}" не найден`);
      }

      const widgetElement = this.widgetRenderer.createWidgetElement(config, widgetInstance);
      const widgetsContainer = document.getElementById("widgetsContainer");

      if (!widgetsContainer) {
        throw new Error("Контейнер виджетов не найден");
      }

      widgetsContainer.appendChild(widgetElement);
      this.widgetInstances.set(config.id, widgetInstance);

      // Инициализируем виджет
      await widgetInstance.init();

      // Делаем виджет интерактивным
      this.widgetRenderer.makeWidgetInteractive(widgetElement, config.id, {
        onPositionUpdate: (position) => this.updateWidgetPosition(config.id, position),
        onSizeUpdate: (size) => this.updateWidgetSize(config.id, size),
        onRemove: (widgetId) => this.removeWidget(widgetId),
      });

      // Восстанавливаем состояние виджета если есть
      await this.restoreWidgetState(config.id, widgetInstance);

      return widgetElement;
    } catch (error) {
      console.error(`Failed to render widget ${config.id}:`, error);

      throw error;
    }
  }

  isValidWidgetConfig(config) {
    return (
      config &&
      config.id &&
      config.type &&
      config.position &&
      config.size &&
      typeof config.id === "string" &&
      typeof config.type === "string" &&
      typeof config.position.x === "number" &&
      typeof config.position.y === "number" &&
      typeof config.size.width === "number" &&
      typeof config.size.height === "number"
    );
  }

  async restoreWidgetState(widgetId, widgetInstance) {
    try {
      if (typeof widgetInstance.loadState === "function") {
        await widgetInstance.loadState();
      }

      if (typeof widgetInstance.onStateRestored === "function") {
        widgetInstance.onStateRestored();
      }
    } catch (error) {
      console.warn(`Failed to restore state for widget ${widgetId}:`, error);
    }
  }

  openWidgetModal() {
    const modal = document.getElementById("widgetModal");
    if (modal) {
      modal.style.display = "block";
      this.renderWidgetsList();
    }
  }

  closeWidgetModal() {
    const modal = document.getElementById("widgetModal");
    if (modal) {
      modal.style.display = "none";
    }
  }

  renderWidgetsList() {
    const widgetsList = document.getElementById("widgetsList");
    if (!widgetsList) return;

    const availableWidgets = this.widgetManager.getAvailableWidgets();

    if (availableWidgets.length === 0) {
      widgetsList.innerHTML = '<p class="no-widgets">Нет доступных виджетов</p>';
      return;
    }

    widgetsList.innerHTML = availableWidgets
      .map(
        (widget) => `
        <div class="widget-item" data-type="${widget.type}">
          <div class="widget-icon">${widget.icon}</div>
          <div class="widget-info">
            <h3>${widget.title}</h3>
            <p>${widget.description}</p>
          </div>
        </div>
      `
      )
      .join("");
  }

  addWidget(type) {
    try {
      const widgetConfig = {
        id: this.generateWidgetId(),
        type,
        position: this.calculateNewWidgetPosition(),
        size: { ...this.config.widgetDefaults.size },
        createdAt: new Date().toISOString(),
      };

      this.widgets.push(widgetConfig);
      this.saveWidgets();
      this.renderWidget(widgetConfig);

      // this.showNotification(`Виджет "${this.getWidgetTitle(type)}" добавлен`, "success");
    } catch (error) {
      console.error("Failed to add widget:", error);
      this.showNotification("Ошибка добавления виджета", "error");
    }
  }

  generateWidgetId() {
    return `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  calculateNewWidgetPosition() {
    // Позиционируем новый виджет так, чтобы он не перекрывал существующие
    const existingWidgets = this.widgets;
    const gridSize = 20;
    let x = 20,
      y = 20;

    if (existingWidgets.length > 0) {
      const lastWidget = existingWidgets[existingWidgets.length - 1];
      x = lastWidget.position.x + 30;
      y = lastWidget.position.y + 30;
    }

    // Ограничиваем позицию размерами контейнера
    const container = document.getElementById("widgetsContainer");
    if (container) {
      const containerRect = container.getBoundingClientRect();
      x = Math.min(x, containerRect.width - this.config.widgetDefaults.size.width);
      y = Math.min(y, containerRect.height - this.config.widgetDefaults.size.height);
    }

    return { x, y };
  }

  getWidgetTitle(type) {
    const widgetClass = this.widgetManager.getWidgetClass(type);
    return widgetClass ? widgetClass.title : type;
  }

  removeWidget(widgetId) {
    try {
      // Удаляем из DOM
      const widgetElement = document.getElementById(`widget-${widgetId}`);
      if (widgetElement) {
        widgetElement.remove();
      }

      // Вызываем destroy у экземпляра виджета
      const widgetInstance = this.widgetInstances.get(widgetId);
      if (widgetInstance) {
        if (typeof widgetInstance.destroy === "function") {
          widgetInstance.destroy();
        }
        this.widgetInstances.delete(widgetId);
      }

      // Удаляем из массива конфигураций
      this.widgets = this.widgets.filter((widget) => widget.id !== widgetId);
      this.saveWidgets();

      // this.showNotification("Виджет удален", "info");
    } catch (error) {
      console.error("Failed to remove widget:", error);
      this.showNotification("Ошибка удаления виджета", "error");
    }
  }

  updateWidgetPosition(widgetId, position) {
    const widget = this.widgets.find((w) => w.id === widgetId);
    if (widget) {
      widget.position = position;
      this.saveWidgets();
    }
  }

  updateWidgetSize(widgetId, size) {
    const widget = this.widgets.find((w) => w.id === widgetId);
    if (widget) {
      widget.size = size;
      this.saveWidgets();
    }
  }

  saveWidgets() {
    this.storageService.set("dashboard-widgets", this.widgets);
  }

  applyTheme(themeName) {
    document.documentElement.setAttribute("data-theme", themeName);

    // Обновляем селектор темы если он есть
    const themeSelector = document.getElementById("themeSelector");
    if (themeSelector) {
      themeSelector.value = themeName;
    }
  }

  async retryLoadWidget(widgetId) {
    const widgetConfig = this.widgets.find((w) => w.id === widgetId);
    if (!widgetConfig) {
      console.error(`Widget config not found for retry: ${widgetId}`);
      return;
    }

    // Удаляем старый элемент ошибки
    const oldElement = document.getElementById(`widget-${widgetId}`);
    if (oldElement) {
      oldElement.remove();
    }

    // Пытаемся загрузить заново
    try {
      await this.renderWidget(widgetConfig);
      this.showNotification("Виджет успешно загружен", "success");
    } catch (error) {
      console.error(`Failed to retry loading widget ${widgetId}:`, error);
      this.showNotification("Не удалось загрузить виджет", "error");
    }
  }

  showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <span class="notification-icon">${this.getNotificationIcon(type)}</span>
      <span class="notification-message">${message}</span>
    `;

    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 12px 16px;
      background: ${this.getNotificationColor(type)};
      color: white;
      border-radius: 6px;
      z-index: 10000;
      animation: slideInRight 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
      max-width: 300px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;

    document.body.appendChild(notification);

    // Автоматическое скрытие
    setTimeout(() => {
      notification.style.animation = "slideOutRight 0.3s ease";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 4000);
  }

  getNotificationIcon(type) {
    const icons = {
      success: "✅",
      error: "❌",
      warning: "⚠️",
      info: "ℹ️",
    };
    return icons[type] || "📢";
  }

  getNotificationColor(type) {
    const colors = {
      success: "#48bb78",
      error: "#f56565",
      warning: "#ed8936",
      info: "#4299e1",
    };
    return colors[type] || "#4299e1";
  }

  handleWindowResize() {
    // При изменении размера окна можно пересчитать позиции виджетов
    // или выполнить другие responsive-действия
    console.log("Window resized, dashboard layout might need adjustment");
  }

  showFatalError(error) {
    this.container.innerHTML = `
      <div class="fatal-error">
        <div class="error-icon">💥</div>
        <h2>Ошибка загрузки дашборда</h2>
        <p>${error.message}</p>
        <button class="btn-retry" onclick="window.location.reload()">Перезагрузить</button>
      </div>
    `;
  }

  // Публичные методы для внешнего использования
  getWidgets() {
    return [...this.widgets];
  }

  getWidgetInstance(widgetId) {
    return this.widgetInstances.get(widgetId);
  }

  destroy() {
    // Очистка ресурсов
    this.widgetRenderer.destroy();

    // Очистка всех виджетов
    for (const [widgetId, instance] of this.widgetInstances) {
      if (typeof instance.destroy === "function") {
        instance.destroy();
      }
    }
    this.widgetInstances.clear();

    // Удаление обработчиков событий
    this.container.innerHTML = "";

    console.log("Dashboard destroyed");
  }
}

// Добавляем CSS анимации если их нет
if (!document.querySelector("#dashboard-styles")) {
  const style = document.createElement("style");
  style.id = "dashboard-styles";
  style.textContent = `
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOutRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}
