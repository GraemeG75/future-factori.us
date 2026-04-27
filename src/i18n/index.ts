import { en } from './locales/en';
import { fr } from './locales/fr';
import { de } from './locales/de';
import { es } from './locales/es';
import { ja } from './locales/ja';
import { zh } from './locales/zh';

type NestedKeyOf<T> = T extends object
  ? { [K in keyof T]: K extends string ? `${K}` | `${K}.${NestedKeyOf<T[K]>}` : never }[keyof T]
  : never;

export type I18nKey = NestedKeyOf<typeof en>;

const localeMap: Record<string, typeof en> = {
  en,
  fr: fr as unknown as typeof en,
  de: de as unknown as typeof en,
  es: es as unknown as typeof en,
  ja: ja as unknown as typeof en,
  zh: zh as unknown as typeof en,
};

function getNestedValue(obj: Record<string, unknown>, keys: string[]): string | undefined {
  let current: unknown = obj;
  for (const key of keys) {
    if (current === null || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === 'string' ? current : undefined;
}

export class I18n {
  private static instance: I18n;
  private currentLocale: string = 'en';
  private data: typeof en = en;

  private constructor() {}

  static getInstance(): I18n {
    if (!I18n.instance) {
      I18n.instance = new I18n();
    }
    return I18n.instance;
  }

  setLocale(locale: string): void {
    if (localeMap[locale]) {
      this.currentLocale = locale;
      this.data = localeMap[locale];
    } else {
      console.warn(`Locale '${locale}' not found, falling back to 'en'.`);
      this.currentLocale = 'en';
      this.data = en;
    }
  }

  getLocale(): string {
    return this.currentLocale;
  }

  t(key: string, ...args: string[]): string {
    const parts = key.split('.');
    const raw = getNestedValue(this.data as unknown as Record<string, unknown>, parts);

    if (raw === undefined) {
      console.warn(`Missing i18n key: '${key}'`);
      return key;
    }

    return raw.replace(/\{(\d+)\}/g, (_, index) => args[parseInt(index, 10)] ?? `{${index}}`);
  }
}

export const i18n = I18n.getInstance();
