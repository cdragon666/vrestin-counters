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
  const [isMobile, setIsMobile] = useState(false);
  const [expanded, setExpanded] = useState({
    cards: false,
    creatures: false,
    log: false
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

    let log = `[ETB Phase]\n✨ Vrestin enters with ${vrestinCounters} counters\n🐞 ${base} Insect tokens created (+${insectCounters})`;

    const newCreatures = [
      { name: "Vrestin", counters: vrestinCounters, power: 0, toughness: 0 },
      ...Array(base).fill().map((_, i) => ({ name: `Insect ${i + 1}`, counters: insectCounters, power: 1, toughness: 1 }))
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

  const handleEndStep = () => {
    let log = `[End Step]\n`;
    if (has("hornbeetle") && counterTracker > 0) {
      const beetleBonus = getEntryCounterBonus();
      const newTokens = Array(counterTracker).fill().map((_, i) => ({
        name: `Beetle Token ${i + 1}`,
        counters: beetleBonus,
        power: 1,
        toughness: 1
      }));
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

  const Section = ({ title, id, children }) => (
    <div style={{ marginBottom: "1.5rem" }}>
      {isMobile ? (
        <>
          <button onClick={() => setExpanded((e) => ({ ...e, [id]: !e[id] }))} style={{ width: "100%", padding: "0.5rem", fontWeight: "bold" }}>
            {expanded[id] ? `▼ ${title}` : `▶ ${title}`}
          </button>
          {expanded[id] && <div style={{ marginTop: "0.5rem" }}>{children}</div>}
        </>
      ) : (
        <>
          <h2>{title}</h2>
          {children}
        </>
      )}
    </div>
  );

  return (
    <div style={{ padding: "2rem", maxWidth: "1000px", margin: "auto" }}>
      <h1 style={{ textAlign: "center" }}>Counter Tracker</h1>
      <div style={{ display: isMobile ? "block" : "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        <div>
          <Section title="Select Active Cards" id="cards">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
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
          </Section>

          <Section title="Vrestin Entry" id="vrestin">
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
          </Section>

          <Section title="Add Creature" id="add">
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
            <button onClick={clearAllCreatures} style={{ marginTop: "0.5rem", width: "100%", background: "#500", color: "#fff" }}>
              ❌ Clear All Creatures
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
          </Section>
        </div>

        <div>
          <Section title="Creatures" id="creatures">
            {creatures.map((c, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontWeight: "bold", color: "#fff", fontSize: "1rem" }}>
                  {c.name}: {c.power + c.counters}/{c.toughness + c.counters} (+{c.counters})
                </span>
                <div>
                  <button onClick={() => updateCounter(i, 1)}>+1</button>
                  <button onClick={() => updateCounter(i, -1)} style={{ marginLeft: "0.5rem" }}>-1</button>
                  <button onClick={() => removeCreature(i)} style={{ marginLeft: "0.5rem", color: "red" }}>🗑️</button>
                </div>
              </div>
            ))}
          </Section>

          <Section title="Result Log" id="log">
            {resultLog.length > 0 && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <h2>Result Log</h2>
                  <button onClick={clearLog}>Clear</button>
                </div>
                <textarea
                  readOnly
                  value={resultLog.join("\n-------------------\n")}
                  style={{ width: "100%", height: "200px", fontFamily: "monospace" }}
                />
              </>
            )}
            <button onClick={handleCombat} style={{ width: "100%", marginTop: "1rem" }}>
              Attack with Insects
            </button>
            <button onClick={handleEndStep} style={{ width: "100%", marginTop: "0.5rem" }}>
              Go to End Step (Hornbeetle Trigger)
            </button>
          </Section>
        </div>
      </div>
    </div>
  );
}
