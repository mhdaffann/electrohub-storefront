import { Link } from "@tanstack/react-router";

// Visual-only until real accounts are connected; no credentials are handled.
export function AuthPlaceholder({ mode }: { mode: "login" | "signup" }) {
  const isLogin = mode === "login";
  return (
    <div className="container-x flex justify-center py-16">
      <div className="w-full max-w-md rounded-3xl border bg-card p-8 shadow-card">
        <h1 className="font-display text-2xl font-bold">{isLogin ? "Welcome back" : "Create your account"}</h1>
        <p className="mt-2 text-muted-foreground">
          Accounts are coming soon. You'll be able to {isLogin ? "sign in to track orders and save your cart" : "sign up to save your cart, wishlist and orders"}.
        </p>
        <div className="mt-6 space-y-3 opacity-60">
          {!isLogin && <input disabled placeholder="Full name" className="h-11 w-full rounded-xl border bg-secondary px-4" />}
          <input disabled placeholder="Email" className="h-11 w-full rounded-xl border bg-secondary px-4" />
          <input disabled placeholder="Password" className="h-11 w-full rounded-xl border bg-secondary px-4" />
          <button disabled className="h-11 w-full rounded-full bg-primary font-semibold text-primary-foreground">{isLogin ? "Login" : "Sign up"}</button>
        </div>
        <p className="mt-6 text-center text-sm">
          {isLogin ? <>New here? <Link to="/signup" className="font-semibold text-primary">Sign up</Link></> : <>Have an account? <Link to="/login" className="font-semibold text-primary">Login</Link></>}
        </p>
      </div>
    </div>
  );
}
