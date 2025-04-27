// --- CounterCalculator.js ---

import { useState } from "react";
import "./App.css";

export default function CounterCalculator() {
  const [supportCards, setSupportCards] = useState([
    { id: 1, name: "Hardened Scales", bonus: 1 },
    { id: 2, name: "Branching Evolution", multiplier: 2 },
    { id: 3, name: "Kami of Whispered Hopes", bonus: 1 },
    { id: 4, name: "Innkeeper's Talent", bonus: 1 },
    { id: 5, name: "Ozolith, the Shattered Spire", bonus: 1 },
    { id: 6, name: "Conclave Mentor", bonus: 1 },
    { id: 7, name: "Andúril Equipped", bonus: 1 },
    { id: 8, name: "City's Blessing (10+ permanents)", bonus: 1 },
    { id: 9, name: "Good-Fortune Unicorn (ETB trigger)", bonus: 1 }
  ]);

  const [selectedCards, setSelectedCards] = useState([]);
  const [xValue, setXValue] = useState(0);
  const [log, setLog] = useState([]);

  const toggleCard = (id) => {
    setSelectedCards((prev) =>
      prev.includes(id) ? prev.filter((card) => card !== id) : [...prev, id]
    );
  };

  const handleSummon = () => {
    let base = parseInt(xValue) || 0;
    let total = base;
    let breakdown = [];
    let multiplier = 1;

    selectedCards.forEach((cardId) => {
      const card = supportCards.find((c) => c.id === cardId);
      if (card) {
        if (card.bonus) {
          total += card.bonus;
          breakdown.push(`+${card.bonus} from ${card.name}`);
        }
        if (card.multiplier) {
          multiplier *= card.multiplier;
          breakdown.push(`x${card.multiplier} from ${card.name}`);
        }
      }
    });

    const finalCounters = total * multiplier;

    const newLog = `Summoned Vrestin with X = ${base}\n` +
                   `Vrestin creates ${base} Insect creature tokens (1/1)\n` +
                   (breakdown.length > 0 ? `Applied boosts:\n${breakdown.join("\n")}\n` : "") +
                   `Final Vrestin Power/Toughness: ${finalCounters}/${finalCounters}`;

    setLog((prev) => [newLog, ...prev]);
  };

  const handleAddCard = () => {
    const name = prompt("Enter new card name:");
    if (!name) return;
    const type = prompt("Type 'bonus' or 'multiplier':");
    const value = parseInt(prompt("Enter value:"));
    if (!type || isNaN(value)) return;

    const newCard = {
      id: Date.now(),
      name,
      [type]: value
    };

    setSupportCards((prev) => [...prev, newCard]);
  };

  const clearLog = () => setLog([]);
  const clearCreatures = () => setSelectedCards([]);

  return (
    <div className="container">
      <h1>MTG Mechanics Master</h1>
      <button className="btn red" onClick={() => alert("Logged out!")}>Logout</button>

      <div className="section">
        <h2>Support Cards</h2>
        <div className="card-grid">
          {supportCards.map((card) => (
            <button
              key={card.id}
              className={`card-btn ${selectedCards.includes(card.id) ? "selected" : ""}`}
              onClick={() => toggleCard(card.id)}
            >
              {card.name}
            </button>
          ))}
        </div>
        <button className="btn green" onClick={handleAddCard}>Add Card</button>
      </div>

      <div className="section">
        <h2>Summon Vrestin</h2>
        <input
          type="number"
          value={xValue}
          onChange={(e) => setXValue(e.target.value)}
          className="input"
          placeholder="Enter X Value"
        />
        <button className="btn green" onClick={handleSummon}>Summon Vrestin</button>
        <button className="btn green" onClick={handleSummon}>Attack with All</button>
        <button className="btn red" onClick={clearCreatures}>Clear Creatures</button>
      </div>

      <div className="section">
        <h2>Result Log</h2>
        <div className="log-box">
          {log.length ? log.map((entry, idx) => (
            <pre key={idx}>{entry}</pre>
          )) : "No actions yet."}
        </div>
        <button className="btn red" onClick={clearLog}>Clear Log</button>
      </div>
    </div>
  );
}
