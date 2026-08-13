import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import {
  Building2,
  ShieldCheck,
  Heart,
  Bell,
  CheckCircle2,
  XCircle,
  Sparkles,
  WifiOff,
  PlusCircle,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
const Header = ({
  currentRole,
  onRoleChange,
  pendingCount,
  notifications,
  onMarkRead,
  isConnected,
  onQuickAddPreset,
  onSelectDonation,
  forcedRole
}) => {
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;
  return /* @__PURE__ */ jsx("header", { className: "sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-900 shadow-xs", children: /* @__PURE__ */ jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between h-16 sm:h-20", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3", children: [
      /* @__PURE__ */ jsx("div", { className: "w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-0.5 shadow-md shadow-emerald-600/15 flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "w-full h-full bg-white rounded-[10px] flex items-center justify-center", children: /* @__PURE__ */ jsx(Heart, { className: "w-6 h-6 text-emerald-600 fill-emerald-500/20" }) }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
          /* @__PURE__ */ jsxs("span", { className: "font-bold text-lg sm:text-xl tracking-tight text-slate-900", children: [
            "Nourish",
            /* @__PURE__ */ jsx("span", { className: "text-emerald-600", children: "Relief" })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full hidden xs:inline-block", children: "Real-time" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 hidden sm:block", children: "Surplus Food Rescue & Verification Network" })
      ] })
    ] }),
    !forcedRole && /* @__PURE__ */ jsxs("nav", { className: "flex items-center space-x-1 sm:space-x-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => onRoleChange("donor"),
          className: `flex items-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${currentRole === "donor" ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20" : "text-slate-600 hover:text-slate-900 hover:bg-white/80"}`,
          children: [
            /* @__PURE__ */ jsx(Building2, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsx("span", { children: "Donor Portal" })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => onRoleChange("admin"),
          className: `relative flex items-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${currentRole === "admin" ? "bg-amber-600 text-white shadow-sm shadow-amber-600/20" : "text-slate-600 hover:text-slate-900 hover:bg-white/80"}`,
          children: [
            /* @__PURE__ */ jsx(ShieldCheck, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsx("span", { children: "Admin Page" }),
            pendingCount > 0 && /* @__PURE__ */ jsx("span", { className: "ml-1 px-2 py-0.2 text-[11px] font-bold bg-amber-400 text-slate-950 rounded-full", children: pendingCount })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2 sm:space-x-3", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: onQuickAddPreset,
          title: "Add sample surplus food listing for quick verification testing",
          className: "hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-emerald-700 text-xs font-semibold border border-slate-200 transition-colors",
          children: [
            /* @__PURE__ */ jsx(PlusCircle, { className: "w-3.5 h-3.5" }),
            /* @__PURE__ */ jsx("span", { children: "+ Quick Preset" })
          ]
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] text-slate-600 hidden sm:flex", children: isConnected ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-emerald-500 animate-ping" }),
        /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-emerald-500 -ml-3" }),
        /* @__PURE__ */ jsx("span", { className: "text-emerald-700 font-semibold", children: "Live" })
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(WifiOff, { className: "w-3 h-3 text-amber-600" }),
        /* @__PURE__ */ jsx("span", { className: "text-amber-600 font-medium", children: "Offline" })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => {
              setShowNotifDrawer(!showNotifDrawer);
              if (!showNotifDrawer) onMarkRead();
            },
            className: "relative p-2 sm:p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200",
            "aria-label": "Push Notifications",
            children: [
              /* @__PURE__ */ jsx(Bell, { className: "w-5 h-5" }),
              unreadCount > 0 && /* @__PURE__ */ jsx("span", { className: "absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white animate-bounce", children: unreadCount })
            ]
          }
        ),
        /* @__PURE__ */ jsx(AnimatePresence, { children: showNotifDrawer && /* @__PURE__ */ jsxs(
          motion.div,
          {
            initial: { opacity: 0, y: 10, scale: 0.95 },
            animate: { opacity: 1, y: 0, scale: 1 },
            exit: { opacity: 0, y: 10, scale: 0.95 },
            className: "absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
                  /* @__PURE__ */ jsx(Bell, { className: "w-4 h-4 text-emerald-600" }),
                  /* @__PURE__ */ jsx("h3", { className: "font-semibold text-sm text-slate-900", children: "Push Notifications" })
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "text-xs text-slate-500", children: [
                  notifications.length,
                  " alerts"
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "max-h-80 overflow-y-auto divide-y divide-slate-100", children: notifications.length === 0 ? /* @__PURE__ */ jsx("div", { className: "p-8 text-center text-slate-500 text-xs", children: "No notifications yet. Status changes will appear here in real time." }) : notifications.map((notif) => /* @__PURE__ */ jsx(
                "div",
                {
                  onClick: () => {
                    if (onSelectDonation) onSelectDonation(notif.donationId);
                    setShowNotifDrawer(false);
                  },
                  className: `p-3.5 hover:bg-slate-50 transition-colors cursor-pointer ${!notif.read ? "bg-emerald-50/60" : ""}`,
                  children: /* @__PURE__ */ jsxs("div", { className: "flex items-start space-x-3", children: [
                    notif.type === "CONFIRMED" ? /* @__PURE__ */ jsx("div", { className: "p-1.5 rounded-lg bg-emerald-100 text-emerald-700 shrink-0", children: /* @__PURE__ */ jsx(CheckCircle2, { className: "w-4 h-4" }) }) : notif.type === "REJECTED" ? /* @__PURE__ */ jsx("div", { className: "p-1.5 rounded-lg bg-rose-100 text-rose-700 shrink-0", children: /* @__PURE__ */ jsx(XCircle, { className: "w-4 h-4" }) }) : /* @__PURE__ */ jsx("div", { className: "p-1.5 rounded-lg bg-amber-100 text-amber-700 shrink-0", children: /* @__PURE__ */ jsx(Sparkles, { className: "w-4 h-4" }) }),
                    /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                      /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-slate-900", children: notif.title }),
                      /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-600 mt-0.5 line-clamp-2", children: notif.message }),
                      /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-slate-400 mt-1 flex items-center", children: [
                        /* @__PURE__ */ jsx(Clock, { className: "w-3 h-3 mr-1" }),
                        new Date(notif.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      ] })
                    ] })
                  ] })
                },
                notif.id
              )) }),
              /* @__PURE__ */ jsx("div", { className: "p-3 bg-slate-50 border-t border-slate-200 text-center", children: /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setShowNotifDrawer(false),
                  className: "text-xs text-emerald-700 hover:text-emerald-800 font-semibold",
                  children: "Close"
                }
              ) })
            ]
          }
        ) })
      ] })
    ] })
  ] }) }) });
};
export {
  Header
};
