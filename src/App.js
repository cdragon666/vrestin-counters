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
    const alreadyExists = creatures.find((c) => c.name.toLowerCase() === "vrestin");
    if (alreadyExists || isNaN(base)) return;

    const vrestinCounters = Math.ceil((base + getBaseCounterBonus()) * getMultiplier());
    const insectCounters = getEntryCounterBonus();

    addToTracker(vrestinCounters + base * insectCounters);

    let log = `Vrestin enters with ${vrestinCounters} counters\n${base} Insect tokens created with ${insectCounters} counters each`;

    const newCreatures = [
      { name: "Vrestin", counters: vrestinCounters, power: 0, toughness: 0 },
      ...Array(base).fill().map((_, i) => ({ name: `Insect ${i + 1}`, counters: insectCounters, power: 1, toughness: 1 }))
    ];

    setCreatures((prev) => [...prev, ...newCreatures]);
    setResultLog((prev) => [log, ...prev]);
  };

  const handleCombat = () => {
    let log = ``;
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
      ? `Insects gain +${insectBonus}, all creatures gain +${andurilBonus} from Andúril.`
      : `Insects gain +${insectBonus}.`;

    setCreatures(updatedCreatures);
    setResultLog((prev) => [log, ...prev]);
  };

  const handleEndStep = () => {
    let log = ``;
    if (has("hornbeetle") && counterTracker > 0) {
      const beetleBonus = getEntryCounterBonus();
      const newTokens = Array(counterTracker).fill().map((_, i) => ({
        name: `Beetle Token ${i + 1}`,
        counters: beetleBonus,
        power: 1,
        toughness: 1
      }));
      setCreatures((prev) => [...prev, ...newTokens]);
      log += `Hornbeetle creates ${counterTracker} Beetle tokens with ${beetleBonus} counters each.`;
      addToTracker(counterTracker * beetleBonus);
    } else {
      log += `No end step effects triggered.`;
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
    setCreatures([...creatures, { name: newCreatureName, counters: final, power: 0, toughness: 0 }]);
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

  const clearLog = () => setResultLog([]);

  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "auto" }}>
      <h1 style={{ textAlign: "center" }}>Vrestin +1/+1 Counter Tracker</h1>

      <h2>Active Cards</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        {supportCards.map((card) => (
          <div
            key={card.id}
            style={{
              cursor: "pointer",
              padding: "0.5rem",
              borderRadius: "0.5rem",
              textAlign: "center",
              border: "2px solid",
              background: selectedCards.includes(card.id) ? "#3a5f3a" : "#f4f4f4",
              color: selectedCards.includes(card.id) ? "#fff" : "#222",
              borderColor: selectedCards.includes(card.id) ? "#3a5f3a" : "#ccc"
            }}
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
        style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem" }}
      />
      <button onClick={calculateETB} style={{ width: "100%" }}>
        Summon Vrestin
      </button>

      <h2 style={{ marginTop: "2rem" }}>Creatures</h2>
      {creatures.map((c, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0.5rem",
            background: selectedCards.includes(c.name.toLowerCase()) ? "#3a5f3a" : "#f4f4f4",
            color: selectedCards.includes(c.name.toLowerCase()) ? "#fff" : "#222",
            borderRadius: "0.5rem",
            marginBottom: "0.5rem"
          }}
        >
          <span style={{ fontWeight: "bold" }}>
            {c.name}: {c.power + c.counters}/{c.toughness + c.counters} (+{c.counters})
          </span>
          <div>
            <button onClick={() => updateCounter(i, 1)}>+1</button>
            <button onClick={() => updateCounter(i, -1)} style={{ marginLeft: "0.5rem" }}>-1</button>
            <button onClick={() => removeCreature(i)} style={{ marginLeft: "0.5rem", color: "red" }}>🗑️</button>
          </div>
        </div>
      ))}
      <button onClick={clearAllCreatures} style={{ marginBottom: "2rem", width: "100%", background: "#500", color: "#fff" }}>
        ❌ Clear All Creatures
      </button>

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

      <h2 style={{ marginTop: "2rem" }}>Combat & End Step</h2>
      <button onClick={handleCombat} style={{ width: "49%", marginRight: "2%" }}>
        Attack with Insects
      </button>
      <button onClick={handleEndStep} style={{ width: "49%" }}>
        End Step (Hornbeetle)
      </button>

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
