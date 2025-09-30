import { Widget } from "../../widget";
import templateHtml from "./template.html?raw";

export class ExampleWidget extends Widget {
  static type = "example";
  static title = "Пример";
  static description = "Простой пример виджета";
  static icon = "📦";

  constructor(id) {
    // это нужно для того, чтобы сохранять состояние виджета в памяти браузера
    super(id);
    this.loadState();
  }

  render() {
    btn.abc();
    return templateHtml.trim();
  }

  init() {
    // Тут чота, когда виджет создаётся
    console.log("Виджет появился");
    const btn = document.querySelector("#hello-btn");
    btn.addEventListener("click", () => {
      const name = prompt("Как тебя зовут?");
      alert("Привет, " + name);
    });
  }

  destroy() {
    // Тут чота, когда виджет удаляется
    console.log("Виджет удалился");
  }
}
