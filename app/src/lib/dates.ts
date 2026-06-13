import type { Locale } from "../i18n/locales";

// kaa is not a CLDR locale on most devices — month names are supplied here.
const KAA_MONTHS = [
  "yanvar",
  "fevral",
  "mart",
  "aprel",
  "may",
  "iyun",
  "iyul",
  "avgust",
  "sentyabr",
  "oktyabr",
  "noyabr",
  "dekabr",
];

const INTL_LOCALE: Record<Locale, string> = {
  kaa: "uz", // fallback for anything Intl-driven
  uz: "uz",
  ru: "ru",
  en: "en-GB",
};

/** "10-iyun, 06:40" style short date+time for banners and timestamps. */
export function formatShortDateTime(iso: string, locale: Locale): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const hm = `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes(),
  ).padStart(2, "0")}`;
  if (locale === "kaa" || locale === "uz") {
    return `${d.getDate()}-${KAA_MONTHS[d.getMonth()]}, ${hm}`;
  }
  return `${d.toLocaleDateString(INTL_LOCALE[locale], {
    day: "numeric",
    month: "short",
  })}, ${hm}`;
}

// Sunday-first, matching Date.getDay(). kaa/uz are not reliable CLDR
// locales on target devices, so weekday names are supplied here.
const KAA_WEEKDAYS = [
  "Ekshembi",
  "Dúyshembi",
  "Siyshembi",
  "Sárshembi",
  "Piyshembi",
  "Juma",
  "Shembi",
];
const UZ_WEEKDAYS = [
  "Yakshanba",
  "Dushanba",
  "Seshanba",
  "Chorshanba",
  "Payshanba",
  "Juma",
  "Shanba",
];

/** "Sárshembi, 10-iyun" style weekday + date for the Home today header. */
export function formatWeekdayDate(iso: string, locale: Locale): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  if (locale === "kaa" || locale === "uz") {
    const wd = locale === "kaa" ? KAA_WEEKDAYS : UZ_WEEKDAYS;
    return `${wd[d.getDay()]}, ${d.getDate()}-${KAA_MONTHS[d.getMonth()]}`;
  }
  const s = d.toLocaleDateString(INTL_LOCALE[locale], {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** "12-iyun" style short date for SMS previews and recommendations. */
export function formatShortDate(iso: string, locale: Locale): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  if (locale === "kaa" || locale === "uz") {
    return `${d.getDate()}-${KAA_MONTHS[d.getMonth()]}`;
  }
  return d.toLocaleDateString(INTL_LOCALE[locale], {
    day: "numeric",
    month: "short",
  });
}
