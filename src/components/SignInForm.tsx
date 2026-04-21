"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { PASSWORD_MIN_LENGTH, PASSWORD_TOO_SHORT_MESSAGE } from "@shared/auth";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";

type FormStep = "signIn" | "signUp" | "verifyEmail" | "forgotPassword" | "resetPassword";
type FieldErrorKey = "email" | "password" | "newPassword" | "otp";
type FieldErrors = Partial<Record<FieldErrorKey, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [step, setStep] = useState<FormStep>("signUp");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const resetForm = useCallback(() => {
    setPassword("");
    setNewPassword("");
    setOtp("");
    setSubmitting(false);
    setFieldErrors({});
  }, []);

  const clearFieldError = useCallback((field: FieldErrorKey) => {
    setFieldErrors((current) =>
      current[field]
        ? {
            ...current,
            [field]: undefined,
          }
        : current
    );
  }, []);

  const validateCurrentStep = useCallback(() => {
    const nextErrors: FieldErrors = {};
    const normalizedEmail = email.trim();

    if (step === "signIn" || step === "signUp" || step === "forgotPassword") {
      if (!normalizedEmail) {
        nextErrors.email = "Email is required.";
      } else if (!EMAIL_PATTERN.test(normalizedEmail)) {
        nextErrors.email = "Enter a valid email address.";
      }
    }

    if (step === "signIn" || step === "signUp") {
      if (!password) {
        nextErrors.password = "Password is required.";
      } else if (step === "signUp" && password.length < PASSWORD_MIN_LENGTH) {
        nextErrors.password = PASSWORD_TOO_SHORT_MESSAGE;
      }
    }

    if (step === "verifyEmail" || step === "resetPassword") {
      if (otp.length !== 6) {
        nextErrors.otp = "Enter the 6-digit code from your email.";
      }
    }

    if (step === "resetPassword") {
      if (!newPassword) {
        nextErrors.newPassword = "New password is required.";
      } else if (newPassword.length < PASSWORD_MIN_LENGTH) {
        nextErrors.newPassword = PASSWORD_TOO_SHORT_MESSAGE;
      }
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [email, newPassword, otp, password, step]);

  const handleSubmit = useCallback(async () => {
    if (!validateCurrentStep()) {
      return;
    }

    setSubmitting(true);
    const normalizedEmail = email.trim();
    const formData = new FormData();
    formData.set("email", normalizedEmail);

    try {
      switch (step) {
        case "signIn":
          formData.set("password", password);
          formData.set("flow", "signIn");
          await signIn("password", formData);
          break;

        case "signUp":
          formData.set("password", password);
          formData.set("flow", "signUp");
          try {
            await signIn("password", formData);
          } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            if (msg.includes("verify") || msg.includes("OTP") || msg.includes("email-verification")) {
              resetForm();
              setStep("verifyEmail");
              setResendCooldown(60);
              toast.info("Check your email for a verification code.");
              return;
            }
            throw error;
          }
          resetForm();
          setStep("verifyEmail");
          setResendCooldown(60);
          toast.info("Check your email for a verification code.");
          return;

        case "verifyEmail":
          formData.set("code", otp);
          formData.set("flow", "email-verification");
          await signIn("password", formData);
          toast.success("Email verified!");
          break;

        case "forgotPassword":
          formData.set("flow", "reset");
          await signIn("password", formData);
          resetForm();
          setStep("resetPassword");
          setResendCooldown(60);
          toast.info("Check your email for a reset code.");
          return;

        case "resetPassword":
          formData.set("code", otp);
          formData.set("newPassword", newPassword);
          formData.set("flow", "reset-verification");
          await signIn("password", formData);
          toast.success("Password reset successfully!");
          resetForm();
          setStep("signIn");
          return;
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      const lowerMsg = msg.toLowerCase();

      if (lowerMsg.includes("rate_limit") || msg.includes("429") || lowerMsg.includes("toomanyfailedattempts")) {
        toast.error("Too many attempts. Please wait a few minutes before trying again.");
      } else if (
        lowerMsg.includes("invalid password") ||
        lowerMsg.includes("password requirement") ||
        lowerMsg.includes("password must be at least")
      ) {
        setFieldErrors((current) => ({
          ...current,
          [step === "resetPassword" ? "newPassword" : "password"]: PASSWORD_TOO_SHORT_MESSAGE,
        }));
      } else if (lowerMsg.includes("invalidsecret") || lowerMsg.includes("invalid credentials")) {
        setFieldErrors((current) => ({
          ...current,
          password: "Incorrect password. Please try again.",
        }));
      } else if (
        lowerMsg.includes("invalid email") ||
        lowerMsg.includes("email format") ||
        lowerMsg.includes("valid email address")
      ) {
        setFieldErrors((current) => ({
          ...current,
          email: "Enter a valid email address.",
        }));
      } else if (lowerMsg.includes("invalidaccountid") || lowerMsg.includes("could not find")) {
        if (step === "signIn") {
          resetForm();
          setStep("signUp");
          setPassword(password);
          toast.info("No account found. Switched to sign up - please submit again.");
        } else if (step === "forgotPassword") {
          resetForm();
          setStep("resetPassword");
          setResendCooldown(60);
          toast.info("If an account exists with this email, a reset code has been sent.");
          return;
        } else {
          setFieldErrors((current) => ({
            ...current,
            email: "Account not found. Please check your email address.",
          }));
        }
      } else if (
        lowerMsg.includes("verify code") ||
        lowerMsg.includes("verification code") ||
        lowerMsg.includes("invalid code") ||
        lowerMsg.includes("expired")
      ) {
        setFieldErrors((current) => ({
          ...current,
          otp: "Invalid or expired code. Please try again or request a new one.",
        }));
      } else if (lowerMsg.includes("already exists") || lowerMsg.includes("unique") || lowerMsg.includes("duplicate")) {
        setFieldErrors((current) => ({
          ...current,
          email: "An account with this email already exists. Please sign in instead.",
        }));
      } else if (lowerMsg.includes("deleted")) {
        toast.error("This account has been deleted. Please create a new account.");
      } else if (msg.includes("Failed to send")) {
        toast.error("Could not send email. Please try again later.");
      } else if (lowerMsg.includes("not configured") || msg.includes("SITE_URL") || lowerMsg.includes("not enabled")) {
        toast.error("Email service is not available. Please contact support.");
      } else if (msg.includes("Missing") && msg.includes("param")) {
        toast.error("Something went wrong. Please refresh the page and try again.");
      } else if (step === "signIn") {
        toast.error("Could not sign in. Please check your credentials.");
      } else if (step === "signUp") {
        toast.error("Could not create account. Please try again.");
      } else {
        toast.error(msg || "Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }, [step, email, password, newPassword, otp, signIn, resetForm, validateCurrentStep]);

  const handleResendCode = useCallback(async () => {
    if (resendCooldown > 0) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("email", email);
      formData.set("flow", step === "verifyEmail" ? "email-verification" : "reset");
      await signIn("password", formData);
      setResendCooldown(60);
      toast.info("New code sent to your email.");
    } catch {
      toast.error("Failed to resend code. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [email, resendCooldown, signIn, step]);

  const inputClass = "w-full px-4 py-3 text-base bg-secondary text-secondary-foreground placeholder:text-muted-foreground border border-input rounded-lg focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-950 transition-all duration-200 outline-none";
  const buttonClass = "w-full px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-semibold rounded-lg";
  const linkClass = "text-primary hover:text-primary/80 hover:underline font-medium cursor-pointer transition-colors duration-200";

  return (
    <div className="w-full">
      <form
        className="flex flex-col gap-4"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          void handleSubmit();
        }}
      >
        {(step === "signIn" || step === "signUp" || step === "forgotPassword") && (
          <div>
            <input
              className={`${inputClass} ${fieldErrors.email ? "border-destructive focus:ring-destructive/20" : ""}`}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearFieldError("email");
              }}
              required
              disabled={submitting}
              autoComplete="email"
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? "auth-email-error" : undefined}
            />
            {fieldErrors.email && (
              <p id="auth-email-error" className="mt-1 text-sm text-destructive" role="alert">
                {fieldErrors.email}
              </p>
            )}
          </div>
        )}

        {(step === "signIn" || step === "signUp") && (
          <div>
            <input
              className={`${inputClass} ${fieldErrors.password ? "border-destructive focus:ring-destructive/20" : ""}`}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearFieldError("password");
              }}
              required
              minLength={step === "signUp" ? PASSWORD_MIN_LENGTH : undefined}
              disabled={submitting}
              autoComplete={step === "signUp" ? "new-password" : "current-password"}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? "auth-password-error" : step === "signUp" ? "auth-password-hint" : undefined}
            />
            {fieldErrors.password ? (
              <p id="auth-password-error" className="mt-1 text-sm text-destructive" role="alert">
                {fieldErrors.password}
              </p>
            ) : step === "signUp" ? (
              <p id="auth-password-hint" className="mt-1 text-xs text-muted-foreground">
                Minimum {PASSWORD_MIN_LENGTH} characters
              </p>
            ) : null}
          </div>
        )}

        {(step === "verifyEmail" || step === "resetPassword") && (
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-muted-foreground text-center">
              {step === "verifyEmail"
                ? "Enter the 6-digit code sent to your email"
                : "Enter the 6-digit reset code sent to your email"}
            </p>
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value) => {
                setOtp(value);
                clearFieldError("otp");
              }}
              disabled={submitting}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            {fieldErrors.otp && (
              <p className="text-sm text-destructive text-center" role="alert">
                {fieldErrors.otp}
              </p>
            )}
          </div>
        )}

        {step === "resetPassword" && (
          <div>
            <input
              className={`${inputClass} ${fieldErrors.newPassword ? "border-destructive focus:ring-destructive/20" : ""}`}
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                clearFieldError("newPassword");
              }}
              required
              minLength={PASSWORD_MIN_LENGTH}
              disabled={submitting}
              autoComplete="new-password"
              aria-invalid={Boolean(fieldErrors.newPassword)}
              aria-describedby={fieldErrors.newPassword ? "auth-new-password-error" : "auth-new-password-hint"}
            />
            {fieldErrors.newPassword ? (
              <p id="auth-new-password-error" className="mt-1 text-sm text-destructive" role="alert">
                {fieldErrors.newPassword}
              </p>
            ) : (
              <p id="auth-new-password-hint" className="mt-1 text-xs text-muted-foreground">
                Minimum {PASSWORD_MIN_LENGTH} characters
              </p>
            )}
          </div>
        )}

        <button className={buttonClass} type="submit" disabled={submitting}>
          {submitting ? (
            <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mx-auto" />
          ) : step === "signIn" ? "Sign in"
            : step === "signUp" ? "Sign up"
            : step === "verifyEmail" ? "Verify"
            : step === "forgotPassword" ? "Send reset code"
            : "Reset password"}
        </button>

        {(step === "verifyEmail" || step === "resetPassword") && (
          <div className="text-center text-sm text-muted-foreground">
            <button
              type="button"
              className={linkClass}
              onClick={() => void handleResendCode()}
              disabled={submitting || resendCooldown > 0}
            >
              {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : "Resend code"}
            </button>
          </div>
        )}

        <div className="text-center text-sm text-muted-foreground">
          {(step === "signIn" || step === "signUp") && (
            <>
              <span>
                {step === "signIn" ? "Don't have an account? " : "Already have an account? "}
              </span>
              <button
                type="button"
                className={linkClass}
                onClick={() => { resetForm(); setStep(step === "signIn" ? "signUp" : "signIn"); }}
                disabled={submitting}
              >
                {step === "signIn" ? "Sign up instead" : "Sign in instead"}
              </button>
            </>
          )}
          {step === "signIn" && (
            <div className="mt-2">
              <button
                type="button"
                className={linkClass}
                onClick={() => { resetForm(); setStep("forgotPassword"); }}
                disabled={submitting}
              >
                Forgot password?
              </button>
            </div>
          )}
          {(step === "forgotPassword" || step === "verifyEmail" || step === "resetPassword") && (
            <button
              type="button"
              className={linkClass}
              onClick={() => { resetForm(); setStep("signIn"); }}
              disabled={submitting}
            >
              Back to sign in
            </button>
          )}
        </div>
      </form>

      {(step === "signIn" || step === "signUp") && (
        <>
          <div className="flex items-center justify-center my-6">
            <hr className="flex-1 h-px bg-border" />
            <span className="px-4 text-sm text-muted-foreground">or</span>
            <hr className="flex-1 h-px bg-border" />
          </div>
          <button
            className="w-full px-6 py-3 bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-semibold rounded-lg border border-input"
            onClick={() => void signIn("anonymous")}
            disabled={submitting}
          >
            Sign in anonymously
          </button>
        </>
      )}
    </div>
  );
}
