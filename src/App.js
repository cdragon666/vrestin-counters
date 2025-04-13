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
  const [decklistText, setDecklistText] = useState("");
  const [newCreatureName, setNewCreatureName] = useState("");
  const [startingCounters, setStartingCounters] = useState(0);
  const [resultLog, setResultLog] = useState([]);
  const [counterTracker, setCounterTracker] = useState(0);

  const toggleCard = (id) => {
    setSelectedCards((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const has = (id) => selectedCards.includes(id);

  function getBaseCounterBonus() {
    let bonus = 0;
    if (has("hardened_scales")) bonus += 1;
    if (has("conclave_mentor")) bonus += 1;
    if (has("ozolith")) bonus += 1;
    return bonus;
  }

  function getMultiplier() {
    let multiplier = 1;
    if (has("branching_evolution")) multiplier *= 2;
    if (has("kami")) multiplier *= 2;
    if (has("innkeeper")) multiplier *= 2;
    return multiplier;
  }

  function getEntryCounterBonus() {
    let base = 0;
    if (has("unicorn")) base += 1;
    if (has("crawler")) base += 1;
    base += getBaseCounterBonus();
    return Math.ceil(base * getMultiplier());
  }

  function addToTracker(amount) {
    setCounterTracker((prev) => prev + amount);
  }

  const calculateETB = () => {
    const base = parseInt(vrestinX);
    const vrestinCounters = Math.ceil((base + getBaseCounterBonus()) * getMultiplier());
    const insectCounters = getEntryCounterBonus();

    addToTracker(vrestinCounters + base * insectCounters);

    let log = `✨ Vrestin enters with ${vrestinCounters} counters\n`;
    log += `🐞 ${base} Insect tokens created (+${insectCounters})\n`;

    const newCreatures = [
      { name: "Vrestin", counters: vrestinCounters },
      ...Array(base).fill().map((_, i) => ({ name: `Insect ${i + 1}`, counters: insectCounters }))
    ];

    setCreatures((prev) => [...prev, ...newCreatures]);
    setResultLog((prev) => ["[ETB Phase]\n" + log, ...prev]);
  };

  const handleCombat = () => {
    const insectBonus = Math.ceil((1 + getBaseCounterBonus()) * getMultiplier());
    const andurilBase = has("citys_blessing") ? 2 : 1;
    const andurilBonus = Math.ceil((andurilBase + getBaseCounterBonus()) * getMultiplier());

    let total = 0;
    const updatedCreatures = creatures.map((c) => {
      const name = c.name.toLowerCase();
      const isInsect = name.includes("insect") || name.includes("vrestin");
      let added = 0;
      if (isInsect) added += insectBonus;
      if (has("anduril")) added += andurilBonus;
      total += added;
      return { ...c, counters: c.counters + added };
    });

    addToTracker(total);
    const log = `🌟 All insects +${insectBonus}, all creatures +${has("anduril") ? andurilBonus : 0} from Andúril`;
    setCreatures(updatedCreatures);
    setResultLog((prev) => ["[Combat Phase]\n" + log, ...prev]);
  };

  const handleEndStep = () => {
    let log = "[End Step]\n";
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

  const clearCreatures = () => setCreatures([]);

  const importDecklist = () => {
    const lines = decklistText.split("\n");
    const newCreatures = [];
    lines.forEach((line) => {
      const name = line.replace(/^[0-9x]+\s*/, "").toLowerCase().trim();
      if (name) {
        const data = creatureData[name];
        const count = parseInt(line) || 1;
        for (let i = 0; i < count; i++) {
          const base = data ? data.counters : 0;
          const final = Math.ceil((base + getBaseCounterBonus()) * getMultiplier());
          newCreatures.push({ name: name.replace(/\b\w/g, (c) => c.toUpperCase()), counters: final });
        }
      }
    });
    addToTracker(newCreatures.reduce((sum, c) => sum + c.counters, 0));
    setCreatures((prev) => [...prev, ...newCreatures]);
    setDecklistText("");
  };

  const clearLog = () => setResultLog([]);

  return (
    <div style={{ padding: "1rem", maxWidth: "720px", margin: "auto" }}>
      <h1 style={{ textAlign: "center" }}>Vrestin +1/+1 Counter Tracker</h1>

      <h2>Paste Decklist</h2>
      <textarea
        placeholder="Paste your decklist here..."
        value={decklistText}
        onChange={(e) => setDecklistText(e.target.value)}
        rows={5}
        style={{ width: "100%" }}
      ></textarea>
      <button onClick={importDecklist} style={{ marginTop: "0.5rem", width: "100%" }}>Import Decklist</button>

      <h2 style={{ marginTop: "2rem" }}>Select Active Cards</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
        {supportCards.map((card) => (
          <div
            key={card.id}
            className={`card-tile ${selectedCards.includes(card.id) ? "selected" : ""}`}
            onClick={() => toggleCard(card.id)}
          >
            {card.name}
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: "2rem" }}>Vrestin Entry</h2>
      <input
        type="number"
        value={vrestinX}
        onChange={(e) => setVrestinX(e.target.value)}
        placeholder="X value"
        style={{ width: "100%" }}
      />
      <button onClick={calculateETB} style={{ marginTop: "0.5rem", width: "100%" }}>Summon Vrestin</button>

      <h2 style={{ marginTop: "2rem" }}>Combat & End Step</h2>
      <button onClick={handleCombat} style={{ width: "100%" }}>Attack with Insects</button>
      <button onClick={handleEndStep} style={{ width: "100%", marginTop: "0.5rem" }}>
        Go to End Step (Hornbeetle Trigger)
      </button>
{creatures.length > 0 && (
  <button
    onClick={() => setCreatures([])}
    style={{
      background: "#a33",
      color: "white",
      padding: "0.5rem",
      margin: "1rem 0",
      border: "none",
      borderRadius: "6px",
      fontWeight: "bold",
      width: "100%"
    }}
  >
    🗑️ Delete All Creatures
  </button>
)}

      <h2 style={{ marginTop: "2rem" }}>Creatures</h2>
      <button onClick={clearCreatures} style={{ width: "100%", background: "#440", color: "#fff" }}>Clear All Creatures</button>
      {creatures.map((c, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
          <span>{c.name}: +{c.counters}/+{c.counters}</span>
          <div>
            <button onClick={() => updateCounter(i, 1)}>+1</button>
            <button onClick={() => updateCounter(i, -1)} style={{ marginLeft: "0.5rem" }}>-1</button>
            <button onClick={() => removeCreature(i)} style={{ marginLeft: "0.5rem", color: "red" }}>🗑️</button>
          </div>
        </div>
      ))}

      {resultLog.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h2>Result Log</h2>
            <button onClick={clearLog}>Clear</button>
          </div>
          <textarea
            readOnly
            value={resultLog.join("\n-------------------\n")}
            style={{ width: "100%", height: "200px", fontFamily: "monospace" }}
          />
        </div>
      )}
    </div>
  );
}

