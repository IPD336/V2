import { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useTheme } from '../context/ThemeContext';
import { MoonIcon, SunIcon } from './Icons';

const styleId = 'theme-transition-styles';

export default function ThemeToggleButton({ className = '' }) {
  const { theme, toggleTheme } = useTheme();
  const [isDark, setIsDark] = useState(theme === 'dark');

  // Keep local state in sync with context
  useEffect(() => {
    setIsDark(theme === 'dark');
  }, [theme]);

  const updateStyles = useCallback((css) => {
    if (typeof window === 'undefined') return;

    let styleElement = document.getElementById(styleId);
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    styleElement.textContent = css;
  }, []);

  const handleToggle = (e) => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';

    // 1. Get click coordinates to center the expanding transition circle
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const xPercent = ((x / window.innerWidth) * 100).toFixed(2);
    const yPercent = ((y / window.innerHeight) * 100).toFixed(2);

    // 2. Define the View Transition CSS dynamically (set to a balanced 0.85s)
    const css = `
      ::view-transition-group(root) {
        animation-duration: 0.85s;
        animation-timing-function: cubic-bezier(0.76, 0, 0.24, 1); /* ultra smooth custom ease */
      }
            
      ::view-transition-new(root) {
        animation-name: reveal-light;
      }

      ::view-transition-old(root),
      [data-theme="dark"]::view-transition-old(root) {
        animation: none;
        z-index: -1;
      }

      [data-theme="dark"]::view-transition-new(root) {
        animation-name: reveal-dark;
      }

      @keyframes reveal-dark {
        from {
          clip-path: circle(0% at ${xPercent}% ${yPercent}%);
        }
        to {
          clip-path: circle(150% at ${xPercent}% ${yPercent}%);
        }
      }

      @keyframes reveal-light {
        from {
           clip-path: circle(0% at ${xPercent}% ${yPercent}%);
        }
        to {
          clip-path: circle(150% at ${xPercent}% ${yPercent}%);
        }
      }
    `;

    // 3. Inject transition keyframes
    updateStyles(css);

    // 4. Toggle the theme globally (which handles startViewTransition)
    toggleTheme();
  };

  return (
    <button
      type="button"
      className={`nav-icon-btn theme-toggle-btn ${className}`}
      onClick={handleToggle}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      style={{
        width: 38,
        height: 38,
        cursor: 'pointer',
        borderRadius: '50%',
        padding: 6,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        border: 'none',
        outline: 'none',
        transition: 'background-color 0.2s',
      }}
    >
      <motion.div
        key={theme}
        initial={{ opacity: 0, scale: 0.8, rotate: -30 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {theme === 'light' ? <MoonIcon size={16} /> : <SunIcon size={16} />}
      </motion.div>
    </button>
  );
}
