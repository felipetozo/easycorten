<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Project Structure Rules

## Route Groups
The app is split into two route groups inside `src/app/`:
- `(site)` — public-facing website
- `(admin)` — admin dashboard

Each group has its own `layout.tsx`. There is no top-level `layout.tsx` with shared UI — only a root layout for metadata/html/body.

## Component Rules

### Component folder rule
Every component lives in its **own folder** named after the component. The folder contains exactly:
- `ComponentName.tsx`
- `ComponentName.module.css`

Never place two components in the same folder (except page-level `page.tsx` / `layout.tsx`). Never co-locate multiple components in one `.tsx` file.

```
src/components/site/
  Navbar/
    Navbar.tsx
    Navbar.module.css
  HeroBanner/
    HeroBanner.tsx
    HeroBanner.module.css
```

### UI components
Reusable UI primitives (buttons, inputs, fields, modals, badges, etc.) go in `src/components/ui/`, each in its own folder:
```
src/components/ui/
  Button/
    Button.tsx
    Button.module.css
```

No UI primitive should import from another UI primitive's module.css — only from its own.

### Feature/section components
Site-specific sections (Hero, Navbar, Footer, etc.) go in `src/components/site/`.
Admin-specific components go in `src/components/admin/`.

## Styling Rules

### globals.css
`src/app/globals.css` holds:
- CSS custom properties (design tokens): colors, spacing, typography, shadows, border radii, transitions
- Base resets and body defaults
- No component-specific styles

Whenever a color, font size, spacing value, or other design token is needed and it doesn't already exist as a CSS variable in globals.css, **add it there first**, then reference it via `var(--token-name)` in the module.css.

### Module CSS
Each component's `.module.css` must only use tokens from `globals.css` via `var()`. No hardcoded hex colors, pixel font sizes, or raw spacing values that aren't already tokens.

## Component Layout Structure

Every section component follows this exact structure:

```tsx
<section className={styles.section}>
  <div className={styles.wrapper}>
    {/* content */}
  </div>
</section>
```

```css
.section {
  width: 100%;
  padding: 10rem 0; /* or 5rem — adjust per design, always rem */
}

.wrapper {
  width: 83.33%;
  max-width: 100rem;
  margin: 0 auto;
  /* no padding unless explicitly requested */
}

@media (max-width: 768px) {
  .wrapper {
    width: 90%;
  }
}
```

Rules:
- **Always `<section>` as root** with `width: 100%` and vertical padding in `rem`. Never `vh`, `vw`, or `px` for layout spacing.
- **`<div className={styles.wrapper}>`** inside every section: `83.33%` width, `margin: 0 auto` on desktop; `90%` on mobile. No padding on the wrapper unless explicitly requested.
- **Units:** use `rem` for spacing and sizing. Avoid `px`, `vh`, `vw` unless there is no rem equivalent.
- **Colors:** always use `rgba()`. Never hex, `rgb()`, or named colors. Always set via `background-color` (not `background` shorthand) for backgrounds.

## Images

Always prefer `.avif` format. Use `<picture>` with fallbacks in this order: `avif` → `webp` → `png`. For Next.js `<Image>`, set `src` to `.avif` — Next.js handles format negotiation automatically when the file exists. Only fall back to `webp` or `png` if the `.avif` is not available.

```tsx
<picture>
  <source srcSet="/image.avif" type="image/avif" />
  <source srcSet="/image.webp" type="image/webp" />
  <img src="/image.png" alt="..." />
</picture>
```

## File Naming
- Components: PascalCase (`HeroSection.tsx`, `Button.tsx`)
- CSS Modules: same name as component (`HeroSection.module.css`, `Button.module.css`)
- Pages: Next.js convention (`page.tsx`, `layout.tsx`)
