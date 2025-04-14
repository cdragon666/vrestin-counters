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

  const has = (id) => selectedCards.includes(id);

  const toggleCard = (id) => {
    setSelectedCards((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const getBaseBonus = () => {
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

  const getEntryBonus = () => {
    let bonus = 0;
    if (has("unicorn")) bonus += 1;
    if (has("crawler")) bonus += 1;
    return Math.ceil((bonus + getBaseBonus()) * getMultiplier());
  };

  const addToTracker = (amount) => {
    setCounterTracker((prev) => prev + amount);
  };

  const calculateETB = () => {
    const x = parseInt(vrestinX);
    const vrestinCounters = Math.ceil((x + getBaseBonus()) * getMultiplier());
    const insectCounters = getEntryBonus();

    const newCreatures = [
      { name: "Vrestin", counters: vrestinCounters },
      ...Array(x).fill().map((_, i) => ({ name: `Insect ${i + 1}`, counters: insectCounters }))
    ];

    addToTracker(vrestinCounters + x * insectCounters);

    let log = `[ETB Phase]\n✨ Vrestin enters with ${vrestinCounters} counters\n🐞 ${x} Insects created (+${insectCounters})`;
    setCreatures((prev) => [...prev, ...newCreatures]);
    setResultLog((prev) => [log, ...prev]);
  };

  const handleCombat = () => {
    let log = `[Combat Phase]\n`;
    const insectBonus = Math.ceil((1 + getBaseBonus()) * getMultiplier());
    const andurilBase = has("citys_blessing") ? 2 : 1;
    const andurilBonus = Math.ceil((andurilBase + getBaseBonus()) * getMultiplier());

    const updatedCreatures = creatures.map((c) => {
      const isInsect = c.name.toLowerCase().includes("insect") || c.name.toLowerCase() === "vrestin";
      let bonus = 0;
      if (isInsect) bonus += insectBonus;
      if (has("anduril")) bonus += andurilBonus;
      addToTracker(bonus);
      return { ...c, counters: c.counters + bonus };
    });

    if (has("anduril")) {
      log += `🌟 All insects +${insectBonus}, all creatures +${andurilBonus} from Andúril`;
    } else {
      log += `🌟 All insects +${insectBonus}`;
    }

    setCreatures(updatedCreatures);
    setResultLog((prev) => [log, ...prev]);
  };

  const handleEndStep = () => {
    let log = `[End Step]\n`;
    if (has("hornbeetle") && counterTracker > 0) {
      const beetleBonus = getEntryBonus();
      const beetles = Array(counterTracker).fill().map((_, i) => ({
        name: `Beetle Token ${i + 1}`,
        counters: beetleBonus
      }));
      setCreatures((prev) => [...prev, ...beetles]);
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
      prev.map((c, i) =>
        i === index ? { ...c, counters: Math.max(0, c.counters + delta) } : c
      )
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
    const base = data ? data.counters : parseInt(startingCounters) || 0;
    const final = Math.ceil((base + getBaseBonus()) * getMultiplier());
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
    const matches = Object.keys(creatureData).filter((name) =>
      name.includes(input.toLowerCase())
    );
    setSuggestions(matches);
  };

  const fillSuggestion = (name) => {
    setNewCreatureName(name.replace(/\b\w/g, (c) => c.toUpperCase()));
    const data = creatureData[name];
    if (data) setStartingCounters(data.counters);
    setSuggestions([]);
  };

  const clearLog = () => setResultLog([]);

  return (
    <div style={{ padding: "1rem", color: "#fff", background: "#1a1a1a", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>Vrestin +1/+1 Counter Tracker</h1>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", justifyContent: "space-between" }}>
        <div style={{ flex: "1 1 300px" }}>
          <h2>Select Active Cards</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            {supportCards.map((card) => (
              <div
                key={card.id}
                onClick={() => toggleCard(card.id)}
                style={{
                  cursor: "pointer",
                  padding: "0.5rem",
                  background: selectedCards.includes(card.id) ? "#4caf50" : "#333",
                  border: "1px solid #888",
                  borderRadius: "5px",
                  textAlign: "center"
                }}
              >
                {card.name}
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: "1 1 300px" }}>
          <h2>Creatures</h2>
          {creatures.map((c, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#333",
                padding: "0.5rem",
                marginBottom: "0.3rem",
                borderRadius: "4px"
              }}
            >
              <span style={{ color: "#fff" }}>{c.name}: +{c.counters}/+{c.counters}</span>
              <div>
                <button onClick={() => updateCounter(i, 1)}>+1</button>
                <button onClick={() => updateCounter(i, -1)} style={{ marginLeft: "0.5rem" }}>-1</button>
                <button onClick={() => removeCreature(i)} style={{ marginLeft: "0.5rem", color: "red" }}>🗑️</button>
              </div>
            </div>
          ))}
          <button onClick={clearAllCreatures} style={{ width: "100%", marginTop: "0.5rem", background: "#800", color: "#fff" }}>
            ❌ Clear All Creatures
          </button>
        </div>
      </div>

      <h2 style={{ marginTop: "2rem" }}>Vrestin Entry</h2>
      <input
        type="number"
        value={vrestinX}
        onChange={(e) => setVrestinX(e.target.value)}
        placeholder="X value"
        style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
      />
      <button onClick={calculateETB} style={{ width: "100%" }}>Summon Vrestin</button>

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
        placeholder="+1/+1 Counters"
        value={startingCounters}
        onChange={(e) => setStartingCounters(e.target.value)}
        style={{ width: "35%" }}
      />
      <button onClick={addCreature} style={{ width: "100%", marginTop: "0.5rem" }}>
        Add Creature
      </button>

      {suggestions.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, marginTop: "0.5rem", background: "#222", border: "1px solid #888", borderRadius: "6px", color: "#fff" }}>
          {suggestions.map((s, i) => (
            <li
              key={i}
              style={{ padding: "0.5rem", cursor: "pointer" }}
              onClick={() => fillSuggestion(s)}
            >
              {s}
            </li>
          ))}
        </ul>
      )}

      <h2 style={{ marginTop: "2rem" }}>Phases</h2>
      <button onClick={handleCombat} style={{ width: "100%", marginBottom: "0.5rem" }}>
        Attack with Insects
      </button>
      <button onClick={handleEndStep} style={{ width: "100%" }}>
        Go to End Step (Hornbeetle Trigger)
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
            style={{ width: "100%", height: "200px", fontFamily: "monospace", marginTop: "0.5rem" }}
          />
        </div>
      )}
    </div>
  );
}
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

  const has = (id) => selectedCards.includes(id);

  const toggleCard = (id) => {
    setSelectedCards((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const getBaseBonus = () => {
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

  const getEntryBonus = () => {
    let bonus = 0;
    if (has("unicorn")) bonus += 1;
    if (has("crawler")) bonus += 1;
    return Math.ceil((bonus + getBaseBonus()) * getMultiplier());
  };

  const addToTracker = (amount) => {
    setCounterTracker((prev) => prev + amount);
  };

  const calculateETB = () => {
    const x = parseInt(vrestinX);
    const vrestinCounters = Math.ceil((x + getBaseBonus()) * getMultiplier());
    const insectCounters = getEntryBonus();

    const newCreatures = [
      { name: "Vrestin", counters: vrestinCounters },
      ...Array(x).fill().map((_, i) => ({ name: `Insect ${i + 1}`, counters: insectCounters }))
    ];

    addToTracker(vrestinCounters + x * insectCounters);

    let log = `[ETB Phase]\n✨ Vrestin enters with ${vrestinCounters} counters\n🐞 ${x} Insects created (+${insectCounters})`;
    setCreatures((prev) => [...prev, ...newCreatures]);
    setResultLog((prev) => [log, ...prev]);
  };

  const handleCombat = () => {
    let log = `[Combat Phase]\n`;
    const insectBonus = Math.ceil((1 + getBaseBonus()) * getMultiplier());
    const andurilBase = has("citys_blessing") ? 2 : 1;
    const andurilBonus = Math.ceil((andurilBase + getBaseBonus()) * getMultiplier());

    const updatedCreatures = creatures.map((c) => {
      const isInsect = c.name.toLowerCase().includes("insect") || c.name.toLowerCase() === "vrestin";
      let bonus = 0;
      if (isInsect) bonus += insectBonus;
      if (has("anduril")) bonus += andurilBonus;
      addToTracker(bonus);
      return { ...c, counters: c.counters + bonus };
    });

    if (has("anduril")) {
      log += `🌟 All insects +${insectBonus}, all creatures +${andurilBonus} from Andúril`;
    } else {
      log += `🌟 All insects +${insectBonus}`;
    }

    setCreatures(updatedCreatures);
    setResultLog((prev) => [log, ...prev]);
  };

  const handleEndStep = () => {
    let log = `[End Step]\n`;
    if (has("hornbeetle") && counterTracker > 0) {
      const beetleBonus = getEntryBonus();
      const beetles = Array(counterTracker).fill().map((_, i) => ({
        name: `Beetle Token ${i + 1}`,
        counters: beetleBonus
      }));
      setCreatures((prev) => [...prev, ...beetles]);
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
      prev.map((c, i) =>
        i === index ? { ...c, counters: Math.max(0, c.counters + delta) } : c
      )
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
    const base = data ? data.counters : parseInt(startingCounters) || 0;
    const final = Math.ceil((base + getBaseBonus()) * getMultiplier());
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
    const matches = Object.keys(creatureData).filter((name) =>
      name.includes(input.toLowerCase())
    );
    setSuggestions(matches);
  };

  const fillSuggestion = (name) => {
    setNewCreatureName(name.replace(/\b\w/g, (c) => c.toUpperCase()));
    const data = creatureData[name];
    if (data) setStartingCounters(data.counters);
    setSuggestions([]);
  };

  const clearLog = () => setResultLog([]);

  return (
    <div style={{ padding: "1rem", color: "#fff", background: "#1a1a1a", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>Vrestin +1/+1 Counter Tracker</h1>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", justifyContent: "space-between" }}>
        <div style={{ flex: "1 1 300px" }}>
          <h2>Select Active Cards</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            {supportCards.map((card) => (
              <div
                key={card.id}
                onClick={() => toggleCard(card.id)}
                style={{
                  cursor: "pointer",
                  padding: "0.5rem",
                  background: selectedCards.includes(card.id) ? "#4caf50" : "#333",
                  border: "1px solid #888",
                  borderRadius: "5px",
                  textAlign: "center"
                }}
              >
                {card.name}
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: "1 1 300px" }}>
          <h2>Creatures</h2>
          {creatures.map((c, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#333",
                padding: "0.5rem",
                marginBottom: "0.3rem",
                borderRadius: "4px"
              }}
            >
              <span style={{ color: "#fff" }}>{c.name}: +{c.counters}/+{c.counters}</span>
              <div>
                <button onClick={() => updateCounter(i, 1)}>+1</button>
                <button onClick={() => updateCounter(i, -1)} style={{ marginLeft: "0.5rem" }}>-1</button>
                <button onClick={() => removeCreature(i)} style={{ marginLeft: "0.5rem", color: "red" }}>🗑️</button>
              </div>
            </div>
          ))}
          <button onClick={clearAllCreatures} style={{ width: "100%", marginTop: "0.5rem", background: "#800", color: "#fff" }}>
            ❌ Clear All Creatures
          </button>
        </div>
      </div>

      <h2 style={{ marginTop: "2rem" }}>Vrestin Entry</h2>
      <input
        type="number"
        value={vrestinX}
        onChange={(e) => setVrestinX(e.target.value)}
        placeholder="X value"
        style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
      />
      <button onClick={calculateETB} style={{ width: "100%" }}>Summon Vrestin</button>

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
        placeholder="+1/+1 Counters"
        value={startingCounters}
        onChange={(e) => setStartingCounters(e.target.value)}
        style={{ width: "35%" }}
      />
      <button onClick={addCreature} style={{ width: "100%", marginTop: "0.5rem" }}>
        Add Creature
      </button>

      {suggestions.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, marginTop: "0.5rem", background: "#222", border: "1px solid #888", borderRadius: "6px", color: "#fff" }}>
          {suggestions.map((s, i) => (
            <li
              key={i}
              style={{ padding: "0.5rem", cursor: "pointer" }}
              onClick={() => fillSuggestion(s)}
            >
              {s}
            </li>
          ))}
        </ul>
      )}

      <h2 style={{ marginTop: "2rem" }}>Phases</h2>
      <button onClick={handleCombat} style={{ width: "100%", marginBottom: "0.5rem" }}>
        Attack with Insects
      </button>
      <button onClick={handleEndStep} style={{ width: "100%" }}>
        Go to End Step (Hornbeetle Trigger)
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
            style={{ width: "100%", height: "200px", fontFamily: "monospace", marginTop: "0.5rem" }}
          />
        </div>
      )}
    </div>
  );
}
