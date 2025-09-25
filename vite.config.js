import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  base: import.meta.env.PROD ? "/daily-dashboard/" : "/",
});
