---
name: Digital Civic System
colors:
  surface: "#08151e"
  surface-dim: "#08151e"
  surface-bright: "#2e3b45"
  surface-container-lowest: "#040f19"
  surface-container-low: "#101d27"
  surface-container: "#14212b"
  surface-container-high: "#1f2b35"
  surface-container-highest: "#2a3641"
  on-surface: "#d7e4f2"
  on-surface-variant: "#c1c6d7"
  inverse-surface: "#d7e4f2"
  inverse-on-surface: "#25323c"
  outline: "#8b90a0"
  outline-variant: "#414755"
  surface-tint: "#afc6ff"
  primary: "#afc6ff"
  on-primary: "#002d6c"
  primary-container: "#528dff"
  on-primary-container: "#00275f"
  inverse-primary: "#0059c7"
  secondary: "#94ccff"
  on-secondary: "#003352"
  secondary-container: "#3297dc"
  on-secondary-container: "#002c47"
  tertiary: "#4ae176"
  on-tertiary: "#003915"
  tertiary-container: "#00a74b"
  on-tertiary-container: "#003111"
  error: "#ffb4ab"
  on-error: "#690005"
  error-container: "#93000a"
  on-error-container: "#ffdad6"
  primary-fixed: "#d9e2ff"
  primary-fixed-dim: "#afc6ff"
  on-primary-fixed: "#001a43"
  on-primary-fixed-variant: "#004398"
  secondary-fixed: "#cde5ff"
  secondary-fixed-dim: "#94ccff"
  on-secondary-fixed: "#001d32"
  on-secondary-fixed-variant: "#004b74"
  tertiary-fixed: "#6bff8f"
  tertiary-fixed-dim: "#4ae176"
  on-tertiary-fixed: "#002109"
  on-tertiary-fixed-variant: "#005321"
  background: "#08151e"
  on-background: "#d7e4f2"
  surface-variant: "#2a3641"
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: "800"
    lineHeight: 48px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: "800"
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: "700"
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: "700"
    lineHeight: 30px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: "700"
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: "700"
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 22px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: "400"
    lineHeight: 18px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: "600"
    lineHeight: 20px
    letterSpacing: 0.02em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: "600"
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: "700"
    lineHeight: 14px
    letterSpacing: 0.08em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system embodies modern digital democracy tailored for secondary educational institutions, student unions, and dynamic youth governance. It merges the security, integrity, and institutional trust of civic ballot systems with the vibrant, high-energy momentum of Gen Z student campaigns.

The visual direction centers on a sleek, high-contrast dark mode influenced by modern glassmorphism, glowing telemetry, and bold structural borders. Interface surfaces evoke a command center atmosphere: deep navy substrates paired with energetic, luminescent blue vectors and sharp, hyper-legible typography. The emotional tone is decisive, authoritative, and frictionless—eliminating voter fatigue while instilling absolute trust in electoral privacy, accuracy, and ballot confirmation.

## Colors

The palette is engineered specifically for deep dark interfaces with vivid signal hierarchy:

- **Deep Navy (`#071A33`):** Canvas foundation providing total eye-comfort, high-contrast support, and depth.
- **Navy Blue (`#0D2A4A`):** Surface background for cards, sticky navigational bars, slide-over candidate drawers, and modal sheets.
- **Electric Blue (`#1677FF`):** Dominant action trigger. Applied exclusively to primary CTAs, definitive "VOTE" actions, active state indicators, and focal interactive elements.
- **Sky Blue (`#5CB8FF`):** Secondary accent reserved for illuminated borders, subtle glowing drop shadows, hover transitions, and candidate index badges.
- **Success Green (`#22C55E`):** State-specific confirmation indicator for cast ballots, successful token validations, and live tally indicators.
- **Off White (`#F5F7FA`):** Primary editorial text on dark surfaces, yielding peak contrast without the harsh glare of pure white.
- **Cool Gray (`#AAB7C4`):** Secondary metadata, inactive icons, timestamps, and candidate manifesto body text.
- **Structural Stroke (`#1A365D`):** Low-contrast boundary tone used to define card bounds and dividers without visual clutter.

## Typography

Typography prioritizes fast scanning under pressure and legible consumption of dense candidate manifestos (_Visi, Misi, Program Kerja_):

- **Plus Jakarta Sans:** Drives brand impact, candidate headlines, and body reading comfort. Bold and ExtraBold weights capture modern student energy, while Regular and Medium weights provide clear legibility across continuous paragraphs and bulleted mission items.
- **Inter:** Powers high-density utility areas including candidate registration numbers, section classification chips, uppercase status labels, and authentication forms.
- **Hierarchy Rules:** All candidate identity headlines use tight negative tracking (`-0.01em` to `-0.02em`) to command attention. Manifesto section titles (`VISI`, `MISI`, `PROGRAM KERJA`) must render in uppercase bold styles with positive letter spacing to establish immediate structure within card bodies.

## Layout & Spacing

The layout is built on a responsive mobile-first grid, accounting for the primary student access channel (smartphones) while scaling to large widescreen voting kiosks and administrative monitoring boards.

- **Mobile (< 768px):** A single-column vertical flow with full-width card structures, `1rem` edge margins, and `1rem` gutters. Interactive candidates stack sequentially with sticky bottom navigation controls for smooth one-thumb operation.
- **Tablet (768px – 1024px):** 2-column symmetric layout pairing ballot contenders side-by-side for direct manifesto comparison.
- **Desktop (> 1024px):** 12-column grid system capped at a maximum width of `1280px`. Candidate cards utilize 4 to 6 columns each, maintaining visual balance and quick comparative scanning.
- **Spacing Rhythm:** Standard spacing strictly follows an 8pt base scale (`space-xs` = 4px, `space-sm` = 8px, `space-md` = 16px, `space-lg` = 24px, `space-xl` = 32px). Component gaps inside cards are kept compact to maximize manifesto visible area before requiring scrolling.

## Elevation & Depth

Visual depth is achieved through layered navy tones combined with electric ambient luminescence, avoiding muddy black drop shadows in favor of tinted optical glow:

- **Base Layer (Ground):** Deep Navy (`#071A33`) forms the unyielding backdrop for all screen layouts.
- **Layer 1 (Cards & Inputs):** Navy Blue (`#0D2A4A`) surfaces with a 1px perimeter border rendered in `#1A365D`.
- **Layer 2 (Floating Controls & Navigation):** Navy Blue surfaces with translucent opacity (`rgba(13, 42, 74, 0.85)`) coupled with a `12px` backdrop blur (`backdrop-filter: blur(12px)`) and a `0 4px 20px rgba(7, 26, 51, 0.6)` ambient drop shadow.
- **Layer 3 (Modals & Confirmation Drawers):** Solid Navy Blue framed with an inner stroke of `1px solid rgba(92, 184, 255, 0.25)` and a radiant glow: `0 12px 40px rgba(0, 0, 0, 0.7), 0 0 24px rgba(22, 119, 255, 0.15)`.
- **Focus & Interaction Glow:** Actively selected candidate cards or focused input boxes project an electric halo (`box-shadow: 0 0 16px rgba(22, 119, 255, 0.45)`), accompanied by a border shift to `#1677FF` or `#5CB8FF`.

## Shapes

The design system employs a refined modern curvature (`roundedness: 2`, where base elements possess `0.5rem` / 8px radius, `rounded-lg` scales to `1rem` / 16px, and `rounded-xl` scales to `1.5rem` / 24px).

Candidate cards, manifesto containers, and modal dialogs adopt `rounded-lg` (16px) or `rounded-xl` (24px) to look welcoming and polished. Action triggers—such as ballot vote buttons, candidate numerical badges (`01`, `02`), and primary inputs—utilize fluid pill-shaped borders or balanced 8px radii depending on context. Candidate portraits are framed in rounded containers with subtle 1.5px glowing strokes, echoing digital badge metaphors.

## Components

### Candidate Cards

- **Structure:** Encased in `#0D2A4A` with a `1px` border of `#1A365D` and `16px` border-radius.
- **Candidate Number Badge:** High-visibility circular or rounded pill pillbox pinned to the top-right corner. Features a gradient of `#1677FF` to `#5CB8FF`, bold white text (`Off White`), and a soft glow.
- **Manifesto Segments:** Clear compartmentalized sections for _Visi_, _Misi_, and _Program Kerja_. Headings in Sky Blue (`#5CB8FF`), body text in Cool Gray (`#AAB7C4`).

### Buttons & CTAs

- **Primary Vote Button:** Vivid `#1677FF` fill, Off White bold text, uppercase tracking, `8px` or full pill radius. On hover, background shifts to `#5CB8FF` with an expanded glow (`0 0 12px rgba(92, 184, 255, 0.5)`).
- **Secondary / Navigation Button:** Outlined style with `1.5px` border in `#1677FF`, transparent or navy surface, transitioning to solid on hover.
- **Selected State:** Shifts to Success Green (`#22C55E`) accompanied by a checkmark icon and text reading "TERPILIH" (Voted).

### Navigation & Segmented Tab Switcher (OSIS vs MPK)

- **Container:** Pill-shaped, dark track styled with `#071A33` and an outer hairline border of `#1A365D`.
- **Segment Trigger:** Smooth slide-activated tab. Inactive state features Cool Gray text; active state elevates with a solid `#1677FF` background, crisp Off White typography, and subtle ambient shadow.

### Voter Authentication Inputs

- **Input Fields:** Filled with `#071A33`, surrounded by a clean `#1A365D` border. Placeholder text in muted Cool Gray.
- **Active / Focus:** Border transitions instantly to Sky Blue (`#5CB8FF`) with a faint external blue glow ring.
- **Validation Messages:** Errors display in bright coral red with assistive micro-icons; successful NISN/NIG verifications light up with Success Green borders.

### Voting Confirmation Modal

- **Overlay:** Deep backdrop dimming (`rgba(7, 26, 51, 0.85)`) with full background blur (`8px`).
- **Modal Surface:** `#0D2A4A` dialog featuring the selected candidate's badge, photo portrait, and dual confirmation buttons: "BATAL" (Ghost neutral) and "KONFIRMASI PILIHAN" (Solid `#22C55E` or `#1677FF`).

### Progress Bars & Turnout Indicators

- **Track:** Recessed `#071A33` container with a `4px` or `8px` height.
- **Indicator:** Smooth gradient filling from `#1677FF` to `#5CB8FF` with an animated glow head showcasing real-time participation metrics.
