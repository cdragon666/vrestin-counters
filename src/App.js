import { useState, useCallback, memo } from "react";

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
  "scute mob": { base: [0, 0], counters: 1 },
  "hornet queen": { base: [2, 2], counters: 0 },
  "sigarda, font of blessings": { base: [4, 4], counters: 0 },
  "king darien xlviii": { base: [2, 3], counters: 1 },
  "springheart nantuko": { base: [2, 2], counters: 0 }
};

const CreatureInput = memo(({ newCreatureName, startingCounters, handleNameChange, setStartingCounters, addCreature }) => (
  <>
    <input
      type="text"
      placeholder="Creature Name"
      value={newCreatureName}
      onChange={handleNameChange}
      style={{ width: "60%", marginRight: "2%", padding: "0.8rem", borderRadius: "8px" }}
    />
    <input
      type="number"
      placeholder="+1/+1 Counters"
      value={startingCounters}
      onChange={(e) => setStartingCounters(e.target.value)}
      style={{ width: "35%", padding: "0.8rem", borderRadius: "8px" }}
    />
    <button
      onClick={addCreature}
      style={{ marginTop: "1rem", width: "100%", padding: "0.8rem", backgroundColor: "#4CAF50", color: "white", borderRadius: "8px" }}
    >
      Add Creature
    </button>
  </>
));

export default function App() {
  const [selectedCards, setSelectedCards] = useState([]);
  const [vrestinX, setVrestinX] = useState(0);
  const [creatures, setCreatures] = useState([]);
  const [newCreatureName, setNewCreatureName] = useState("");
  const [startingCounters, setStartingCounters] = useState(0);
  const [resultLog, setResultLog] = useState([]);

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
      ...(creatures.find((c) => c.name === "Vrestin") ? [] : [{ name: "Vrestin", base: [0, 0], counters: vrestinCounters }]),
      ...Array(base).fill().map((_, i) => ({ name: `Insect ${i + 1}`, base: [1, 1], counters: insectCounters }))
    ];
    setCreatures((prev) => [...prev, ...newCreatures]);
    setResultLog((prev) => [log, ...prev]);
  };

  const handleNameChange = useCallback((e) => {
    const input = e.target.value;
    setNewCreatureName(input);
  }, []);

  const addCreature = useCallback(() => {
    const name = newCreatureName.trim();
    if (!name) return;
    const data = creatureData[name.toLowerCase()];
    const base = data ? data.base : [0, 0];
    const baseCounters = data ? data.counters : parseInt(startingCounters) || 0;
    const final = Math.ceil((baseCounters + getBaseCounterBonus()) * getMultiplier());
    setCreatures([...creatures, { name: newCreatureName, base, counters: final }]);
    setNewCreatureName("");
    setStartingCounters(0);
  }, [newCreatureName, startingCounters, creatures]);

  const updateCounter = (index, delta) => {
    setCreatures((prev) =>
      prev.map((c, i) => (i === index ? { ...c, counters: Math.max(0, c.counters + delta) } : c))
    );
  };

  const removeCreature = (index) => {
    setCreatures((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAllCreatures = () => setCreatures([]);
  const clearLog = () => setResultLog([]);

  return (
    <div style={{ padding: "1rem", backgroundColor: "#1a1a1a", color: "white" }}>
      <h1 style={{ textAlign: "center" }}>Vrestin +1/+1 Counter Tracker</h1>

      <h2>Active Cards</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
        {supportCards.map((card) => (
          <div
            key={card.id}
            onClick={() => toggleCard(card.id)}
            style={{
              padding: "0.6rem 1rem",
              borderRadius: "6px",
              backgroundColor: selectedCards.includes(card.id) ? "#4caf50" : "#444",
              cursor: "pointer"
            }}
          >
            {card.name}
          </div>
        ))}
      </div>

      <h2>Summon Vrestin</h2>
      <input
        type="number"
        placeholder="X value"
        value={vrestinX}
        onChange={(e) => setVrestinX(e.target.value)}
        style={{ width: "100%", padding: "0.6rem", marginBottom: "1rem" }}
      />
      <button onClick={calculateETB} style={{ width: "100%", padding: "0.8rem", backgroundColor: "#4CAF50", color: "white" }}>
        Summon Vrestin
      </button>

      <h2 style={{ marginTop: "2rem" }}>Add Creature</h2>
      <CreatureInput
        newCreatureName={newCreatureName}
        startingCounters={startingCounters}
        handleNameChange={handleNameChange}
        setStartingCounters={setStartingCounters}
        addCreature={addCreature}
      />
      <button onClick={clearAllCreatures} style={{ marginTop: "0.5rem", width: "100%", padding: "0.8rem", backgroundColor: "#800", color: "white" }}>
        ❌ Clear All Creatures
      </button>

      <h2>Creatures</h2>
      {creatures.map((c, i) => (
        <div key={i} style={{ background: "#333", padding: "1rem", borderRadius: "6px", marginBottom: "0.5rem" }}>
          {c.name}: {c.base[0]}/{c.base[1]} (+{c.counters}/+{c.counters})
          <div>
            <button onClick={() => updateCounter(i, 1)}>+1</button>
            <button onClick={() => updateCounter(i, -1)} style={{ marginLeft: "0.5rem" }}>-1</button>
            <button onClick={() => removeCreature(i)} style={{ marginLeft: "0.5rem" }}>🗑️</button>
          </div>
        </div>
      ))}

      <h2>Result Log</h2>
      <textarea
        readOnly
        value={resultLog.join("\n-------------------\n")}
        style={{ width: "100%", height: "200px", backgroundColor: "#222", color: "white", fontFamily: "monospace" }}
      />
      <button onClick={clearLog} style={{ width: "100%", marginTop: "0.5rem", padding: "0.8rem", backgroundColor: "#f44336", color: "white" }}>
        Clear Log
      </button>
    </div>
  );
}
