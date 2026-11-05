import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function fromAddress(): string {
  return (
    process.env.EMAIL_FROM?.trim() || "DevStash <onboarding@resend.dev>"
  );
}

export async function sendVerificationEmail(options: {
  to: string;
  name: string;
  verifyUrl: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!process.env.RESEND_API_KEY) {
    return { ok: false, error: "RESEND_API_KEY is not set" };
  }

  const { data, error } = await resend.emails.send({
    from: fromAddress(),
    to: options.to,
    subject: "Verify your DevStash email",
    html: [
      `<p>Hi ${escapeHtml(options.name)},</p>`,
      "<p>Thanks for signing up for DevStash. Confirm your email with this link:</p>",
      `<p><a href="${options.verifyUrl}">Verify email</a></p>`,
      "<p>This link expires in 24 hours. If you did not create an account, you can ignore this email.</p>",
    ].join(""),
    text: [
      `Hi ${options.name},`,
      "",
      "Thanks for signing up for DevStash. Confirm your email with this link:",
      options.verifyUrl,
      "",
      "This link expires in 24 hours. If you did not create an account, you can ignore this email.",
    ].join("\n"),
  });

  if (error) {
    console.error("Resend verification email failed:", error);
    return { ok: false, error: error.message };
  }

  if (!data?.id) {
    return { ok: false, error: "Resend did not return an email id" };
  }

  return { ok: true };
}

export async function sendPasswordResetEmail(options: {
  to: string;
  name: string;
  resetUrl: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!process.env.RESEND_API_KEY) {
    return { ok: false, error: "RESEND_API_KEY is not set" };
  }

  const { data, error } = await resend.emails.send({
    from: fromAddress(),
    to: options.to,
    subject: "Reset your DevStash password",
    html: [
      `<p>Hi ${escapeHtml(options.name)},</p>`,
      "<p>We received a request to reset your DevStash password. Use this link to choose a new one:</p>",
      `<p><a href="${options.resetUrl}">Reset password</a></p>`,
      "<p>This link expires in 1 hour. If you did not request a reset, you can ignore this email.</p>",
    ].join(""),
    text: [
      `Hi ${options.name},`,
      "",
      "We received a request to reset your DevStash password. Use this link to choose a new one:",
      options.resetUrl,
      "",
      "This link expires in 1 hour. If you did not request a reset, you can ignore this email.",
    ].join("\n"),
  });

  if (error) {
    console.error("Resend password reset email failed:", error);
    return { ok: false, error: error.message };
  }

  if (!data?.id) {
    return { ok: false, error: "Resend did not return an email id" };
  }

  return { ok: true };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
