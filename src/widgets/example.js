import { Widget } from "../widget";

export class ExampleWidget extends Widget {
  constructor(id) {
    // это нужно для того, чтобы сохранять состояние виджета в памяти браузера
    super(id);
    this.loadState();
  }

  render() {
    return `
      <div>
        <p>Я тестовый виджет</p>
        <button data-action="remove">Закрыть</button>
        <button id="hello-btn">Привет!</button>
      </div>
    `;
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
