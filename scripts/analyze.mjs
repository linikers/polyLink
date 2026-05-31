#!/usr/bin/env node
/**
 * Polymarket CLI — analyze markets, prices, trades from the terminal.
 *
 * Usage:
 *   node scripts/analyze.mjs search "bitcoin"
 *   node scripts/analyze.mjs trending
 *   node scripts/analyze.mjs market <slug>
 *   node scripts/analyze.mjs event <slug>
 *   node scripts/analyze.mjs price <tokenId>
 *   node scripts/analyze.mjs book <tokenId>
 *   node scripts/analyze.mjs history <conditionId>
 *   node scripts/analyze.mjs trades
 */

const GAMMA = "https://gamma-api.polymarket.com";
const CLOB = "https://clob.polymarket.com";
const DATA = "https://data-api.polymarket.com";

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

function parseJson(v) {
  try { return JSON.parse(v); } catch { return v; }
}

function fmtPct(p) {
  return `${(Number(p) * 100).toFixed(1)}%`;
}

function fmtVol(v) {
  const n = Number(v);
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function fmtTime(ts) {
  return new Date(Number(ts) * 1000).toLocaleString();
}

// ─── Commands ──────────────────────────────────────

async function cmdSearch(query) {
  const data = await fetchJson(`${GAMMA}/public-search?q=${encodeURIComponent(query)}`);
  const events = data.events ?? [];
  console.log(`Found ${data.pagination?.totalResults ?? events.length} results for "${query}"\n`);
  for (const evt of events.slice(0, 8)) {
    console.log(`\n=== ${evt.title} ===`);
    console.log(`  Volume: ${fmtVol(evt.volume)}  |  slug: ${evt.slug}`);
    for (const m of (evt.markets ?? []).slice(0, 3)) {
      const prices = parseJson(m.outcomePrices) ?? [];
      const outcomes = parseJson(m.outcomes) ?? ["Yes", "No"];
      const parts = prices.map((p, i) => `${outcomes[i] ?? i}: ${fmtPct(p)}`).join("  |  ");
      console.log(`  ${m.question}  [${parts}]`);
    }
  }
}

async function cmdTrending() {
  const events = await fetchJson(
    `${GAMMA}/events?limit=10&active=true&closed=false&order=volume&ascending=false`
  );
  console.log("Trending Markets:\n");
  for (const [i, evt] of events.entries()) {
    console.log(`${i + 1}. ${evt.title}`);
    console.log(`   Volume: ${fmtVol(evt.volume)}  |  slug: ${evt.slug}`);
    const m = evt.markets?.[0];
    if (m) {
      const prices = parseJson(m.outcomePrices) ?? [];
      console.log(`   Yes: ${fmtPct(prices[0] ?? 0)}  |  No: ${fmtPct(prices[1] ?? 0)}`);
    }
  }
}

async function cmdMarket(slug) {
  const markets = await fetchJson(`${GAMMA}/markets?slug=${encodeURIComponent(slug)}`);
  const m = markets?.[0];
  if (!m) return console.log(`No market found: ${slug}`);
  console.log(`\nQuestion: ${m.question}`);
  console.log(`Status: ${m.closed ? "CLOSED" : "ACTIVE"}`);
  const prices = parseJson(m.outcomePrices) ?? [];
  console.log(`Yes: ${fmtPct(prices[0] ?? 0)}  |  No: ${fmtPct(prices[1] ?? 0)}`);
  console.log(`Volume: ${fmtVol(m.volume)}`);
  console.log(`conditionId: ${m.conditionId}`);
}

async function cmdEvent(slug) {
  const events = await fetchJson(`${GAMMA}/events?slug=${encodeURIComponent(slug)}`);
  const evt = events?.[0];
  if (!evt) return console.log(`No event found: ${slug}`);
  console.log(`\nEvent: ${evt.title}`);
  console.log(`Volume: ${fmtVol(evt.volume)}  |  Markets: ${evt.markets?.length ?? 0}`);
  for (const m of evt.markets ?? []) {
    const prices = parseJson(m.outcomePrices) ?? [];
    console.log(`  ${m.question}`);
    console.log(`  Yes: ${fmtPct(prices[0] ?? 0)}  |  No: ${fmtPct(prices[1] ?? 0)}`);
  }
}

async function cmdPrice(tokenId) {
  const [buy, mid] = await Promise.all([
    fetchJson(`${CLOB}/price?token_id=${tokenId}&side=buy`),
    fetchJson(`${CLOB}/midpoint?token_id=${tokenId}`),
  ]);
  console.log(`Buy price: ${fmtPct(buy.price)}`);
  console.log(`Midpoint: ${fmtPct(mid.mid)}`);
}

async function cmdBook(tokenId) {
  const book = await fetchJson(`${CLOB}/book?token_id=${tokenId}`);
  console.log(`\nOrderbook (top 8 each side):`);
  console.log("\nAsks (sell):");
  for (const a of (book.asks ?? []).slice(-8).reverse()) {
    console.log(`  ${fmtPct(a.price)}  |  Size: ${Number(a.size).toFixed(2)}`);
  }
  console.log(`\n  --- Spread ---`);
  for (const b of (book.bids ?? []).slice(0, 8)) {
    console.log(`  ${fmtPct(b.price)}  |  Size: ${Number(b.size).toFixed(2)}`);
  }
  console.log("\nBids (buy):");
}

async function cmdHistory(conditionId) {
  const data = await fetchJson(
    `${CLOB}/prices-history?market=${conditionId}&interval=all&fidelity=50`
  );
  const history = data.history ?? [];
  if (history.length === 0) return console.log("No history available.");
  console.log(`\nPrice history (${history.length} points):\n`);
  for (const pt of history.slice(-20)) {
    const bar = "█".repeat(Math.round(Number(pt.p) * 30));
    console.log(`  ${fmtTime(pt.t)}  ${fmtPct(pt.p)}  ${bar}`);
  }
}

async function cmdTrades() {
  const trades = await fetchJson(`${DATA}/trades?limit=15`);
  console.log("\nRecent trades:\n");
  for (const t of trades ?? []) {
    const side = t.side === "BUY" ? "🟢 BUY " : "🔴 SELL";
    console.log(`  ${side}  ${fmtPct(t.price)}  x${Number(t.size).toFixed(2)}  [${t.outcome}]`);
  }
}

// ─── Main ───────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];

  try {
    switch (cmd) {
      case "search": return await cmdSearch(args.slice(1).join(" "));
      case "trending": return await cmdTrending();
      case "market": return await cmdMarket(args[1]);
      case "event": return await cmdEvent(args[1]);
      case "price": return await cmdPrice(args[1]);
      case "book": return await cmdBook(args[1]);
      case "history": return await cmdHistory(args[1]);
      case "trades": return await cmdTrades();
      default:
        console.log(`
Usage:
  node scripts/analyze.mjs search <query>
  node scripts/analyze.mjs trending
  node scripts/analyze.mjs market <slug>
  node scripts/analyze.mjs event <slug>
  node scripts/analyze.mjs price <tokenId>
  node scripts/analyze.mjs book <tokenId>
  node scripts/analyze.mjs history <conditionId>
  node scripts/analyze.mjs trades
`);
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

main();
