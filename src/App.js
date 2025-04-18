import { useState } from "react";
import "./App.css";

const cardEffects = {
  hardened_scales: { bonusPerCounter: 1 },
  conclave_mentor: { bonusPerCounter: 1 },
  branching_evolution: { multiplier: 2 },
  unicorn: { trigger: true, bonus: 1 }
};

const supportCards = [
  { id: "hardened_scales", name: "Hardened Scales" },
  { id: "conclave_mentor", name: "Conclave Mentor" },
  { id: "branching_evolution", name: "Branching Evolution" },
  { id: "unicorn", name: "Good-Fortune Unicorn (ETB trigger)" }
];

export default function App() {
  const [selectedCards, setSelectedCards] = useState([]);
  const [vrestinX, setVrestinX] = useState(0);
  const [resultLog, setResultLog] = useState([]);

  const toggleCard = (id) => {
    setSelectedCards((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const calculateVrestinCounters = () => {
    let base = parseInt(vrestinX);
    let bonus = 0;
    let multiplier = 1;
    let log = [];

    if (selectedCards.includes("hardened_scales")) {
      bonus += cardEffects.hardened_scales.bonusPerCounter;
      log.push("+1 from Hardened Scales");
    }
    if (selectedCards.includes("conclave_mentor")) {
      bonus += cardEffects.conclave_mentor.bonusPerCounter;
      log.push("+1 from Conclave Mentor");
    }
    if (selectedCards.includes("branching_evolution")) {
      multiplier *= cardEffects.branching_evolution.multiplier;
      log.push("×2 from Branching Evolution");
    }

    let vrestinCounters = (base + bonus) * multiplier;
    let unicornBonus = 0;

    if (selectedCards.includes("unicorn")) {
      let unicornTrigger = cardEffects.unicorn.bonus;
      let unicornTotal = unicornTrigger;
      if (selectedCards.includes("hardened_scales")) unicornTotal += 1;
      if (selectedCards.includes("conclave_mentor")) unicornTotal += 1;
      if (selectedCards.includes("branching_evolution")) unicornTotal *= 2;
      unicornBonus = unicornTotal;
      log.push(`+${unicornTotal} from Unicorn trigger`);
    }

    const total = vrestinCounters + unicornBonus;

    const entryLog = `Vrestin enters with ${total} +1/+1 counters (X = ${base}, ${log.join(", ")})`;
    setResultLog([entryLog, ...resultLog]);
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
