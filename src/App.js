import { useState } from "react";
import "./App.css";
import { auth } from "./firebase";
import { signOut } from "firebase/auth";

const supportCards = [
  "Hardened Scales",
  "Branching Evolution",
  "Kami of Whispered Hopes",
  "Innkeeper's Talent",
  "Ozolith, the Shattered Spire",
  "Conclave Mentor",
  "Andúril Equipped",
  "City's Blessing (10+ permanents)",
  "Good-Fortune Unicorn (ETB trigger)"
];

export default function App() {
  const [selectedCards, setSelectedCards] = useState([]);
  const [xValue, setXValue] = useState("");
  const [log, setLog] = useState("");

  const toggleCard = (card) => {
    setSelectedCards((prev) =>
      prev.includes(card) ? prev.filter((c) => c !== card) : [...prev, card]
    );
  };

  const summonVrestin = () => {
    let base = parseInt(xValue);
    if (isNaN(base) || base <= 0) return;

    let result = `Vrestin enters with ${base} +1/+1 counters (X = ${base})`;

    if (selectedCards.includes("Hardened Scales")) {
      base += 1;
      result += "\n+1 from Hardened Scales";
    }
    if (selectedCards.includes("Conclave Mentor")) {
      base += 1;
      result += "\n+1 from Conclave Mentor";
    }
    if (selectedCards.includes("Innkeeper's Talent")) {
      base *= 2;
      result += "\n×2 from Innkeeper's Talent";
    }
    if (selectedCards.includes("Branching Evolution")) {
      base *= 2;
      result += "\n×2 from Branching Evolution";
    }
    setLog((prev) => `${result}\n-------------------\n` + prev);
  };

  const attackAll = () => {
    let counterGain = 1;
    let breakdown = "\n[Combat Phase]";
    if (selectedCards.includes("Innkeeper's Talent")) {
      counterGain *= 2;
      breakdown += `\nInnkeeper's Talent doubles → ${counterGain}`;
    }
    if (selectedCards.includes("Branching Evolution")) {
      counterGain *= 2;
      breakdown += `\nBranching Evolution doubles → ${counterGain}`;
    }
    setLog((prev) =>
      `Vrestin attacks and gains ${counterGain} +1/+1 counters` +
      `\nInsect 1 attacks and gains ${counterGain} +1/+1 counters` +
      `\nInsect 2 attacks and gains ${counterGain} +1/+1 counters` +
      breakdown +
      "\n-------------------\n" +
      prev
    );
  };

  const clearLog = () => setLog("");
  const clearCreatures = () => setXValue("");

  const logout = async () => {
    await signOut(auth);
    window.location.reload();
  };

  return (
    <div className="app-container">
      <h1 className="app-title">MTG Mechanics Master</h1>
      <button className="logout-button" onClick={logout}>Logout</button>

      <div className="grid">
        <div className="left-panel">
          <h2>Support Cards</h2>
          <div className="card-list">
            {supportCards.map((card) => (
              <div
                key={card}
                className={`card-button ${selectedCards.includes(card) ? "active" : ""}`}
                onClick={() => toggleCard(card)}
              >
                {card}
              </div>
            ))}
          </div>

          <h2>Summon Vrestin</h2>
          <input
            type="number"
            placeholder="X Value"
            value={xValue}
            onChange={(e) => setXValue(e.target.value)}
          />
          <div style={{ marginTop: "0.5rem" }}>
            <button className="btn green" onClick={summonVrestin}>Summon</button>
            <button className="btn red" onClick={clearCreatures}>Clear Creatures</button>
          </div>

          <button className="btn green" style={{ marginTop: "1rem" }} onClick={attackAll}>
            Attack with All
          </button>
        </div>

        <div className="right-panel">
          <h2>Creatures</h2>
          <h2>Result Log</h2>
          <textarea readOnly value={log} className="log-box" />
          <button className="btn red" onClick={clearLog}>Clear Log</button>
        </div>
      </div>
    </div>
  );
}
