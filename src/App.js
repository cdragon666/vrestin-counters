import { useState } from "react";
import { auth } from "./firebase";
import { signOut } from "firebase/auth";
import "./App.css";

const supportCardsList = [
  "Hardened Scales",
  "Branching Evolution",
  "Kami of Whispered Hopes",
  "Innkeeper's Talent",
  "Ozolith, the Shattered Spire",
  "Conclave Mentor",
  "Andúril Equipped",
  "City's Blessing (10+ permanents)",
  "Good-Fortune Unicorn (ETB trigger)",
];

export default function App() {
  const [selectedCards, setSelectedCards] = useState([]);
  const [xValue, setXValue] = useState(0);
  const [log, setLog] = useState([]);

  const toggleCard = (card) => {
    setSelectedCards((prev) =>
      prev.includes(card) ? prev.filter((c) => c !== card) : [...prev, card]
    );
  };

  const summonVrestin = () => {
    const summary = `Summoned Vrestin with X=${xValue} and boosts from: ${selectedCards.join(", ")}`;
    setLog((prev) => [summary, ...prev]);
  };

  const attackAll = () => {
    setLog((prev) => ["All creatures attacked!", ...prev]);
  };

  const clearLog = () => setLog([]);

  const clearCreatures = () => setSelectedCards([]);

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="container">
      <div>
        <h1>MTG Mechanics Master</h1>
        <button className="red" onClick={handleLogout}>Logout</button>

        <h2>Support Cards</h2>
        <div className="support-cards">
          {supportCardsList.map((card, index) => (
            <button
              key={index}
              className={selectedCards.includes(card) ? "green" : ""}
              onClick={() => toggleCard(card)}
            >
              {card}
            </button>
          ))}
        </div>

        <h2>Summon Vrestin</h2>
        <input
          type="number"
          value={xValue}
          onChange={(e) => setXValue(e.target.value)}
          placeholder="X Value"
        />
        <button className="green" onClick={summonVrestin}>Summon Vrestin</button>
        <button className="green" onClick={attackAll}>Attack with All</button>
        <button className="red" onClick={clearCreatures}>Clear Creatures</button>
      </div>

      <div>
        <h2>Result Log</h2>
        <textarea readOnly value={log.join("\n")} />
        <button className="red" onClick={clearLog}>Clear Log</button>
      </div>
    </div>
  );
}
