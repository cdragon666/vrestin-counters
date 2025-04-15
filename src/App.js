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
  const [counterTracker, setCounterTracker] = useState(0);

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
    let mult = 1;
    if (has("branching_evolution")) mult *= 2;
    if (has("kami")) mult *= 2;
    if (has("innkeeper")) mult *= 2;
    return mult;
  };

  const getEntryCounterBonus = () => {
    let base = 0;
    if (has("unicorn")) base += 1;
    if (has("crawler")) base += 1;
    base += getBaseCounterBonus();
    return Math.ceil(base * getMultiplier());
  };

  const addToTracker = (amount) => {
    setCounterTracker((prev) => prev + amount);
  };

  const calculateETB = () => {
    const base = parseInt(vrestinX);
    const vrestinCounters = Math.ceil((base + getBaseCounterBonus()) * getMultiplier());
    const insectCounters = getEntryCounterBonus();
    addToTracker(vrestinCounters + base * insectCounters);

    let log = `[ETB Phase]\n✨ Vrestin enters with ${vrestinCounters} counters\n🐞 ${base} Insect tokens created (+${insectCounters})`;

    const newCreatures = [
      { name: "Vrestin", counters: vrestinCounters },
      ...Array(base).fill().map((_, i) => ({ name: `Insect ${i + 1}`, counters: insectCounters }))
    ];

    setCreatures((prev) => [...prev, ...newCreatures]);
    setResultLog((prev) => [log, ...prev]);
  };

  const handleCombat = () => {
    let log = `[Combat Phase]\n`;
    const insectBonus = Math.ceil((1 + getBaseCounterBonus()) * getMultiplier());
    const andurilBase = has("citys_blessing") ? 2 : 1;
    const andurilBonus = Math.ceil((andurilBase + getBaseCounterBonus()) * getMultiplier());

    const updated = creatures.map((c) => {
      const name = c.name.toLowerCase();
      const isInsect = name.includes("insect") || name.includes("vrestin");
      let add = 0;
      if (isInsect) add += insectBonus;
      if (has("anduril")) add += andurilBonus;
      addToTracker(add);
      return { ...c, counters: c.counters + add };
    });

    log += has("anduril")
      ? `🌟 All insects +${insectBonus}, all creatures +${andurilBonus} from Andúril`
      : `🌟 All insects +${insectBonus}`;

    setCreatures(updated);
    setResultLog((prev) => [log, ...prev]);
  };

  const handleEndStep = () => {
    let log = `[End Step]\n`;
    if (has("hornbeetle") && counterTracker > 0) {
      const beetleBonus = getEntryCounterBonus();
      const newTokens = Array(counterTracker).fill().map((_, i) => ({ name: `Beetle Token ${i + 1}`, counters: beetleBonus }));
      setCreatures((prev) => [...prev, ...newTokens]);
      log += `Hornbeetle creates ${counterTracker} Beetle tokens (+${beetleBonus})`;
      addToTracker(counterTracker * beetleBonus);
    } else {
      log += `No effects triggered.`;
    }
    setCounterTracker(0);
    setResultLog((prev) => [log, ...prev]);
  };

  const updateCounter = (index, delta) => {
    if (delta > 0) addToTracker(delta);
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

  const addCreature = () => {
    const name = newCreatureName.trim();
    if (!name) return;
    const data = creatureData[name.toLowerCase()];
    const baseCounters = data ? data.counters : parseInt(startingCounters) || 0;
    const final = Math.ceil((baseCounters + getBaseCounterBonus()) * getMultiplier());
    addToTracker(final);
    setCreatures([...creatures, { name: newCreatureName, counters: final }]);
    setNewCreatureName("");
    setStartingCounters(0);
    setSuggestions([]);
  };

  const handleNameChange = (e) => {
    const input = e.target.value;
    setNewCreatureName(input);
    if (!input) return setSuggestions([]);
    const matches = Object.keys(creatureData).filter((name) => name.includes(input.toLowerCase()));
    setSuggestions(matches);
  };

  const fillSuggestion = (name) => {
    const displayName = name.replace(/\b\w/g, (c) => c.toUpperCase());
    setNewCreatureName(displayName);
    const data = creatureData[name];
    if (data) setStartingCounters(data.counters);
    setSuggestions([]);
  };

  const clearLog = () => setResultLog([]);

  const memoizedSuggestions = useMemo(() => {
    return suggestions.length > 0 ? (
      <ul style={{ listStyle: "none", padding: 0, marginTop: "0.5rem", background: "#3a5f3a", border: "1px solid #888", borderRadius: "6px", fontWeight: "bold", fontSize: "1rem", color: "#fff" }}>
        {suggestions.map((s, i) => (
          <li key={i} style={{ padding: "0.5rem 0.7rem", cursor: "pointer", borderBottom: "1px solid #333" }} onClick={() => fillSuggestion(s)}>
            {s.replace(/\b\w/g, (c) => c.toUpperCase())}
          </li>
        ))}
      </ul>
    ) : null;
  }, [suggestions]);

  return (
    <div style={{ padding: "1rem", color: "#fff", background: "#1a1a1a", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>Vrestin +1/+1 Counter Tracker</h1>

      <h2>Select Active Cards</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.5rem" }}>
        {supportCards.map((card) => (
          <div
            key={card.id}
            onClick={() => toggleCard(card.id)}
            style={{
              padding: "0.5rem",
              background: selectedCards.includes(card.id) ? "#50b950" : "#333",
              borderRadius: "8px",
              textAlign: "center",
              cursor: "pointer"
            }}
          >
            {card.name}
          </div>
        ))}
      </div>

      <h2>Vrestin Entry</h2>
      <input type="number" value={vrestinX} onChange={(e) => setVrestinX(e.target.value)} style={{ width: "100%" }} />
      <button onClick={calculateETB} style={{ width: "100%", marginTop: "0.5rem" }}>
        Summon Vrestin
      </button>

      <h2>Add Creature</h2>
      <input type="text" placeholder="Creature Name" value={newCreatureName} onChange={handleNameChange} style={{ width: "60%", marginRight: "1%" }} />
      <input type="number" placeholder="+1/+1 Counters" value={startingCounters} onChange={(e) => setStartingCounters(e.target.value)} style={{ width: "35%" }} />
      <button onClick={addCreature} style={{ width: "100%", marginTop: "0.5rem" }}>
        Add Creature
      </button>
      <button onClick={clearAllCreatures} style={{ width: "100%", marginTop: "0.5rem", background: "#500", color: "#fff" }}>
        ❌ Clear All Creatures
      </button>

      {memoizedSuggestions}

      <h2>Creatures</h2>
      {creatures.map((c, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#333", padding: "0.5rem", borderRadius: "6px", marginBottom: "0.5rem" }}>
          <span style={{ color: "#fff" }}>{c.name}: +{c.counters}/+{c.counters}</span>
          <div>
            <button onClick={() => updateCounter(i, 1)}>+1</button>
            <button onClick={() => updateCounter(i, -1)} style={{ marginLeft: "0.5rem" }}>-1</button>
            <button onClick={() => removeCreature(i)} style={{ marginLeft: "0.5rem", color: "red" }}>🗑️</button>
          </div>
        </div>
      ))}

      <h2>Combat Phase</h2>
      <button onClick={handleCombat} style={{ width: "100%" }}>
        Attack with Insects
      </button>

      <h2>End Step</h2>
      <button onClick={handleEndStep} style={{ width: "100%" }}>
        Go to End Step (Hornbeetle Trigger)
      </button>

      <h2>Result Log</h2>
      <textarea readOnly value={resultLog.join("\n-------------------\n")} style={{ width: "100%", height: "150px" }} />
      <button onClick={clearLog} style={{ width: "100%", marginTop: "0.5rem" }}>
        Clear Log
      </button>
    </div>
  );
}
