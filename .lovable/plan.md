# Landing Page — Waitlist + Investor Hybrid

Replace the current `/` route (which redirects logged-in users) with a bold, public marketing landing page. Auth flow moves to `/auth` so unauthenticated visitors always land on the marketing page first.

## Design commitments

- **Palette:** Charcoal & Ember — `#1a1a1a` base, `#2d2d2d` surface, `#4a4a4a` muted, `#e85d3a` ember accent. Wired into `index.css` HSL tokens.
- **Typography:** Space Grotesk (display) + DM Sans (body), loaded via Google Fonts.
- **Feel:** Industrial, confident, dark. Grain texture overlay, oversized display type, ember accent used sparingly for CTAs and key numbers. Framer Motion for hero reveal and scroll-triggered stat counters.

## Page structure

```text
┌─────────────────────────────────────────────┐
│ NAV: logo · Product · Investors · Sign in   │
├─────────────────────────────────────────────┤
│ HERO                                        │
│   Eyebrow: "In development · 2026"          │
│   Headline: The operating system for        │
│             shopping cart fleets            │
│   Sub: One line on the problem              │
│   [Join waitlist →]  [Investor deck →]      │
│   Trust row: "Backed by pilots at N stores" │
├─────────────────────────────────────────────┤
│ PROBLEM — 3 stat cards (broken carts,       │
│ lost revenue, wasted labor)                 │
├─────────────────────────────────────────────┤
│ SOLUTION — 3 feature blocks                 │
│  (QR inspections · Work orders · AI predict)│
├─────────────────────────────────────────────┤
│ TRACTION / WHY NOW — market size, timing    │
├─────────────────────────────────────────────┤
│ INVESTOR SECTION (anchor #investors)        │
│  Opportunity summary + [Request deck] CTA   │
│  → opens dialog with name/email/firm form   │
├─────────────────────────────────────────────┤
│ WAITLIST SECTION (anchor #waitlist)         │
│  Email capture + role selector (store /     │
│  provider / investor / other)               │
├─────────────────────────────────────────────┤
│ FOOTER — links, contact, © Cart Repair Pros │
└─────────────────────────────────────────────┘
```

Placeholder investor copy will be drafted (market size, vision, ask) with clearly-marked TODOs so you can swap in real numbers later.

## Routing changes

- New `/` → `Landing.tsx` (public, no auth check).
- Move existing `/` (login redirect logic) to `/auth`.
- Update `signInService` / `checkSession` / any `<Navigate to="/">` to point at `/auth` for the login surface, and at `/dashboard` etc. for signed-in redirects.
- Landing "Sign in" nav button links to `/auth`.

## Data capture

Two new Supabase tables (RLS: anon INSERT only, authenticated corp_admin SELECT):

- `waitlist_signups` (id, email, role, source, created_at)
- `investor_leads` (id, name, email, firm, message, created_at)

Both writable by anon so the forms work without login. GRANTs added per public-schema rules.

## SEO

- Update `<title>` / `<meta description>` / OG tags in `index.html` to marketing copy.
- Sitemap already lists `/`; robots already allows it — no change needed.
- Add JSON-LD `Organization` + `WebSite` schema.

## Technical notes

- New files: `src/pages/Landing.tsx` plus small section components under `src/components/landing/` (Hero, Problem, Solution, Traction, InvestorCTA, WaitlistForm, Footer, Nav).
- Design tokens extended in `src/index.css` (ember accent + dark surfaces) and `tailwind.config.ts`.
- Framer Motion already in project — reuse.
- Forms use react-hook-form + zod (already installed) and write to Supabase via the anon client.
- One migration for the two capture tables with GRANTs and RLS policies.

## Out of scope

- Real investor numbers (placeholders with TODO comments).
- Email notifications on new signups (can add later via edge function).
- Custom hero illustration / 3D — using typography + motion for impact instead.
