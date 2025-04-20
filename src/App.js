import { useState } from "react";
import { auth } from "./firebase";
import { signOut } from "firebase/auth";
import "./App.css";

const cardEffects = {
  hardened_scales: { bonus: 1 },
  conclave_mentor: { bonus: 1 },
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
  const [insects, setInsects] = useState([]);
  const [resultLog, setResultLog] = useState([]);

  const toggleCard = (id) => {
    setSelectedCards((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const calculateBuffs = () => {
    let bonus = 0;
    let multiplier = 1;

    if (selectedCards.includes("hardened_scales")) bonus += cardEffects.hardened_scales.bonus;
    if (selectedCards.includes("conclave_mentor")) bonus += cardEffects.conclave_mentor.bonus;
    if (selectedCards.includes("branching_evolution")) multiplier *= cardEffects.branching_evolution.multiplier;

    return { bonus, multiplier };
  };

  const summonVrestin = () => {
    const base = parseInt(vrestinX);
    if (isNaN(base) || base <= 0) return;

    const { bonus, multiplier } = calculateBuffs();
    const unicornBonus = selectedCards.includes("unicorn") ? 1 + bonus : 0;
    const totalUnicorn = selectedCards.includes("branching_evolution") ? unicornBonus * 2 : unicornBonus;

    const vrestinCounters = (base + bonus) * multiplier + totalUnicorn;

    const newInsects = Array.from({ length: base }, (_, i) => {
      const insectBonus = selectedCards.includes("unicorn") ? (1 + bonus) * (selectedCards.includes("branching_evolution") ? 2 : 1) : 0;
      return {
        name: `Insect ${i + 1}`,
        counters: insectBonus,
        attacked: false
      };
    });

    const log = [
      `Vrestin enters with ${vrestinCounters} +1/+1 counters (X = ${base})`,
      ...newInsects.map((i) => `${i.name} enters with ${i.counters} +1/+1 counters`)
    ];

    setInsects([...newInsects]);
    setResultLog([log.join("\n"), ...resultLog]);
  };

  const handleCombat = () => {
    const { bonus, multiplier } = calculateBuffs();
    const combatBonus = 1 + bonus;
    const final = combatBonus * multiplier;

    const updated = insects.map((i) => ({
      ...i,
      counters: i.counters + final,
      attacked: true
    }));

    const log = insects.map((i) => `${i.name} attacks and gains ${final} +1/+1 counter`);

    setInsects(updated);
    setResultLog([log.join("\n"), ...resultLog]);
  };

  const logout = async () => {
    await signOut(auth);
    window.location.reload();
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1 className="app-title">MTG Mechanics Master</h1>
        <button className="btn red" onClick={logout}>Logout</button>
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
          <button onClick={summonVrestin} className="btn green">Summon Vrestin</button>
          <button onClick={handleCombat} className="btn green">Attack with Insects</button>
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
