// interactions/draggable.js
export class Draggable {
  constructor(element, options = {}) {
    this.element = element;
    this.handle = options.handle || element;
    this.containment = options.containment;
    this.onDragStart = options.onDragStart;
    this.onDrag = options.onDrag;
    this.onDragEnd = options.onDragEnd;

    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    this.startLeft = 0;
    this.startTop = 0;

    this.bindEvents();
  }

  bindEvents() {
    this.handle.addEventListener("mousedown", this.handleMouseDown);
    this.handle.style.cursor = "move";
    this.handle.setAttribute("draggable", "true");
  }

  handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();

    this.isDragging = true;
    this.startX = e.clientX;
    this.startY = e.clientY;

    const rect = this.element.getBoundingClientRect();
    this.startLeft = rect.left;
    this.startTop = rect.top;

    document.addEventListener("mousemove", this.handleMouseMove);
    document.addEventListener("mouseup", this.handleMouseUp);

    if (typeof this.onDragStart === "function") {
      this.onDragStart();
    }
  };

  handleMouseMove = (e) => {
    if (!this.isDragging) return;

    const deltaX = e.clientX - this.startX;
    const deltaY = e.clientY - this.startY;

    let newLeft = this.startLeft + deltaX;
    let newTop = this.startTop + deltaY;

    // Ограничение перемещения в пределах контейнера
    if (this.containment) {
      const containerRect = this.containment.getBoundingClientRect();
      const elementRect = this.element.getBoundingClientRect();

      newLeft = Math.max(containerRect.left, Math.min(newLeft, containerRect.right - elementRect.width));
      newTop = Math.max(containerRect.top, Math.min(newTop, containerRect.bottom - elementRect.height));
    }

    const position = {
      x: newLeft - (this.containment ? this.containment.getBoundingClientRect().left : 0),
      y: newTop - (this.containment ? this.containment.getBoundingClientRect().top : 0),
    };

    if (typeof this.onDrag === "function") {
      this.onDrag(position);
    }
  };

  handleMouseUp = () => {
    if (!this.isDragging) return;

    this.isDragging = false;
    document.removeEventListener("mousemove", this.handleMouseMove);
    document.removeEventListener("mouseup", this.handleMouseUp);

    const rect = this.element.getBoundingClientRect();
    const containerRect = this.containment ? this.containment.getBoundingClientRect() : { left: 0, top: 0 };

    const position = {
      x: rect.left - containerRect.left,
      y: rect.top - containerRect.top,
    };

    if (typeof this.onDragEnd === "function") {
      this.onDragEnd(position);
    }
  };

  destroy() {
    this.handle.removeEventListener("mousedown", this.handleMouseDown);
    document.removeEventListener("mousemove", this.handleMouseMove);
    document.removeEventListener("mouseup", this.handleMouseUp);

    this.handle.style.cursor = "";
    this.handle.removeAttribute("draggable");
  }
}
