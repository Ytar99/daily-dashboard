import { StorageService } from "./services/storage-service";
import { WidgetManager } from "./widget-manager";
import { ClockWidget } from "./widgets/clock";
import { ExampleWidget } from "./widgets/example";
import { PalindromeWidget } from "./widgets/isPalindrome";

export const DEFAULT_CONFIG = {
  widgetManager: new WidgetManager(),
  storageService: StorageService,
  themes: ["light", "dark", "blue", "green"],
  defaultTheme: "light",
  widgetDefaults: {
    position: { x: 100, y: 100 },
    size: { width: 300, height: 200 },
  },
};

export const WIDGET_REGISTRY = [ExampleWidget, ClockWidget, PalindromeWidget];
