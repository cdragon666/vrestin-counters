import { useState } from "react";
import "./App.css";

const supportCards = [
  { id: "hardened_scales", name: "Hardened Scales" },
  { id: "branching_evolution", name: "Branching Evolution" },
  { id: "kami", name: "Kami of Whispered Hopes" },
  { id: "innkeeper", name: "Innkeeper's Talent" },
  { id: "ozolith", name: "Ozolith, the Shattered Spire" },
  { id: "conclave_mentor", name: "Conclave Mentor" },
  { id: "unicorn", name: "Good-Fortune Unicorn" }
];

export default function App() {
  const [selectedCards, setSelectedCards] = useState([]);
  const [vrestinX, setVrestinX] = useState(0);
  const [creatures, setCreatures] = useState([]);
  const [log, setLog] = useState([]);

  const toggleCard = (id) => {
    setSelectedCards((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const has = (id) => selectedCards.includes(id);

  const calculateCounters = (base) => {
    let value = base;
    let steps = [];

    if (has("hardened_scales")) {
      value += 1;
      steps.push("+1 from Hardened Scales");
    }
    if (has("conclave_mentor")) {
      value += 1;
      steps.push("+1 from Conclave Mentor");
    }
    if (has("kami")) {
      value += 1;
      steps.push("+1 from Kami");
    }
    if (has("ozolith")) {
      value += 1;
      steps.push("+1 from Ozolith");
    }
    if (has("innkeeper")) {
      value *= 2;
      steps.push("×2 from Innkeeper's Talent");
    }
    if (has("branching_evolution")) {
      value *= 2;
      steps.push("×2 from Branching Evolution");
    }

    return [value, steps];
  };

  const summonVrestin = () => {
    const x = parseInt(vrestinX);
    if (!x) return;

    const [counters, breakdown] = calculateCounters(x);

    const unicornBoost = has("unicorn") ? 1 : 0;
    const unicornSteps = has("unicorn") ? ["+1 from Unicorn"] : [];
    let unicornCount = unicornBoost;

    if (has("hardened_scales") && unicornBoost) {
      unicornCount += 1;
      unicornSteps.push("+1 from Hardened Scales");
    }
    if (has("conclave_mentor") && unicornBoost) {
      unicornCount += 1;
      unicornSteps.push("+1 from Conclave Mentor");
    }
    if (has("innkeeper") && unicornBoost) {
      unicornCount *= 2;
      unicornSteps.push("×2 from Innkeeper");
    }
    if (has("branching_evolution") && unicornBoost) {
      unicornCount *= 2;
      unicornSteps.push("×2 from Branching Evolution");
    }

    const finalVrestin = counters + unicornCount;

    const newCreatures = [
      { name: "Vrestin", base: [0, 0], counters: finalVrestin },
      ...Array.from({ length: x }, (_, i) => ({
        name: `Insect ${i + 1}`,
        base: [1, 1],
        counters: unicornCount
      }))
    ];

    const vLine = `Vrestin enters with ${finalVrestin} +1/+1 counters (X = ${x})\n` +
                  breakdown.map(b => `  ${b}`).join("\n") +
                  (unicornSteps.length ? `\n+${unicornCount} from Unicorn:\n` + unicornSteps.map(s => `  ${s}`).join("\n") : "");

    const insectLog = newCreatures.slice(1).map((c, i) =>
      `${c.name} enters with ${c.counters} +1/+1 counters (1/1 base)`
    );

    setCreatures(newCreatures);
    setLog((prev) => [vLine, ...insectLog, "-------------------", ...prev]);
  };

  const clearLog = () => setLog([]);
  const clearCreatures = () => setCreatures([]);

  return (
    <div className="app-container">
      <h1 className="title">MTG Mechanics Master</h1>
      <div className="grid">
        <div className="left-panel">
          <div>
            <h2>Support Cards</h2>
            <div className="card-list">
              {supportCards.map((card) => (
                <button
                  key={card.id}
                  className={`card-button ${has(card.id) ? "active" : ""}`}
                  onClick={() => toggleCard(card.id)}
                >
                  {card.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2>Summon Vrestin</h2>
            <input
              type="number"
              value={vrestinX}
              onChange={(e) => setVrestinX(e.target.value)}
              placeholder="X Value"
            />
            <button className="btn green" onClick={summonVrestin}>Summon</button>
            <button className="btn red" onClick={clearCreatures}>Clear Creatures</button>
          </div>
        </div>

        <div className="right-panel">
          <h2>Creatures</h2>
          {creatures.map((c, i) => (
            <div className="creature-box" key={i}>
              {c.name}: {c.base[0]}/{c.base[1]} (+{c.counters}/+{c.counters})
            </div>
          ))}

          <h2>Result Log</h2>
          <textarea className="log-box" readOnly value={log.join("\n")} />
          <button className="btn red" onClick={clearLog}>Clear Log</button>
        </div>
      </div>
    </div>
  );
}
