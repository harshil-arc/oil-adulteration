import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import {
  Building2,
  Utensils,
  Upload,
  Clock,
  MapPin,
  Phone,
  User,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Camera,
  Eye,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";
const DonorPortal = ({
  donations,
  onSubmitDonation,
  onInspectProof,
  isSubmitting = false
}) => {
  const [activeTab, setActiveTab] = useState("create");
  const [donorName, setDonorName] = useState("Taj Palace Catering & Banquets");
  const [venueType, setVenueType] = useState("Wedding Venue");
  const [contactPerson, setContactPerson] = useState("Rajesh Malhotra");
  const [contactPhone, setContactPhone] = useState("+91 98765 12345");
  const [email, setEmail] = useState("events@tajpalacebanquets.com");
  const [address, setAddress] = useState("Plot 42, Green Park Main, Opp Metro Station");
  const [city, setCity] = useState("New Delhi");
  const [pincode, setPincode] = useState("110016");
  const [foodTitle, setFoodTitle] = useState("Surplus Wedding Feast Dinner");
  const [foodCategory, setFoodCategory] = useState("Cooked Meals");
  const [detailedFoodItems, setDetailedFoodItems] = useState(
    "\u2022 Paneer Butter Masala (15 kg)\n\u2022 Jeera Basmati Rice (20 kg)\n\u2022 Dal Makhani (12 kg)\n\u2022 Butter Naan & Roti (150 pcs)\n\u2022 Gulab Jamun (100 pcs)"
  );
  const [quantityServings, setQuantityServings] = useState(120);
  const [quantityKg, setQuantityKg] = useState(40);
  const [numberOfContainers, setNumberOfContainers] = useState(5);
  const [containerType, setContainerType] = useState("Insulated Stainless Steel Cans / Foil Trays");
  const [cookedHoursAgo, setCookedHoursAgo] = useState(1.5);
  const [estimatedExpiryHours, setEstimatedExpiryHours] = useState(5);
  const [dietType, setDietType] = useState("Vegetarian");
  const [packagingType, setPackagingType] = useState("Food-Grade Foil Covered Trays");
  const [specialNotes, setSpecialNotes] = useState("Untouched surplus from main dining hall. Maintained hot above 60\xB0C.");
  const [photoProofUrl, setPhotoProofUrl] = useState("");
  const [photoError, setPhotoError] = useState(null);
  const applyPreset = (type) => {
    if (type === "wedding") {
      setDonorName("Royal Pavilion Wedding Hall");
      setVenueType("Wedding Venue");
      setFoodTitle("Surplus Evening Wedding Reception Buffet");
      setFoodCategory("Cooked Meals");
      setDetailedFoodItems("\u2022 Shahi Paneer Gravy (20 kg)\n\u2022 Dum Biryani (25 kg)\n\u2022 Butter Roti & Naan (200 pcs)\n\u2022 Rasgulla (120 pcs)");
      setQuantityServings(200);
      setQuantityKg(65);
      setNumberOfContainers(6);
      setContainerType("Heavy Duty Stainless Steel Insulated Drums");
      setDietType("Vegetarian");
      setPackagingType("Sealed Heavy Duty Stainless Trays");
    } else if (type === "hotel") {
      setDonorName("Radisson Blu Hotel & Dining");
      setVenueType("Hotel");
      setFoodTitle("Fresh Lunch Buffet Surplus (Rice, Curry & Breads)");
      setFoodCategory("Cooked Meals");
      setDetailedFoodItems("\u2022 Butter Chicken (10 kg)\n\u2022 Steamed Basmati Rice (12 kg)\n\u2022 Tandoori Roti (80 pcs)\n\u2022 Green Salad & Raita (5 kg)");
      setQuantityServings(85);
      setQuantityKg(28);
      setNumberOfContainers(4);
      setContainerType("Thermally Insulated Catering Containers");
      setDietType("Non-Vegetarian");
      setPackagingType("Thermally Insulated Catering Containers");
    } else {
      setDonorName("The Daily Loaf Artisanal Bakery");
      setVenueType("Bakery & Cafe");
      setFoodTitle("End-of-Day Fresh Breads, Muffins & Buns");
      setFoodCategory("Bakery & Sweets");
      setDetailedFoodItems("\u2022 Artisanal Sourdough Loaves (15 loaves)\n\u2022 Whole Wheat Buns (30 pcs)\n\u2022 Chocolate Muffins (25 pcs)");
      setQuantityServings(70);
      setQuantityKg(12);
      setNumberOfContainers(3);
      setContainerType("Sanitized Kraft Boxes");
      setDietType("Vegetarian");
      setPackagingType("Sanitized Kraft Boxes");
    }
  };
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError("Please upload a valid image file (JPG, PNG, WEBP)");
      return;
    }
    setPhotoError(null);
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoProofUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!photoProofUrl) {
      setPhotoError("A photo proof is required by admin for verification.");
      return;
    }
    const cookedTimeISO = new Date(Date.now() - cookedHoursAgo * 60 * 60 * 1e3).toISOString();
    await onSubmitDonation({
      donorName,
      venueType,
      contactPerson,
      contactPhone,
      email,
      address,
      city,
      pincode,
      foodTitle,
      foodCategory,
      detailedFoodItems,
      quantityServings,
      quantityKg,
      numberOfContainers,
      containerType,
      cookedTime: cookedTimeISO,
      estimatedExpiryHours,
      dietType,
      packagingType,
      photoProofUrl,
      specialNotes
    });
    setActiveTab("my-listings");
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xs", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-3", children: [
            /* @__PURE__ */ jsx(Building2, { className: "w-3.5 h-3.5" }),
            /* @__PURE__ */ jsx("span", { children: "Donor Portal & Real-time Tracker" })
          ] }),
          /* @__PURE__ */ jsx("h1", { className: "text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight", children: "List Surplus Food & Get Instant Admin Verification" }),
          /* @__PURE__ */ jsxs("p", { className: "text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed", children: [
            "Restaurants, hotels, and wedding venues can post excess meals with photo proof. Once the Admin verifies your details, your order status changes to ",
            /* @__PURE__ */ jsx("strong", { className: "text-emerald-700", children: '"Confirmed"' }),
            " and you receive a real-time push notification!"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shrink-0", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setActiveTab("create"),
              className: `flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${activeTab === "create" ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20" : "text-slate-600 hover:text-slate-900 hover:bg-white/60"}`,
              children: [
                /* @__PURE__ */ jsx(Utensils, { className: "w-4 h-4" }),
                /* @__PURE__ */ jsx("span", { children: "+ List Food" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setActiveTab("my-listings"),
              className: `flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${activeTab === "my-listings" ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20" : "text-slate-600 hover:text-slate-900 hover:bg-white/60"}`,
              children: [
                /* @__PURE__ */ jsx(Clock, { className: "w-4 h-4" }),
                /* @__PURE__ */ jsxs("span", { children: [
                  "My Active Listings (",
                  donations.length,
                  ")"
                ] })
              ]
            }
          )
        ] })
      ] })
    ] }),
    activeTab === "create" ? (
      /* Create Food Donation Form */
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "grid grid-cols-1 lg:grid-cols-12 gap-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-8 shadow-xs", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3", children: [
            /* @__PURE__ */ jsxs("span", { className: "text-xs font-semibold text-slate-700 flex items-center", children: [
              /* @__PURE__ */ jsx(Zap, { className: "w-4 h-4 text-amber-500 mr-1.5" }),
              "Quick-Fill Test Presets:"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => applyPreset("wedding"),
                  className: "px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-emerald-700 text-xs font-semibold border border-slate-200 shadow-xs transition-colors",
                  children: "\u{1F3F0} Wedding Hall"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => applyPreset("hotel"),
                  className: "px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-teal-700 text-xs font-semibold border border-slate-200 shadow-xs transition-colors",
                  children: "\u{1F3E8} Hotel Buffet"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => applyPreset("bakery"),
                  className: "px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-purple-700 text-xs font-semibold border border-slate-200 shadow-xs transition-colors",
                  children: "\u{1F950} Bakery Pastries"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("h3", { className: "text-sm font-bold text-emerald-700 uppercase tracking-wider flex items-center", children: [
              /* @__PURE__ */ jsx(Building2, { className: "w-4 h-4 mr-2" }),
              "1. Donor & Venue Information"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-xs font-semibold text-slate-700 mb-1.5", children: "Donor / Establishment Name *" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    required: true,
                    value: donorName,
                    onChange: (e) => setDonorName(e.target.value),
                    placeholder: "e.g. Grand Plaza Hotel & Banquets",
                    className: "w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-400"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-xs font-semibold text-slate-700 mb-1.5", children: "Venue Type *" }),
                /* @__PURE__ */ jsxs(
                  "select",
                  {
                    value: venueType,
                    onChange: (e) => setVenueType(e.target.value),
                    className: "w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all",
                    children: [
                      /* @__PURE__ */ jsx("option", { value: "Wedding Venue", children: "Wedding Venue & Hall" }),
                      /* @__PURE__ */ jsx("option", { value: "Restaurant", children: "Restaurant & Diner" }),
                      /* @__PURE__ */ jsx("option", { value: "Hotel", children: "Hotel & Resort" }),
                      /* @__PURE__ */ jsx("option", { value: "Catering Service", children: "Catering Service" }),
                      /* @__PURE__ */ jsx("option", { value: "Bakery & Cafe", children: "Bakery & Cafe" }),
                      /* @__PURE__ */ jsx("option", { value: "Event Hall", children: "Event Hall / Convention" }),
                      /* @__PURE__ */ jsx("option", { value: "Corporate Canteen", children: "Corporate Canteen" })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-xs font-semibold text-slate-700 mb-1.5", children: "Contact Person Name *" }),
                /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsx(User, { className: "w-4 h-4 text-slate-400 absolute left-3 top-3" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      required: true,
                      value: contactPerson,
                      onChange: (e) => setContactPerson(e.target.value),
                      placeholder: "Manager or Chef Name",
                      className: "w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-400"
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-xs font-semibold text-slate-700 mb-1.5", children: "Phone Number (for Pickup Team) *" }),
                /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsx(Phone, { className: "w-4 h-4 text-slate-400 absolute left-3 top-3" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "tel",
                      required: true,
                      value: contactPhone,
                      onChange: (e) => setContactPhone(e.target.value),
                      placeholder: "+91 98765 43210",
                      className: "w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-400"
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2", children: [
                /* @__PURE__ */ jsx("label", { className: "block text-xs font-semibold text-slate-700 mb-1.5", children: "Exact Pickup Address & Landmark *" }),
                /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsx(MapPin, { className: "w-4 h-4 text-slate-400 absolute left-3 top-3" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      required: true,
                      value: address,
                      onChange: (e) => setAddress(e.target.value),
                      placeholder: "Street, Gate No, Landmark",
                      className: "w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-400"
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-xs font-semibold text-slate-700 mb-1.5", children: "City *" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    required: true,
                    value: city,
                    onChange: (e) => setCity(e.target.value),
                    className: "w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-xs font-semibold text-slate-700 mb-1.5", children: "Pincode / Postal Code" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    value: pincode,
                    onChange: (e) => setPincode(e.target.value),
                    className: "w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  }
                )
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx("hr", { className: "border-slate-200" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("h3", { className: "text-sm font-bold text-emerald-700 uppercase tracking-wider flex items-center", children: [
              /* @__PURE__ */ jsx(Utensils, { className: "w-4 h-4 mr-2" }),
              "2. Surplus Food Details & Timings"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2", children: [
                /* @__PURE__ */ jsx("label", { className: "block text-xs font-semibold text-slate-700 mb-1.5", children: "Main Food Title / Package Name *" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    required: true,
                    value: foodTitle,
                    onChange: (e) => setFoodTitle(e.target.value),
                    placeholder: "e.g. Surplus Wedding Banquet Feast Dinner",
                    className: "w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-400"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2", children: [
                /* @__PURE__ */ jsx("label", { className: "block text-xs font-semibold text-slate-700 mb-1.5", children: "In-Detail Food Names & Individual Items Breakdown *" }),
                /* @__PURE__ */ jsx(
                  "textarea",
                  {
                    rows: 3,
                    required: true,
                    value: detailedFoodItems,
                    onChange: (e) => setDetailedFoodItems(e.target.value),
                    placeholder: "List specific dish names and quantities (e.g. \u2022 Paneer Curry (15kg), \u2022 Jeera Rice (20kg), \u2022 Naan (150 pcs), \u2022 Sweets (100 pcs))",
                    className: "w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono text-xs leading-relaxed placeholder:text-slate-400"
                  }
                ),
                /* @__PURE__ */ jsx("p", { className: "text-[11px] text-slate-500 mt-1", children: "Provide complete names of all dishes so Admin can verify details accurately." })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-xs font-semibold text-slate-700 mb-1.5", children: "Food Category *" }),
                /* @__PURE__ */ jsxs(
                  "select",
                  {
                    value: foodCategory,
                    onChange: (e) => setFoodCategory(e.target.value),
                    className: "w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all",
                    children: [
                      /* @__PURE__ */ jsx("option", { value: "Cooked Meals", children: "Cooked Hot Meals" }),
                      /* @__PURE__ */ jsx("option", { value: "Bakery & Sweets", children: "Bakery & Sweets" }),
                      /* @__PURE__ */ jsx("option", { value: "Raw Produce", children: "Raw Ingredients / Produce" }),
                      /* @__PURE__ */ jsx("option", { value: "Packaged & Canned", children: "Packaged & Canned" }),
                      /* @__PURE__ */ jsx("option", { value: "Beverages & Dairy", children: "Beverages & Dairy" })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-xs font-semibold text-slate-700 mb-1.5", children: "Dietary Classification *" }),
                /* @__PURE__ */ jsxs(
                  "select",
                  {
                    value: dietType,
                    onChange: (e) => setDietType(e.target.value),
                    className: "w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all",
                    children: [
                      /* @__PURE__ */ jsx("option", { value: "Vegetarian", children: "\u{1F7E2} Vegetarian" }),
                      /* @__PURE__ */ jsx("option", { value: "Non-Vegetarian", children: "\u{1F534} Non-Vegetarian" }),
                      /* @__PURE__ */ jsx("option", { value: "Vegan", children: "\u{1F331} Pure Vegan" }),
                      /* @__PURE__ */ jsx("option", { value: "Eggetarian", children: "\u{1F7E1} Eggetarian" })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-xs font-semibold text-slate-700 mb-1.5", children: "Estimated Servings Count (Persons) *" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "number",
                    required: true,
                    min: 1,
                    max: 2e3,
                    value: quantityServings,
                    onChange: (e) => setQuantityServings(Number(e.target.value)),
                    className: "w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-xs font-semibold text-slate-700 mb-1.5", children: "Total Weight in Kilograms (kg) *" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "number",
                    min: 1,
                    value: quantityKg,
                    onChange: (e) => setQuantityKg(Number(e.target.value)),
                    className: "w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-xs font-semibold text-slate-700 mb-1.5", children: "Number of Containers / Trays *" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "number",
                    min: 1,
                    value: numberOfContainers,
                    onChange: (e) => setNumberOfContainers(Number(e.target.value)),
                    className: "w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-xs font-semibold text-slate-700 mb-1.5", children: "Container Type / Specs" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    value: containerType,
                    onChange: (e) => setContainerType(e.target.value),
                    placeholder: "e.g. 50L Insulated Stainless Drums, Foil Trays",
                    className: "w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-400"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-xs font-semibold text-slate-700 mb-1.5", children: "Prepared / Cooked How Long Ago?" }),
                /* @__PURE__ */ jsxs(
                  "select",
                  {
                    value: cookedHoursAgo,
                    onChange: (e) => setCookedHoursAgo(Number(e.target.value)),
                    className: "w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all",
                    children: [
                      /* @__PURE__ */ jsx("option", { value: 0.5, children: "Under 30 Minutes Ago" }),
                      /* @__PURE__ */ jsx("option", { value: 1, children: "1 Hour Ago" }),
                      /* @__PURE__ */ jsx("option", { value: 2, children: "2 Hours Ago" }),
                      /* @__PURE__ */ jsx("option", { value: 3, children: "3 Hours Ago" }),
                      /* @__PURE__ */ jsx("option", { value: 4, children: "4 Hours Ago" })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-xs font-semibold text-slate-700 mb-1.5", children: "Safe Consumable Window (Expiry Hours)" }),
                /* @__PURE__ */ jsxs(
                  "select",
                  {
                    value: estimatedExpiryHours,
                    onChange: (e) => setEstimatedExpiryHours(Number(e.target.value)),
                    className: "w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all",
                    children: [
                      /* @__PURE__ */ jsx("option", { value: 4, children: "4 Hours (Hot Prepared Meals)" }),
                      /* @__PURE__ */ jsx("option", { value: 6, children: "6 Hours (Standard Cooked)" }),
                      /* @__PURE__ */ jsx("option", { value: 12, children: "12 Hours (Chilled / Cold)" }),
                      /* @__PURE__ */ jsx("option", { value: 24, children: "24 Hours (Dry Bakery)" })
                    ]
                  }
                )
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "submit",
              disabled: isSubmitting,
              className: "w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 cursor-pointer",
              children: [
                /* @__PURE__ */ jsx(CheckCircle2, { className: "w-5 h-5" }),
                /* @__PURE__ */ jsx("span", { children: isSubmitting ? "Submitting Surplus Food..." : "Submit Food Surplus Listing for Admin Verification" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "lg:col-span-4 space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("h3", { className: "text-sm font-bold text-emerald-700 uppercase tracking-wider flex items-center", children: [
                /* @__PURE__ */ jsx(Camera, { className: "w-4 h-4 mr-2" }),
                "Mandatory Verification Photo Proof"
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-600 mt-1", children: "Upload a clear photo of the packed food containers. The Admin will verify this photo proof before confirming your order." })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "relative rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/80 p-4 text-center hover:border-emerald-500 transition-colors group", children: photoProofUrl ? /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "relative h-48 w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200", children: [
                /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: photoProofUrl,
                    alt: "Photo proof preview",
                    referrerPolicy: "no-referrer",
                    className: "w-full h-full object-cover"
                  }
                ),
                /* @__PURE__ */ jsx("span", { className: "absolute bottom-2 right-2 px-2.5 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px] shadow-xs", children: "Proof Loaded" })
              ] }),
              /* @__PURE__ */ jsxs("label", { className: "block cursor-pointer text-xs font-semibold text-emerald-700 hover:text-emerald-800", children: [
                /* @__PURE__ */ jsx("span", { children: "Change uploaded photo proof" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "file",
                    accept: "image/*",
                    onChange: handleImageUpload,
                    className: "hidden"
                  }
                )
              ] })
            ] }) : /* @__PURE__ */ jsxs("label", { className: "cursor-pointer block py-8", children: [
              /* @__PURE__ */ jsx(Upload, { className: "w-8 h-8 text-slate-400 mx-auto mb-2 group-hover:text-emerald-600 transition-colors" }),
              /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-slate-700 block", children: "Click to upload photo proof" }),
              /* @__PURE__ */ jsx("span", { className: "text-[11px] text-slate-500 mt-1 block", children: "PNG, JPG up to 10MB" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "file",
                  accept: "image/*",
                  onChange: handleImageUpload,
                  className: "hidden"
                }
              )
            ] }) }),
            photoError && /* @__PURE__ */ jsxs("p", { className: "text-xs text-rose-600 flex items-center", children: [
              /* @__PURE__ */ jsx(AlertCircle, { className: "w-3.5 h-3.5 mr-1 shrink-0" }),
              photoError
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "pt-2", children: [
              /* @__PURE__ */ jsx("label", { className: "block text-[11px] font-medium text-slate-600 mb-1", children: "Or paste a photo proof image URL:" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "url",
                  value: photoProofUrl,
                  onChange: (e) => setPhotoProofUrl(e.target.value),
                  placeholder: "https://example.com/photo.jpg",
                  className: "w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 placeholder:text-slate-400"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-5 rounded-3xl bg-slate-50 border border-slate-200 text-xs space-y-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2 text-emerald-700 font-bold", children: [
              /* @__PURE__ */ jsx(Sparkles, { className: "w-4 h-4" }),
              /* @__PURE__ */ jsx("span", { children: "How Verification Works" })
            ] }),
            /* @__PURE__ */ jsxs("ol", { className: "list-decimal list-inside space-y-1.5 text-slate-600 leading-relaxed", children: [
              /* @__PURE__ */ jsxs("li", { children: [
                "Your request enters ",
                /* @__PURE__ */ jsx("strong", { className: "text-amber-700 font-semibold", children: '"Pending Request"' }),
                " state."
              ] }),
              /* @__PURE__ */ jsx("li", { children: "Admin inspects your uploaded photo proof and donor details." }),
              /* @__PURE__ */ jsxs("li", { children: [
                "When Admin clicks ",
                /* @__PURE__ */ jsx("strong", { className: "text-emerald-700 font-semibold", children: '"Confirm Order"' }),
                ", your status turns to ",
                /* @__PURE__ */ jsx("strong", { className: "text-emerald-700 font-semibold", children: '"Confirmed"' }),
                "."
              ] }),
              /* @__PURE__ */ jsxs("li", { children: [
                "You receive an immediate real-time ",
                /* @__PURE__ */ jsx("strong", { className: "text-slate-900 font-semibold", children: "push notification" }),
                " on your screen!"
              ] })
            ] })
          ] })
        ] })
      ] })
    ) : (
      /* Donors Active Listings Tracker View */
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("h2", { className: "text-lg font-bold text-slate-900 flex items-center", children: [
            /* @__PURE__ */ jsx(Clock, { className: "w-5 h-5 text-emerald-600 mr-2" }),
            "Live Order Status & Verification Tracker"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-500", children: "Real-time push notifications enabled" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: donations.map((item) => /* @__PURE__ */ jsxs(
          motion.div,
          {
            layout: true,
            initial: { opacity: 0, scale: 0.95 },
            animate: { opacity: 1, scale: 1 },
            className: `bg-white border rounded-3xl overflow-hidden shadow-xs hover:shadow-md flex flex-col justify-between transition-all ${item.status === "Confirmed" ? "border-emerald-300 shadow-emerald-500/5" : item.status === "Rejected" ? "border-rose-300 shadow-rose-500/5" : "border-amber-300 shadow-amber-500/5"}`,
            children: [
              /* @__PURE__ */ jsxs("div", { className: "relative h-48 bg-slate-100", children: [
                /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: item.photoProofUrl,
                    alt: item.foodTitle,
                    referrerPolicy: "no-referrer",
                    className: "w-full h-full object-cover"
                  }
                ),
                /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" }),
                /* @__PURE__ */ jsx("div", { className: "absolute top-3 left-3", children: /* @__PURE__ */ jsxs(
                  "span",
                  {
                    className: `inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider border shadow-md ${item.status === "Confirmed" ? "bg-emerald-500 text-white border-emerald-400" : item.status === "Rejected" ? "bg-rose-500 text-white border-rose-400" : "bg-amber-500 text-slate-950 border-amber-400 animate-pulse"}`,
                    children: [
                      item.status === "Pending Request" && /* @__PURE__ */ jsx(Clock, { className: "w-3.5 h-3.5 mr-1.5" }),
                      item.status === "Confirmed" && /* @__PURE__ */ jsx(CheckCircle2, { className: "w-3.5 h-3.5 mr-1.5" }),
                      item.status === "Rejected" && /* @__PURE__ */ jsx(AlertCircle, { className: "w-3.5 h-3.5 mr-1.5" }),
                      /* @__PURE__ */ jsx("span", { children: item.status })
                    ]
                  }
                ) }),
                /* @__PURE__ */ jsxs("div", { className: "absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-700 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200", children: [
                  /* @__PURE__ */ jsx("span", { className: "font-semibold text-emerald-700", children: item.venueType }),
                  /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
                    item.quantityServings,
                    " Servings"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "p-5 space-y-3 flex-1 flex flex-col justify-between", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("h3", { className: "font-bold text-base text-slate-900 line-clamp-1", children: item.foodTitle }),
                  /* @__PURE__ */ jsxs("p", { className: "text-xs text-slate-600 mt-1 flex items-center", children: [
                    /* @__PURE__ */ jsx(Building2, { className: "w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" }),
                    item.donorName
                  ] }),
                  /* @__PURE__ */ jsxs("p", { className: "text-xs text-slate-500 mt-0.5 flex items-center", children: [
                    /* @__PURE__ */ jsx(MapPin, { className: "w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" }),
                    item.address,
                    ", ",
                    item.city
                  ] })
                ] }),
                item.statusReason && /* @__PURE__ */ jsxs("div", { className: `p-3 rounded-xl text-xs border ${item.status === "Confirmed" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : item.status === "Rejected" ? "bg-rose-50 border-rose-200 text-rose-800" : "bg-slate-50 border-slate-200 text-slate-600"}`, children: [
                  /* @__PURE__ */ jsx("p", { className: "font-semibold text-[11px] uppercase tracking-wider mb-0.5", children: item.status === "Confirmed" ? "Admin Verification Note:" : "Status Reason:" }),
                  /* @__PURE__ */ jsx("p", { children: item.statusReason })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "pt-2 border-t border-slate-100 flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxs("span", { className: "text-[11px] text-slate-400", children: [
                    "ID: #",
                    item.id
                  ] }),
                  /* @__PURE__ */ jsxs(
                    "button",
                    {
                      onClick: () => onInspectProof(item),
                      className: "px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer",
                      children: [
                        /* @__PURE__ */ jsx(Eye, { className: "w-3.5 h-3.5 text-emerald-600" }),
                        /* @__PURE__ */ jsx("span", { children: "View Proof Photo" })
                      ]
                    }
                  )
                ] })
              ] })
            ]
          },
          item.id
        )) })
      ] })
    )
  ] });
};
export {
  DonorPortal
};
