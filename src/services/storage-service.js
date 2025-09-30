export class StorageService {
  static get(key) {
    try {
      const item = localStorage.getItem(key);

      // Если значение null или undefined, возвращаем null
      if (item === null || item === undefined) {
        return null;
      }

      // Пытаемся разобрать как JSON
      try {
        return JSON.parse(item);
      } catch (parseError) {
        // Если не удалось разобрать как JSON, возвращаем исходную строку
        return item;
      }
    } catch (error) {
      console.error(`Error getting ${key}:`, error);
      return null;
    }
  }

  static set(key, value) {
    try {
      // Определяем тип значения для оптимального сохранения
      const type = typeof value;

      if (value === null || value === undefined) {
        localStorage.removeItem(key);
      } else if (type === "string" || type === "number" || type === "boolean") {
        // Для примитивов сохраняем как есть (без JSON.stringify)
        localStorage.setItem(key, value.toString());
      } else {
        // Для объектов и массивов используем JSON.stringify
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
    }
  }

  static remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
    }
  }

  static clear() {
    try {
      localStorage.clear();
    } catch (error) {
      console.error("Error clearing storage:", error);
    }
  }

  // Дополнительные методы для работы с разными типами данных
  static getString(key, defaultValue = "") {
    const value = this.get(key);
    return typeof value === "string" ? value : defaultValue;
  }

  static getNumber(key, defaultValue = 0) {
    const value = this.get(key);
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  }

  static getBoolean(key, defaultValue = false) {
    const value = this.get(key);
    return typeof value === "boolean" ? value : defaultValue;
  }

  static getObject(key, defaultValue = {}) {
    const value = this.get(key);
    return value && typeof value === "object" ? value : defaultValue;
  }

  static getArray(key, defaultValue = []) {
    const value = this.get(key);
    return Array.isArray(value) ? value : defaultValue;
  }

  // Метод для миграции старых данных
  static migrateKey(oldKey, newKey, transformer = null) {
    try {
      const oldValue = localStorage.getItem(oldKey);
      if (oldValue !== null) {
        let newValue = oldValue;

        // Пытаемся разобрать как JSON, если это возможно
        try {
          newValue = JSON.parse(oldValue);
        } catch (e) {
          // Оставляем как строку
        }

        // Применяем трансформатор если предоставлен
        if (transformer) {
          newValue = transformer(newValue);
        }

        this.set(newKey, newValue);
        localStorage.removeItem(oldKey);
        console.log(`Migrated ${oldKey} to ${newKey}`);
      }
    } catch (error) {
      console.error(`Error migrating ${oldKey} to ${newKey}:`, error);
    }
  }
}
