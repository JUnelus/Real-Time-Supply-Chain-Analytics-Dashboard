// Vitest setup: runs before every test file (see vite.config.js `test.setupFiles`).
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

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
