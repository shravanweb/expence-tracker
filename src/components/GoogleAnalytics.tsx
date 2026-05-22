import { useEffect } from "react";

const GA_ID =
  import.meta.env.VITE_GA_MEASUREMENT_ID || import.meta.env.VITE_FIREBASE_MEASUREMENT_ID;
const ADS_ID = import.meta.env.VITE_GOOGLE_ADS_ID;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Loads Google Analytics 4 + optional Google Ads tag when env IDs are set. */
export function GoogleAnalytics() {
  useEffect(() => {
    if (!GA_ID && !ADS_ID) return;

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID || ADS_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };
    window.gtag("js", new Date());

    if (GA_ID) {
      window.gtag("config", GA_ID, { send_page_view: true });
    }
    if (ADS_ID) {
      window.gtag("config", ADS_ID);
    }
  }, []);

  return null;
}
