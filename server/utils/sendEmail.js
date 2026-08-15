import dotenv from "dotenv";

dotenv.config();

// Sends over HTTPS via Resend's API instead of raw SMTP. Most hosts (Render
// included) block outbound SMTP ports (25/465/587) to prevent spam abuse —
// HTTPS on port 443 isn't subject to that restriction, since it's
// indistinguishable from any other API call the app makes (Cloudinary,
// MongoDB Atlas, etc).
const RESEND_ENDPOINT = "https://api.resend.com/emails";

// EMAIL_FROM is "Display Name <email@example.com>" (or a bare email) —
// Resend accepts that exact format as a single `from` string. Strips one
// layer of surrounding quotes: .env files conventionally write
// EMAIL_FROM="Name <email>" with quotes, but a host's dashboard env-var UI
// wants the raw value — pasting the quoted form in verbatim is an easy
// mistake, and left unhandled it makes the whole string (quotes and all)
// get treated as a single malformed address, which Resend rejects.
const cleanAddress = (raw) => (raw || "").trim().replace(/^["']|["']$/g, "").trim();

const sendEmail = async ({ to, subject, html }) => {
  // RESEND_API_KEY is the documented name; RESEND_API is accepted too in
  // case that's what ended up in .env.
  const apiKey = process.env.RESEND_API_KEY || process.env.RESEND_API;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY (or RESEND_API) is not configured");
  }

  // Defense-in-depth timeout — a caller that (by mistake) awaits this
  // shouldn't be able to hang for longer than a few seconds even if Resend
  // itself is unreachable.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  const from = cleanAddress(process.env.EMAIL_FROM);

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [cleanAddress(to)],
        subject,
        html,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      // Include the parsed "from" in the error — the most common failure
      // (an unverified or malformed EMAIL_FROM domain) is otherwise
      // invisible from the Resend response alone.
      throw new Error(`Resend ${res.status} (from: ${JSON.stringify(from)}): ${body || res.statusText}`);
    }
  } finally {
    clearTimeout(timeout);
  }
};

export default sendEmail;
