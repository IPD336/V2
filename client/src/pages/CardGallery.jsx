import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { ProfileCard } from '../components/CardStyles';

const CARD_STYLES_INFO = [
  { id: 'style-1', name: 'Classic Flat', desc: 'Flat colored header banner, rounded square avatar on the left, ratings/reviews on the front, clean matching banner.' },
  { id: 'style-2', name: 'Glassmorphic Spotlight', desc: 'Sleek frosted glass card overlay with a cursor-following spotlight glow effect.' },
  { id: 'style-3', name: 'Modern Minimalist', desc: 'No banner header, clean border matching the league color, circular avatar with custom ring, compact layout.' },
  { id: 'style-4', name: '3D Flip Card (Current)', desc: 'Interactive double-sided card that flips to show followers, stats, and social links.' },
  { id: 'style-5', name: 'Glassmorphic 3D Flip', desc: 'Double-sided 3D flipping card with glass textures and custom neon borders matching league level.' },
  { id: 'style-6', name: 'Horizontal List Card', desc: 'Wide horizontal layout designed for smooth list scrolling on desktops.' },
  { id: 'style-7', name: 'Cyberpunk (Theme-Aligned)', desc: 'Theme-matching cybernetic card with digital grids, animated scanner lines, and custom monospace layouts.' },
  { id: 'style-8', name: 'Compact Density', desc: 'Ultra-compact card displaying only essential tags and ratings, optimized for high-density grids.' },
  { id: 'style-9', name: 'Expandable Accordion', desc: 'Flat card with a clean slide-down drawer showing reviews and detailed stats without flipping.' },
  { id: 'style-10', name: 'AI Match-Centric', desc: 'Brings matching score to the center with a large Match Percentage bubble on the header.' },
  { id: 'style-11', name: 'Cyberpunk Flat', desc: 'Theme-aligned cyberpunk style featuring a flat header banner and square avatar.' },
  { id: 'style-12', name: 'Neo-Classic Glass', desc: 'Frosted glass container combined with a classic flat color header and gold borders.' },
  { id: 'style-13', name: 'Minimalist Tech Grid', desc: 'A clean layout featuring a dotted background grid pattern, circular avatar, and minimal details.' },
  { id: 'style-14', name: 'Cyber-Terminal Console', desc: 'A monospace retro terminal console interface showing shell-like parameters and indicators.' },
  { id: 'style-15', name: 'AI-Smart Compact', desc: 'An AI-driven high-density card focusing on recommendations, match score, and direct actions.' },
];

const MOCK_PREVIEW_USERS = [
  {
    _id: 'mock1',
    name: 'IPD',
    bio: 'Full Stack Engineer passionate about UI/UX design and React applications. Creating robust tools.',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    avatarColor: '#3B4F8C',
    league: { name: 'Gold', color: '#B8902A' },
    location: 'Ahmedabad, Gujarat, India',
    rating: 5.0,
    reviewCount: 12,
    followersCount: 84,
    availability: 'Weekends',
    skillsOffered: [
      { name: 'React', verified: true },
      { name: 'HTML', verified: false },
      { name: 'CSS', verified: false }
    ],
    skillsWanted: ['Python', 'Docker'],
    aiMatchExplanation: 'You both share React and Python categories.',
    matchScore: 92,
    socialLinks: { linkedin: 'https://linkedin.com', github: 'https://github.com' }
  },
  {
    _id: 'mock2',
    name: 'Priya Kapoor',
    bio: 'Software engineer focusing on Python scripting, AWS architectures, and data engineering solutions.',
    avatarColor: '#3A6351',
    league: { name: 'Bronze', color: '#cd7f32' },
    location: 'London, UK',
    rating: 4.8,
    reviewCount: 6,
    followersCount: 45,
    availability: 'Flexible / Any Time',
    skillsOffered: [
      { name: 'Python', verified: true },
      { name: 'AWS', verified: true }
    ],
    skillsWanted: ['React', 'TypeScript'],
    aiMatchExplanation: 'Priya offers Python, which matches your wants list!',
    matchScore: 84,
    socialLinks: { linkedin: 'https://linkedin.com', portfolio: 'https://portfolio.com' }
  },
  {
    _id: 'mock3',
    name: 'Liam O\'Brien',
    bio: 'DevOps professional specializing in Docker containers, CI/CD automated pipelines, and Kubernetes.',
    avatarColor: '#c9a040',
    league: { name: 'Silver', color: '#8e9eab' },
    location: 'Dublin, Ireland',
    rating: 4.5,
    reviewCount: 3,
    followersCount: 19,
    availability: 'Weekdays',
    skillsOffered: [
      { name: 'Docker', verified: true },
      { name: 'CI/CD', verified: true }
    ],
    skillsWanted: ['Machine Learning', 'Go'],
    aiMatchExplanation: 'Liam wants Go, which matches your offerings.',
    matchScore: 68,
    socialLinks: { github: 'https://github.com' }
  }
];

export default function CardGallery() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [selectedStyle, setSelectedStyle] = useState(localStorage.getItem('ss_card_style') || 'style-1');
  const [previewStyle, setPreviewStyle] = useState(selectedStyle);

  // Fetch some real users to render in the gallery for a live feel, but fall back to mock users
  const { data: realUsers } = useQuery({
    queryKey: ['gallery-users'],
    queryFn: () => api.get('/users', { params: { limit: 3 } }).then(res => res.data.users),
    staleTime: 60_000,
  });

  const previewUsers = realUsers && realUsers.length >= 2 
    ? realUsers.slice(0, 3).map((u, idx) => ({ ...MOCK_PREVIEW_USERS[idx], ...u })) // merge with mock properties for richer details
    : MOCK_PREVIEW_USERS;

  const handleApplyStyle = () => {
    localStorage.setItem('ss_card_style', previewStyle);
    setSelectedStyle(previewStyle);
    showToast(`Card style changed to: ${CARD_STYLES_INFO.find(s => s.id === previewStyle).name}! ★`);
  };

  const handleSwapMock = (user) => {
    showToast(`Swap modal would open for: ${user.name}`);
  };

  const handleFollowMock = (userId) => {
    showToast(`Follow status toggled for: ${userId}`);
  };

  const handleTagClickMock = (tag) => {
    showToast(`Filtering by tag: ${tag}`);
  };

  return (
    <div className="page bg-gradient-subtle page-fade-in" style={{ minHeight: '100vh', paddingBottom: 80 }}>
      <div className="container">
        
        <div className="page-header" style={{ padding: '0 0 24px 0', borderBottom: '1px solid var(--border)', marginBottom: 32 }}>
          <div className="section-label">UI Themes</div>
          <div className="section-title" style={{ margin: 0 }}>Card Design <em>Playground</em></div>
          <p style={{ color: 'var(--muted)', marginTop: 8, fontSize: 14 }}>
            Explore 10 different premium layouts for the skill cards. Choose your favorite design to customize the Browse page.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 32, alignItems: 'start' }}>
          
          {/* Sidebar selector */}
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--muted)' }}>Select Card Style</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {CARD_STYLES_INFO.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setPreviewStyle(style.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    textAlign: 'left',
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: previewStyle === style.id ? '2px solid var(--accent)' : '1px solid var(--border)',
                    background: previewStyle === style.id ? 'var(--accent-light)' : 'transparent',
                    color: previewStyle === style.id ? 'var(--accent)' : 'var(--ink)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    width: '100%'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {style.name}
                    {selectedStyle === style.id && <span style={{ fontSize: 10, background: 'var(--gold)', color: 'white', padding: '1px 5px', borderRadius: 4, fontWeight: 800 }}>ACTIVE</span>}
                  </div>
                  <span style={{ fontSize: 11, color: previewStyle === style.id ? 'var(--accent)' : 'var(--muted)', marginTop: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', opacity: 0.85 }}>
                    {style.desc}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={handleApplyStyle}
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--accent)',
                color: 'white',
                border: 'none',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 13.5,
                cursor: 'pointer',
                transition: 'all 0.2s',
                marginTop: 10
              }}
            >
              Apply Style globally
            </button>
          </div>

          {/* Preview grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--muted)' }}>
                PREVIEWING: <span style={{ color: 'var(--ink)', fontWeight: 800 }}>{CARD_STYLES_INFO.find(s => s.id === previewStyle).name}</span>
              </div>
              <button className="btn-ghost" onClick={() => navigate('/browse')} style={{ fontSize: 12, padding: '6px 14px' }}>
                Go to Browse page →
              </button>
            </div>

            <div 
              className="cards-grid" 
              style={{ 
                gridTemplateColumns: previewStyle === 'style-6' ? '1fr' : 'repeat(auto-fill, minmax(275px, 1fr))',
                gap: 20 
              }}
            >
              {previewUsers.map((user, idx) => (
                <ProfileCard
                  key={user._id || idx}
                  styleId={previewStyle}
                  user={user}
                  onSwap={handleSwapMock}
                  onFollow={handleFollowMock}
                  isFollowing={idx === 0}
                  isOnline={idx !== 2}
                  index={idx}
                  onTagClick={handleTagClickMock}
                />
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
