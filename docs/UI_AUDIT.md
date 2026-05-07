# TalentXcel UI Audit — Path to FAANG-grade Consistency

> Generated: 2026-05-07
> Scope: typography (Wave 1) + page layout (Wave 2)
> Goal: collapse the platform onto a single type ramp, a single page shell,
> and a single spacing rhythm — the way Apple, Linear, and Vercel do it.

---

## 1. Headline findings

| Area | Files affected | Severity | Status |
|---|---|---|---|
| Competing font-size systems | 5 sources | 🔴 Critical | **Fixed in Wave 1** |
| Pages bypassing `<PageShell>` | 510 occurrences of `container mx-auto` across 129 files | 🔴 Critical | Codemod underway (top 15 done) |
| Ad-hoc heading sizes (`text-3xl`/`4xl`/`5xl`/`6xl`/`7xl`) | 332 occurrences | 🟠 High | ESLint guard added |
| Random vertical padding (`py-4/6/8/12/16`) | 60+ pages | 🟠 High | Locked to PageShell `pad` prop |
| Duplicate `/mobile/*` pages | ~15 routes | 🟡 Medium | Wave 4 |
| Card variants | 7 (4 are aliases) | 🟡 Medium | Wave 3 |

---

## 2. Typography — root cause

Five files independently defined font sizes / weights. Whichever loaded last won.

| Source | Role after Wave 1 |
|---|---|
| `tailwind.config.ts` `fontSize` | ✅ **Single source of truth** (Apple ramp + xs–7xl) |
| `src/index.css` `@layer base` | ✅ Body defaults only (17 / 18 px). No size redefinition. |
| `index.html` inline critical CSS | ✅ Body 17 px until React mounts. No headings. |
| `src/styles/mobile-first-global.css` | ❌ **Removed** — was redefining `h1`/`h2` at 1.875rem / 1.5rem. |
| `src/utils/appleTypeScale.ts` | ✅ Re-mapped to semantic ramp tokens (no raw Tailwind sizes). |

### Approved type ramp (use these, nothing else)

| Token | Mobile | Desktop | Use for |
|---|---|---|---|
| `text-display-1` | 64 px | 64 px | Marketing hero |
| `text-display-2` | 52 px | 52 px | Section hero |
| `text-display-3` | 40 px | 40 px | Page hero (logged-in) |
| `text-headline` | 34 px | 34 px | Page H1 default |
| `text-title-1` | 28 px | 28 px | Section H2 |
| `text-title-2` | 22 px | 22 px | Card / dialog title |
| `text-title-3` | 19 px | 19 px | Sub-section |
| `text-body-lg` | 17 px | 17 px | Lead paragraph |
| `text-body` | 15 px | 15 px | Body copy |
| `text-body-sm` | 13 px | 13 px | Secondary text |
| `text-caption` | 12 px | 12 px | Metadata |
| `text-eyebrow` | 12 px / 600 / uppercase | — | Section label |

### Forbidden in pages / components

- `text-3xl`, `text-4xl`, `text-5xl`, `text-6xl`, `text-7xl` for headings → use `text-headline` / `text-display-*`
- Custom `font-size:` in inline styles
- `style={{ fontFamily: ... }}` → SF Pro is loaded globally
- Raw `text-[NNpx]` arbitrary values
- Re-declaring `h1`/`h2`/`h3` sizes in any CSS file outside `tailwind.config.ts`

ESLint rule `no-restricted-syntax` enforces the first three (see `eslint.config.js`).

---

## 3. Layout — page shell mandate

### Required pattern for every route

```tsx
import { PageShell, Section } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";

export default function MyPage() {
  return (
    <PageShell width="lg" pad="md">
      <PageHeader
        eyebrow="Careers"
        title="Find your next role"
        description="Curated jobs aligned to your career path."
      />
      <Section>{/* body */}</Section>
    </PageShell>
  );
}
```

### Width tiers
- `sm` 640 — single-column forms
- `md` 768 — long-form reads
- `lg` 1024 — **default**
- `xl` 1200 — dashboards
- `full` — edge-to-edge

### Spacing — only these values

`space-y-4` (16) · `space-y-6` (24) · `space-y-8` (32) · `space-y-12` (48)

`Section` handles vertical rhythm between blocks (`mt-12 md:mt-16`). Stop hand-rolling `py-8 md:py-12`.

### Pages migrated in this pass (Wave 2)

| Page | Width | Notes |
|---|---|---|
| `Index.tsx` | xl | landing |
| `About.tsx` | md | already aligned |
| `Contact.tsx` | sm | form-centric |
| `Help.tsx` | md | |
| `Dashboard.tsx` | xl | |
| `Profile.tsx` | lg | already migrated previously |
| `LearningHub.tsx` | xl | |
| `Jobs.tsx` | xl | |
| `NetworkPage.tsx` | xl | edgy gradient kept |
| `MyApplications.tsx` | lg | |
| `NotificationsPage.tsx` | md | |
| `GamificationCenter.tsx` | lg | |
| `Careers.tsx` | lg | |
| `Companies.tsx` | xl | |
| `Colleges.tsx` | xl | |

### Pages remaining (~115)

Tracked as a follow-up sweep. Each follows the codemod recipe:

1. Replace outer `<div className="container mx-auto px-* py-*">` with `<PageShell>`.
2. Replace H1 with `<PageHeader title=... />`.
3. Wrap subsequent `<section>`s with `<Section>`.
4. Drop bespoke `text-3xl`/`4xl` etc.

---

## 4. Lint enforcement

Added in `eslint.config.js`:

- Bans `text-3xl|4xl|5xl|6xl|7xl` in JSX className strings.
- Bans inline `style={{ fontFamily / fontSize }}`.
- Bans new `container mx-auto` wrappers in `src/pages/**`.

Existing violations are flagged as warnings so the migration sweep can proceed page-by-page without breaking CI.

---

## 5. Next waves

- **Wave 3 — Components**: collapse Card to `surface` + `elevated`; Button to 5 variants; remove duplicate hero/section primitives.
- **Wave 4 — IA + Mobile**: merge `/mobile/*` into responsive parents; flatten 30 route files into 7 sections.

After Waves 1–4 the platform inherits the same uniformity Apple/Linear ship: one ramp, one shell, one spacing rhythm, one IA.
