"use client";

import { useEffect, useState } from "react";
import { FaGoogle } from "react-icons/fa";
import { FiEye, FiEyeOff, FiFileText, FiZap, FiShield, FiHome, FiArrowRight } from "react-icons/fi";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "../../../firebase";
import { createUserProfile, ensureUserProfile } from "@/lib/firebase/users";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthBrandPanel from "@/components/auth/AuthBrandPanel";

const features = [
  { icon: <FiFileText />, text: "AI Generated Documentation" },
  { icon: <FiZap />, text: "Smart Multi-Agent Workflows" },
  { icon: <FiShield />, text: "Secure Team Collaboration" },
];

export default function SignupPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [authLoading, user, router]);

  async function completeSignUp(credential, displayName) {
    if (displayName) {
      await updateProfile(credential.user, { displayName });
    }

    await createUserProfile(credential.user.uid, {
      email: credential.user.email ?? email,
      displayName: displayName || credential.user.displayName || "",
    });

    router.push("/dashboard");
  }

  async function handleEmailSignup() {
    setError("");

    if (!fullName || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await completeSignUp(credential, fullName);
    } catch (err) {
      setError(err?.message || "Account creation failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignup() {
    setError("");
    setLoading(true);
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      await ensureUserProfile(credential.user);
      router.push("/dashboard");
    } catch (err) {
      setError(err?.message || "Google sign-up failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-surface flex min-h-dvh w-full flex-col lg:flex-row">
      <AuthBrandPanel
        title="Build Better Docs with AI"
        description="Create polished product documentation, release notes, and onboarding content faster with an AI-powered workspace built for teams."
        features={features}
      />

      <section className="relative z-10 flex w-full flex-1 justify-center px-4 pb-10 sm:px-8 lg:min-h-dvh lg:items-center lg:py-6">
        <div className="card -mt-8 w-full max-w-[440px] p-6 shadow-[var(--shadow-pop)] sm:p-8 lg:mt-0 lg:p-7 lg:shadow-[var(--shadow-card)]">
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
                Create Account <span aria-label="sparkles">✨</span>
              </h2>
              <p className="text-[14px] text-muted">Sign up to get started</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div>
              <label htmlFor="fullName" className="field-label">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input"
              />
            </div>

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
              <label htmlFor="password" className="field-label">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
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

            <div>
              <label htmlFor="confirmPassword" className="field-label">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input appearance-none pr-12"
                />
                <button
                  type="button"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-[10px] text-muted transition hover:text-ink"
                >
                  {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div role="alert" className="alert alert-danger mt-5">
              {error}
            </div>
          )}

          <button
            onClick={handleEmailSignup}
            type="button"
            disabled={loading}
            className="btn btn-primary mt-5 w-full sm:min-h-[44px]"
          >
            {loading ? "Creating account..." : "Create Account"}
            <FiArrowRight aria-hidden="true" />
          </button>

          <div className="my-4 flex items-center gap-4 text-muted">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-line" />
            <span className="text-[12px] font-semibold uppercase tracking-[0.14em]">OR</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-line" />
          </div>

          <button
            onClick={handleGoogleSignup}
            type="button"
            disabled={loading}
            className="btn btn-secondary w-full sm:min-h-[44px]"
          >
            <FaGoogle className="text-[#EA4335]" aria-hidden="true" />
            Continue with Google
          </button>

          <p className="mt-5 text-center text-[15px] text-body">
            Already have an account?{" "}
            <Link href="/login" className="link font-semibold">
              Log In
            </Link>
          </p>

          <Link href="/" className="btn btn-ghost mt-2 w-full">
            <FiHome aria-hidden="true" />
            Back to Home
          </Link>
        </div>
      </section>
    </main>
  );
}
