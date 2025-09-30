import { Draggable } from "./interactions/draggable.js";
import { Resizable } from "./interactions/resizable.js";

export class WidgetRenderer {
  constructor() {
    this.draggableInstances = new Map();
    this.resizableInstances = new Map();
  }

  createWidgetElement(config, widgetInstance) {
    const widgetElement = document.createElement("div");
    widgetElement.className = "widget";
    widgetElement.id = `widget-${config.id}`;
    widgetElement.setAttribute("data-widget-id", config.id);

    Object.assign(widgetElement.style, {
      width: `${config.size.width}px`,
      height: `${config.size.height}px`,
      left: `${config.position.x}px`,
      top: `${config.position.y}px`,
      position: "absolute",
    });

    try {
      widgetElement.innerHTML = widgetInstance.render();
    } catch (error) {
      console.error(`Failed to render widget ${config.id}:`, error);
      widgetElement.innerHTML = this.getErrorTemplate("Ошибка отрисовки виджета");

      this.makeWidgetInteractive(widgetElement, config.id);

      widgetElement.classList.add("widget-error");
    }

    return widgetElement;
  }

  makeWidgetInteractive(element, widgetId, callbacks = {}) {
    this.makeWidgetDraggable(element, widgetId, callbacks.onPositionUpdate);
    this.makeWidgetResizable(element, widgetId, callbacks.onSizeUpdate);
    this.addRemoveHandler(element, widgetId, callbacks.onRemove);
  }

  makeWidgetDraggable(element, widgetId, onPositionUpdate) {
    const draggableElement = element.querySelector("[data-draggable]");
    if (!draggableElement) {
      console.warn(`No draggable element found for widget ${widgetId}`);
      return;
    }

    // Удаляем предыдущий экземпляр, если существует
    if (this.draggableInstances.has(widgetId)) {
      this.draggableInstances.get(widgetId).destroy();
    }

    const draggable = new Draggable(element, {
      handle: draggableElement,
      containment: document.getElementById("widgetsContainer"),
      onDragStart: () => {
        element.classList.add("dragging");
      },
      onDrag: (position) => {
        this.updateElementPosition(element, position);
      },
      onDragEnd: (position) => {
        element.classList.remove("dragging");
        if (typeof onPositionUpdate === "function") {
          onPositionUpdate(position);
        }
      },
    });

    this.draggableInstances.set(widgetId, draggable);
  }

  makeWidgetResizable(element, widgetId, onSizeUpdate) {
    // Создаем handle для изменения размера, если его нет
    let handle = element.querySelector(".resize-handle");
    if (!handle) {
      handle = document.createElement("div");
      handle.className = "resize-handle";
      element.appendChild(handle);
    }

    // Удаляем предыдущий экземпляр, если существует
    if (this.resizableInstances.has(widgetId)) {
      this.resizableInstances.get(widgetId).destroy();
    }

    const resizable = new Resizable(element, {
      handle: handle,
      minWidth: 100,
      minHeight: 80,
      containment: document.getElementById("widgetsContainer"),
      onResizeStart: () => {
        element.classList.add("resizing");
      },
      onResize: (size) => {
        this.updateElementSize(element, size);
      },
      onResizeEnd: (size) => {
        element.classList.remove("resizing");
        if (typeof onSizeUpdate === "function") {
          onSizeUpdate(size);
        }
      },
    });

    this.resizableInstances.set(widgetId, resizable);
  }

  addRemoveHandler(element, widgetId, onRemove) {
    const removeBtn = element.querySelector('[data-action="remove"]');
    if (!removeBtn) {
      console.warn(`No remove button found for widget ${widgetId}`);
      return;
    }

    const handleRemove = (e) => {
      e.preventDefault();

      if (typeof onRemove === "function") {
        onRemove(widgetId);
      } else {
        // Fallback: просто удаляем элемент
        element.remove();
        this.cleanupWidget(widgetId);
      }
    };

    removeBtn.addEventListener("click", handleRemove);

    // Сохраняем ссылку на обработчик для последующей очистки
    element._removeHandler = handleRemove;
  }

  updateElementPosition(element, position) {
    element.style.left = `${position.x}px`;
    element.style.top = `${position.y}px`;
  }

  updateElementSize(element, size) {
    element.style.width = `${size.width}px`;
    element.style.height = `${size.height}px`;
  }

  getErrorTemplate(message) {
    return `
      <div class="widget-header" data-draggable>
        <h3>Ошибка</h3>
        <button class="widget-btn" data-action="remove">✕</button>
      </div>
      <div class="widget-content">
        <div class="error-message">
          <p><span class="error-icon">⚠️</span>${message}</p>
        </div>
      </div>
    `;
  }

  updateWidgetElement(widgetId, config) {
    const element = document.getElementById(`widget-${widgetId}`);
    if (!element) return;

    this.updateElementPosition(element, config.position);
    this.updateElementSize(element, config.size);
  }

  cleanupWidget(widgetId) {
    // Очищаем интерактивные экземпляры
    if (this.draggableInstances.has(widgetId)) {
      this.draggableInstances.get(widgetId).destroy();
      this.draggableInstances.delete(widgetId);
    }

    if (this.resizableInstances.has(widgetId)) {
      this.resizableInstances.get(widgetId).destroy();
      this.resizableInstances.delete(widgetId);
    }

    // Очищаем обработчики событий
    const element = document.getElementById(`widget-${widgetId}`);
    if (element && element._removeHandler) {
      const removeBtn = element.querySelector('[data-action="remove"]');
      if (removeBtn) {
        removeBtn.removeEventListener("click", element._removeHandler);
      }
      delete element._removeHandler;
    }
  }

  destroy() {
    // Очищаем все экземпляры
    for (const [widgetId, draggable] of this.draggableInstances) {
      draggable.destroy();
    }
    for (const [widgetId, resizable] of this.resizableInstances) {
      resizable.destroy();
    }

    this.draggableInstances.clear();
    this.resizableInstances.clear();
  }
}
