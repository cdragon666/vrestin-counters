import { useState } from "react";
import "./App.css";

const supportCards = [
  { id: "hardened_scales", name: "Hardened Scales" },
  { id: "branching_evolution", name: "Branching Evolution" },
  { id: "kami", name: "Kami of Whispered Hopes" },
  { id: "innkeeper", name: "Innkeeper's Talent" },
  { id: "ozolith", name: "Ozolith, the Shattered Spire" },
  { id: "conclave_mentor", name: "Conclave Mentor" },
  { id: "anduril", name: "Andúril Equipped" },
  { id: "citys_blessing", name: "City's Blessing (10+ permanents)" },
  { id: "unicorn", name: "Good-Fortune Unicorn (ETB trigger)" }
];

const creatureData = {
  "scute mob": { base: [0, 0], counters: 1 },
  "hornet queen": { base: [2, 2], counters: 0 },
  "sigarda, font of blessings": { base: [4, 4], counters: 0 },
  "king darien xlviii": { base: [2, 3], counters: 1 },
  "springheart nantuko": { base: [2, 2], counters: 0 }
};

export default function App() {
  const [selectedCards, setSelectedCards] = useState([]);
  const [vrestinX, setVrestinX] = useState(0);
  const [creatures, setCreatures] = useState([]);
  const [newCreatureName, setNewCreatureName] = useState("");
  const [startingCounters, setStartingCounters] = useState(0);
  const [resultLog, setResultLog] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [collapsedSections, setCollapsedSections] = useState({});

  const toggleCard = (id) => {
    setSelectedCards((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const has = (id) => selectedCards.includes(id);

  const calculateVrestinEntry = () => {
    const base = parseInt(vrestinX);
    let value = base;
    let steps = [];
    let multiplierSteps = [];
    let totalMultiplier = 1;

    const add = (label, amount) => {
      value += amount;
      steps.push(`${label} adds +${amount} → ${value}`);
    };
    const multiply = (label, factor) => {
      totalMultiplier *= factor;
      multiplierSteps.push(`${label} doubles → ×${totalMultiplier}`);
    };

    if (has("hardened_scales")) add("Hardened Scales", 1);
    if (has("conclave_mentor")) add("Conclave Mentor", 1);
    if (has("kami")) add("Kami of Whispered Hopes", 1);
    if (has("ozolith")) add("Ozolith", 1);
    if (has("innkeeper")) add("Innkeeper's Talent", 1);

    if (has("branching_evolution")) multiply("Branching Evolution", 2);
    if (has("innkeeper")) multiply("Innkeeper's Talent", 2);

    const finalCounters = value * totalMultiplier;

    const log = [
      `[Vrestin Entry] X = ${base}`,
      `> Replacement Effects:`,
      ...steps,
      ...multiplierSteps,
      `✅ Vrestin enters with ${finalCounters} +1/+1 counters`
    ];

    const newCreatures = [
      ...(creatures.find((c) => c.name === "Vrestin")
        ? []
        : [{ name: "Vrestin", base: [0, 0], counters: finalCounters }]),
      ...Array(base).fill().map((_, i) => {
        let insectCounters = 0;
        if (has("unicorn")) {
          insectCounters = 1;
          if (has("hardened_scales")) insectCounters++;
          if (has("conclave_mentor")) insectCounters++;
        }
        return {
          name: `Insect ${i + 1}`,
          base: [1, 1],
          counters: insectCounters
        };
      })
    ];

    if (has("unicorn")) {
      log.push("> Triggered Abilities:");
      Array(base).fill().forEach((_, i) => {
        const unicornBonus = 1 + (has("hardened_scales") ? 1 : 0) + (has("conclave_mentor") ? 1 : 0);
        log.push(`- Unicorn triggers → Insect ${i + 1} gets +${unicornBonus}`);
      });
    }

    setCreatures((prev) => [...prev, ...newCreatures]);
    setResultLog((prev) => [log.join("\n"), ...prev]);
  };

  const handleCombat = () => {
    const baseBonus = 1;
    let bonus = baseBonus;
    let details = [];

    if (has("hardened_scales")) bonus++, details.push("+1 (Hardened Scales)");
    if (has("conclave_mentor")) bonus++, details.push("+1 (Conclave Mentor)");
    if (has("kami")) bonus++, details.push("+1 (Kami)");
    if (has("ozolith")) bonus++, details.push("+1 (Ozolith)");
    if (has("innkeeper")) bonus++, details.push("+1 (Innkeeper)");
    if (has("branching_evolution")) bonus *= 2, details.push("×2 (Branching Evolution)");
    if (has("innkeeper")) bonus *= 2, details.push("×2 (Innkeeper)");

    const updated = creatures.map((c) => {
      const isInsect = c.name.toLowerCase().includes("insect") || c.name === "Vrestin";
      return {
        ...c,
        counters: isInsect ? c.counters + bonus : c.counters
      };
    });

    const log = [`[Combat Phase] Insects get +${bonus} (${details.join(" → ")})`];
    setCreatures(updated);
    setResultLog((prev) => [log.join("\n"), ...prev]);
  };

  const updateCounter = (index, delta) => {
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
  const clearLog = () => setResultLog([]);

  const addCreature = () => {
    const name = newCreatureName.trim();
    if (!name) return;
    const data = creatureData[name.toLowerCase()];
    const base = data ? data.base : [0, 0];
    const baseCounters = data ? data.counters : parseInt(startingCounters) || 0;
    setCreatures([...creatures, { name, base, counters: baseCounters }]);
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

  const toggleCollapse = (section) => {
    setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const isCollapsed = (section) => collapsedSections[section];

  return (
    <div className="app-container">
      <h1 className="app-title">Vrestin +1/+1 Counter Tracker</h1>
      <div className="grid">
        <div className="left-panel">
          <button onClick={() => toggleCollapse("activeCards")} className="section-toggle">
            {isCollapsed("activeCards") ? "▶" : "▼"} Active Cards
          </button>
          {!isCollapsed("activeCards") && (
            <div className="card-list">
              {supportCards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => toggleCard(card.id)}
                  className={`card-button ${has(card.id) ? "active" : ""}`}
                >
                  {card.name}
                </div>
              ))}
            </div>
          )}

          <button onClick={() => toggleCollapse("vrestin")} className="section-toggle">
            {isCollapsed("vrestin") ? "▶" : "▼"} Vrestin Entry
          </button>
          {!isCollapsed("vrestin") && (
            <div className="form-group">
              <input
                type="number"
                value={vrestinX}
                onChange={(e) => setVrestinX(e.target.value)}
                placeholder="X Value"
              />
              <button onClick={calculateVrestinEntry} className="btn green">Summon Vrestin</button>
            </div>
          )}

          <button onClick={() => toggleCollapse("addCreature")} className="section-toggle">
            {isCollapsed("addCreature") ? "▶" : "▼"} Add Creature
          </button>
          {!isCollapsed("addCreature") && (
            <div className="form-group">
              <input
                type="text"
                placeholder="Creature Name"
                value={newCreatureName}
                onChange={handleNameChange}
              />
              <input
                type="number"
                value={startingCounters}
                onChange={(e) => setStartingCounters(e.target.value)}
                placeholder="+1/+1 Counters"
              />
              <button onClick={addCreature} className="btn green">Add</button>
              <button onClick={clearAllCreatures} className="btn red">Clear All Creatures</button>
            </div>
          )}

          <button onClick={handleCombat} className="btn green">Attack with Insects</button>
        </div>

        <div className="right-panel">
          <h2>Creatures</h2>
          {creatures.map((c, i) => (
            <div key={i} className="creature-box">
              {c.name}: {c.base[0]}/{c.base[1]} (+{c.counters}/+{c.counters})
              <div className="creature-controls">
                <button onClick={() => updateCounter(i, 1)}>+1</button>
                <button onClick={() => updateCounter(i, -1)}>-1</button>
                <button onClick={() => removeCreature(i)} className="btn red">🗑️</button>
              </div>
            </div>
          ))}

          <h2>Result Log</h2>
          <textarea
            readOnly
            value={resultLog.join("\n-------------------\n")}
            className="log-box"
          />
          <button onClick={clearLog} className="btn red">Clear Log</button>
        </div>
      </div>
    </div>
  );
}
