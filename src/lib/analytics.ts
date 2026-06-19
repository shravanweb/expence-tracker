import { track } from "@vercel/analytics/react";

export type CtaAction = "signup" | "login";
export type CtaLocation = "hero" | "header" | "footer" | "bottom_cta" | "feature_card";

export function trackCtaClick(action: CtaAction, location: CtaLocation) {
  track("cta_click", { action, location });
}
