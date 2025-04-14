import { useState, useEffect, useMemo } from "react";

const supportCards = [
  { id: "hardened_scales", name: "Hardened Scales" },
  { id: "branching_evolution", name: "Branching Evolution" },
  { id: "kami", name: "Kami of Whispered Hopes" },
  { id: "innkeeper", name: "Innkeeper's Talent" },
  { id: "ozolith", name: "Ozolith, the Shattered Spire" },
  { id: "conclave_mentor", name: "Conclave Mentor" },
  { id: "anduril", name: "Andúril Equipped" },
  { id: "citys_blessing", name: "City's Blessing (10+ permanents)" },
  { id: "unicorn", name: "Good-Fortune Unicorn (ETB trigger)" },
  { id: "crawler", name: "Duskshell Crawler (ETB trigger)" },
  { id: "hornbeetle", name: "Iridescent Hornbeetle (token maker)" }
];

const creatureData = {
  "scute mob": { counters: 1 },
  "hornet queen": { counters: 2 },
  "sigarda, font of blessings": { counters: 4 },
  "king darien xlviii": { counters: 3 },
  "springheart nantuko": { counters: 2 }
};

export default function App() {
  const [selectedCards, setSelectedCards] = useState([]);
  const [vrestinX, setVrestinX] = useState(0);
  const [creatures, setCreatures] = useState([]);
  const [newCreatureName, setNewCreatureName] = useState("");
  const [startingCounters, setStartingCounters] = useState(0);
  const [resultLog, setResultLog] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const handleNameChange = (e) => {
    const input = e.target.value;
    setNewCreatureName(input);
    if (!input) {
      setSuggestions([]);
      return;
    }
    const matches = Object.keys(creatureData).filter((name) =>
      name.includes(input.toLowerCase())
    );
    setSuggestions(matches);
  };

  const fillSuggestion = (name) => {
    const displayName = name.replace(/\b\w/g, (c) => c.toUpperCase());
    setNewCreatureName(displayName);
    const data = creatureData[name];
    if (data) setStartingCounters(data.counters);
    setSuggestions([]);
  };

  const memoizedSuggestions = useMemo(() => {
    return suggestions.length > 0 ? (
      <ul style={{ listStyle: "none", padding: 0, marginTop: "0.5rem", background: "#3a5f3a", border: "1px solid #888", borderRadius: "6px", fontWeight: "bold", fontSize: "1rem", color: "#fff" }}>
        {suggestions.map((s, i) => (
          <li
            key={i}
            style={{ padding: "0.5rem 0.7rem", cursor: "pointer", borderBottom: "1px solid #333" }}
            onClick={() => fillSuggestion(s)}
          >
            {s.replace(/\b\w/g, (c) => c.toUpperCase())}
          </li>
        ))}
      </ul>
    ) : null;
  }, [suggestions]);

  return (
    <div style={{ padding: "1rem", color: "#fff", background: "#1a1a1a", fontFamily: "Arial, sans-serif", display: "flex", flexDirection: "column", gap: "1rem" }}>
      <h1 style={{ textAlign: "center" }}>Vrestin +1/+1 Counter Tracker</h1>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem" }}>
        <div style={{ flex: 1, minWidth: "300px" }}>
          <h2>Select Active Cards</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            {supportCards.map((card) => (
              <div
                key={card.id}
                style={{
                  padding: "0.5rem",
                  backgroundColor: selectedCards.includes(card.id) ? "#2e7d32" : "#555",
                  borderRadius: "4px",
                  cursor: "pointer",
                  textAlign: "center",
                  color: "#fff",
                  fontWeight: "bold"
                }}
                onClick={() => setSelectedCards((prev) =>
                  prev.includes(card.id)
                    ? prev.filter((c) => c !== card.id)
                    : [...prev, card.id]
                )}
              >
                {card.name}
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: "300px" }}>
          <h2>Creatures</h2>
          <div>
            {creatures.map((c, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                <span style={{ color: "#fff" }}>{c.name}: +{c.counters}/+{c.counters}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h2>Vrestin Entry</h2>
        <input
          type="number"
          value={vrestinX}
          onChange={(e) => setVrestinX(e.target.value)}
          style={{ width: "100%" }}
        />
      </div>

      <div>
        <h2>Add Creature</h2>
        <input
          type="text"
          placeholder="Creature Name"
          value={newCreatureName}
          onChange={handleNameChange}
          style={{ width: "60%", marginRight: "1%" }}
        />
        <input
          type="number"
          placeholder="+1/+1 Counters"
          value={startingCounters}
          onChange={(e) => setStartingCounters(e.target.value)}
          style={{ width: "35%" }}
        />
        {memoizedSuggestions}
      </div>

      <div>
        <h2>Result Log</h2>
        <textarea
          readOnly
          value={resultLog.join("\n-------------------\n")}
          style={{ width: "100%", height: "150px" }}
        />
      </div>
    </div>
  );
}
