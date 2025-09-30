export class WidgetManager {
  constructor() {
    this.widgetTypes = {};
  }

  registerWidget(widgetClass) {
    this.widgetTypes[widgetClass.type] = widgetClass;
  }

  createWidget(type, id) {
    const WidgetClass = this.widgetTypes[type];
    if (!WidgetClass) {
      throw new Error(`Тип виджета ${type} не зарегистрирован`);
    }
    return new WidgetClass(id);
  }

  getWidgetClass(type) {
    return this.widgetTypes[type];
  }

  getAvailableWidgets() {
    return Object.values(this.widgetTypes).map(({ type = "", title = "", description = "", icon = "" }) => ({
      type,
      title,
      description,
      icon,
    }));
  }
}
