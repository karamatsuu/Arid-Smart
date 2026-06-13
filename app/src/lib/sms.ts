// SMS segment math. Karakalpak Latin special characters (Á ǵ ı ń …) are not
// in the GSM-7 alphabet, which forces UCS-2 encoding at 70 chars/segment
// (per spec §0.5; GSM-7 messages get 160). Warn at >2 segments.

const GSM7_BASIC =
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?" +
  "¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";
const GSM7_EXT = "^{}\\[~]|€";

export const UCS2_SEGMENT = 70;
export const GSM7_SEGMENT = 160;

export type SmsEncoding = "GSM-7" | "UCS-2";

export interface SmsInfo {
  /** user-visible character count (code points) */
  chars: number;
  encoding: SmsEncoding;
  segments: number;
  perSegment: number;
  /** true when the message exceeds 2 segments — show a warning */
  overLimit: boolean;
}

export function smsInfo(text: string): SmsInfo {
  let ucs2 = false;
  let gsmUnits = 0;
  for (const ch of text) {
    if (GSM7_BASIC.includes(ch)) gsmUnits += 1;
    else if (GSM7_EXT.includes(ch)) gsmUnits += 2; // escape-prefixed
    else ucs2 = true;
  }
  const chars = [...text].length;
  const perSegment = ucs2 ? UCS2_SEGMENT : GSM7_SEGMENT;
  const units = ucs2 ? chars : gsmUnits;
  const segments = Math.max(1, Math.ceil(units / perSegment));
  return {
    chars,
    encoding: ucs2 ? "UCS-2" : "GSM-7",
    segments,
    perSegment,
    overLimit: segments > 2,
  };
}
