import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Eye,
  Building2,
  Phone,
  MapPin,
  Calendar,
  PackageCheck,
  User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
const AdminDashboard = ({
  donations,
  onUpdateStatus,
  onInspectProof
}) => {
  const [filterStatus, setFilterStatus] = useState("Pending Request");
  const [searchQuery, setSearchQuery] = useState("");
  const [rejectionModalDonation, setRejectionModalDonation] = useState(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState("");
  const [actionInProgressId, setActionInProgressId] = useState(null);
  const filteredDonations = donations.filter((item) => {
    const matchesStatus = filterStatus === "ALL" || item.status === filterStatus;
    const matchesSearch = item.donorName.toLowerCase().includes(searchQuery.toLowerCase()) || item.foodTitle.toLowerCase().includes(searchQuery.toLowerCase()) || item.city.toLowerCase().includes(searchQuery.toLowerCase()) || item.venueType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });
  const pendingCount = donations.filter((d) => d.status === "Pending Request").length;
  const confirmedCount = donations.filter((d) => d.status === "Confirmed").length;
  const rejectedCount = donations.filter((d) => d.status === "Rejected").length;
  const totalServings = donations.filter((d) => d.status === "Confirmed").reduce((acc, curr) => acc + curr.quantityServings, 0);
  const handleConfirmOrder = async (donation) => {
    setActionInProgressId(donation.id);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    await onUpdateStatus(donation.id, "Confirmed", "Verified and approved by Admin verification system.");
    setActionInProgressId(null);
  };
  const handleConfirmRejection = async () => {
    if (!rejectionModalDonation) return;
    setActionInProgressId(rejectionModalDonation.id);
    const finalReason = rejectionReasonInput.trim() || "Photo proof or details did not satisfy food safety requirements.";
    await onUpdateStatus(rejectionModalDonation.id, "Rejected", finalReason);
    setActionInProgressId(null);
    setRejectionModalDonation(null);
    setRejectionReasonInput("");
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xs", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold mb-3", children: [
            /* @__PURE__ */ jsx(ShieldCheck, { className: "w-4 h-4 text-amber-700" }),
            /* @__PURE__ */ jsx("span", { children: "Admin Order Verification Portal" })
          ] }),
          /* @__PURE__ */ jsx("h1", { className: "text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight", children: "Donor Photo Proof & Order Verification" }),
          /* @__PURE__ */ jsxs("p", { className: "text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed", children: [
            "Verify required details uploaded by donors with photo proofs. Confirming an order converts ",
            /* @__PURE__ */ jsx("strong", { className: "text-amber-700 font-semibold", children: '"Pending Request"' }),
            " into ",
            /* @__PURE__ */ jsx("strong", { className: "text-emerald-700 font-semibold", children: '"Confirmed"' }),
            " and dispatches an instant push notification to the donor."
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3 bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-200 shrink-0", children: [
          /* @__PURE__ */ jsx("div", { className: "p-3 rounded-xl bg-amber-100 text-amber-700", children: /* @__PURE__ */ jsx(Clock, { className: "w-6 h-6 animate-pulse" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-black text-amber-700", children: pendingCount }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-600 font-medium", children: "Pending Verifications" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-200", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-2xl bg-slate-50 border border-slate-200", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 font-medium", children: "Pending Requests" }),
          /* @__PURE__ */ jsx("p", { className: "text-xl font-extrabold text-amber-700 mt-1", children: pendingCount })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-2xl bg-slate-50 border border-slate-200", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 font-medium", children: "Confirmed Orders" }),
          /* @__PURE__ */ jsx("p", { className: "text-xl font-extrabold text-emerald-700 mt-1", children: confirmedCount })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-2xl bg-slate-50 border border-slate-200", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 font-medium", children: "Rejected Orders" }),
          /* @__PURE__ */ jsx("p", { className: "text-xl font-extrabold text-rose-700 mt-1", children: rejectedCount })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-2xl bg-slate-50 border border-slate-200", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 font-medium", children: "Total Servings Rescued" }),
          /* @__PURE__ */ jsxs("p", { className: "text-xl font-extrabold text-teal-700 mt-1", children: [
            totalServings,
            " Servings"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 w-full sm:w-auto overflow-x-auto", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setFilterStatus("Pending Request"),
            className: `px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 cursor-pointer ${filterStatus === "Pending Request" ? "bg-amber-500 text-slate-950 shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-white/60"}`,
            children: [
              /* @__PURE__ */ jsx("span", { children: "Pending Requests" }),
              pendingCount > 0 && /* @__PURE__ */ jsx("span", { className: "px-1.5 py-0.2 text-[10px] bg-slate-950 text-amber-400 rounded-full font-bold", children: pendingCount })
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setFilterStatus("Confirmed"),
            className: `px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 cursor-pointer ${filterStatus === "Confirmed" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-white/60"}`,
            children: /* @__PURE__ */ jsxs("span", { children: [
              "Confirmed (",
              confirmedCount,
              ")"
            ] })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setFilterStatus("Rejected"),
            className: `px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${filterStatus === "Rejected" ? "bg-rose-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-white/60"}`,
            children: /* @__PURE__ */ jsxs("span", { children: [
              "Rejected (",
              rejectedCount,
              ")"
            ] })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setFilterStatus("ALL"),
            className: `px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${filterStatus === "ALL" ? "bg-slate-800 text-white shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-white/60"}`,
            children: /* @__PURE__ */ jsx("span", { children: "All Listings" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "relative w-full sm:w-72", children: [
        /* @__PURE__ */ jsx(Search, { className: "w-4 h-4 text-slate-400 absolute left-3 top-3" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value),
            placeholder: "Search donor name, city, food...",
            className: "w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-amber-600 placeholder:text-slate-400 transition-colors"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "space-y-6", children: filteredDonations.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 space-y-3 shadow-xs", children: [
      /* @__PURE__ */ jsx(ShieldCheck, { className: "w-12 h-12 text-slate-400 mx-auto" }),
      /* @__PURE__ */ jsx("h3", { className: "text-base font-bold text-slate-900", children: "No Verification Requests Found" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs max-w-sm mx-auto", children: filterStatus === "Pending Request" ? "Great job! All pending donor food listings have been verified." : "No food listings match your selected search or status filter." })
    ] }) : filteredDonations.map((item) => /* @__PURE__ */ jsx(
      motion.div,
      {
        layout: true,
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        className: `bg-white border rounded-3xl p-6 shadow-xs hover:shadow-md transition-all ${item.status === "Confirmed" ? "border-emerald-300 shadow-emerald-500/5" : item.status === "Rejected" ? "border-rose-300 shadow-rose-500/5" : "border-amber-300 shadow-amber-500/5 ring-1 ring-amber-400/30"}`,
        children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-6 items-start", children: [
          /* @__PURE__ */ jsx("div", { className: "lg:col-span-4 space-y-3", children: /* @__PURE__ */ jsxs("div", { className: "relative h-56 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group", children: [
            /* @__PURE__ */ jsx(
              "img",
              {
                src: item.photoProofUrl,
                alt: `Photo proof for ${item.foodTitle}`,
                referrerPolicy: "no-referrer",
                className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "absolute top-3 left-3", children: /* @__PURE__ */ jsx("span", { className: "px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/95 text-amber-800 border border-amber-200 shadow-xs", children: "Mandatory Proof Photo" }) }),
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => onInspectProof(item),
                className: "absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-white/95 hover:bg-white text-slate-800 text-xs font-semibold border border-slate-200 flex items-center space-x-1 shadow-md cursor-pointer transition-colors",
                children: [
                  /* @__PURE__ */ jsx(Eye, { className: "w-3.5 h-3.5 text-emerald-600" }),
                  /* @__PURE__ */ jsx("span", { children: "Inspect High-Res" })
                ]
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "lg:col-span-5 space-y-4", children: [
            /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
              /* @__PURE__ */ jsx(Building2, { className: "w-4 h-4 text-emerald-600" }),
              /* @__PURE__ */ jsx("h3", { className: "text-base font-extrabold text-slate-900", children: item.donorName }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200", children: item.venueType })
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center text-slate-700", children: [
                /* @__PURE__ */ jsx(User, { className: "w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" }),
                /* @__PURE__ */ jsx("span", { className: "text-slate-500 mr-1", children: "Contact:" }),
                /* @__PURE__ */ jsx("strong", { className: "text-slate-900", children: item.contactPerson })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center text-slate-700", children: [
                /* @__PURE__ */ jsx(Phone, { className: "w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" }),
                /* @__PURE__ */ jsx("a", { href: `tel:${item.contactPhone}`, className: "text-emerald-700 font-semibold hover:underline", children: item.contactPhone })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2 flex items-start text-slate-700", children: [
                /* @__PURE__ */ jsx(MapPin, { className: "w-3.5 h-3.5 text-slate-400 mr-1.5 mt-0.5 shrink-0" }),
                /* @__PURE__ */ jsxs("span", { className: "text-slate-700", children: [
                  item.address,
                  ", ",
                  item.city,
                  " (",
                  item.pincode,
                  ")"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxs("h4", { className: "text-sm font-bold text-slate-900 flex items-center", children: [
                /* @__PURE__ */ jsx(PackageCheck, { className: "w-4 h-4 text-emerald-600 mr-1.5" }),
                item.foodTitle
              ] }),
              item.detailedFoodItems && /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1", children: [
                /* @__PURE__ */ jsx("p", { className: "text-[10px] uppercase font-bold text-emerald-700 tracking-wider", children: "In-Detail Food & Quantity Breakdown:" }),
                /* @__PURE__ */ jsx("p", { className: "whitespace-pre-line text-xs font-mono text-slate-800 leading-relaxed", children: item.detailedFoodItems })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2 text-xs pt-1", children: [
                /* @__PURE__ */ jsxs("span", { className: "px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 font-semibold", children: [
                  "\u{1F371} ",
                  item.quantityServings,
                  " Servings (",
                  item.quantityKg,
                  " kg)"
                ] }),
                item.numberOfContainers && /* @__PURE__ */ jsxs("span", { className: "px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-semibold", children: [
                  "\u{1F4E6} ",
                  item.numberOfContainers,
                  " Containers (",
                  item.containerType || item.packagingType,
                  ")"
                ] }),
                /* @__PURE__ */ jsx("span", { className: "px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold", children: item.dietType })
              ] }),
              item.specialNotes && /* @__PURE__ */ jsxs("p", { className: "text-xs text-slate-500 italic pt-1", children: [
                '"',
                item.specialNotes,
                '"'
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-slate-400 flex items-center space-x-3", children: [
              /* @__PURE__ */ jsxs("span", { className: "flex items-center", children: [
                /* @__PURE__ */ jsx(Calendar, { className: "w-3 h-3 mr-1" }),
                "Submitted: ",
                new Date(item.submittedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              ] }),
              /* @__PURE__ */ jsx("span", { children: "\u2022" }),
              /* @__PURE__ */ jsxs("span", { children: [
                "Order ID: #",
                item.id
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "lg:col-span-3 bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "text-[10px] uppercase tracking-wider font-bold text-slate-500 block mb-1", children: "Current Order Status" }),
              /* @__PURE__ */ jsxs(
                "div",
                {
                  className: `w-full py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider text-center border flex items-center justify-center space-x-2 transition-all ${item.status === "Confirmed" ? "bg-emerald-100 text-emerald-800 border-emerald-300 shadow-xs" : item.status === "Rejected" ? "bg-rose-100 text-rose-800 border-rose-300" : "bg-amber-100 text-amber-800 border-amber-300 animate-pulse"}`,
                  children: [
                    item.status === "Pending Request" && /* @__PURE__ */ jsx(Clock, { className: "w-4 h-4 animate-spin" }),
                    item.status === "Confirmed" && /* @__PURE__ */ jsx(CheckCircle2, { className: "w-4 h-4" }),
                    item.status === "Rejected" && /* @__PURE__ */ jsx(XCircle, { className: "w-4 h-4" }),
                    /* @__PURE__ */ jsx("span", { children: item.status })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2 pt-2", children: [
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => handleConfirmOrder(item),
                  disabled: actionInProgressId === item.id || item.status === "Confirmed",
                  className: `w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow-xs transition-all cursor-pointer ${item.status === "Confirmed" ? "bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300" : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"}`,
                  children: [
                    /* @__PURE__ */ jsx(CheckCircle2, { className: "w-4 h-4" }),
                    /* @__PURE__ */ jsx("span", { children: item.status === "Confirmed" ? "Order Confirmed \u2713" : "Confirm Order" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => setRejectionModalDonation(item),
                  disabled: actionInProgressId === item.id || item.status === "Rejected",
                  className: `w-full py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${item.status === "Rejected" ? "bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300" : "bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 shadow-xs"}`,
                  children: [
                    /* @__PURE__ */ jsx(XCircle, { className: "w-4 h-4" }),
                    /* @__PURE__ */ jsx("span", { children: item.status === "Rejected" ? "Order Rejected" : "Reject Order" })
                  ]
                }
              )
            ] }),
            item.statusReason && /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-slate-600 border-t border-slate-200 pt-2 line-clamp-2", children: [
              /* @__PURE__ */ jsx("strong", { className: "text-slate-800", children: "Note:" }),
              " ",
              item.statusReason
            ] })
          ] })
        ] })
      },
      item.id
    )) }),
    /* @__PURE__ */ jsx(AnimatePresence, { children: rejectionModalDonation && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md", children: /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
        className: "w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3 text-rose-600", children: [
            /* @__PURE__ */ jsx("div", { className: "p-2.5 rounded-xl bg-rose-50 border border-rose-200", children: /* @__PURE__ */ jsx(XCircle, { className: "w-6 h-6" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h3", { className: "font-bold text-base text-slate-900", children: "Reject Order Request" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500", children: rejectionModalDonation.donorName })
            ] })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-600 leading-relaxed", children: "Please provide a rejection reason. The donor will receive an instant push notification explaining why their order request was rejected." }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs font-semibold text-slate-700 mb-1.5", children: "Rejection Reason / Feedback *" }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                rows: 3,
                value: rejectionReasonInput,
                onChange: (e) => setRejectionReasonInput(e.target.value),
                placeholder: "e.g. Photo proof is too blurry to verify packaging integrity. Please re-upload a clear photo.",
                className: "w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-rose-500 transition-colors placeholder:text-slate-400"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end space-x-3 pt-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setRejectionModalDonation(null),
                className: "px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer",
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: handleConfirmRejection,
                className: "px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 cursor-pointer",
                children: "Confirm Rejection & Notify Donor"
              }
            )
          ] })
        ]
      }
    ) }) })
  ] });
};
export {
  AdminDashboard
};
