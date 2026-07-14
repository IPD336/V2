import { useState } from 'react';

const LineSidebar = ({
  items = [],
  accentColor = '#C84B31',
  textColor = '#7A7268',
  markerColor = '#c4c4c4',
  showIndex = true,
  showMarker = true,
  maxShift = 28,
  markerLength = 52,
  markerGap = 8,
  itemGap = 22,
  fontSize = 0.85,
  activeIndex = 0,
  onItemClick,
  className = ''
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const handleClick = (index, label) => {
    onItemClick?.(index, label);
  };


  return (
    <nav
      className={`line-sidebar ${className}`}
      style={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'flex-start',
        width: '100%',
        paddingLeft: showMarker ? `${markerLength + markerGap}px` : '0px',
        boxSizing: 'border-box'
      }}
    >
      <ul
        className="line-sidebar__list"
        style={{
          listStyle: 'none',
          margin: 0,
          padding: '12px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: `${itemGap}px`,
          width: '100%'
        }}
      >
        {items.map((label, index) => {
          // Calculate proximity effect (0..1) based on hover distance
          let effect = 0;
          if (activeIndex === index) {
            effect = 1;
          } else if (hoveredIndex !== null) {
            const dist = Math.abs(index - hoveredIndex);
            if (dist === 0) effect = 1.0;
            else if (dist === 1) effect = 0.55;
            else if (dist === 2) effect = 0.22;
          }

          const resolvedColor = `color-mix(in srgb, ${accentColor} ${effect * 100}%, ${textColor})`;
          const resolvedMarkerColor = `color-mix(in srgb, ${accentColor} ${effect * 100}%, ${markerColor})`;

          return (
            <li
              key={`${label}-${index}`}
              className="line-sidebar__item"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => handleClick(index, label)}
              aria-current={activeIndex === index ? 'true' : undefined}
              style={{
                position: 'relative',
                cursor: 'pointer',
                display: 'block',
                width: '100%',
                margin: 0,
                padding: 0
              }}
            >
              {/* Left Line Marker (rendered inline to bypass CSS caching) */}
              {showMarker && (
                <span
                  className="line-sidebar__marker"
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: `-${markerLength + markerGap}px`,
                    height: '1px',
                    width: `${markerLength}px`,
                    backgroundColor: resolvedMarkerColor,
                    transformOrigin: 'left center',
                    transform: `translateY(-50%) scaleX(${0.7 + effect * 0.5})`,
                    transition: 'transform 0.22s cubic-bezier(.25,.8,.25,1), background-color 0.22s ease'
                  }}
                />
              )}

              {/* Label Text */}
              <span
                className="line-sidebar__label"
                style={{
                  position: 'relative',
                  display: 'inline-flex',
                  alignItems: 'baseline',
                  fontSize: `${fontSize}rem`,
                  lineHeight: '1.2',
                  color: resolvedColor,
                  transform: `translateX(${effect * maxShift}px)`,
                  transition: 'transform 0.22s cubic-bezier(.25,.8,.25,1), color 0.22s ease'
                }}
              >
                {showIndex && (
                  <span
                    className="line-sidebar__index"
                    style={{
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                      marginRight: '0.6rem',
                      fontSize: '0.85em',
                      opacity: 0.55 + effect * 0.45,
                      transition: 'opacity 0.22s ease'
                    }}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                )}
                <span className="line-sidebar__text" style={{ fontWeight: activeIndex === index ? '700' : 'normal' }}>
                  {label}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default LineSidebar;
