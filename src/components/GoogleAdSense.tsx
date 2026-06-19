import { useEffect } from "react";

const ADSENSE_CLIENT_ID = import.meta.env.VITE_GOOGLE_ADSENSE_CLIENT_ID;

/** Loads Google AdSense auto ads when client ID is set. */
export function GoogleAdSense() {
  useEffect(() => {
    if (!ADSENSE_CLIENT_ID) return;
    if (document.querySelector(`script[data-adsense-client="${ADSENSE_CLIENT_ID}"]`)) return;

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;
    script.crossOrigin = "anonymous";
    script.setAttribute("data-adsense-client", ADSENSE_CLIENT_ID);
    document.head.appendChild(script);
  }, []);

  return null;
}
