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

  const toggleCard = (id) => {
    setSelectedCards((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const has = (id) => selectedCards.includes(id);

  const getBaseCounterBonus = () => {
    let bonus = 0;
    if (has("hardened_scales")) bonus++;
    if (has("conclave_mentor")) bonus++;
    if (has("ozolith")) bonus++;
    return bonus;
  };

  const getMultiplier = () => {
    let multiplier = 1;
    if (has("branching_evolution")) multiplier *= 2;
    if (has("kami")) multiplier *= 2;
    if (has("innkeeper")) multiplier *= 2;
    return multiplier;
  };

  const getEntryCounterBonus = () => {
    let base = 0;
    if (has("unicorn")) base++;
    if (has("crawler")) base++;
    base += getBaseCounterBonus();
    return Math.ceil(base * getMultiplier());
  };

  const calculateETB = () => {
    const base = parseInt(vrestinX);
    const vrestinCounters = Math.ceil((base + getBaseCounterBonus()) * getMultiplier());
    const insectCounters = getEntryCounterBonus();

    const log = `[ETB Phase]\n✨ Vrestin enters with ${vrestinCounters} counters\n🐞 ${base} Insect tokens created (+${insectCounters})`;

    const newCreatures = [
      ...(creatures.find((c) => c.name === "Vrestin") ? [] : [{ name: "Vrestin", counters: vrestinCounters }]),
      ...Array(base).fill().map((_, i) => ({ name: `Insect ${i + 1}`, counters: insectCounters }))
    ];

    setCreatures((prev) => [...prev, ...newCreatures]);
    setResultLog((prev) => [log, ...prev]);
  };

  const updateCounter = (index, delta) => {
    setCreatures((prev) =>
      prev.map((c, i) => (i === index ? { ...c, counters: Math.max(0, c.counters + delta) } : c))
    );
  };

  const removeCreature = (index) => {
    setCreatures((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAllCreatures = () => {
    setCreatures([]);
  };

  const clearLog = () => setResultLog([]);

  const addCreature = () => {
    const name = newCreatureName.trim();
    if (!name) return;
    const data = creatureData[name.toLowerCase()];
    const baseCounters = data ? data.counters : parseInt(startingCounters) || 0;
    const final = Math.ceil((baseCounters + getBaseCounterBonus()) * getMultiplier());
    setCreatures([...creatures, { name: newCreatureName, counters: final }]);
    setNewCreatureName("");
    setStartingCounters(0);
    setSuggestions([]);
  };

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

  const handleCombat = () => {
    const bonus = Math.ceil((1 + getBaseCounterBonus()) * getMultiplier());
    const updated = creatures.map((c) => {
      const isInsect = c.name.toLowerCase().includes("insect") || c.name === "Vrestin";
      return {
        ...c,
        counters: c.counters + (isInsect ? bonus : 0)
      };
    });
    setCreatures(updated);
    const log = `[Combat Phase]\n🌟 All insects +${bonus}`;
    setResultLog((prev) => [log, ...prev]);
  };

  const handleEndStep = () => {
    const log = `[End Step]\nNo effects triggered.`;
    setResultLog((prev) => [log, ...prev]);
  };

  const isMobile = window.innerWidth < 768;

  return (
    <div style={{ padding: "1rem", backgroundColor: "#1a1a1a", color: "white", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>Vrestin +1/+1 Counter Tracker</h1>

      <div style={{ display: isMobile ? "block" : "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", padding: "1rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "2rem" }}>
          <div>
            <h2>Select Active Cards</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
              {supportCards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => toggleCard(card.id)}
                  style={{
                    backgroundColor: selectedCards.includes(card.id) ? "#4caf50" : "#2e2e2e",
                    color: "white",
                    padding: "0.8rem 1.2rem",
                    borderRadius: "8px",
                    cursor: "pointer",
                    width: "max-content"
                  }}
                >
                  {card.name}
                </div>
              ))}
            </div>

            <h2 style={{ marginTop: "2rem" }}>Vrestin Entry</h2>
            <h2 style={{ marginTop: "1rem" }}>Vrestin Entry</h2>
            <input
              type="number"
              placeholder="X value"
              value={vrestinX}
              onChange={(e) => setVrestinX(e.target.value)}
              style={{ width: "100%", padding: "0.8rem", marginBottom: "1rem", borderRadius: "8px" }}
            />
            <button onClick={calculateETB} style={{ width: "100%", padding: "0.8rem", backgroundColor: "#4CAF50", color: "white", borderRadius: "8px" }}>
              Summon Vrestin
            </button>

            <h2 style={{ marginTop: "2rem" }}>Add Creature</h2>
            <h2 style={{ marginTop: "1rem" }}>Add Creature</h2>
            <input
              type="text"
              placeholder="Creature Name"
              value={newCreatureName}
              onChange={handleNameChange}
              style={{ width: "60%", marginRight: "2%", padding: "0.8rem", borderRadius: "8px" }}
            />
            <input
              type="number"
              placeholder="Counters"
              value={startingCounters}
              onChange={(e) => setStartingCounters(e.target.value)}
              style={{ width: "35%", padding: "0.8rem", borderRadius: "8px" }}
            />
            <button onClick={addCreature} style={{ marginTop: "1rem", width: "100%", padding: "0.8rem", backgroundColor: "#4CAF50", color: "white", borderRadius: "8px" }}>
              Add Creature
            </button>
            <button onClick={clearAllCreatures} style={{ marginTop: "1rem", width: "100%", padding: "0.8rem", backgroundColor: "#800", color: "white", borderRadius: "8px" }}>
              Clear All Creatures
            </button>
          </div>

          <div>
            <h2>Creatures</h2>
            {creatures.map((c, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", background: "#333", padding: "1rem", borderRadius: "8px" }}>
                <span style={{ color: "white" }}>{c.name}: +{c.counters}/+{c.counters}</span>
                <div>
                  <button onClick={() => updateCounter(i, 1)} style={{ marginRight: "0.5rem", padding: "0.6rem", backgroundColor: "#4CAF50", color: "white", borderRadius: "8px" }}>+1</button>
                  <button onClick={() => updateCounter(i, -1)} style={{ marginRight: "0.5rem", padding: "0.6rem", backgroundColor: "#F44336", color: "white", borderRadius: "8px" }}>-1</button>
                  <button onClick={() => removeCreature(i)} style={{ padding: "0.6rem", backgroundColor: "#FF5722", color: "white", borderRadius: "8px" }}>🗑️</button>
                </div>
              </div>
            ))}

            <h2 style={{ marginTop: "2rem" }}>Result Log</h2>
            <h2 style={{ marginTop: "1rem" }}>Result Log</h2>
            <textarea
              readOnly
              value={resultLog.join("\n-------------------\n")}
              style={{
                width: "100%",
                height: "150px",
                backgroundColor: "#222",
                color: "white",
                fontFamily: "monospace",
                padding: "0.8rem",
                borderRadius: "8px",
              }}
            />
            <button onClick={clearLog} style={{ width: "100%", marginTop: "1rem", padding: "0.8rem", backgroundColor: "#f44336", color: "white", borderRadius: "8px" }}>
              Clear Log
            </button>
          </div>
        </div>
    </div>
  );
}
