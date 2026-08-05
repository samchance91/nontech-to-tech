# Propelr Brand and Product Interface Guidelines

**Version:** 2.0  
**Status:** Implementation source of truth  
**Primary use:** Websites, web applications, mobile-first products, social assets, presentations, and AI-generated interfaces  
**Intended users:** Claude Code, software engineers, product designers, content designers, marketers, and external collaborators

---

## 0. Instructions for Claude Code

Treat this document as a set of product requirements, not as visual inspiration.

When generating or modifying a Propelr interface:

1. Use the exact design tokens defined in this document.
2. Default to a clean, premium, minimal, mobile-first interface.
3. Do not invent additional brand colors, gradients, decorative effects, or typefaces.
4. Use Propelr Yellow to guide attention, not to fill large portions of the interface.
5. Use Propelr Red only for destructive actions, errors, and critical alerts.
6. Preserve accessible contrast, visible focus states, keyboard navigation, and minimum touch targets.
7. Prefer reusable components and semantic tokens over one-off CSS values.
8. Do not duplicate product names already present inside a logo.
9. Do not create loud, futuristic, cyberpunk, neon, glossy, or cartoon-like visuals.
10. When a requirement conflicts with these guidelines, flag the conflict before changing the brand system.

### Implementation priority

When two rules appear to conflict, follow this order:

1. Accessibility and usability
2. Product clarity
3. Brand consistency
4. Visual polish
5. Decorative preference

---

## 1. Brand Foundation

### 1.1 Brand name

**Propelr**

Always write the brand name as `Propelr` with a capital P and the remaining letters in lowercase.

Do not write:

- PROPELR in normal body copy
- PropelR
- Propeller
- propelr, except inside URLs, handles, filenames, or code identifiers

### 1.2 Master brand promise

**Inspiring Better Careers**

This is the primary brand promise and should guide the company narrative, content, and product direction.

### 1.3 Optional campaign line

**Turning Ideas Into Momentum**

Use this only in contexts focused on creation, execution, entrepreneurship, projects, or product-building. Do not present it as a second master tagline beside “Inspiring Better Careers.”

### 1.4 Brand purpose

Propelr makes career growth easier to understand, more practical to pursue, and more accessible to people at different stages of their working lives.

### 1.5 Brand idea

The name represents steady, focused, adaptable progress. Propelr should not feel like a shortcut, motivational gimmick, or unrealistic promise. It should feel like a reliable force that helps people move forward.

### 1.6 Positioning statement

Propelr is a practical career-growth brand that turns complex questions about skills, work, progress, and professional choices into clear actions people can use.

### 1.7 Primary audiences

Propelr may serve:

- Students preparing for work
- Early-career professionals
- Professionals changing roles or industries
- Managers building stronger teams
- Independent professionals and founders
- People seeking practical career direction without expensive or complicated systems

### 1.8 Brand personality

Propelr is:

- Intelligent
- Confident
- Practical
- Premium
- Minimal
- Modern
- Human
- Direct
- Calm
- Execution-focused

Propelr is not:

- Loud
- Arrogant
- Preachy
- Overly corporate
- Childish
- Flashy
- Trend-dependent
- Needlessly complicated
- Hype-driven
- Emotionally manipulative

### 1.9 Brand principles

Every Propelr experience should feel:

1. **Clear:** Users should understand the purpose and next action quickly.
2. **Useful:** Content and features should solve a real problem.
3. **Focused:** Each screen should have a dominant purpose.
4. **Trustworthy:** Avoid exaggeration, fake urgency, and unsupported claims.
5. **Human:** Use natural language and realistic situations.
6. **Premium through restraint:** Quality should come from spacing, typography, hierarchy, and precision rather than decoration.
7. **Action-oriented:** Help the user move from understanding to execution.

---

## 2. Brand Architecture and Naming

### 2.1 Master brand

The master brand is `Propelr`.

### 2.2 Endorsed product naming

Use the following format for named products:

- `Pathways by Propelr`
- `[Product Name] by Propelr`

In compact interface contexts, the product logo may appear alone when the Propelr endorsement is already visible elsewhere.

### 2.3 Product naming rules

Product names should be:

- Short
- Easy to pronounce
- Connected to progress, direction, capability, or momentum
- Distinct from generic feature labels
- Suitable for use as a domain, repository, and application name

Avoid names that sound:

- Overly technical
- Like a generic AI assistant
- Like a motivational course
- Like a children’s game
- Like a financial or medical promise

### 2.4 Name duplication rule

When a logo already contains the product name, do not repeat the same name as a heading directly below it. The next heading should explain the screen’s purpose.

Incorrect:

- Pathways logo
- Heading: Pathways

Correct:

- Pathways logo
- Heading: Build a path you can follow

---

## 3. Voice and Messaging

### 3.1 Voice attributes

Propelr communicates with a voice that is:

- Confident, not boastful
- Helpful, not patronising
- Smart, not academic
- Calm, not passive
- Honest, not pessimistic
- Motivating, not sentimental
- Direct, not abrupt

### 3.2 Writing style

Use:

- Plain English
- Short paragraphs
- Specific verbs
- Concrete outcomes
- Active voice
- Real examples
- Sentence case
- Clear calls to action

Avoid:

- Empty motivational language
- Corporate jargon
- Excessive exclamation marks
- Unnecessary acronyms
- Long introductions before the useful point
- Claims such as “revolutionary,” “game-changing,” or “guaranteed success”
- Artificial urgency such as “Act now before it is too late”
- Vague AI language such as “unlock the limitless power of AI”

### 3.3 Preferred language patterns

Prefer:

- “Build a plan you can follow.”
- “Choose up to five goals.”
- “See what changed this week.”
- “Use AI to solve a real problem.”
- “Your progress is saved on this device.”

Avoid:

- “Embark on a transformative journey.”
- “Supercharge your career instantly.”
- “Leverage cutting-edge innovation.”
- “Unleash your full potential.”
- “Experience the future of career success.”

### 3.4 Headline rules

Headlines should:

- Express one clear idea
- Normally stay below 10 words
- Use sentence case
- Avoid full stops unless the headline is a complete statement and the punctuation adds intent
- Avoid title case for every word

Examples:

- Build a path you can follow
- Progress becomes easier when it is visible
- Better decisions start with clearer signals
- Learn what the work actually requires

### 3.5 CTA rules

Buttons should describe the action that will happen.

Preferred:

- Create my profile
- Add a goal
- Build my pathway
- Save changes
- View progress
- Export pathway
- Try again

Avoid:

- Click here
- Submit
- Continue, when a more specific label is possible
- Yes
- Okay
- Learn more, when the destination can be named

### 3.6 Error messages

Error messages should state:

1. What went wrong
2. How the user can fix it

Example:

`We could not save this goal. Check your connection and try again.`

Do not blame the user or expose technical error codes unless they are useful for support.

### 3.7 Empty states

An empty state should include:

- A clear explanation
- One recommended next action
- Optional secondary guidance

Example:

**No goals yet**  
Add your first goal to start building today’s pathway.

Button: `Add a goal`

---

## 4. Logo System

### 4.1 Required logo assets

Use these canonical filenames:

- `propelr-logo-black.svg`
- `propelr-logo-white.svg`
- `propelr-logo-yellow.svg`
- `propelr-icon.svg`

For products, use similarly structured names:

- `pathways-logo-light.svg`
- `pathways-logo-dark.svg`
- `pathways-icon.svg`

### 4.2 Logo variant selection

Use:

- Black logo on white, off-white, or pale neutral backgrounds
- White logo on black or dark charcoal backgrounds
- Yellow logo only when contrast and visual hierarchy remain strong
- Product-specific light and dark logo files according to the active theme

Do not recolor an SVG with arbitrary CSS unless the asset was intentionally built to inherit `currentColor`.

### 4.3 Clear space

Maintain clear space around the logo equal to at least the height of the logo’s primary icon element or the height of the lowercase letter `r`, whichever is available in the supplied artwork.

No text, border, icon, or container edge should enter this zone.

### 4.4 Minimum size

- Minimum digital logo height: 32 px
- Minimum standalone icon size: 24 px
- Recommended navigation logo height: 32 to 40 px
- Recommended mobile welcome-screen logo height: 48 to 64 px

At smaller sizes, use the standalone icon rather than compressing the full wordmark.

### 4.5 Logo placement

Preferred positions:

- Top left in navigation and documents
- Centred on welcome or loading screens
- Bottom left in presentation footers

Avoid centring the logo in standard desktop navigation unless the information architecture specifically requires it.

### 4.6 Logo prohibitions

Never:

- Stretch or compress the logo
- Rotate it
- Add a drop shadow, glow, bevel, or outline
- Place it over a visually noisy image without a solid protective surface
- Apply a gradient
- Change individual logo colours
- Put it inside an arbitrary shape
- Crop part of the logo
- Animate it continuously
- repeat the product name immediately beneath a logo that already contains that name

---

## 5. Colour System

### 5.1 Core brand colours

| Token | Name | Hex | RGB | Primary use |
|---|---|---:|---:|---|
| `brand.black` | Propelr Black | `#2C2C2C` | 44, 44, 44 | Primary text, primary buttons, dark brand fields |
| `brand.yellow` | Propelr Yellow | `#FFD700` | 255, 215, 0 | Accent, active states, highlights, progress |
| `brand.white` | White | `#FFFFFF` | 255, 255, 255 | Surfaces and text on dark backgrounds |
| `brand.darkGray` | Dark Gray | `#4B4B4B` | 75, 75, 75 | Secondary dark neutral |
| `brand.lightGray` | Light Gray | `#D9D9D9` | 217, 217, 217 | Borders and disabled controls |
| `brand.offWhite` | Off White | `#F7F7F7` | 247, 247, 247 | Light-mode page background |
| `brand.red` | Bright Red | `#FF0000` | 255, 0, 0 | Brand-level critical emphasis and error use only |

### 5.2 Colour character

All brand colours should appear matte and solid.

Do not use:

- Neon versions
- Glossy treatments
- Metallic effects
- Multi-colour gradients
- Yellow-to-red gradients
- Glowing outlines
- Transparent colour overlays that reduce legibility

### 5.3 Colour balance

As a starting point for most interfaces:

- 65 to 75 percent neutral background and whitespace
- 15 to 25 percent neutral surfaces and typography
- 5 to 10 percent yellow accent
- Less than 2 percent red, unless the interface is showing an error state

These ratios are guidance, not rigid calculations. The main rule is that yellow should remain meaningful.

### 5.4 Yellow usage

Use Propelr Yellow for:

- Active navigation indicators
- Progress markers
- Focused highlights
- Selected states
- Small decorative rules
- Important icons
- Badges used sparingly
- Hover or pressed feedback when contrast remains accessible

Do not use Propelr Yellow for:

- Long body text on white
- Large full-page backgrounds by default
- Disabled states
- Error messages
- Every CTA on a page
- Large data tables

### 5.5 Accessible text on yellow

Use dark text on yellow.

Preferred pairing:

- Background: `#FFD700`
- Text/icon: `#2C2C2C`

Do not use white text on yellow. The contrast is insufficient for normal interface text.

### 5.6 Red usage

Use red only for:

- Errors
- Destructive actions
- Failed states
- Critical warnings
- Required-field error indicators

Do not use red as routine decoration, a normal brand accent, or a positive emphasis colour.

### 5.7 Light-mode semantic palette

| Semantic token | Value | Usage |
|---|---:|---|
| `background` | `#F7F7F7` | Page canvas |
| `surface` | `#FFFFFF` | Cards, sheets, navigation |
| `surface.subtle` | `#F7F7F7` | Nested or quiet surfaces |
| `text.primary` | `#2C2C2C` | Main text |
| `text.secondary` | `#6A6A6A` | Supporting text |
| `text.disabled` | `#9A9A9A` | Disabled labels |
| `accent` | `#FFD700` | Selected and highlighted states |
| `border` | `#D9D9D9` | Standard border |
| `border.strong` | `#A8A8A8` | High-emphasis border |
| `success` | `#28A745` | Success icon or filled indicator |
| `success.text` | `#166534` | Accessible success text on white |
| `warning` | `#F5A623` | Warning icon or filled indicator |
| `warning.text` | `#8A4B00` | Accessible warning text on white |
| `error` | `#D92D20` | Error text and icon |
| `focus` | `#2C2C2C` | Primary focus outline on light backgrounds |

The darker success and warning text values are accessibility support tokens derived for interface use. They do not replace the approved brand palette.

### 5.8 Dark-mode semantic palette

| Semantic token | Value | Usage |
|---|---:|---|
| `background` | `#0C0C0C` | Page canvas |
| `surface` | `#1A1A1A` | Cards, sheets, navigation |
| `surface.elevated` | `#222222` | Elevated interactive surfaces |
| `text.primary` | `#FFFFFF` | Main text |
| `text.secondary` | `#B5B5B5` | Supporting text |
| `text.disabled` | `#777777` | Disabled labels |
| `accent` | `#FFD700` | Selected and highlighted states |
| `border` | `#2F2F2F` | Standard border |
| `border.strong` | `#555555` | High-emphasis border |
| `success` | `#34C759` | Success state |
| `warning` | `#FF9500` | Warning state |
| `error` | `#FF453A` | Error state |
| `focus` | `#FFD700` | Focus outline on dark backgrounds |

### 5.9 Theme rules

- Light mode should feel warm, open, and editorial.
- Dark mode should feel focused and premium, not gaming-oriented.
- Theme changes must alter semantic tokens rather than individual component styles.
- Persist the user’s theme preference when the product stores preferences.
- Respect the operating system preference on first visit unless the product has a deliberate default.
- Never use a dark logo on a dark background or a white logo on a white background.

---

## 6. Typography

### 6.1 Typeface roles

| Role | Typeface | Weights |
|---|---|---|
| Display and headings | Poppins | 600, 700 |
| Body and interface | Inter | 400, 500, 600 |
| Technical labels and code-like metadata | Space Mono | 400, 700 |

Fallback stack:

- Poppins: `"Poppins", "Inter", Arial, sans-serif`
- Inter: `"Inter", Aptos, Calibri, Arial, sans-serif`
- Space Mono: `"Space Mono", "Courier New", monospace`

### 6.2 Typeface rules

- Use Poppins for strong hierarchy, not for long body paragraphs.
- Use Inter for paragraphs, buttons, form labels, navigation, tables, and product UI.
- Use Space Mono sparingly for IDs, XP values, technical labels, timestamps, keyboard hints, and system metadata.
- Do not introduce another display font without updating this document.
- Do not use thin font weights below 400.
- Do not use all caps for long labels or sentences.

### 6.3 Responsive type scale

Use fluid sizing where practical.

| Style | Desktop target | Mobile target | Weight | Line height |
|---|---:|---:|---:|---:|
| Display XL | 64 px | 44 px | 700 | 1.05 |
| Display | 52 px | 38 px | 700 | 1.08 |
| H1 | 40 px | 32 px | 700 | 1.15 |
| H2 | 32 px | 26 px | 600 | 1.2 |
| H3 | 24 px | 22 px | 600 | 1.3 |
| H4 | 20 px | 18 px | 600 | 1.35 |
| Body large | 18 px | 18 px | 400 | 1.6 |
| Body | 16 px | 16 px | 400 | 1.6 |
| Body small | 14 px | 14 px | 400 | 1.5 |
| Label | 14 px | 14 px | 600 | 1.3 |
| Caption | 12 px | 12 px | 400 | 1.4 |
| Technical | 12 px | 12 px | 400 | 1.4 |

Recommended CSS:

```css
.propelr-display-xl {
  font-family: var(--font-heading);
  font-size: clamp(2.75rem, 6vw, 4rem);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -0.035em;
}

.propelr-h1 {
  font-family: var(--font-heading);
  font-size: clamp(2rem, 4vw, 2.5rem);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.025em;
}
```

### 6.4 Measure and readability

- Maximum paragraph width: 700 px
- Preferred long-form reading measure: 60 to 75 characters per line
- Avoid centre-aligned paragraphs longer than two short lines
- Use left alignment for most body copy
- Use a minimum 16 px body size in product interfaces

### 6.5 Numerals and data

- Use tabular numerals in tables, timers, financial data, and dashboards.
- Use Space Mono only when the technical character is intentional.
- Right-align numeric table columns.
- Use Indian numbering formats when the product context is India-specific, for example `₹1,25,000`.

---

## 7. Layout and Spacing

### 7.1 Base grid

Use an 8 px spacing grid with a 4 px half-step for compact adjustments.

Canonical spacing scale:

| Token | Value |
|---|---:|
| `space.0` | 0 px |
| `space.1` | 4 px |
| `space.2` | 8 px |
| `space.3` | 12 px |
| `space.4` | 16 px |
| `space.5` | 24 px |
| `space.6` | 32 px |
| `space.7` | 40 px |
| `space.8` | 48 px |
| `space.9` | 64 px |
| `space.10` | 80 px |
| `space.11` | 96 px |
| `space.12` | 128 px |

### 7.2 Web grid

- Maximum page width: 1280 px
- Primary content container: 1140 px
- Grid: 12 columns on desktop
- Desktop gutter: 24 px
- Tablet gutter: 20 px
- Mobile gutter: 16 px
- Large marketing-section vertical padding: 80 to 128 px desktop, 48 to 72 px mobile
- Product-screen vertical padding: 24 to 40 px desktop, 16 to 24 px mobile

### 7.3 Responsive breakpoints

Use content-driven breakpoints, with these defaults:

| Name | Width |
|---|---:|
| `xs` | 0 to 479 px |
| `sm` | 480 to 767 px |
| `md` | 768 to 1023 px |
| `lg` | 1024 to 1279 px |
| `xl` | 1280 px and above |

Do not build separate desktop and mobile products. Build one responsive system.

### 7.4 Mobile-first rules

- Start with the smallest supported viewport.
- Keep primary actions reachable without horizontal scrolling.
- Use a single-column flow by default.
- Convert dense multi-column cards into stacked sections.
- Avoid fixed-height content containers unless the content is controlled.
- Keep bottom-fixed actions above device safe areas.
- Ensure inputs do not trigger unintended zoom on mobile browsers.

### 7.5 Whitespace

Whitespace is an active brand element.

Use it to:

- Separate decisions
- Establish hierarchy
- Reduce cognitive load
- Make yellow accents more meaningful
- Create a premium visual rhythm

Do not fill empty space merely to make a screen appear busy.

---

## 8. Shape, Borders, and Elevation

### 8.1 Corner radii

| Component | Radius |
|---|---:|
| Small controls | 8 px |
| Buttons and inputs | 12 px |
| Cards | 16 px |
| Large cards and drawers | 20 px |
| Dialogs | 20 px |
| Pills and tags | 999 px |

Do not mix many radius styles on one screen.

### 8.2 Borders

- Standard border width: 1 px
- Strong or selected border: 2 px
- Use borders before shadows for most surfaces
- Avoid dark, heavy box outlines around every section
- Do not use yellow borders for all cards

### 8.3 Shadows

Shadows must be subtle and grounded.

Light-mode default:

```css
box-shadow: 0 6px 16px rgba(44, 44, 44, 0.08);
```

Elevated overlay:

```css
box-shadow: 0 16px 40px rgba(44, 44, 44, 0.14);
```

Dark-mode default:

```css
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.32);
```

Avoid:

- Coloured shadows
- Yellow glows
- Multiple layered shadows on routine cards
- Floating cards with no relationship to the layout

---

## 9. Iconography

### 9.1 Preferred icon systems

Use one library consistently within a product:

- Lucide
- Phosphor
- Material Symbols

Do not mix icon libraries on the same screen unless matching icons are unavailable and the visual style can be normalised.

### 9.2 Icon style

- Outline icons
- Rounded joins and caps
- Standard 2 px stroke
- Simple geometric construction
- Recognisable metaphors

### 9.3 Icon sizes

- Inline icon: 16 px
- Standard control icon: 20 px
- Navigation icon: 24 px
- Empty-state icon: 32 to 48 px
- Marketing feature icon: 40 to 56 px

### 9.4 Icon rules

- Pair unfamiliar icons with labels.
- Do not use an icon alone for destructive actions unless a tooltip and accessible label are present.
- Do not use emojis as primary interface icons.
- Do not use filled cartoon icons.
- Do not place every icon inside a coloured circle.

---

## 10. Photography and Illustration

### 10.1 Photography direction

Use authentic images of:

- People building, learning, discussing, creating, or solving problems
- Real workspaces
- Tools and processes
- Career transitions and professional growth
- Engineers, creators, educators, founders, and teams in realistic contexts

Photography should feel:

- Observational
- Natural
- Calm
- Intelligent
- Contemporary
- Diverse without appearing artificially staged

Avoid:

- Fake handshakes
- People pointing at blank screens
- Forced celebration poses
- Generic call-centre imagery
- Excessive blue corporate lighting
- Over-smoothed faces
- Futuristic hologram interfaces

### 10.2 Illustration direction

Use:

- Flat geometric forms
- Editorial compositions
- Clear conceptual metaphors
- Matte textures
- Restrained black, white, grey, and yellow
- Red only when the concept involves danger, error, or a critical obstacle

Avoid:

- Clipart
- Childlike cartoons
- Fantasy AI visuals
- Cyberpunk scenes
- Neon circuitry
- Generic robots
- Glowing brains
- Excessive 3D renders
- Random abstract blobs without meaning

### 10.3 AI image prompt baseline

Use this base direction when generating brand imagery:

> Create a premium editorial visual for Propelr using a restrained matte palette of charcoal black, warm yellow, white, and neutral grey. The composition should be minimal, intelligent, purposeful, and grounded in a clear career or progress-related metaphor. Use crisp geometry, generous negative space, realistic proportions, and controlled contrast. Avoid neon, cyberpunk, glossy CGI, cartoon styling, generic robots, glowing brains, clutter, and decorative elements that do not support the message.

### 10.4 Image treatment

- Use natural colour or controlled monochrome.
- Yellow may be introduced as a small graphic accent.
- Maintain subject clarity.
- Avoid heavy filters.
- Use consistent corner radii when images appear inside cards.
- Add text overlays only when contrast is guaranteed by a solid or controlled overlay.

---

## 11. Core UI Components

### 11.1 Buttons

#### Primary button

Purpose: The main action on a screen.

Light mode:

- Background: `#2C2C2C`
- Text: `#FFFFFF`
- Hover background: `#FFD700`
- Hover text: `#2C2C2C`
- Focus: visible 2 px outline with offset

Dark mode:

- Background: `#FFD700`
- Text: `#2C2C2C`
- Hover: slightly reduced luminance through an approved interaction overlay, not a new brand colour

#### Secondary button

- Transparent or surface background
- 1 px standard border
- Primary text colour
- Hover uses a subtle neutral fill

#### Ghost button

- Transparent background
- No border by default
- Text and icon use primary or secondary text colours
- Hover uses a subtle neutral surface

#### Destructive button

- Use only for irreversible or high-risk actions
- Use semantic error colour
- Require confirmation when data loss is meaningful

#### Button dimensions

| Size | Height | Horizontal padding | Label size |
|---|---:|---:|---:|
| Small | 36 px | 12 to 16 px | 14 px |
| Medium | 44 px | 16 to 20 px | 14 to 16 px |
| Large | 52 px | 20 to 24 px | 16 px |

Rules:

- Minimum touch target: 44 by 44 px
- Use one primary button per decision group
- Keep labels on one line where possible
- Show loading feedback without changing the button width
- Disable only when the reason is clear

### 11.2 Links

- Use underlines in long-form content.
- In navigation, an active state may use weight, contrast, or a yellow indicator.
- Do not rely on colour alone to distinguish inline links.
- External links should not receive decorative icons unless useful.

### 11.3 Inputs

Standard input:

- Height: 48 px
- Radius: 12 px
- Border: 1 px
- Label above input
- Helper text below input
- Placeholder text is supplementary, not a replacement for the label

States:

- Default
- Hover
- Focus
- Filled
- Disabled
- Error
- Success, only when confirmation is useful

Focus state should be obvious without depending only on yellow.

### 11.4 Cards

Cards should group related information, not decorate every section.

Standard card:

- Surface background
- 1 px border
- 16 px radius
- 16 to 24 px padding on mobile
- 24 to 32 px padding on desktop
- Optional subtle shadow

Interactive cards must have:

- A clear hover or pressed state
- Visible keyboard focus
- A sufficiently large clickable area
- A single dominant action

### 11.5 Navigation

Desktop navigation:

- Logo at left
- Primary links grouped clearly
- One main CTA at right when needed
- Recommended height: 64 to 72 px

Mobile navigation:

- Logo at left
- Menu or compact actions at right
- Do not hide the current screen name when orientation would suffer
- Use a sheet or drawer with clear close behaviour

### 11.6 Tabs

- Use for peer-level views, not sequential steps.
- Show the active tab through text weight and a yellow or dark indicator.
- Allow horizontal scrolling on small screens when necessary.
- Do not compress labels until they become unreadable.

### 11.7 Tags and badges

Use tags for categories and filters. Use badges for statuses or counts.

- Radius: pill
- Keep labels short
- Avoid filling every tag with yellow
- Status colours must include text or icon cues

### 11.8 Progress indicators

Progress is a natural Propelr motif.

Use:

- Yellow for completed or current progress
- Neutral grey for remaining progress
- Clear numeric or text labels when precision matters
- Reduced-motion alternatives

Do not use progress indicators to manipulate users or create fake urgency.

### 11.9 Dialogs and sheets

- Use a dialog for focused decisions.
- Use a bottom sheet on mobile for short contextual actions.
- Use a full screen flow for complex forms.
- Trap keyboard focus correctly.
- Restore focus to the triggering element after close.
- Include a clear title and close action.

### 11.10 Toasts and alerts

Toasts:

- Brief confirmation for non-critical events
- Do not require interaction for routine success messages
- Remain visible long enough to read

Inline alerts:

- Use for information that affects the current task
- Include an icon, heading when useful, and action when recovery is possible

### 11.11 Tables

- Use Inter for labels and values.
- Use tabular numerals for numeric data.
- Right-align numbers.
- Keep headers visible in long tables.
- Provide a card or list alternative on small screens when horizontal comparison is not essential.
- Do not shrink text below 14 px to force a desktop table onto mobile.

---

## 12. Interaction and Motion

### 12.1 Motion character

Motion should communicate state, orientation, and causality. It should not exist merely to make the product feel animated.

### 12.2 Duration tokens

| Token | Duration | Use |
|---|---:|---|
| `motion.fast` | 120 ms | Hover and pressed feedback |
| `motion.standard` | 180 ms | Small component transitions |
| `motion.slow` | 240 ms | Drawers, dialogs, and layout transitions |
| `motion.emphasis` | 360 ms | Rare onboarding or milestone moments |

### 12.3 Easing

Recommended:

```css
--ease-standard: cubic-bezier(0.2, 0, 0, 1);
--ease-enter: cubic-bezier(0, 0, 0, 1);
--ease-exit: cubic-bezier(0.3, 0, 1, 1);
```

### 12.4 Motion rules

- Prefer opacity and transform.
- Avoid animating layout-heavy properties when unnecessary.
- Avoid continuous bouncing or pulsing.
- Do not animate the logo continuously.
- Support `prefers-reduced-motion`.
- Never delay a core action to complete an animation.

---

## 13. Accessibility

Accessibility is a product requirement.

### 13.1 Baseline

- Meet WCAG AA contrast requirements.
- Use semantic HTML.
- Support keyboard navigation.
- Provide visible focus styles.
- Maintain a minimum 44 by 44 px touch target.
- Do not rely on colour alone.
- Provide text alternatives for meaningful images.
- Respect reduced-motion preferences.
- Use labels and descriptions that work with assistive technologies.

### 13.2 Contrast rules

- Never use white text on Propelr Yellow.
- Use `#2C2C2C` text on `#FFD700`.
- Secondary light-mode text `#6A6A6A` is acceptable on white for normal text.
- Use darker semantic text tokens for green and orange messages on white.
- Test text placed over imagery, even when an overlay is present.

### 13.3 Focus styles

Light mode:

```css
outline: 2px solid #2C2C2C;
outline-offset: 3px;
```

Dark mode:

```css
outline: 2px solid #FFD700;
outline-offset: 3px;
```

Do not remove focus outlines unless replacing them with an equally visible alternative.

### 13.4 Forms

- Every input needs a programmatically associated label.
- Required status should be conveyed in text, not only by an asterisk or colour.
- Errors should be associated with the relevant field.
- Preserve user input after validation errors.
- Group related controls with fieldsets and legends where appropriate.

### 13.5 Content accessibility

- Use descriptive link labels.
- Avoid long blocks of all-capital text.
- Expand acronyms on first use when the audience may not know them.
- Use headings in a logical order.
- Avoid conveying information only through spatial position.

---

## 14. Product-Specific Guidance for Pathways by Propelr

### 14.1 Product character

Pathways should feel:

- Calm
- Motivating
- Personal
- Premium
- Lightweight
- Progress-oriented
- Easy to begin without instruction

It should not feel like:

- A corporate project-management tool
- A children’s habit tracker
- A social media feed
- A competitive fitness app
- A complex productivity system

### 14.2 Welcome screen

- No login should be required for the initial experience unless business requirements change.
- Use the light or dark Pathways logo according to the active theme.
- Do not repeat “Pathways” as a heading beneath the logo.
- Use one concise value statement.
- Use one primary CTA.
- Explain local storage or privacy in short supporting text when relevant.

### 14.3 Profile creation

- Ask only for the information needed to personalise the experience.
- A name field should have a visible label.
- Avoid asking for demographics without a product reason.
- Let users edit their profile later.

### 14.4 Goal creation

- Allow a maximum of five active daily goals unless the product requirement changes.
- Make repeat frequency understandable.
- Provide date and off-day controls without overwhelming the first screen.
- Use progressive disclosure for advanced scheduling.
- Prevent conflicting or impossible date states.

### 14.5 Pathway visualisation

The pathway diagram should:

- Show progress from a clear starting point to a clear next action
- Use yellow for the current or completed path
- Use neutral grey for future steps
- Include text labels so the meaning does not depend on colour
- Remain legible on a narrow mobile screen
- Avoid decorative complexity that makes the route harder to understand

### 14.6 XP and rewards

- XP should reinforce consistency, not pressure or shame.
- Clearly explain how XP is earned.
- Avoid fake scarcity.
- Avoid gambling-like reward mechanics.
- Use celebration moments sparingly.
- Provide a reduced-motion version of milestone feedback.

### 14.7 Local data and export

When progress is stored locally:

- State this clearly.
- Warn users before clearing local data.
- Provide export when possible.
- Use human-readable export names.
- Confirm successful export.
- Never imply cloud backup when none exists.

---

## 15. Presentations and Documents

### 15.1 Presentation style

- Use white, off-white, charcoal, or black backgrounds.
- Use yellow for emphasis and navigation.
- Use red only for risks, failures, or critical issues.
- Keep generous margins.
- Prefer one idea per slide.
- Use a maximum of six bullets when bullets are necessary.
- Minimum presentation body text: 24 px.
- Use data visualisation instead of dense paragraphs when it improves understanding.

### 15.2 Document style

- Use Poppins for headings and Inter or an approved fallback for body text.
- Use left-aligned body copy.
- Use yellow rules, callouts, or small labels sparingly.
- Use a consistent heading hierarchy.
- Keep tables simple and readable.
- Avoid decorative page borders.

### 15.3 Data visualisation

- Use black, grey, and yellow as the primary sequence.
- Add semantic colours only when meaning requires them.
- Label charts directly where practical.
- Avoid 3D charts.
- Avoid unnecessary gridlines.
- Do not use many similar yellow shades that are difficult to distinguish.

---

## 16. Social and Editorial Assets

### 16.1 Core formats

Propelr may use:

- Infographics for tips, frameworks, checklists, and data
- Editorial illustrations for conceptual ideas
- Comic-style storytelling for relatable career situations, provided the execution remains intelligent and visually controlled
- Photography for human stories and credible work contexts

### 16.2 Social hierarchy

A typical social asset should include:

1. One dominant headline
2. One core visual idea
3. Minimal supporting text
4. Small Propelr branding
5. Strong negative space

### 16.3 Carousel rules

- One idea per card
- Consistent page numbering
- Strong opening hook
- Practical middle cards
- Clear closing action or takeaway
- Do not place the logo at an oversized scale on every card

### 16.4 Comic exception

Comic typography may be more expressive than the standard Poppins system, but it must remain readable and should not alter the master brand identity. Use the core colour palette and include Propelr branding consistently.

---

## 17. Code Implementation

### 17.1 CSS custom properties

Use semantic variables in components. Do not hard-code hex values repeatedly.

```css
:root {
  color-scheme: light;

  --font-heading: "Poppins", "Inter", Arial, sans-serif;
  --font-body: "Inter", Aptos, Calibri, Arial, sans-serif;
  --font-mono: "Space Mono", "Courier New", monospace;

  --brand-black: #2c2c2c;
  --brand-yellow: #ffd700;
  --brand-white: #ffffff;
  --brand-dark-gray: #4b4b4b;
  --brand-light-gray: #d9d9d9;
  --brand-off-white: #f7f7f7;
  --brand-red: #ff0000;

  --color-background: #f7f7f7;
  --color-surface: #ffffff;
  --color-surface-subtle: #f7f7f7;
  --color-surface-elevated: #ffffff;
  --color-text-primary: #2c2c2c;
  --color-text-secondary: #6a6a6a;
  --color-text-disabled: #9a9a9a;
  --color-accent: #ffd700;
  --color-on-accent: #2c2c2c;
  --color-border: #d9d9d9;
  --color-border-strong: #a8a8a8;
  --color-success: #28a745;
  --color-success-text: #166534;
  --color-warning: #f5a623;
  --color-warning-text: #8a4b00;
  --color-error: #d92d20;
  --color-focus: #2c2c2c;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-pill: 999px;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 40px;
  --space-8: 48px;
  --space-9: 64px;
  --space-10: 80px;
  --space-11: 96px;
  --space-12: 128px;

  --shadow-card: 0 6px 16px rgba(44, 44, 44, 0.08);
  --shadow-overlay: 0 16px 40px rgba(44, 44, 44, 0.14);

  --duration-fast: 120ms;
  --duration-standard: 180ms;
  --duration-slow: 240ms;
  --duration-emphasis: 360ms;
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --ease-enter: cubic-bezier(0, 0, 0, 1);
  --ease-exit: cubic-bezier(0.3, 0, 1, 1);

  --content-max: 1280px;
  --container-max: 1140px;
  --reading-max: 700px;
}

[data-theme="dark"] {
  color-scheme: dark;

  --color-background: #0c0c0c;
  --color-surface: #1a1a1a;
  --color-surface-subtle: #151515;
  --color-surface-elevated: #222222;
  --color-text-primary: #ffffff;
  --color-text-secondary: #b5b5b5;
  --color-text-disabled: #777777;
  --color-accent: #ffd700;
  --color-on-accent: #2c2c2c;
  --color-border: #2f2f2f;
  --color-border-strong: #555555;
  --color-success: #34c759;
  --color-success-text: #34c759;
  --color-warning: #ff9500;
  --color-warning-text: #ff9500;
  --color-error: #ff453a;
  --color-focus: #ffd700;

  --shadow-card: 0 8px 24px rgba(0, 0, 0, 0.32);
  --shadow-overlay: 0 20px 48px rgba(0, 0, 0, 0.48);
}
```

### 17.2 Base page styles

```css
html {
  font-family: var(--font-body);
  background: var(--color-background);
  color: var(--color-text-primary);
  text-rendering: optimizeLegibility;
}

body {
  margin: 0;
  min-width: 320px;
  background: var(--color-background);
  color: var(--color-text-primary);
}

* {
  box-sizing: border-box;
}

:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 3px;
}

::selection {
  background: var(--color-accent);
  color: var(--color-on-accent);
}
```

### 17.3 Component architecture

Recommended structure:

```text
src/
  assets/
    brand/
      propelr-logo-black.svg
      propelr-logo-white.svg
      propelr-logo-yellow.svg
      propelr-icon.svg
  components/
    brand/
      BrandLogo
      ProductLogo
    ui/
      Button
      Card
      Input
      Select
      Checkbox
      Radio
      Tabs
      Badge
      Alert
      Dialog
      Sheet
      Toast
      Progress
  styles/
    tokens.css
    typography.css
    globals.css
  content/
    messages.ts
  theme/
    ThemeProvider
```

### 17.4 Component requirements

Every reusable interactive component should define:

- Default state
- Hover state
- Active or pressed state
- Focus-visible state
- Disabled state
- Loading state where relevant
- Error state where relevant
- Dark-mode behaviour
- Accessible name
- Keyboard behaviour

### 17.5 No magic values

Claude Code should not introduce one-off values such as `#facc15`, `border-radius: 14px`, or `padding: 18px` when an existing token serves the same purpose.

When a new value is genuinely required:

1. Explain why existing tokens are insufficient.
2. Add the new value to the token system.
3. Apply it consistently.
4. Update this document or the token file.

### 17.6 Framework guidance

The brand system is framework-independent.

For Tailwind, map semantic tokens rather than using default colour names directly.

Preferred:

```js
colors: {
  background: "var(--color-background)",
  surface: "var(--color-surface)",
  foreground: "var(--color-text-primary)",
  muted: "var(--color-text-secondary)",
  accent: "var(--color-accent)",
  "accent-foreground": "var(--color-on-accent)",
  border: "var(--color-border)",
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  error: "var(--color-error)"
}
```

Avoid building components directly with generic palette classes such as `yellow-400`, `zinc-900`, or `red-500` unless those classes are explicitly mapped to Propelr tokens.

---

## 18. Repository and Asset Naming

### 18.1 Repository names

Use lowercase kebab case.

Examples:

- `pathways-by-propelr`
- `propelr-brand-system`
- `propelr-content-platform`

### 18.2 File naming

Use lowercase kebab case for assets and styles.

Examples:

- `propelr-logo-black.svg`
- `career-pathway-hero.webp`
- `goal-card.tsx`
- `brand-tokens.css`

### 18.3 Image formats

- SVG for logos and simple icons
- WebP or AVIF for photographic web imagery
- PNG only when transparency or compatibility requires it
- PDF for controlled distribution of final documents

### 18.4 Asset handling

- Do not modify master logo files destructively.
- Store generated variants separately.
- Optimise images without visible degradation.
- Include meaningful alt text in implementation, not in filenames alone.

---

## 19. Quality Assurance Checklist

Before considering a Propelr interface complete, verify:

### Brand

- [ ] Brand name is written as Propelr.
- [ ] The correct logo variant is used.
- [ ] Logo proportions and clear space are preserved.
- [ ] No unapproved colours or fonts were introduced.
- [ ] Yellow is used selectively.
- [ ] Red is reserved for error or destructive meaning.
- [ ] The visual style is minimal, premium, and purposeful.

### Content

- [ ] The main purpose of the screen is clear.
- [ ] Headlines use sentence case.
- [ ] CTA labels describe real actions.
- [ ] Copy avoids hype and corporate clichés.
- [ ] Error messages explain recovery.
- [ ] Empty states offer a useful next action.

### Responsive behaviour

- [ ] The screen works at 320 px width.
- [ ] No unintended horizontal scrolling exists.
- [ ] Dense layouts reflow rather than shrink excessively.
- [ ] Touch targets are at least 44 by 44 px.
- [ ] Fixed actions respect mobile safe areas.

### Accessibility

- [ ] Keyboard navigation works.
- [ ] Focus states are visible.
- [ ] Labels are programmatically associated with fields.
- [ ] Colour is not the only status signal.
- [ ] Text contrast meets AA requirements.
- [ ] Reduced-motion preferences are respected.
- [ ] Meaningful images have appropriate text alternatives.

### Engineering

- [ ] Components use semantic tokens.
- [ ] No unnecessary magic values were added.
- [ ] Light and dark themes are implemented through variables.
- [ ] Component states are complete.
- [ ] Brand assets are referenced from a central location.
- [ ] Reusable patterns are componentised.

---

## 20. Ready-to-Paste Claude Code Instruction

Use the following instruction at the beginning of a Claude Code task:

```text
Use PROPELR_BRAND_GUIDELINES_FOR_CLAUDE_CODE.md as the visual, content, accessibility, and component source of truth for this project.

Before writing code:
1. Inspect the existing repository structure and current design tokens.
2. Identify any conflicts with the Propelr guidelines.
3. Reuse existing components when they can be brought into compliance cleanly.
4. Implement mobile-first responsive behaviour.
5. Use semantic CSS variables rather than hard-coded colour values.
6. Preserve accessible contrast, keyboard support, focus states, and 44 by 44 px touch targets.
7. Do not introduce new colours, fonts, gradients, decorative effects, or component styles without explaining why the current system is insufficient.
8. Use Propelr Yellow selectively and never use white text on yellow.
9. Use red only for errors, critical alerts, and destructive actions.
10. Keep the interface clean, premium, calm, practical, and execution-focused.

After implementation, report:
- Files changed
- Components created or reused
- Brand guideline decisions applied
- Accessibility checks completed
- Any unresolved conflicts or deviations
```

---

## 21. Non-Negotiable Summary

When uncertain, use these defaults:

- Light background: `#F7F7F7`
- Light surface: `#FFFFFF`
- Dark background: `#0C0C0C`
- Dark surface: `#1A1A1A`
- Primary text: `#2C2C2C` in light mode, `#FFFFFF` in dark mode
- Accent: `#FFD700`
- Heading font: Poppins
- Body font: Inter
- Technical font: Space Mono
- Grid: 8 px
- Button radius: 12 px
- Card radius: 16 px
- Dialog radius: 20 px
- Touch target: minimum 44 by 44 px
- Visual character: minimal, matte, premium, practical, and human
- Copy character: clear, honest, confident, useful, and free of hype

**The defining rule:** Propelr should help people move forward without adding noise.
