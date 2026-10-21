// Vitest setup: runs before every test file (see vite.config.js `test.setupFiles`).
import "@testing-library/jest-dom/vitest";
import { cleanup, configure } from "@testing-library/react";
import { afterEach } from "vitest";

// findBy*/waitFor default to 1000 ms, which is too short for the lazy view
// chunks on a cold Vitest/Vite cache (fresh CI runner). Keep this below the
// Vitest `testTimeout` in vite.config.js so the assertion error wins the race.
configure({ asyncUtilTimeout: 10000 });

// Recharts' ResponsiveContainer measures its parent with ResizeObserver, which
// jsdom does not implement. A no-op stub lets charts mount; they simply render
// at zero size, which is fine for component tests that assert on text.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub;

// Testing Library only auto-cleans when `afterEach` is a global; with
// `globals: false` we register it explicitly.
afterEach(cleanup);
