import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import { useSelector } from "react-redux";
import { useAuth } from "../hook/useAuth.js";
import ThemeToggle from "../../../app/ThemeToggle.jsx";

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
    <main className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8 text-slate-900 transition-colors duration-200 dark:bg-[#020617] dark:text-slate-100">
      {/* Top Right Theme Toggle */}
      <div className="absolute right-4 top-4 md:right-6 md:top-6 z-10">
        <ThemeToggle inline={true} />
      </div>

      <section className="auth-page-in w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-xl dark:border-slate-800 dark:bg-[#0f172a] sm:p-9">
        
        {/* Header Icon */}
        <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border ${isVerified ? "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400" : "border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-400"}`}>
          <i className={`fa-solid ${isVerified ? "fa-check" : "fa-envelope"} text-2xl`} />
        </div>

        {isVerified ? (
          <>
            <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Email Verified</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">You’re all set!</h1>
            <p className="mt-2 text-xs md:text-sm text-slate-500 dark:text-slate-400">Your account is ready. Redirecting to ChatNova workspace…</p>
            <div className="mx-auto mt-6 h-1.5 w-40 overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-950">
              <div className="h-full w-full origin-left animate-[verification-progress_1.8s_linear_forwards] rounded-full bg-emerald-500" />
            </div>
          </>
        ) : (
          <>
            <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">One Last Step</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Verify your email</h1>
            <p className="mt-2 text-xs md:text-sm text-slate-500 dark:text-slate-400">
              We sent a verification link{email ? <> to <span className="font-semibold text-slate-800 dark:text-slate-200">{email}</span></> : ""}. Please check your inbox.
            </p>
            {verificationSucceeded && !loading && !isVerified && (
              <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                Verification completed. Please sign in to continue.
              </p>
            )}
            {error && <p className="mt-4 text-xs text-rose-600 dark:text-rose-400">{error}</p>}
            {user ? (
              <button
                type="button"
                onClick={resendEmail}
                disabled={resendState === "sending" || resendState === "sent"}
                className="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {resendState === "sending" ? "Sending…" : resendState === "sent" ? "Email sent — check your inbox" : "Resend verification email"}
              </button>
            ) : (
              <Link
                to="/login"
                className="mt-6 block w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
              >
                Sign in to continue
              </Link>
            )}
            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
              Already verified?{" "}
              <Link to="/login" className="font-semibold text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-400">
                Log in
              </Link>
            </p>
          </>
        )}
      </section>
    </main>
  );
};

export default Verified;
