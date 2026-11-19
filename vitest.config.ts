import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    css: false,
    pool: "threads",
    maxWorkers: 2,
    include: [
      "lib/**/*.{test,spec}.{ts,tsx}",
      "types/**/*.{test,spec}.{ts,tsx}",
      "hooks/**/*.{test,spec}.{ts,tsx}",
      "components/**/*.{test,spec}.{ts,tsx}",
      "app/**/*.{test,spec}.{ts,tsx}",
      "proxy.test.ts",
    ],
    exclude: ["node_modules", ".next", "dist"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
