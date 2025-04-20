import { useState } from "react";
import "./App.css";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";

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
  { id: "unicorn", name: "Good-Fortune Unicorn" }
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
    let unicornTotal = cardEffects.unicorn.bonus;
    if (selectedCards.includes("hardened_scales")) unicornTotal += 1;
    if (selectedCards.includes("conclave_mentor")) unicornTotal += 1;
    if (selectedCards.includes("branching_evolution")) unicornTotal *= 2;
    return unicornTotal;
  };

  const calculateVrestinCounters = () => {
    if (vrestinSummoned) return;

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
    let unicornBonus = getUnicornBonus();
    const total = vrestinCounters + unicornBonus;

    const newLog = [`Vrestin enters with ${total} +1/+1 counters (X = ${base})`, ...log];

    // Create Insects
    let insectLog = [];
    const insectCount = base;
    const insectCounters = selectedCards.includes("unicorn") ? getUnicornBonus() : 0;

    for (let i = 1; i <= insectCount; i++) {
      insectLog.push(
        `Insect ${i} enters with ${insectCounters} +1/+1 counters (1/1 base)`
      );
    }

    setResultLog([
      ...insectLog,
      ...newLog,
      "-------------------",
      ...resultLog
    ]);
    setVrestinSummoned(true);
  };

  const handleAttack = () => {
    const unicornBonus = getUnicornBonus();
    const base = parseInt(vrestinX);
    const allCreatures = ["Vrestin", ...Array(base).fill(0).map((_, i) => `Insect ${i + 1}`)];
    const log = allCreatures.map(
      (name) => `${name} attacks and gains ${unicornBonus} +1/+1 counters`
    );
    setResultLog([...[...log, "[Combat Phase]", "-------------------"], ...resultLog]);
  };

  const handleClearLog = () => setResultLog([]);
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
