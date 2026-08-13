import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { DonorPortal } from "./components/DonorPortal";
import { AdminDashboard } from "./components/AdminDashboard";
import { PushNotificationToast } from "./components/PushNotificationToast";
import { PhotoProofModal } from "./components/PhotoProofModal";
import { playNotificationSound } from "./lib/sound";
function App({ forcedRole }) {
  const [currentRole, setCurrentRole] = useState(forcedRole || "admin");
  const [donations, setDonations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeToastNotif, setActiveToastNotif] = useState(null);
  const [selectedProofDonation, setSelectedProofDonation] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fetchDonations = async () => {
    try {
      const res = await fetch("/api/donations");
      if (res.ok) {
        const data = await res.json();
        setDonations(data);
      }
    } catch (e) {
      console.error("Failed to fetch food donations:", e);
    }
  };
  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      console.error("Failed to fetch notifications:", e);
    }
  };
  useEffect(() => {
    fetchDonations();
    fetchNotifications();
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
    const eventSource = new EventSource("/api/events");
    eventSource.onopen = () => {
      setIsConnected(true);
    };
    eventSource.onerror = () => {
      setIsConnected(false);
    };
    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        if (parsed.type === "DONATION_CREATED") {
          const { donation, notification } = parsed.payload;
          setDonations((prev) => [donation, ...prev.filter((d) => d.id !== donation.id)]);
          if (notification) {
            setNotifications((prev) => [notification, ...prev]);
            setActiveToastNotif(notification);
            playNotificationSound("NEW_DONATION");
          }
        } else if (parsed.type === "STATUS_UPDATED") {
          const { donation, notification } = parsed.payload;
          setDonations((prev) => prev.map((d) => d.id === donation.id ? donation : d));
          if (notification) {
            setNotifications((prev) => [notification, ...prev]);
            setActiveToastNotif(notification);
            playNotificationSound(notification.type);
          }
        }
      } catch (err) {
        console.error("SSE Message error:", err);
      }
    };
    return () => {
      eventSource.close();
    };
  }, []);
  const handleSubmitDonation = async (newDonationPartial) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDonationPartial)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.donation) {
          setDonations((prev) => [data.donation, ...prev.filter((d) => d.id !== data.donation.id)]);
        }
      }
    } catch (err) {
      console.error("Error posting surplus donation:", err);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleUpdateStatus = async (donationId, status, reason) => {
    try {
      const res = await fetch(`/api/donations/${donationId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, statusReason: reason })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.donation) {
          setDonations((prev) => prev.map((d) => d.id === donationId ? data.donation : d));
          if (selectedProofDonation && selectedProofDonation.id === donationId) {
            setSelectedProofDonation(data.donation);
          }
        }
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };
  const handleMarkNotificationsRead = async () => {
    try {
      await fetch("/api/notifications/mark-read", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {
      console.error("Failed marking read:", e);
    }
  };
  const handleQuickAddPreset = async () => {
    const venues = [
      { name: "Hotel Taj Mahal Banquet", type: "Hotel", title: "Excess Grand Dinner Buffet", items: "\u2022 Shahi Paneer (12 kg)\n\u2022 Dal Makhani (15 kg)\n\u2022 Jeera Rice (18 kg)\n\u2022 Naan (100 pcs)", servings: 150, image: "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=800&auto=format&fit=crop" },
      { name: "Shahi Wedding Pavilion", type: "Wedding Venue", title: "Surplus Marriage Feast Trays", items: "\u2022 Mutton Biryani (25 kg)\n\u2022 Chicken Gravy (20 kg)\n\u2022 Rumali Roti (200 pcs)\n\u2022 Gulab Jamun (150 pcs)", servings: 210, image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=800&auto=format&fit=crop" },
      { name: "Oberoi Bakers & Sweets", type: "Bakery & Cafe", title: "Evening Pastries & Artisan Loaves", items: "\u2022 Sourdough Bread (20 loaves)\n\u2022 Croissants (40 pcs)\n\u2022 Fruit Tarts (30 pcs)", servings: 80, image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop" }
    ];
    const chosen = venues[Math.floor(Math.random() * venues.length)];
    await handleSubmitDonation({
      donorName: chosen.name,
      venueType: chosen.type,
      contactPerson: "Manager Malhotra",
      contactPhone: "+91 98989 12345",
      address: "Central Avenue, Sector 18",
      city: "Delhi NCR",
      foodTitle: chosen.title,
      foodCategory: "Cooked Meals",
      detailedFoodItems: chosen.items,
      quantityServings: chosen.servings,
      quantityKg: Math.round(chosen.servings * 0.3),
      numberOfContainers: 4,
      containerType: "Food Grade Insulated Containers",
      cookedTime: (/* @__PURE__ */ new Date()).toISOString(),
      estimatedExpiryHours: 5,
      dietType: "Vegetarian",
      packagingType: "Sealed Thermal Containers",
      photoProofUrl: chosen.image,
      specialNotes: "Freshly prepared surplus. Fully packaged with photo proof."
    });
  };
  const pendingCount = donations.filter((d) => d.status === "Pending Request").length;
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900", children: [
    /* @__PURE__ */ jsx(
      Header,
      {
        currentRole,
        onRoleChange: setCurrentRole,
        pendingCount,
        notifications,
        onMarkRead: handleMarkNotificationsRead,
        isConnected,
        onQuickAddPreset: handleQuickAddPreset,
        forcedRole,
        onSelectDonation: (id) => {
          const item = donations.find((d) => d.id === id);
          if (item) setSelectedProofDonation(item);
        }
      }
    ),
    /* @__PURE__ */ jsxs("main", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [
      currentRole === "donor" && /* @__PURE__ */ jsx(
        DonorPortal,
        {
          donations,
          onSubmitDonation: handleSubmitDonation,
          onInspectProof: (item) => setSelectedProofDonation(item),
          isSubmitting
        }
      ),
      currentRole === "admin" && /* @__PURE__ */ jsx(
        AdminDashboard,
        {
          donations,
          onUpdateStatus: handleUpdateStatus,
          onInspectProof: (item) => setSelectedProofDonation(item)
        }
      )
    ] }),
    /* @__PURE__ */ jsx(
      PhotoProofModal,
      {
        donation: selectedProofDonation,
        onClose: () => setSelectedProofDonation(null)
      }
    ),
    /* @__PURE__ */ jsx(
      PushNotificationToast,
      {
        activeNotification: activeToastNotif,
        onDismiss: () => setActiveToastNotif(null),
        onSelectDonation: (id) => {
          const item = donations.find((d) => d.id === id);
          if (item) setSelectedProofDonation(item);
        }
      }
    ),
    /* @__PURE__ */ jsx("footer", { className: "border-t border-slate-200 bg-white/90 py-8 text-center text-xs text-slate-500", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsx("p", { children: "\xA9 2026 NourishRelief \u2014 Real-Time Surplus Food Donation & Verification Platform" }),
      !forcedRole && /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-4", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => setCurrentRole("donor"), className: "text-slate-600 hover:text-emerald-600 font-medium transition-colors", children: "Donor Portal" }),
        /* @__PURE__ */ jsx("button", { onClick: () => setCurrentRole("admin"), className: "text-slate-600 hover:text-amber-600 font-medium transition-colors", children: "Admin Page" })
      ] })
    ] }) })
  ] });
}
export {
  App as default
};
