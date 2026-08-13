import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
];

const resources = {
  en: {
    translation: {
      "home": {
        "greeting": "Hey, Inspector",
        "title": "Food 360 Dashboard",
        "start_scan": "START SCAN",
        "total_scans": "TOTAL SCANS",
        "safe_oils": "SAFE OILS",
        "unsafe_oils": "UNSAFE OILS",
        "waiting": "Awaiting Sensor Data...",
        "ai_powered": "AI Powered",
        "ask_ai": "ASK AI",
        "test_oil": "Test Your Oil",
        "hero_desc": "Detect adulterants instantly with your rapid testing sensor.",
        "device_offline": "DEVICE OFFLINE",
        "connect_esp": "Connect testing device to enable scan",
        "report_oil": "Report Adulterated Oil",
        "recent_scans": "Recent Scans",
        "view_all": "View All",
        "no_scans": "No scans yet.",
        "tap_to_begin": "Tap Start Scan to begin"
      },
      "profile": {
        "title": "My Profile",
        "subtitle": "Personal Identity & Native Language Settings",
        "select_language": "Select Native Language",
        "native_language": "Native Language",
        "choose_language_desc": "Choose your primary preferred language for the interface",
        "settings": "Preferences & Settings",
        "language": "Language",
        "dark_mode": "AMOLED Dark Mode",
        "theme_mode": "Theme Mode",
        "privacy": "Privacy & Security",
        "logout": "SIGN OUT",
        "notifications": "Notifications",
        "hw_connection": "Hardware Connection",
        "about": "About Food 360",
        "learning": "Learning Center",
        "fssai_guidelines": "FSSAI Guidelines",
        "edit_profile": "Edit Profile",
        "save_changes": "Save Changes",
        "close": "Close"
      },
      "settings": {
        "title": "Settings",
        "subtitle": "Hardware Configuration & Preferences",
        "network": "Network & Integration",
        "device": "Device Management",
        "preferences": "User Preferences",
        "calibrate": "Recalibrate Sensor"
      },
      "nav": {
        "dashboard": "Dashboard",
        "oil_analysis": "Oil Analysis",
        "physical_testing": "Physical Oil Testing",
        "safety_hotspots": "Safety Hotspots",
        "community": "Safety Intelligence",
        "disaster": "Disaster & Emergency",
        "relief": "Food Relief & Donations",
        "oilwise": "OilWise Advisor",
        "fitness": "AI Fitness Coach",
        "learning": "Learning Center",
        "reports": "System Reports",
        "profile_settings": "Profile Settings",
        "about": "About System"
      },
      "common": {
        "loading": "Loading...",
        "save": "Save",
        "cancel": "Cancel",
        "done": "Done",
        "safe": "Safe",
        "unsafe": "Unsafe",
        "active": "Active",
        "connected": "Connected",
        "offline": "Offline",
        "back": "Back",
        "select": "Select"
      }
    }
  },
  hi: {
    translation: {
      "home": {
        "greeting": "नमस्ते, इंस्पेक्टर",
        "title": "फूड 360 डैशबोर्ड",
        "start_scan": "स्कैन शुरू करें",
        "total_scans": "कुल स्कैन",
        "safe_oils": "सुरक्षित तेल",
        "unsafe_oils": "असुरक्षित तेल",
        "waiting": "सेंसर डेटा की प्रतीक्षा है...",
        "ai_powered": "एआई संचालित",
        "ask_ai": "एआई से पूछें",
        "test_oil": "अपने तेल की जांच करें",
        "hero_desc": "अपने पोर्टेबल सेंसर से तुरंत मिलावट का पता लगाएं।",
        "device_offline": "डिवाइस ऑफलाइन है",
        "connect_esp": "स्कैन शुरू करने के लिए सेंसर कनेक्ट करें",
        "report_oil": "मिलावटी तेल की रिपोर्ट करें",
        "recent_scans": "हाल के स्कैन",
        "view_all": "सभी देखें",
        "no_scans": "अभी तक कोई स्कैन नहीं।",
        "tap_to_begin": "शुरू करने के लिए 'स्कैन शुरू करें' पर टैप करें"
      },
      "profile": {
        "title": "मेरी प्रोफाइल",
        "subtitle": "व्यक्तिगत पहचान और मातृभाषा सेटिंग्स",
        "select_language": "मातृभाषा चुनें",
        "native_language": "मातृभाषा",
        "choose_language_desc": "अपनी पसंदीदा क्षेत्रीय भाषा चुनें",
        "settings": "प्राथमिकताएं और सेटिंग्स",
        "language": "भाषा",
        "dark_mode": "डार्क मोड",
        "theme_mode": "थीम मोड",
        "privacy": "गोपनीयता और सुरक्षा",
        "logout": "साइन आउट",
        "notifications": "सूचनाएं",
        "hw_connection": "हार्डवेयर कनेक्शन",
        "about": "फूड 360 के बारे में",
        "learning": "लर्निंग सेंटर",
        "fssai_guidelines": "एफएसएसएआई दिशानिर्देश",
        "edit_profile": "प्रोफाइल संपादित करें",
        "save_changes": "बदलाव सहेजें",
        "close": "बंद करें"
      },
      "settings": {
        "title": "सेटिंग्स",
        "subtitle": "हार्डवेयर कॉन्फ़िगरेशन और प्राथमिकताएं",
        "network": "नेटवर्क और इंटीग्रेशन",
        "device": "डिवाइस प्रबंधन",
        "preferences": "उपयोगकर्ता प्राथमिकताएं",
        "calibrate": "सेंसर रीकैलिव्रेट करें"
      },
      "nav": {
        "dashboard": "डैशबोर्ड",
        "oil_analysis": "तेल विश्लेषण",
        "physical_testing": "भौतिक तेल परीक्षण",
        "safety_hotspots": "सुरक्षा हॉटस्पॉट",
        "community": "समुदाय और शिकायतें",
        "disaster": "आपदा एवं आपातकाल",
        "relief": "खाद्य राहत",
        "oilwise": "ऑयलवाइज़ सलाहकार",
        "fitness": "एआई फिटनेस कोच",
        "learning": "लर्निंग सेंटर",
        "reports": "सिस्टम रिपोर्ट",
        "profile_settings": "प्रोफाइल सेटिंग्स",
        "about": "ऐप के बारे में"
      },
      "common": {
        "loading": "लोड हो रहा है...",
        "save": "सहेजें",
        "cancel": "रद्द करें",
        "done": "हो गया",
        "safe": "सुरक्षित",
        "unsafe": "असुरक्षित",
        "active": "सक्रिय",
        "connected": "कनेक्टेड",
        "offline": "ऑफलाइन",
        "back": "वापस",
        "select": "चुनें"
      }
    }
  },
  kn: {
    translation: {
      "home": {
        "greeting": "ನಮಸ್ಕಾರ, ಇನ್ಸ್‌ಪೆಕ್ಟರ್",
        "title": "ಫುಡ್ 360 ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
        "start_scan": "ಸ್ಕ್ಯಾನ್ ಪ್ರಾರಂಭಿಸಿ",
        "total_scans": "ಒಟ್ಟು ಸ್ಕ್ಯಾನ್‌ಗಳು",
        "safe_oils": "ಸುರಕ್ಷಿತ ಎಣ್ಣೆಗಳು",
        "unsafe_oils": "ಅಸುರಕ್ಷಿತ ಎಣ್ಣೆಗಳು",
        "waiting": "ಸೆನ್ಸರ್ ಡೇಟಾಗಾಗಿ ಕಾಯಲಾಗುತ್ತಿದೆ...",
        "ai_powered": "ಎಐ ಚಾಲಿತ",
        "ask_ai": "ಎಐ ಕೇಳಿ",
        "test_oil": "ನಿಮ್ಮ ಎಣ್ಣೆಯನ್ನು ಪರೀಕ್ಷಿಸಿ",
        "hero_desc": "ನಿಮ್ಮ ತ್ವರಿತ ಪರೀಕ್ಷಾ ಸೆನ್ಸರ್‌ನೊಂದಿಗೆ ಕಲಬೆರಕೆಯನ್ನು ತಕ್ಷಣ ಪತ್ತೆ ಮಾಡಿ.",
        "device_offline": "ಸಾಧನ ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿದೆ",
        "connect_esp": "ಸ್ಕ್ಯಾನ್ ಸಕ್ರಿಯಗೊಳಿಸಲು ಸಾಧನವನ್ನು ಸಂಪರ್ಕಿಸಿ",
        "report_oil": "ಕಲಬೆರಕೆ ಎಣ್ಣೆಯ ವರದಿ ನೀಡಿ",
        "recent_scans": "ಇತ್ತೀಚಿನ ಸ್ಕ್ಯಾನ್‌ಗಳು",
        "view_all": "ಎಲ್ಲವನ್ನೂ ವೀಕ್ಷಿಸಿ",
        "no_scans": "ಇನ್ನೂ ಯಾವುದೇ ಸ್ಕ್ಯಾನ್ ಇಲ್ಲ.",
        "tap_to_begin": "ಆರಂಭಿಸಲು 'ಸ್ಕ್ಯಾನ್ ಪ್ರಾರಂಭಿಸಿ' ಟ್ಯಾಪ್ ಮಾಡಿ"
      },
      "profile": {
        "title": "ನನ್ನ ಪ್ರೊಫೈಲ್",
        "subtitle": "ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ ಮತ್ತು ಮಾತೃಭಾಷೆಯ ಸಂಯೋಜನೆಗಳು",
        "select_language": "ಮಾತೃಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
        "native_language": "ಮಾತೃಭಾಷೆ",
        "choose_language_desc": "ನಿಮ್ಮ ನೆಚ್ಚಿನ ಪ್ರಾದೇಶಿಕ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
        "settings": "ಆದ್ಯತೆಗಳು ಮತ್ತು ಸಂಯೋಜನೆಗಳು",
        "language": "ಭಾಷೆ",
        "dark_mode": "ಡಾರ್ಕ್ ಮೋಡ್",
        "theme_mode": "ಥೀಮ್ ಮೋಡ್",
        "privacy": "ಗೌಪ್ಯತೆ ಮತ್ತು ಭದ್ರತೆ",
        "logout": "ಸೈನ್ ಔಟ್",
        "notifications": "ಸೂಚನೆಗಳು",
        "hw_connection": "ಹಾರ್ಡ್‌ವೇರ್ ಸಂಪರ್ಕ",
        "about": "ಫುಡ್ 360 ಬಗ್ಗೆ",
        "learning": "ಕಲಿಕಾ ಕೇಂದ್ರ",
        "fssai_guidelines": "FSSAI ಮಾರ್ಗಸೂಚಿಗಳು",
        "edit_profile": "ಪ್ರೊಫೈಲ್ ಎಡಿಟ್ ಮಾಡಿ",
        "save_changes": "ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ",
        "close": "ಮುಚ್ಚಿ"
      },
      "settings": {
        "title": "ಸಂಯೋಜನೆಗಳು",
        "subtitle": "ಹಾರ್ಡ್‌ವೇರ್ ಕಾನ್ಫಿಗರೇಶನ್ ಮತ್ತು ಆದ್ಯತೆಗಳು",
        "network": "ನೆಟ್‌ವರ್ಕ್ ಮತ್ತು ಏಕೀಕರಣ",
        "device": "ಸಾಧನ ನಿರ್ವಹಣೆ",
        "preferences": "ಬಳಕೆದಾರರ ಆದ್ಯತೆಗಳು",
        "calibrate": "ಸೆನ್ಸರ್ ಮರುಹೊಂದಿಸಿ"
      },
      "nav": {
        "dashboard": "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
        "oil_analysis": "ಎಣ್ಣೆ ವಿಶ್ಲೇಷಣೆ",
        "physical_testing": "ಭೌತಿಕ ಎಣ್ಣೆ ಪರೀಕ್ಷೆ",
        "safety_hotspots": "ಸುರಕ್ಷತಾ ಹಾಟ್‌ಸ್ಪಾಟ್‌ಗಳು",
        "community": "ಸಮುದಾಯ ಮತ್ತು ದೂರುಗಳು",
        "disaster": "ದುರಂತ ಮತ್ತು ತುರ್ತು ಪರಿಸ್ಥಿತಿ",
        "relief": "ಆಹಾರ ಪರಿಹಾರ",
        "oilwise": "ಆಯಿಲ್‌ವೈಸ್ ಮಾರ್ಗದರ್ಶಿ",
        "fitness": "ಎಐ ಫಿಟ್‌ನೆಸ್ ಕೋಚ್",
        "learning": "ಕಲಿಕಾ ಕೇಂದ್ರ",
        "reports": "ಸಿಸ್ಟಮ್ ವರದಿಗಳು",
        "profile_settings": "ಪ್ರೊಫೈಲ್ ಸಂಯೋಜನೆಗಳು",
        "about": "ಅಪ್ಲಿಕೇಶನ್ ಬಗ್ಗೆ"
      },
      "common": {
        "loading": "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
        "save": "ಉಳಿಸಿ",
        "cancel": "ರದ್ದುಮಾಡಿ",
        "done": "ಪೂರ್ಣಗೊಂಡಿದೆ",
        "safe": "ಸುರಕ್ಷಿತ",
        "unsafe": "ಅಸುರಕ್ಷಿತ",
        "active": "ಸಕ್ರಿಯ",
        "connected": "ಸಂಪರ್ಕಿಸಲಾಗಿದೆ",
        "offline": "ಆಫ್‌ಲೈನ್",
        "back": "ಹಿಂತಿರುಗಿ",
        "select": "ಆಯ್ಕೆಮಾಡಿ"
      }
    }
  },
  te: {
    translation: {
      "home": {
        "greeting": "నమస్కారం, ఇన్స్పెక్టర్",
        "title": "ఫుడ్ 360 డాష్‌బోర్డ్",
        "start_scan": "స్కాన్ ప్రారంభించండి",
        "total_scans": "మొత్తం స్కాన్‌లు",
        "safe_oils": "సురక్షిత నూనెలు",
        "unsafe_oils": "అసురక్షిత నూనెలు",
        "waiting": "సెన్సార్ సమాచారం కోసం వేచి చూస్తోంది...",
        "ai_powered": "AI తో నడిచేది",
        "ask_ai": "AI ని అడగండి",
        "test_oil": "మీ నూనెను పరీక్షించండి",
        "hero_desc": "మీ తక్షణ పరీక్ష సెన్సార్‌తో కల్తీని వెంటనే గుర్తించండి.",
        "device_offline": "పరికరం ఆఫ్‌లైన్‌లో ఉంది",
        "connect_esp": "స్కాన్ ప్రారంభించడానికి పరికరాన్ని కనెక్ట్ చేయండి",
        "report_oil": "కల్తీ నూనెపై ఫిర్యాదు చేయండి",
        "recent_scans": "ఇటీవలి స్కాన్‌లు",
        "view_all": "అన్నీ చూడండి",
        "no_scans": "ఇంకా స్కాన్‌లు లేవు.",
        "tap_to_begin": "ప్రారంభించడానికి 'స్కాన్ ప్రారంభించండి' నొక్కండి"
      },
      "profile": {
        "title": "నా ప్రొఫైల్",
        "subtitle": "వ్యక్తిగత వివరాలు & మాతృభాష సెట్టింగ్‌లు",
        "select_language": "మాతృభాషను ఎంచుకోండి",
        "native_language": "మాతృభాష",
        "choose_language_desc": "మీకు కావలసిన ప్రాంతీయ భాషను ఎంచుకోండి",
        "settings": "ప్రాధాన్యతలు & సెట్టింగ్‌లు",
        "language": "భాష",
        "dark_mode": "డార్క్ మోడ్",
        "theme_mode": "థీమ్ మోడ్",
        "privacy": "గోప్యత & భద్రత",
        "logout": "సైన్ అవుట్",
        "notifications": "నోటిఫికేషన్‌లు",
        "hw_connection": "హార్డ్‌వేర్ కనెక్షన్",
        "about": "ఫుడ్ 360 గురించి",
        "learning": "లెర్నింగ్ సెంటర్",
        "fssai_guidelines": "FSSAI మార్గదర్శకాలు",
        "edit_profile": "ప్రొఫైల్‌ను సవరించండి",
        "save_changes": "మార్పులను సేవ్ చేయండి",
        "close": "మూసివేయి"
      },
      "settings": {
        "title": "సెట్టింగ్‌లు",
        "subtitle": "హార్డ్‌వేర్ కాన్ఫిగరేషన్ మరియు ప్రాధాన్యతలు",
        "network": "నెట్‌వర్క్ & ఇంటిగ్రేషన్",
        "device": "పరికర నిర్వహణ",
        "preferences": "యూజర్ ప్రాధాన్యతలు",
        "calibrate": "సెన్సార్ కాలిబ్రేట్ చేయండి"
      },
      "nav": {
        "dashboard": "డాష్‌బోర్డ్",
        "oil_analysis": "నూనె విశ్లేషణ",
        "physical_testing": "భౌతిక నూనె పరీక్ష",
        "safety_hotspots": "భద్రతా హాట్‌స్పాట్‌లు",
        "community": "కమ్యూనిటీ & ఫిర్యాదులు",
        "disaster": "విపత్తు & అత్యవసర సేవలు",
        "relief": "ఆహార సహాయం",
        "oilwise": "ఆయిల్ వైజ్ సలహాదారు",
        "fitness": "AI ఫిట్‌నెస్ కోచ్",
        "learning": "లెర్నింగ్ సెంటర్",
        "reports": "సిస్టమ్ నివేదికలు",
        "profile_settings": "ప్రొఫైల్ సెట్టింగ్‌లు",
        "about": "యాప్ గురించి"
      },
      "common": {
        "loading": "లోడ్ అవుతోంది...",
        "save": "సేవ్ చేయండి",
        "cancel": "రద్దు చేయండి",
        "done": "పూర్తయింది",
        "safe": "సురక్షితం",
        "unsafe": "అసురక్షితం",
        "active": "యాక్టివ్",
        "connected": "కనెక్ట్ అయింది",
        "offline": "ఆఫ్‌లైన్",
        "back": "వెనుకకు",
        "select": "ఎంచుకోండి"
      }
    }
  },
  ml: {
    translation: {
      "home": {
        "greeting": "നമസ്കാരം, ഇൻസ്പെക്ടർ",
        "title": "ഫുഡ് 360 ഡാഷ്‌ബോർഡ്",
        "start_scan": "സ്കാൻ ആരംഭിക്കുക",
        "total_scans": "ആകെ സ്കാനുകൾ",
        "safe_oils": "സുരക്ഷിത എണ്ണകൾ",
        "unsafe_oils": "അപകടകരമായ എണ്ണകൾ",
        "waiting": "സെൻസർ വിവരങ്ങൾക്കായി കാത്തിരിക്കുന്നു...",
        "ai_powered": "AI അടിസ്ഥാനമാക്കിയുള്ളത്",
        "ask_ai": "AI-യോട് ചോദിക്കുക",
        "test_oil": "നിങ്ങളുടെ വെളിച്ചെണ്ണ/എണ്ണ പരിശോധിക്കുക",
        "hero_desc": "പോർട്ടബിൾ സെൻസർ ഉപയോഗിച്ച് മായം ചേർത്തത് ഉടനടി കണ്ടെത്തുക.",
        "device_offline": "ഉപകരണം ഓഫ്ലൈനാണ്",
        "connect_esp": "സ്കാൻ ചെയ്യാൻ ഉപകരണം ബന്ധിപ്പിക്കുക",
        "report_oil": "മായം ചേർത്ത എണ്ണ റിപ്പോർട്ട് ചെയ്യുക",
        "recent_scans": "സമീപകാല സ്കാനുകൾ",
        "view_all": "എല്ലാം കാണുക",
        "no_scans": "ഇതുവരെ സ്കാനുകളൊന്നുമില്ല.",
        "tap_to_begin": "ആരംഭിക്കാൻ 'സ്കാൻ ആരംഭിക്കുക' അമർത്തുക"
      },
      "profile": {
        "title": "എന്റെ പ്രൊഫൈൽ",
        "subtitle": "വ്യക്തിഗത വിവരങ്ങളും മാതൃഭാഷാ ക്രമീകരണങ്ങളും",
        "select_language": "മാതൃഭാഷ തിരഞ്ഞെടുക്കുക",
        "native_language": "മാതൃഭാഷ",
        "choose_language_desc": "നിങ്ങളുടെ പ്രാദേശിക ഭാഷ തിരഞ്ഞെടുക്കുക",
        "settings": "മുൻഗണനകളും ക്രമീകരണങ്ങളും",
        "language": "ഭാഷ",
        "dark_mode": "ഡാർക്ക് മോഡ്",
        "theme_mode": "തീം മോഡ്",
        "privacy": "സ്വകാര്യതയും സുരക്ഷയും",
        "logout": "സൈൻ ഔട്ട്",
        "notifications": "അറിയിപ്പുകൾ",
        "hw_connection": "ഹാർഡ്‌വെയർ കണക്ഷൻ",
        "about": "ഫുഡ് 360 നെ കുറിച്ച്",
        "learning": "ലേണിംഗ് സെന്റർ",
        "fssai_guidelines": "FSSAI മാർഗ്ഗനിർദ്ദേശങ്ങൾ",
        "edit_profile": "പ്രൊഫൈൽ തിരുത്തുക",
        "save_changes": "മാറ്റങ്ങൾ സേവ് ചെയ്യുക",
        "close": "അടയ്ക്കുക"
      },
      "settings": {
        "title": "ക്രമീകരണങ്ങൾ",
        "subtitle": "ഹാർഡ്‌വെയർ കോൺഫിഗറേഷനും മുൻഗണനകളും",
        "network": "നെറ്റ്‌വർക്കും ഇന്റഗ്രേഷനും",
        "device": "ഉപകരണ മാനേജ്മെന്റ്",
        "preferences": "ഉപയോക്തൃ മുൻഗണനകൾ",
        "calibrate": "സെൻസർ കാലിബ്രേറ്റ് ചെയ്യുക"
      },
      "nav": {
        "dashboard": "ഡാഷ്‌ബോർഡ്",
        "oil_analysis": "എണ്ണ വിശകലനം",
        "physical_testing": "ഭൗതിക എണ്ണ പരിശോധന",
        "safety_hotspots": "സുരക്ഷാ ഹോട്ട്‌സ്‌പോട്ടുകൾ",
        "community": "കമ്മ്യൂണിറ്റിയും പരാതികളും",
        "disaster": "ദുരന്തവും അടിയന്തരാവസ്ഥയും",
        "relief": "ഭക്ഷണ സഹായം",
        "oilwise": "ഓയിൽ വൈസ് ഉപദേശകൻ",
        "fitness": "AI ഫിറ്റ്നസ് കോച്ച്",
        "learning": "ലേണിംഗ് സെന്റർ",
        "reports": "സിസ്റ്റം റിപ്പോർട്ടുകൾ",
        "profile_settings": "പ്രൊഫൈൽ ക്രമീകരണങ്ങൾ",
        "about": "ആപ്പിനെക്കുറിച്ച്"
      },
      "common": {
        "loading": "ലോഡ് ചെയ്യുന്നു...",
        "save": "സേവ് ചെയ്യുക",
        "cancel": "റദ്ദാക്കുക",
        "done": "പൂർത്തിയായി",
        "safe": "സുരക്ഷിതം",
        "unsafe": "അപകടകരം",
        "active": "ആക്ടീവ്",
        "connected": "ബന്ധിപ്പിച്ചിരിക്കുന്നു",
        "offline": "ഓഫ്ലൈൻ",
        "back": "തിരികെ",
        "select": "തിരഞ്ഞെടുക്കുക"
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
