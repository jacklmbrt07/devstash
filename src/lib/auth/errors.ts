import { CredentialsSignin } from "next-auth";

export class EmailNotVerifiedError extends CredentialsSignin {
  code = "email_not_verified";
}

export const EMAIL_NOT_VERIFIED_MESSAGE =
  "Check your email and verify your account before signing in";
