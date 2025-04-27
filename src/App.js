// src/App.js
import React, { useState } from 'react';
import { auth } from './firebase';  // for the logout button
import './App.css';

export default function App() {
  // your core state and logic:
  const [supportCards] = useState([
    'Hardened Scales', 'Branching Evolution', 'Kami of Whispered Hopes',
    "Innkeeper's Talent", 'Ozolith, the Shattered Spire', 'Conclave Mentor',
    'Andúril Equipped', "City's Blessing (10+ permanents)",
    'Good-Fortune Unicorn (ETB trigger)'
  ]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [creatures, setCreatures] = useState([]);
  const [log, setLog] = useState('');

  const toggleCard = (card) =>
    setSelectedCards(prev =>
      prev.includes(card) ? prev.filter(c => c !== card) : [...prev, card]
    );

  const summonVrestin = (xValue) => {
    // ... (move your existing summonVrestin logic here)
  };

  const attackAll = () => {
    // ... (move your existing attackAll logic here)
  };

  const clearCreatures = () => {
    setCreatures([]);
    setLog('');
  };

  return (
    <div className="min-h-screen p-6 bg-gray-900 text-white">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">MTG Mechanics Master</h1>
        <button
          onClick={() => auth.signOut().then(() => window.location.reload())}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Support Cards */}
        <section>
          <h2 className="text-2xl font-bold mb-2">Support Cards</h2>
          <div className="flex flex-wrap gap-2 mb-6">
            {supportCards.map((card) => (
              <button
                key={card}
                onClick={() => toggleCard(card)}
                className={`px-3 py-1 rounded transition ${
                  selectedCards.includes(card)
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {card}
              </button>
            ))}
          </div>

          {/* Summon Vrestin */}
          <h2 className="text-2xl font-bold mb-2">Summon Vrestin</h2>
          <div className="flex gap-2 mb-4">
            <input
              id="xInput"
              type="number"
              className="p-2 rounded text-black w-full"
              placeholder="Enter X value"
            />
            <button
              onClick={() =>
                summonVrestin(document.getElementById('xInput').value)
              }
              className="bg-green-500 hover:bg-green-600 text-black px-4 py-2 rounded"
            >
              Summon
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={attackAll}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Attack with All
            </button>
            <button
              onClick={clearCreatures}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Clear Creatures
            </button>
          </div>
        </section>

        {/* Result Log */}
        <section>
          <h2 className="text-2xl font-bold mb-2">Result Log</h2>
          <textarea
            className="w-full h-96 p-4 rounded bg-gray-800 text-white resize-none"
            value={log}
            readOnly
          />
        </section>
      </div>
    </div>
  );
}
