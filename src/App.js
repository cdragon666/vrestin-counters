import { useState } from "react";
import "./App.css";

const cardEffects = {
  hardened_scales: { bonusPerCounter: 1 },
  conclave_mentor: { bonusPerCounter: 1 },
  branching_evolution: { multiplier: 2 },
  unicorn: { trigger: true, bonus: 1 },
  ozolith: { bonusPerCounter: 1 },
  kami: { bonusPerCounter: 1 },
  innkeeper: { bonusPerCounter: 1, multiplier: 2 }
};

const supportCards = [
  { id: "hardened_scales", name: "Hardened Scales" },
  { id: "conclave_mentor", name: "Conclave Mentor" },
  { id: "branching_evolution", name: "Branching Evolution" },
  { id: "unicorn", name: "Good-Fortune Unicorn (ETB trigger)" },
  { id: "ozolith", name: "Ozolith, the Shattered Spire" },
  { id: "kami", name: "Kami of Whispered Hopes" },
  { id: "innkeeper", name: "Innkeeper's Talent" }
];

export default function App() {
  const [selectedCards, setSelectedCards] = useState([]);
  const [vrestinX, setVrestinX] = useState(0);
  const [resultLog, setResultLog] = useState([]);
  const [insects, setInsects] = useState([]);

  const toggleCard = (id) => {
    setSelectedCards((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const calculateBonuses = (base = 1) => {
    let bonus = 0;
    let multiplier = 1;
    let steps = [];

    Object.entries(cardEffects).forEach(([id, effect]) => {
      if (!selectedCards.includes(id)) return;
      if (effect.bonusPerCounter) {
        bonus += effect.bonusPerCounter;
        steps.push(`+${effect.bonusPerCounter} from ${id.replace(/_/g, ' ')}`);
      }
      if (effect.multiplier) {
        multiplier *= effect.multiplier;
        steps.push(`×${effect.multiplier} from ${id.replace(/_/g, ' ')}`);
      }
    });

    return [(base + bonus) * multiplier, steps];
  };

  const calculateVrestinCounters = () => {
    let base = parseInt(vrestinX);
    const [replacedTotal, steps] = calculateBonuses(base);
    let unicornBonus = 0;
    let unicornSteps = [];

    if (selectedCards.includes("unicorn")) {
      let bonus = cardEffects.unicorn.bonus;
      if (selectedCards.includes("hardened_scales")) bonus += 1;
      if (selectedCards.includes("conclave_mentor")) bonus += 1;
      if (selectedCards.includes("kami")) bonus += 1;
      if (selectedCards.includes("ozolith")) bonus += 1;
      if (selectedCards.includes("innkeeper")) bonus += 1;
      if (selectedCards.includes("branching_evolution") || selectedCards.includes("innkeeper")) bonus *= 2;
      unicornBonus = bonus;
      unicornSteps.push(`+${bonus} from Unicorn trigger`);
    }

    const total = replacedTotal + unicornBonus;
    const entryLog = `Vrestin enters with ${total} +1/+1 counters (X = ${base}, ${[...steps, ...unicornSteps].join(", ")})`;

    const newInsects = Array(base).fill().map((_, i) => ({ id: i + 1, counters: 0 }));
    setInsects(newInsects);

    const insectLog = newInsects.map((ins, i) => {
      let [counters, extraSteps] = calculateBonuses(1);
      return `Insect ${i + 1} enters with ${counters} counters (${extraSteps.join(", ")})`;
    });

    setResultLog([entryLog, ...insectLog, ...resultLog]);
  };

  const attackWithInsects = () => {
    const updated = insects.map((i) => {
      const [gain] = calculateBonuses(1);
      return { ...i, counters: i.counters + gain };
    });

    const attackLog = updated.map((i) => `Insect ${i.id} attacks and gets +${i.counters} total counters`);
    setInsects(updated);
    setResultLog(["[Combat Phase]", ...attackLog, ...resultLog]);
  };

  return (
    <div className="app-container">
      <h1 className="app-title">Vrestin +1/+1 Counter Tracker</h1>
      <div className="grid">
        <div className="left-panel">
          <div className="card-list">
            {supportCards.map((card) => (
              <div
                key={card.id}
                onClick={() => toggleCard(card.id)}
                className={`card-button ${selectedCards.includes(card.id) ? "active" : ""}`}
              >
                {card.name}
              </div>
            ))}
          </div>
          <input
            type="number"
            value={vrestinX}
            onChange={(e) => setVrestinX(e.target.value)}
            placeholder="X Value"
          />
          <button onClick={calculateVrestinCounters} className="btn green">
            Summon Vrestin
          </button>
          <button onClick={attackWithInsects} className="btn green">
            Attack with Insects
          </button>
        </div>

        <div className="right-panel">
          <h2>Result Log</h2>
          <textarea
            readOnly
            value={resultLog.join("\n-------------------\n")}
            className="log-box"
          />
        </div>
      </div>
    </div>
  );
}
