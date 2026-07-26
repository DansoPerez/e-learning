import nodemailer from "nodemailer";
import { Resend } from "resend";
import { PLATFORM_NAME } from "@/lib/constants";
import {
  getEmailTransport,
  getFromAddress,
  getSmtpConnectionOptions,
} from "@/lib/email-config";

export {
  isEmailConfigured,
  isEmailVerificationEnabled,
  isResendConfigured,
  isSmtpConfigured,
  getEmailTransport,
} from "@/lib/email-config";

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  return new Resend(apiKey);
}

function formatResendError(error: { message?: string; name?: string } | null): string {
  if (!error?.message) return "Resend could not send the email";
  return error.message;
}

async function sendMail({
  to,
  subject,
  html,
}: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  const recipients = Array.isArray(to) ? to : [to];
  if (recipients.length === 0) return;

  const from = getFromAddress();
  const transport = getEmailTransport();

  if (transport === "smtp") {
    const transporter = nodemailer.createTransport(getSmtpConnectionOptions());
    await transporter.sendMail({
      from,
      to: recipients.join(", "),
      subject,
      html,
    });
    return;
  }

  const resend = getResendClient();
  const { error } = await resend.emails.send({
    from,
    to: recipients,
    subject,
    html,
  });

  if (error) {
    throw new Error(formatResendError(error));
  }
}

export async function sendVerificationOtpEmail({
  to,
  code,
  expiresMinutes,
}: {
  to: string;
  code: string;
  expiresMinutes: number;
}) {
  await sendMail({
    to,
    subject: `${PLATFORM_NAME} — verify your email`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #0056D2; font-size: 22px; margin-bottom: 8px;">${PLATFORM_NAME}</h1>
        <p style="color: #334155; line-height: 1.5;">Use this code to verify your email and finish creating your account:</p>
        <p style="font-size: 32px; font-weight: 700; letter-spacing: 0.35em; color: #0f172a; margin: 24px 0; text-align: center;">${code}</p>
        <p style="color: #64748b; font-size: 14px;">This code expires in ${expiresMinutes} minutes. If you did not request this, you can ignore this email.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail({
  to,
  resetUrl,
  expiresMinutes,
}: {
  to: string;
  resetUrl: string;
  expiresMinutes: number;
}) {
  await sendMail({
    to,
    subject: `${PLATFORM_NAME} — reset your password`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #0056D2; font-size: 22px;">${PLATFORM_NAME}</h1>
        <p style="color: #334155; line-height: 1.5;">Click the link below to reset your password. This link expires in ${expiresMinutes} minutes.</p>
        <p style="margin: 24px 0;"><a href="${resetUrl}" style="background: #0056D2; color: white; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">Reset password</a></p>
        <p style="color: #64748b; font-size: 14px;">If you did not request this, ignore this email.</p>
      </div>
    `,
  });
}

export async function sendWithdrawalRequestAdminEmail({
  to,
  instructorName,
  instructorUserCode,
  instructorEmail,
  amountLabel,
  note,
  reviewUrl,
}: {
  to: string[];
  instructorName: string;
  instructorUserCode: string | null;
  instructorEmail: string;
  amountLabel: string;
  note?: string | null;
  reviewUrl: string;
}) {
  if (to.length === 0) return;

  const instructorLabel =
    instructorUserCode ? `${instructorName} (${instructorUserCode})` : instructorName;
  const noteBlock =
    note?.trim() ?
      `<p style="color: #334155; line-height: 1.5;"><strong>Note from instructor:</strong> ${escapeHtml(note.trim())}</p>`
    : "";

  await sendMail({
    to,
    subject: `${PLATFORM_NAME} — withdrawal request from ${instructorLabel}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #0056D2; font-size: 22px; margin-bottom: 8px;">${PLATFORM_NAME}</h1>
        <p style="color: #334155; line-height: 1.5;">An instructor submitted a withdrawal request that needs your review.</p>
        <table style="width: 100%; margin: 20px 0; border-collapse: collapse; font-size: 15px;">
          <tr><td style="padding: 8px 0; color: #64748b;">Instructor</td><td style="padding: 8px 0; font-weight: 600;">${escapeHtml(instructorLabel)}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Email</td><td style="padding: 8px 0;">${escapeHtml(instructorEmail)}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Amount</td><td style="padding: 8px 0; font-weight: 600;">${escapeHtml(amountLabel)}</td></tr>
        </table>
        ${noteBlock}
        <p style="margin: 24px 0;"><a href="${reviewUrl}" style="background: #0056D2; color: white; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">Review withdrawal</a></p>
        <p style="color: #64748b; font-size: 14px;">Approve, reject, or mark as paid after processing the payout externally.</p>
      </div>
    `,
  });
}

export async function sendNewStudentAdminEmail({
  to,
  studentName,
  studentUserCode,
  studentEmail,
  reviewUrl,
}: {
  to: string[];
  studentName: string;
  studentUserCode: string | null;
  studentEmail: string;
  reviewUrl: string;
}) {
  if (to.length === 0) return;

  const label = studentUserCode ? `${studentName} (${studentUserCode})` : studentName;

  await sendMail({
    to,
    subject: `${PLATFORM_NAME} — new student registered: ${studentName}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #0056D2; font-size: 22px; margin-bottom: 8px;">${PLATFORM_NAME}</h1>
        <p style="color: #334155; line-height: 1.5;">A new student just finished registration.</p>
        <table style="width: 100%; margin: 20px 0; border-collapse: collapse; font-size: 15px;">
          <tr><td style="padding: 8px 0; color: #64748b;">Name</td><td style="padding: 8px 0; font-weight: 600;">${escapeHtml(label)}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Email</td><td style="padding: 8px 0;">${escapeHtml(studentEmail)}</td></tr>
        </table>
        <p style="margin: 24px 0;"><a href="${reviewUrl}" style="background: #0056D2; color: white; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">Open users</a></p>
      </div>
    `,
  });
}

export async function sendInstructorPendingAdminEmail({
  to,
  instructorName,
  instructorUserCode,
  instructorEmail,
  expertise,
  reviewUrl,
}: {
  to: string[];
  instructorName: string;
  instructorUserCode: string | null;
  instructorEmail: string;
  expertise?: string | null;
  reviewUrl: string;
}) {
  if (to.length === 0) return;

  const label =
    instructorUserCode ? `${instructorName} (${instructorUserCode})` : instructorName;
  const expertiseRow =
    expertise?.trim() ?
      `<tr><td style="padding: 8px 0; color: #64748b;">Expertise</td><td style="padding: 8px 0;">${escapeHtml(expertise.trim())}</td></tr>`
    : "";

  await sendMail({
    to,
    subject: `${PLATFORM_NAME} — instructor needs approval: ${instructorName}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #0056D2; font-size: 22px; margin-bottom: 8px;">${PLATFORM_NAME}</h1>
        <p style="color: #334155; line-height: 1.5;">An instructor applied to teach and is waiting for your approval.</p>
        <table style="width: 100%; margin: 20px 0; border-collapse: collapse; font-size: 15px;">
          <tr><td style="padding: 8px 0; color: #64748b;">Name</td><td style="padding: 8px 0; font-weight: 600;">${escapeHtml(label)}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Email</td><td style="padding: 8px 0;">${escapeHtml(instructorEmail)}</td></tr>
          ${expertiseRow}
        </table>
        <p style="margin: 24px 0;"><a href="${reviewUrl}" style="background: #0056D2; color: white; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">Review application</a></p>
      </div>
    `,
  });
}

export async function sendPurchaseSuccessEmail({
  to,
  studentName,
  courseTitle,
  amountLabel,
  learnUrl,
  welcomeDiscountPercent,
  suggestions,
}: {
  to: string;
  studentName: string;
  courseTitle: string;
  amountLabel: string;
  learnUrl: string;
  welcomeDiscountPercent: number;
  suggestions: Array<{
    title: string;
    url: string;
    priceLabel: string;
    discountedLabel: string;
  }>;
}) {
  const firstName = studentName.trim().split(/\s+/)[0] || "there";
  const suggestionBlock =
    suggestions.length > 0 && welcomeDiscountPercent > 0 ?
      `
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0;" />
        <h2 style="color: #0f172a; font-size: 18px; margin: 0 0 8px;">Welcome offer — ${welcomeDiscountPercent}% off your next courses</h2>
        <p style="color: #334155; line-height: 1.5; margin: 0 0 16px;">
          Thanks for learning with ${PLATFORM_NAME}. For a limited time, these recommended courses are available at a welcome discount when you check out:
        </p>
        <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
          ${suggestions
            .map(
              (course) => `
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
                <a href="${escapeHtml(course.url)}" style="color: #0056D2; font-weight: 600; text-decoration: none;">${escapeHtml(course.title)}</a>
                <div style="margin-top: 4px; color: #64748b; font-size: 14px;">
                  <span style="text-decoration: line-through; margin-right: 8px;">${escapeHtml(course.priceLabel)}</span>
                  <span style="color: #0f172a; font-weight: 700;">${escapeHtml(course.discountedLabel)}</span>
                </div>
              </td>
            </tr>`,
            )
            .join("")}
        </table>
        <p style="color: #64748b; font-size: 13px; margin-top: 16px;">
          The welcome discount is applied automatically at checkout for a limited time on your next courses.
        </p>
      `
    : suggestions.length > 0 ?
      `
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0;" />
        <h2 style="color: #0f172a; font-size: 18px; margin: 0 0 8px;">Keep learning</h2>
        <p style="color: #334155; line-height: 1.5; margin: 0 0 16px;">You might also like:</p>
        <ul style="padding-left: 18px; color: #334155; line-height: 1.6;">
          ${suggestions
            .map(
              (course) =>
                `<li><a href="${escapeHtml(course.url)}" style="color: #0056D2;">${escapeHtml(course.title)}</a> — ${escapeHtml(course.priceLabel)}</li>`,
            )
            .join("")}
        </ul>
      `
    : "";

  await sendMail({
    to,
    subject: `${PLATFORM_NAME} — payment confirmed for ${courseTitle}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #0056D2; font-size: 22px; margin-bottom: 8px;">${PLATFORM_NAME}</h1>
        <p style="color: #334155; line-height: 1.5;">Hi ${escapeHtml(firstName)},</p>
        <p style="color: #334155; line-height: 1.5;">
          Your payment was successful. You now have full access to
          <strong>${escapeHtml(courseTitle)}</strong>.
        </p>
        <table style="width: 100%; margin: 20px 0; border-collapse: collapse; font-size: 15px;">
          <tr><td style="padding: 8px 0; color: #64748b;">Course</td><td style="padding: 8px 0; font-weight: 600;">${escapeHtml(courseTitle)}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Amount paid</td><td style="padding: 8px 0; font-weight: 600;">${escapeHtml(amountLabel)}</td></tr>
        </table>
        <p style="margin: 24px 0;">
          <a href="${escapeHtml(learnUrl)}" style="background: #0056D2; color: white; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">Start learning</a>
        </p>
        ${suggestionBlock}
        <p style="color: #64748b; font-size: 13px; margin-top: 28px;">Welcome aboard — we are glad you are here.</p>
      </div>
    `,
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
