import React, { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { useAuth } from '../hook/useAuth.js'
import { useSelector } from 'react-redux'
import ChatNovaLogo from '../../../components/ChatNovaLogo'
import ThemeToggle from '../../../app/ThemeToggle'

const Register = () => {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { handleRegister } = useAuth();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const registerData = { email, username, password };
    const registeredUser = await handleRegister(registerData);
    if (registeredUser) {
      navigate('/verify-email', { state: { email: registeredUser.email } });
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
            Create your account to start building with AI.
          </p>
        </div>

        {/* Auth Tab Switcher */}
        <div className="mb-6 flex rounded-xl border border-slate-200/80 bg-slate-100/80 p-1 text-xs font-medium dark:border-slate-800 dark:bg-slate-900/90">
          <Link
            to="/login"
            className="flex-1 rounded-lg py-2 text-center text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="flex-1 rounded-lg bg-indigo-600 py-2 text-center font-semibold text-white shadow-xs transition"
          >
            Register
          </Link>
        </div>

        {/* Register Form */}
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
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-xs md:text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-900/80 dark:text-white dark:placeholder:text-slate-500 dark:hover:border-slate-700 dark:focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label htmlFor="username" className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Choose a username"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-xs md:text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-900/80 dark:text-white dark:placeholder:text-slate-500 dark:hover:border-slate-700 dark:focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Create a strong password"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-xs md:text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-900/80 dark:text-white dark:placeholder:text-slate-500 dark:hover:border-slate-700 dark:focus:border-indigo-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-xs md:text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          >
            Create Account
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-400">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
