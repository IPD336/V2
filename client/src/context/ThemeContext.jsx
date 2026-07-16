import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    if (!document.startViewTransition) {
      setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
      return;
    }

    // Check if transition style element already exists, if not create a center-screen fallback
    const styleId = 'theme-transition-styles';
    let styleElement = document.getElementById(styleId);
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
      styleElement.textContent = `
        ::view-transition-group(root) {
          animation-duration: 0.85s;
          animation-timing-function: cubic-bezier(0.76, 0, 0.24, 1);
        }
        ::view-transition-new(root) {
          animation-name: reveal-light-default;
        }
        ::view-transition-old(root),
        [data-theme="dark"]::view-transition-old(root) {
          animation: none;
          z-index: -1;
        }
        [data-theme="dark"]::view-transition-new(root) {
          animation-name: reveal-dark-default;
        }
        @keyframes reveal-dark-default {
          from { clip-path: circle(0% at 50% 50%); }
          to { clip-path: circle(150% at 50% 50%); }
        }
        @keyframes reveal-light-default {
          from { clip-path: circle(0% at 50% 50%); }
          to { clip-path: circle(150% at 50% 50%); }
        }
      `;
    }

    document.startViewTransition(() => {
      setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
