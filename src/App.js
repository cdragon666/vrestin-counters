import { useState } from "react";

const supportCards = [
  { id: "hardened_scales", name: "Hardened Scales", bonus: 1 },
  { id: "branching_evolution", name: "Branching Evolution", multiplier: 2 },
  { id: "kami", name: "Kami of Whispered Hopes", multiplier: 2 },
  { id: "innkeeper", name: "Innkeeper's Talent", multiplier: 2 },
  { id: "ozolith", name: "Ozolith, the Shattered Spire", bonus: 1 },
  { id: "conclave_mentor", name: "Conclave Mentor", bonus: 1 },
  { id: "anduril", name: "Andúril Equipped", anduril: true },
  { id: "citys_blessing", name: "City's Blessing (10+ permanents)", city: true },
  { id: "unicorn", name: "Good-Fortune Unicorn (ETB trigger)", etbBonus: 1 },
  { id: "crawler", name: "Duskshell Crawler (ETB trigger)", etbBonus: 1 },
  { id: "hornbeetle", name: "Iridescent Hornbeetle (token maker)", makesTokens: true }
];

const creatureData = {
  "scute mob": { counters: 1 },
  "hornet queen": { counters: 2 },
  "sigarda, font of blessings": { counters: 4 },
  "king darien xlviii": { counters: 3 },
  "springheart nantuko": { counters: 2 }
};

export default function App() {
  const [mode, setMode] = useState("choose");

  if (mode === "choose") {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1>Welcome to the +1/+1 Counter Calculator</h1>
        <p>Choose your mode:</p>
        <button onClick={() => setMode("vrestin")} style={{ margin: "1rem", padding: "1rem 2rem" }}>Use Vrestin Deck</button>
        <button onClick={() => setMode("custom")} style={{ margin: "1rem", padding: "1rem 2rem" }}>Build Your Own Deck</button>
      </div>
    );
  }

  if (mode === "vrestin") {
    return <VrestinMode />;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Custom Deck Mode (Coming Soon)</h1>
      <p>Here, users will be able to add their own cards, creatures, and save decks.</p>
      <button onClick={() => setMode("choose")} style={{ marginTop: "2rem" }}>⬅ Back</button>
    </div>
  );
}

function VrestinMode() {
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

  function getFinalCounterAmount(base, isTrigger = false) {
    let bonus = 0;
    let multiplier = 1;

    if (has("hardened_scales")) bonus += 1;
    if (has("conclave_mentor")) bonus += 1;
    if (has("ozolith")) bonus += 1;

    if (has("branching_evolution")) multiplier *= 2;
    if (has("kami")) multiplier *= 2;

    if (isTrigger && has("innkeeper")) multiplier *= 2;

    return Math.ceil((base + bonus) * multiplier);
  }

  const calculateETB = () => {
    const base = parseInt(vrestinX);
    const vrestinFinal = getFinalCounterAmount(base);
    const insectCounterBonus = getFinalCounterAmount(1, true);

    let log = `Vrestin enters with ${vrestinFinal} counters.\n`;
    log += `${base} Insect tokens created. Each gets +${insectCounterBonus} counters.\n`;

    const newCreatures = [
      { name: "Vrestin", counters: vrestinFinal },
      ...Array(base).fill().map((_, i) => ({ name: `Insect ${i + 1}`, counters: insectCounterBonus }))
    ];

    if (has("hornbeetle")) {
      newCreatures.push(
        ...Array(vrestinFinal).fill().map((_, i) => ({ name: `Beetle Token ${i + 1}`, counters: 0 }))
      );
      log += `Iridescent Hornbeetle created ${vrestinFinal} Beetle tokens.`;
    }

    setCreatures((prev) => [...prev, ...newCreatures]);
    setResultLog((prev) => [log, ...prev]);
  };

  const handleCombat = () => {
    let log = `Combat Phase:\n`;
    const insectBonus = getFinalCounterAmount(1);
    const andurilBonus = has("citys_blessing") ? 2 : 1;
    const allBonus = getFinalCounterAmount(andurilBonus);

    const updatedCreatures = creatures.map((c) => {
      const name = c.name.toLowerCase();
      const isInsect = name.includes("insect") || name.includes("vrestin");
      let added = 0;
      if (isInsect) added += insectBonus;
      if (has("anduril")) added += allBonus;
      return { ...c, counters: c.counters + added };
    });

    log += `All insects get +${insectBonus}, all creatures get +${has("anduril") ? allBonus : 0} from Andúril.\n`;
    setCreatures(updatedCreatures);
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

  const addCreature = () => {
    const name = newCreatureName.trim();
    if (!name) return;
    const data = creatureData[name.toLowerCase()];
    const counters = data ? data.counters : parseInt(startingCounters) || 0;
    setCreatures([...creatures, { name: newCreatureName, counters }]);
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
    <div style={{ padding: "2rem", maxWidth: "700px", margin: "auto" }}>
      <h1 style={{ textAlign: "center" }}>Vrestin +1/+1 Counter Tracker</h1>

      <h2>Select Active Cards</h2>
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
      <label htmlFor="vrestinX">X value:</label>
      <input
        type="number"
        id="vrestinX"
        value={vrestinX}
        onChange={(e) => setVrestinX(e.target.value)}
      />
      <button onClick={calculateETB} style={{ marginTop: "0.5rem", width: "100%" }}>
        Summon Vrestin
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
        placeholder="+1/+1 Counters"
        value={startingCounters}
        onChange={(e) => setStartingCounters(e.target.value)}
        style={{ width: "35%" }}
      />
      <button onClick={addCreature} style={{ marginTop: "0.5rem", width: "100%" }}>
        Add Creature
      </button>

      {suggestions.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, marginTop: "0.5rem", background: "#eee", borderRadius: "0.5rem" }}>
          {suggestions.map((s, i) => (
            <li
              key={i}
              style={{ padding: "0.3rem", cursor: "pointer" }}
              onClick={() => fillSuggestion(s)}
            >
              {s.replace(/\b\w/g, (c) => c.toUpperCase())}
            </li>
          ))}
        </ul>
      )}

      <h2 style={{ marginTop: "2rem" }}>Combat Phase</h2>
      <button onClick={handleCombat} style={{ width: "100%" }}>
        Attack with Insects
      </button>

      <h2 style={{ marginTop: "2rem" }}>Creatures</h2>
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
