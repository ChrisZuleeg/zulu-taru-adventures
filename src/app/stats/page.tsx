"use client";

import { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

type StatsData = {
  total_pageviews: number;
  unique_visitors: number;
  top_pages: { page: string; count: number }[];
  top_countries: { country: string; count: number }[];
  us_states: { state: string; count: number }[];
  daily: { date: string; pageviews: number; visitors: number }[];
  comments_this_month: number;
};

const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas",
  KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland", MA: "Massachusetts",
  MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana",
  NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico",
  NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma",
  OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
  VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
  DC: "Washington D.C.",
};

const COUNTRY_NAMES: Record<string, string> = {
  US: "United States", GB: "United Kingdom", CA: "Canada", AU: "Australia",
  DE: "Germany", FR: "France", MX: "Mexico", JP: "Japan", BR: "Brazil",
  NL: "Netherlands", ES: "Spain", IT: "Italy", SE: "Sweden", NO: "Norway",
  NZ: "New Zealand", CH: "Switzerland", AT: "Austria", BE: "Belgium", DK: "Denmark",
  FI: "Finland", IE: "Ireland", PT: "Portugal", PL: "Poland", IN: "India",
  CN: "China", KR: "South Korea", ZA: "South Africa", AR: "Argentina", CL: "Chile",
};

function BarRow({ label, count, max }: { label: string; count: number; max: number }) {
  const pct = Math.max(4, Math.round((count / max) * 100));
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-36 truncate text-gray-600 text-right shrink-0 text-xs">{label}</span>
      <div className="flex-1 bg-taru-cream rounded-full h-3 overflow-hidden">
        <div className="h-full bg-taru-green rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-gray-500 text-xs text-right">{count}</span>
    </div>
  );
}

export default function Stats() {
  const [password, setPassword] = useState("");
  const [stage, setStage] = useState<"login" | "loading" | "done">("login");
  const [data, setData] = useState<StatsData | null>(null);
  const [error, setError] = useState("");

  async function load() {
    setStage("loading");
    setError("");
    const res = await fetch(`/api/stats?password=${encodeURIComponent(password)}`);
    if (!res.ok) {
      setError("Wrong password.");
      setStage("login");
      return;
    }
    setData(await res.json());
    setStage("done");
  }

  if (stage === "login") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-taru-cream w-80">
          <h1 className="font-heading text-3xl text-taru-green font-bold mb-6">Site Stats</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder="Password"
            autoFocus
            className="w-full border border-taru-cream rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-taru-green bg-taru-sand mb-3"
          />
          <button
            onClick={load}
            className="w-full bg-taru-green text-taru-cream font-semibold py-2 rounded-lg hover:bg-taru-green-dark transition-colors"
          >
            Enter
          </button>
          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
        </div>
      </div>
    );
  }

  if (stage === "loading" || !data) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <p className="text-gray-400 animate-pulse">Loading stats…</p>
      </div>
    );
  }

  const maxPage = data.top_pages[0]?.count ?? 1;
  const maxCountry = data.top_countries[0]?.count ?? 1;
  const maxState = data.us_states[0]?.count ?? 1;

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="font-heading text-5xl font-bold text-taru-green mb-2">Site Stats</h1>
      <p className="text-taru-brown italic text-lg mb-10">Who&apos;s been following along</p>

      {/* Formspree warning */}
      {data.comments_this_month >= 35 && (
        <div className={`mb-6 rounded-xl px-5 py-4 text-sm font-semibold ${data.comments_this_month >= 45 ? "bg-red-50 border border-red-300 text-red-700" : "bg-amber-50 border border-amber-300 text-amber-800"}`}>
          {data.comments_this_month >= 45
            ? `⚠️ Formspree limit almost reached: ${data.comments_this_month}/50 comment emails sent this month. New comments will stop sending you notifications until next month!`
            : `⚡ Heads up: ${data.comments_this_month}/50 comment emails sent this month via Formspree free tier.`}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="bg-white rounded-2xl border border-taru-cream p-6 text-center">
          <p className="text-5xl font-heading font-bold text-taru-green">{data.total_pageviews.toLocaleString()}</p>
          <p className="text-gray-500 text-sm mt-2">Total Page Views</p>
        </div>
        <div className="bg-white rounded-2xl border border-taru-cream p-6 text-center">
          <p className="text-5xl font-heading font-bold text-taru-green">{data.unique_visitors.toLocaleString()}</p>
          <p className="text-gray-500 text-sm mt-2">Unique Visitors</p>
        </div>
      </div>

      {/* Daily area chart */}
      <div className="bg-white rounded-2xl border border-taru-cream p-6 mb-8">
        <h2 className="font-heading text-xl text-taru-green font-bold mb-5">Visitors — Last 30 Days</h2>
        {data.daily.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No data yet — check back once visitors arrive.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.daily} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gPv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6B7A2A" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#6B7A2A" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B6914" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#8B6914" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="pageviews" stroke="#6B7A2A" fill="url(#gPv)" name="Page Views" strokeWidth={2} />
              <Area type="monotone" dataKey="visitors" stroke="#8B6914" fill="url(#gUv)" name="Unique Visitors" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top pages */}
      <div className="bg-white rounded-2xl border border-taru-cream p-6 mb-8">
        <h2 className="font-heading text-xl text-taru-green font-bold mb-4">Pages by Views</h2>
        <div className="space-y-2.5">
          {data.top_pages.map(({ page, count }) => (
            <BarRow key={page} label={page || "/"} count={count} max={maxPage} />
          ))}
          {data.top_pages.length === 0 && <p className="text-gray-400 text-sm">No data yet.</p>}
        </div>
      </div>

      {/* Countries + US States */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl border border-taru-cream p-6">
          <h2 className="font-heading text-xl text-taru-green font-bold mb-4">Countries</h2>
          <div className="space-y-2.5">
            {data.top_countries.map(({ country, count }) => (
              <BarRow key={country} label={COUNTRY_NAMES[country] ?? country} count={count} max={maxCountry} />
            ))}
            {data.top_countries.length === 0 && <p className="text-gray-400 text-sm">No data yet.</p>}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-taru-cream p-6">
          <h2 className="font-heading text-xl text-taru-green font-bold mb-4">US States</h2>
          <div className="space-y-2.5">
            {data.us_states.map(({ state, count }) => (
              <BarRow key={state} label={STATE_NAMES[state] ?? state} count={count} max={maxState} />
            ))}
            {data.us_states.length === 0 && <p className="text-gray-400 text-sm">No data yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
