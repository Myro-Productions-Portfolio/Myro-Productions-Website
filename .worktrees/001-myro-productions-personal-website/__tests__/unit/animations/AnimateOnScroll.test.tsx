import React from 'react'
import { render } from '@testing-library/react'
import AnimateOnScroll from '@/components/animations/AnimateOnScroll'

// Mock GSAP and ScrollTrigger
jest.mock('gsap', () => ({
  gsap: {
    registerPlugin: jest.fn(),
    fromTo: jest.fn(() => ({
      play: jest.fn(),
      pause: jest.fn(),
      reverse: jest.fn(),
      kill: jest.fn(),
    })),
    to: jest.fn(() => ({
      play: jest.fn(),
      pause: jest.fn(),
      reverse: jest.fn(),
      kill: jest.fn(),
    })),
    set: jest.fn(),
    timeline: jest.fn(() => ({
      add: jest.fn(),
      play: jest.fn(),
      pause: jest.fn(),
      reverse: jest.fn(),
      kill: jest.fn(),
    })),
  },
  ScrollTrigger: {
    create: jest.fn(),
    getAll: jest.fn(() => []),
  },
}))

jest.mock('@gsap/react', () => ({
  useGSAP: jest.fn((callback) => {
    // Execute callback immediately for testing
    callback()
  }),
}))

jest.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: {
    create: jest.fn(),
    getAll: jest.fn(() => []),
  },
}))

describe('AnimateOnScroll', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders children correctly', () => {
    const { getByText } = render(
      <AnimateOnScroll>
        <div>Test Content</div>
      </AnimateOnScroll>
    )

    expect(getByText('Test Content')).toBeInTheDocument()
  })

  it('renders with custom className', () => {
    const { container } = render(
      <AnimateOnScroll className="custom-class">
        <div>Test Content</div>
      </AnimateOnScroll>
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('custom-class')
  })

  it('supports single-element mode (default)', () => {
    const { container } = render(
      <AnimateOnScroll direction="up">
        <div>Test Content</div>
      </AnimateOnScroll>
    )

    expect(container.firstChild).toBeInTheDocument()
  })

  it('supports stagger mode when stagger prop is provided', () => {
    const { container } = render(
      <AnimateOnScroll direction="up" stagger={0.1}>
        <div>Child 1</div>
        <div>Child 2</div>
        <div>Child 3</div>
      </AnimateOnScroll>
    )

    expect(container.firstChild).toBeInTheDocument()
  })

  it('supports all animation directions', () => {
    const directions: Array<'up' | 'down' | 'left' | 'right' | 'scale' | 'none'> = [
      'up',
      'down',
      'left',
      'right',
      'scale',
      'none',
    ]

    directions.forEach((direction) => {
      const { getByText } = render(
        <AnimateOnScroll direction={direction}>
          <div>{direction}</div>
        </AnimateOnScroll>
      )

      expect(getByText(direction)).toBeInTheDocument()
    })
  })

  it('supports onMount trigger mode', () => {
    const { getByText } = render(
      <AnimateOnScroll trigger="onMount">
        <div>Test Content</div>
      </AnimateOnScroll>
    )

    expect(getByText('Test Content')).toBeInTheDocument()
  })

  it('supports onScroll trigger mode', () => {
    const { getByText } = render(
      <AnimateOnScroll trigger="onScroll">
        <div>Test Content</div>
      </AnimateOnScroll>
    )

    expect(getByText('Test Content')).toBeInTheDocument()
  })
})
