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

  function trackCounters(added) {
    setCounterTracker((prev) => prev + added);
    return added;
  }

  const calculateETB = () => {
    const base = parseInt(vrestinX);
    const bonus = getBaseCounterBonus();
    const multiplier = getMultiplier();

    const vrestinFinal = trackCounters(Math.ceil((base + bonus) * multiplier));

    let insectCounterBonus = 0;
    if (has("unicorn")) insectCounterBonus += 1;
    if (has("conclave_mentor")) insectCounterBonus += 1;
    if (has("crawler")) insectCounterBonus += 1;
    if (has("hardened_scales")) insectCounterBonus += 1;

    const insectFinal = trackCounters(Math.ceil(insectCounterBonus * multiplier)) * base;

    let log = `Vrestin enters with ${vrestinFinal} counters.\n`;
    log += `${base} Insect tokens created. Each gets +${insectFinal / base || 0} counters.\n`;

    const newCreatures = [
      { name: "Vrestin", counters: vrestinFinal },
      ...Array(base).fill().map((_, i) => ({ name: `Insect ${i + 1}`, counters: insectFinal / base || 0 }))
    ];

    setCreatures((prev) => [...prev, ...newCreatures]);
    setResultLog((prev) => [log, ...prev]);
  };

  const handleCombat = () => {
    let log = `Combat Phase:\n`;
    const insectBonus = Math.ceil((1 + getBaseCounterBonus()) * getMultiplier());
    const andurilBase = has("citys_blessing") ? 2 : 1;
    const andurilBonus = Math.ceil((andurilBase + getBaseCounterBonus()) * getMultiplier());

    const updatedCreatures = creatures.map((c) => {
      const name = c.name.toLowerCase();
      const isInsect = name.includes("insect") || name.includes("vrestin");
      let added = 0;
      if (isInsect) added += insectBonus;
      if (has("anduril")) added += andurilBonus;
      trackCounters(added);
      return { ...c, counters: c.counters + added };
    });

    log += `All insects get +${insectBonus}, all creatures get +${has("anduril") ? andurilBonus : 0} from Andúril.\n`;
    setCreatures(updatedCreatures);
    setResultLog((prev) => [log, ...prev]);
  };

  const handleEndStep = () => {
    let log = `End Step:\n`;
    if (has("hornbeetle") && counterTracker > 0) {
      const newTokens = Array(counterTracker).fill().map((_, i) => ({ name: `Beetle Token ${i + 1}`, counters: 0 }));
      setCreatures((prev) => [...prev, ...newTokens]);
      log += `Hornbeetle created ${counterTracker} Insect tokens from ${counterTracker} counters added this turn.`;
    } else {
      log += `No effects triggered.`;
    }
    setCounterTracker(0);
    setResultLog((prev) => [log, ...prev]);
  };

  const updateCounter = (index, delta) => {
    setCreatures((prev) =>
      prev.map((c, i) => {
        if (i === index) {
          const added = Math.max(0, c.counters + delta) - c.counters;
          if (added > 0) trackCounters(added);
          return { ...c, counters: Math.max(0, c.counters + delta) };
        }
        return c;
      })
    );
  };

  const removeCreature = (index) => {
    setCreatures((prev) => prev.filter((_, i) => i !== index));
  };

  const addCreature = () => {
    const name = newCreatureName.trim();
    if (!name) return;
    const data = creatureData[name.toLowerCase()];
    const baseCounters = data ? data.counters : parseInt(startingCounters) || 0;
    const final = Math.ceil((baseCounters + getBaseCounterBonus()) * getMultiplier());
    setCreatures([...creatures, { name: newCreatureName, counters: final }]);
    trackCounters(final);
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

      <h2 style={{ marginTop: "2rem" }}>End Step</h2>
      <button onClick={handleEndStep} style={{ width: "100%" }}>
        Go to End Step (Hornbeetle Trigger)
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