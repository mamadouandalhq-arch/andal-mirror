# 🌍 i18n Multi-Language Setup

This frontend application uses **next-intl** for internationalization (i18n) support with Next.js App Router.

## 📋 Supported Languages

- 🇬🇧 **English** (`en`) - Default
- 🇫🇷 **French** (`fr`)

## 🏗️ Project Structure

```
apps/frontend/
├── src/
│   ├── i18n/
│   │   ├── config.ts          # Locale configuration
│   │   ├── routing.ts         # Routing configuration
│   │   ├── request.ts         # Server-side request config
│   │   └── index.ts           # Exports
│   ├── messages/
│   │   ├── en.json            # English translations
│   │   └── fr.json            # French translations
│   ├── components/
│   │   └── LanguageSwitcher.tsx  # Language switcher component
│   ├── app/
│   │   └── [locale]/          # Localized routes
│   │       ├── layout.tsx     # Root layout with i18n
│   │       ├── page.tsx       # Home page
│   │       └── about/
│   │           └── page.tsx   # Example page
│   ├── middleware.ts          # Locale detection middleware
│   └── types/
│       └── next-intl.d.ts     # TypeScript definitions
├── next.config.ts             # Next.js config with i18n plugin
└── I18N_SETUP.md             # This file
```

## 🚀 How It Works

### 1. **Routing**

All routes are automatically prefixed with the locale (except default):

- `/` - English version (default, no prefix)
- `/fr` - French version
- `/en` - Also works for English (optional)

### 2. **Middleware**

The middleware (`src/middleware.ts`) automatically:

- Detects user's preferred language from browser settings
- Redirects to appropriate locale
- Handles locale switching

### 3. **Translation Files**

Translations are stored in JSON files under `src/messages/`:

**en.json:**

```json
{
  "home": {
    "title": "Buy Purchasing Powers"
  }
}
```

**fr.json:**

```json
{
  "home": {
    "title": "Achat de Pouvoirs d'Achat"
  }
}
```

## 💻 Usage

### Using Translations in Components

#### Server Components

```tsx
import { useTranslations } from 'next-intl';

export default function Page() {
  const t = useTranslations('home');

  return <h1>{t('title')}</h1>;
}
```

#### Client Components

```tsx
'use client';

import { useTranslations } from 'next-intl';

export default function ClientComponent() {
  const t = useTranslations('home');

  return <h1>{t('title')}</h1>;
}
```

### Navigation Between Pages

Use the custom `Link` component from `@/i18n/routing`:

```tsx
import { Link } from '@/i18n/routing';

export default function Navigation() {
  return (
    <nav>
      <Link href="/">Home</Link>
      <Link href="/about">About</Link>
    </nav>
  );
}
```

This automatically maintains the current locale in the URL.

### Programmatic Navigation

```tsx
'use client';

import { useRouter } from '@/i18n/routing';

export default function Component() {
  const router = useRouter();

  const handleClick = () => {
    router.push('/about');
  };

  return <button onClick={handleClick}>Go to About</button>;
}
```

### Language Switcher

The `LanguageSwitcher` component is already created and can be used anywhere:

```tsx
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function Header() {
  return (
    <header>
      <LanguageSwitcher />
    </header>
  );
}
```

## 📝 Adding New Languages

1. **Update config** (`src/i18n/config.ts`):

```typescript
export type Locale = 'en' | 'fr' | 'de'; // Add 'de'

export const locales: Locale[] = ['en', 'fr', 'de'];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
  de: 'Deutsch', // Add German
};
```

2. **Create translation file** (`src/messages/de.json`):

```json
{
  "home": {
    "title": "Kaufkraft kaufen"
  }
}
```

3. **Update middleware** (`src/middleware.ts`):

```typescript
export const config = {
  matcher: ['/', '/(en|fr|de)/:path*'], // Add 'de'
};
```

## 🎯 Adding New Translations

1. Add the key to **all** translation files (`en.json`, `fr.json`, etc.)
2. Use the translation in your component:

```tsx
const t = useTranslations('newSection');
return <p>{t('newKey')}</p>;
```

## 🔧 Type Safety

TypeScript will autocomplete and validate translation keys based on `en.json`:

```tsx
// ✅ Valid - key exists
t('home.title');

// ❌ TypeScript error - key doesn't exist
t('home.nonExistent');
```

## 🌐 URL Structure Examples

- Home (English): `http://localhost:3000/` (no prefix for default locale)
- Home (French): `http://localhost:3000/fr`
- About (English): `http://localhost:3000/about`
- About (French): `http://localhost:3000/fr/about`

## 📦 Packages Used

- **next-intl** (^4.5.8) - Main i18n library
- Built-in Next.js App Router support

## 🎨 Best Practices

1. **Always use the custom navigation components** from `@/i18n/routing`
2. **Keep translation keys organized** by feature/section
3. **Add translations to all language files** simultaneously
4. **Use TypeScript** for type-safe translations
5. **Test all languages** before deploying

## 🚦 Testing

Start the dev server and test language switching:

```bash
pnpm dev
```

Visit:

- `http://localhost:3000` (English - default, no prefix)
- `http://localhost:3000/fr` (French)
- Use the language switcher to toggle between languages

## 📚 Resources

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Next.js i18n Routing](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
