import { useState, useEffect } from "react";

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
  const [collapsedSections, setCollapsedSections] = useState({
    activeCards: true,
    vrestin: true,
    addCreature: true
  });

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
    const [vrestinCounters, vrestinSteps] = getReplacementCounterStack(base);
    const insectCount = base;

    const logEntries = [
      `[Vrestin Entry]`,
      `Vrestin enters for X = ${base}`,
      `Triggers:`,
      ...vrestinSteps.map((s) => `- ${s}`),
      `Result: Vrestin enters with ${vrestinCounters} +1/+1 counters`
    ];

    const newCreatures = [];
    if (!creatures.find((c) => c.name === "Vrestin")) {
      newCreatures.push({ name: "Vrestin", base: [0, 0], counters: vrestinCounters });
    }

    for (let i = 0; i < insectCount; i++) {
      let counters = 0;
      let steps = [];
      if (has("unicorn")) {
        [counters, steps] = getReplacementCounterStack(1);
        logEntries.push(
          `\n[Unicorn Trigger on Insect ${i + 1}]`,
          `Base: 1`,
          ...steps.map((s) => `- ${s}`),
          `Result: +${counters} counter`
        );
      }
      newCreatures.push({ name: `Insect ${i + 1}`, base: [1, 1], counters });
    }

    setCreatures((prev) => [...prev, ...newCreatures]);
    setResultLog((prev) => [logEntries.join("\n"), ...prev]);
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
    setCreatures([...creatures, { name: newCreatureName, base, counters: baseCounters }]);
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
    <div style={{ padding: "1rem", backgroundColor: "#1a1a1a", color: "white", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>Vrestin +1/+1 Counter Tracker</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <div>
          <button onClick={() => toggleCollapse("activeCards")}>
            {isCollapsed("activeCards") ? "▶" : "▼"} Active Cards
          </button>
          {!isCollapsed("activeCards") && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginTop: "0.5rem" }}>
              {supportCards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => toggleCard(card.id)}
                  style={{
                    backgroundColor: selectedCards.includes(card.id) ? "#4caf50" : "#2e2e2e",
                    padding: "0.8rem",
                    borderRadius: "8px",
                    cursor: "pointer"
                  }}
                >
                  {card.name}
                </div>
              ))}
            </div>
          )}

          <button onClick={() => toggleCollapse("vrestin")}> {isCollapsed("vrestin") ? "▶" : "▼"} Vrestin Entry </button>
          {!isCollapsed("vrestin") && (
            <>
              <input
                type="number"
                value={vrestinX}
                onChange={(e) => setVrestinX(e.target.value)}
                placeholder="X Value"
                style={{ width: "100%", padding: "0.5rem", margin: "0.5rem 0" }}
              />
              <button onClick={calculateETB}>Summon Vrestin</button>
            </>
          )}

          <button onClick={() => toggleCollapse("addCreature")}> {isCollapsed("addCreature") ? "▶" : "▼"} Add Creature </button>
          {!isCollapsed("addCreature") && (
            <>
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
              <button onClick={addCreature}>Add</button>
              <button onClick={clearAllCreatures}>Clear All Creatures</button>
            </>
          )}
        </div>

        <div>
          <h2>Creatures</h2>
          {creatures.map((c, i) => (
            <div key={i} style={{ background: "#333", padding: "0.5rem", marginBottom: "0.5rem", borderRadius: "8px" }}>
              {c.name}: {c.base[0]}/{c.base[1]} (+{c.counters}/+{c.counters})
              <div>
                <button onClick={() => updateCounter(i, 1)}>+1</button>
                <button onClick={() => updateCounter(i, -1)}>-1</button>
                <button onClick={() => removeCreature(i)}>🗑️</button>
              </div>
            </div>
          ))}

          <h2>Result Log</h2>
          <textarea
            readOnly
            value={resultLog.join("\n-------------------\n")}
            style={{ width: "100%", height: "200px", backgroundColor: "#111", color: "white", padding: "0.5rem", borderRadius: "8px" }}
          />
          <button onClick={clearLog}>Clear Log</button>
        </div>
      </div>
    </div>
  );
}
