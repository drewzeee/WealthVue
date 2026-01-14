# WealthVue Branding Guide

This document outlines the colors, typography, and theming system used in the Homebase application.

---

## Typography

### Font Families

| Purpose | Font | Fallback |
|---------|------|----------|
| **Sans (Body)** | Space Grotesk | sans-serif |
| **Headings** | Space Grotesk | sans-serif |
| **Monospace** | JetBrains Mono | monospace |

### Font Weights Available

- **Space Grotesk**: 300 (Light), 400 (Regular), 500 (Medium), 600 (Semi-Bold), 700 (Bold)
- **JetBrains Mono**: 300 (Light), 400 (Regular), 500 (Medium), 700 (Bold)

### CSS Variables

```css
--font-sans: 'Space Grotesk', sans-serif;
--font-heading: 'Space Grotesk', sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

---

## Color System

The application uses the **OKLch color space** for perceptually uniform colors that work well across light and dark themes.

### Color Format

All colors use the OKLch format: `oklch(lightness chroma hue / alpha)`

- **Lightness**: 0 (black) to 1 (white)
- **Chroma**: 0 (grey) to ~0.4 (most saturated)
- **Hue**: 0-360 degrees on the color wheel
- **Alpha**: Optional, 0 (transparent) to 1 (opaque)

---

## Theme: Light (Default)

A clean, modern light theme with violet accents.

### Primary Palette

| Token | OKLch Value | Description |
|-------|-------------|-------------|
| `--background` | `oklch(0.985 0.01 240)` | Off-white with subtle blue tint |
| `--foreground` | `oklch(0.145 0.02 240)` | Near-black text |
| `--primary` | `oklch(0.45 0.24 270)` | Modern Violet |
| `--primary-foreground` | `oklch(0.985 0 0)` | White |

### Secondary & Accent

| Token | OKLch Value | Description |
|-------|-------------|-------------|
| `--secondary` | `oklch(0.95 0.05 270)` | Light violet tint |
| `--secondary-foreground` | `oklch(0.45 0.24 270)` | Violet text |
| `--accent` | `oklch(0.96 0.02 240)` | Subtle blue-grey |
| `--accent-foreground` | `oklch(0.45 0.24 270)` | Violet text |

### Surface Colors

| Token | OKLch Value | Description |
|-------|-------------|-------------|
| `--card` | `oklch(1 0 0)` | Pure white |
| `--card-foreground` | `oklch(0.145 0.02 240)` | Dark text |
| `--popover` | `oklch(1 0 0)` | Pure white |
| `--popover-foreground` | `oklch(0.145 0.02 240)` | Dark text |
| `--muted` | `oklch(0.96 0.02 240)` | Subtle grey |
| `--muted-foreground` | `oklch(0.55 0.04 240)` | Medium grey text |

### Interactive & State Colors

| Token | OKLch Value | Description |
|-------|-------------|-------------|
| `--border` | `oklch(0.92 0.02 240)` | Light grey border |
| `--input` | `oklch(0.92 0.02 240)` | Input borders |
| `--ring` | `oklch(0.45 0.24 270)` | Focus ring (violet) |
| `--destructive` | `oklch(0.6 0.2 20)` | Red/orange for errors |
| `--destructive-foreground` | `oklch(0.98 0 0)` | White text on destructive |

---

## Theme: Dark (Futuristic/Neon)

A sci-fi inspired dark theme with vibrant lime green accents and glassmorphism effects.

### Primary Palette

| Token | OKLch Value | Description |
|-------|-------------|-------------|
| `--background` | `oklch(0.12 0.01 260)` | Deep black-blue |
| `--foreground` | `oklch(0.98 0 0)` | Near-white text |
| `--primary` | `oklch(0.88 0.22 135)` | Vibrant Lime Green |
| `--primary-foreground` | `oklch(0.12 0.01 260)` | Dark text on primary |

### Secondary & Accent

| Token | OKLch Value | Description |
|-------|-------------|-------------|
| `--secondary` | `oklch(0.18 0.02 260)` | Dark blue-grey |
| `--secondary-foreground` | `oklch(0.90 0.02 260)` | Light grey text |
| `--accent` | `oklch(0.25 0.05 260)` | Slightly lighter dark |
| `--accent-foreground` | `oklch(0.88 0.22 135)` | Lime green text |

### Glass/Surface Colors

| Token | OKLch Value | Description |
|-------|-------------|-------------|
| `--card` | `oklch(0.25 0.01 260 / 0.6)` | Semi-transparent glass |
| `--card-foreground` | `oklch(0.98 0 0)` | White text |
| `--popover` | `oklch(0.25 0.01 260 / 0.9)` | More opaque glass |
| `--popover-foreground` | `oklch(0.98 0 0)` | White text |
| `--muted` | `oklch(0.18 0.02 260 / 0.5)` | Subtle dark with transparency |
| `--muted-foreground` | `oklch(0.70 0.02 260)` | Medium grey text |

### Interactive & State Colors

| Token | OKLch Value | Description |
|-------|-------------|-------------|
| `--border` | `oklch(1 0 0 / 0.1)` | Subtle white border (10% opacity) |
| `--input` | `oklch(1 0 0 / 0.1)` | Input borders |
| `--ring` | `oklch(0.88 0.22 135)` | Focus ring (lime green) |
| `--destructive` | `oklch(0.45 0.15 25)` | Muted red for errors |
| `--destructive-foreground` | `oklch(0.98 0 0)` | White text |

### Background Effects

The dark theme includes a complex sci-fi background:

```css
background-color: oklch(0.10 0.01 260);
background-image:
    /* Radial glow at top center */
    radial-gradient(circle at 50% 0%, oklch(0.15 0.05 260 / 0.5) 0%, transparent 60%),
    /* Horizontal grid lines */
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    /* Vertical grid lines */
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
background-size: 100% 100%, 40px 40px, 40px 40px;
background-attachment: fixed; /* Parallax effect */
```

---

## Theme: Pink

A warm, modern pink theme with a soft aesthetic.

### Primary Palette

| Token | OKLch Value | Description |
|-------|-------------|-------------|
| `--background` | `oklch(0.97 0.02 340)` | Soft pink-tinted white |
| `--foreground` | `oklch(0.3 0.1 340)` | Deep rose text |
| `--primary` | `oklch(0.6 0.25 340)` | Hot Pink |
| `--primary-foreground` | `oklch(1 0 0)` | Pure white |

### Secondary & Accent

| Token | OKLch Value | Description |
|-------|-------------|-------------|
| `--secondary` | `oklch(0.93 0.08 340)` | Light pink |
| `--secondary-foreground` | `oklch(0.6 0.25 340)` | Hot pink text |
| `--accent` | `oklch(0.93 0.08 340)` | Light pink |
| `--accent-foreground` | `oklch(0.6 0.25 340)` | Hot pink text |

### Surface Colors

| Token | OKLch Value | Description |
|-------|-------------|-------------|
| `--card` | `oklch(1 0 0)` | Pure white |
| `--card-foreground` | `oklch(0.3 0.1 340)` | Deep rose text |
| `--popover` | `oklch(1 0 0)` | Pure white |
| `--popover-foreground` | `oklch(0.3 0.1 340)` | Deep rose text |
| `--muted` | `oklch(0.93 0.04 340)` | Subtle pink |
| `--muted-foreground` | `oklch(0.6 0.1 340)` | Medium rose text |

### Interactive & State Colors

| Token | OKLch Value | Description |
|-------|-------------|-------------|
| `--border` | `oklch(0.9 0.05 340)` | Soft pink border |
| `--input` | `oklch(0.9 0.05 340)` | Input borders |
| `--ring` | `oklch(0.6 0.25 340)` | Focus ring (hot pink) |
| `--destructive` | `oklch(0.6 0.2 20)` | Red for errors |
| `--destructive-foreground` | `oklch(0.98 0 0)` | White text |

---

## Border Radius

| Token | Value | Description |
|-------|-------|-------------|
| `--radius` | `1rem` (16px) | Base radius |
| `--radius-lg` | `1rem` | Large elements |
| `--radius-md` | `calc(1rem - 2px)` | Medium elements |
| `--radius-sm` | `calc(1rem - 4px)` | Small elements |

---

## Utility Classes

### Glassmorphism Panel

```css
.glass-panel {
    @apply bg-card/60 backdrop-blur-md border border-white/5 shadow-xl;
}
```

Use for cards and panels that need the frosted glass effect (especially in dark theme).

### Text Glow

```css
.text-glow {
    text-shadow: 0 0 10px rgba(var(--primary), 0.5);
}
```

Adds a neon glow effect to text using the primary color.

### Box Glow

```css
.box-glow {
    box-shadow: 0 0 20px rgba(var(--primary), 0.2);
}
```

Adds a subtle glow effect around elements.

---

## Theme Implementation

### Theme Provider

Themes are managed via React Context in `src/core/theme/ThemeContext.tsx`:

- **Available themes**: `light`, `dark`, `pink`
- **Default theme**: `light` (configured as `dark` in App.tsx)
- **Storage key**: `vite-ui-theme` (persists to localStorage)
- **HTML attribute**: `data-theme` on document root

### Usage in Components

```tsx
import { useTheme } from '@/core/theme/ThemeContext';

function MyComponent() {
    const { theme, setTheme } = useTheme();

    return (
        <button onClick={() => setTheme('dark')}>
            Switch to Dark
        </button>
    );
}
```

### Theme Switcher

Located at `src/core/theme/ThemeSwitcher.tsx` with icons:
- **Light**: Sun icon
- **Dark**: Moon icon
- **Pink**: Heart icon

---

## Tailwind Usage

Colors are exposed to Tailwind via CSS variables and can be used with standard utility classes:

```html
<!-- Backgrounds -->
<div class="bg-background">...</div>
<div class="bg-primary">...</div>
<div class="bg-card">...</div>

<!-- Text -->
<p class="text-foreground">...</p>
<p class="text-muted-foreground">...</p>
<p class="text-primary">...</p>

<!-- Borders -->
<div class="border border-border">...</div>
<input class="border-input focus:ring-ring">...</input>

<!-- With opacity -->
<div class="bg-primary/50">50% opacity primary</div>
```

---

## Color Palette Summary

### Light Theme
- **Brand**: Violet (`oklch(0.45 0.24 270)`)
- **Background**: Cool off-white
- **Aesthetic**: Clean, professional, modern

### Dark Theme
- **Brand**: Lime Green (`oklch(0.88 0.22 135)`)
- **Background**: Deep black with grid overlay
- **Aesthetic**: Futuristic, sci-fi, neon, glassmorphism

### Pink Theme
- **Brand**: Hot Pink (`oklch(0.6 0.25 340)`)
- **Background**: Warm pink-white
- **Aesthetic**: Soft, warm, playful
