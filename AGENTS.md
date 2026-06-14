# AGENTS.md - Spijkersbouw Development Guide

Guidelines for agentic coding agents working on this codebase.

## Project Overview

- **Stack**: Next.js 16, React 19, TypeScript, Tailwind CSS v4
- **Language**: Dutch (nl)

## Build & Development Commands

```bash
npm run dev          # Start development server at http://localhost:3000
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Running a Single Test

No test framework is configured. To add tests:

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

Once tests are added:

```bash
npx jest --testPathPattern=<test-name>
```

## Code Style Guidelines

### General Principles

- Keep components small and focused
- Use functional components with hooks
- Avoid unnecessary comments
- Use TypeScript for all files (.ts/.tsx)

### File Naming

- **Components**: PascalCase (`Header.tsx`, `Footer.tsx`)
- **Pages**: kebab-case directory with `page.tsx` (`src/app/over-ons/page.tsx`)
- **Utilities**: camelCase

### Import Patterns

Use `@/` path alias:

```typescript
import Header from "@/components/Header";
```

Order: Next.js imports → External → Internal → Relative

### TypeScript Guidelines

- Strict mode enabled
- Use explicit types for parameters and returns
- Use interfaces for object shapes
- Avoid `any`, use `unknown` when needed

### Component Structure

```typescript
"use client";

import { useState } from "react";
import Link from "next/link";

interface Props {
  title: string;
}

export default function ComponentName({ title }: Props) {
  const [state, setState] = useState(false);
  return <div><h1>{title}</h1></div>;
}
```

### Tailwind CSS v4

Uses `@import "tailwindcss"` syntax with `@theme inline`:

```css
@import "tailwindcss";

@theme inline {
  --color-primary: #e65100;
}
```

- Custom `.container-custom` utility for page containers
- Mobile-first responsive design
- Brand colors defined as CSS variables in `globals.css`

### Naming Conventions

- **Components**: PascalCase (`Header`)
- **Variables/functions**: camelCase (`isOpen`)
- **CSS classes**: kebab-case (`bg-black`)

### Accessibility

- Always include `alt` props for images
- Use semantic HTML elements
- Include `aria-label` on icon-only buttons

### Image Handling

Use Next.js Image with explicit dimensions:

```typescript
<Image src="/image.jpg" alt="Description" width={400} height={300} />
```

For full-bleed: use `fill` with parent `relative` container.

### Routing (Next.js App Router)

- Pages in `src/app/<route>/page.tsx`
- Use `layout.tsx` for shared layouts
- Server components by default, add "use client" for interactivity

### Dutch Language

- All content in Dutch
- Set `lang="nl"` on html element

## Common Tasks

### Adding a New Page

1. Create `src/app/<page-name>/page.tsx`
2. Add navigation link in `Header.tsx`

### Adding a New Component

1. Create `src/components/<ComponentName>.tsx`
2. Export as default
3. Import in the page using it

### Modifying Styles

Edit `src/app/globals.css` for global styles and Tailwind configuration.

## ESLint

Configured with `eslint-config-next` (core-web-vitals + TypeScript). Run `npm run lint` before committing.
