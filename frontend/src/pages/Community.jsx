import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  Heart, Plus, Users, Award, ShieldCheck, MapPin, 
  Phone, Clock, ArrowRight, Check, Sparkles, Coffee,
  FileText, ShieldAlert, AlertTriangle, AlertCircle, Search, 
  Map, PhoneCall, Share2, Compass, Bell, Settings, Filter, ArrowUpDown, ChevronRight, X,
  FileSpreadsheet, ClipboardCheck, Video, HelpCircle, Navigation, Copy
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;

const greenNgoIcon = new L.DivIcon({
  className: 'custom-ngo-green',
  html: `<div style="background-color: #22c55e; width: 18px; height: 18px; display: block; left: -9px; top: -9px; position: relative; border-radius: 50% 50% 0; transform: rotate(45deg); border: 2px solid #fff; box-shadow: 0 0 10px #22c55e;"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 18]
});

const orangeNgoIcon = new L.DivIcon({
  className: 'custom-ngo-orange',
  html: `<div style="background-color: #f97316; width: 18px; height: 18px; display: block; left: -9px; top: -9px; position: relative; border-radius: 50% 50% 0; transform: rotate(45deg); border: 2px solid #fff; box-shadow: 0 0 10px #f97316;"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 18]
});

const greyNgoIcon = new L.DivIcon({
  className: 'custom-ngo-grey',
  html: `<div style="background-color: #6b7280; width: 18px; height: 18px; display: block; left: -9px; top: -9px; position: relative; border-radius: 50% 50% 0; transform: rotate(45deg); border: 2px solid #fff; box-shadow: 0 0 10px #6b7280;"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 18]
});

const blueSearchIcon = new L.DivIcon({
  className: 'custom-blue-search',
  html: `<div style="background-color: #3b82f6; width: 22px; height: 22px; display: block; left: -11px; top: -11px; position: relative; border-radius: 50% 50% 0; transform: rotate(45deg); border: 2px solid #fff; box-shadow: 0 0 12px #3b82f6;"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 22]
});

function ChangeMapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

// Distance Calculation utilizing Haversine Formula
function getHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

// Count up component
function CountUp({ end, duration = 800 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);
  return <span>{count.toLocaleString()}</span>;
}

// Mock fallback lists
const getMockLabs = () => [
  { id: "lab-1", name: "Gujarat Food & Drug Laboratory (FDA)", address: "Sector-10A, Gandhinagar, Gujarat 382010", phone: "+91 79 2325 3482", email: "contact@gujfda.gov.in", website: "fda.gujarat.gov.in", working_hours: "09:00 AM - 06:00 PM", available_tests: ["Purity", "Chemical Adulteration", "Heavy Metals", "Pesticide Residue"], status: "Open", rating: 4.8, isFssai: true, isGovt: true, lat: 23.2201, lng: 72.6468 },
  { id: "lab-2", name: "FSSAI National Food Laboratory (NFL)", address: "Sector 14, Ghaziabad, Uttar Pradesh 201002", phone: "+91 120 270 2165", email: "director.nflgzb@fssai.gov.in", website: "fssai.gov.in", working_hours: "09:30 AM - 05:30 PM", available_tests: ["Full Spectral Purity", "Toxicity Check", "Micro-biological", "Foreign Fats Scan"], status: "Open", rating: 4.9, isFssai: true, isGovt: true, lat: 28.6738, lng: 77.4402 },
  { id: "lab-3", name: "Eurofins Food Testing Lab India", address: "A-3, Industrial Area, Phase-I, New Delhi 110020", phone: "+91 11 6625 2100", email: "enquiryindia@eurofins.com", website: "eurofins.in", working_hours: "09:00 AM - 07:00 PM", available_tests: ["Mineral Oil check", "Aflatoxin levels", "Fatty Acid Profiling"], status: "Open", rating: 4.5, isFssai: true, isGovt: false, lat: 28.5355, lng: 77.2711 },
  { id: "lab-4", name: "TÜV SÜD South Asia Testing Centre", address: "Industrial Estate, Sanathnagar, Hyderabad 500018", phone: "+91 40 6001 3333", email: "info.in@tuvsud.com", website: "tuvsud.com", working_hours: "09:00 AM - 06:00 PM", available_tests: ["Purity", "Acid Value", "Peroxide Value", "Argemone Oil check"], status: "Closed", rating: 4.6, isFssai: false, isGovt: false, lat: 17.4580, lng: 78.4310 },
  { id: "lab-5", name: "Alpha Quality Control Lab", address: "Sindhu Bhavan Road, Ahmedabad, Gujarat 380054", phone: "+91 79 4005 9821", email: "support@alphalabs.co.in", website: "alphalabs.co.in", working_hours: "08:30 AM - 08:30 PM", available_tests: ["Purity Assays", "Peroxide Check"], status: "Open", rating: 4.3, isFssai: true, isGovt: false, lat: 23.0410, lng: 72.5080 }
];

const getMockAlerts = () => [
  { id: "alert-1", product_name: "Kacchi Ghani Mustard Oil", brand_name: "Brand X Foods", category: "Product Recall", reason: "Excessive foreign fats (argemone oil presence) detected via spectral signature scan.", issued_by: "FSSAI Central Command", issue_date: "2026-06-28", affected_states: ["Gujarat", "Maharashtra", "Rajasthan"], severity: "Critical", recommended_action: "Avoid Consumption & Return Product", ref_num: "FSSAI-REC-2026-042", image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&auto=format&fit=crop&q=60" },
  { id: "alert-2", product_name: "Standard Refined Sunflower Oil", brand_name: "Swastik Edibles", category: "Government Ban", reason: "Unpermitted color additives (Metanil Yellow) detected exceeding legal limits.", issued_by: "Ministry of Health & Welfare", issue_date: "2026-06-24", affected_states: ["All States"], severity: "High", recommended_action: "Dispose Safely & Report Retailer", ref_num: "MOH-BAN-2026-009", image: "https://images.unsplash.com/photo-1596230529625-7ee10f7b09b6?w=200&auto=format&fit=crop&q=60" },
  { id: "alert-3", product_name: "Virgin Extra Olive Oil", brand_name: "Tuscany Imports", category: "Safety Warning", reason: "Sub-standard density indicating artificial adulterant mask.", issued_by: "FSSAI Western Division", issue_date: "2026-06-20", affected_states: ["Delhi NCR", "Karnataka"], severity: "Medium", recommended_action: "Return Product to Merchant", ref_num: "FSSAI-WAR-2026-118", image: "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?w=200&auto=format&fit=crop&q=60" }
];

const getMockNgos = () => [
  { id: "ngo-1", name: "Robin Hood Army - Ahmedabad", address: "Vastrapur Community Kitchen, Ahmedabad, Gujarat 380015", phone: "+91 98980 12345", operating_hours: "08:00 AM - 10:00 PM", food_types: ["Veg", "Cooked Food", "Dry Food"], capacity: "500 meals/day", urgency: "High", pickup_available: true, rating: 4.8, verified: true, reg_number: "RHA-IND-2014-9821", description: "Zero-funds volunteer organization routing surplus food from restaurants directly to communities.", lat: 23.0338, lng: 72.5250, status: "Available", past_donations: 4200 },
  { id: "ngo-2", name: "Zomato Feeding India - Mumbai Hub", address: "Bandra Reclamation Center, Mumbai, Maharashtra 400050", phone: "+91 91234 56789", operating_hours: "09:00 AM - 09:00 PM", food_types: ["Veg", "Non Veg", "Dry Food", "Cooked Food"], capacity: "1200 meals/day", urgency: "Medium", pickup_available: true, rating: 4.9, verified: true, reg_number: "FIP-NGO-1029", description: "Non-profit combating hunger and malnutrition in India via systemic redistribution networks.", lat: 19.0522, lng: 72.8258, status: "Busy", past_donations: 9800 },
  { id: "ngo-3", name: "Roti Bank Delhi", address: "Daryaganj Central Depot, New Delhi 110002", phone: "+91 88882 12121", operating_hours: "10:00 AM - 08:00 PM", food_types: ["Veg", "Cooked Food"], capacity: "800 meals/day", urgency: "High", pickup_available: true, rating: 4.7, verified: true, reg_number: "RBD-NGO-4982", description: "Community-driven kitchen collecting wheat rotis and vegetables for low-income settlements.", lat: 28.6448, lng: 77.2400, status: "Available", past_donations: 7100 },
  { id: "ngo-4", name: "No Food Waste - Bengaluru Division", address: "Indiranagar Rescue Depot, Bengaluru, Karnataka 560038", phone: "+91 90909 88888", operating_hours: "08:00 AM - 11:00 PM", food_types: ["Veg", "Non Veg", "Cooked Food"], capacity: "1000 meals/day", urgency: "Low", pickup_available: true, rating: 4.6, verified: true, reg_number: "NFW-NGO-3341", description: "Helpline mapping excess wedding food directly to hunger spots in cities.", lat: 12.9784, lng: 77.6408, status: "Offline", past_donations: 5500 }
];

const getMockComplaints = () => [
  {
    id: "uuid-1",
    complaint_id: "COMP-20260628-103",
    product_name: "Mustard Oil Special Pack",
    oil_type: "Mustard Oil",
    brand_name: "Gopal Edibles",
    category: "Adulteration",
    description: "The oil turned dark black upon boiling and left a chemical smell.",
    purchase_date: "2026-06-25",
    city: "Ahmedabad",
    district: "Ahmedabad",
    vendor_name: "Vijay Kirana Store",
    status: "Under Review",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    timeline: [
      { status: "Submitted", date: "28 Jun", desc: "Complaint filed with digital signature." },
      { status: "Under Review", date: "29 Jun", desc: "Assigned to District Officer for verification." }
    ]
  }
];

export default function Community() {
  const navigate = useNavigate();
  const { settings } = useApp();
  
  // Tab Controller
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'complaints', 'vendors', 'labs', 'alerts'
  
  // Subscreen Toggle
  const [showNgoScreen, setShowNgoScreen] = useState(false);

  // States
  const [complaints, setComplaints] = useState([]);
  const [labs, setLabs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [ngoDonations, setNgoDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Autocomplete Cities search
  const [labSearchText, setLabSearchText] = useState('');
  const [labSuggestions, setLabSuggestions] = useState([]);
  const [labSearchedCoords, setLabSearchedCoords] = useState(null); // [lat, lng]
  const [labSearchLoading, setLabSearchLoading] = useState(false);
  const [labSortBy, setLabSortBy] = useState('distance');

  const [ngoSearchText, setNgoSearchText] = useState('');
  const [ngoSuggestions, setNgoSuggestions] = useState([]);
  const [ngoSearchedCoords, setNgoSearchedCoords] = useState(null); // [lat, lng]
  const [ngoSearchLoading, setNgoSearchLoading] = useState(false);
  const [selectedNgo, setSelectedNgo] = useState(null);

  // Map settings
  const [mapCenter, setMapCenter] = useState([23.0225, 72.5714]); // Ahmedabad default
  const [mapZoom, setMapZoom] = useState(12);

  // Filters State
  const [filterLabCert, setFilterLabCert] = useState('all'); // 'all', 'govt', 'private', 'fssai', 'open'
  const [alertFilterSeverity, setAlertFilterSeverity] = useState('all');
  const [alertFilterDate, setAlertFilterDate] = useState('all');
  
  // Timeline expansion
  const [expandedComplaint, setExpandedComplaint] = useState(null);
  const [expandedDonation, setExpandedDonation] = useState(null);

  // Complaint Form detailed fields
  const [compProductName, setCompProductName] = useState('');
  const [compBrandName, setCompBrandName] = useState('');
  const [compOilType, setCompOilType] = useState('Mustard Oil');
  const [compBatchNum, setCompBatchNum] = useState('');
  const [compMfgDate, setCompMfgDate] = useState('');
  const [compExpDate, setCompExpDate] = useState('');
  const [compPurchaseDate, setCompPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [compVendorName, setCompVendorName] = useState('');
  const [compPurchaseLoc, setCompPurchaseLoc] = useState('');
  const [compCity, setCompCity] = useState('Ahmedabad');
  const [compDistrict, setCompDistrict] = useState('Ahmedabad');
  const [compCategory, setCompCategory] = useState('Adulteration');
  const [compDescription, setCompDescription] = useState('');

  // Evidence files checkboxes (Mandatory validation checks)
  const [proofPhoto, setProofPhoto] = useState(false);
  const [proofBill, setProofBill] = useState(false);
  const [proofVideo, setProofVideo] = useState(false);
  const [proofLabReport, setProofLabReport] = useState(false);
  const [submittingComplaint, setSubmittingComplaint] = useState(false);
  const [complaintSuccess, setComplaintSuccess] = useState('');

  // NGO Donation Form
  const [donateFoodType, setDonateFoodType] = useState('Cooked Food');
  const [donateQuantityKg, setDonateQuantityKg] = useState('');
  const [donateMealsCount, setDonateMealsCount] = useState('');
  const [donateExpiryHours, setDonateExpiryHours] = useState('4');
  const [donateAddress, setDonateAddress] = useState('');
  const [donateContactPerson, setDonateContactPerson] = useState('');
  const [donatePhone, setDonatePhone] = useState('');
  const [donateInstructions, setDonateInstructions] = useState('');
  const [submittingDonation, setSubmittingDonation] = useState(false);
  const [donationSuccess, setDonationSuccess] = useState('');

  // Autocomplete references
  const labDebounce = useRef(null);
  const ngoDebounce = useRef(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchComplaints(),
      fetchAlerts(),
      fetchLabs(),
      fetchVendors(),
      fetchNgos(),
      fetchDonations()
    ]);
    setLoading(false);
  };

  const fetchComplaints = async () => {
    try {
      const { data, error } = await supabase.from('consumer_complaints').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setComplaints(data || []);
    } catch {
      const saved = localStorage.getItem('local_consumer_complaints_v2');
      setComplaints(saved ? JSON.parse(saved) : getMockComplaints());
    }
  };

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase.from('government_alerts').select('*').order('issue_date', { ascending: false });
      if (error) throw error;
      setAlerts(data || []);
    } catch {
      setAlerts(getMockAlerts());
    }
  };

  const fetchLabs = async () => {
    try {
      const { data, error } = await supabase.from('testing_centres').select('*');
      if (error) throw error;
      setLabs(data || []);
    } catch {
      setLabs(getMockLabs());
    }
  };

  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase.from('shops').select('*');
      if (error) throw error;
      
      const mapped = data.map(s => {
        let riskLevel = 'Safe';
        if (s.status === 'adulterated') riskLevel = 'High Risk';
        else if (s.status === 'moderate') riskLevel = 'Observation';
        return {
          id: s.id,
          name: s.name,
          district: s.name.includes('Delhi') ? 'Delhi' : s.name.includes('Mumbai') ? 'Mumbai' : 'Ahmedabad',
          avgPurity: Math.round(s.last_purity || 92),
          trustScore: Math.round(s.last_purity || 92),
          failedTests: s.status === 'adulterated' ? 6 : s.status === 'moderate' ? 2 : 0,
          successfulTests: s.status === 'safe' ? 12 : 3,
          lastInspection: '24 Jun 2026',
          riskLevel
        };
      });
      setVendors(mapped);
    } catch {
      setVendors([
        { id: "v1", name: 'Sharma Oil Traders', district: 'Ahmedabad', avgPurity: 61, trustScore: 61, failedTests: 8, successfulTests: 3, lastInspection: '24 Jun 2026', riskLevel: 'High Risk' },
        { id: "v2", name: 'Delhi Pure Oils Traders', district: 'Delhi', avgPurity: 98, trustScore: 98, failedTests: 0, successfulTests: 18, lastInspection: '25 Jun 2026', riskLevel: 'Safe' },
        { id: "v3", name: 'Mumbai Mill Foods', district: 'Mumbai', avgPurity: 85, trustScore: 85, failedTests: 2, successfulTests: 12, lastInspection: '18 Jun 2026', riskLevel: 'Observation' }
      ]);
    }
  };

  const fetchNgos = async () => {
    try {
      const { data, error } = await supabase.from('ngos').select('*');
      if (error) throw error;
      setNgos(data || []);
    } catch {
      setNgos(getMockNgos());
    }
  };

  const fetchDonations = async () => {
    try {
      const { data, error } = await supabase.from('ngo_donations').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setNgoDonations(data || []);
    } catch {
      const saved = localStorage.getItem('local_ngo_donations');
      setNgoDonations(saved ? JSON.parse(saved) : []);
    }
  };

  // Autocomplete Geocoding Search handlers (OSM Nominatim)
  const handleLabSearch = (e) => {
    const val = e.target.value;
    setLabSearchText(val);
    if (val.trim() === '') {
      setLabSuggestions([]);
      return;
    }

    if (labDebounce.current) clearTimeout(labDebounce.current);
    
    setLabSearchLoading(true);
    labDebounce.current = setTimeout(async () => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&countrycodes=in&format=json&limit=5`);
        const data = await response.json();
        const formatted = data.map(item => ({
          city: item.display_name.split(', ')[0],
          state: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon)
        }));
        setLabSuggestions(formatted);
      } catch (err) {
        console.error(err);
      } finally {
        setLabSearchLoading(false);
      }
    }, 400);
  };

  const handleNgoSearch = (e) => {
    const val = e.target.value;
    setNgoSearchText(val);
    if (val.trim() === '') {
      setNgoSuggestions([]);
      return;
    }

    if (ngoDebounce.current) clearTimeout(ngoDebounce.current);

    setNgoSearchLoading(true);
    ngoDebounce.current = setTimeout(async () => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&countrycodes=in&format=json&limit=5`);
        const data = await response.json();
        const formatted = data.map(item => ({
          city: item.display_name.split(', ')[0],
          state: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon)
        }));
        setNgoSuggestions(formatted);
      } catch (err) {
        console.error(err);
      } finally {
        setNgoSearchLoading(false);
      }
    }, 400);
  };

  // Geolocation trigger
  const handleGPSLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setNgoSearchedCoords([lat, lng]);
          setMapCenter([lat, lng]);
          setMapZoom(13);
          setNgoSearchText('Current Location');
        },
        () => {
          alert('Could not resolve current coordinates. Please search manually.');
        }
      );
    } else {
      alert('Your browser does not support geolocation.');
    }
  };

  // Complaint Completeness Check
  const complaintCompleteness = useMemo(() => {
    let score = 0;
    if (compProductName) score += 10;
    if (compBrandName) score += 10;
    if (compBatchNum) score += 10;
    if (compMfgDate && compExpDate) score += 10;
    if (compVendorName) score += 10;
    if (compPurchaseLoc) score += 10;
    if (compDescription) score += 20;
    if (proofPhoto || proofBill || proofVideo || proofLabReport) score += 20;
    return score;
  }, [compProductName, compBrandName, compBatchNum, compMfgDate, compExpDate, compVendorName, compPurchaseLoc, compDescription, proofPhoto, proofBill, proofVideo, proofLabReport]);

  const hasEvidenceAttached = useMemo(() => {
    return proofPhoto || proofBill || proofVideo || proofLabReport;
  }, [proofPhoto, proofBill, proofVideo, proofLabReport]);

  // --- SUBMIT COMPLAINT PORTAL ---
  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    if (!hasEvidenceAttached) return;

    setSubmittingComplaint(true);
    setComplaintSuccess('');

    const todayStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const randNum = Math.floor(100 + Math.random() * 900);
    const compId = `COMP-${todayStr}-${randNum}`;

    const timelineData = [
      { status: "Submitted", date: new Date().toLocaleDateString([], {day:'2-digit', month:'short'}), desc: "Complaint filed with digital signature." },
      { status: "Under Review", date: new Date().toLocaleDateString([], {day:'2-digit', month:'short'}), desc: "Assigned to District Officer for verification." }
    ];

    const record = {
      complaint_id: compId,
      product_name: compProductName,
      brand_name: compBrandName || 'Generic',
      oil_type: compOilType,
      category: compCategory,
      description: `[Batch: ${compBatchNum || 'NA'} / Purchase: ${compPurchaseLoc || 'Market'}] ${compDescription}`,
      purchase_date: compPurchaseDate,
      city: compCity,
      district: compDistrict,
      location: compPurchaseLoc,
      product_photo: proofPhoto ? "product_evidence.jpg" : null,
      bill_upload: proofBill ? "invoice.pdf" : null,
      status: 'Under Review',
      timeline: timelineData
    };

    try {
      const { error } = await supabase.from('consumer_complaints').insert([record]);
      if (error) throw error;
      setComplaintSuccess(`Report lodged! FSSAI ID: ${compId}`);
      fetchComplaints();
    } catch {
      const current = [...complaints];
      current.unshift({
        ...record,
        id: "local-" + randNum,
        created_at: new Date().toISOString()
      });
      localStorage.setItem('local_consumer_complaints_v2', JSON.stringify(current));
      setComplaints(current);
      setComplaintSuccess(`Report lodged (Local storage)! ID: ${compId}`);
    } finally {
      setSubmittingComplaint(false);
      setCompProductName('');
      setCompBrandName('');
      setCompBatchNum('');
      setCompDescription('');
      setProofPhoto(false);
      setProofBill(false);
      setProofVideo(false);
      setProofLabReport(false);
    }
  };

  // --- SUBMIT NGO DONATION ---
  const handleNgoDonationSubmit = async (e) => {
    e.preventDefault();
    if (!selectedNgo || !donateQuantityKg || !donateContactPerson || !donatePhone) return;

    setSubmittingDonation(true);
    setDonationSuccess('');

    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + parseInt(donateExpiryHours));

    const record = {
      ngo_id: selectedNgo.id,
      food_type: donateFoodType,
      quantity_kg: parseFloat(donateQuantityKg),
      meals_count: parseInt(donateMealsCount || 0),
      expiry_time: expiryDate.toISOString(),
      pickup_address: donateAddress,
      contact_person: donateContactPerson,
      phone: donatePhone,
      special_notes: donateInstructions,
      status: 'Pending'
    };

    try {
      const { error } = await supabase.from('ngo_donations').insert([record]);
      if (error) throw error;
      setDonationSuccess(`Donation scheduled! Rescuer assigned shortly.`);
      fetchDonations();
    } catch {
      const current = [...ngoDonations];
      const localRecord = {
        ...record,
        id: "don-" + Math.floor(Math.random() * 999),
        created_at: new Date().toISOString(),
        ngos: { name: selectedNgo.name }
      };
      current.unshift(localRecord);
      localStorage.setItem('local_ngo_donations', JSON.stringify(current));
      setNgoDonations(current);
      setDonationSuccess(`Donation scheduled (Local database)!`);
    } finally {
      setSubmittingDonation(false);
      setDonateQuantityKg('');
      setDonateMealsCount('');
      setDonateAddress('');
      setDonateContactPerson('');
      setDonatePhone('');
      setDonateInstructions('');
    }
  };

  // Stats Calculations
  const stats = useMemo(() => {
    return {
      totalComplaints: complaints.length || 2,
      trustedCount: vendors.filter(v => v.riskLevel === 'Safe').length || 1,
      totalLabs: labs.length || 5,
      activeAlerts: alerts.filter(a => a.severity === 'Critical' || a.severity === 'High').length || 3
    };
  }, [complaints, vendors, labs, alerts]);

  // --- FILTERED COMPUTATIONS ---
  const filteredLabs = useMemo(() => {
    let result = [...labs];

    if (labSearchedCoords) {
      result = result.map(l => {
        const d = getHaversineDistance(labSearchedCoords[0], labSearchedCoords[1], l.lat, l.lng);
        return { ...l, distance: parseFloat(d.toFixed(1)) };
      });
    }

    if (filterLabCert !== 'all') {
      if (filterLabCert === 'govt') result = result.filter(l => l.isGovt);
      if (filterLabCert === 'private') result = result.filter(l => !l.isGovt);
      if (filterLabCert === 'fssai') result = result.filter(l => l.isFssai);
      if (filterLabCert === 'open') result = result.filter(l => l.status === 'Open');
    }

    result.sort((a, b) => {
      if (labSortBy === 'rating') return b.rating - a.rating;
      return (a.distance || 0) - (b.distance || 0);
    });

    return result;
  }, [labs, labSearchedCoords, filterLabCert, labSortBy]);

  const nearestLabSuggestion = useMemo(() => {
    if (filteredLabs.length > 0) return filteredLabs[0];
    return labs.length > 0 ? labs[0] : null;
  }, [filteredLabs, labs]);

  // Filtered NGOs Operating Nearby
  const filteredNgos = useMemo(() => {
    let result = [...ngos];

    if (ngoSearchedCoords) {
      result = result.map(n => {
        const d = getHaversineDistance(ngoSearchedCoords[0], ngoSearchedCoords[1], n.lat, n.lng);
        return { ...n, distance: parseFloat(d.toFixed(1)) };
      }).sort((a, b) => a.distance - b.distance);
    } else {
      result = result.map(n => ({ ...n, distance: 3.5 }));
    }

    return result.filter(n => n.verified);
  }, [ngos, ngoSearchedCoords]);

  const processedAlerts = useMemo(() => {
    return alerts.filter(a => {
      const matchesSeverity = alertFilterSeverity === 'all' || a.severity === alertFilterSeverity;
      let matchesDate = true;
      if (alertFilterDate !== 'all') {
        const diffDays = Math.ceil(Math.abs(new Date() - new Date(a.issue_date)) / (1000 * 60 * 60 * 24));
        if (alertFilterDate === 'today') matchesDate = diffDays <= 1;
        else if (alertFilterDate === 'week') matchesDate = diffDays <= 7;
        else if (alertFilterDate === 'month') matchesDate = diffDays <= 30;
      }
      return matchesSeverity && matchesDate;
    });
  }, [alerts, alertFilterSeverity, alertFilterDate]);

  return (
    <div className="flex flex-col min-h-screen theme-bg theme-text animate-fade-in pb-16 relative">
      
      {/* --- HEADER --- */}
      <div className="px-5 pt-8 pb-5 border-b border-[var(--border-color)] bg-[var(--bg-card)] sticky top-0 z-30 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight theme-text">Safety Community</h1>
          <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-0.5">Consumer Safety & NGO Alliance</p>
        </div>
        
        {showNgoScreen && (
          <button 
            onClick={() => setShowNgoScreen(false)}
            className="p-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:theme-text transition-colors flex items-center gap-1 text-[10px] font-black"
          >
            <X size={14} />
            <span>BACK</span>
          </button>
        )}
      </div>

      {!showNgoScreen ? (
        // --- STANDARD COMMUNITY VIEW ---
        <div className="px-5 pt-6 flex flex-col gap-6">

          {/* --- CLICKABLE INTERACTIVE STATS SUMMARY --- */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Complaints */}
            <div 
              onClick={() => setActiveTab('complaints')}
              className={`card p-4 flex flex-col justify-between h-28 shadow-sm relative overflow-hidden group cursor-pointer border ${
                activeTab === 'complaints' ? 'border-blue-500 bg-blue-500/5' : ''
              }`}
            >
              <div className="absolute top-0 right-0 p-3 text-red-500/10 group-hover:text-red-500/20">
                <FileText size={32} />
              </div>
              <div>
                <p className="text-[8px] text-[var(--text-muted)] font-black uppercase tracking-wider">Consumer Complaints</p>
                <h2 className="text-2xl font-black tracking-tight theme-text font-mono mt-1">
                  <CountUp end={stats.totalComplaints} />
                </h2>
              </div>
              <p className="text-[7px] text-red-500 font-bold uppercase tracking-wider">Tap to view history</p>
            </div>

            {/* Trusted Vendors */}
            <div 
              onClick={() => setActiveTab('vendors')}
              className={`card p-4 flex flex-col justify-between h-28 shadow-sm relative overflow-hidden group cursor-pointer border ${
                activeTab === 'vendors' ? 'border-blue-500 bg-blue-500/5' : ''
              }`}
            >
              <div className="absolute top-0 right-0 p-3 text-green-500/10 group-hover:text-green-500/20">
                <Award size={32} />
              </div>
              <div>
                <p className="text-[8px] text-[var(--text-muted)] font-black uppercase tracking-wider">Trusted Vendors</p>
                <h2 className="text-2xl font-black tracking-tight theme-text font-mono mt-1">
                  <CountUp end={stats.trustedCount} />
                </h2>
              </div>
              <p className="text-[7px] text-green-500 font-bold uppercase tracking-wider">Tap to audit vendors</p>
            </div>

            {/* Laboratories */}
            <div 
              onClick={() => setActiveTab('labs')}
              className={`card p-4 flex flex-col justify-between h-28 shadow-sm relative overflow-hidden group cursor-pointer border ${
                activeTab === 'labs' ? 'border-blue-500 bg-blue-500/5' : ''
              }`}
            >
              <div className="absolute top-0 right-0 p-3 text-brand-500/10 group-hover:text-brand-500/20">
                <Compass size={32} />
              </div>
              <div>
                <p className="text-[8px] text-[var(--text-muted)] font-black uppercase tracking-wider">Testing Laboratories</p>
                <h2 className="text-2xl font-black tracking-tight theme-text font-mono mt-1">
                  <CountUp end={stats.totalLabs} />
                </h2>
              </div>
              <p className="text-[7px] text-brand-500 font-bold uppercase tracking-wider">Tap to search labs</p>
            </div>

            {/* Safety Alerts */}
            <div 
              onClick={() => setActiveTab('alerts')}
              className={`card p-4 flex flex-col justify-between h-28 shadow-sm relative overflow-hidden group cursor-pointer border ${
                activeTab === 'alerts' ? 'border-blue-500 bg-blue-500/5' : ''
              }`}
            >
              <div className="absolute top-0 right-0 p-3 text-orange-500/10 group-hover:text-orange-500/20">
                <ShieldAlert size={32} />
              </div>
              <div>
                <p className="text-[8px] text-[var(--text-muted)] font-black uppercase tracking-wider">Government Recalls</p>
                <h2 className="text-2xl font-black tracking-tight text-orange-500 font-mono mt-1">
                  <CountUp end={stats.activeAlerts} />
                </h2>
              </div>
              <p className="text-[7px] text-orange-500 font-bold uppercase tracking-wider">Tap to view warnings</p>
            </div>
          </div>

          {/* ============================================================
             🍱 SECTION B: FOOD DONATION NETWORK CARD (HIGHLIGHTED FEATURE)
             ============================================================ */}
          <div className="card p-6 border-2 border-brand-500 bg-brand-500/[0.02] shadow-glow-gold rounded-[2rem] relative overflow-hidden flex flex-col gap-4">
            <div className="absolute top-0 right-0 p-5 text-brand-500/10 pointer-events-none">
              <Coffee size={72} />
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xl">🍱</span>
              <div>
                <h3 className="text-sm font-black theme-text uppercase tracking-widest">Food Donation Network</h3>
                <p className="text-[9px] text-[var(--text-muted)] font-semibold mt-0.5">Connect surplus food with verified NGOs in your city.</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center bg-[var(--bg-card)] rounded-2xl p-3 border border-[var(--border-color)]">
              <div>
                <p className="text-[6px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-0.5">NGOs Nearby</p>
                <p className="text-xs font-black text-brand-500 font-mono">4</p>
              </div>
              <div className="border-l border-[var(--border-color)]">
                <p className="text-[6px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-0.5">Rescued (kg)</p>
                <p className="text-xs font-black theme-text font-mono">4,250</p>
              </div>
              <div className="border-l border-[var(--border-color)]">
                <p className="text-[6px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-0.5">Donations</p>
                <p className="text-xs font-black theme-text font-mono">154</p>
              </div>
              <div className="border-l border-[var(--border-color)]">
                <p className="text-[6px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-0.5">Helped</p>
                <p className="text-xs font-black text-green-500 font-mono">10.6k</p>
              </div>
            </div>

            <button 
              onClick={() => setShowNgoScreen(true)}
              className="btn-primary w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-lg shadow-brand-500/10 active:scale-95"
            >
              <span>FIND NGOS NEAR ME</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* ============================================================
             👤 SECTION A: CONSUMER PROTECTION PORTALS
             ============================================================ */}
          
          {/* Sub-tab: Consumer Complaint Portal */}
          {activeTab === 'complaints' && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="card p-6 shadow-sm border border-[var(--border-color)]">
                <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3.5 mb-5">
                  <h3 className="text-[10px] font-black theme-text uppercase tracking-widest flex items-center gap-2">
                    <FileText size={14} className="text-brand-500" />
                    <span>Lodge Food Complaint</span>
                  </h3>
                  <span className="text-[8px] font-black text-red-500 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">FSSAI Filing</span>
                </div>

                <form onSubmit={handleComplaintSubmit} className="flex flex-col gap-4">
                  
                  {/* Product Info */}
                  <div className="flex flex-col gap-3">
                    <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-wider">1. Product Information</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="field-label">Product Name</label>
                        <input required value={compProductName} onChange={e => setCompProductName(e.target.value)} type="text" placeholder="e.g. Mustard Oil" className="field-input" />
                      </div>
                      <div>
                        <label className="field-label">Brand Name</label>
                        <input value={compBrandName} onChange={e => setCompBrandName(e.target.value)} type="text" placeholder="e.g. Brand X" className="field-input" />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="field-label">Oil Type</label>
                        <select value={compOilType} onChange={e => setCompOilType(e.target.value)} className="field-input py-2">
                          <option value="Mustard Oil">Mustard Oil</option>
                          <option value="Sunflower Oil">Sunflower Oil</option>
                          <option value="Groundnut Oil">Groundnut Oil</option>
                          <option value="Palm Oil">Palm Oil</option>
                          <option value="Soybean Oil">Soybean Oil</option>
                        </select>
                      </div>
                      <div>
                        <label className="field-label">Batch Num</label>
                        <input value={compBatchNum} onChange={e => setCompBatchNum(e.target.value)} type="text" placeholder="e.g. B-9821" className="field-input" />
                      </div>
                      <div>
                        <label className="field-label">Mfg Date</label>
                        <input value={compMfgDate} onChange={e => setCompMfgDate(e.target.value)} type="date" className="field-input py-2" />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="field-label">Expiry Date</label>
                        <input value={compExpDate} onChange={e => setCompExpDate(e.target.value)} type="date" className="field-input py-2" />
                      </div>
                      <div>
                        <label className="field-label">Purchase Date</label>
                        <input required value={compPurchaseDate} onChange={e => setCompPurchaseDate(e.target.value)} type="date" className="field-input py-2" />
                      </div>
                      <div>
                        <label className="field-label">Complaint Category</label>
                        <select value={compCategory} onChange={e => setCompCategory(e.target.value)} className="field-input py-2">
                          <option value="Adulteration">Adulteration</option>
                          <option value="Expired Product">Expired Product</option>
                          <option value="Fake Brand">Fake Brand</option>
                          <option value="Wrong Labelling">Wrong Labelling</option>
                          <option value="Food Poisoning">Food Poisoning</option>
                          <option value="Packaging Issue">Packaging Issue</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Vendor Info */}
                  <div className="flex flex-col gap-3">
                    <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-wider">2. Retailer / Vendor Details</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="field-label">Vendor Name</label>
                        <input required value={compVendorName} onChange={e => setCompVendorName(e.target.value)} type="text" placeholder="e.g. Vijay Kirana Store" className="field-input" />
                      </div>
                      <div>
                        <label className="field-label">Purchase Location</label>
                        <input value={compPurchaseLoc} onChange={e => setCompPurchaseLoc(e.target.value)} type="text" placeholder="e.g. Vastrapur Market" className="field-input" />
                      </div>
                    </div>
                  </div>

                  {/* Evidence Section (Mandatory validation) */}
                  <div className="flex flex-col gap-3.5 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-2xl p-4">
                    <div className="flex justify-between items-center">
                      <p className="text-[8px] font-black text-red-500 uppercase tracking-wider flex items-center gap-1">
                        <ShieldAlert size={10} /> 3. EVIDENCE ATTACHMENT (MANDATORY)
                      </p>
                      <span className="text-[8px] font-bold text-[var(--text-muted)]">Check at least ONE to verify proof</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <label className="flex items-center gap-2.5 p-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl cursor-pointer">
                        <input type="checkbox" checked={proofPhoto} onChange={() => setProofPhoto(!proofPhoto)} className="accent-brand-500 rounded" />
                        <span className="flex items-center gap-1"><MapPin size={12} className="text-brand-500" /> Product Photo</span>
                      </label>

                      <label className="flex items-center gap-2.5 p-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl cursor-pointer">
                        <input type="checkbox" checked={proofBill} onChange={() => setProofBill(!proofBill)} className="accent-brand-500 rounded" />
                        <span className="flex items-center gap-1"><FileSpreadsheet size={12} className="text-brand-500" /> Invoice/Bill</span>
                      </label>

                      <label className="flex items-center gap-2.5 p-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl cursor-pointer">
                        <input type="checkbox" checked={proofVideo} onChange={() => setProofVideo(!proofVideo)} className="accent-brand-500 rounded" />
                        <span className="flex items-center gap-1"><Video size={12} className="text-brand-500" /> Video Recording</span>
                      </label>

                      <label className="flex items-center gap-2.5 p-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl cursor-pointer">
                        <input type="checkbox" checked={proofLabReport} onChange={() => setProofLabReport(!proofLabReport)} className="accent-brand-500 rounded" />
                        <span className="flex items-center gap-1"><ClipboardCheck size={12} className="text-brand-500" /> Laboratory Report</span>
                      </label>
                    </div>

                    {/* AI Verification status */}
                    <div className="flex justify-between items-center text-[9px] border-t border-[var(--border-color)]/60 pt-3 mt-1 font-bold">
                      <span className="flex items-center gap-1">
                        AI Status: {hasEvidenceAttached ? (
                          <span className="text-green-500 flex items-center gap-0.5"><Check size={8} /> Evidence Uploaded</span>
                        ) : (
                          <span className="text-red-500">Missing Required Evidence</span>
                        )}
                      </span>
                      <span className="theme-text">Completeness: <strong className="text-brand-500 font-mono">{complaintCompleteness}%</strong></span>
                    </div>
                  </div>

                  <div>
                    <label className="field-label">Additional Details / Symptom description</label>
                    <textarea required value={compDescription} onChange={e => setCompDescription(e.target.value)} placeholder="Describe the safety hazard in details..." rows="3" className="field-input resize-none" />
                  </div>

                  {complaintSuccess && (
                    <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-bold rounded-xl">
                      {complaintSuccess}
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={!hasEvidenceAttached || submittingComplaint}
                    className="btn-primary w-full py-4 text-xs font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-1.5 shadow-lg shadow-brand-500/15 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    <span>{submittingComplaint ? 'SUBMITTING COMPLAINT...' : 'REGISTER CONSUMER COMPLAINT'}</span>
                    <ArrowRight size={14} />
                  </button>
                </form>
              </div>

              {/* History */}
              <div className="flex flex-col gap-3">
                <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest pl-1">My Safety Complaints</h3>
                {complaints.length === 0 ? (
                  <p className="text-xs text-[var(--text-muted)] font-bold text-center py-4">No filed complaints records found.</p>
                ) : (
                  complaints.map(comp => (
                    <div key={comp.id} className="card p-4.5 flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-sm theme-text">{comp.product_name}</h4>
                          <p className="text-[8px] text-[var(--text-muted)] font-bold font-mono uppercase mt-1">{comp.complaint_id}</p>
                        </div>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                          comp.status === 'Resolved' || comp.status === 'Verified' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                          comp.status === 'Under Review' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                          'bg-gray-500/10 text-gray-400 border-gray-500/20'
                        }`}>
                          {comp.status}
                        </span>
                      </div>

                      <p className="text-xs text-[var(--text-secondary)] font-medium bg-[var(--bg-elevated)] p-3 rounded-xl border border-[var(--border-color)]">
                        {comp.description}
                      </p>

                      <div className="flex justify-between items-center text-[9px] text-[var(--text-muted)] font-bold border-t border-[var(--border-color)]/60 pt-3 mt-1 pl-1">
                        <span>Vendor: {comp.vendor_name}</span>
                        <span>City: {comp.city}</span>
                      </div>

                      {/* Timeline details tracker */}
                      <button 
                        onClick={() => setExpandedComplaint(expandedComplaint === comp.complaint_id ? null : comp.complaint_id)}
                        className="w-full mt-1.5 py-2.5 bg-[var(--bg-elevated)] hover:bg-[var(--hover-bg)] text-[9px] font-black uppercase tracking-widest rounded-xl text-[var(--text-secondary)] hover:theme-text border border-[var(--border-color)] flex items-center justify-center gap-1 transition-all"
                      >
                        <span>TRACK COMPLAINT TIMELINE</span>
                        <ChevronRight size={12} className={`transition-transform duration-300 ${expandedComplaint === comp.complaint_id ? 'rotate-90' : ''}`} />
                      </button>

                      {expandedComplaint === comp.complaint_id && (
                        <div className="mt-3 pl-3.5 border-l-2 border-brand-500/35 flex flex-col gap-3.5 pt-1 animate-fade-in">
                          {(comp.timeline || []).map((t, idx) => (
                            <div key={idx} className="relative">
                              <div className="absolute -left-[20px] top-1 w-2.5 h-2.5 rounded-full bg-brand-500 border-2 border-[var(--bg-card)] shadow-md" />
                              <div className="flex justify-between items-start">
                                <span className="text-[10px] font-black theme-text uppercase tracking-wide">{t.status}</span>
                                <span className="text-[8px] text-[var(--text-muted)] font-mono">{t.date}</span>
                              </div>
                              <p className="text-[9px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">{t.desc}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Sub-tab: Vendor Intelligence */}
          {activeTab === 'vendors' && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div className="flex justify-between items-center pl-1">
                <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-wider">Vendor Risk Classifications</span>
                <span className="text-[8px] text-green-500 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded uppercase tracking-wider font-mono">FSSAI Monitored</span>
              </div>

              {vendors.map(v => (
                <div 
                  key={v.id}
                  className={`card p-4.5 border ${
                    v.riskLevel === 'Safe' ? 'border-green-500/20 bg-green-500/[0.01]' :
                    v.riskLevel === 'Observation' ? 'border-amber-500/20 bg-amber-500/[0.01]' :
                    'border-red-500/20 bg-red-500/[0.01]'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-sm theme-text">{v.name}</h4>
                      <p className="text-[9px] text-[var(--text-secondary)] font-bold uppercase mt-1 flex items-center gap-1">
                        <MapPin size={10} className="text-brand-500" /> {v.district}
                      </p>
                    </div>
                    
                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                      v.riskLevel === 'Safe' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                      v.riskLevel === 'Observation' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                      'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                      {v.riskLevel}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl p-3 text-center mb-3">
                    <div>
                      <p className="text-[7px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-0.5">Trust Score</p>
                      <p className={`text-xs font-black font-mono ${
                        v.riskLevel === 'Safe' ? 'text-green-500' : v.riskLevel === 'Observation' ? 'text-amber-500' : 'text-red-500'
                      }`}>{v.trustScore}%</p>
                    </div>
                    <div className="border-x border-[var(--border-color)]">
                      <p className="text-[7px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-0.5">Passed Tests</p>
                      <p className="text-xs font-black theme-text font-mono">{v.successfulTests}</p>
                    </div>
                    <div>
                      <p className="text-[7px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-0.5">Failed Tests</p>
                      <p className="text-xs font-black text-red-500 font-mono">{v.failedTests}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[9px] text-[var(--text-muted)] font-bold pl-1">
                    <span>Inspection: {v.lastInspection}</span>
                    <span className="flex items-center gap-0.5">
                      Rating: <Sparkles size={8} className="text-brand-500 fill-current" /> {v.riskLevel === 'Safe' ? '4.8 / 5.0' : '3.1 / 5.0'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sub-tab: Food Testing Laboratories */}
          {activeTab === 'labs' && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="card p-5 border border-[var(--border-color)]">
                <h3 className="text-[10px] font-black theme-text uppercase tracking-widest border-b border-[var(--border-color)] pb-3 mb-4 flex items-center gap-2">
                  <Compass size={14} className="text-brand-500" />
                  <span>Testing Laboratory Locator</span>
                </h3>

                {/* Autocomplete City search */}
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                    {labSearchLoading ? (
                      <div className="w-4 h-4 border-2 border-[var(--border-color)] border-t-brand-500 rounded-full animate-spin" />
                    ) : (
                      <Search size={14} />
                    )}
                  </div>
                  <input
                    value={labSearchText}
                    onChange={handleLabSearch}
                    type="text"
                    placeholder="Search city or district in India..."
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] focus:border-brand-500 text-xs theme-text rounded-xl py-3 pl-9 pr-4 outline-none transition-all placeholder-gray-500"
                  />
                  {labSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl mt-1.5 shadow-2xl overflow-hidden z-50">
                      {labSuggestions.map(s => (
                        <button
                          key={s.state + s.city}
                          onClick={() => {
                            setLabSearchText(s.city);
                            setLabSuggestions([]);
                            setLabSearchedCoords([s.lat, s.lng]);
                          }}
                          className="w-full text-left p-3 text-xs hover:bg-[var(--hover-bg)] font-bold uppercase tracking-wider theme-text border-b border-[var(--border-color)]/30 flex justify-between items-center"
                        >
                          <span>{s.city} <span className="text-[8px] text-[var(--text-muted)] font-normal ml-1">({s.state.slice(0, 30)}...)</span></span>
                          <ChevronRight size={10} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Filter buttons */}
                <div className="grid grid-cols-3 gap-2 mt-3.5">
                  <button onClick={() => setFilterLabCert('govt')} className={`py-2 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all ${filterLabCert === 'govt' ? 'bg-brand-500/10 border-brand-500 text-brand-500' : 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-[var(--text-secondary)]'}`}>Govt Labs</button>
                  <button onClick={() => setFilterLabCert('private')} className={`py-2 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all ${filterLabCert === 'private' ? 'bg-brand-500/10 border-brand-500 text-brand-500' : 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-[var(--text-secondary)]'}`}>Private Labs</button>
                  <button onClick={() => setFilterLabCert('fssai')} className={`py-2 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all ${filterLabCert === 'fssai' ? 'bg-brand-500/10 border-brand-500 text-brand-500' : 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-[var(--text-secondary)]'}`}>FSSAI Certified</button>
                </div>
              </div>

              {/* Lab listings */}
              <div className="flex flex-col gap-3.5">
                {filteredLabs.length === 0 ? (
                  <div className="card p-6 text-center border border-dashed border-[var(--border-color)]">
                    <p className="text-xs text-[var(--text-muted)] font-bold uppercase mb-2">No laboratory found in this city</p>
                    {nearestLabSuggestion && (
                      <div className="mt-3 p-3 bg-brand-500/5 rounded-xl border border-brand-500/20 text-left">
                        <p className="text-[7px] text-[var(--text-muted)] font-black uppercase tracking-wider mb-1">Suggesting Nearest Lab</p>
                        <h4 className="text-xs font-black theme-text leading-tight">{nearestLabSuggestion.name}</h4>
                        <p className="text-[8px] text-[var(--text-muted)] mt-0.5">{nearestLabSuggestion.address}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  filteredLabs.map(lab => (
                    <div key={lab.id} className="card p-4.5 flex flex-col gap-3.5 border border-[var(--border-color)] hover:border-brand-500/30 transition-all">
                      
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-xs theme-text leading-tight">{lab.name}</h4>
                          <span className="text-[8px] font-black text-brand-500 bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 rounded uppercase mt-2 inline-block">
                            {lab.isGovt ? 'Government Lab' : 'Private Lab'}
                          </span>
                        </div>
                        
                        <div className="text-right">
                          <span className="text-[8px] font-black text-green-500 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded uppercase">
                            {lab.status}
                          </span>
                          {lab.distance && <p className="text-[8px] text-[var(--text-muted)] font-bold mt-1.5 font-mono">~{lab.distance} km</p>}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 text-xs text-[var(--text-secondary)] border-t border-[var(--border-color)] pt-3.5">
                        <div className="flex items-start gap-2">
                          <MapPin size={12} className="text-brand-500 shrink-0 mt-0.5" />
                          <span>{lab.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={12} className="text-brand-500 shrink-0" />
                          <span>{lab.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={12} className="text-brand-500 shrink-0" />
                          <span>Hours: {lab.working_hours}</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[var(--border-color)]/50">
                        <button 
                          onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(lab.name)}`)}
                          className="py-2.5 bg-[#121214] text-white border border-[#26262a] dark:bg-[#1c1c1f] rounded-xl text-[8px] font-black uppercase tracking-widest flex items-center justify-center gap-1 hover:theme-text transition-colors"
                        >
                          <Navigation size={10} className="rotate-45" />
                          <span>Directions</span>
                        </button>
                        <a 
                          href={`tel:${lab.phone}`}
                          className="py-2.5 bg-[#121214] text-white border border-[#26262a] dark:bg-[#1c1c1f] rounded-xl text-[8px] font-black uppercase tracking-widest flex items-center justify-center gap-1 hover:theme-text transition-colors"
                        >
                          <PhoneCall size={10} />
                          <span>Call Lab</span>
                        </a>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(lab.address);
                            alert('Address copied to clipboard!');
                          }}
                          className="py-2.5 bg-[#121214] text-white border border-[#26262a] dark:bg-[#1c1c1f] rounded-xl text-[8px] font-black uppercase tracking-widest flex items-center justify-center gap-1 hover:theme-text transition-colors"
                        >
                          <Copy size={10} />
                          <span>Copy Addr</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Sub-tab: Government Recall Alerts */}
          {activeTab === 'alerts' && (
            <div className="flex flex-col gap-6 animate-fade-in">
              
              <div className="flex gap-2">
                <select 
                  value={alertFilterSeverity}
                  onChange={e => setAlertFilterSeverity(e.target.value)}
                  className="flex-1 bg-[var(--bg-card)] border border-[var(--border-color)] theme-text rounded-xl py-2 px-3 text-[10px] font-bold uppercase tracking-wider outline-none appearance-none cursor-pointer"
                >
                  <option value="all">All Recall Alerts</option>
                  <option value="Critical">Critical Alerts</option>
                  <option value="High">High Severity</option>
                  <option value="Medium">Medium Severity</option>
                </select>

                <select 
                  value={alertFilterDate}
                  onChange={e => setAlertFilterDate(e.target.value)}
                  className="flex-1 bg-[var(--bg-card)] border border-[var(--border-color)] theme-text rounded-xl py-2 px-3 text-[10px] font-bold uppercase tracking-wider outline-none appearance-none cursor-pointer"
                >
                  <option value="all">Any Date</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>

              {processedAlerts.map(alert => (
                <div key={alert.id} className="card p-4.5 flex flex-col gap-4 border border-[var(--border-color)]">
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-xs theme-text leading-tight">{alert.product_name}</h4>
                      <p className="text-[8px] text-[var(--text-muted)] font-black uppercase tracking-wider mt-1.5 font-mono">Ref: {alert.ref_num || 'FSSAI-REC-000'}</p>
                    </div>
                    
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border tracking-wider ${
                      alert.severity === 'Critical' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                      alert.severity === 'High' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                      'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    }`}>
                      {alert.severity} Recall
                    </span>
                  </div>

                  {alert.image && (
                    <img src={alert.image} alt={alert.product_name} className="w-full h-32 object-cover rounded-xl border border-[var(--border-color)]" />
                  )}

                  <p className="text-xs text-[var(--text-secondary)] bg-[var(--bg-elevated)] p-3 rounded-xl border border-[var(--border-color)] leading-relaxed">
                    <strong>Reason for recall:</strong> {alert.reason}
                  </p>

                  <div className="flex flex-col gap-1.5 text-xs text-[var(--text-secondary)] pl-1">
                    <div className="flex items-center gap-2">
                      <ShieldAlert size={12} className="text-red-500 shrink-0" />
                      <span>Consumer action: <strong className="text-red-500">{alert.recommended_action}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={12} className="text-brand-500 shrink-0" />
                      <span>Issued: <strong>{alert.issue_date} by {alert.issued_by}</strong></span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border-color)]/50">
                    <button 
                      onClick={() => alert(`Opening official government recall document reference: ${alert.ref_num}`)}
                      className="py-2.5 bg-[#121214] text-white border border-[#26262a] dark:bg-[#1c1c1f] rounded-xl text-[8px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 hover:theme-text transition-colors"
                    >
                      <FileText size={10} />
                      <span>Read Official Notice</span>
                    </button>
                    <button 
                      onClick={() => alert(`Saved alert ${alert.id} to profile saved notifications.`)}
                      className="py-2.5 bg-[#121214] text-white border border-[#26262a] dark:bg-[#1c1c1f] rounded-xl text-[8px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 hover:theme-text transition-colors"
                    >
                      <Plus size={10} />
                      <span>Save Alert</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Fallback menu */}
          {activeTab === 'dashboard' && (
            <div className="card p-5 text-center border-dashed border-[var(--border-color)] bg-[var(--bg-card)]">
              <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider">Tap a stat card above to explore detailed protection modules</p>
            </div>
          )}

        </div>
      ) : (
        // ============================================================
        // 🍱 SURPLUS NGO RESCUE SCREEN VIEW (SLIDE-UP SCREEN)
        // ============================================================
        <div className="px-5 pt-6 flex flex-col gap-6 animate-fade-in relative z-20">
          
          {/* Autocomplete Location Geocoder Search */}
          <div className="card p-5 border border-[var(--border-color)]">
            <h3 className="text-[10px] font-black theme-text uppercase tracking-widest border-b border-[var(--border-color)] pb-3 mb-4 flex items-center gap-2">
              <Compass size={14} className="text-brand-500" />
              <span>Search NGO Rescue Center</span>
            </h3>

            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                {ngoSearchLoading ? (
                  <div className="w-4 h-4 border-2 border-[var(--border-color)] border-t-brand-500 rounded-full animate-spin" />
                ) : (
                  <Search size={14} />
                )}
              </div>
              <input
                value={ngoSearchText}
                onChange={handleNgoSearch}
                type="text"
                placeholder="Search city, district or state..."
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] focus:border-brand-500 text-xs theme-text rounded-xl py-3 pl-9 pr-4 outline-none transition-all placeholder-gray-500"
              />
              {ngoSuggestions.length > 0 && (
                <div className="absolute top-full left-0 w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl mt-1.5 shadow-2xl overflow-hidden z-50">
                  {ngoSuggestions.map(s => (
                    <button
                      key={s.state + s.city}
                      onClick={() => {
                        setNgoSearchText(s.city);
                        setNgoSuggestions([]);
                        setNgoSearchedCoords([s.lat, s.lng]);
                        setMapCenter([s.lat, s.lng]);
                        setMapZoom(12);
                      }}
                      className="w-full text-left p-3.5 text-xs hover:bg-[var(--hover-bg)] font-bold uppercase tracking-wider theme-text border-b border-[var(--border-color)]/30 flex justify-between items-center"
                    >
                      <span>{s.city} <span className="text-[8px] text-[var(--text-muted)] font-normal ml-1">({s.state.slice(0, 30)}...)</span></span>
                      <ChevronRight size={10} />
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button 
              onClick={handleGPSLocation}
              className="w-full mt-3 py-3 border border-[var(--border-color)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] font-bold uppercase tracking-widest text-[9px] rounded-xl flex items-center justify-center gap-1.5 active:scale-98 transition-all hover:bg-[var(--hover-bg)]"
            >
              <Compass size={12} />
              <span>Use Current GPS Location</span>
            </button>
          </div>

          {/* --- LEAFLET MAP VIEW --- */}
          <div className="h-64 w-full relative border border-[var(--border-color)] rounded-3xl overflow-hidden z-0">
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              scrollWheelZoom={true}
              className="w-full h-full"
              zoomControl={false}
            >
              <TileLayer
                url={document.documentElement.classList.contains('dark')
                  ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                }
                attribution='&copy; CartoDB'
              />
              <ChangeMapView center={mapCenter} zoom={mapZoom} />

              {/* Blue geocoding pin */}
              {ngoSearchedCoords && (
                <Marker
                  position={ngoSearchedCoords}
                  icon={blueSearchIcon}
                />
              )}

              {/* NGOs colored pins */}
              {filteredNgos.map(ngo => (
                <Marker
                  key={ngo.id}
                  position={[ngo.lat, ngo.lng]}
                  icon={ngo.status === 'Available' ? greenNgoIcon : ngo.status === 'Busy' ? orangeNgoIcon : greyNgoIcon}
                  eventHandlers={{
                    click: () => {
                      setSelectedNgo(ngo);
                      setMapCenter([ngo.lat, ngo.lng]);
                      setMapZoom(14);
                    }
                  }}
                />
              ))}
            </MapContainer>
          </div>

          {/* --- SELECTED NGO DONATION FORM OVERLAY --- */}
          {selectedNgo && (
            <div className="card p-6 border-2 border-brand-500 bg-[var(--bg-card)] shadow-2xl relative animate-slide-up">
              <button 
                onClick={() => setSelectedNgo(null)}
                className="absolute top-4 right-4 w-7 h-7 bg-[var(--bg-elevated)] rounded-full flex items-center justify-center text-[var(--text-muted)] hover:theme-text transition-colors"
              >
                <X size={14} />
              </button>

              <div className="flex items-start gap-3 mb-4">
                <span className="text-xl">🏢</span>
                <div>
                  <h3 className="font-bold text-sm theme-text leading-tight">{selectedNgo.name}</h3>
                  <p className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-wider mt-1">{selectedNgo.reg_number}</p>
                </div>
              </div>

              <div className="bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl p-3.5 text-xs text-[var(--text-secondary)] mb-4 flex flex-col gap-1.5">
                <p><strong>Description:</strong> {selectedNgo.description}</p>
                <p><strong>Daily Capacity:</strong> {selectedNgo.capacity}</p>
                <p><strong>Accepted Foods:</strong> {selectedNgo.food_types.join(', ')}</p>
                <p><strong>Operational Radius:</strong> {selectedNgo.distance || 3.5} km</p>
              </div>

              {/* Donation form */}
              <form onSubmit={handleNgoDonationSubmit} className="flex flex-col gap-3.5 border-t border-[var(--border-color)]/60 pt-4">
                <h4 className="text-[9px] font-black text-brand-500 uppercase tracking-widest leading-none mb-1">Surplus Food Submission</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="field-label">Food Type</label>
                    <select value={donateFoodType} onChange={e => setDonateFoodType(e.target.value)} className="field-input py-2">
                      <option value="Cooked Food">Cooked Food</option>
                      <option value="Veg">Veg Raw</option>
                      <option value="Non Veg">Non Veg Raw</option>
                      <option value="Dry Food">Dry Packaged</option>
                      <option value="Snacks">Prepared Snacks</option>
                    </select>
                  </div>
                  <div>
                    <label className="field-label">Meals Count</label>
                    <input required value={donateMealsCount} onChange={e => setDonateMealsCount(e.target.value)} type="number" placeholder="e.g. 50" className="field-input font-mono" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="field-label">Weight (kg)</label>
                    <input required value={donateQuantityKg} onChange={e => setDonateQuantityKg(e.target.value)} type="number" placeholder="e.g. 15" className="field-input font-mono" />
                  </div>
                  <div>
                    <label className="field-label">Expiry (Hours)</label>
                    <select value={donateExpiryHours} onChange={e => setDonateExpiryHours(e.target.value)} className="field-input py-2">
                      <option value="2">2 Hours</option>
                      <option value="4">4 Hours</option>
                      <option value="6">6 Hours</option>
                      <option value="12">12 Hours</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="field-label">Contact Person</label>
                    <input required value={donateContactPerson} onChange={e => setDonateContactPerson(e.target.value)} type="text" placeholder="Your Name" className="field-input" />
                  </div>
                  <div>
                    <label className="field-label">Contact Phone</label>
                    <input required value={donatePhone} onChange={e => setDonatePhone(e.target.value)} type="text" placeholder="Phone Number" className="field-input font-mono" />
                  </div>
                </div>

                <div>
                  <label className="field-label">Pickup Address</label>
                  <input required value={donateAddress} onChange={e => setDonateAddress(e.target.value)} type="text" placeholder="e.g. Vastrapur Banquet Hall" className="field-input" />
                </div>

                <div>
                  <label className="field-label">Special Instructions / Allergies</label>
                  <input value={donateInstructions} onChange={e => setDonateInstructions(e.target.value)} type="text" placeholder="e.g. Needs refrigeration, keep separate" className="field-input" />
                </div>

                {donationSuccess && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-bold rounded-xl">
                    {donationSuccess}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={submittingDonation}
                  className="btn-primary w-full py-4 text-xs font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-1.5 shadow-lg shadow-brand-500/15"
                >
                  <span>{submittingDonation ? 'SCHEDULING PICKUP...' : 'REGISTER RESCUE DONATION'}</span>
                  <ArrowRight size={14} />
                </button>
              </form>
            </div>
          )}

          {/* Active rescue donations tracking list */}
          <div className="flex flex-col gap-3">
            <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest pl-1">Donation Tracking Status</h3>
            {ngoDonations.length === 0 ? (
              <div className="card p-6 text-center border border-dashed border-[var(--border-color)]">
                <p className="text-xs text-[var(--text-muted)] font-bold uppercase">No active surplus donations registered</p>
              </div>
            ) : (
              ngoDonations.map(don => (
                <div key={don.id} className="card p-4.5 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-xs theme-text">Food Surplus: {don.food_type}</h4>
                      <p className="text-[8px] text-[var(--text-muted)] font-bold uppercase tracking-wider font-mono mt-1">Meals Count: ~{don.meals_count} ({don.quantity_kg} kg)</p>
                    </div>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                      don.status === 'Completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                      'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    }`}>
                      {don.status}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] font-medium pl-1">
                    Pickup: {don.pickup_address} • Expiry: {new Date(don.expiry_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                  </p>

                  <button 
                    onClick={() => setExpandedDonation(expandedDonation === don.id ? null : don.id)}
                    className="w-full mt-1 py-2 bg-[var(--bg-elevated)] hover:bg-[var(--hover-bg)] text-[9px] font-black uppercase tracking-widest rounded-xl text-[var(--text-secondary)] hover:theme-text border border-[var(--border-color)] flex items-center justify-center gap-1 transition-all"
                  >
                    <span>TRACK DONATION TIMELINE</span>
                    <ChevronRight size={12} className={`transition-transform duration-300 ${expandedDonation === don.id ? 'rotate-90' : ''}`} />
                  </button>

                  {expandedDonation === don.id && (
                    <div className="mt-3 pl-3.5 border-l-2 border-brand-500/30 flex flex-col gap-3 pt-1 animate-fade-in">
                      <div className="relative">
                        <div className="absolute -left-[20px] top-1 w-2 h-2 rounded-full bg-brand-500" />
                        <p className="text-[10px] font-black theme-text uppercase">Pending Approval</p>
                        <p className="text-[9px] text-[var(--text-secondary)]">Donation submitted to NGO dashboard.</p>
                      </div>
                      <div className="relative">
                        <div className={`absolute -left-[20px] top-1 w-2 h-2 rounded-full ${don.status !== 'Pending' ? 'bg-brand-500' : 'bg-gray-400'}`} />
                        <p className="text-[10px] font-black theme-text uppercase">NGO Accepted</p>
                        <p className="text-[9px] text-[var(--text-secondary)]">NGO volunteer dispatcher assigned.</p>
                      </div>
                      <div className="relative">
                        <div className={`absolute -left-[20px] top-1 w-2 h-2 rounded-full ${don.status === 'Completed' ? 'bg-brand-500' : 'bg-gray-400'}`} />
                        <p className="text-[10px] font-black theme-text uppercase">Delivered & Rescued</p>
                        <p className="text-[9px] text-[var(--text-secondary)]">Meals successfully distributed to nearby communities.</p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* List verified NGOs operating nearby */}
          <div className="flex flex-col gap-3 mt-4">
            <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest pl-1">Verified Partner Food Banks</h3>
            
            {filteredNgos.map(ngo => (
              <div 
                key={ngo.id} 
                onClick={() => {
                  setSelectedNgo(ngo);
                  setMapCenter([ngo.lat, ngo.lng]);
                  setMapZoom(14);
                }}
                className="card p-4.5 flex flex-col gap-3.5 border border-[var(--border-color)] hover:border-brand-500/30 transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-xs theme-text group-hover:text-brand-500 transition-colors">{ngo.name}</h4>
                    <p className="text-[9px] text-green-500 font-bold uppercase tracking-wider mt-1 flex items-center gap-1">
                      <ShieldCheck size={12} /> VERIFIED FSSAI PARTNER
                    </p>
                  </div>
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                    ngo.status === 'Available' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                  }`}>
                    {ngo.status}
                  </span>
                </div>

                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {ngo.description}
                </p>

                <div className="grid grid-cols-2 gap-2 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl p-3 text-center text-[10px]">
                  <div>
                    <p className="text-[7px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-0.5">Registration Number</p>
                    <p className="font-bold font-mono theme-text">{ngo.reg_number}</p>
                  </div>
                  <div className="border-l border-[var(--border-color)]">
                    <p className="text-[7px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-0.5">Rescues Completed</p>
                    <p className="font-bold font-mono text-green-500">{ngo.past_donations} meals</p>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[9px] text-[var(--text-muted)] font-bold pl-1 pt-1">
                  <span>Rating: {ngo.rating} / 5.0</span>
                  <span className="text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest flex items-center gap-0.5">
                    Open Donation Form <ChevronRight size={10} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
