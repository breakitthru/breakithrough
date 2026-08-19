import "server-only";
import nodemailer from "nodemailer";
import { env } from "@/lib/env";

/*
  Transactional mail over Gmail SMTP. Set SMTP_USER (the Gmail address, e.g.
  breakitthru@gmail.com) and SMTP_PASS (a Google App Password — needs 2-Step
  Verification on the account). When either is missing, mail is logged to the
  server console instead of sent, so the app never hard-fails on email.

  Everything the app sends goes through sendMail(), and always from the single
  Break It Thru mailbox.
*/

export const ORDER_NOTIFICATION_EMAIL = "breakitthru@gmail.com";

export const isMailConfigured = Boolean(env.SMTP_USER && env.SMTP_PASS);

export type MailInput = { to: string; subject: string; text: string; html?: string };

let transporter: nodemailer.Transporter | null = null;
function getTransporter(): nodemailer.Transporter | null {
  if (!isMailConfigured) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
  }
  return transporter;
}

async function deliver(mail: MailInput): Promise<boolean> {
  const t = getTransporter();
  if (!t) return false;
  await t.sendMail({
    from: `Break It Thru <${env.SMTP_USER}>`,
    to: mail.to,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
  });
  return true;
}

export async function sendMail(mail: MailInput): Promise<{ ok: true; delivered: boolean }> {
  let delivered = false;
  try {
    delivered = await deliver(mail);
  } catch (e) {
    delivered = false;
    console.error(`[mail:error] to=${mail.to} subject=${mail.subject}`, e instanceof Error ? e.message : e);
  }
  if (!delivered) {
    // Visible in server logs so orders stay traceable until SMTP is configured.
    console.log(`[mail:pending] to=${mail.to} subject=${mail.subject}\n${mail.text}`);
  }
  return { ok: true, delivered };
}
