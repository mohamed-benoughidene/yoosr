import "@testing-library/jest-dom/vitest";

// Mock IntersectionObserver for components that use scroll-based loading
class MockIntersectionObserver {
  observe = () => {};
  unobserve = () => {};
  disconnect = () => {};
}

Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

globalThis.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
