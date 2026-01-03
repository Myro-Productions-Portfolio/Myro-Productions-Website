interface IconProps {
  className?: string
}

export default function RocketIcon({ className = "w-12 h-12" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 2C12 2 8 4 8 10C8 13 6 14 4 15C4 15 4 17 6 17C6 17 7 21 12 21C17 21 18 17 18 17C20 17 20 15 20 15C18 14 16 13 16 10C16 4 12 2 12 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 11C12.5523 11 13 10.5523 13 10C13 9.44772 12.5523 9 12 9C11.4477 9 11 9.44772 11 10C11 10.5523 11.4477 11 12 11Z"
        fill="currentColor"
      />
      <path
        d="M7 21L5 23M17 21L19 23"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
