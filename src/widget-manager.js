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
        type: "example",
        name: "Пример",
        description: "Простой пример виджета",
        icon: "📦",
      },
      {
        type: "clock",
        name: "Часы",
        description: "Отображает текущее время и дату",
        icon: "⏰",
      },
      {
        type: "isPalindrome",
        name: "Проверка на палиндром",
        description: "Проверяет, является ли строка палиндромом",
        icon: "🔎",
      },
    ];
  }
}
