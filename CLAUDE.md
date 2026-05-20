# Crop Circle — UI/Aesthetics & Branding Agent

## Mission
Improve the Crop Circle agricultural monitoring platform at /opt/crop-circle with a focus on:
1. **Beautiful, aesthetically pleasing UI** — inspired by modern agricultural/farmtech design (think John Deere Operations Center, Granular, Climate Corp.)
2. **Simple, distinctive logo** — crop circle motif that is memorable and professional

## Context
- React 18 + Vite + TypeScript + Tailwind v4 + shadcn/ui + Mapbox GL
- PWA already configured with icons (SVG and PNG)
- Supabase connected, seeded with mock field data
- Pages: Landing, Dashboard, Fields list, Field Detail, AI Insights, Reports
- Design reference: John Deere Ops Center, Granular, climate.com — clean, professional farmtech SaaS

## Tasks

### 1. Logo Design
Create a new `public/logo.svg` that is:
- Simple, memorable crop circle mark
- Professional for mobile app icons and web favicon/header
- Palette: greens (#22c55e, #16a34a) + earth tones
- Must work at 16px (favicon), 32px (header), 192px/512px (PWA icons)
- Regenerate the PWA icon PNGs after any logo change (run `node scripts/generate-pwa-icons.js`)

### 2. UI Polish
Review and improve the existing components in `/opt/crop-circle/src/` for:
- **LandingPage** — Hero section, call-to-action, feature highlights. Make it feel premium.
- **DashboardPage** — Cards, stats layout, visual hierarchy
- **FieldCard** — Thumbnail, key metrics, health indicators
- **MapView** — Map styling, controls overlay, field selection states
- **WeatherPanel / SoilChart / NDVIViewer** — Data visualization, spacing, typography
- **AIInsightsPage / AIChatWidget** — Chat UI polish, insight cards

Specifics:
- Consistent spacing/padding using Tailwind's 4px grid
- Color palette: greens for health/growth, amber/orange for warnings, red for alerts
- Font hierarchy: bold headings, clean body text, muted secondary info
- Card hover states with subtle shadows and scale transforms
- Loading skeletons for async data
- Empty states with helpful copy and icons

### 3. Mobile PWA Polish
- Verify all PWA meta tags in `index.html` are correct
- Check `viewport-fit=cover` and safe area handling for iOS notch/home indicator
- Ensure tap targets (buttons, inputs) are at least 44x44px on mobile
- Improve the mobile navigation: bottom nav or hamburger with slide-out drawer
- Review responsive breakpoints — should look great on 375px–1440px widths

### 4. Build & Commit
- After any logo or UI changes, run `npm run build` to confirm clean compile
- Commit with message: `feat: UI polish and logo redesign`
- Push to GitHub: `git push`

## Constraints
- No API keys or secrets in any file
- Do NOT change the routing structure or data fetching logic (those tasks are for other agents)
- Keep shadcn/ui components — do not replace them wholesale
- PWA must remain functional (Service Worker, offline caching)
- Do NOT add mock/demo data — real APIs only

## Verification
- `npm run build` must exit 0
- PWA icons must be valid PNG files (192x192, 512x512, maskable)
- Logo SVG must render cleanly from 16px to 512px