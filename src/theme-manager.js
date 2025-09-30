export class ThemeManager {
  constructor(storageService) {
    this.storageService = storageService;
    // Используем новый метод для получения строки
    this.currentTheme = this.storageService.getString("dashboard-theme", "light");
  }

  changeTheme(themeName) {
    this.currentTheme = themeName;
    this.applyTheme(themeName);
    this.storageService.set("dashboard-theme", themeName);
  }

  applyTheme(themeName) {
    document.documentElement.setAttribute("data-theme", themeName);
  }

  applySavedTheme() {
    this.applyTheme(this.currentTheme);
  }

  getCurrentTheme() {
    return this.currentTheme;
  }
}
