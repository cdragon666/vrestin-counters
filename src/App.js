// src/App.js
import React, { useState } from 'react';
import { auth } from './firebase';
import './App.css';

export default function App() {
  // 1. Card data & state
  const [supportCards] = useState([
    'Hardened Scales',
    'Branching Evolution',
    'Kami of Whispered Hopes',
    "Innkeeper's Talent",
    'Ozolith, the Shattered Spire',
    'Conclave Mentor',
    'Andúril Equipped',
    "City's Blessing (10+ permanents)",
    'Good-Fortune Unicorn (ETB trigger)'
  ]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [creatures, setCreatures] = useState([]);
  const [log, setLog] = useState('');

  // Toggle card selection
  const toggleCard = (card) =>
    setSelectedCards(prev =>
      prev.includes(card)
        ? prev.filter(c => c !== card)
        : [...prev, card]
    );

  // Summon Vrestin logic
  const summonVrestin = (xValue) => {
    const insects = parseInt(xValue, 10) || 0;
    let counters = insects;
    const breakdown = [];

    if (selectedCards.includes('Hardened Scales')) {
      counters += insects;
      breakdown.push(`+${insects} from Hardened Scales`);
    }
    if (selectedCards.includes('Branching Evolution')) {
      counters += counters;
      breakdown.push(`x2 from Branching Evolution`);
    }
    if (selectedCards.includes('Kami of Whispered Hopes')) {
      counters += insects;
      breakdown.push(`+${insects} from Kami of Whispered Hopes`);
    }
    if (selectedCards.includes("Innkeeper's Talent")) {
      counters += insects;
      breakdown.push(`+${insects} from Innkeeper's Talent`);
    }
    if (selectedCards.includes('Ozolith, the Shattered Spire')) {
      counters += insects;
      breakdown.push(`+${insects} from Ozolith, the Shattered Spire`);
    }
    if (selectedCards.includes('Conclave Mentor')) {
      counters += insects;
      breakdown.push(`+${insects} from Conclave Mentor`);
    }
    if (selectedCards.includes('Andúril Equipped')) {
      counters += 2;
      breakdown.push(`+2 from Andúril Equipped`);
    }
    if (selectedCards.includes("City's Blessing (10+ permanents)")) {
      counters += insects;
      breakdown.push(`+${insects} from City's Blessing`);
    }
    if (selectedCards.includes('Good-Fortune Unicorn (ETB trigger)')) {
      counters += insects;
      breakdown.push(`+${insects} from Good-Fortune Unicorn`);
    }

    const finalPower = counters;
    const summary =
      `Starting stats: 0/0\n` +
      `Created ${insects} insect tokens (1/1)\n` +
      (breakdown.length ? `Boosts:\n${breakdown.join('\n')}\n` : '') +
      `Final Power/Toughness: ${finalPower}/${finalPower}`;

    setCreatures(prev => [
      ...prev,
      { name: `Vrestin (X=${insects})`, power: finalPower }
    ]);
    setLog(summary);
  };

  // Attack & clear
  const attackAll = () => {
    const attackSummary = creatures
      .map(c => `${c.name}: ${c.power}/${c.power}`)
      .join('\n');
    setLog(`Attack with:\n${attackSummary}`);
  };
  const clearCreatures = () => {
    setCreatures([]);
    setLog('');
  };

  // Render two-column layout
  return (
    <div className="main-container">
      {/* LEFT: Controls */}
      <div className="controls">
        <section className="support-cards">
          {supportCards.map(card => (
            <button
              key={card}
              onClick={() => toggleCard(card)}
              className={
                selectedCards.includes(card)
                  ? 'card-btn selected'
                  : 'card-btn'
              }
            >
              {card}
            </button>
          ))}
        </section>

        <section className="summon-controls">
          <input
            id="xValue"
            type="number"
            placeholder="X Value"
          />
          <button
            className="btn btn-green"
            onClick={() =>
              summonVrestin(document.getElementById('xValue').value)
            }
          >
            Summon Vrestin
          </button>
        </section>

        <section className="action-buttons">
          <button
            className="btn btn-green"
            onClick={attackAll}
          >
            Attack with All
          </button>
          <button
            className="btn btn-red"
            onClick={clearCreatures}
          >
            Clear Creatures
          </button>
        </section>
      </div>

      {/* RIGHT: Result Log */}
      <div className="result-log">
        <h2>Result Log</h2>
        <div className="log-box">
          {log.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
