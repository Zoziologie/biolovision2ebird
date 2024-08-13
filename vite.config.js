import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue2";
import packageJson from "./package.json";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: "/biolovision2ebird/",
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
    __APP_LICENSE__: JSON.stringify(packageJson.license),
  },
});
