import React from 'react';
import { motion } from 'framer-motion';

/**
 * ByteMindMascot - Premium Original Friendly AI Companion
 * Rendered using precision SVG vectors with glass gradients,
 * layered soft lighting, and smooth Framer Motion idle physics.
 */
const ByteMindMascot = ({
  size = 'md',
  isThinking = false,
  className = '',
  interactive = false
}) => {
  const sizeMap = {
    xs: { width: 36, height: 36 },
    sm: { width: 56, height: 56 },
    md: { width: 104, height: 104 },
    lg: { width: 140, height: 140 },
    xl: { width: 180, height: 180 }
  };

  const { width, height } = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width, height }}
      aria-label="ByteMind AI Mascot"
      role="img"
    >
      {/* Ambient Radial Aura Glow */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        animate={{
          scale: isThinking ? [1, 1.25, 1] : [1, 1.1, 1],
          opacity: isThinking ? [0.45, 0.75, 0.45] : [0.35, 0.55, 0.35]
        }}
        transition={{
          duration: isThinking ? 1.6 : 4,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        style={{
          background: 'radial-gradient(circle, rgba(167, 139, 250, 0.5) 0%, rgba(129, 140, 248, 0.25) 45%, transparent 70%)',
          filter: 'blur(12px)'
        }}
      />

      {/* Floating Mascot Body Container */}
      <motion.div
        animate={{
          y: isThinking ? [-3, 3, -3] : [0, -7, 0],
          rotate: isThinking ? [-1.5, 1.5, -1.5] : [0, 1, 0]
        }}
        transition={{
          duration: isThinking ? 1.4 : 4.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        whileHover={interactive ? { scale: 1.06, rotate: 2 } : undefined}
        className="relative z-10 w-full h-full flex items-center justify-center"
      >
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_10px_20px_rgba(124,58,237,0.22)]"
        >
          <defs>
            {/* Outer Head Shell Gradient */}
            <linearGradient id="headShell" x1="20" y1="15" x2="100" y2="105" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="45%" stopColor="#F1EDFD" />
              <stop offset="100%" stopColor="#D8C7FD" />
            </linearGradient>

            {/* Glossy Visor Gradient */}
            <linearGradient id="visorBg" x1="30" y1="36" x2="90" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1E1638" />
              <stop offset="60%" stopColor="#130D26" />
              <stop offset="100%" stopColor="#0B061A" />
            </linearGradient>

            {/* Glowing Cyan/Violet Eye Gradient */}
            <linearGradient id="eyeGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#67E8F9" />
              <stop offset="100%" stopColor="#A78BFA" />
            </linearGradient>

            {/* Headphone Ears Gradient */}
            <linearGradient id="earGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>

            {/* Visor Glare Shine */}
            <linearGradient id="visorGlare" x1="36" y1="38" x2="84" y2="52" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>

            {/* Floating Ring Gradient */}
            <linearGradient id="ringGradient" x1="25" y1="96" x2="95" y2="96" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#818CF8" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#67E8F9" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Floating Lower Energy Orbit Ring */}
          <ellipse cx="60" cy="100" rx="34" ry="7" fill="url(#ringGradient)" opacity="0.65" />
          <ellipse cx="60" cy="99" rx="26" ry="4.5" fill="#FFFFFF" opacity="0.4" />

          {/* Left Ear Antennae / Headphone */}
          <rect x="15" y="44" width="9" height="24" rx="4.5" fill="url(#earGradient)" />
          <circle cx="19.5" cy="56" r="2.5" fill="#A5F3FC" />

          {/* Right Ear Antennae / Headphone */}
          <rect x="96" y="44" width="9" height="24" rx="4.5" fill="url(#earGradient)" />
          <circle cx="100.5" cy="56" r="2.5" fill="#A5F3FC" />

          {/* Top Antenna Light Rod */}
          <rect x="58" y="10" width="4" height="12" rx="2" fill="#8B5CF6" />
          <circle cx="60" cy="9" r="4.5" fill="#67E8F9" className="animate-pulse" />
          <circle cx="60" cy="9" r="2" fill="#FFFFFF" />

          {/* Main Spherical Head Capsule */}
          <rect
            x="20"
            y="20"
            width="80"
            height="72"
            rx="36"
            fill="url(#headShell)"
            stroke="#FFFFFF"
            strokeWidth="2.5"
          />

          {/* Head Top Specular Highlight */}
          <ellipse cx="60" cy="27" rx="24" ry="4.5" fill="#FFFFFF" opacity="0.6" />

          {/* Curved Glossy Glass Visor */}
          <rect
            x="30"
            y="35"
            width="60"
            height="42"
            rx="21"
            fill="url(#visorBg)"
            stroke="#8B5CF6"
            strokeWidth="1.5"
            strokeOpacity="0.4"
          />

          {/* Visor Specular Glass Glare Streak */}
          <path
            d="M36 43C42 39 52 38 64 38C76 38 80 40 84 43C82 48 76 49 64 49C52 49 40 48 36 43Z"
            fill="url(#visorGlare)"
          />

          {/* Expressive Glowing Eyes */}
          {isThinking ? (
            /* Thinking Pulse Wave Eyes */
            <g>
              <ellipse cx="46" cy="56" rx="6" ry="2.5" fill="url(#eyeGlow)" className="animate-pulse" />
              <ellipse cx="74" cy="56" rx="6" ry="2.5" fill="url(#eyeGlow)" className="animate-pulse" />
            </g>
          ) : (
            /* Friendly Expressive Rounded Eyes with Sparkle */
            <g>
              {/* Left Eye */}
              <ellipse cx="46" cy="55" rx="5.5" ry="7" fill="url(#eyeGlow)" />
              <circle cx="48" cy="53" r="2.2" fill="#FFFFFF" />
              <circle cx="44.5" cy="57.5" r="1.1" fill="#FFFFFF" />

              {/* Right Eye */}
              <ellipse cx="74" cy="55" rx="5.5" ry="7" fill="url(#eyeGlow)" />
              <circle cx="76" cy="53" r="2.2" fill="#FFFFFF" />
              <circle cx="72.5" cy="57.5" r="1.1" fill="#FFFFFF" />

              {/* Cute Cheek Blushes */}
              <circle cx="39" cy="63" r="3" fill="#F472B6" opacity="0.5" />
              <circle cx="81" cy="63" r="3" fill="#F472B6" opacity="0.5" />

              {/* Friendly Subtle Smile Arc */}
              <path
                d="M56 62C58 64.5 62 64.5 64 62"
                stroke="#67E8F9"
                strokeWidth="1.8"
                strokeLinecap="round"
                opacity="0.85"
              />
            </g>
          )}
        </svg>
      </motion.div>
    </div>
  );
};

export default ByteMindMascot;

