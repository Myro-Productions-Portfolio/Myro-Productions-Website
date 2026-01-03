import '@testing-library/jest-dom'

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(
    public callback: IntersectionObserverCallback,
    public options?: IntersectionObserverInit
  ) {}

  observe() {
    return null
  }

  disconnect() {
    return null
  }

  unobserve() {
    return null
  }

  takeRecords(): IntersectionObserverEntry[] {
    return []
  }

  get root() {
    return null
  }

  get rootMargin() {
    return ''
  }

  get thresholds() {
    return []
  }
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn()

// Mock GSAP with proper tween return values
jest.mock('gsap', () => {
  const createMockTween = (vars = {}) => {
    const tween = {
      vars: { ...vars },
      kill: jest.fn(function (this: any) {
        return this
      }),
      play: jest.fn(function (this: any) {
        return this
      }),
      pause: jest.fn(function (this: any) {
        return this
      }),
      resume: jest.fn(function (this: any) {
        return this
      }),
      restart: jest.fn(function (this: any) {
        return this
      }),
      reverse: jest.fn(function (this: any) {
        return this
      }),
      seek: jest.fn(function (this: any) {
        return this
      }),
      progress: jest.fn(function (this: any) {
        return this
      }),
      timeScale: jest.fn(function (this: any) {
        return this
      }),
      invalidate: jest.fn(function (this: any) {
        return this
      }),
      isActive: jest.fn(() => false),
      then: jest.fn(),
    }
    return tween
  }

  const mockGsap = {
    registerPlugin: jest.fn(),
    context: jest.fn((fn) => {
      fn()
      return { revert: jest.fn() }
    }),
    to: jest.fn((target, vars) => createMockTween(vars)),
    from: jest.fn((target, vars) => createMockTween(vars)),
    fromTo: jest.fn((target, fromVars, toVars) => createMockTween(toVars)),
    set: jest.fn(),
    killTweensOf: jest.fn(),
    timeline: jest.fn(() => ({
      to: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      fromTo: jest.fn().mockReturnThis(),
      add: jest.fn().mockReturnThis(),
      kill: jest.fn(),
      play: jest.fn(),
      pause: jest.fn(),
    })),
  }

  return {
    __esModule: true,
    default: mockGsap, // Support default import
    gsap: mockGsap, // Support named import
    ScrollTrigger: {
      create: jest.fn(),
      refresh: jest.fn(),
      update: jest.fn(),
      getAll: jest.fn(() => []),
    },
  }
})

jest.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: {
    create: jest.fn(),
    refresh: jest.fn(),
    update: jest.fn(),
    getAll: jest.fn(() => []),
  },
}))

jest.mock('@gsap/react', () => ({
  useGSAP: jest.fn((fn) => {
    // Execute the GSAP context function immediately in tests
    if (typeof fn === 'function') {
      fn()
    }
  }),
}))

// Mock motion/react
jest.mock('motion/react', () => ({
  motion: {
    div: 'div',
    a: 'a',
    article: 'article',
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}))
