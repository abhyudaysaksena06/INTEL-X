import emailjs from "@emailjs/browser";

/*
 * Contact form delivery via EmailJS.
 *
 * The public key is browser-safe by design — EmailJS scopes it to your service
 * and template. Set the allowed origins in the EmailJS dashboard (Account →
 * Security) so the key can't be reused from other sites.
 *
 * Keys come from .env.local (gitignored). See .env.example.
 */

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export const isEmailConfigured = Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);

export type ContactMessage = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

/**
 * Sends one contact message.
 * Returns { error } — null on success, a human-readable message otherwise.
 */
export async function sendContactMessage(
  data: ContactMessage,
): Promise<{ error: string | null }> {
  if (!isEmailConfigured) {
    return { error: "Messaging is not connected yet. Reach us by email instead." };
  }

  try {
    await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        // common EmailJS template variable names — harmless if a template
        // only uses some of them
        from_name: data.name,
        from_email: data.email,
        reply_to: data.email,
        subject: data.subject?.trim() || "New message from the INTEL X site",
        message: data.message,
        name: data.name,
        email: data.email,
        title: data.subject?.trim() || "New message from the INTEL X site",
      },
      { publicKey: PUBLIC_KEY },
    );
    return { error: null };
  } catch (err: unknown) {
    console.error("[contact] ", err);
    const status = (err as { status?: number })?.status;
    if (status === 429) {
      return { error: "Too many messages just now. Wait a minute and retry." };
    }
    return { error: "Could not send the message. Check your connection and retry." };
  }
}
