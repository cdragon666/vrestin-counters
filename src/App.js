
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

export default function App() {
  const [selectedCards, setSelectedCards] = useState([]);
  const [vrestinX, setVrestinX] = useState(0);
  const [creatures, setCreatures] = useState([]);
  const [newCreatureName, setNewCreatureName] = useState("");
  const [resultLog, setResultLog] = useState([]);

  const toggleCard = (id) => {
    setSelectedCards((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const has = (id) => selectedCards.includes(id);

  const calculateETB = () => {
    let base = parseInt(vrestinX);
    let tokens = base;
    let counterBonus = 0;
    let multiplier = 1;

    supportCards.forEach((card) => {
      if (has(card.id)) {
        if (card.bonus) counterBonus += card.bonus;
        if (card.multiplier) multiplier *= card.multiplier;
        if (card.etbBonus) counterBonus += card.etbBonus;
      }
    });

    const vrestinFinal = Math.ceil((base + counterBonus) * multiplier);
    const finalInsectCount = tokens;
    const insectCounterBonus = Math.ceil((1 + (has("conclave_mentor") ? 1 : 0) + (has("unicorn") ? 1 : 0) + (has("hardened_scales") ? 1 : 0)) * multiplier);

    let log = `Vrestin enters with ${vrestinFinal} counters.\n`;
    log += `${finalInsectCount} Insect tokens created. Each gets +${insectCounterBonus} counters.\n`;

    const newCreatures = [
      { name: "Vrestin", counters: vrestinFinal },
      ...Array(finalInsectCount).fill().map((_, i) => ({ name: `Insect ${i + 1}`, counters: insectCounterBonus }))
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
    let bonus = 0;
    let multiplier = 1;
    let baseInsect = 1;

    if (has("branching_evolution")) multiplier *= 2;
    if (has("kami")) multiplier *= 2;
    if (has("innkeeper")) multiplier *= 2;
    if (has("conclave_mentor")) bonus += 1;
    if (has("hardened_scales")) bonus += 1;
    if (has("ozolith")) bonus += 1;

    const insectCounters = Math.ceil((baseInsect + bonus) * multiplier);
    const andurilCount = has("citys_blessing") ? 2 : 1;
    const allCounters = Math.ceil((andurilCount + bonus) * multiplier);

    const updatedCreatures = creatures.map((c) => {
      const name = c.name.toLowerCase();
      const isInsect = name.includes("insect") || name.includes("vrestin");
      let added = 0;
      if (isInsect) added += insectCounters;
      if (has("anduril")) added += allCounters;
      if (!isInsect && has("anduril")) added = allCounters;
      return { ...c, counters: c.counters + added };
    });

    log += `All insects get +${insectCounters}, all creatures get +${has("anduril") ? allCounters : 0} from Andúril.\n`;
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
    if (newCreatureName.trim() !== "") {
      setCreatures([...creatures, { name: newCreatureName, counters: 0 }]);
      setNewCreatureName("");
    }
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
        onChange={(e) => setNewCreatureName(e.target.value)}
      />
      <button onClick={addCreature} style={{ marginTop: "0.5rem", width: "100%" }}>
        Add Creature
      </button>

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
