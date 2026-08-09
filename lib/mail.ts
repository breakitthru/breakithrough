import "server-only";

/*
  Mail sending. No provider is wired yet, so sendMail currently records the mail
  to the server log and returns delivered:false. When a provider (e.g. Resend) is
  configured, swap the body of `deliver` — every caller already goes through here.
  The order notification recipient is fixed to breakitthru@gmail.com for now.
*/

export const ORDER_NOTIFICATION_EMAIL = "breakitthru@gmail.com";

export type MailInput = { to: string; subject: string; text: string };

async function deliver(_mail: MailInput): Promise<boolean> {
  // TODO: integrate a mail provider (Resend/SES). Until then, no real delivery.
  return false;
}

export async function sendMail(mail: MailInput): Promise<{ ok: true; delivered: boolean }> {
  let delivered = false;
  try {
    delivered = await deliver(mail);
  } catch {
    delivered = false;
  }
  if (!delivered) {
    // Visible in server logs so orders are traceable until the provider is live.
    console.log(`[mail:pending] to=${mail.to} subject=${mail.subject}\n${mail.text}`);
  }
  return { ok: true, delivered };
}
