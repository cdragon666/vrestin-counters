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
  "scute mob": { base: [1, 1], counters: 1 },
  "hornet queen": { base: [2, 2], counters: 0 },
  "sigarda, font of blessings": { base: [4, 4], counters: 0 },
  "king darien xlviii": { base: [3, 3], counters: 0 },
  "springheart nantuko": { base: [2, 2], counters: 0 }
};

export default function App() {
  const [selectedCards, setSelectedCards] = useState([]);
  const [vrestinX, setVrestinX] = useState(0);
  const [creatures, setCreatures] = useState([]);
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

    let log = `[ETB Phase]\n✨ Vrestin enters with ${vrestinCounters} counters\n🐞 ${base} Insect tokens created (+${insectCounters})`;

    const newCreatures = [
      { name: "Vrestin", base: [0, 0], counters: vrestinCounters },
      ...Array(base).fill().map((_, i) => ({ name: `Insect ${i + 1}`, base: [1, 1], counters: insectCounters }))
    ];

    setCreatures((prev) => [...prev, ...newCreatures]);
    setResultLog((prev) => [log, ...prev]);
  };

  const handleCombat = () => {
    let log = `[Combat Phase]\n`;
    const insectBonus = Math.ceil((1 + getBaseCounterBonus()) * getMultiplier());
    const andurilBase = has("citys_blessing") ? 2 : 1;
    const andurilBonus = Math.ceil((andurilBase + getBaseCounterBonus()) * getMultiplier());

    const updatedCreatures = creatures.map((c) => {
      const name = c.name.toLowerCase();
      const isInsect = name.includes("insect") || name.includes("vrestin");
      let added = 0;
      if (isInsect) added += insectBonus;
      if (has("anduril")) added += andurilBonus;
      addToTracker(added);
      return { ...c, counters: c.counters + added };
    });

    log += has("anduril")
      ? `🌟 All insects +${insectBonus}, all creatures +${andurilBonus} from Andúril`
      : `🌟 All insects +${insectBonus}`;

    setCreatures(updatedCreatures);
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

  const clearAllCreatures = () => setCreatures([]);

  const addCreature = () => {
    const name = newCreatureName.trim();
    if (!name) return;
    const data = creatureData[name.toLowerCase()];
    const baseStats = data ? data.base : [1, 1];
    const baseCounters = data ? data.counters : parseInt(startingCounters) || 0;
    const final = Math.ceil((baseCounters + getBaseCounterBonus()) * getMultiplier());
    addToTracker(final);
    setCreatures([...creatures, { name, base: baseStats, counters: final }]);
    setNewCreatureName("");
    setStartingCounters(0);
  };

  const clearLog = () => setResultLog([]);

  return (
    <div style={{ padding: "1rem", maxWidth: "700px", margin: "auto" }}>
      <h1 style={{ textAlign: "center" }}>Vrestin +1/+1 Counter Tracker</h1>

      <h2>Active Cards</h2>
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
        placeholder="X value"
        value={vrestinX}
        onChange={(e) => setVrestinX(e.target.value)}
        style={{ width: "100%", marginBottom: "0.5rem" }}
      />
      <button onClick={calculateETB} style={{ width: "100%", marginBottom: "1rem" }}>Summon Vrestin</button>

      <h2>Add Creature</h2>
      <input
        type="text"
        placeholder="Creature Name"
        value={newCreatureName}
        onChange={(e) => setNewCreatureName(e.target.value)}
        style={{ width: "60%", marginRight: "1%" }}
      />
      <input
        type="number"
        placeholder="+1/+1 Counters"
        value={startingCounters}
        onChange={(e) => setStartingCounters(e.target.value)}
        style={{ width: "35%" }}
      />
      <button onClick={addCreature} style={{ width: "100%", marginTop: "0.5rem" }}>Add Creature</button>
      <button onClick={clearAllCreatures} style={{ width: "100%", marginTop: "0.5rem", backgroundColor: "#500", color: "white" }}>
        ❌ Clear All Creatures
      </button>

      <h2 style={{ marginTop: "2rem" }}>Combat Phase</h2>
      <button onClick={handleCombat} style={{ width: "100%" }}>Attack with Insects</button>

      <h2 style={{ marginTop: "2rem" }}>Creatures</h2>
      <div style={{ maxHeight: "300px", overflowY: "auto", border: "1px solid #ccc", padding: "1rem", borderRadius: "6px" }}>
        {creatures.map((c, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span>
              {c.name}: {c.base[0]}/{c.base[1]} (+{c.counters}/+{c.counters}) → <strong>{c.base[0] + c.counters}/{c.base[1] + c.counters}</strong>
            </span>
            <div>
              <button onClick={() => updateCounter(i, 1)}>+1</button>
              <button onClick={() => updateCounter(i, -1)} style={{ marginLeft: "0.5rem" }}>-1</button>
              <button onClick={() => removeCreature(i)} style={{ marginLeft: "0.5rem", color: "red" }}>🗑️</button>
            </div>
          </div>
        ))}
      </div>

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
