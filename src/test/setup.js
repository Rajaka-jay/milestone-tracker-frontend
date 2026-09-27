import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
  localStorage.clear();
});

// jsdom does not implement these browser APIs used by charts and layout.
globalThis.ResizeObserver = globalThis.ResizeObserver || class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
window.matchMedia = window.matchMedia || ((query) => ({
  matches: false, media: query, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {},
}));
