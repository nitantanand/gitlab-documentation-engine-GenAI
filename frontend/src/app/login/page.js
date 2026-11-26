"use client";

import { useEffect, useState } from "react";
import { FaGoogle } from "react-icons/fa";
import { FiEye, FiEyeOff, FiFileText, FiZap, FiShield, FiHome, FiArrowRight } from "react-icons/fi";
import { signInWithPopup, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth, googleProvider } from "../../../firebase";
import { ensureUserProfile } from "@/lib/firebase/users";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthBrandPanel from "@/components/auth/AuthBrandPanel";

const features = [
  { icon: <FiFileText />, text: "AI Generated Documentation" },
  { icon: <FiZap />, text: "Multi-Agent Workflow" },
  { icon: <FiShield />, text: "Secure Team Collaboration" },
];

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [authLoading, user, router]);

  async function completeSignIn(credential) {
    await ensureUserProfile(credential.user);
    router.push("/dashboard");
  }

  async function handleGoogleLogin() {
    setError("");
    setLoading(true);
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      await completeSignIn(credential);
    } catch (err) {
      setError(err?.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    setError("");
    setNotice("");
    const address = email.trim();
    if (!address) {
      setError("Enter your email address above, then click Forgot password? again.");
      return;
    }
    setResetting(true);
    try {
      await sendPasswordResetEmail(auth, address);
      setNotice(`If an account exists for ${address}, a password reset link has been sent. Check your inbox and spam folder.`);
    } catch (err) {
      if (err?.code === "auth/invalid-email") {
        setError("That email address doesn't look valid.");
      } else if (err?.code === "auth/too-many-requests") {
        setError("Too many attempts. Please wait a few minutes and try again.");
      } else {
        setError(err?.message || "Could not send the reset email.");
      }
    } finally {
      setResetting(false);
    }
  }

  async function handleEmailLogin() {
    setError("");
    setNotice("");
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }
    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      await completeSignIn(credential);
    } catch (err) {
      setError(err?.message || "Email/password sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-surface flex min-h-dvh w-full flex-col lg:flex-row">
      <AuthBrandPanel
        title={<>AI Content &amp; Documentation Engine</>}
        description="Generate release notes, API documentation, technical blogs and onboarding guides with powerful AI-driven workflows."
        features={features}
      />

      <section className="relative z-10 flex w-full flex-1 justify-center px-4 pb-10 sm:px-8 lg:min-h-dvh lg:items-center lg:py-10">
        <div className="card -mt-8 w-full max-w-[440px] p-6 shadow-[var(--shadow-pop)] sm:p-8 lg:mt-0 lg:shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-4">
            <div className="icon-tile h-12 w-12 bg-gradient-to-br from-brand-soft to-brand-soft/30 text-brand ring-1 ring-brand-line">
              <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-[1.8]" aria-hidden="true">
                <path d="M7.5 3.75h7.25l5 5v10.5A2.25 2.25 0 0 1 17.5 21.5h-10A2.25 2.25 0 0 1 5.25 19.25V6A2.25 2.25 0 0 1 7.5 3.75Z" />
                <path d="M14.75 3.75V9h5" />
                <path d="M8.5 12.5h7M8.5 16h7" />
              </svg>
            </div>
            <div className="min-w-0">
              <h2 className="text-[24px] font-bold tracking-[-0.03em] text-ink">
                Welcome Back <span aria-label="wave">👋</span>
              </h2>
              <p className="text-[14px] text-muted">Login to continue to your account</p>
            </div>
          </div>

          <div className="mt-7 space-y-4">
            <div>
              <label htmlFor="email" className="field-label">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between gap-4">
                <label htmlFor="password" className="field-label mb-0">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={resetting}
                  className="link cursor-pointer text-[13px] disabled:cursor-wait disabled:opacity-60"
                >
                  {resetting ? "Sending..." : "Forgot password?"}
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input appearance-none pr-12"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-[10px] text-muted transition hover:text-ink"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div role="alert" className="alert alert-danger mt-5">
              {error}
            </div>
          )}

          {notice && (
            <div role="status" className="alert alert-success mt-5">
              {notice}
            </div>
          )}

          <button
            onClick={handleEmailLogin}
            type="button"
            disabled={loading}
            className="btn btn-primary btn-lg mt-6 w-full"
          >
            {loading ? "Signing in..." : "Login"}
            <FiArrowRight aria-hidden="true" />
          </button>

          <div className="my-5 flex items-center gap-4 text-muted">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-line" />
            <span className="text-[12px] font-semibold uppercase tracking-[0.14em]">OR</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-line" />
          </div>

          <button
            onClick={handleGoogleLogin}
            type="button"
            disabled={loading}
            className="btn btn-secondary btn-lg w-full"
          >
            <FaGoogle className="text-[#EA4335]" aria-hidden="true" />
            Continue with Google
          </button>

          <p className="mt-6 text-center text-[15px] text-body">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="link font-semibold">
              Sign Up
            </Link>
          </p>

          <Link href="/" className="btn btn-ghost mt-3 w-full">
            <FiHome aria-hidden="true" />
            Back to Home
          </Link>
        </div>
      </section>
    </main>
  );
}
