import React from 'react';

interface BubbleShooterLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
}

export const BubbleShooterLogo: React.FC<BubbleShooterLogoProps> = ({
  size = 'md',
  className = '',
  showText = false,
}) => {
  const dimensions = {
    sm: { iconSize: 32, textClass: 'text-lg' },
    md: { iconSize: 48, textClass: 'text-2xl' },
    lg: { iconSize: 84, textClass: 'text-4xl' },
  }[size];

  const s = dimensions.iconSize;

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Custom Vector Bubble Cluster Logo */}
      <svg
        width={s}
        height={s}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-md"
        aria-label="Bubble Shooter Logo"
      >
        <defs>
          {/* Blue Bubble Gradient */}
          <radialGradient id="bs-blue-grad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="45%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1e40af" />
          </radialGradient>

          {/* Red Bubble Gradient */}
          <radialGradient id="bs-red-grad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#fca5a5" />
            <stop offset="45%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#991b1b" />
          </radialGradient>

          {/* Green Bubble Gradient */}
          <radialGradient id="bs-green-grad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="45%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#065f46" />
          </radialGradient>

          {/* Yellow Bubble Gradient */}
          <radialGradient id="bs-yellow-grad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="45%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#92400e" />
          </radialGradient>

          {/* Purple Bubble Gradient */}
          <radialGradient id="bs-purple-grad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#e9d5ff" />
            <stop offset="45%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#6b21a8" />
          </radialGradient>

          {/* Specular Highlight Glare Gradient */}
          <linearGradient id="bs-glare" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
          </linearGradient>

          {/* Soft Glow Filter */}
          <filter id="bs-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer ambient glow halo */}
        <circle cx="50" cy="50" r="44" fill="#38bdf8" opacity="0.08" filter="url(#bs-glow)" />

        {/* 1. Purple Bubble (Top Center) */}
        <g>
          <circle cx="50" cy="28" r="18" fill="url(#bs-purple-grad)" stroke="#4c1d95" strokeWidth="1.5" />
          <ellipse cx="45" cy="22" rx="6" ry="3.5" transform="rotate(-30 45 22)" fill="url(#bs-glare)" />
          <ellipse cx="53" cy="34" rx="4" ry="1.5" transform="rotate(-30 53 34)" fill="#ffffff" opacity="0.25" />
        </g>

        {/* 2. Red Bubble (Bottom Left) */}
        <g>
          <circle cx="28" cy="62" r="19" fill="url(#bs-red-grad)" stroke="#7f1d1d" strokeWidth="1.5" />
          <ellipse cx="23" cy="55" rx="6.5" ry="3.8" transform="rotate(-30 23 55)" fill="url(#bs-glare)" />
          <ellipse cx="32" cy="69" rx="4.5" ry="1.8" transform="rotate(-30 32 69)" fill="#ffffff" opacity="0.25" />
        </g>

        {/* 3. Green Bubble (Bottom Right) */}
        <g>
          <circle cx="72" cy="62" r="19" fill="url(#bs-green-grad)" stroke="#064e3b" strokeWidth="1.5" />
          <ellipse cx="67" cy="55" rx="6.5" ry="3.8" transform="rotate(-30 67 55)" fill="url(#bs-glare)" />
          <ellipse cx="76" cy="69" rx="4.5" ry="1.8" transform="rotate(-30 76 69)" fill="#ffffff" opacity="0.25" />
        </g>

        {/* 4. Yellow Bubble (Lower Center-Right) */}
        <g>
          <circle cx="50" cy="74" r="15" fill="url(#bs-yellow-grad)" stroke="#78350f" strokeWidth="1.5" />
          <ellipse cx="46" cy="69" rx="5" ry="2.8" transform="rotate(-30 46 69)" fill="url(#bs-glare)" />
        </g>

        {/* 5. Hero Blue Bubble (Front Center Focal Bubble) */}
        <g>
          <circle cx="50" cy="48" r="22" fill="url(#bs-blue-grad)" stroke="#172554" strokeWidth="2" />
          {/* Specular Main Glare */}
          <ellipse cx="43" cy="40" rx="8" ry="4.5" transform="rotate(-30 43 40)" fill="url(#bs-glare)" />
          {/* Bottom Secondary Rim Light */}
          <ellipse cx="55" cy="56" rx="5.5" ry="2.2" transform="rotate(-30 55 56)" fill="#ffffff" opacity="0.3" />
          {/* Subtle center ring highlight */}
          <circle cx="50" cy="48" r="8" stroke="#ffffff" strokeWidth="1.2" opacity="0.4" strokeDasharray="3 3" />
        </g>
      </svg>

      {/* Optional Logotype Text */}
      {showText && (
        <span className={`font-black tracking-tight text-white ${dimensions.textClass}`}>
          Bubble Shooter
        </span>
      )}
    </div>
  );
};
