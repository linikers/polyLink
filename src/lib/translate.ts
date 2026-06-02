// Translation utility — client-side with localStorage cache

const CACHE_KEY = "polylink-translations";

interface TranslationCache {
  [text: string]: string;
}

function loadCache(): TranslationCache {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveCache(cache: TranslationCache): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage cheio
  }
}

export async function translateText(text: string): Promise<string> {
  if (!text || text.length < 10) return text;

  // Check cache first
  const cache = loadCache();
  if (cache[text]) return cache[text];

  // Call API
  const res = await fetch("/api/ai/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Erro ${res.status}`);
  }

  const data = await res.json();
  if (data?.translated) {
    // Cache result
    const updated = loadCache();
    updated[text] = data.translated;
    saveCache(updated);
    return data.translated;
  }

  return text;
}

export function getCachedTranslation(text: string): string | null {
  const cache = loadCache();
  return cache[text] || null;
}
