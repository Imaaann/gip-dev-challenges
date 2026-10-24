import { defineConfig } from "vitest/config";

// The race tests really take a long time .-.
export default defineConfig({
    test: { testTimeout: 60_000, hookTimeout: 60_000 },
});