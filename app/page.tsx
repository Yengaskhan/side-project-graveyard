"use client";

import { useState, useEffect, useCallback } from "react";
import { Counter } from "./components/Counter";

// -------------------------------------------------------------------
// Types
// -------------------------------------------------------------------
interface Tombstone {
  id: string;
  name: string;
  description: string;
  causeOfDeath: string;
  duration: string;
  lastWords: string;
  resurrectCount: number;
  createdAt: string;
}

const CAUSES_OF_DEATH = [
  "Lost interest",
  "It already existed",
  "Auth was too hard",
  "Nobody cared",
  "Scope creep",
  "Got a real job",
] as const;

const STORAGE_KEY = "side-project-graveyard";

// -------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------
function loadTombstones(): Tombstone[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTombstones(tombstones: Tombstone[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tombstones));
}

function causeEmoji(cause: string) {
  switch (cause) {
    case "Lost interest":
      return "\u{1F971}";
    case "It already existed":
      return "\u{1F937}";
    case "Auth was too hard":
      return "\u{1F512}";
    case "Nobody cared":
      return "\u{1F6AB}";
    case "Scope creep":
      return "\u{1F4C8}";
    case "Got a real job":
      return "\u{1F454}";
    default:
      return "\u{1FAA6}";
  }
}

// -------------------------------------------------------------------
// TombstoneCard
// -------------------------------------------------------------------
function TombstoneCard({
  tombstone,
  onResurrect,
}: {
  tombstone: Tombstone;
  onResurrect: (id: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    const text = `RIP ${tombstone.name}\n"${tombstone.description}"\nLived: ${tombstone.duration}\nCause of death: ${tombstone.causeOfDeath}${tombstone.lastWords ? `\nLast words: "${tombstone.lastWords}"` : ""}\n\n#SideProjectGraveyard`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }, [tombstone]);

  const handleTweet = useCallback(() => {
    const tweet = `RIP ${tombstone.name} \u{1FAA6}\n"${tombstone.description}"\nLived ${tombstone.duration}. Cause of death: ${tombstone.causeOfDeath}.${tombstone.lastWords ? `\n\n"${tombstone.lastWords}"` : ""}\n\nBury yours:`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}&url=${encodeURIComponent("https://vibe-board-sand.vercel.app")}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }, [tombstone]);

  return (
    <div className="tombstone-card bg-card-bg border border-card-border p-6 flex flex-col gap-3 transition-all duration-300">
      {/* Cross / RIP decoration */}
      <div className="text-center text-muted text-xs tracking-[0.3em] uppercase mb-1 select-none">
        {"\u271D"} R.I.P. {"\u271D"}
      </div>

      {/* Project name */}
      <h3 className="text-xl font-bold text-center text-foreground leading-tight">
        {tombstone.name}
      </h3>

      {/* Description */}
      <p className="text-sm text-muted text-center">{tombstone.description}</p>

      {/* Duration */}
      <p className="text-xs text-accent text-center font-mono">
        Lived: {tombstone.duration}
      </p>

      {/* Cause of death badge */}
      <div className="flex justify-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-badge-bg text-xs text-accent-light border border-card-border">
          {causeEmoji(tombstone.causeOfDeath)} {tombstone.causeOfDeath}
        </span>
      </div>

      {/* Last words */}
      {tombstone.lastWords && (
        <p className="text-sm italic text-muted text-center mt-1">
          &ldquo;{tombstone.lastWords}&rdquo;
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-card-border">
        <button
          onClick={() => onResurrect(tombstone.id)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-resurrect/10 text-resurrect hover:bg-resurrect/20 transition-colors cursor-pointer"
        >
          <span className="text-base">&#x1F480;</span>
          Resurrect
          <span className="ml-1 bg-resurrect/20 px-1.5 py-0.5 rounded text-xs">
            {tombstone.resurrectCount}
          </span>
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={handleTweet}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-muted hover:text-foreground hover:bg-card-border/50 transition-colors cursor-pointer"
            title="Post to X"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Post
          </button>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-muted hover:text-foreground hover:bg-card-border/50 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <CheckIcon /> Copied
              </>
            ) : (
              <>
                <ShareIcon /> Copy
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------
// SubmitForm
// -------------------------------------------------------------------
function SubmitForm({ onSubmit, onCancel }: { onSubmit: (t: Tombstone) => void; onCancel: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [causeOfDeath, setCauseOfDeath] = useState<string>(CAUSES_OF_DEATH[0]);
  const [duration, setDuration] = useState("");
  const [lastWords, setLastWords] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;

    const tombstone: Tombstone = {
      id: crypto.randomUUID(),
      name: name.trim(),
      description: description.trim(),
      causeOfDeath,
      duration: duration.trim() || "a few weekends",
      lastWords: lastWords.trim(),
      resurrectCount: 0,
      createdAt: new Date().toISOString(),
    };

    onSubmit(tombstone);
  };

  const inputClass =
    "w-full bg-background border border-card-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-card-bg border border-card-border rounded-2xl p-6 space-y-4 shadow-2xl"
      >
        <div className="text-center mb-2">
          <h2 className="text-lg font-bold text-foreground">Add a Tombstone</h2>
          <p className="text-xs text-muted">Lay your project to rest</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-muted mb-1">
            Project Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Brilliant App"
            required
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted mb-1">
            One-line Description <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Uber for houseplants"
            required
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted mb-1">
            Cause of Death
          </label>
          <select
            value={causeOfDeath}
            onChange={(e) => setCauseOfDeath(e.target.value)}
            className={inputClass + " cursor-pointer"}
          >
            {CAUSES_OF_DEATH.map((cause) => (
              <option key={cause} value={cause}>
                {causeEmoji(cause)} {cause}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-muted mb-1">
            How Long You Worked On It
          </label>
          <input
            type="text"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder='e.g. "3 weekends", "2 months"'
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted mb-1">
            Last Words <span className="text-muted/40">(optional)</span>
          </label>
          <input
            type="text"
            value={lastWords}
            onChange={(e) => setLastWords(e.target.value)}
            placeholder="It was ahead of its time..."
            className={inputClass}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-lg border border-card-border text-sm text-muted hover:text-foreground hover:bg-card-border/50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-light transition-colors cursor-pointer"
          >
            Bury It {"\u{1FAA6}"}
          </button>
        </div>
      </form>
    </div>
  );
}

// -------------------------------------------------------------------
// Icons
// -------------------------------------------------------------------
function ShareIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// -------------------------------------------------------------------
// Main Page
// -------------------------------------------------------------------
export default function Home() {
  const [tombstones, setTombstones] = useState<Tombstone[]>([]);
  const [tab, setTab] = useState<"recent" | "wanted">("recent");
  const [showForm, setShowForm] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTombstones(loadTombstones());
    setMounted(true);
  }, []);

  const handleSubmit = (t: Tombstone) => {
    const updated = [t, ...tombstones];
    setTombstones(updated);
    saveTombstones(updated);
    setShowForm(false);
    fetch('https://api.counterapi.dev/v1/vibeboard-tools/side-project-graveyard/up').catch(() => {})
  };

  const handleResurrect = (id: string) => {
    const updated = tombstones.map((t) =>
      t.id === id ? { ...t, resurrectCount: t.resurrectCount + 1 } : t
    );
    setTombstones(updated);
    saveTombstones(updated);
  };

  const sorted =
    tab === "recent"
      ? [...tombstones].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      : [...tombstones].sort((a, b) => b.resurrectCount - a.resurrectCount);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
          Side Project Graveyard
        </h1>
        <p className="mt-3 text-lg text-muted">
          Where side projects go to rest
        </p>
        <div className="mt-4 flex justify-center">
          <Counter
            namespace="vibeboard-tools"
            counterKey="side-project-graveyard"
            label="projects buried"
            incrementOnMount={false}
          />
        </div>
      </div>

      {/* Tabs + Add Button */}
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div className="flex gap-1 bg-card-bg border border-card-border rounded-lg p-1">
          <button
            onClick={() => setTab("recent")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              tab === "recent"
                ? "bg-accent text-white"
                : "text-muted hover:text-foreground"
            }`}
          >
            Recent
          </button>
          <button
            onClick={() => setTab("wanted")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              tab === "wanted"
                ? "bg-accent text-white"
                : "text-muted hover:text-foreground"
            }`}
          >
            Most Wanted
          </button>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-light transition-colors cursor-pointer"
        >
          + Add Tombstone
        </button>
      </div>

      {/* Grid */}
      {mounted && sorted.length === 0 && (
        <div className="text-center py-24 text-muted">
          <p className="text-5xl mb-4">{"\u{1FAA6}"}</p>
          <p className="text-lg font-medium">The graveyard is empty</p>
          <p className="text-sm mt-1">
            Be the first to bury a side project
          </p>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((t) => (
          <TombstoneCard
            key={t.id}
            tombstone={t}
            onResurrect={handleResurrect}
          />
        ))}
      </div>

      {/* Modal */}
      {showForm && (
        <SubmitForm
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
