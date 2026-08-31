import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  X,
} from "lucide-react";
import { removeToast } from "../utils/toast.slice.js";

const Toast = ({ id, message, type }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(removeToast(id));
    }, 3200);

    return () => clearTimeout(timer);
  }, [dispatch, id]);

  const handleDismiss = () => {
    dispatch(removeToast(id));
  };

  const config = {
    error: {
      icon: AlertCircle,
      badge: "Alert",
      border: "border-red-500/40",
      iconBg: "bg-red-500/10 text-red-500 border-red-500/25",
      badgeText: "text-red-500 dark:text-red-400",
      shadow: "shadow-[0_10px_35px_rgba(239,68,68,0.15)]",
    },
    success: {
      icon: CheckCircle2,
      badge: "Success",
      border: "border-emerald-500/40",
      iconBg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/25",
      badgeText: "text-emerald-500 dark:text-emerald-400",
      shadow: "shadow-[0_10px_35px_rgba(16,185,129,0.15)]",
    },
    warning: {
      icon: AlertTriangle,
      badge: "Warning",
      border: "border-amber-500/40",
      iconBg: "bg-amber-500/10 text-amber-500 border-amber-500/25",
      badgeText: "text-amber-500 dark:text-amber-400",
      shadow: "shadow-[0_10px_35px_rgba(245,158,11,0.15)]",
    },
    info: {
      icon: Info,
      badge: "Notice",
      border: "border-blue-500/40",
      iconBg: "bg-blue-500/10 text-blue-500 border-blue-500/25",
      badgeText: "text-blue-500 dark:text-blue-400",
      shadow: "shadow-[0_10px_35px_rgba(59,130,246,0.15)]",
    },
  };

  const current = config[type] || config.info;
  const Icon = current.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`pointer-events-auto flex items-center gap-3 p-3.5 pr-10 rounded-2xl border backdrop-blur-2xl transition-all w-full sm:w-auto min-w-[280px] max-w-[92vw] sm:max-w-[420px] ${current.border} ${current.shadow} relative select-none`}
      style={{
        backgroundColor: "hsl(var(--card) / 0.95)",
        color: "hsl(var(--foreground))",
      }}
    >
      <div
        className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-xl border ${current.iconBg}`}
      >
        <Icon className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <span
          className={`text-[9px] sm:text-[10px] uppercase font-black tracking-widest ${current.badgeText}`}
        >
          {current.badge}
        </span>
        <p
          className="text-xs font-semibold leading-snug break-words"
          style={{ color: "hsl(var(--foreground))" }}
        >
          {message}
        </p>
      </div>

      <button
        onClick={handleDismiss}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-neutral-200 dark:hover:bg-white/10 transition-colors"
        style={{ color: "hsl(var(--muted-foreground))" }}
        title="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
};

export const ToastContainer = () => {
  const toasts = useSelector((state) => state.toast?.toasts || []);

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 z-[9999] pointer-events-none flex flex-col items-center sm:items-end gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
