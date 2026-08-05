import { Secret, TOTP } from "otpauth";
import QRCode from "qrcode";

/*
  Time-based one-time password helpers for staff 2FA. Secrets are stored as
  base32 on User.totpSecret. Authenticator apps (Google Authenticator, Authy,
  1Password…) read the otpauth:// URL via a QR code.
*/

const ISSUER = "Break It Through";

function totp(secretBase32: string, label: string) {
  return new TOTP({
    issuer: ISSUER,
    label,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: Secret.fromBase32(secretBase32),
  });
}

/** Fresh base32 secret for a new enrollment. */
export function generateTotpSecret(): string {
  return new Secret({ size: 20 }).base32;
}

/** otpauth:// URL for the authenticator app. */
export function totpAuthUrl(secretBase32: string, label: string): string {
  return totp(secretBase32, label).toString();
}

/** Data-URL PNG QR code for the otpauth URL (rendered in an <img>). */
export async function totpQrDataUrl(secretBase32: string, label: string): Promise<string> {
  return QRCode.toDataURL(totpAuthUrl(secretBase32, label), { margin: 1, width: 220 });
}

/** Verify a 6-digit code, allowing ±1 window for clock drift. */
export function verifyTotp(secretBase32: string, token: string, label = ISSUER): boolean {
  const clean = token.replace(/\s+/g, "");
  if (!/^\d{6}$/.test(clean)) return false;
  const delta = totp(secretBase32, label).validate({ token: clean, window: 1 });
  return delta !== null;
}
