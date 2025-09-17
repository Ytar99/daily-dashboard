export class WidgetManager {
  constructor() {
    this.widgetTypes = {};
  }

  registerWidget(type, widgetClass) {
    this.widgetTypes[type] = widgetClass;
  }

  createWidget(type, id) {
    const WidgetClass = this.widgetTypes[type];
    if (!WidgetClass) {
      throw new Error(`Тип виджета ${type} не зарегистрирован`);
    }
    return new WidgetClass(id);
  }

  getAvailableWidgets() {
    return [
      {
        type: "clock",
        name: "Часы",
        description: "Отображает текущее время и дату",
        icon: "⏰",
      },
    ];
  }
}
