import React, { useState, useEffect } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { useAuth } from '../hook/useAuth.js'
import { useSelector, useDispatch } from 'react-redux'
import { setError } from '../auth.slice.js'
import ChatNovaLogo from '../../../components/ChatNovaLogo'
import ThemeToggle from '../../../app/ThemeToggle'

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { handleLogin } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);

  useEffect(() => {
    dispatch(setError(null));
  }, [dispatch]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const loginData = { email, password };
    const loggedInUser = await handleLogin(loginData);
    if (loggedInUser) {
      navigate(loggedInUser.verified ? '/' : '/verify-email', { state: { email: loggedInUser.email } });
    }
  };

  if (!loading && user?.verified) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 text-slate-900 transition-colors duration-200 dark:bg-[#020617] dark:text-slate-100">
      {/* Top Right Theme Toggle */}
      <div className="absolute right-4 top-4 md:right-6 md:top-6 z-10">
        <ThemeToggle inline={true} />
      </div>

      <div className="auth-page-in w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-7 shadow-xl backdrop-blur-md dark:border-slate-800/80 dark:bg-[#0f172a] dark:shadow-slate-950/50 sm:p-9">
        
        {/* ChatNova Official Brand Logo & Header */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex items-center justify-center">
            <ChatNovaLogo className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            ChatNova
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Welcome back! Sign in to access your AI workspace.
          </p>
        </div>

        {/* Auth Tab Switcher */}
        <div className="mb-6 flex rounded-xl border border-slate-200/80 bg-slate-100/80 p-1 text-xs font-medium dark:border-slate-800 dark:bg-slate-900/90">
          <Link
            to="/login"
            className="flex-1 rounded-lg bg-indigo-600 py-2 text-center font-semibold text-white shadow-xs transition"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="flex-1 rounded-lg py-2 text-center text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            Register
          </Link>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-xs md:text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-900/80 dark:text-white dark:placeholder:text-slate-500 dark:hover:border-slate-700 dark:focus:border-indigo-500 dark:focus:bg-slate-900/80"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 transition"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 pr-10 text-xs md:text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-900/80 dark:text-white dark:placeholder:text-slate-500 dark:hover:border-slate-700 dark:focus:border-indigo-500 dark:focus:bg-slate-900/80"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.573 16.49 16.638 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-xs md:text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          >
            Sign In to ChatNova
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-400">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
