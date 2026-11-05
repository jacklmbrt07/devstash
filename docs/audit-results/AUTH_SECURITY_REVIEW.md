# Authentication Security Audit

**Last Audit Date**: 2026-11-04
**Auditor**: Auth Security Agent

## Executive Summary

Credentials login, GitHub sign-in, email verification, password reset, and the profile page are wired with bcrypt, 256-bit tokens, expiry, and single-use deletion. The gaps that are actually present are missing rate limits, reset and verification tokens stored in plaintext, JWT sessions that stay valid after a password change, no password length limits, and auth email links built from the incoming host.

## Findings

### Critical Issues

None.

### High Severity

#### No rate limiting on login, registration, or password reset

**Severity**: High
**File**: `src/actions/auth.ts`, `src/app/api/auth/register/route.ts`, `src/actions/password-reset.ts`, `src/auth.ts`
**Line(s)**: `src/actions/auth.ts` 31-51; `src/app/api/auth/register/route.ts` 65-84; `src/actions/password-reset.ts` 30-50; `src/auth.ts` 28-41

**Problem**: Credential sign-in, registration, and password-reset requests have no rate limit, lockout, or captcha. A search of `src` found no limiter on these routes. Each attempt reaches bcrypt or sends mail.

**Attack scenario**: An attacker can guess passwords against `signInWithCredentials` as fast as the server will hash them. They can also create accounts in bulk through `POST /api/auth/register`, or trigger a reset email on every request to `requestPasswordReset` for any address that has a password.

**Fix**: Add a shared limiter (for example Upstash Ratelimit, or a small database counter) keyed by IP and by email, and apply it before `signIn`, `hash`, and `requestPasswordResetEmail`. Return the same generic message when the limit is hit so the response does not reveal whether the account exists.

```typescript
const limited = await limitAuthAttempt(clientIp, email);
if (!limited.ok) {
  return { success: false, error: "Too many attempts. Try again later." };
}
```

### Medium Severity

#### Reset and verification tokens are stored in plaintext

**Severity**: Medium
**File**: `src/lib/auth/password-reset.ts`, `src/lib/auth/email-verification.ts`
**Line(s)**: `src/lib/auth/password-reset.ts` 27-35; `src/lib/auth/email-verification.ts` 27-34

**Problem**: Both flows generate a token with `randomBytes(32)` and insert that raw value into `verification_tokens.token`. Lookup compares the raw token from the link. OWASP's password-reset guidance says the server should store a hash of the token. A read of this table (SQL access, a backup, or a logged query) yields live reset and verification links. NextAuth does not hash tokens created by this custom code.

**Attack scenario**: Someone who can read `verification_tokens` copies an unexpired `reset:` row and opens `/reset-password?token=...` to set a new password, or a verification row to confirm an email they do not own.

**Fix**: Store `sha256` of the token and look up by that hash. Email the raw token only. A fast hash is enough because the token already has 256 bits of entropy.

```typescript
import { createHash, randomBytes } from "node:crypto";

const token = randomBytes(32).toString("hex");
const tokenHash = createHash("sha256").update(token).digest("hex");
await db.orm.public.VerificationToken.create({
  identifier,
  token: tokenHash,
  expires: toTimestamp(expires),
});
```

#### Password change and reset leave existing JWT sessions valid

**Severity**: Medium
**File**: `src/auth.ts`, `src/auth.config.ts`, `src/lib/auth/password-reset.ts`, `src/actions/profile.ts`
**Line(s)**: `src/auth.ts` 17; `src/auth.config.ts` 33-44; `src/lib/auth/password-reset.ts` 119-123; `src/actions/profile.ts` 75-78

**Problem**: Sessions use `strategy: "jwt"`. `resetPasswordWithToken` and `changePassword` update `users.password` and do nothing else. The `jwt` callback copies `user.id` and never compares the token with a password-change time. NextAuth does not revoke JWTs when the password changes. The default session lifetime is 30 days, and this app does not set a shorter `maxAge`.

**Attack scenario**: An attacker who already copied the session cookie keeps calling `/profile` and other protected routes after the owner resets or changes the password. The owner has no way to cut off that cookie.

**Fix**: Store `passwordChangedAt` on the user, set it in both password updates, and reject tokens issued before that time in the `jwt` callback. Sign the current browser out after a successful change so the owner gets a new token.

```typescript
jwt({ token, user }) {
  if (user?.id) token.id = user.id;
  if (token.passwordChangedAt && token.iat && token.iat < token.passwordChangedAt) {
    return null;
  }
  return token;
}
```

Compare `token.iat` with the database `passwordChangedAt` inside that callback. Returning `null` is what drops the session.

#### Register, reset, and change-password accept any non-empty password

**Severity**: Medium
**File**: `src/app/api/auth/register/route.ts`, `src/actions/password-reset.ts`, `src/actions/profile.ts`
**Line(s)**: `src/app/api/auth/register/route.ts` 40-62; `src/actions/password-reset.ts` 61-72; `src/actions/profile.ts` 39-55

**Problem**: All three checks reject an empty password and require the confirmation to match. None of them enforce a minimum or maximum length. `bcryptjs` only uses the first 72 bytes, so extra characters are silently ignored, and a very long input is still hashed on an unauthenticated request.

**Attack scenario**: A user can register or reset to a one-character password and the server will store it. An unauthenticated client can also submit a multi-megabyte password to `POST /api/auth/register` or the reset action and force a bcrypt computation.

**Fix**: Use one helper for register, reset, and profile change. Reject passwords shorter than 8 characters and longer than 72 bytes before calling `hash`.

```typescript
const bytes = Buffer.byteLength(password);
if (bytes < 8 || bytes > 72) {
  return { ok: false, error: "Password must be 8 to 72 characters" };
}
```

#### Verification and reset links use the request host

**Severity**: Medium
**File**: `src/actions/password-reset.ts`, `src/app/api/auth/register/route.ts`
**Line(s)**: `src/actions/password-reset.ts` 23-27 and 40-44; `src/app/api/auth/register/route.ts` 95-96

**Problem**: The reset email origin is `x-forwarded-host`, or `host` if that header is missing, and the scheme falls back to `http`. The verification link is `new URL("/verify-email", request.url)`, which also comes from the request host. There is no allowlist and no configured canonical origin.

**Attack scenario**: If the app accepts a request whose `Host` or `X-Forwarded-Host` is attacker-controlled, `requestPasswordReset` emails a link on the attacker's origin with the real token. The victim's click sends the token to that host. The same request-host behavior applies to the verification link built from `request.url`.

**Fix**: Build both links from a configured site URL and ignore the incoming host.

```typescript
const origin = process.env.AUTH_URL;
if (!origin) throw new Error("AUTH_URL is not set");
const resetUrl = new URL("/reset-password", origin);
resetUrl.searchParams.set("token", token);
```

Use the same `AUTH_URL` base for `/verify-email` in the register route.

### Low Severity

#### Unverified accounts get a distinct sign-in error

**Severity**: Low
**File**: `src/auth.ts`, `src/actions/auth.ts`
**Line(s)**: `src/auth.ts` 43-45; `src/actions/auth.ts` 24-28

**Problem**: A wrong password and an unknown email both return "Invalid email or password". An account that exists and is not verified throws `EmailNotVerifiedError`, and the action returns "Check your email and verify your account before signing in". That second message confirms the email is registered.

**Attack scenario**: With email verification enabled, an attacker can submit addresses to the sign-in form and learn which ones have an unverified account.

**Fix**: Keep the specific copy on a post-login page that only the person who just registered can see, or send the same "Invalid email or password" response from `authorize` and from the action. If the product must tell the user to verify, do it only after a successful password check and accept the enumeration, and document that choice.

#### Sign-in and reset requests return faster when the account is missing

**Severity**: Low
**File**: `src/auth.ts`, `src/lib/auth/password-reset.ts`
**Line(s)**: `src/auth.ts` 37-40; `src/lib/auth/password-reset.ts` 44-47

**Problem**: `authorize` returns `null` before `compare` when the user has no password hash. `requestPasswordResetEmail` returns before `createPasswordResetToken` and `sendPasswordResetEmail` when the user has no password. The reset action still responds with `{ status: "sent" }`, so the body does not reveal the account. The time to respond does: a real account waits on bcrypt or on Resend, and a missing account does not.

**Attack scenario**: An attacker measures response time on sign-in or forgot-password and separates registered emails from unknown ones even though the response text matches.

**Fix**: On sign-in, `compare` the supplied password with a precomputed dummy hash when the user is missing, then still return `null`. On reset, hash a dummy token or otherwise spend similar time before returning `{ status: "sent" }`, and do not wait on a different external call only for real accounts.

```typescript
const DUMMY_HASH = "$2a$12$C6UzMDM.H6dfI/f/IKxGhu..."; // a real bcrypt hash, not a user password
const hashToCheck = user?.password ?? DUMMY_HASH;
const valid = await compare(password, hashToCheck);
if (!user?.password || !valid) return null;
```

## Passed Checks

- Passwords are hashed with bcrypt at 12 rounds in `src/app/api/auth/register/route.ts`, `src/lib/auth/password-reset.ts`, and `src/actions/profile.ts`. The hash is what `compare` checks in `src/auth.ts`.
- Registration returns `id`, `name`, and `email` only. The password hash is not in the JSON body.
- `getProfile` in `src/lib/db/profile.ts` reads the password column and returns `canChangePassword` as a boolean. The hash is not sent to the profile page.
- Email verification tokens come from `crypto.randomBytes(32)` (256 bits), expire after 24 hours, and are deleted after success, expiry, or an unknown user in `src/lib/auth/email-verification.ts`.
- Password reset tokens use the same generator, expire after 1 hour, and are deleted after a successful reset, expiry, or an account that has no password in `src/lib/auth/password-reset.ts`. A new reset deletes older reset rows for that identifier first.
- Reset tokens are stored under a `reset:` identifier. Verification rejects those rows, and reset rejects rows that are not reset tokens, so one link cannot be used for the other flow.
- `readPasswordResetToken` does not consume a valid token. The password changes only in `resetPasswordWithToken`, so a prefetch of the reset page does not burn the link.
- The reset form posts the token. The account is loaded from that token, not from a user id in the body (`src/actions/password-reset.ts`).
- Forgot-password always returns `{ status: "sent" }` for a well-formed email, including when the address is unknown or the mail send throws (`src/actions/password-reset.ts`).
- Reset and verification links are not written to logs. Failures log the mail error, not the token (`src/lib/email/resend.ts`, `src/lib/auth/password-reset.ts`).
- The verification email escapes the recipient name before placing it in HTML (`src/lib/email/resend.ts`).
- Sign-in uses one message for a bad password and an unknown email (`src/actions/auth.ts`). The unverified branch is the exception listed above.
- `redirectTarget` allows only a single-slash relative path, and the NextAuth `redirect` callback stays on the app origin (`src/actions/auth.ts`, `src/auth.config.ts`).
- Profile reads and both mutations call `auth()` and update `where: { id: user.id }` from the session. They do not take a user id from the form (`src/app/profile/page.tsx`, `src/actions/profile.ts`).
- Password change requires the current password and refuses a new password that matches it (`src/actions/profile.ts`). GitHub-only accounts, which have no password hash, cannot set one here or through the reset flow.
- Profile actions do not mass-assign `id`, `emailVerified`, `isPro`, or the password hash from the request body.
- Account deletion removes verification and reset tokens for that email, then deletes the user. Related rows use `onDelete: Cascade` (`src/actions/profile.ts`, `src/prisma/contract.prisma`).
- Token deletes use a parameterized SQL template, not string concatenation (`src/lib/auth/verification-token.ts`).

## Recommendations Summary

1. Rate-limit credential sign-in, registration, and password-reset requests by IP and email.
2. Build verification and reset links from `AUTH_URL`, not from `Host` or `X-Forwarded-Host`.
3. Store only a SHA-256 hash of verification and reset tokens.
4. Record `passwordChangedAt` and reject JWTs issued before that time after every password reset and password change.
5. Enforce an 8 to 72 character password on register, reset, and profile change.
6. Remove the distinct unverified-account sign-in message, or keep it and accept the enumeration.
7. Run a dummy bcrypt compare on sign-in, and a similar fixed amount of work on forgot-password, when the account does not exist.
