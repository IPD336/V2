import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const STAIRS_COUNT = 5;

// Custom liquid SVG path keyframes for a premium curtain reveal
const curveVariants = {
  initial: {
    d: "M0 0 L100 0 L100 100 L0 100 Z"
  },
  animate: {
    d: [
      "M0 0 L100 0 L100 100 L0 100 Z", // Full cover
      "M0 0 L100 0 L100 70 Q50 30 0 70 Z", // Liquid pull-up curve
      "M0 0 L100 0 L100 0 Q50 0 0 0 Z"   // Flat top finish
    ],
    transition: {
      duration: 1.0,
      times: [0, 0.4, 1.0],
      ease: [0.76, 0, 0.24, 1], // easeInOutQuart
    }
  }
};

export default function StairsPreloader({ onDone }) {
  const [showContent, setShowContent] = useState(true);
  const [startSlide, setStartSlide] = useState(false);
  const { theme } = useTheme(); // 'light' or 'dark'

  // Match preloader theme to user theme for seamless curtain reveal transitions
  const isDark = theme === 'dark';

  const preloaderBg = isDark ? '#1c1814' : '#F8F4EE';
  const preloaderText = isDark ? '#F0EBE4' : '#0f0f0f';
  const preloaderMuted = isDark ? '#9a9088' : '#7A7268';
  const glowBg = isDark
    ? 'radial-gradient(circle, rgba(200, 75, 49, 0.15) 0%, transparent 70%)'
    : 'radial-gradient(circle, rgba(200, 75, 49, 0.12) 0%, transparent 70%)';

  useEffect(() => {
    // 1. Fade out content after 2.0 seconds
    const contentTimer = setTimeout(() => {
      setShowContent(false);
    }, 2000);

    // 2. Start the liquid wave morph after 2.2 seconds
    const slideTimer = setTimeout(() => {
      setStartSlide(true);
    }, 2200);

    // 3. Complete and unmount after 3.2 seconds
    const doneTimer = setTimeout(() => {
      onDone();
    }, 3200);

    return () => {
      clearTimeout(contentTimer);
      clearTimeout(slideTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  const handleSkip = () => {
    setShowContent(false);
    setStartSlide(true);
    setTimeout(onDone, 1000);
  };

  const orbitSizeOuter = 'calc(min(320px, 70vw) + 60px)';
  const orbitSizeInner = 'calc(min(320px, 70vw) + 30px)';

  return (
    <div
      onClick={handleSkip}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        overflow: 'hidden',
        pointerEvents: startSlide ? 'none' : 'auto',
      }}
      aria-label="Loading animation — click anywhere to skip"
    >
      {/* Liquid Organic SVG Curtain Reveal */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          fill: preloaderBg,
          zIndex: 2,
          pointerEvents: 'none',
        }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <motion.path
          variants={curveVariants}
          initial="initial"
          animate={startSlide ? "animate" : "initial"}
        />
      </svg>

      {/* Brand & Animation Overlay Content */}
      <AnimatePresence>
        {showContent && (
          <motion.div
            key="preloader-overlay-content"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              transition: { duration: 0.8, ease: [0.34, 1.56, 0.64, 1] } 
            }}
            exit={{ 
              opacity: 0, 
              y: -80, 
              scale: 0.95,
              transition: { duration: 0.5, ease: [0.76, 0, 0.24, 1] } 
            }}
            style={{
              position: 'relative',
              zIndex: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
            }}
          >
            {/* Ambient Radial Glow */}
            <div style={{
              position: 'absolute',
              width: 550,
              height: 550,
              borderRadius: '50%',
              background: glowBg,
              pointerEvents: 'none',
              transform: 'translate(-50%, -50%)',
              top: '50%',
              left: '50%',
              zIndex: -1,
            }} />

            {/* Cosmic Orbit Container enclosing the GIF */}
            <div style={{ 
              position: 'relative', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: 'calc(min(320px, 70vw) + 80px)',
              height: 'calc(min(320px, 70vw) + 80px)',
            }}>
              
              {/* Outer dashed orbit circle - GPU Optimized Centering */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 25, ease: 'linear', repeat: Infinity }}
                style={{
                  position: 'absolute',
                  width: orbitSizeOuter,
                  height: orbitSizeOuter,
                  borderRadius: '50%',
                  border: '1.5px dashed var(--accent)',
                  opacity: 0.35,
                  top: '50%',
                  left: '50%',
                  x: '-50%',
                  y: '-50%',
                  willChange: 'transform',
                }}
              />

              {/* Inner dashed orbit circle - GPU Optimized Centering */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 30, ease: 'linear', repeat: Infinity }}
                style={{
                  position: 'absolute',
                  width: orbitSizeInner,
                  height: orbitSizeInner,
                  borderRadius: '50%',
                  border: '1px dashed var(--sage)',
                  opacity: 0.25,
                  top: '50%',
                  left: '50%',
                  x: '-50%',
                  y: '-50%',
                  willChange: 'transform',
                }}
              />

              {/* Orbiting Orange Node - GPU Optimized Centering & Radial Alignment */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 12, ease: 'linear', repeat: Infinity }}
                style={{
                  position: 'absolute',
                  width: orbitSizeOuter,
                  height: orbitSizeOuter,
                  top: '50%',
                  left: '50%',
                  x: '-50%',
                  y: '-50%',
                  willChange: 'transform',
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: -6, // Centered precisely on the outer boundary line
                  left: 'calc(50% - 6px)',
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: 'var(--accent)',
                  boxShadow: '0 0 12px var(--accent)',
                }} />
              </motion.div>

              {/* Orbiting Sage Node - GPU Optimized Centering & Radial Alignment */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 16, ease: 'linear', repeat: Infinity }}
                style={{
                  position: 'absolute',
                  width: orbitSizeInner,
                  height: orbitSizeInner,
                  top: '50%',
                  left: '50%',
                  x: '-50%',
                  y: '-50%',
                  willChange: 'transform',
                }}
              >
                <div style={{
                  position: 'absolute',
                  bottom: -5, // Centered precisely on the inner boundary line
                  left: 'calc(50% - 5px)',
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: 'var(--sage)',
                  boxShadow: '0 0 10px var(--sage)',
                }} />
              </motion.div>

              {/* The video animation - Centered inside the orbits */}
              <video
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                fetchPriority="high"
                style={{
                  width: 'min(320px, 70vw)',
                  height: 'auto',
                  borderRadius: 20,
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 1,
                  boxShadow: isDark
                    ? '0 12px 40px rgba(0, 0, 0, 0.6)'
                    : '0 12px 40px rgba(0, 0, 0, 0.1)',
                }}
              >
                <source src="/splash.webm" type="video/webm" />
                <source src="/splash.mp4" type="video/mp4" />
              </video>
            </div>

            {/* Brand Typography */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              marginTop: 12,
            }}>
              <div style={{
                fontFamily: 'PT Serif, serif',
                fontSize: 36,
                fontWeight: 700,
                color: preloaderText,
                letterSpacing: -0.5,
                textAlign: 'center',
              }}>
                Skill<span style={{ color: 'var(--accent)' }}>Swap</span>
              </div>
              
              <div style={{
                fontFamily: 'PT Sans, sans-serif',
                fontSize: 12,
                color: preloaderMuted,
                letterSpacing: 4,
                textTransform: 'uppercase',
                fontWeight: 600,
              }}>
                Trade · Learn · Grow
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip Hint */}
      {showContent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5, transition: { delay: 0.8, duration: 0.5 } }}
          exit={{ opacity: 0 }}
          style={{
            position: 'absolute',
            bottom: 32,
            zIndex: 3,
            fontFamily: 'PT Sans, sans-serif',
            fontSize: 11,
            color: preloaderMuted,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
          }}
        >
          Click anywhere to skip
        </motion.div>
      )}
    </div>
  );
}
