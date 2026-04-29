export default function IgniteLogo({ size = 80 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="flameGrad" x1="50" y1="10" x2="50" y2="55" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ff9500" />
          <stop offset="100%" stopColor="#e82020" />
        </linearGradient>
      </defs>

      {/* flame */}
      <path
        d="M50 10 C50 10 42 22 44 32 C40 26 40 18 44 14 C40 22 36 32 40 42 C36 36 36 26 40 22 C34 32 34 46 42 52 C38 48 36 42 38 36 C36 44 38 54 46 58 C44 54 44 48 46 44 C46 52 50 58 50 58 C50 58 54 52 54 44 C56 48 56 54 54 58 C62 54 64 44 62 36 C64 42 62 48 58 52 C66 46 66 32 60 22 C64 26 64 36 60 42 C64 32 60 22 56 14 C60 18 60 26 56 32 C58 22 50 10 50 10Z"
        fill="url(#flameGrad)"
      />

      {/* wordmark */}
      <text
        x="50"
        y="82"
        textAnchor="middle"
        fontFamily="Arial Black, Impact, sans-serif"
        fontWeight="900"
        fontSize="24"
        fill="white"
        letterSpacing="1"
      >
        IGNITE
      </text>

      {/* underline */}
      <rect x="14" y="86" width="72" height="3" rx="1.5" fill="#e82020" />
    </svg>
  )
}
