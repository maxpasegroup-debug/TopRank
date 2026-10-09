"use client";

import { useState } from "react";
import { Brand } from "../components/layout/Brand";
import { Button } from "../components/ui/Button";

type AuthPageProps = {
  mode: "login" | "signup";
};

export function AuthPage({ mode }: AuthPageProps) {
  const isLogin = mode === "login";
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result?.error?.message ?? "Authentication failed");
        return;
      }

      window.location.href = isLogin ? "/home" : "/onboarding";
    } catch {
      setError("Unable to connect to TopRank. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-container">
      <section className="auth-panel compact-auth">
        <form className="auth-form" onSubmit={handleSubmit}>
          <Brand />
          <p className="eyebrow">{isLogin ? "Welcome Back" : "Start your journey"}</p>
          <h1 className="section-title">{isLogin ? "Welcome Back" : "Create your path"}</h1>
          <p className="section-subtitle">
            {isLogin ? "Log in to continue your TopRank mission." : "Create a real account for the production foundation."}
          </p>
          {!isLogin ? <input className="input" name="name" placeholder="Name" aria-label="Name" required /> : null}
          <input className="input" name="email" placeholder="Email" aria-label="Email" type="email" required />
          <input className="input" name="password" placeholder="Password" aria-label="Password" type="password" required minLength={8} />
          {!isLogin ? (
            <select className="input" name="role" aria-label="Role" defaultValue="STUDENT">
              <option value="STUDENT">Student</option>
              <option value="PARENT">Parent</option>
              <option value="TEACHER">Teacher</option>
              <option value="SCHOOL_ADMIN">School Admin</option>
            </select>
          ) : null}
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <button className="button button-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Please wait..." : "Continue"}
          </button>
          {isLogin ? (
            <Button href="/home" variant="secondary">
              Continue after login
            </Button>
          ) : null}
          <Button href={isLogin ? "/signup" : "/login"} variant="ghost">
            {isLogin ? "New student? Sign up" : "Already joined? Log in"}
          </Button>
        </form>
      </section>
    </main>
  );
}
