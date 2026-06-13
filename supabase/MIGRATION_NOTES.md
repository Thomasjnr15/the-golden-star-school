# Migration Notes — v4 → v5

## New columns added (schema.sql handles these automatically)

Run the new section at the bottom of `schema.sql` against your Supabase project
(**SQL Editor → New query → paste & run**).

The `DO $$ BEGIN ... END $$` block is idempotent — safe to run multiple times.

### New `school_settings` columns added:
| Column | Purpose |
|--------|---------|
| `hero_image_2` | Second hero image (reserved) |
| `hero_cta_label` | Primary CTA button text |
| `hero_cta_label2` | Secondary CTA button text |
| `awards_count` | Awards Won stat on hero |
| `about_mission` | About section mission text |
| `about_vision` | About section vision text |
| `about_image` | About section photo |
| `why_*_title/text` | 6 "Why Choose Us" card texts |
| `programs_heading/sub` | Programs section heading and sub |
| `programs_jss_*` | JSS program card (title, text, image) |
| `programs_sss_*` | SSS program card (title, text, image) |
| `cta_heading/sub` | Bottom CTA banner text |
| `academic_session` | Current academic session |

## Storage Buckets (one-time setup)

In your Supabase dashboard → **Storage**, create two **public** buckets:
1. `logos` — for the school logo
2. `images` — for hero photo, program photos, etc.

Then add RLS policies (see commented SQL at bottom of `schema.sql`).

## What changed in the frontend

| File | Changes |
|------|---------|
| `Hero.tsx` | Full rewrite — white background, two-column layout matching design screenshot, image on right, stats only shown if filled |
| `About.tsx` | Full rewrite — now renders "Why Choose Us" (6 cards) + "Our Programs" (JSS/SSS with photos), all DB-driven |
| `Contact.tsx` | Color scheme updated to forest green, font to Cormorant Garamond |
| `Settings.tsx` | Full rewrite — new tabs (Hero, About & Programs), `ImageField` upload component, all new fields |
| `Home.tsx` | Navbar always white (hero no longer dark), added nav links (Home, Academics), added CTA banner section |
| `schema.sql` | New migration block appended |
