export const SITE_NAME = "Expense - Tracker";
export const SITE_URL =
  import.meta.env.VITE_SITE_URL?.replace(/\/$/, "") ||
  "https://shravanweb-expence-tracker.vercel.app";

export const DEFAULT_DESCRIPTION =
  "Free expense tracker and personal finance app. Track monthly salary, income, spending, debits, credits, and balance with charts — built for India.";

export const DEFAULT_KEYWORDS =
  "expense tracker, money tracker, personal finance app, monthly budget tracker, salary tracker, spending tracker, income expense app, finance dashboard india";

type PageSeo = {
  title: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
};

export function pageUrl(path = ""): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${p === "/" ? "" : p}`;
}

export function buildPageHead({ title, description, path = "", noIndex = false }: PageSeo) {
  const desc = description ?? DEFAULT_DESCRIPTION;
  const url = pageUrl(path);
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

  const meta: Array<Record<string, string>> = [
    { title: fullTitle },
    { name: "description", content: desc },
    { name: "keywords", content: DEFAULT_KEYWORDS },
    { name: "author", content: "Shravan Rasamalla" },
    { name: "robots", content: noIndex ? "noindex, nofollow" : "index, follow" },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:title", content: fullTitle },
    { property: "og:description", content: desc },
    { property: "og:url", content: url },
    { property: "og:locale", content: "en_IN" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: fullTitle },
    { name: "twitter:description", content: desc },
  ];

  const links = [{ rel: "canonical", href: url }];

  return { meta, links };
}
