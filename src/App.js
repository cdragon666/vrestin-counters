import { useState } from "react";
import "./App.css";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";

const cardEffects = {
  hardened_scales: { bonus: 1 },
  conclave_mentor: { bonus: 1 },
  ozolith: { bonus: 1 },
  unicorn: { trigger: true, bonus: 1 },
  innkeeper: { multiplier: 2 },
  branching_evolution: { multiplier: 2 }
};

const supportCards = [
  { id: "hardened_scales", name: "Hardened Scales" },
  { id: "conclave_mentor", name: "Conclave Mentor" },
  { id: "ozolith", name: "Ozolith, the Shattered Spire" },
  { id: "unicorn", name: "Good-Fortune Unicorn" },
  { id: "innkeeper", name: "Innkeeper's Talent (Level 3)" },
  { id: "branching_evolution", name: "Branching Evolution" }
];

export default function App() {
  const [selectedCards, setSelectedCards] = useState([]);
  const [vrestinX, setVrestinX] = useState(0);
  const [resultLog, setResultLog] = useState([]);
  const [vrestinSummoned, setVrestinSummoned] = useState(false);

  const toggleCard = (id) => {
    setSelectedCards((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const getUnicornBonus = () => {
    if (!selectedCards.includes("unicorn")) return 0;
    let bonus = cardEffects.unicorn.bonus;

    ["hardened_scales", "conclave_mentor", "ozolith"].forEach((id) => {
      if (selectedCards.includes(id)) bonus += cardEffects[id].bonus;
    });

    if (selectedCards.includes("innkeeper")) bonus *= cardEffects.innkeeper.multiplier;
    return bonus;
  };

  const calculateVrestinCounters = () => {
    if (vrestinSummoned) return;

    const base = parseInt(vrestinX);
    let additive = 0;
    let log = [];

    ["hardened_scales", "conclave_mentor", "ozolith"].forEach((id) => {
      if (selectedCards.includes(id)) {
        additive += cardEffects[id].bonus;
        log.push(`+${cardEffects[id].bonus} from ${supportCards.find(c => c.id === id).name}`);
      }
    });

    let counters = base + additive;

    if (selectedCards.includes("innkeeper")) {
      counters *= cardEffects.innkeeper.multiplier;
      log.push(`×2 from Innkeeper's Talent`);
    }
    if (selectedCards.includes("branching_evolution")) {
      counters *= cardEffects.branching_evolution.multiplier;
      log.push(`×2 from Branching Evolution`);
    }

    let unicornBonus = getUnicornBonus();
    const total = counters + unicornBonus;

    const vrestinLog = [`Vrestin enters with ${total} +1/+1 counters (X = ${base})`, ...log];

    let insectLog = [];
    for (let i = 1; i <= base; i++) {
      const insectBonus = selectedCards.includes("unicorn") ? getUnicornBonus() : 0;
      insectLog.push(`Insect ${i} enters with ${insectBonus} +1/+1 counters (1/1 base)`);
    }

    setResultLog([...[...insectLog, ...vrestinLog, "-------------------"], ...resultLog]);
    setVrestinSummoned(true);
  };

  const handleAttack = () => {
    const bonus = getUnicornBonus();
    const all = ["Vrestin", ...Array(parseInt(vrestinX)).fill(0).map((_, i) => `Insect ${i + 1}`)];
    const log = all.map((c) => `${c} attacks and gains ${bonus} +1/+1 counters`);
    setResultLog([...[...log, "[Combat Phase]", "-------------------"], ...resultLog]);
  };

  const handleClearLog = () => {
    setResultLog([]);
    setVrestinSummoned(false);
  };

  const handleLogout = () => signOut(auth);

  return (
    <div className="app-container">
      <div className="header">
        <h1 className="app-title">MTG Mechanics Master</h1>
        <button onClick={handleLogout} className="btn red">Logout</button>
      </div>

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
          <button onClick={handleAttack} className="btn green">
            Attack with All
          </button>
          <button onClick={handleClearLog} className="btn red">
            Clear Log
          </button>
        </div>

        <div className="right-panel">
          <h2>Result Log</h2>
          <textarea
            readOnly
            value={resultLog.join("\n")}
            className="log-box"
          />
        </div>
      </div>
    </div>
  );
}
