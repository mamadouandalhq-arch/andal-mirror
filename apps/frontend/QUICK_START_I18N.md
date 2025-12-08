# 🚀 Quick Start: Using i18n

## ✅ What's Already Set Up

✓ English (en) and French (fr) support  
✓ Automatic locale detection  
✓ Language switcher component  
✓ Type-safe translations  
✓ Localized routing  

## 🎯 Common Tasks

### 1. Use Translations in a Page/Component

```tsx
import { useTranslations } from 'next-intl';

export default function MyComponent() {
  const t = useTranslations('home'); // 'home' is the section in JSON
  
  return <h1>{t('title')}</h1>;
}
```

### 2. Add Language Switcher

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

### 3. Create Links (Locale-Aware)

```tsx
import { Link } from '@/i18n/routing';

<Link href="/about">About</Link>
// Automatically becomes /en/about or /uk/about
```

### 4. Add New Translation

**Step 1:** Add to `src/messages/en.json`:
```json
{
  "mySection": {
    "greeting": "Hello, {name}!"
  }
}
```

**Step 2:** Add to `src/messages/fr.json`:
```json
{
  "mySection": {
    "greeting": "Bonjour, {name}!"
  }
}
```

**Step 3:** Use it:
```tsx
const t = useTranslations('mySection');
<p>{t('greeting', { name: 'John' })}</p>
```

## 📁 Key Files

- `src/messages/en.json` - English translations
- `src/messages/fr.json` - French translations
- `src/i18n/config.ts` - Language configuration
- `src/components/LanguageSwitcher.tsx` - Language switcher

## 🔗 URLs

- `/` → English version (default, no prefix)
- `/about` → English about page
- `/fr` → French version
- `/fr/about` → French about page

## 💡 Tips

1. Always import `Link` from `@/i18n/routing`, not `next/link`
2. TypeScript will autocomplete translation keys
3. Test both languages before committing
4. Keep translation keys consistent across all language files

## 📖 Full Documentation

See [I18N_SETUP.md](./I18N_SETUP.md) for complete documentation.

