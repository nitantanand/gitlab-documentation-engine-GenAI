"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthGuard({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center px-4">
        <div className="card flex flex-col items-center gap-4 px-10 py-8" role="status" aria-live="polite">
          <span className="spinner h-7 w-7" aria-hidden="true" />
          <p className="text-[15px] font-semibold text-ink">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
