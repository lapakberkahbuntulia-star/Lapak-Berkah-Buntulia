---
name: Lapak Berkah Buntulia Design System
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#424750'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#727781'
  outline-variant: '#c2c6d1'
  surface-tint: '#27609d'
  primary: '#003461'
  on-primary: '#ffffff'
  primary-container: '#004b87'
  on-primary-container: '#8abcff'
  inverse-primary: '#a3c9ff'
  secondary: '#894c5c'
  on-secondary: '#ffffff'
  secondary-container: '#ffb1c3'
  on-secondary-container: '#7b4050'
  tertiary: '#003c1b'
  on-tertiary: '#ffffff'
  tertiary-container: '#00562a'
  on-tertiary-container: '#39d377'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d3e4ff'
  primary-fixed-dim: '#a3c9ff'
  on-primary-fixed: '#001c38'
  on-primary-fixed-variant: '#004882'
  secondary-fixed: '#ffd9e0'
  secondary-fixed-dim: '#ffb1c3'
  on-secondary-fixed: '#380a1a'
  on-secondary-fixed-variant: '#6e3545'
  tertiary-fixed: '#6bfe9c'
  tertiary-fixed-dim: '#4ae183'
  on-tertiary-fixed: '#00210c'
  on-tertiary-fixed-variant: '#005228'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  headline-md-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  numeric-data:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '700'
    lineHeight: 24px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  container-margin: 16px
  touch-target-min: 48px
---

## Brand & Style

The design system is engineered for a high-traffic Point of Sale (POS) environment where speed, reliability, and clarity are paramount. The brand personality is **Professional, Trustworthy, and Efficient**, balancing the corporate stability of Navy Blue with the approachable warmth of the secondary Pink accent.

The visual style follows a **Corporate / Modern** aesthetic with a focus on high-utility functionalism. Key traits include:
- **High Readability:** Prioritizing data density without compromising legibility for fast-paced cashier environments.
- **Intentional Contrast:** Using the vibrant pink for primary actions and navy for structural stability.
- **Mobile-First Utility:** Touch-friendly targets and streamlined workflows optimized for handheld POS devices and tablet dashboards.
- **Clean Functionalism:** Minimalist ornamentation, relying on purposeful color-coding for status indicators (stock, profit/loss).

## Colors

The color palette is anchored by the brand's core identity, optimized for a professional software interface.

- **Primary (Navy Blue - #004B87):** Used for top navigation, primary headers, and critical structural elements. It conveys authority and security.
- **Secondary (Pink - #F4A7B9):** Reserved for primary Call-to-Actions (CTAs), active selection states, and highlighting key branding elements.
- **Functional Accents:** 
    - **Success/Profit (Green):** Used for positive stock levels and profit indicators.
    - **Danger/Loss (Red):** Used for out-of-stock alerts and financial loss.
- **Surface & Backgrounds:** A clean "off-white" slate (#F8FAFC) is used to reduce eye strain during long shifts, with pure white cards to define content areas.

## Typography

This design system utilizes **Hanken Grotesk** for its sharp, contemporary geometry and exceptional legibility at small sizes—crucial for receipts and dense data tables.

- **Weight Usage:** Use `Bold (700)` for primary currency amounts and checkout totals. Use `Semi-Bold (600)` for section headers and button labels.
- **Hierarchy:** Maintain a clear distinction between labels (e.g., "SKU:") and data (e.g., "100234").
- **Mobile Scaling:** Headline sizes are aggressively reduced on mobile to maximize horizontal space for tables and transactional lists.

## Layout & Spacing

The layout is built on an **8px linear grid system** to ensure mathematical consistency across all screen sizes.

- **Grid Model:** 12-column fluid grid for Desktop Admin; 4-column fluid grid for Mobile Cashier.
- **Touch Areas:** All interactive elements (buttons, toggles, list items) must maintain a minimum height of `48px` to accommodate rapid, high-accuracy tapping in a physical POS setting.
- **Margins:** Standardize on a `16px` (md) gutter between cards and a `24px` (lg) margin for container edges on tablet/desktop.

## Elevation & Depth

To maintain a "Professional / Modern" feel, depth is communicated through **Tonal Layers** and **Subtle Shadows** rather than heavy skeuomorphism.

- **Level 0 (Background):** Neutral Slate (#F8FAFC) - the base canvas.
- **Level 1 (Cards/Sheets):** White surface with a `1px` stroke in a light grey (#E2E8F0). No shadow.
- **Level 2 (Active Elements):** White surface with an ambient, soft shadow (Blur: 8px, Y: 4px, Opacity: 4% Black) to indicate interactivity or floating action buttons (FABs).
- **Level 3 (Modals/Pickers):** Focused overlays with a backdrop dim (40% Navy) to isolate the user's attention.

## Shapes

The design system adopts a **Soft (4px - 12px)** corner radius. This provides a balance between the precision of a professional tool and the modern approachability of the brand.

- **Small Components (Inputs, Chips):** 4px radius.
- **Standard Components (Buttons, Cards):** 8px radius.
- **Large Components (Modals, Feature Banners):** 12px radius.

## Components

### Buttons & Interaction
- **Primary Button:** Solid Pink (#F4A7B9) with White text. Used for "Pay", "Complete Order", or "Save".
- **Secondary Button:** White background with Navy Blue border and text. Used for "Add Discount", "Void", or "Print Preview".
- **Floating Action Button (FAB):** Specifically for mobile, a circular button with a barcode icon for quick-access scanning.

### Data Tables & Status
- **Compact Tables:** Zebra-striping every other row for readability. Currency columns must be right-aligned and bolded.
- **Status Chips:** 
    - *In Stock:* Green tint background + Dark Green text.
    - *Low Stock:* Yellow tint + Dark Brown text.
    - *Out of Stock:* Red tint + Dark Red text.
- **Profit/Loss Indicators:** Use upward (Green) or downward (Red) arrows next to currency values in reports.

### POS Specifics
- **Barcode Interface:** A full-screen camera overlay with a high-contrast viewfinder frame in Pink to guide the user.
- **Date Picker:** Use a simplified calendar grid with large touch targets; the "Today" button should always be anchored for quick selection.
- **Input Fields:** Outlined style with clear floating labels. Focused state uses a 2px Navy Blue border.