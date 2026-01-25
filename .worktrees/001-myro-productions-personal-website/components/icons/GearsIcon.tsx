interface IconProps {
  className?: string
}

export default function GearsIcon({ className = "w-12 h-12" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Large gear */}
      <path
        d="M14 6.5V4.5C14 4.22386 13.7761 4 13.5 4H10.5C10.2239 4 10 4.22386 10 4.5V6.5M14 17.5V19.5C14 19.7761 13.7761 20 13.5 20H10.5C10.2239 20 10 19.7761 10 19.5V17.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M6.5 10H4.5C4.22386 10 4 10.2239 4 10.5V13.5C4 13.7761 4.22386 14 4.5 14H6.5M17.5 10H19.5C19.7761 10 20 10.2239 20 10.5V13.5C20 13.7761 19.7761 14 19.5 14H17.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M15.5 8L17 6.5C17.1953 6.30474 17.5119 6.30474 17.7071 6.5L19.5 8.29289C19.6953 8.48815 19.6953 8.80474 19.5 9L18 10.5M8.5 15.5L7 17C6.80474 17.1953 6.48815 17.1953 6.29289 17L4.5 15.2071C4.30474 15.0118 4.30474 14.6953 4.5 14.5L6 13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M15.5 16L17 17.5C17.1953 17.6953 17.5119 17.6953 17.7071 17.5L19.5 15.7071C19.6953 15.5119 19.6953 15.1953 19.5 15L18 13.5M8.5 8.5L7 7C6.80474 6.80474 6.48815 6.80474 6.29289 7L4.5 8.79289C4.30474 8.98815 4.30474 9.30474 4.5 9.5L6 11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle
        cx="12"
        cy="12"
        r="3"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  )
}
