import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
import { CheckCircle2, XCircle, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
const PushNotificationToast = ({
  activeNotification,
  onDismiss,
  onSelectDonation
}) => {
  useEffect(() => {
    if (!activeNotification) return;
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(activeNotification.title, {
          body: activeNotification.message,
          icon: "/favicon.ico"
        });
      } catch (e) {
        console.debug("Native notification display prevented:", e);
      }
    }
    const timer = setTimeout(() => {
      onDismiss();
    }, 7e3);
    return () => clearTimeout(timer);
  }, [activeNotification]);
  return /* @__PURE__ */ jsx("div", { className: "fixed bottom-6 right-6 z-50 max-w-sm w-full px-4 sm:px-0", children: /* @__PURE__ */ jsx(AnimatePresence, { children: activeNotification && /* @__PURE__ */ jsxs(
    motion.div,
    {
      initial: { opacity: 0, y: 50, scale: 0.9 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: 20, scale: 0.95 },
      className: `p-4 rounded-2xl shadow-xl border backdrop-blur-xl flex items-start space-x-3 text-slate-900 ${activeNotification.type === "CONFIRMED" ? "bg-white/95 border-emerald-300 shadow-emerald-500/10" : activeNotification.type === "REJECTED" ? "bg-white/95 border-rose-300 shadow-rose-500/10" : "bg-white/95 border-amber-300 shadow-amber-500/10"}`,
      children: [
        /* @__PURE__ */ jsx("div", { className: `p-2.5 rounded-xl shrink-0 ${activeNotification.type === "CONFIRMED" ? "bg-emerald-100 text-emerald-700" : activeNotification.type === "REJECTED" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`, children: activeNotification.type === "CONFIRMED" ? /* @__PURE__ */ jsx(CheckCircle2, { className: "w-6 h-6 animate-pulse" }) : activeNotification.type === "REJECTED" ? /* @__PURE__ */ jsx(XCircle, { className: "w-6 h-6" }) : /* @__PURE__ */ jsx(Sparkles, { className: "w-6 h-6" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0 pr-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200", children: "Push Notification" }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] text-slate-400", children: "Just now" })
          ] }),
          /* @__PURE__ */ jsx("h4", { className: "font-bold text-sm text-slate-900 mt-1", children: activeNotification.title }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-600 mt-1 leading-relaxed line-clamp-3", children: activeNotification.message }),
          onSelectDonation && /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => {
                onSelectDonation(activeNotification.donationId);
                onDismiss();
              },
              className: "mt-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline underline-offset-2 cursor-pointer",
              children: "View Order Details \u2192"
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: onDismiss,
            className: "p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer",
            children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
          }
        )
      ]
    }
  ) }) });
};
export {
  PushNotificationToast
};
