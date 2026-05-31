# UniLink — Nottingham Student Meetup App

A mobile app that helps Nottingham university students meet each other in real life instantly. Students select an activity, get matched with nearby students on campus, and a meetup is arranged in under 60 seconds.

## Run & Operate

- `pnpm --filter @workspace/mobile run dev` — run the Expo mobile app (port 18115)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- Scan the QR code in the Expo console with Expo Go to test on a real device

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo 54, Expo Router 6 (file-based routing)
- API: Express 5
- Storage: AsyncStorage (local persistence, no backend DB yet)
- Animations: React Native Reanimated 4
- Icons: @expo/vector-icons (Ionicons)
- Fonts: Inter via @expo-google-fonts/inter

## Where things live

- `artifacts/mobile/` — Expo app (all screens and components)
- `artifacts/mobile/app/` — Expo Router screens
  - `(auth)/` — login, register, verify, setup
  - `(tabs)/` — home, matching, meetup, profile, referral
- `artifacts/mobile/constants/` — activities config, university configs (UoN/NTU)
- `artifacts/mobile/contexts/` — AuthContext, SessionContext, LiveActivityContext
- `artifacts/mobile/components/` — Avatar, ActivityTile, CountdownTimer, SafetySheet, UniversityBadge
- `artifacts/api-server/` — Express API (ready for backend features)

## Product

**Target universities**: University of Nottingham (@nottingham.ac.uk) and Nottingham Trent University (@ntu.ac.uk)

**Core flow**: Open app → "I'm Free Right Now" or pick activity → campus-aware matching radar → meetup session with countdown timer and campus location

**Key features**:
- UoN and NTU university email verification with colored badges
- 4 campus locations: University Park, Jubilee (UoN), City Campus, Clifton (NTU)
- 8 activities: Study Together, Coffee Chat, Lunch, Football, Gym Partner, Gaming, Night Out, Society Meetup
- "I'm Free Right Now" button — marks user active for 60 minutes
- Live stats: total active students, UoN vs NTU breakdown, per-activity counts
- Meetup sessions: 30-min countdown, confirm attendance, campus-specific locations
- Safety: report user, block user, leave meetup, emergency help
- Referral system: unique codes, reward tiers (1/3/5/10 referrals), campus ambassador program
- Profiles: first name, university badge, reliability score, referral code

## Architecture decisions

- Frontend-only MVP — all state in AsyncStorage, no backend DB calls yet
- LiveActivityContext simulates real-time student counts (updates every 30s with seeded RNG for realistic variation)
- SessionContext handles meetup lifecycle: creation → countdown → expiry
- Campus selection gates activity matching — forces users to identify their location first
- No tab bar by design — stack-only navigation (Uber-style flow)

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- `(tabs)` route group is used as the main app group but has no actual tab bar — just a Stack
- `pnpm run dev` at workspace root is not supported; use the workflow or `--filter` flag
- The "shadow*" deprecation warning in console is non-critical (RN web compat warning)
