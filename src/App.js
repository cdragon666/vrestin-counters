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

  const getBonusFromEffects = () => {
    return ["hardened_scales", "conclave_mentor", "ozolith"].reduce(
      (acc, id) => selectedCards.includes(id) ? acc + cardEffects[id].bonus : acc,
      0
    );
  };

  const applyMultipliers = (value) => {
    let result = value;
    if (selectedCards.includes("innkeeper")) {
      result *= cardEffects.innkeeper.multiplier;
    }
    if (selectedCards.includes("branching_evolution")) {
      result *= cardEffects.branching_evolution.multiplier;
    }
    return result;
  };

  const calculateVrestinCounters = () => {
    if (vrestinSummoned) return;

    const base = parseInt(vrestinX);
    let additive = getBonusFromEffects();
    let baseTotal = base + additive;
    let counters = applyMultipliers(baseTotal);

    let log = [`Vrestin enters with ${counters} +1/+1 counters (X = ${base})`];
    if (additive > 0) log.push(`+${additive} from support cards`);
    if (selectedCards.includes("innkeeper")) log.push(`×2 from Innkeeper's Talent`);
    if (selectedCards.includes("branching_evolution")) log.push(`×2 from Branching Evolution`);

    const unicornBonus = applyMultipliers(selectedCards.includes("unicorn") ? 1 + getBonusFromEffects() : 0);

    let insectLog = [];
    for (let i = 1; i <= base; i++) {
      insectLog.push(`Insect ${i} enters with ${unicornBonus} +1/+1 counters (1/1 base)`);
    }

    setResultLog([...[...insectLog, ...log, "-------------------"], ...resultLog]);
    setVrestinSummoned(true);
  };

  const handleAttack = () => {
    let base = 1;
    let total = base + getBonusFromEffects();
    total = applyMultipliers(total);

    const all = ["Vrestin", ...Array(parseInt(vrestinX)).fill(0).map((_, i) => `Insect ${i + 1}`)];
    const log = all.map((c) => `${c} attacks and gains ${total} +1/+1 counters`);
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
