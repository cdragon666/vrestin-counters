import { useState } from "react";
import "./App.css";

const supportCards = [
  { id: "hardened_scales", name: "Hardened Scales" },
  { id: "branching_evolution", name: "Branching Evolution" },
  { id: "kami", name: "Kami of Whispered Hopes" },
  { id: "innkeeper", name: "Innkeeper's Talent" },
  { id: "ozolith", name: "Ozolith, the Shattered Spire" },
  { id: "conclave_mentor", name: "Conclave Mentor" },
  { id: "anduril", name: "Andúril Equipped" },
  { id: "citys_blessing", name: "City's Blessing (10+ permanents)" },
  { id: "unicorn", name: "Good-Fortune Unicorn (ETB trigger)" }
];

export default function App() {
  const [creatures, setCreatures] = useState([]);
  const [log, setLog] = useState([]);

  const addToLog = (entry) => {
    setLog((prev) => [...prev, entry]);
  };

  return (
    <div className="app-container">
      <h1 className="app-title">MTG Mechanics Master</h1>
      <div className="flex-row">
        <div className="flex-column">
          <button className="btn green">Summon Vrestin</button>
          <div className="card-list">
            {supportCards.map((card) => (
              <div key={card.id} className="card-button">
                {card.name}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-column">
          <h2>Creatures</h2>
          <div>
            {creatures.map((creature, index) => (
              <div key={index} className="creature-box">
                {creature.name} - {creature.power}/{creature.toughness}
              </div>
            ))}
          </div>

          <h2>Result Log</h2>
          <textarea
            readOnly
            className="log-box"
            value={log.join("\n-------------------\n")}
          ></textarea>
        </div>
      </div>
    </div>
  );
}
