import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import { collection, onSnapshot, query, orderBy, doc, deleteDoc } from "firebase/firestore";
import { Header } from "./components/Header";
import { DonorPortal } from "./components/DonorPortal";
import { AdminDashboard } from "./components/AdminDashboard";
import { PushNotificationToast } from "./components/PushNotificationToast";
import { PhotoProofModal } from "./components/PhotoProofModal";
import { playNotificationSound } from "./lib/sound";
import { INITIAL_DONATIONS, INITIAL_NOTIFICATIONS } from "./data/mockDonations";
import { db, supabase } from "../lib/supabase";

const MOCK_DONATION_IDS = new Set(["don-101", "don-102", "don-103", "don-104"]);

function App({ forcedRole, onBack }) {
  const [currentRole, setCurrentRole] = useState(forcedRole || "admin");

  // State for food donations
  const [donations, setDonations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeToastNotif, setActiveToastNotif] = useState(null);
  const [selectedProofDonation, setSelectedProofDonation] = useState(null);
  const [isConnected, setIsConnected] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const broadcastChannelRef = useRef(null);
  const initialSyncDone = useRef(false);

  // 1. Subscribe to Firestore 'food_donations' in REAL-TIME
  useEffect(() => {
    let unsubscribeFirestore = null;

    // Remove legacy cached mock donations from localStorage
    try {
      localStorage.removeItem("nourish_donations");
    } catch (_) {}

    try {
      if (db) {
        // Purge default mock items if present in Firestore
        ["don-101", "don-102", "don-103", "don-104"].forEach(async (mockId) => {
          try { await deleteDoc(doc(db, "food_donations", mockId)); } catch (_) {}
          try { await deleteDoc(doc(db, "nourish_donations", mockId)); } catch (_) {}
        });

        const donationsQuery = query(collection(db, "food_donations"));
        unsubscribeFirestore = onSnapshot(
          donationsQuery,
          (snapshot) => {
            const liveDonations = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data();
              const isMock = MOCK_DONATION_IDS.has(docSnap.id) ||
                data.foodTitle?.includes("Wedding Reception Dinner Buffet") ||
                data.foodTitle?.includes("Excess Biryani & Curry Servings") ||
                data.foodTitle?.includes("Fresh Whole Wheat Bread, Buns & Muffins") ||
                data.donorName === "Grand Regency Banquet & Hotel" ||
                data.donorName === "The Spice Route Fine Dining" ||
                data.donorName === "Crown Bakery & Patisserie";

              if (!isMock) {
                liveDonations.push({ id: docSnap.id, ...data });
              } else {
                try { deleteDoc(doc(db, "food_donations", docSnap.id)).catch(() => {}); } catch (_) {}
              }
            });

            // Sort by submittedAt descending
            liveDonations.sort((a, b) => new Date(b.submittedAt || b.cookedTime || 0) - new Date(a.submittedAt || a.cookedTime || 0));

            setDonations(liveDonations);
            try {
              localStorage.setItem("nourish_donations", JSON.stringify(liveDonations));
            } catch (_) {}
            setIsConnected(true);
          },
          (err) => {
            console.warn("[NourishRelief] Firestore real-time snapshot notice:", err);
          }
        );
      }
    } catch (err) {
      console.warn("[NourishRelief] Firestore snapshot init notice:", err);
    }

    // 2. Setup BroadcastChannel for instant cross-tab / cross-window sync
    if ("BroadcastChannel" in window) {
      const bc = new BroadcastChannel("nourish_relief_sync");
      broadcastChannelRef.current = bc;
      bc.onmessage = (event) => {
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
        } else if (type === "DONATION_DELETED" && payload) {
          setDonations((prev) => prev.filter((d) => d.id !== payload.donationId));
        } else if (type === "ALL_DONATIONS_CLEARED") {
          setDonations([]);
        }
      };
    }

    // 3. Request browser notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    return () => {
      if (unsubscribeFirestore) unsubscribeFirestore();
      if (broadcastChannelRef.current) broadcastChannelRef.current.close();
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

      // 1. Optimistic Local State Update
      setDonations((prev) => [newDonation, ...prev.filter((d) => d.id !== donationId)]);
      setNotifications((prev) => [newNotification, ...prev]);
      setActiveToastNotif(newNotification);
      try { playNotificationSound("NEW_DONATION"); } catch (_) {}

      // 2. Broadcast to other open tabs/windows
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage({
          type: "DONATION_CREATED",
          payload: { donation: newDonation, notification: newNotification }
        });
      }

      // 3. WRITE DIRECTLY TO FIRESTORE DATABASE (Real-time sync to Admin)
      try {
        await supabase.from("food_donations").insert(newDonation);
      } catch (err) {
        console.warn("[NourishRelief] Firestore database insert error:", err);
      }

      // 4. Try Express API backend if local server running
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

      // 1. Optimistic Local State Update
      setDonations((prev) => prev.map((d) => (d.id === donationId ? updatedDonation : d)));
      setNotifications((prev) => [newNotification, ...prev]);
      setActiveToastNotif(newNotification);
      try { playNotificationSound(notificationType); } catch (_) {}

      if (selectedProofDonation && selectedProofDonation.id === donationId) {
        setSelectedProofDonation(updatedDonation);
      }

      // 2. Broadcast to other open tabs/windows
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage({
          type: "STATUS_UPDATED",
          payload: { donation: updatedDonation, notification: newNotification }
        });
      }

      // 3. UPDATE FIRESTORE DATABASE IN REAL-TIME
      try {
        await supabase
          .from("food_donations")
          .eq("id", donationId)
          .update({ status: status, statusReason: updatedDonation.statusReason, updatedAt: nowIso });
      } catch (err) {
        console.warn("[NourishRelief] Firestore database update error:", err);
      }

      // 4. Try Express API backend if local server running
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

  // Delete a single food donation
  const handleDeleteDonation = async (donationId) => {
    setDonations((prev) => prev.filter((d) => d.id !== donationId));
    try {
      const updated = donations.filter((d) => d.id !== donationId);
      localStorage.setItem("nourish_donations", JSON.stringify(updated));
    } catch (_) {}

    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        type: "DONATION_DELETED",
        payload: { donationId }
      });
    }

    try {
      if (db) await deleteDoc(doc(db, "food_donations", donationId));
    } catch (err) {
      console.warn("[NourishRelief] Firestore database delete error:", err);
    }

    try {
      await supabase.from("food_donations").eq("id", donationId).delete();
    } catch (_) {}

    try {
      await fetch(`/api/donations/${donationId}`, { method: "DELETE" });
    } catch (_) {}
  };

  // Clear all food donations
  const handleClearAllDonations = async () => {
    const ids = donations.map((d) => d.id);
    setDonations([]);
    try {
      localStorage.removeItem("nourish_donations");
    } catch (_) {}

    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        type: "ALL_DONATIONS_CLEARED"
      });
    }

    for (const id of ids) {
      try {
        if (db) await deleteDoc(doc(db, "food_donations", id));
      } catch (_) {}
    }
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
        forcedRole,
        onBack,
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
              onDeleteDonation: handleDeleteDonation,
              onClearAllDonations: handleClearAllDonations,
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
