import { PLATFORM_NAME } from "@/lib/constants";

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

function getBrevoApiKey(): string {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("BREVO_API_KEY is not configured");
  }
  return apiKey;
}

function getSender(): { name: string; email: string } {
  const fromEmail = process.env.BREVO_FROM_EMAIL?.trim();
  if (!fromEmail) {
    throw new Error("BREVO_FROM_EMAIL is not configured");
  }

  const fromName = process.env.BREVO_FROM_NAME?.trim() || PLATFORM_NAME;
  return { name: fromName, email: fromEmail };
}

type BrevoErrorBody = {
  message?: string;
  code?: string;
};

export async function sendVerificationOtpEmail({
  to,
  code,
  expiresMinutes,
}: {
  to: string;
  code: string;
  expiresMinutes: number;
}) {
  const sender = getSender();

  const response = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": getBrevoApiKey(),
    },
    body: JSON.stringify({
      sender,
      to: [{ email: to }],
      subject: `${PLATFORM_NAME} — verify your email`,
      htmlContent: `
        <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h1 style="color: #0056D2; font-size: 22px; margin-bottom: 8px;">${PLATFORM_NAME}</h1>
          <p style="color: #334155; line-height: 1.5;">Use this code to verify your email and finish creating your account:</p>
          <p style="font-size: 32px; font-weight: 700; letter-spacing: 0.35em; color: #0f172a; margin: 24px 0; text-align: center;">${code}</p>
          <p style="color: #64748b; font-size: 14px;">This code expires in ${expiresMinutes} minutes. If you did not request this, you can ignore this email.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    let detail = `Brevo API error (${response.status})`;
    try {
      const body = (await response.json()) as BrevoErrorBody;
      if (body.message) detail = body.message;
    } catch {
      /* ignore parse errors */
    }
    throw new Error(detail);
  }
}
