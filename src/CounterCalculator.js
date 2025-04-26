import { useState } from "react";

const supportCards = [
  { id: 1, name: "Hardened Scales" },
  { id: 2, name: "Branching Evolution" },
  { id: 3, name: "Kami of Whispered Hopes" },
  { id: 4, name: "Innkeeper's Talent" },
  { id: 5, name: "Ozolith, the Shattered Spire" },
  { id: 6, name: "Conclave Mentor" },
  { id: 7, name: "Andúril Equipped" },
  { id: 8, name: "City's Blessing (10+ permanents)" },
  { id: 9, name: "Good-Fortune Unicorn (ETB trigger)" },
];

export default function CounterCalculator() {
  const [selectedCards, setSelectedCards] = useState([]);
  const [creatures, setCreatures] = useState([]);
  const [xValue, setXValue] = useState(0);
  const [log, setLog] = useState([]);

  const toggleCard = (cardId) => {
    setSelectedCards((prev) =>
      prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]
    );
  };

  const summonVrestin = () => {
    const newCreature = {
      id: creatures.length + 1,
      base: xValue,
      bonus: calculateBonus(),
      multiplier: calculateMultiplier(),
    };
    setCreatures([...creatures, newCreature]);
    addLog(`Vrestin summoned with base ${xValue} and bonuses.`);
  };

  const attackWithAll = () => {
    const updated = creatures.map((creature) => ({
      ...creature,
      base: creature.base + 4,
    }));
    setCreatures(updated);
    addLog(`All creatures attacked and gained 4 counters.`);
  };

  const calculateBonus = () => {
    let bonus = 0;
    if (selectedCards.includes(9)) bonus += 1;
    return bonus;
  };

  const calculateMultiplier = () => {
    let multiplier = 1;
    if (selectedCards.includes(1)) multiplier += 0.5;
    if (selectedCards.includes(2)) multiplier *= 2;
    if (selectedCards.includes(3)) multiplier *= 2;
    if (selectedCards.includes(4)) multiplier *= 2;
    if (selectedCards.includes(6)) multiplier += 1;
    if (selectedCards.includes(5)) multiplier += 0.0;
    return multiplier;
  };

  const addLog = (message) => {
    setLog((prev) => [...prev, message]);
  };

  const clearLog = () => {
    setLog([]);
  };

  const clearCreatures = () => {
    setCreatures([]);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold text-center mb-6">MTG Mechanics Master</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Support Cards</h2>
        <div className="flex flex-wrap gap-2">
          {supportCards.map((card) => (
            <button
              key={card.id}
              onClick={() => toggleCard(card.id)}
              className={`px-4 py-2 rounded bg-gray-700 transition-all ${
                selectedCards.includes(card.id) ? "bg-green-500 scale-105" : ""
              }`}
            >
              {card.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Summon Vrestin</h2>
        <div className="flex gap-2 mb-2">
          <input
            type="number"
            placeholder="X Value"
            value={xValue}
            onChange={(e) => setXValue(Number(e.target.value))}
            className="p-2 bg-gray-800 rounded text-white"
          />
          <button onClick={summonVrestin} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded">
            Summon
          </button>
          <button onClick={clearCreatures} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded">
            Clear Creatures
          </button>
        </div>
        <button onClick={attackWithAll} className="bg-green-700 hover:bg-green-800 px-4 py-2 rounded mt-2">
          Attack with All
        </button>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Result Log</h2>
        <div className="bg-gray-800 p-4 rounded mb-2 min-h-[150px]">
          {log.length === 0 ? (
            <p className="text-gray-400">No actions yet.</p>
          ) : (
            log.map((entry, idx) => <p key={idx}>{entry}</p>)
          )}
        </div>
        <button onClick={clearLog} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded">
          Clear Log
        </button>
      </div>
    </div>
  );
}
