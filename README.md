# Huellitas Front

Frontend con Vite, React, TypeScript y Tailwind CSS (pnpm).

## Inicio

```bash
pnpm install
pnpm dev
```

## Scripts

- `pnpm dev` — desarrollo
- `pnpm build` — producción
- `pnpm preview` — previsualizar build
- `pnpm lint` — comprobar tipos

## Arquitectura de módulos (por rol)

```
src/modules/
  auth/                 # login / sesión (compartido)
  superadmin/
  veterinario/
  recepcionista/
  auxiliar/
  cliente/
```

Cada rol incluye: `pages/`, `components/`, `hooks/`, `services/`, `styles/`, `types/`, `utils/`.

## Branding

```
src/assets/branding/
  huellitas-logo-principal-with-bg.png|.svg      # emblema (logo_principal)
  huellitas-logo-principal-transparent.png|.svg
  huellitas-wordmark-with-bg.png|.svg            # letras
  huellitas-wordmark-transparent.png|.svg
```

```tsx
import { BrandLogo } from '@/global/components'

<BrandLogo mark="principal" variant="transparent" />
<BrandLogo mark="wordmark" variant="with-bg" />
```

Alias `@/` → `src/`.

## Auth (cara principal)

La app arranca en `LoginPage` (`src/modules/auth/pages`):
- Fondo hi-res: `src/modules/auth/assets/login-background.jpeg`
- Wordmark + emblema Huellitas
- Formulario listo (API pendiente)

