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

export default function App() {
  const [selectedCards, setSelectedCards] = useState([]);
  const [vrestinX, setVrestinX] = useState(0);
  const [creatures, setCreatures] = useState([]);
  const [resultLog, setResultLog] = useState([]);
  const [counterTracker, setCounterTracker] = useState(0);

  const has = (id) => selectedCards.includes(id);

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

  const addToTracker = (amount) => {
    setCounterTracker((prev) => prev + amount);
  };

  const calculateETB = () => {
    const base = parseInt(vrestinX);
    const bonus = getBaseBonus();
    const multiplier = getMultiplier();
    const vrestinFinal = Math.ceil((base + bonus) * multiplier);
    let insectFlat = 0;

    if (has("unicorn")) insectFlat += 1;
    if (has("crawler")) insectFlat += 1;

    // ETB buffs always get at least +1 if Unicorn or Crawler is selected
    const insectBonus = Math.ceil((insectFlat + getBaseBonus()) * multiplier);
    const newInsects = Array(base).fill().map((_, i) => ({
      name: `Insect ${i + 1}`,
      counters: insectBonus
    }));

    const allCreatures = [
      { name: "Vrestin", counters: vrestinFinal },
      ...newInsects
    ];

    const totalCounters = vrestinFinal + (newInsects.length * insectBonus);
    addToTracker(totalCounters);

    let log = `Vrestin enters with ${vrestinFinal} counters.\n`;
    log += `${base} Insect tokens created. Each gets +${insectBonus} counters.`;

    setCreatures((prev) => [...prev, ...allCreatures]);
    setResultLog((prev) => [log, ...prev]);
  };

  const handleCombat = () => {
    const insectBuff = Math.ceil((1 + getBaseBonus()) * getMultiplier());
    const andurilBase = has("citys_blessing") ? 2 : 1;
    const andurilBuff = has("anduril") ? Math.ceil((andurilBase + getBaseBonus()) * getMultiplier()) : 0;

    let log = `Combat Phase:\n`;

    const updated = creatures.map((c) => {
      const name = c.name.toLowerCase();
      const isInsect = name.includes("insect") || name.includes("vrestin");
      const add = (isInsect ? insectBuff : 0) + andurilBuff;
      if (add > 0) addToTracker(add);
      return { ...c, counters: c.counters + add };
    });

    log += `All insects get +${insectBuff}, all creatures get +${andurilBuff} from Andúril.`;
    setCreatures(updated);
    setResultLog((prev) => [log, ...prev]);
  };

  const handleEndStep = () => {
    let log = "End Step:\n";
    if (has("hornbeetle") && counterTracker > 0) {
      const tokens = Array(counterTracker).fill().map((_, i) => ({
        name: `Beetle Token ${i + 1}`,
        counters: 0
      }));
      setCreatures((prev) => [...prev, ...tokens]);
      log += `Hornbeetle created ${counterTracker} Insect tokens from ${counterTracker} counters added this turn.`;
    } else {
      log += `No effects triggered.`;
    }
    setCounterTracker(0);
    setResultLog((prev) => [log, ...prev]);
  };

  const updateCounter = (index, delta) => {
    if (delta > 0) addToTracker(delta);
    setCreatures((prev) =>
      prev.map((c, i) => i === index ? { ...c, counters: Math.max(0, c.counters + delta) } : c)
    );
  };

  const removeCreature = (index) => {
    setCreatures((prev) => prev.filter((_, i) => i !== index));
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
            style={{
              cursor: "pointer",
              padding: "0.5rem",
              background: selectedCards.includes(card.id) ? "#bdf5bd" : "#f0f0f0",
              border: "2px solid",
              borderColor: selectedCards.includes(card.id) ? "green" : "#ccc",
              borderRadius: "0.5rem",
              textAlign: "center"
            }}
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
        style={{ width: "100%", marginTop: "0.5rem", padding: "0.5rem" }}
      />
      <button onClick={calculateETB} style={{ marginTop: "0.5rem", width: "100%" }}>
        Summon Vrestin
      </button>

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
