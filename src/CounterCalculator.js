import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const supportCards = [
  { id: "hardened_scales", name: "Hardened Scales", bonus: 1 },
  { id: "branching_evolution", name: "Branching Evolution", multiplier: 2 },
  { id: "kami", name: "Kami of the Whispered Hopes", multiplier: 2 },
  { id: "conclave_mentor", name: "Conclave Mentor", bonus: 1 },
  { id: "ozolith", name: "Ozolith, the Shattered Spire", bonus: 1 },
  { id: "anduril", name: "Andúril, Narsil Reforged", flat: 2 },
];

export default function CounterCalculator() {
  const [selectedCards, setSelectedCards] = useState([]);
  const [baseCounters, setBaseCounters] = useState(0);
  const [result, setResult] = useState(null);
  const [log, setLog] = useState([]);

  const toggleCard = (id) => {
    setSelectedCards((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const calculateTotal = () => {
    let total = Number(baseCounters);
    let bonus = 0;
    let multiplier = 1;
    let flat = 0;
    let breakdown = [];

    supportCards.forEach((card) => {
      if (selectedCards.includes(card.id)) {
        if (card.flat) {
          flat += card.flat;
          breakdown.push(`+${card.flat} (from ${card.name})`);
        }
        if (card.bonus) {
          bonus += card.bonus;
          breakdown.push(`+${card.bonus} (bonus from ${card.name})`);
        }
        if (card.multiplier) {
          multiplier *= card.multiplier;
          breakdown.push(`x${card.multiplier} (multiplier from ${card.name})`);
        }
      }
    });

    const final = Math.ceil((total + bonus + flat) * multiplier);
    setResult(final);

    const logEntry = `Base: ${total} | ${breakdown.join(" | ")} => Total: ${final}`;
    setLog((prev) => [logEntry, ...prev]);
  };

  const clearLog = () => setLog([]);

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-center">+1/+1 Counter Calculator</h1>

      <div className="grid grid-cols-2 gap-2">
        {supportCards.map((card) => (
          <Card
            key={card.id}
className={`cursor-pointer transition-all ${selectedCards.includes(card.id) ? "bg-green-200 scale-105" : ""}`}

            onClick={() => toggleCard(card.id)}
          >
            <CardContent className="p-2 text-sm font-medium text-center">
              {card.name}
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <Label htmlFor="base">Base Counters</Label>
        <Input
          id="base"
          type="number"
          value={baseCounters}
          onChange={(e) => setBaseCounters(e.target.value)}
        />
      </div>

      <Button onClick={calculateTotal} className="w-full">
        Calculate
      </Button>

      {result !== null && (
        <div className="text-xl font-semibold text-center">
          Total Counters: {result}
        </div>
      )}

      {log.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">Calculation History</h2>
            <Button variant="outline" size="sm" onClick={clearLog}>
              Clear
            </Button>
          </div>
          <Textarea
            readOnly
            className="w-full h-40 font-mono"
            value={log.join("\n")}
          />
        </div>
      )}
    </div>
  );
}