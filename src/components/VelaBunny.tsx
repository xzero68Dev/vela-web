export default function VelaBunny({ size = 48, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 90" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Left ear */}
      <ellipse cx="26" cy="22" rx="8" ry="16" fill="none" stroke="#D64B2A" strokeWidth="3" strokeLinecap="round"/>
      {/* Right ear */}
      <ellipse cx="54" cy="18" rx="7" ry="14" fill="none" stroke="#D64B2A" strokeWidth="3" strokeLinecap="round"/>
      {/* Head */}
      <ellipse cx="40" cy="55" rx="26" ry="24" fill="none" stroke="#D64B2A" strokeWidth="3"/>
      {/* Left X eye */}
      <line x1="30" y1="49" x2="35" y2="54" stroke="#D64B2A" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="35" y1="49" x2="30" y2="54" stroke="#D64B2A" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Right X eye */}
      <line x1="45" y1="49" x2="50" y2="54" stroke="#D64B2A" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="50" y1="49" x2="45" y2="54" stroke="#D64B2A" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Nose */}
      <circle cx="40" cy="60" r="2" fill="#D64B2A"/>
    </svg>
  )
}
