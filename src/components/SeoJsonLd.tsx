import { SITE_NAME, SITE_URL, DEFAULT_DESCRIPTION } from "@/lib/seo";

/** Structured data for Google rich results (landing page). */
export function LandingJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: SITE_NAME,
        url: SITE_URL,
        description: DEFAULT_DESCRIPTION,
        inLanguage: "en-IN",
        publisher: {
          "@type": "Person",
          name: "Shravan Rasamalla",
        },
      },
      {
        "@type": "SoftwareApplication",
        name: SITE_NAME,
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "INR",
        },
        description: DEFAULT_DESCRIPTION,
        url: SITE_URL,
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is Expense - Tracker?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Expense - Tracker is a free personal finance app to track monthly salary, income, expenses, and balance with charts and category breakdowns.",
            },
          },
          {
            "@type": "Question",
            name: "Can I view previous months?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Use the month selector on the dashboard to review credits, debits, and transactions for any past month.",
            },
          },
          {
            "@type": "Question",
            name: "Is Expense - Tracker free?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. You can create a free account and start tracking your money online.",
            },
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
