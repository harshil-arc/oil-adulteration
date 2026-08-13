import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import { Header } from "./components/Header";
import { DonorPortal } from "./components/DonorPortal";
import { AdminDashboard } from "./components/AdminDashboard";
import { PushNotificationToast } from "./components/PushNotificationToast";
import { PhotoProofModal } from "./components/PhotoProofModal";
import { playNotificationSound } from "./lib/sound";
import { INITIAL_DONATIONS, INITIAL_NOTIFICATIONS } from "./data/mockDonations";
import { supabase } from "../lib/supabase";

function App({ forcedRole }) {
  const [currentRole, setCurrentRole] = useState(forcedRole || "admin");

  // Initialize donations from LocalStorage -> fallback to INITIAL_DONATIONS
  const [donations, setDonations] = useState(() => {
    try {
      const saved = localStorage.getItem("nourish_donations");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Error reading local donations:", e);
    }
    return INITIAL_DONATIONS;
  });

  // Initialize notifications from LocalStorage -> fallback to INITIAL_NOTIFICATIONS
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem("nourish_notifications");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn("Error reading local notifications:", e);
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [activeToastNotif, setActiveToastNotif] = useState(null);
  const [selectedProofDonation, setSelectedProofDonation] = useState(null);
  const [isConnected, setIsConnected] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const broadcastChannelRef = useRef(null);

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem("nourish_donations", JSON.stringify(donations));
    } catch (e) {}
  }, [donations]);

  useEffect(() => {
    try {
      localStorage.setItem("nourish_notifications", JSON.stringify(notifications));
    } catch (e) {}
  }, [notifications]);

  // Load from database / API on mount & set up BroadcastChannel & Firestore
  useEffect(() => {
    let isMounted = true;

    // 1. Setup BroadcastChannel for instant cross-tab / cross-window sync
    if ("BroadcastChannel" in window) {
      const bc = new BroadcastChannel("nourish_relief_sync");
      broadcastChannelRef.current = bc;
      bc.onmessage = (event) => {
        if (!isMounted) return;
        const { type, payload } = event.data || {};
        if (type === "DONATION_CREATED" && payload) {
          const { donation, notification } = payload;
          setDonations((prev) => [donation, ...prev.filter((d) => d.id !== donation.id)]);
          if (notification) {
            setNotifications((prev) => [notification, ...prev]);
            setActiveToastNotif(notification);
            try { playNotificationSound("NEW_DONATION"); } catch (_) {}
          }
        } else if (type === "STATUS_UPDATED" && payload) {
          const { donation, notification } = payload;
          setDonations((prev) => prev.map((d) => (d.id === donation.id ? donation : d)));
          if (notification) {
            setNotifications((prev) => [notification, ...prev]);
            setActiveToastNotif(notification);
            try { playNotificationSound(notification.type || "CONFIRMED"); } catch (_) {}
          }
        }
      };
    }

    // 2. Fetch from Firestore database if available
    const syncFromDatabase = async () => {
      try {
        const { data: dbDonations, error } = await supabase
          .from("food_donations")
          .select("*")
          .order("submittedAt", { ascending: false });

        if (!error && Array.isArray(dbDonations) && dbDonations.length > 0 && isMounted) {
          setDonations((prev) => {
            const combined = [...dbDonations];
            // keep local items not in db yet
            prev.forEach((p) => {
              if (!combined.some((c) => c.id === p.id)) combined.push(p);
            });
            return combined;
          });
        }
      } catch (err) {
        console.warn("[NourishRelief] Firestore fetch notice:", err);
      }
    };

    // 3. Try API endpoint if available (local dev)
    const fetchApiData = async () => {
      try {
        const res = await fetch("/api/donations");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0 && isMounted) {
            setDonations(data);
          }
        }
      } catch (_) {}
    };

    syncFromDatabase();
    fetchApiData();

    // 4. Request browser notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    // 5. Connect SSE if backend API server is available
    let eventSource = null;
    try {
      eventSource = new EventSource("/api/events");
      eventSource.onopen = () => setIsConnected(true);
      eventSource.onerror = () => setIsConnected(true); // Fallback to database mode
      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.type === "DONATION_CREATED") {
            const { donation, notification } = parsed.payload;
            setDonations((prev) => [donation, ...prev.filter((d) => d.id !== donation.id)]);
            if (notification) {
              setNotifications((prev) => [notification, ...prev]);
              setActiveToastNotif(notification);
              try { playNotificationSound("NEW_DONATION"); } catch (_) {}
            }
          } else if (parsed.type === "STATUS_UPDATED") {
            const { donation, notification } = parsed.payload;
            setDonations((prev) => prev.map((d) => (d.id === donation.id ? donation : d)));
            if (notification) {
              setNotifications((prev) => [notification, ...prev]);
              setActiveToastNotif(notification);
              try { playNotificationSound(notification.type); } catch (_) {}
            }
          }
        } catch (err) {}
      };
    } catch (_) {
      setIsConnected(true);
    }

    return () => {
      isMounted = false;
      if (broadcastChannelRef.current) broadcastChannelRef.current.close();
      if (eventSource) eventSource.close();
    };
  }, []);

  // Submit new food donation from Donor Portal
  const handleSubmitDonation = async (newDonationPartial) => {
    setIsSubmitting(true);
    try {
      const donationId = `don-${Date.now()}`;
      const nowIso = new Date().toISOString();

      const newDonation = {
        id: donationId,
        submittedAt: nowIso,
        updatedAt: nowIso,
        status: "Pending Request",
        ...newDonationPartial
      };

      const newNotification = {
        id: `notif-${Date.now()}`,
        donationId: donationId,
        donorName: newDonation.donorName || "Surplus Donor",
        title: "New Surplus Request Submitted 🍲",
        message: `Surplus food listing "${newDonation.foodTitle}" has been posted and is awaiting Admin verification.`,
        type: "NEW_DONATION",
        timestamp: nowIso,
        read: false
      };

      // Update Local State
      setDonations((prev) => [newDonation, ...prev.filter((d) => d.id !== donationId)]);
      setNotifications((prev) => [newNotification, ...prev]);
      setActiveToastNotif(newNotification);
      try { playNotificationSound("NEW_DONATION"); } catch (_) {}

      // Broadcast to other open tabs/windows (e.g. Admin Tab)
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage({
          type: "DONATION_CREATED",
          payload: { donation: newDonation, notification: newNotification }
        });
      }

      // Save to Firestore Database
      try {
        await supabase.from("food_donations").insert(newDonation);
      } catch (err) {
        console.warn("[NourishRelief] Firestore insert notice:", err);
      }

      // Try Backend API if available
      try {
        await fetch("/api/donations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newDonation)
        });
      } catch (_) {}

    } catch (err) {
      console.error("Error posting surplus donation:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update status (Admin accepts or rejects request)
  const handleUpdateStatus = async (donationId, status, reason) => {
    try {
      const nowIso = new Date().toISOString();
      const existing = donations.find((d) => d.id === donationId);

      const updatedDonation = {
        ...(existing || {}),
        id: donationId,
        status: status,
        statusReason: reason || (status === "Confirmed" ? "Verified by Admin with photo proof." : "Request declined by Admin."),
        updatedAt: nowIso
      };

      const notificationType = status === "Confirmed" ? "CONFIRMED" : "REJECTED";
      const newNotification = {
        id: `notif-${Date.now()}`,
        donationId: donationId,
        donorName: updatedDonation.donorName || "Surplus Donor",
        title: status === "Confirmed" ? "Order Verified & Confirmed! 🎉" : "Order Status Updated ⚠️",
        message: status === "Confirmed"
          ? `Your surplus food listing "${updatedDonation.foodTitle || "Food Request"}" has been verified and CONFIRMED by Admin.`
          : `Your surplus food listing "${updatedDonation.foodTitle || "Food Request"}" status changed to ${status}. Reason: ${updatedDonation.statusReason}`,
        type: notificationType,
        timestamp: nowIso,
        read: false
      };

      // Update Local State
      setDonations((prev) => prev.map((d) => (d.id === donationId ? updatedDonation : d)));
      setNotifications((prev) => [newNotification, ...prev]);
      setActiveToastNotif(newNotification);
      try { playNotificationSound(notificationType); } catch (_) {}

      if (selectedProofDonation && selectedProofDonation.id === donationId) {
        setSelectedProofDonation(updatedDonation);
      }

      // Broadcast to other open tabs/windows (e.g. Donor Tab)
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage({
          type: "STATUS_UPDATED",
          payload: { donation: updatedDonation, notification: newNotification }
        });
      }

      // Update Firestore Database
      try {
        await supabase
          .from("food_donations")
          .eq("id", donationId)
          .update({ status: status, statusReason: updatedDonation.statusReason, updatedAt: nowIso });
      } catch (err) {
        console.warn("[NourishRelief] Firestore status update notice:", err);
      }

      // Try Backend API if available
      try {
        await fetch(`/api/donations/${donationId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status, statusReason: reason })
        });
      } catch (_) {}

    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleMarkNotificationsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await fetch("/api/notifications/mark-read", { method: "POST" });
    } catch (_) {}
  };

  const handleQuickAddPreset = async () => {
    const venues = [
      { name: "Hotel Taj Mahal Banquet", type: "Hotel", title: "Excess Grand Dinner Buffet", items: "• Shahi Paneer (12 kg)\n• Dal Makhani (15 kg)\n• Jeera Rice (18 kg)\n• Naan (100 pcs)", servings: 150, image: "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=800&auto=format&fit=crop" },
      { name: "Shahi Wedding Pavilion", type: "Wedding Venue", title: "Surplus Marriage Feast Trays", items: "• Mutton Biryani (25 kg)\n• Chicken Gravy (20 kg)\n• Rumali Roti (200 pcs)\n• Gulab Jamun (150 pcs)", servings: 210, image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=800&auto=format&fit=crop" },
      { name: "Oberoi Bakers & Sweets", type: "Bakery & Cafe", title: "Evening Pastries & Artisan Loaves", items: "• Sourdough Bread (20 loaves)\n• Croissants (40 pcs)\n• Fruit Tarts (30 pcs)", servings: 80, image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop" }
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
      cookedTime: new Date().toISOString(),
      estimatedExpiryHours: 5,
      dietType: "Vegetarian",
      packagingType: "Sealed Thermal Containers",
      photoProofUrl: chosen.image,
      specialNotes: "Freshly prepared surplus. Fully packaged with photo proof."
    });
  };

  const pendingCount = donations.filter((d) => d.status === "Pending Request").length;

  return jsxs("div", {
    className: "min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900",
    children: [
      jsx(Header, {
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
      }),
      jsxs("main", {
        className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8",
        children: [
          currentRole === "donor" &&
            jsx(DonorPortal, {
              donations,
              onSubmitDonation: handleSubmitDonation,
              onInspectProof: (item) => setSelectedProofDonation(item),
              isSubmitting
            }),
          currentRole === "admin" &&
            jsx(AdminDashboard, {
              donations,
              onUpdateStatus: handleUpdateStatus,
              onInspectProof: (item) => setSelectedProofDonation(item)
            })
        ]
      }),
      jsx(PhotoProofModal, {
        donation: selectedProofDonation,
        onClose: () => setSelectedProofDonation(null)
      }),
      jsx(PushNotificationToast, {
        activeNotification: activeToastNotif,
        onDismiss: () => setActiveToastNotif(null),
        onSelectDonation: (id) => {
          const item = donations.find((d) => d.id === id);
          if (item) setSelectedProofDonation(item);
        }
      }),
      jsx("footer", {
        className: "border-t border-slate-200 bg-white/90 py-8 text-center text-xs text-slate-500",
        children: jsxs("div", {
          className: "max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4",
          children: [
            jsx("p", {
              children: "© 2026 NourishRelief — Real-Time Surplus Food Donation & Verification Platform"
            }),
            !forcedRole &&
              jsxs("div", {
                className: "flex items-center space-x-4",
                children: [
                  jsx("button", {
                    onClick: () => setCurrentRole("donor"),
                    className: "text-slate-600 hover:text-emerald-600 font-medium transition-colors",
                    children: "Donor Portal"
                  }),
                  jsx("button", {
                    onClick: () => setCurrentRole("admin"),
                    className: "text-slate-600 hover:text-amber-600 font-medium transition-colors",
                    children: "Admin Page"
                  })
                ]
              })
          ]
        })
      })
    ]
  });
}

export default App;
