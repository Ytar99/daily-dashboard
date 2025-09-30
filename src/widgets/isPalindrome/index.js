import { Widget } from "../../widget";
import templateHtml from "./template.html?raw";

function isPalindrome(str) {
  // Удаляем все не-буквенно-цифровые символы и приводим к нижнему регистру
  const cleanedStr = str.replace(/[^a-zA-Zа-яА-Я0-9]/g, "").toLowerCase();

  // Сравниваем строку с её перевёрнутой версией
  return cleanedStr === cleanedStr.split("").reverse().join("");
}

const templates = {
  id: "{{id}}",
};

export class PalindromeWidget extends Widget {
  static type = "isPalindrome";
  static title = "Проверка на палиндром";
  static description = "Проверяет является ли введенная строка палиндромом";
  static icon = "🔎";

  constructor(id) {
    super(id);
    this.loadState();
  }

  render() {
    return templateHtml.trim().replaceAll(templates.id, this.id);
  }

  init() {
    const checkBtn = document.getElementById(`check-${this.id}`);
    checkBtn.addEventListener("click", () => this.checkPalindrome());
  }

  checkPalindrome() {
    const input = document.getElementById(`input-${this.id}`);
    const result = document.getElementById(`result-${this.id}`);
    const inputValue = input.value.trim();

    if (!inputValue) {
      result.textContent = "Введите текст для проверки.";
      result.style.color = undefined;
      result.style.marginTop = "12px";
      result.style.backgroundColor = undefined;
      result.style.borderRadius = undefined;
      return;
    }

    if (isPalindrome(inputValue)) {
      result.textContent = "Это палиндром!";
      result.style.backgroundColor = "#4CAF50";
      result.style.borderRadius = "2px";
      result.style.color = "white";
      result.style.marginTop = "12px";
    } else {
      result.textContent = "Это не палиндром.";
      result.style.backgroundColor = "#f44336";
      result.style.borderRadius = "2px";
      result.style.color = "white";
      result.style.marginTop = "12px";
    }
  }

  destroy() {}
}
