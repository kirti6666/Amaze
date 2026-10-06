"use client";

import { useEffect, useState } from "react";

/**
 * Site-wide language picker, powered by the Google Translate website widget.
 *
 * The widget translates whatever is on the page — including product names and
 * descriptions — so no per-language copy needs maintaining. It reads the
 * `googtrans` cookie (`/en/<lang>`) on load, so choosing a language just sets
 * that cookie and reloads. Google's script is only loaded when a non-English
 * language is active; English visitors never make a request to Google.
 *
 * Google's own toolbar/banner is hidden in globals.css (".goog-te-*"); this
 * dropdown is the only control shoppers see.
 */
export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "bn", label: "বাংলা" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
  { code: "mr", label: "मराठी" },
  { code: "gu", label: "ગુજરાતી" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "ml", label: "മലയാളം" },
  { code: "pa", label: "ਪੰਜਾਬੀ" },
  { code: "ur", label: "اردو" },
  { code: "ar", label: "العربية" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
  { code: "de", label: "Deutsch" },
];

const COOKIE = "googtrans";

function readLanguage() {
  const match = document.cookie.match(/(?:^|;\s*)googtrans=\/[^/;]+\/([^;]+)/);
  const code = match ? decodeURIComponent(match[1]) : "en";
  return LANGUAGES.some((l) => l.code === code) ? code : "en";
}

function writeLanguage(code: string) {
  const host = window.location.hostname;
  // Google sets the cookie on both the host and the parent domain, so clear
  // and set both or an old choice can linger.
  const domains = ["", `; domain=${host}`, `; domain=.${host.replace(/^www\./, "")}`];
  for (const d of domains) {
    document.cookie = `${COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT${d}`;
  }
  if (code !== "en") {
    document.cookie = `${COOKIE}=/en/${code}; path=/; max-age=31536000; SameSite=Lax`;
  }
}

/**
 * React keeps references to the text nodes it rendered. Google Translate swaps
 * those nodes for translated <font> wrappers, so a later React update can try
 * to remove or insert relative to a node that's no longer there and crash the
 * page. These guards make those two DOM calls tolerate it — the standard
 * workaround (facebook/react#11538). Only installed while translating.
 */
function guardDomForTranslation() {
  const proto = Node.prototype as Node & { __translateGuard?: boolean };
  if (proto.__translateGuard) return;
  proto.__translateGuard = true;

  const removeChild = proto.removeChild;
  proto.removeChild = function <T extends Node>(this: Node, child: T): T {
    if (child.parentNode !== this) return child;
    return removeChild.call(this, child) as T;
  };

  const insertBefore = proto.insertBefore;
  proto.insertBefore = function <T extends Node>(this: Node, node: T, ref: Node | null): T {
    if (ref && ref.parentNode !== this) return node;
    return insertBefore.call(this, node, ref) as T;
  };
}

let translatorLoaded = false;

/**
 * Google's widget fills its hidden language <select> asynchronously and does
 * not always apply the saved cookie by itself. So once the option for our
 * language appears, select it and fire `change` — the same thing a click on
 * Google's own menu does. Gives up quietly after ~20s (page stays in English).
 */
function applyLanguage(code: string) {
  let tries = 0;
  const timer = window.setInterval(() => {
    tries += 1;
    const combo = document.querySelector<HTMLSelectElement>("select.goog-te-combo");
    if (combo && Array.from(combo.options).some((o) => o.value === code)) {
      window.clearInterval(timer);
      if (combo.value !== code) {
        combo.value = code;
        combo.dispatchEvent(new Event("change", { bubbles: true }));
      }
    } else if (tries > 80) {
      window.clearInterval(timer);
    }
  }, 250);
}

function loadTranslator(code: string) {
  if (translatorLoaded) return;
  translatorLoaded = true;
  guardDomForTranslation();

  const mount = document.createElement("div");
  mount.id = "google_translate_element";
  // Off-screen rather than display:none — Google's widget doesn't load its
  // language list while hidden. Our own dropdown is the visible control.
  mount.setAttribute("aria-hidden", "true");
  mount.style.cssText = "position:absolute;left:-9999px;top:0;width:1px;height:1px;overflow:hidden";
  document.body.appendChild(mount);

  const w = window as unknown as {
    googleTranslateElementInit?: () => void;
    google?: { translate: { TranslateElement: new (opts: object, id: string) => unknown } };
  };
  w.googleTranslateElementInit = () => {
    if (!w.google) return;
    new w.google.translate.TranslateElement({ pageLanguage: "en", autoDisplay: false }, "google_translate_element");
    applyLanguage(code);
  };

  const script = document.createElement("script");
  script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  script.async = true;
  document.body.appendChild(script);
}

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    const current = readLanguage();
    setLang(current);
    if (current !== "en") loadTranslator(current);
  }, []);

  function choose(code: string) {
    setLang(code);
    writeLanguage(code);
    window.location.reload();
  }

  return (
    <label className={`util-select notranslate ${className}`} translate="no">
      <span className="sr-only">Language</span>
      <select value={lang} onChange={(e) => choose(e.target.value)} aria-label="Language">
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </label>
  );
}
