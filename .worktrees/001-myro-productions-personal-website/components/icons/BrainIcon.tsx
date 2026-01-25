interface IconProps {
  className?: string
}

export default function BrainIcon({ className = "w-12 h-12" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Left hemisphere */}
      <path
        d="M9.5 3C7.567 3 6 4.567 6 6.5C6 6.776 6.03 7.044 6.087 7.302C5.193 7.692 4.5 8.568 4.5 9.6C4.5 10.2 4.7 10.75 5.05 11.2C4.5 11.75 4 12.5 4 13.5C4 14.5 4.5 15.25 5.05 15.8C4.7 16.25 4.5 16.8 4.5 17.4C4.5 18.8 5.6 20 7 20.5C7 20.776 7.224 21 7.5 21H11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Right hemisphere */}
      <path
        d="M14.5 3C16.433 3 18 4.567 18 6.5C18 6.776 17.97 7.044 17.913 7.302C18.807 7.692 19.5 8.568 19.5 9.6C19.5 10.2 19.3 10.75 18.95 11.2C19.5 11.75 20 12.5 20 13.5C20 14.5 19.5 15.25 18.95 15.8C19.3 16.25 19.5 16.8 19.5 17.4C19.5 18.8 18.4 20 17 20.5C17 20.776 16.776 21 16.5 21H13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Neural connections */}
      <path
        d="M12 8V10M12 14V16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M9 11L10.5 12M14.5 12L16 11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
