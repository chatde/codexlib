"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Library, Mail, Lock, User } from "lucide-react";
import { signup, signInWithGoogle } from "@/lib/actions/auth";

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[80vh] items-center justify-center text-muted">Loading...</div>}>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await signup(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Library className="mx-auto h-10 w-10 text-gold" />
          <h1 className="mt-4 text-2xl font-bold">Create your account</h1>
          <p className="mt-2 text-sm text-muted">
            Start building your AI knowledge library
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Display Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input
                name="displayName"
                type="text"
                required
                className="w-full rounded-lg border border-border bg-surface pl-10 pr-4 py-2.5 text-sm focus:border-gold focus:outline-none"
                placeholder="Your name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input
                name="email"
                type="email"
                required
                className="w-full rounded-lg border border-border bg-surface pl-10 pr-4 py-2.5 text-sm focus:border-gold focus:outline-none"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input
                name="password"
                type="password"
                required
                minLength={6}
                className="w-full rounded-lg border border-border bg-surface pl-10 pr-4 py-2.5 text-sm focus:border-gold focus:outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gold py-2.5 text-sm font-medium text-background hover:bg-gold-light disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-background px-2 text-muted">or</span>
          </div>
        </div>

        <button
          onClick={async () => {
            const result = await signInWithGoogle(redirectTo);
            if (result?.error) setError(result.error);
          }}
          className="w-full rounded-lg border border-border bg-surface py-2.5 text-sm hover:bg-surface-hover"
        >
          Continue with Google
        </button>

        <p className="text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-gold hover:text-gold-light">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
