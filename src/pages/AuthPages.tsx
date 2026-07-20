import { Brand } from "../components/layout/Brand";
import { Button } from "../components/ui/Button";

type AuthPageProps = {
  mode: "login" | "signup";
};

export function AuthPage({ mode }: AuthPageProps) {
  const isLogin = mode === "login";

  return (
    <main className="auth-container">
      <section className="auth-panel compact-auth">
        <div className="auth-form">
          <Brand />
          <p className="eyebrow">{isLogin ? "Welcome Back" : "Start your journey"}</p>
          <h1 className="section-title">{isLogin ? "Welcome Back" : "Create your path"}</h1>
          <p className="section-subtitle">
            Prototype only. No real login or account is created.
          </p>
          {!isLogin ? <input className="input" placeholder="Name" aria-label="Name" /> : null}
          <input className="input" placeholder="Mobile Number" aria-label="Mobile number" />
          {!isLogin ? (
            <select className="input" aria-label="Target exam" defaultValue="">
              <option value="" disabled>
                Target Exam
              </option>
              <option>NEET</option>
              <option>JEE</option>
              <option>KEAM</option>
              <option>CUET</option>
            </select>
          ) : null}
          <Button href={isLogin ? "/home" : "/welcome"}>Continue</Button>
          {isLogin ? (
            <Button href="/home" variant="secondary">
              Google (prototype only)
            </Button>
          ) : null}
          <Button href={isLogin ? "/signup" : "/login"} variant="ghost">
            {isLogin ? "New student? Sign up" : "Already joined? Log in"}
          </Button>
        </div>
      </section>
    </main>
  );
}
