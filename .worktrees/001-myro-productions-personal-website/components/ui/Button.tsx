'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  href?: string
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'primary', size = 'md', className = '', href, onClick, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-carbon disabled:opacity-50 disabled:cursor-not-allowed'

    const variantStyles = {
      primary: 'bg-accent text-carbon hover:bg-accent-light focus:ring-accent shadow-lg hover:shadow-xl hover:scale-105',
      secondary: 'bg-transparent border-2 border-accent text-accent hover:bg-accent hover:text-carbon focus:ring-accent',
      ghost: 'bg-transparent text-current hover:bg-carbon-light focus:ring-accent',
      outline: 'bg-transparent border border-current text-current hover:bg-carbon-light focus:ring-accent'
    }

    const sizeStyles = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg'
    }

    const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (href) {
        e.preventDefault()
        const element = document.querySelector(href)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }
      onClick?.(e)
    }

    return (
      <button
        ref={ref}
        className={combinedClassName}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
export default Button
