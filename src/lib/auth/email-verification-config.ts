const EMAIL_VERIFICATION_FLAG = "EMAIL_VERIFICATION_ENABLED";

const REGISTRATION_TOAST_VERIFY = "Check your email to verify your account";
const REGISTRATION_TOAST_READY = "You can now log in";

export function isEmailVerificationEnabled(): boolean {
  return process.env[EMAIL_VERIFICATION_FLAG]?.trim() !== "false";
}

export function registrationSuccessMessage(): string {
  return isEmailVerificationEnabled()
    ? REGISTRATION_TOAST_VERIFY
    : REGISTRATION_TOAST_READY;
}
