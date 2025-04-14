import { useState } from "react";

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
    if (has("hardened_scales")) bonus += 1;
    if (has("conclave_mentor")) bonus += 1;
    if (has("ozolith")) bonus += 1;
    return bonus;
  };

  const getMultiplier = () => {
    let multiplier = 1;
    if (has("branching_evolution")) multiplier *= 2;
    if (has("kami")) multiplier *= 2;
    if (has("innkeeper")) multiplier *= 2;
    return multiplier;
  };

  const addCreature = () => {
    const name = newCreatureName.trim();
    if (!name) return;
    const base = creatureData[name.toLowerCase()]?.counters || parseInt(startingCounters) || 0;
    const counters = Math.ceil((base + getBaseCounterBonus()) * getMultiplier());
    setCreatures((prev) => [...prev, { name, counters }]);
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

  const calculateETB = () => {
    const base = parseInt(vrestinX);
    const counterBonus = getBaseCounterBonus();
    const multiplier = getMultiplier();
    const vrestinCounters = Math.ceil((base + counterBonus) * multiplier);
    const insectBonus = has("unicorn") ? 1 : 0;
    const insectCounters = Math.ceil((insectBonus + counterBonus) * multiplier);

    const newCreatures = [
      { name: "Vrestin", counters: vrestinCounters },
      ...Array(base).fill().map((_, i) => ({ name: `Insect ${i + 1}`, counters: insectCounters }))
    ];

    setCreatures((prev) => [...prev, ...newCreatures]);
    const log = `Vrestin enters with ${vrestinCounters} counters.\nCreated ${base} Insects with +${insectCounters} counters each.`;
    setResultLog((prev) => [log, ...prev]);
  };

  const clearLog = () => setResultLog([]);

  return (
    <div style={{ padding: "1rem", color: "#fff", background: "#1a1a1a", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>Vrestin +1/+1 Counter Tracker</h1>

      <h2>Select Active Cards</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.5rem" }}>
        {supportCards.map((card) => (
          <div
            key={card.id}
            style={{
              cursor: "pointer",
              backgroundColor: selectedCards.includes(card.id) ? "#4caf50" : "#333",
              padding: "0.5rem",
              borderRadius: "0.25rem",
              textAlign: "center"
            }}
            onClick={() => toggleCard(card.id)}
          >
            {card.name}
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: "2rem" }}>Vrestin Entry</h2>
      <label htmlFor="vrestinX">X value when casting Vrestin:</label>
      <input
        id="vrestinX"
        type="number"
        value={vrestinX}
        onChange={(e) => setVrestinX(e.target.value)}
        style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
      />
      <button onClick={calculateETB} style={{ marginTop: "1rem", width: "100%", padding: "0.75rem", fontWeight: "bold" }}>
        Vrestin ETB (Calculate)
      </button>

      <h2 style={{ marginTop: "2rem" }}>Add Creature</h2>
      <input
        type="text"
        placeholder="Creature Name"
        value={newCreatureName}
        onChange={handleNameChange}
        style={{ width: "60%", marginRight: "1%" }}
      />
      <input
        type="number"
        placeholder="Base Counters"
        value={startingCounters}
        onChange={(e) => setStartingCounters(e.target.value)}
        style={{ width: "35%" }}
      />
      <button onClick={addCreature} style={{ marginTop: "0.5rem", width: "100%" }}>
        Add Creature
      </button>

      {suggestions.length > 0 && (
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
      )}

      <h2 style={{ marginTop: "2rem" }}>Creatures</h2>
      <div>
        {creatures.map((c, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span style={{ color: "#fff" }}>{c.name}: +{c.counters}/+{c.counters}</span>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: "2rem" }}>Result Log</h2>
      <textarea
        readOnly
        value={resultLog.join("\n-------------------\n")}
        style={{ width: "100%", height: "150px", fontFamily: "monospace" }}
      />
      <button onClick={clearLog} style={{ marginTop: "1rem", width: "100%" }}>
        Clear Log
      </button>
    </div>
  );
}
