import { cn } from "@/lib/utils"

// Ilustrasi headset + gelembung chat (SVG inline, beberapa KB, tajam di semua
// resolusi). Dekoratif, jadi disembunyikan dari pembaca layar.
export function SupportIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 200" fill="none" aria-hidden="true" className={cn("h-auto", className)}>
      <defs>
        <linearGradient id="support-silver" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.45" stopColor="#e7eaf0" />
          <stop offset="1" stopColor="#98a1b1" />
        </linearGradient>
        <linearGradient id="support-silver-deep" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6f7f9" />
          <stop offset="1" stopColor="#7c8697" />
        </linearGradient>
        <radialGradient id="support-glass" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.98" />
          <stop offset="0.7" stopColor="#eef2f7" stopOpacity="0.92" />
          <stop offset="1" stopColor="#d7dde7" stopOpacity="0.9" />
        </radialGradient>
        <linearGradient id="support-dot" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4f94ff" />
          <stop offset="1" stopColor="#0066ff" />
        </linearGradient>
        <filter id="support-shadow" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#0f172a" floodOpacity="0.14" />
        </filter>
      </defs>

      <g filter="url(#support-shadow)">
        {/* Bando headset */}
        <path d="M100 118C96 46 210 42 206 118" stroke="url(#support-silver)" strokeWidth="14" strokeLinecap="round" />
        <path d="M106 104C108 58 198 56 200 104" stroke="#ffffff" strokeOpacity="0.85" strokeWidth="3" strokeLinecap="round" />

        {/* Bantalan telinga kanan */}
        <rect x="186" y="98" width="36" height="60" rx="18" fill="url(#support-silver)" />
        <ellipse cx="203" cy="128" rx="11" ry="21" fill="url(#support-silver-deep)" opacity="0.75" />
        <ellipse cx="200" cy="122" rx="4" ry="9" fill="#ffffff" opacity="0.8" />

        {/* Bantalan telinga kiri */}
        <rect x="84" y="100" width="32" height="56" rx="16" fill="url(#support-silver)" />
        <ellipse cx="101" cy="128" rx="9" ry="19" fill="url(#support-silver-deep)" opacity="0.7" />

        {/* Mikrofon */}
        <path d="M98 152C102 180 128 186 150 178" stroke="url(#support-silver-deep)" strokeWidth="6" strokeLinecap="round" />
        <rect x="146" y="169" width="26" height="15" rx="7.5" fill="url(#support-silver)" />

        {/* Gelembung chat */}
        <path
          d="M50.6 137.7A46 46 0 1 0 32.3 122.4L26 156Z"
          fill="url(#support-glass)"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path d="M38 80A36 36 0 0 1 60 57" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
        <circle cx="49" cy="96" r="8" fill="url(#support-dot)" />
        <circle cx="70" cy="96" r="8" fill="url(#support-dot)" />
        <circle cx="91" cy="96" r="8" fill="url(#support-dot)" />
      </g>
    </svg>
  )
}
