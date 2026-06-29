---
name: Tavern Hearth
colors:
  surface: '#1f0f0d'
  surface-dim: '#1f0f0d'
  surface-bright: '#493432'
  surface-container-lowest: '#190a08'
  surface-container-low: '#281715'
  surface-container: '#2d1b19'
  surface-container-high: '#382523'
  surface-container-highest: '#44302d'
  on-surface: '#fcdbd7'
  on-surface-variant: '#d6c3b0'
  inverse-surface: '#fcdbd7'
  inverse-on-surface: '#3f2b29'
  outline: '#9f8e7c'
  outline-variant: '#524535'
  surface-tint: '#ffb95a'
  primary: '#ffd7a9'
  on-primary: '#462a00'
  primary-container: '#ffb347'
  on-primary-container: '#704700'
  inverse-primary: '#845400'
  secondary: '#eabcb8'
  on-secondary: '#462827'
  secondary-container: '#5f3e3c'
  on-secondary-container: '#d7aaa7'
  tertiary: '#edddb5'
  on-tertiary: '#383014'
  tertiary-container: '#d0c19b'
  on-tertiary-container: '#594f31'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffddb6'
  primary-fixed-dim: '#ffb95a'
  on-primary-fixed: '#2a1800'
  on-primary-fixed-variant: '#643f00'
  secondary-fixed: '#ffdad7'
  secondary-fixed-dim: '#eabcb8'
  on-secondary-fixed: '#2e1413'
  on-secondary-fixed-variant: '#5f3e3c'
  tertiary-fixed: '#f1e1b9'
  tertiary-fixed-dim: '#d4c59f'
  on-tertiary-fixed: '#221b03'
  on-tertiary-fixed-variant: '#504629'
  background: '#1f0f0d'
  on-background: '#fcdbd7'
  surface-variant: '#44302d'
typography:
  display-lg:
    fontFamily: EB Garamond
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: EB Garamond
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: EB Garamond
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Source Sans 3
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Source Sans 3
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Space Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-padding: 24px
  gutter: 16px
  panel-gap: 32px
---

## Brand & Style
The brand personality is cozy, rustic, and immersive, designed to evoke the warmth of a medieval tavern at dusk. The target audience includes tabletop gamers, fantasy enthusiasts, and users seeking a tactile, "analog" digital experience.

The design style is **Tactile & Skeuomorphic**, blending historical material metaphors with modern usability. It prioritizes the feeling of physical objects: the grain of dark oak, the texture of weathered parchment, and the glow of candlelight. Visuals are grounded in "Old World" craftsmanship, using ornate detailing and organic imperfections to move away from sterile modernism toward a rich, storied atmosphere.

## Colors
The palette is centered on the contrast between deep wood and glowing embers. 

- **Primary (Amber Glow):** Used for interactive states, call-to-actions, and highlights that simulate firelight.
- **Secondary (Deep Oak):** The foundation for structural containers and header bars.
- **Neutral (Iron & Shadow):** The base background color, providing a deep, grounded canvas.
- **Parchment (Surface):** Used for primary content areas where readability is paramount, mimicking the look of old scrolls.
- **Accents:** A muted "Forest Green" for success states or nature-themed elements, and a "Dried Blood" red for errors or critical warnings.

## Typography
Typography creates a bridge between fantasy and functionality.

- **Headlines (EB Garamond):** An elegant, classical serif that captures the literary nature of scrolls and ancient tomes. Use "Small Caps" for sub-headers to enhance the historical feel.
- **Body (Source Sans 3):** A clean, highly legible sans-serif for long-form text, ensuring the fantasy aesthetic doesn't compromise readability.
- **Stats & Data (Space Mono):** A monospaced font used for "system" information, character stats, and technical data, providing a structured, precise contrast to the organic serif.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy, treating the screen as a collection of physical objects—trays, scrolls, and boards—laid out on a tavern table. 

- **Desktop:** A 12-column centered layout with wide gutters (32px) to allow "tabletop" background textures to show through. 
- **Mobile:** Elements stack into a single column, mimicking a single vertical scroll.
- **Rhythm:** Spacing is generous to prevent the dense textures from feeling cluttered. Use 8px increments for internal component spacing, but larger 32px or 48px gaps between major structural "wooden panels."

## Elevation & Depth
Depth is created through **Tonal Layers** and **Ambient Shadows** that simulate a single light source (candlelight).

1. **The Table (Level 0):** The deepest background, using the darkest wood texture (#2D1B19).
2. **Wooden Panels (Level 1):** Slightly lighter wood (#4A2C2A) with 1px inner highlights on the top edge to simulate a "carved" depth.
3. **Parchment (Level 2):** Content surfaces that sit "on top" of the wood. These use soft, low-opacity amber-tinted shadows (`rgba(255, 179, 71, 0.15)`) to suggest they are illuminated by nearby flames.
4. **Wax Seals & Iron Pins (Level 3):** Floating interactive elements with more pronounced, tighter shadows to indicate they are physically attached to or hovering above the surface.

## Shapes
Shapes are intentionally slightly irregular. While the technical roundedness is set to `Soft`, implementation should avoid perfect circles where possible.

- **Primary Containers:** Use the `Soft` setting (0.25rem) to mimic hand-cut wood or thick hide.
- **Buttons:** Use slightly more rounded corners or "clipped" corners to resemble metal plates.
- **Scrolls:** The top and bottom edges of parchment containers should be "torn" or uneven rather than perfectly straight.
- **Dividers:** Use ornate "flourish" SVG dividers or horizontal lines that look like iron rods.

## Components
- **Buttons:** Styled as "Wax Seals" (circular, crimson, with an icon) for secondary actions, or "Iron-Clad Bricks" (dark brown with amber text and a 1px gold border) for primary actions.
- **Cards/Panels:** These should look like wooden boards with beveled edges. Content within them sits on "Parchment" insets.
- **Input Fields:** Styled as "Indentations" in the parchment, using a darker cream fill and a subtle inner shadow to look pressed into the paper.
- **Lists:** Items separated by thin, scorched-line dividers. Selection states use a soft amber outer glow.
- **Progress Bars:** Designed to look like a "Vial" of liquid (green or red) or a "Burning Fuse" that glows brighter as it fills.
- **Modals:** Presented as a "Unrolling Scroll" animation, expanding vertically from the center.