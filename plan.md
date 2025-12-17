# Licheckers - Full Project Plan

## Overview

Licheckers is a modern, real-time checkers platform inspired by Lichess. It will support human vs computer gameplay, multiplayer matches, and configurable time controls.

---

## Core Features

### 1. Game Modes
- **Play vs Computer** - AI opponent with multiple difficulty levels (Easy, Medium, Hard, Expert)
- **Play vs Human** - Real-time multiplayer with matchmaking
- **Play with Friend** - Create private game links to share
- **Local Play** - Two players on same device (pass & play)

### 2. Time Controls
| Format | Time + Increment | Style |
|--------|------------------|-------|
| Bullet | 1+0, 2+1 | Fast-paced |
| Blitz | 3+0, 3+2, 5+0, 5+3 | Quick games |
| Rapid | 10+0, 10+5, 15+10 | Standard |
| Classical | 30+0, 30+20 | Long form |
| Unlimited | ∞ | No time pressure |

### 3. Game Rules Support
- **American Checkers** (8x8 board, standard rules) - Primary
- Optional future variants: International Draughts (10x10), Brazilian, etc.

---

## Technical Architecture

### Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (PWA)                          │
│  React + TypeScript + Vite + vite-plugin-pwa                │
│  - TailwindCSS for styling                                  │
│  - Framer Motion for animations                             │
│  - Socket.io-client for real-time                           │
│  - Workbox for service worker / offline                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                               │
│  Node.js + Express + TypeScript                             │
│  - Socket.io for WebSocket connections                      │
│  - Passport.js (Google OAuth + Local email/password)        │
│  - JWT for session tokens                                   │
│  - bcrypt for password hashing                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       DATABASE                               │
│  PostgreSQL                                                 │
│  - User accounts & auth                                     │
│  - Game history                                             │
│  - Ratings/ELO                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Authentication System

### Auth Methods
1. **Email/Password** - Traditional signup with email verification
2. **Google OAuth** - One-click sign in with Google

### Auth Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Client     │────▶│   Server     │────▶│   Database   │
│              │     │              │     │              │
│  Login Form  │     │  Passport.js │     │  Users Table │
│  GoogleBtn   │     │  JWT Issue   │     │  Sessions    │
└──────────────┘     └──────────────┘     └──────────────┘
        │                   │
        │◀──────────────────│
        │   JWT Token       │
        │   (httpOnly cookie│
        │    or localStorage)
```

### Auth Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/register` | POST | Email/password signup |
| `/auth/login` | POST | Email/password login |
| `/auth/google` | GET | Initiate Google OAuth |
| `/auth/google/callback` | GET | Google OAuth callback |
| `/auth/logout` | POST | Clear session |
| `/auth/me` | GET | Get current user |
| `/auth/verify-email` | POST | Email verification |
| `/auth/forgot-password` | POST | Password reset request |
| `/auth/reset-password` | POST | Set new password |

### Security Considerations
- Passwords hashed with bcrypt (12 rounds)
- JWT tokens with short expiry (15min access, 7d refresh)
- CSRF protection
- Rate limiting on auth endpoints
- Secure httpOnly cookies for tokens

---

## PWA Architecture

### PWA Requirements Checklist

- [ ] **Web App Manifest** (`manifest.json`)
- [ ] **Service Worker** (offline support, caching)
- [ ] **HTTPS** (required for PWA)
- [ ] **Responsive Design** (mobile-first)
- [ ] **App Icons** (multiple sizes: 192x192, 512x512, maskable)
- [ ] **Splash Screens**
- [ ] **Offline Functionality**
- [ ] **Push Notifications** (game invites, your turn alerts)

### Manifest Configuration

```json
{
  "name": "Licheckers",
  "short_name": "Licheckers",
  "description": "Play checkers online - vs computer or friends",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#1a1a2e",
  "theme_color": "#e94560",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "screenshots": [
    { "src": "/screenshots/game.png", "sizes": "1080x1920", "type": "image/png" }
  ],
  "categories": ["games", "entertainment"]
}
```

### Service Worker Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    CACHING STRATEGY                          │
├─────────────────────────────────────────────────────────────┤
│  Static Assets (JS, CSS, images)                            │
│  → Cache First, Network Fallback                            │
├─────────────────────────────────────────────────────────────┤
│  API Calls (/api/*)                                         │
│  → Network First, Cache Fallback                            │
├─────────────────────────────────────────────────────────────┤
│  Game State                                                 │
│  → Network Only (real-time critical)                        │
├─────────────────────────────────────────────────────────────┤
│  User Profile, History                                      │
│  → Stale While Revalidate                                   │
└─────────────────────────────────────────────────────────────┘
```

### Offline Capabilities
- Play vs Computer (fully offline)
- View past games
- Queue moves when reconnecting
- "You're offline" indicator with graceful degradation

---

## App Store Deployment

### Google Play Store (Android)
**Method: Trusted Web Activity (TWA)**

```
┌──────────────────────────────────────────────────────────────┐
│  1. PWA meets all Lighthouse PWA criteria                    │
│  2. Use Bubblewrap CLI to generate Android project           │
│  3. Sign APK with release keystore                           │
│  4. Upload to Google Play Console                            │
│  5. Set up Digital Asset Links for verification              │
└──────────────────────────────────────────────────────────────┘
```

**Requirements:**
- Lighthouse PWA score > 90
- `.well-known/assetlinks.json` for domain verification
- Privacy policy URL
- App screenshots & descriptions

### Apple App Store (iOS)
**Method: PWABuilder or Capacitor wrapper**

```
┌──────────────────────────────────────────────────────────────┐
│  Option A: PWABuilder                                        │
│  - Generates Xcode project from PWA                          │
│  - Uses WKWebView under the hood                             │
│  - Limited native features                                   │
├──────────────────────────────────────────────────────────────┤
│  Option B: Capacitor (Recommended)                           │
│  - Wrap PWA in native iOS shell                              │
│  - Access to native APIs (push, haptics)                     │
│  - Better App Store approval chances                         │
└──────────────────────────────────────────────────────────────┘
```

**iOS Considerations:**
- Apple requires apps to provide value beyond just a website wrapper
- Push notifications require APNs integration
- In-app purchases if adding premium features
- Must test on real devices before submission

### Microsoft Store (Windows)
**Method: PWABuilder**
- Easiest path - PWABuilder generates MSIX package
- Direct PWA support in Windows 11

---

## Database Schema

```sql
-- Users table with auth support
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255),          -- NULL for OAuth-only users
  avatar_url VARCHAR(500),
  
  -- Auth metadata
  auth_provider VARCHAR(20) DEFAULT 'local',  -- 'local', 'google'
  google_id VARCHAR(255) UNIQUE,
  email_verified BOOLEAN DEFAULT FALSE,
  email_verify_token VARCHAR(255),
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP,
  
  -- Game stats
  rating INTEGER DEFAULT 1200,
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_seen_at TIMESTAMP
);

-- Refresh tokens for JWT auth
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Games table
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Players (NULL user_id = guest or computer)
  red_user_id UUID REFERENCES users(id),
  black_user_id UUID REFERENCES users(id),
  is_vs_computer BOOLEAN DEFAULT FALSE,
  computer_difficulty VARCHAR(20),
  
  -- Game settings
  time_control VARCHAR(20),            -- '5+3', '10+0', 'unlimited'
  initial_time_ms INTEGER,
  increment_ms INTEGER,
  
  -- Game state
  status VARCHAR(20) DEFAULT 'ongoing', -- ongoing, red_wins, black_wins, draw, aborted
  end_reason VARCHAR(30),               -- checkmate, timeout, resignation, draw_agreement
  moves JSONB,                          -- Array of moves with timestamps
  final_position TEXT,                  -- FEN-like notation
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  ended_at TIMESTAMP
);

-- Push notification subscriptions
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  endpoint VARCHAR(500) NOT NULL,
  p256dh VARCHAR(255) NOT NULL,
  auth VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_games_red_user ON games(red_user_id);
CREATE INDEX idx_games_black_user ON games(black_user_id);
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_users_rating ON users(rating);
```

---

## Project Structure

```
licheckers/
├── client/                        # React PWA
│   ├── public/
│   │   ├── icons/                 # PWA icons (multiple sizes)
│   │   ├── screenshots/           # App store screenshots
│   │   └── manifest.json          # Web app manifest
│   ├── src/
│   │   ├── components/
│   │   │   ├── Board/
│   │   │   ├── Piece/
│   │   │   ├── Clock/
│   │   │   ├── GameControls/
│   │   │   ├── Lobby/
│   │   │   └── Auth/              # Login, Register, OAuth buttons
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx    # Auth state provider
│   │   │   └── GameContext.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useGame.ts
│   │   │   ├── useSocket.ts
│   │   │   └── useOffline.ts      # Offline detection
│   │   ├── lib/
│   │   │   ├── checkers.ts
│   │   │   ├── api.ts             # API client
│   │   │   └── auth.ts            # Auth utilities
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Profile.tsx
│   │   │   ├── Play.tsx
│   │   │   └── Game.tsx
│   │   ├── sw.ts                  # Service worker
│   │   └── App.tsx
│   ├── vite.config.ts             # PWA plugin config
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── auth/
│   │   │   ├── passport.ts        # Passport strategies
│   │   │   ├── jwt.ts             # JWT utilities
│   │   │   └── routes.ts          # Auth endpoints
│   │   ├── game/
│   │   │   ├── GameManager.ts
│   │   │   ├── CheckersEngine.ts
│   │   │   └── Clock.ts
│   │   ├── ai/
│   │   │   └── ComputerPlayer.ts
│   │   ├── matchmaking/
│   │   │   └── MatchQueue.ts
│   │   ├── push/
│   │   │   └── notifications.ts   # Web push
│   │   ├── socket/
│   │   │   └── handlers.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts            # JWT verification
│   │   │   └── rateLimit.ts
│   │   └── index.ts
│   └── package.json
│
├── shared/
│   ├── types.ts
│   └── constants.ts
│
├── capacitor/                     # iOS/Android native wrapper
│   ├── ios/
│   ├── android/
│   └── capacitor.config.ts
│
└── package.json
```

---

## Development Phases

### Phase 1: Foundation (Week 1)
- [ ] Set up monorepo with Turborepo/npm workspaces
- [ ] Configure Vite + React + TypeScript + TailwindCSS
- [ ] Set up Express server with TypeScript
- [ ] Configure PostgreSQL with Drizzle ORM or Prisma
- [ ] Implement checkers game engine

### Phase 2: Authentication (Week 1-2)
- [ ] Email/password registration & login
- [ ] Google OAuth integration
- [ ] JWT token management
- [ ] Email verification flow
- [ ] Password reset flow
- [ ] Protected routes on frontend

### Phase 3: Core Game (Week 2)
- [ ] Interactive board UI
- [ ] Local play mode
- [ ] Computer opponent (AI)
- [ ] Time controls & clocks

### Phase 4: Multiplayer (Week 3)
- [ ] WebSocket server setup
- [ ] Real-time game state sync
- [ ] Matchmaking queue
- [ ] Private game links
- [ ] Spectator mode

### Phase 5: PWA & Offline (Week 4)
- [ ] Web app manifest
- [ ] Service worker with Workbox
- [ ] Offline vs Computer play
- [ ] Push notifications (your turn, game invite)
- [ ] Install prompts

### Phase 6: App Store Prep (Week 5)
- [ ] Lighthouse PWA audit (score > 90)
- [ ] Generate Android TWA with Bubblewrap
- [ ] Set up Capacitor for iOS
- [ ] Create app store assets (icons, screenshots, descriptions)
- [ ] Privacy policy & terms of service pages
- [ ] Submit to stores

### Phase 7: Polish & Launch (Week 6)
- [ ] Animations & sound effects
- [ ] User profiles & game history
- [ ] Leaderboards
- [ ] Mobile responsive fine-tuning
- [ ] Performance optimization
- [ ] Bug fixes & testing

---

## Game Engine Design

### Board Representation
```
  0   1   2   3   4   5   6   7
┌───┬───┬───┬───┬───┬───┬───┬───┐
│   │ b │   │ b │   │ b │   │ b │ 0
├───┼───┼───┼───┼───┼───┼───┼───┤
│ b │   │ b │   │ b │   │ b │   │ 1
├───┼───┼───┼───┼───┼───┼───┼───┤
│   │ b │   │ b │   │ b │   │ b │ 2
├───┼───┼───┼───┼───┼───┼───┼───┤
│   │   │   │   │   │   │   │   │ 3
├───┼───┼───┼───┼───┼───┼───┼───┤
│   │   │   │   │   │   │   │   │ 4
├───┼───┼───┼───┼───┼───┼───┼───┤
│ r │   │ r │   │ r │   │ r │   │ 5
├───┼───┼───┼───┼───┼───┼───┼───┤
│   │ r │   │ r │   │ r │   │ r │ 6
├───┼───┼───┼───┼───┼───┼───┼───┤
│ r │   │ r │   │ r │   │ r │   │ 7
└───┴───┴───┴───┴───┴───┴───┴───┘
```

### Core Game Logic Requirements
1. **Move validation** - Legal move detection, mandatory captures
2. **Multi-jump sequences** - Chain captures in single turn
3. **King promotion** - When reaching opposite end
4. **Win detection** - No pieces left, no legal moves, timeout, resignation
5. **Draw detection** - Agreement, repetition, 40-move rule

### AI Engine (Computer Opponent)
- **Algorithm**: Minimax with Alpha-Beta pruning
- **Difficulty levels**:
  - Easy: Depth 2, random among good moves
  - Medium: Depth 4
  - Hard: Depth 6-8
  - Expert: Depth 10+ with evaluation tuning
- **Position evaluation**: Material count, king value, center control, advancement

---

## Push Notification Strategy

### Notification Types
| Event | Title | Body |
|-------|-------|------|
| Game Invite | "Game Invitation" | "{username} wants to play!" |
| Your Turn | "Your Turn" | "Make your move vs {opponent}" |
| Game Result | "Game Over" | "You won/lost against {opponent}" |
| Rematch Request | "Rematch?" | "{opponent} wants a rematch" |

### Implementation
- Use Web Push API with VAPID keys
- Store subscriptions in database per user
- Send via `web-push` npm package on server
- Handle notification clicks to open specific game

