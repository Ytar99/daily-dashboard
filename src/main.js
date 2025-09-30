import { Dashboard } from "./dashboard";

window.addEventListener("DOMContentLoaded", async () => {
  try {
    const dashboard = new Dashboard("app");
    await dashboard.init();

    // Для отладки
    window.dashboard = dashboard;
  } catch (error) {
    console.error("Failed to initialize dashboard:", error);
    document.getElementById("app").innerHTML = `
      <div class="error-container">
        <h2>Application Error</h2>
        <p>${error.message}</p>
      </div>
    `;
  }
});
