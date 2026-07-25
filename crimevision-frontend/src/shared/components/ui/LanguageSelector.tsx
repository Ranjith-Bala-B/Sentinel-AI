import { useEffect, useState } from "react";
import { Globe } from "lucide-react";

export const INDIAN_LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "hi", label: "Hindi", native: "हिंदी" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી" },
  { code: "ml", label: "Malayalam", native: "മലയാളം" },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "ur", label: "Urdu", native: "اردو" },
];

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
  }
}

export function LanguageSelector() {
  const [selectedLang, setSelectedLang] = useState<string>(() => {
    const match = document.cookie.match(/(?:^|;) *googtrans=([^;]*)/);
    if (match) {
      const parts = match[1].split("/");
      const code = parts[parts.length - 1];
      if (code && INDIAN_LANGUAGES.some((l) => l.code === code)) {
        return code;
      }
    }
    return "en";
  });

  useEffect(() => {
    // 1. Define global init callback
    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,kn,hi,ta,te,mr,bn,gu,ml,pa,ur",
            autoDisplay: false,
          },
          "google_translate_element"
        );
      }
    };

    // 2. Inject Google Translate script if missing
    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.type = "text/javascript";
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }

    // 3. Keep body top at 0px without destroying Google Translate iframe
    const interval = setInterval(() => {
      if (document.body.style.top !== "0px") {
        document.body.style.top = "0px";
      }
      if (document.body.style.position !== "static") {
        document.body.style.position = "static";
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const changeLanguage = (langCode: string) => {
    setSelectedLang(langCode);

    const cookieValue = langCode === "en" ? "/en/en" : `/en/${langCode}`;
    const host = window.location.hostname;

    // Set cookie across path and host
    document.cookie = `googtrans=${cookieValue}; path=/;`;
    if (host) {
      document.cookie = `googtrans=${cookieValue}; path=/; domain=${host}`;
    }

    // Try triggering Google Translate select combo box directly
    const selectElem = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
    if (selectElem) {
      selectElem.value = langCode;
      selectElem.dispatchEvent(new Event("change"));
    }

    // Reload page to ensure clean Google Translate initialization in target language
    setTimeout(() => {
      window.location.reload();
    }, 150);
  };

  return (
    <div className="relative flex items-center">
      {/* Container for Google Translate widget */}
      <div id="google_translate_element" style={{ display: "none" }} />

      {/* Styled Language Selector Dropdown */}
      <div className="flex items-center gap-1.5 rounded-lg bg-base-750 border border-base-800 px-2.5 py-1 text-xs text-base-200 hover:border-signal-500/50 transition-colors shadow-sm">
        <Globe className="h-4 w-4 text-signal-400 shrink-0" />
        <select
          value={selectedLang}
          onChange={(e) => changeLanguage(e.target.value)}
          className="bg-transparent font-bold text-xs text-base-100 cursor-pointer focus:outline-none capitalize"
          aria-label="Select Indian Language"
        >
          {INDIAN_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code} className="bg-base-900 text-white font-semibold">
              {lang.native} ({lang.label})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
