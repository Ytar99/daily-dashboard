// interactions/resizable.js
export class Resizable {
  constructor(element, options = {}) {
    this.element = element;
    this.handle = options.handle;
    this.containment = options.containment;
    this.minWidth = options.minWidth || 50;
    this.minHeight = options.minHeight || 50;
    this.onResizeStart = options.onResizeStart;
    this.onResize = options.onResize;
    this.onResizeEnd = options.onResizeEnd;

    this.isResizing = false;
    this.startX = 0;
    this.startY = 0;
    this.startWidth = 0;
    this.startHeight = 0;

    this.bindEvents();
  }

  bindEvents() {
    this.handle.addEventListener("mousedown", this.handleMouseDown);
    this.handle.style.cursor = "nwse-resize";
    this.handle.classList.add("resize-handle");
  }

  handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();

    this.isResizing = true;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.startWidth = parseInt(document.defaultView.getComputedStyle(this.element).width, 10);
    this.startHeight = parseInt(document.defaultView.getComputedStyle(this.element).height, 10);

    document.addEventListener("mousemove", this.handleMouseMove);
    document.addEventListener("mouseup", this.handleMouseUp);

    if (typeof this.onResizeStart === "function") {
      this.onResizeStart();
    }
  };

  handleMouseMove = (e) => {
    if (!this.isResizing) return;

    const deltaX = e.clientX - this.startX;
    const deltaY = e.clientY - this.startY;

    let newWidth = this.startWidth + deltaX;
    let newHeight = this.startHeight + deltaY;

    // Ограничение минимального размера
    newWidth = Math.max(this.minWidth, newWidth);
    newHeight = Math.max(this.minHeight, newHeight);

    // Ограничение размера в пределах контейнера
    if (this.containment) {
      const containerRect = this.containment.getBoundingClientRect();
      const elementRect = this.element.getBoundingClientRect();

      const maxWidth = containerRect.right - elementRect.left;
      const maxHeight = containerRect.bottom - elementRect.top;

      newWidth = Math.min(newWidth, maxWidth);
      newHeight = Math.min(newHeight, maxHeight);
    }

    const size = {
      width: newWidth,
      height: newHeight,
    };

    if (typeof this.onResize === "function") {
      this.onResize(size);
    }
  };

  handleMouseUp = () => {
    if (!this.isResizing) return;

    this.isResizing = false;
    document.removeEventListener("mousemove", this.handleMouseMove);
    document.removeEventListener("mouseup", this.handleMouseUp);

    const computedStyle = document.defaultView.getComputedStyle(this.element);
    const size = {
      width: parseInt(computedStyle.width, 10),
      height: parseInt(computedStyle.height, 10),
    };

    if (typeof this.onResizeEnd === "function") {
      this.onResizeEnd(size);
    }
  };

  destroy() {
    this.handle.removeEventListener("mousedown", this.handleMouseDown);
    document.removeEventListener("mousemove", this.handleMouseMove);
    document.removeEventListener("mouseup", this.handleMouseUp);

    this.handle.style.cursor = "";
    this.handle.classList.remove("resize-handle");
  }
}
