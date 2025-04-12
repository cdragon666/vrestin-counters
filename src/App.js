
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
  const [creatureCount, setCreatureCount] = useState(0);
  const [insectCount, setInsectCount] = useState(0);
  const [resultLog, setResultLog] = useState([]);

  const toggleCard = (id) => {
    setSelectedCards((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const has = (id) => selectedCards.includes(id);

  const calculateETB = () => {
    let base = parseInt(vrestinX);
    let tokens = base; // Vrestin creates X insect tokens
    let counterBonus = 0;
    let multiplier = 1;
    let tokenBonus = 0;

    supportCards.forEach((card) => {
      if (has(card.id)) {
        if (card.bonus) counterBonus += card.bonus;
        if (card.multiplier) multiplier *= card.multiplier;
        if (card.etbBonus) counterBonus += card.etbBonus;
      }
    });

    const vrestinFinal = Math.ceil((base + counterBonus) * multiplier);
    const finalInsectCount = tokens;
    const insectCounters = Math.ceil((has("unicorn") ? 1 : 0) + (has("conclave_mentor") ? 1 : 0) + (has("hardened_scales") ? 1 : 0));
    const finalInsectCounters = Math.ceil((1 + insectCounters) * multiplier);

    let log = `Vrestin ETB: ${base} base + ${counterBonus} bonus x${multiplier} => ${vrestinFinal} counters\n`;
    log += `Created ${tokens} insects. Each gets +${finalInsectCounters} (from ETB triggers)\n`;

    if (has("hornbeetle")) {
      const extraTokens = vrestinFinal;
      log += `Iridescent Hornbeetle creates ${extraTokens} insect tokens from Vrestin's counters\n`;
      tokens += extraTokens;
    }

    setCreatureCount(1 + tokens);
    setInsectCount(tokens);
    setResultLog((prev) => [log, ...prev]);
  };

  const handleCombat = () => {
    let log = `Combat Phase:\n`;
    let bonus = 0;
    let multiplier = 1;
    let flat = 0;

    if (has("branching_evolution")) multiplier *= 2;
    if (has("kami")) multiplier *= 2;
    if (has("innkeeper")) multiplier *= 2;
    if (has("conclave_mentor")) bonus += 1;
    if (has("hardened_scales")) bonus += 1;
    if (has("ozolith")) bonus += 1;

    const insectCounters = Math.ceil((1 + bonus) * multiplier);
    const andurilCounters = has("citys_blessing") ? 2 : 1;
    const allCounters = Math.ceil((andurilCounters + bonus) * multiplier);

    if (insectCount > 0) log += `Insects (${insectCount}) get +${insectCounters} counters each from Vrestin and bonuses\n`;
    if (has("anduril")) log += `All creatures (${creatureCount}) get +${allCounters} counters from Andúril\n`;

    setResultLog((prev) => [log, ...prev]);
  };

  const clearLog = () => setResultLog([]);

  return (
    <div style={{ padding: "2rem", maxWidth: "700px", margin: "auto" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", textAlign: "center" }}>
        Vrestin +1/+1 Counter Calculator
      </h1>

      <h2 style={{ marginTop: "1.5rem" }}>Select Active Cards</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        {supportCards.map((card) => (
          <div
            key={card.id}
            style={{
              cursor: "pointer",
              padding: "0.5rem",
              borderRadius: "0.5rem",
              textAlign: "center",
              border: "2px solid",
              borderColor: selectedCards.includes(card.id) ? "green" : "#ccc",
              background: selectedCards.includes(card.id) ? "#c2f0c2" : "#f9f9f9",
            }}
            onClick={() => toggleCard(card.id)}
          >
            {card.name}
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: "2rem" }}>Vrestin Entry</h2>
      <label htmlFor="vrestinX">X value when casting Vrestin:</label>
      <input
        id="vrestinX"
        type="number"
        value={vrestinX}
        onChange={(e) => setVrestinX(e.target.value)}
        style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
      />
      <button onClick={calculateETB} style={{ marginTop: "1rem", width: "100%", padding: "0.75rem", fontWeight: "bold" }}>
        Vrestin ETB (Calculate)
      </button>

      <h2 style={{ marginTop: "2rem" }}>Combat Phase</h2>
      <button onClick={handleCombat} style={{ width: "100%", padding: "0.75rem", fontWeight: "bold" }}>
        Attack with Insects
      </button>

      {resultLog.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "1.2rem" }}>Result Log</h2>
            <button onClick={clearLog} style={{ fontSize: "0.9rem", padding: "0.3rem 0.6rem" }}>
              Clear
            </button>
          </div>
          <textarea
            readOnly
            value={resultLog.join("\n----------------------\n")}
            style={{ width: "100%", height: "200px", marginTop: "1rem", fontFamily: "monospace", padding: "0.5rem" }}
          />
        </div>
      )}
    </div>
  );
}
