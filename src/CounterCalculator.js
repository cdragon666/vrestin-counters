import { useState } from "react";

const supportCards = [
  { id: 1, name: "Hardened Scales", bonus: 1 },
  { id: 2, name: "Branching Evolution", multiplier: 2 },
  { id: 3, name: "Kami of Whispered Hopes", multiplier: 2 },
  { id: 4, name: "Innkeeper's Talent", multiplier: 2 },
  { id: 5, name: "Ozolith, the Shattered Spire", bonus: 1 },
  { id: 6, name: "Conclave Mentor", bonus: 1 },
  { id: 7, name: "Andúril Equipped", bonus: 2 },
  { id: 8, name: "City's Blessing (10+ permanents)", bonus: 1 },
  { id: 9, name: "Good-Fortune Unicorn (ETB trigger)", bonus: 1 },
];

export default function CounterCalculator() {
  const [selectedCards, setSelectedCards] = useState([]);
  const [xValue, setXValue] = useState("");
  const [result, setResult] = useState(0);
  const [log, setLog] = useState([]);

  const toggleCard = (id) => {
    setSelectedCards((prev) =>
      prev.includes(id) ? prev.filter((cardId) => cardId !== id) : [...prev, id]
    );
  };

  const calculate = () => {
    let total = parseInt(xValue) || 0;
    let bonus = 0;
    let multiplier = 1;
    let flat = 0;
    let breakdown = [];

    selectedCards.forEach((id) => {
      const card = supportCards.find((c) => c.id === id);
      if (card.bonus) {
        bonus += card.bonus;
        breakdown.push(`+${card.bonus} (bonus from ${card.name})`);
      }
      if (card.multiplier) {
        multiplier *= card.multiplier;
        breakdown.push(`×${card.multiplier} (multiplier from ${card.name})`);
      }
    });

    const final = Math.ceil((total + bonus + flat) * multiplier);
    setResult(final);

    const logEntry = `Base: ${total} | ${breakdown.join(" | ")} => Total: ${final}`;
    setLog((prev) => [logEntry, ...prev]);
  };

  const clearLog = () => setLog([]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      <h1 className="text-3xl font-bold text-center">MTG Mechanics Master</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {supportCards.map((card) => (
          <div
            key={card.id}
            className={`p-3 rounded-md text-center cursor-pointer transition-all ${
              selectedCards.includes(card.id)
                ? "bg-green-600 scale-105"
                : "bg-gray-700"
            }`}
            onClick={() => toggleCard(card.id)}
          >
            {card.name}
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Summon Vrestin</h2>
        <input
          type="number"
          placeholder="X Value"
          value={xValue}
          onChange={(e) => setXValue(e.target.value)}
          className="w-full p-2 rounded-md bg-gray-800 text-white"
        />
        <div className="flex space-x-2">
          <button
            onClick={calculate}
            className="px-4 py-2 bg-green-500 hover:bg-green-700 text-white rounded-md"
          >
            Summon
          </button>
          <button
            onClick={() => setSelectedCards([])}
            className="px-4 py-2 bg-red-500 hover:bg-red-700 text-white rounded-md"
          >
            Clear Creatures
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Result Log</h2>
        <textarea
          value={log.join("\n")}
          readOnly
          className="w-full h-40 p-2 rounded-md bg-gray-800 text-white"
        />
        <button
          onClick={clearLog}
          className="px-4 py-2 bg-red-500 hover:bg-red-700 text-white rounded-md mt-2"
        >
          Clear Log
        </button>
      </div>
    </div>
  );
}
