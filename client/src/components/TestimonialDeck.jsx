import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../context/ThemeContext';

const TESTIMONIALS = [
  {
    id: 0,
    name: 'Rahul Sharma',
    role: 'Frontend Developer',
    initials: 'RS',
    color: 'var(--accent)',
    skills: ['React', 'Go'],
    text: "SkillSwap helped me learn Go in two weeks while teaching React to someone building their first app. The absolute best learning experience I've had.",
  },
  {
    id: 1,
    name: 'Ananya Patel',
    role: 'Data Scientist',
    initials: 'AP',
    color: 'var(--sage)',
    skills: ['Python', 'Machine Learning'],
    text: 'I was stuck on my ML project for months. Found a mentor here who traded Python coaching for ML tips. Unbelievably valuable.',
  },
  {
    id: 2,
    name: 'Karan Mehta',
    role: 'Product Designer',
    initials: 'KM',
    color: 'var(--indigo)',
    skills: ['Figma', 'React'],
    text: 'The team mode is incredible. We formed a group of 4 — designer, frontend, backend, DevOps — and built a real product together in 3 weeks.',
  },
  {
    id: 3,
    name: 'Sara Chen',
    role: 'Full Stack Engineer',
    initials: 'SC',
    color: 'var(--gold)',
    skills: ['TypeScript', 'Docker'],
    text: 'I needed to deploy my app to AWS. Traded my TypeScript knowledge with a DevOps engineer who set up Docker containers for me in a weekend.',
  },
  {
    id: 4,
    name: 'Aarav Goel',
    role: 'DevOps Specialist',
    initials: 'AG',
    color: '#7A5FA8',
    skills: ['Kubernetes', 'Node.js'],
    text: 'Met a Node.js wizard who helped me clean up my microservices API. In return, I taught him how to set up Kubernetes clusters.',
  },
  {
    id: 5,
    name: 'Priya Sen',
    role: 'UI Copywriter',
    initials: 'PS',
    color: 'var(--accent)',
    skills: ['Copywriting', 'SEO'],
    text: 'Traded my copy editing skills for some SEO tutoring. My blog traffic grew by 80% after putting what I learned into practice.',
  }
];

export default function TestimonialDeck() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const N = TESTIMONIALS.length;
  // Calculate parent wheel rotation so the selected item rotates to the focus point (left, 180 degrees)
  const wheelRotation = 180 - activeIndex * (360 / N);

  // Auto-rotation timer: switches active testimonial every 5 seconds
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % N);
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, N]);

  const activePerson = TESTIMONIALS[activeIndex];

  const handleSelect = (idx) => {
    setIsAutoPlaying(false); // Stop autoplay when clicked
    setActiveIndex(idx);
  };

  return (
    <div
      className="testimonial-wheel-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 40,
        width: '100%',
        maxWidth: 1100,
        margin: '0 auto',
        padding: '0 20px',
      }}
    >
      {/* LEFT: Testimonial review panel */}
      <div
        className="testimonial-left-panel"
        style={{
          width: '100%',
          maxWidth: 560,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.215, 0.61, 0.355, 1] }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              minHeight: 280,
              justifyContent: 'center',
            }}
          >
            {/* SVG Quote Mark decoration */}
            <svg
              width="44"
              height="44"
              viewBox="0 0 24 24"
              fill="none"
              style={{
                color: activePerson.color,
                opacity: 0.2,
                alignSelf: 'center',
                marginBottom: -10,
              }}
            >
              <path
                d="M11.189 18H5C5 13.9 6.822 11 9.878 9v2.2C8.367 12 7.55 13.2 7.422 15h3.767v3zm7.811 0h-6.189c0-4.1 1.822-7 4.878-9v2.2c-1.511.8-2.328 2-2.456 3.8h3.767v3z"
                fill="currentColor"
              />
            </svg>

            {/* Testimonial Quote */}
            <p
              style={{
                fontFamily: 'PT Serif, serif',
                fontSize: 'clamp(18px, 3.5vw, 22px)',
                lineHeight: 1.6,
                color: 'var(--ink)',
                fontStyle: 'italic',
                margin: 0,
                fontWeight: 400,
              }}
            >
              "{activePerson.text}"
            </p>

            {/* Swapped Skills tag */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'var(--cream)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 30,
                  padding: '8px 20px',
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'var(--ink)',
                  fontFamily: 'PT Mono, monospace',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                }}
              >
                <span>{activePerson.skills[0]}</span>
                <span style={{ color: 'var(--accent)', fontWeight: 800 }}>↔</span>
                <span>{activePerson.skills[1]}</span>
              </div>
            </div>

            {/* User Profile */}
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', fontFamily: 'PT Sans, sans-serif' }}>
                {activePerson.name}
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'PT Sans, sans-serif', marginTop: 2 }}>
                {activePerson.role}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* RIGHT: Spinning Wheel Dial */}
      <div
        className="testimonial-right-panel"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        <div className="spinning-wheel-outer" style={{ position: 'relative' }}>
          
          {/* Static Connectors / Aesthetics background circles */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '1px dashed var(--border)',
              opacity: 0.5,
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 48,
              borderRadius: '50%',
              border: '1px solid var(--border)',
              opacity: 0.3,
              pointerEvents: 'none',
            }}
          />

          {/* Central Active Indicator Core */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 110,
              height: 110,
              borderRadius: '50%',
              background: 'var(--card-bg)',
              border: '1.5px solid var(--border)',
              boxShadow: 'var(--shadow)',
              zIndex: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: activePerson.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 26,
                  fontWeight: 800,
                  color: 'white',
                  boxShadow: `0 8px 24px ${activePerson.color}35`,
                }}
              >
                {activePerson.initials}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Active Highlight focal pointer path */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              width: '50%',
              height: 2,
              borderTop: `2px dashed ${activePerson.color}`,
              opacity: 0.6,
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              zIndex: 2,
              transition: 'border-color 0.4s ease',
            }}
          />

          {/* The Spinning Wheel Container */}
          <motion.div
            animate={{ rotate: wheelRotation }}
            transition={{
              type: 'spring',
              stiffness: 110,
              damping: 18,
            }}
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              zIndex: 4,
            }}
          >
            {TESTIMONIALS.map((person, i) => {
              const angle = (i * 2 * Math.PI) / N;
              const radiusPercent = 40; // distance from center (percent of container size)
              const left = 50 + radiusPercent * Math.cos(angle);
              const top = 50 + radiusPercent * Math.sin(angle);
              const isActive = i === activeIndex;

              return (
                <div
                  key={person.id}
                  onClick={() => handleSelect(i)}
                  onMouseEnter={() => setIsAutoPlaying(false)}
                  onMouseLeave={() => setIsAutoPlaying(true)}
                  style={{
                    position: 'absolute',
                    left: `${left}%`,
                    top: `${top}%`,
                    transform: 'translate(-50%, -50%)',
                    cursor: 'pointer',
                  }}
                >
                  {/* Inverse rotation to keep child avatars perfectly upright */}
                  <motion.div
                    animate={{ 
                      rotate: -wheelRotation,
                      scale: isActive ? 1.25 : 1,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 110,
                      damping: 18,
                    }}
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      background: person.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 15,
                      fontWeight: 800,
                      color: 'white',
                      border: isDark ? '4px solid #26211c' : '4px solid #ffffff',
                      boxShadow: isActive 
                        ? `0 10px 25px ${person.color}50` 
                        : '0 4px 12px rgba(0,0,0,0.1)',
                      transition: 'border-color 0.4s ease, box-shadow 0.3s ease',
                    }}
                  >
                    {person.initials}

                    {/* Orbit connector path line relative to the center */}
                    <div
                      style={{
                        position: 'absolute',
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        background: person.color,
                        opacity: isActive ? 0.3 : 0,
                        zIndex: -1,
                        filter: 'blur(3px)',
                        transform: 'scale(2.5)',
                        transition: 'opacity 0.3s ease',
                      }}
                    />
                  </motion.div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* Responsive stylesheet */}
      <style>{`
        .spinning-wheel-outer {
          width: 360px;
          height: 360px;
        }
        @media (max-width: 768px) {
          .spinning-wheel-outer {
            transform: scale(0.85);
          }
        }
        @media (max-width: 480px) {
          .spinning-wheel-outer {
            transform: scale(0.72);
            margin: -30px 0;
          }
        }
        @media (min-width: 768px) {
          .testimonial-wheel-container {
            flex-direction: row !important;
            align-items: center !important;
            gap: 60px !important;
            text-align: left !important;
          }
          .testimonial-left-panel {
            flex: 1.25 !important;
            text-align: left !important;
          }
          .testimonial-left-panel div {
            justify-content: flex-start !important;
          }
          .testimonial-left-panel svg {
            align-self: flex-start !important;
          }
          .testimonial-left-panel div div {
            justify-content: flex-start !important;
          }
          .testimonial-right-panel {
            flex: 0.75 !important;
          }
        }
      `}</style>
    </div>
  );
}
