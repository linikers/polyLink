// News Intelligence — busca notícias via RSS/NewsAPI e correlaciona com mercados

export interface NewsItem {
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  description: string;
  relevance?: number; // 0-100
  impact?: "positive" | "negative" | "neutral";
  marketSlug?: string;
}

const POLYMARKET_KEYWORDS: Record<string, string[]> = {
  politics: ["trump", "biden", "election", "president", "congress", "senate", "vote", "democrat", "republican"],
  crypto: ["bitcoin", "ethereum", "crypto", "sec", "etf", "blockchain", "defi", "solana"],
  economics: ["fed", "inflation", "interest rate", "gdp", "recession", "unemployment", "tariff"],
  sports: ["nfl", "nba", "super bowl", "championship", "final", "champion"],
  technology: ["ai", "openai", "google", "apple", "microsoft", "nvidia", "tesla", "twitter", "x.com"],
};

// Fetch news from NewsAPI (free tier: 100 req/day)
// Falls back to a simulated feed if API key is not set
export async function fetchNews(category?: string, limit = 10): Promise<NewsItem[]> {
  // Try NewsAPI first
  const apiKey = process.env.NEXT_PUBLIC_NEWSAPI_KEY;
  if (apiKey) {
    try {
      const q = category ? POLYMARKET_KEYWORDS[category]?.join(" OR ") : "polymarket OR prediction market";
      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q || "bitcoin OR politics")}&pageSize=${limit}&sortBy=publishedAt&language=en&apiKey=${apiKey}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        return (data.articles ?? []).slice(0, limit).map((a: any) => ({
          title: a.title,
          source: a.source?.name ?? "News",
          url: a.url,
          publishedAt: a.publishedAt,
          description: a.description ?? "",
          relevance: guessRelevance(a.title + " " + (a.description ?? "")),
          impact: guessImpact(a.title + " " + (a.description ?? "")),
        }));
      }
    } catch {
      // Fallback to RSS
    }
  }

  // Fallback: Google News RSS
  try {
    const query = category ? category : "prediction+market";
    const rssUrl = `https://news.google.com/rss/search?q=${query}+polymarket&hl=en-US&gl=US&ceid=US:en`;
    const res = await fetch(rssUrl);
    const text = await res.text();
    // Simple RSS parser
    const items: NewsItem[] = [];
    const titleRegex = /<title>(.*?)<\/title>/g;
    const linkRegex = /<link>(.*?)<\/link>/g;
    const pubRegex = /<pubDate>(.*?)<\/pubDate>/g;
    const descRegex = /<description>(.*?)<\/description>/g;

    const titles = [...text.matchAll(titleRegex)].slice(1); // skip first (feed title)
    const links = [...text.matchAll(linkRegex)].slice(1);
    const dates = [...text.matchAll(pubRegex)];
    const descs = [...text.matchAll(descRegex)].slice(1);

    for (let i = 0; i < Math.min(limit, titles.length); i++) {
      const title = titles[i]?.[1]?.replace(/<[^>]*>/g, "") ?? "";
      items.push({
        title,
        source: "Google News",
        url: links[i]?.[1] ?? "",
        publishedAt: dates[i]?.[1] ?? new Date().toISOString(),
        description: descs[i]?.[1]?.replace(/<[^>]*>/g, "").slice(0, 200) ?? "",
        relevance: guessRelevance(title),
        impact: guessImpact(title),
      });
    }
    return items;
  } catch {
    return getMockNews(category);
  }
}

// Mock news for testing when APIs are unavailable
function getMockNews(category?: string): NewsItem[] {
  const allNews: NewsItem[] = [
    { title: "Federal Reserve Keeps Interest Rates Steady, Markets React", source: "Reuters", url: "#", publishedAt: new Date().toISOString(), description: "The Fed maintained its benchmark interest rate...", relevance: 75, impact: "positive" },
    { title: "Bitcoin Surges Past $90,000 as Institutional Adoption Grows", source: "CoinDesk", url: "#", publishedAt: new Date(Date.now() - 3600000).toISOString(), description: "Bitcoin reached a new all-time high...", relevance: 85, impact: "positive" },
    { title: "Trump Leads in Key Swing States, New Poll Shows", source: "CNN", url: "#", publishedAt: new Date(Date.now() - 7200000).toISOString(), description: "Former President Donald Trump has taken the lead...", relevance: 90, impact: "positive" },
    { title: "SEC Delays Decision on Multiple Bitcoin ETF Applications", source: "Bloomberg", url: "#", publishedAt: new Date(Date.now() - 10800000).toISOString(), description: "The Securities and Exchange Commission...", relevance: 80, impact: "negative" },
    { title: "NFL Playoffs: Early Predictions and Betting Odds Shift", source: "ESPN", url: "#", publishedAt: new Date(Date.now() - 14400000).toISOString(), description: "As the NFL season progresses...", relevance: 65, impact: "neutral" },
    { title: "OpenAI Announces GPT-5, AI Market Heats Up", source: "TechCrunch", url: "#", publishedAt: new Date(Date.now() - 18000000).toISOString(), description: "OpenAI revealed its next-generation model...", relevance: 70, impact: "positive" },
  ];

  if (category) {
    const keywords = POLYMARKET_KEYWORDS[category] ?? [];
    return allNews.filter((n) =>
      keywords.some((k) => n.title.toLowerCase().includes(k))
    ).slice(0, 5);
  }

  return allNews;
}

// Guess relevance (0-100) based on keyword matches
function guessRelevance(text: string): number {
  const lower = text.toLowerCase();
  let score = 0;
  for (const [, keywords] of Object.entries(POLYMARKET_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) score += 15;
    }
  }
  return Math.min(100, score);
}

// Guess impact (positive/negative/neutral) based on keywords
function guessImpact(text: string): "positive" | "negative" | "neutral" {
  const lower = text.toLowerCase();
  const positive = ["surges", "approve", "adoption", "growth", "lead", "win", "breakthrough", "rally"];
  const negative = ["delay", "reject", "ban", "crash", "drop", "decline", "loss", "concern"];

  const posCount = positive.filter((w) => lower.includes(w)).length;
  const negCount = negative.filter((w) => lower.includes(w)).length;

  if (posCount > negCount) return "positive";
  if (negCount > posCount) return "negative";
  return "neutral";
}
