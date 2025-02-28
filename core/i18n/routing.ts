import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

import { buildConfig } from '~/build-config/reader';

const localeNodes = buildConfig.get('locales');

export const locales = localeNodes.map((locale) => locale.code);
export const defaultLocale = localeNodes.find((locale) => locale.isDefault)?.code ?? 'en';

interface LocaleEntry {
  id: string;
  language: string;
  region: string;
  flag: string;
}

/**
 * Custom map of locale to language and region.
 * Temporary solution until we have a better way to include regions for all locales.
 */
export const localeLanguageRegionMap: LocaleEntry[] = [
  { id: 'en', language: 'English', region: 'United States', flag: '🇺🇸' },
  { id: 'da', language: 'Dansk', region: 'Danmark', flag: '🇩🇰' },
  { id: 'es-419', language: 'Español', region: 'America Latina', flag: '' },
  { id: 'es-AR', language: 'Español', region: 'Argentina', flag: '🇦🇷' },
  { id: 'es-CL', language: 'Español', region: 'Chile', flag: '🇨🇱' },
  { id: 'es-CO', language: 'Español', region: 'Colombia', flag: '🇨🇴' },
  { id: 'es-LA', language: 'Español', region: 'America Latina', flag: '' },
  { id: 'es-MX', language: 'Español', region: 'México', flag: '🇲🇽' },
  { id: 'es-PE', language: 'Español', region: 'Perú', flag: '🇵🇪' },
  { id: 'es', language: 'Español', region: 'España', flag: '🇪🇸' },
  { id: 'it', language: 'Italiano', region: 'Italia', flag: '🇮🇹' },
  { id: 'nl', language: 'Nederlands', region: 'Nederland', flag: '🇳🇱' },
  { id: 'pl', language: 'Polski', region: 'Polska', flag: '🇵🇱' },
  { id: 'pt', language: 'Português', region: 'Portugal', flag: '🇵🇹' },
  { id: 'de', language: 'Deutsch', region: 'Deutschland', flag: '🇩🇪' },
  { id: 'fr', language: 'Français', region: 'France', flag: '🇫🇷' },
  { id: 'ja', language: '日本語', region: '日本', flag: '🇯🇵' },
  { id: 'no', language: 'Norsk', region: 'Norge', flag: '🇳🇴' },
  { id: 'pt-BR', language: 'Português', region: 'Brasil', flag: '🇧🇷' },
  { id: 'sv', language: 'Svenska', region: 'Sverige', flag: '🇸🇪' },
].filter(({ id }) => locales.includes(id));

enum LocalePrefixes {
  ALWAYS = 'always',
  // Don't use NEVER as there is a issue that causes cache problems and returns the wrong messages.
  // More info: https://github.com/amannn/next-intl/issues/786
  // NEVER = 'never',
  ASNEEDED = 'as-needed', // removes prefix on default locale
}

export const localePrefix = LocalePrefixes.ASNEEDED;

export const routing = defineRouting({
  localeCookie: {
    partitioned: true,
    secure: true,
    sameSite: 'none',
  },
  locales: ['en', 'es', 'fr'],
  defaultLocale: 'en',
  domains: [
    {
      domain: 'store-l6kv6khbrl-1713351.catalyst-sandbox-vercel.store',
      defaultLocale: 'en',
      // Optionally restrict the locales available on this domain
      locales: ['en']
    },
    {
      domain: 'store-ptxremxmaj-1713353.catalyst-sandbox-vercel.store',
      defaultLocale: 'es',
      // If there are no `locales` specified on a domain,
      // all available locales will be supported here
      locales: ['es']
    },
    {
      domain: 'store-ptxremxmaj-1713353.catalyst-sandbox-vercel.store',
      defaultLocale: 'fr',
      // If there are no `locales` specified on a domain,
      // all available locales will be supported here
      locales: ['fr']
    },
  ]
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
// Redirect will append locale prefix even when in default locale
// More info: https://github.com/amannn/next-intl/issues/1335
export const { Link, redirect, usePathname, useRouter, permanentRedirect } =
  createNavigation(routing);
