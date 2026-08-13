import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { X, ShieldCheck, MapPin, Building, Calendar, PackageCheck, ZoomIn, User } from "lucide-react";
import { motion } from "framer-motion";
const PhotoProofModal = ({
  donation,
  onClose
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  if (!donation) return null;
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto", children: /* @__PURE__ */ jsxs(
    motion.div,
    {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
      className: "relative w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-8",
      children: [
        /* @__PURE__ */ jsxs("div", { className: "p-5 sm:p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3", children: [
            /* @__PURE__ */ jsx("div", { className: "p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200", children: /* @__PURE__ */ jsx(ShieldCheck, { className: "w-6 h-6" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-slate-900", children: "Donor Verification Proof Photo" }),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-slate-500", children: [
                "Uploaded by ",
                donation.donorName,
                " (",
                donation.venueType,
                ")"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: onClose,
              className: "p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer",
              children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" })
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-6 grid grid-cols-1 lg:grid-cols-12 gap-6", children: [
          /* @__PURE__ */ jsx("div", { className: "lg:col-span-7 flex flex-col items-center", children: /* @__PURE__ */ jsxs("div", { className: "relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group", children: [
            /* @__PURE__ */ jsx(
              "img",
              {
                src: donation.photoProofUrl,
                alt: `Photo proof for ${donation.foodTitle}`,
                referrerPolicy: "no-referrer",
                className: `w-full h-full object-cover transition-transform duration-300 ${isZoomed ? "scale-150 cursor-zoom-out" : "group-hover:scale-105 cursor-zoom-in"}`,
                onClick: () => setIsZoomed(!isZoomed)
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-800 border border-slate-200 flex items-center space-x-1 shadow-xs", children: [
              /* @__PURE__ */ jsx(ZoomIn, { className: "w-3.5 h-3.5 text-emerald-600" }),
              /* @__PURE__ */ jsx("span", { children: isZoomed ? "Click to zoom out" : "Click photo to zoom" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 text-xs shadow-xs", children: [
              /* @__PURE__ */ jsxs("p", { className: "text-slate-800 font-semibold truncate", children: [
                "\u{1F4F7} Mandatory Proof Image: ",
                donation.foodTitle
              ] }),
              /* @__PURE__ */ jsxs("p", { className: "text-slate-500 text-[11px]", children: [
                "Timestamp: ",
                new Date(donation.submittedAt).toLocaleString()
              ] })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "lg:col-span-5 flex flex-col justify-between space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200", children: [
              /* @__PURE__ */ jsx("h4", { className: "text-xs uppercase font-bold text-emerald-700 tracking-wider", children: "Submission Audit Trail" }),
              /* @__PURE__ */ jsxs("div", { className: "text-xs space-y-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center text-slate-700", children: [
                  /* @__PURE__ */ jsx(Building, { className: "w-4 h-4 text-slate-400 mr-2 shrink-0" }),
                  /* @__PURE__ */ jsx("span", { className: "font-bold text-slate-900 mr-1", children: donation.donorName }),
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold", children: donation.venueType })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center text-slate-700", children: [
                  /* @__PURE__ */ jsx(User, { className: "w-4 h-4 text-slate-400 mr-2 shrink-0" }),
                  /* @__PURE__ */ jsxs("span", { children: [
                    "Contact: ",
                    /* @__PURE__ */ jsx("strong", { children: donation.contactPerson }),
                    " (",
                    donation.contactPhone,
                    ")"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-start text-slate-700", children: [
                  /* @__PURE__ */ jsx(MapPin, { className: "w-4 h-4 text-slate-400 mr-2 mt-0.5 shrink-0" }),
                  /* @__PURE__ */ jsxs("span", { children: [
                    donation.address,
                    ", ",
                    donation.city
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center text-slate-700", children: [
                  /* @__PURE__ */ jsx(PackageCheck, { className: "w-4 h-4 text-slate-400 mr-2 shrink-0" }),
                  /* @__PURE__ */ jsxs("span", { children: [
                    donation.quantityServings,
                    " Servings (",
                    donation.quantityKg,
                    " kg)"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center text-slate-700", children: [
                  /* @__PURE__ */ jsx(Calendar, { className: "w-4 h-4 text-slate-400 mr-2 shrink-0" }),
                  /* @__PURE__ */ jsxs("span", { children: [
                    "Cooked: ",
                    new Date(donation.cookedTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  ] })
                ] })
              ] })
            ] }),
            donation.detailedFoodItems && /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs", children: [
              /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold uppercase text-emerald-700 tracking-wider", children: "Detailed Menu & Items Breakdown:" }),
              /* @__PURE__ */ jsx("p", { className: "whitespace-pre-line text-xs font-mono text-slate-800 leading-relaxed", children: donation.detailedFoodItems })
            ] }),
            donation.numberOfContainers && /* @__PURE__ */ jsxs("div", { className: "p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-slate-600 font-medium", children: "Containers Specs:" }),
              /* @__PURE__ */ jsxs("span", { className: "font-bold text-amber-800", children: [
                donation.numberOfContainers,
                " Containers (",
                donation.containerType || donation.packagingType,
                ")"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs", children: [
              /* @__PURE__ */ jsx("span", { className: "text-slate-600 font-medium", children: "Current Status:" }),
              /* @__PURE__ */ jsx("span", { className: `font-bold px-3 py-1 rounded-full border ${donation.status === "Confirmed" ? "bg-emerald-100 text-emerald-800 border-emerald-300" : donation.status === "Rejected" ? "bg-rose-100 text-rose-800 border-rose-300" : "bg-amber-100 text-amber-800 border-amber-300 animate-pulse"}`, children: donation.status })
            ] })
          ] })
        ] })
      ]
    }
  ) });
};
export {
  PhotoProofModal
};
