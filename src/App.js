import { useState } from "react";

const supportCards = [
  { id: "hardened_scales", name: "Hardened Scales", bonus: 1 },
  { id: "branching_evolution", name: "Branching Evolution", multiplier: 2 },
  { id: "kami", name: "Kami of the Whispered Hopes", multiplier: 2 },
  { id: "conclave_mentor", name: "Conclave Mentor", bonus: 1 },
  { id: "ozolith", name: "Ozolith, the Shattered Spire", bonus: 1 },
  { id: "anduril", name: "Andúril, Narsil Reforged", flat: 2 },
];

export default function App() {
  const [selectedCards, setSelectedCards] = useState([]);
  const [baseCounters, setBaseCounters] = useState(0);
  const [result, setResult] = useState(null);
  const [log, setLog] = useState([]);

  const toggleCard = (id) => {
    setSelectedCards((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const calculateTotal = () => {
    let total = Number(baseCounters);
    let bonus = 0;
    let multiplier = 1;
    let flat = 0;
    let breakdown = [];

    supportCards.forEach((card) => {
      if (selectedCards.includes(card.id)) {
        if (card.flat) {
          flat += card.flat;
          breakdown.push(`+${card.flat} (from ${card.name})`);
        }
        if (card.bonus) {
          bonus += card.bonus;
          breakdown.push(`+${card.bonus} (bonus from ${card.name})`);
        }
        if (card.multiplier) {
          multiplier *= card.multiplier;
          breakdown.push(`x${card.multiplier} (multiplier from ${card.name})`);
        }
      }
    });

    const final = Math.ceil((total + bonus + flat) * multiplier);
    setResult(final);

    const logEntry = `Base: ${total} | ${breakdown.join(" | ")} => Total: ${final}`;
    setLog((prev) => [logEntry, ...prev]);
  };

  const clearLog = () => setLog([]);

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "auto" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", textAlign: "center" }}>
        +1/+1 Counter Calculator
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
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

      <div style={{ marginTop: "1rem" }}>
        <label htmlFor="base" style={{ display: "block", marginBottom: "0.5rem" }}>
          Base Counters
        </label>
        <input
          id="base"
          type="number"
          value={baseCounters}
          onChange={(e) => setBaseCounters(e.target.value)}
          style={{ width: "100%", padding: "0.5rem" }}
        />
      </div>

      <button onClick={calculateTotal} style={{ marginTop: "1rem", width: "100%", padding: "0.75rem", fontWeight: "bold" }}>
        Calculate
      </button>

      {result !== null && (
        <div style={{ marginTop: "1rem", fontSize: "1.25rem", textAlign: "center", fontWeight: "bold" }}>
          Total Counters: {result}
        </div>
      )}

      {log.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "1.2rem" }}>Calculation History</h2>
            <button onClick={clearLog} style={{ fontSize: "0.9rem", padding: "0.3rem 0.6rem" }}>
              Clear
            </button>
          </div>
          <textarea
            readOnly
            value={log.join("\n")}
            style={{ width: "100%", height: "150px", marginTop: "1rem", fontFamily: "monospace", padding: "0.5rem" }}
          />
        </div>
      )}
    </div>
  );
}
