import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setError } from "../features/auth/auth.slice";

const Toast = () => {
  const error = useSelector((state) => state.auth.error);
  const dispatch = useDispatch();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!error) return undefined;

    setVisible(true);
    const timer = window.setTimeout(() => {
      setVisible(false);
      dispatch(setError(null));
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [dispatch, error]);

  const dismiss = () => {
    setVisible(false);
    dispatch(setError(null));
  };

  if (!error || !visible) return null;

  return (
    <div className="fixed right-4 top-16 z-[70] w-[calc(100%-2rem)] max-w-sm animate-[toast-in_220ms_ease-out]" role="alert" aria-live="assertive">
      <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-white p-4 shadow-2xl shadow-zinc-950/15 dark:border-red-400/30 dark:bg-[#121722] dark:shadow-black/40">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-400/15 dark:text-red-300"><i className="fa-solid fa-circle-exclamation" /></span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-zinc-950 dark:text-white">Something went wrong</p>
          <p className="mt-0.5 text-sm leading-5 text-zinc-600 dark:text-white/60">{error}</p>
        </div>
        <button type="button" onClick={dismiss} aria-label="Dismiss notification" className="rounded-lg p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-white/10 dark:hover:text-white"><i className="fa-solid fa-xmark" /></button>
      </div>
    </div>
  );
};

export default Toast;
