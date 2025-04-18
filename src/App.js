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

  const getReplacementCounterStack = (base) => {
    let steps = [];
    let value = base;
    const step = (label, amount) => {
      value += amount;
      steps.push(`${label} adds +${amount} → ${value}`);
    };
    const double = (label) => {
      value *= 2;
      steps.push(`${label} doubles → ${value}`);
    };

    if (has("hardened_scales")) step("Hardened Scales", 1);
    if (has("conclave_mentor")) step("Conclave Mentor", 1);
    if (has("kami")) step("Kami of Whispered Hopes", 1);
    if (has("ozolith")) step("Ozolith", 1);
    if (has("innkeeper")) step("Innkeeper's Talent", 1);
    if (has("branching_evolution")) double("Branching Evolution");
    if (has("innkeeper")) double("Innkeeper's Talent");
    return [value, steps];
  };

  const calculateETB = () => {
    const base = parseInt(vrestinX);
    const [counterValue, steps] = getReplacementCounterStack(base);
    const log = [
      `[Vrestin Entry]`,
      `Vrestin enters for X = ${base}`,
      `Triggers:`,
      ...steps.map((s) => `- ${s}`),
      `Result: Vrestin enters with ${counterValue} +1/+1 counters`
    ];

    const newCreatures = [
      ...(creatures.find((c) => c.name === "Vrestin")
        ? []
        : [{ name: "Vrestin", base: [0, 0], counters: counterValue }]),
      ...Array(base).fill().map((_, i) => {
        const unicornBonus = has("unicorn") ? 1 : 0;
        if (unicornBonus) log.push(`- Good-Fortune Unicorn triggers → Insect ${i + 1} gets +1/+1`);
        return {
          name: `Insect ${i + 1}`,
          base: [1, 1],
          counters: unicornBonus
        };
      })
    ];

    setCreatures((prev) => [...prev, ...newCreatures]);
    setResultLog((prev) => [log.join("\n"), ...prev]);
  };

  const handleCombat = () => {
    const baseBonus = 1;
    const [bonus] = getReplacementCounterStack(baseBonus);
    const log = [`[Combat Phase] All insects get +${bonus}`];
    const updated = creatures.map((c) => {
      const isInsect = c.name.toLowerCase().includes("insect") || c.name === "Vrestin";
      return {
        ...c,
        counters: isInsect ? c.counters + bonus : c.counters
      };
    });
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

  const clearAllCreatures = () => {
    setCreatures([]);
  };

  const clearLog = () => setResultLog([]);

  const addCreature = () => {
    const name = newCreatureName.trim();
    if (!name) return;
    const data = creatureData[name.toLowerCase()];
    const base = data ? data.base : [0, 0];
    const baseCounters = data ? data.counters : parseInt(startingCounters) || 0;
    const final = baseCounters + (has("unicorn") ? 1 : 0); // Unicorn ETB trigger
    const logLine = has("unicorn")
      ? `[Unicorn Trigger] ${name} enters → gets +1/+1`
      : null;

    setCreatures([...creatures, { name, base, counters: final }]);
    if (logLine) setResultLog((prev) => [logLine, ...prev]);

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
    const displayName = name.replace(/\b\w/g, (c) => c.toUpperCase());
    setNewCreatureName(displayName);
    const data = creatureData[name];
    if (data) setStartingCounters(data.counters);
    setSuggestions([]);
  };

  const toggleCollapse = (section) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section]
    }));
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
              <button onClick={calculateETB} className="btn green">Summon Vrestin</button>
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
