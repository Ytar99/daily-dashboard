import { WidgetManager } from "./widget-manager";
import { ClockWidget } from "./widgets/clock";
import { PalindromeWidget } from "./widgets/isPalindrome";
import { ExampleWidget } from "./widgets/example";

export class Dashboard {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.widgetManager = new WidgetManager();
    this.widgets = JSON.parse(localStorage.getItem("dashboard-widgets")) || [];
    this.widgetInstances = {}; // Хранилище экземпляров виджетов
    this.theme = localStorage.getItem("dashboard-theme") || "light";

    this.widgetManager.registerWidget("example", ExampleWidget);
    this.widgetManager.registerWidget("clock", ClockWidget);
    this.widgetManager.registerWidget("isPalindrome", PalindromeWidget);
  }

  init() {
    this.render();
    this.loadWidgets();
    this.applyTheme(this.theme);
  }

  render() {
    this.container.innerHTML = this.getTemplate();
    this.bindEvents();
  }

  getTemplate() {
    return `
      <div class="dashboard">
        <header class="dashboard-header">
          <h1>Daily Dashboard</h1>
          <div class="header-controls">
            <select class="theme-selector" id="themeSelector">
              <option value="light">Светлая</option>
              <option value="dark">Темная</option>
              <option value="blue">Синяя</option>
              <option value="green">Зеленая</option>
            </select>
            <button class="add-widget-btn" id="addWidgetBtn">
              <span>+</span> Добавить виджет
            </button>
          </div>
        </header>
        <div class="widgets-container" id="widgetsContainer"></div>
        
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

  bindEvents() {
    // Кнопка добавления виджета
    document.getElementById("addWidgetBtn").addEventListener("click", () => {
      this.openWidgetModal();
    });

    // Закрытие модального окна
    document.querySelector(".close").addEventListener("click", () => {
      this.closeWidgetModal();
    });

    // Закрытие модального окна при клике вне его
    window.addEventListener("click", (event) => {
      if (event.target.id === "widgetModal") {
        this.closeWidgetModal();
      }
    });

    // Выбор темы
    document.getElementById("themeSelector").addEventListener("change", (e) => {
      this.changeTheme(e.target.value);
    });

    // Устанавливаем выбранную тему в селекторе
    document.getElementById("themeSelector").value = this.theme;
  }

  changeTheme(themeName) {
    this.theme = themeName;
    this.applyTheme(themeName);
    localStorage.setItem("dashboard-theme", themeName);
  }

  applyTheme(themeName) {
    document.documentElement.setAttribute("data-theme", themeName);
  }

  openWidgetModal() {
    const modal = document.getElementById("widgetModal");
    modal.style.display = "block";
    this.renderWidgetsList();
  }

  closeWidgetModal() {
    const modal = document.getElementById("widgetModal");
    modal.style.display = "none";
  }

  renderWidgetsList() {
    const widgetsList = document.getElementById("widgetsList");
    const availableWidgets = this.widgetManager.getAvailableWidgets();

    widgetsList.innerHTML = availableWidgets
      .map(
        (widget) => `
      <div class="widget-item" data-type="${widget.type}">
        <div class="widget-icon">${widget.icon}</div>
        <h3>${widget.name}</h3>
        <p>${widget.description}</p>
      </div>
    `
      )
      .join("");

    // Добавляем обработчики выбора виджетов
    document.querySelectorAll(".widget-item").forEach((item) => {
      item.addEventListener("click", () => {
        const type = item.dataset.type;
        this.addWidget(type);
        this.closeWidgetModal();
      });
    });
  }

  addWidget(type) {
    const widgetConfig = {
      id: Date.now().toString(),
      type,
      position: { x: 100, y: 100 },
      size: { width: 300, height: 200 },
    };

    this.widgets.push(widgetConfig);
    this.saveWidgets();
    this.renderWidget(widgetConfig);
  }

  renderWidget(config) {
    const widgetsContainer = document.getElementById("widgetsContainer");
    const widgetElement = document.createElement("div");
    widgetElement.className = "widget";
    widgetElement.id = `widget-${config.id}`;
    widgetElement.style.width = `${config.size.width}px`;
    widgetElement.style.height = `${config.size.height}px`;
    widgetElement.style.left = `${config.position.x}px`;
    widgetElement.style.top = `${config.position.y}px`;

    // Получаем экземпляр виджета и рендерим его
    const widgetInstance = this.widgetManager.createWidget(config.type, config.id);
    widgetElement.innerHTML = widgetInstance.render();

    widgetsContainer.appendChild(widgetElement);

    // Сохраняем экземпляр виджета
    this.widgetInstances[config.id] = widgetInstance;

    // Инициализируем виджет
    widgetInstance.init();

    // Добавляем обработчик для кнопки удаления
    const removeBtn = widgetElement.querySelector('[data-action="remove"]');
    if (removeBtn) {
      removeBtn.addEventListener("click", () => this.removeWidget(config.id));
    }

    // Делаем виджет перетаскиваемым (только за заголовок) и изменяемым
    this.makeWidgetDraggable(widgetElement, config.id);
    this.makeWidgetResizable(widgetElement, config.id);
  }

  removeWidget(widgetId) {
    // Удаляем виджет из DOM
    const widgetElement = document.getElementById(`widget-${widgetId}`);
    if (widgetElement) {
      widgetElement.remove();
    }

    // Вызываем метод destroy у экземпляра виджета
    const widgetInstance = this.widgetInstances[widgetId];
    if (widgetInstance && typeof widgetInstance.destroy === "function") {
      widgetInstance.destroy();
    }

    // Удаляем виджет из хранилища экземпляров
    delete this.widgetInstances[widgetId];

    // Удаляем виджет из массива конфигураций
    this.widgets = this.widgets.filter((widget) => widget.id !== widgetId);

    // Сохраняем изменения
    this.saveWidgets();
  }

  loadWidgets() {
    this.widgets.forEach((widgetConfig) => {
      this.renderWidget(widgetConfig);
    });
  }

  makeWidgetDraggable(element, widgetId) {
    // Находим заголовок виджета
    const header = element.querySelector(".widget-header");
    if (!header) return;

    // Добавляем курсор перемещения к заголовку
    header.style.cursor = "move";

    let pos1 = 0,
      pos2 = 0,
      pos3 = 0,
      pos4 = 0;
    const container = document.getElementById("widgetsContainer");
    const containerRect = container.getBoundingClientRect();

    const dragMouseDown = (e) => {
      e.preventDefault();
      // Получаем позицию курсора при нажатии
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.addEventListener("mouseup", closeDragElement);
      document.addEventListener("mousemove", elementDrag);
    };

    const elementDrag = (e) => {
      e.preventDefault();
      // Вычисляем новую позицию
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;

      // Вычисляем новые координаты
      let newTop = element.offsetTop - pos2;
      let newLeft = element.offsetLeft - pos1;

      // Ограничиваем перемещение в пределах контейнера
      const elementRect = element.getBoundingClientRect();
      const maxTop = containerRect.height - elementRect.height;
      const maxLeft = containerRect.width - elementRect.width;

      newTop = Math.max(0, Math.min(newTop, maxTop));
      newLeft = Math.max(0, Math.min(newLeft, maxLeft));

      // Устанавливаем новую позицию
      element.style.top = newTop + "px";
      element.style.left = newLeft + "px";
    };

    const closeDragElement = () => {
      // Удаляем обработчики событий
      document.removeEventListener("mouseup", closeDragElement);
      document.removeEventListener("mousemove", elementDrag);

      // Сохраняем новую позицию
      this.updateWidgetPosition(widgetId, {
        x: parseInt(element.style.left) || 0,
        y: parseInt(element.style.top) || 0,
      });
    };

    header.addEventListener("mousedown", dragMouseDown);
  }

  makeWidgetResizable(element, widgetId) {
    const handle = document.createElement("div");
    handle.className = "resize-handle";
    element.appendChild(handle);

    let startX, startY, startWidth, startHeight;
    const container = document.getElementById("widgetsContainer");
    const containerRect = container.getBoundingClientRect();

    // Объявляем функции заранее, чтобы избежать ошибок области видимости
    const initResize = (e) => {
      e.preventDefault();
      startX = e.clientX;
      startY = e.clientY;
      startWidth = parseInt(document.defaultView.getComputedStyle(element).width, 10);
      startHeight = parseInt(document.defaultView.getComputedStyle(element).height, 10);

      document.addEventListener("mousemove", resize);
      document.addEventListener("mouseup", stopResize);
    };

    const resize = (e) => {
      const width = startWidth + (e.clientX - startX);
      const height = startHeight + (e.clientY - startY);

      // Ограничиваем размер виджета пределами контейнера
      const elementRect = element.getBoundingClientRect();
      const maxWidth = containerRect.width - element.offsetLeft;
      const maxHeight = containerRect.height - element.offsetTop;

      // Устанавливаем новый размер с ограничениями
      element.style.width = `${Math.max(100, Math.min(width, maxWidth))}px`;
      element.style.height = `${Math.max(100, Math.min(height, maxHeight))}px`;
    };

    const stopResize = () => {
      document.removeEventListener("mousemove", resize);
      document.removeEventListener("mouseup", stopResize);

      // Сохраняем новый размер
      this.updateWidgetSize(widgetId, {
        width: parseInt(element.style.width),
        height: parseInt(element.style.height),
      });
    };

    handle.addEventListener("mousedown", initResize);
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
    localStorage.setItem("dashboard-widgets", JSON.stringify(this.widgets));
  }
}
