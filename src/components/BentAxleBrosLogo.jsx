export default function BentAxleBrosLogo({ size = 80 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* outer ring */}
      <circle cx="50" cy="50" r="47" stroke="#c0a060" strokeWidth="3" fill="#1a1208" />
      <circle cx="50" cy="50" r="41" stroke="#c0a060" strokeWidth="1" fill="none" opacity="0.4" />

      {/* bent axle */}
      <polyline
        points="18,58 34,58 40,44 60,44 66,58 82,58"
        stroke="#e8b84b"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* axle end caps */}
      <circle cx="18" cy="58" r="4" fill="#e8b84b" />
      <circle cx="82" cy="58" r="4" fill="#e8b84b" />

      {/* top text: BENT AXLE */}
      <path id="topArc" d="M 12,50 A 38,38 0 0,1 88,50" fill="none" />
      <text fontSize="10.5" fontFamily="Arial Black, sans-serif" fontWeight="900" fill="#f0e8d0" letterSpacing="2">
        <textPath href="#topArc" startOffset="50%" textAnchor="middle">BENT AXLE</textPath>
      </text>

      {/* bottom text: BROS */}
      <path id="botArc" d="M 18,68 A 38,38 0 0,0 82,68" fill="none" />
      <text fontSize="10" fontFamily="Arial Black, sans-serif" fontWeight="900" fill="#c0a060" letterSpacing="4">
        <textPath href="#botArc" startOffset="50%" textAnchor="middle">BROS</textPath>
      </text>
    </svg>
  )
}
