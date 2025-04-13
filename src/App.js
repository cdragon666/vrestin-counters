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

  const toggleCard = (id) => {
    setSelectedCards((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const has = (id) => selectedCards.includes(id);

  const summonVrestin = () => {
    if (creatures.find((c) => c.name === "Vrestin")) {
      alert("Vrestin has already been summoned.");
      return;
    }

    const basePower = parseInt(vrestinX);
    const counterBonus = getETBBonus();
    const counters = basePower + counterBonus;

    const vrestin = { name: "Vrestin", base: basePower, counters };
    const insects = Array(basePower).fill().map((_, i) => ({
      name: `Insect ${i + 1}`,
      base: 1,
      counters: counterBonus
    }));

    setCreatures([...creatures, vrestin, ...insects]);

    setResultLog((prev) => [
      `✨ Vrestin enters with ${counters} counters (${basePower} base + ${counterBonus} bonus)`,
      `🐞 ${insects.length} Insect tokens created (+${counterBonus})`,
      ...prev
    ]);
  };

  const getETBBonus = () => {
    let bonus = 0;
    if (has("unicorn")) bonus++;
    if (has("crawler")) bonus++;
    if (has("conclave_mentor")) bonus++;
    if (has("hardened_scales")) bonus++;
    return bonus;
  };

  return (
    <div style={{ padding: "1rem", maxWidth: "900px", margin: "auto" }}>
      <h1 style={{ textAlign: "center" }}>Vrestin +1/+1 Counter Tracker</h1>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ flex: 1, minWidth: "300px" }}>
          <h2>Active Cards</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            {supportCards.map((card) => (
              <div
                key={card.id}
                onClick={() => toggleCard(card.id)}
                style={{
                  cursor: "pointer",
                  padding: "0.5rem",
                  border: selectedCards.includes(card.id)
                    ? "2px solid green"
                    : "1px solid #ccc",
                  backgroundColor: selectedCards.includes(card.id)
                    ? "#c2f0c2"
                    : "#f9f9f9",
                  borderRadius: "6px",
                  textAlign: "center"
                }}
              >
                {card.name}
              </div>
            ))}
          </div>

          <h2 style={{ marginTop: "1rem" }}>Vrestin Entry</h2>
          <input
            type="number"
            value={vrestinX}
            onChange={(e) => setVrestinX(e.target.value)}
            placeholder="X value"
            style={{ width: "100%", padding: "0.5rem" }}
          />
          <button
            onClick={summonVrestin}
            style={{ width: "100%", marginTop: "0.5rem", padding: "0.75rem" }}
          >
            Summon Vrestin
          </button>
        </div>

        <div style={{ flex: 1, minWidth: "300px" }}>
          <h2>Creatures</h2>
          {creatures.map((c, i) => (
            <div
              key={i}
              style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}
            >
              <span>
                {c.name}: {c.base}/{c.base} (+{c.counters}) → {c.base + c.counters}/{c.base + c.counters}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <h2>Result Log</h2>
        <textarea
          readOnly
          value={resultLog.join("\n-------------------\n")}
          style={{ width: "100%", height: "150px" }}
        />
      </div>
    </div>
  );
}
