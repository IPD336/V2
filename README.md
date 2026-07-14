# SkillSwap

**Trade What You Know. Learn What You Don't.**

SkillSwap is a peer-to-peer skill exchange platform where professionals connect, swap expertise, and grow together. Instead of paying for courses or tutoring, you trade your skills directly with others — you teach what you know and learn what you don't.

---

## Features

### Core Flow
- **Browse & Match** — Discover users by skill category with smart match scoring and mutual-match detection
- **Swap Requests** — Propose a skill exchange specifying what you offer and what you want in return
- **Real-time Workspaces** — Chat, set goals, and track progress together via Socket.IO
- **Completion & Reviews** — Mark swaps complete, leave ratings and feedback

### Gamification
- **Leagues** — Bronze → Silver → Gold → Platinum → Diamond based on rating × review count
- **Badges** — Early Bird, Team Player, Super Mentor, and more
- **Leaderboard** — Top-ranked users with percentile and league distribution

### Teams
- Create teams (2–4 people) with shared goals, invite members, and work together in a dedicated workspace

### Admin Dashboard
- Platform analytics (total users, swaps, teams, reviews)
- User management (ban/unban)
- Team management (delete)
- Emergency data reset

### UI/UX
- Dark/light theme with smooth transitions
- Mobile responsive with bottom navigation
- Scroll-triggered reveal animations
- Loading skeletons, error boundaries, empty states
- Confetti on swap completion
- Keyboard shortcuts (Escape to close modals)

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI library |
| Vite 6 | Build tool & dev server |
| React Router 7 | Routing |
| Axios | HTTP client |
| Socket.IO Client | Real-time messaging |

### Backend
| Technology | Purpose |
|---|---|
| Node.js | Runtime |
| Express 5 | HTTP framework |
| Mongoose 9 | MongoDB ODM |
| MongoDB | Database |
| Socket.IO 4 | WebSocket server |
| JSON Web Token | Authentication |
| Cloudinary + Multer | Avatar image uploads |

---

## Getting Started

### Prerequisites
- Node.js 20+
- MongoDB running locally on `mongodb://localhost:27017`

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/skillswap.git
cd skillswap

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Environment Variables

Create `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/skillswap
JWT_SECRET=your_jwt_secret_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

(Cloudinary credentials are optional — avatar uploads will fail without them, but the app runs fine otherwise.)

### Running Locally

```bash
# From the server directory — start the backend
cd server
npm run dev

# In a separate terminal — start the frontend
cd client
npm run dev
```

The client runs on `http://localhost:5173` and proxies `/api` requests to `http://localhost:5000`.

---

## Project Structure

```
skillswap/
├── client/                      # React frontend
│   ├── public/
│   │   └── favicon.svg          # Custom SVG logo
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js         # Axios instance with auth interceptor
│   │   ├── assets/              # Static assets
│   │   ├── components/
│   │   │   ├── AnimatedCounter.jsx
│   │   │   ├── Calendar.jsx
│   │   │   ├── CommandPalette.jsx
│   │   │   ├── ConfirmModal.jsx
│   │   │   ├── Confetti.jsx
│   │   │   ├── DateTimePicker.jsx
│   │   │   ├── DatePicker.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── FAQAccordion.jsx
│   │   │   ├── FollowsListModal.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Icons.jsx
│   │   │   ├── KeyboardShortcutsModal.jsx
│   │   │   ├── LineSidebar.jsx
│   │   │   ├── LoadingOverlay.jsx
│   │   │   ├── Logo.jsx
│   │   │   ├── MobileBottomNav.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── OnboardingModal.jsx
│   │   │   ├── Reveal.jsx
│   │   │   ├── Skeleton.jsx
│   │   │   ├── SkillConstellationDiagram.jsx
│   │   │   ├── SkillJourneyTimeline.jsx
│   │   │   ├── SkillOrbitDiagram.jsx
│   │   │   ├── Spinner.jsx
│   │   │   ├── SplashScreen.jsx
│   │   │   ├── SwapRequestModal.jsx
│   │   │   ├── TextRoll.jsx
│   │   │   └── TypingIndicator.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── SocketContext.jsx
│   │   │   ├── ThemeContext.jsx
│   │   │   └── ToastContext.jsx
│   │   ├── pages/
│   │   │   ├── Badges.jsx
│   │   │   ├── Browse.jsx
│   │   │   ├── CalendarPage.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── Landing.jsx
│   │   │   ├── Leaderboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── NotFound.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   ├── Swaps.jsx
│   │   │   ├── TeamDetail.jsx
│   │   │   ├── Teams.jsx
│   │   │   ├── UserProfile.jsx
│   │   │   └── Workspaces.jsx
│   │   ├── utils/
│   │   │   └── badges.jsx      # Badge definitions + BadgeIcon component
│   │   ├── utils.js            # Shared constants & helpers
│   │   ├── index.css           # Global styles
│   │   ├── App.jsx             # App shell + routes
│   │   └── main.jsx            # Entry point
│   ├── vite.config.js
│   └── vercel.json
│
├── server/                      # Express backend
│   ├── middleware/
│   │   ├── auth.js              # JWT verification
│   │   └── admin.js             # Admin role check
│   ├── models/
│   │   ├── User.js
│   │   ├── Swap.js
│   │   ├── Team.js
│   │   ├── Message.js
│   │   ├── Notification.js
│   │   └── Review.js
│   ├── routes/
│   │   ├── admin.js
│   │   ├── ai.js
│   │   ├── auth.js
│   │   ├── gamification.js
│   │   ├── leaderboard.js
│   │   ├── messages.js
│   │   ├── notifications.js
│   │   ├── reviews.js
│   │   ├── swaps.js
│   │   ├── teams.js
│   │   └── users.js
│   ├── services/
│   │   ├── emailService.js
│   │   ├── gamificationService.js
│   │   ├── geminiService.js
│   │   ├── matchService.js
│   │   └── notificationService.js
│   ├── scripts/
│   │   └── migrateBadges.js
│   ├── utils/
│   │   ├── cache.js
│   │   ├── cloudinary.js
│   │   ├── respond.js
│   │   ├── updateLeagues.js
│   │   └── validation.js
│   ├── constants.js            # Enums, badge definitions
│   ├── socket.js               # WebSocket events
│   ├── server.js               # Entry point
│   └── .env                    # Environment variables
│
├── .gitignore
└── README.md
```

---

## API Overview

| Route | Auth | Description |
|---|---|---|
| `POST /api/auth/register` | No | Create account |
| `POST /api/auth/login` | No | Sign in |
| `GET /api/auth/me` | Yes | Current user |
| `GET /api/users` | Yes | Browse users (paginated, filterable) |
| `GET /api/users/recommendations` | Yes | Personalized matches |
| `GET/PUT /api/users/:id` | Yes | Get/update profile |
| `POST /api/users/:id/save` | Yes | Save/unsave profile |
| `GET/POST /api/swaps` | Yes | List/create swap requests |
| `PUT /api/swaps/:id/accept` | Yes | Accept incoming request |
| `PUT /api/swaps/:id/complete` | Yes | Request completion |
| `GET /api/teams` | Yes | List teams (browse or mine) |
| `POST /api/teams` | Yes | Create team |
| `POST /api/teams/:id/invite` | Yes | Invite member |
| `POST /api/reviews` | Yes | Submit swap review |
| `GET /api/leaderboard` | Yes | Top 20 rankings |
| `GET/PUT /api/notifications` | Yes | Read notifications |
| `GET /api/admin/stats` | Admin | Platform statistics |

---

## License

MIT
