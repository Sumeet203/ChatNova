import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import { useSelector } from "react-redux";
import { useAuth } from "../hook/useAuth.js";

const Verified = () => {
  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);
  const error = useSelector((state) => state.auth.error);
  const { handleGetMe, handleResendVerificationEmail } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [resendState, setResendState] = useState("idle");
  const verificationSucceeded = searchParams.get("status") === "success";
  const email = location.state?.email || user?.email;

  useEffect(() => {
    if (verificationSucceeded) handleGetMe();
    // handleGetMe is a hook action recreated on render; this effect should run only on verification callback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verificationSucceeded]);

  useEffect(() => {
    if (!user?.verified) return;
    const redirectTimer = window.setTimeout(() => navigate("/", { replace: true }), 1800);
    return () => window.clearTimeout(redirectTimer);
  }, [user?.verified, navigate]);

  const resendEmail = async () => {
    setResendState("sending");
    try {
      await handleResendVerificationEmail();
      setResendState("sent");
    } catch {
      setResendState("idle");
    }
  };

  const isVerified = user?.verified;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-stone-100 via-neutral-50 to-zinc-100 px-4 py-8 text-zinc-950 dark:bg-[#07090f] dark:bg-none dark:text-white">
      <section className="auth-page-in w-full max-w-md overflow-hidden rounded-3xl border border-stone-200/80 bg-gradient-to-br from-[#faf9f6] via-stone-50 to-zinc-100 p-7 text-center shadow-2xl shadow-stone-300/40 dark:border-white/10 dark:bg-[#080b12] dark:bg-none dark:shadow-black/40 sm:p-9">
        <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border ${isVerified ? "border-emerald-300 bg-emerald-100 text-emerald-600 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300" : "border-cyan-200 bg-cyan-100 text-cyan-600 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-300"}`}>
          <i className={`fa-solid ${isVerified ? "fa-check" : "fa-envelope"} text-3xl`} />
        </div>

        {isVerified ? (
          <>
            <p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300">Email verified</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">You’re all set.</h1>
            <p className="mt-3 text-sm leading-6 text-zinc-500 dark:text-white/55">Your account is ready. Taking you to your chat workspace…</p>
            <div className="mx-auto mt-7 h-1.5 w-44 overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-400/10"><div className="h-full w-full origin-left animate-[verification-progress_1.8s_linear_forwards] rounded-full bg-emerald-500" /></div>
          </>
        ) : (
          <>
            <p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">One last step</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">Verify your email</h1>
            <p className="mt-3 text-sm leading-6 text-zinc-500 dark:text-white/55">We sent a verification link{email ? <> to <span className="font-medium text-zinc-800 dark:text-white/85">{email}</span></> : ""}. Open it to start chatting.</p>
            {verificationSucceeded && !loading && !isVerified && <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:bg-amber-400/10 dark:text-amber-200">Verification completed. Please sign in to continue.</p>}
            {error && <p className="mt-4 text-sm text-red-600 dark:text-red-300">{error}</p>}
            {user ? <button type="button" onClick={resendEmail} disabled={resendState === "sending" || resendState === "sent"} className="mt-7 w-full rounded-xl border border-cyan-300 bg-cyan-400 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70 dark:border-cyan-400/30">
              {resendState === "sending" ? "Sending…" : resendState === "sent" ? "Email sent — check your inbox" : "Resend verification email"}
            </button> : <Link to="/login" className="mt-7 block w-full rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-300">Sign in to continue</Link>}
            <p className="mt-5 text-sm text-zinc-500 dark:text-white/45">Already verified? <Link to="/login" className="font-medium text-cyan-600 hover:text-cyan-500 dark:text-cyan-300">Log in</Link></p>
          </>
        )}
      </section>
    </main>
  );
};

export default Verified;
