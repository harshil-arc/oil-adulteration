import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "home": {
        "greeting": "Hey, Inspector",
        "title": "PureOil Dashboard",
        "start_scan": "START SCAN",
        "total_scans": "TOTAL SCANS",
        "safe_oils": "SAFE OILS",
        "unsafe_oils": "UNSAFE OILS",
        "waiting": "Awaiting Sensor Data...",
        "ai_powered": "AI Powered",
        "ask_ai": "ASK AI",
        "test_oil": "Test Your Oil",
        "hero_desc": "Detect adulterants instantly with your ESP32 sensor.",
        "device_offline": "DEVICE OFFLINE",
        "connect_esp": "Connect ESP to enable scan",
        "report_oil": "Report Adulterated Oil",
        "recent_scans": "Recent Scans",
        "view_all": "View All",
        "no_scans": "No scans yet.",
        "tap_to_begin": "Tap Start Scan to begin"
      },
      "profile": {
        "title": "My Profile",
        "settings": "Settings",
        "language": "Language",
        "dark_mode": "AMOLED Dark Mode",
        "privacy": "Privacy & Security",
        "logout": "SIGN OUT",
        "notifications": "Notifications",
        "hw_connection": "Hardware Connection",
        "about": "About PureOil",
        "learning": "Learning Center",
        "fssai_guidelines": "FSSAI Guidelines",
        "edit_profile": "Edit Profile"
      },
      "common": {
        "loading": "Loading...",
        "save": "Save",
        "cancel": "Cancel",
        "done": "Done",
        "safe": "Safe",
        "unsafe": "Unsafe"
      }
    }
  },
  hi: {
    translation: {
      "home": {
        "greeting": "नमस्ते, इंस्पेक्टर",
        "title": "प्योरऑयल डैशबोर्ड",
        "start_scan": "स्कैन शुरू करें",
        "total_scans": "कुल स्कैन",
        "safe_oils": "सुरक्षित तेल",
        "unsafe_oils": "असुरक्षित तेल",
        "waiting": "सेंसर डेटा की प्रतीक्षा है...",
        "ai_powered": "AI द्वारा संचालित",
        "ask_ai": "AI से पूछें",
        "test_oil": "अपने तेल का परीक्षण करें",
        "hero_desc": "अपने ESP32 सेंसर से तुरंत मिलावट का पता लगाएं।",
        "device_offline": "डिवाइस ऑफलाइन है",
        "connect_esp": "स्कैन शुरू करने के लिए ESP कनेक्ट करें",
        "report_oil": "मिलावटी तेल की रिपोर्ट करें",
        "recent_scans": "हाल के स्कैन",
        "view_all": "सभी देखें",
        "no_scans": "अभी तक कोई स्कैन नहीं।",
        "tap_to_begin": "शुरू करने के लिए 'स्कैन शुरू करें' पर टैप करें"
      },
      "profile": {
        "title": "मेरी प्रोफाइल",
        "settings": "सेटिंग्स",
        "language": "भाषा",
        "dark_mode": "AMOLED डार्क मोड",
        "privacy": "गोपनीयता और सुरक्षा",
        "logout": "साइन आउट",
        "notifications": "सूचनाएं",
        "hw_connection": "हार्डवेयर कनेक्शन",
        "about": "प्योरऑयल के बारे में",
        "learning": "लर्निंग सेंटर",
        "fssai_guidelines": "FSSAI दिशानिर्देश",
        "edit_profile": "प्रोफाइल संपादित करें"
      },
      "common": {
        "loading": "लोड हो रहा है...",
        "save": "सहेजें",
        "cancel": "रद्द करें",
        "done": "हो गया",
        "safe": "सुरक्षित",
        "unsafe": "असुरक्षित"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    }
  });

export default i18n;
