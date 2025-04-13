import { useState } from "react";

const supportCards = [
  { id: "hardened_scales", name: "Hardened Scales" },
  { id: "branching_evolution", name: "Branching Evolution" },
  { id: "kami", name: "Kami of Whispered Hopes" },
  { id: "innkeeper", name: "Innkeeper's Talent" },
  { id: "ozolith", name: "Ozolith, the Shattered Spire" },
  { id: "conclave_mentor", name: "Conclave Mentor" },
  { id: "anduril", name: "Andúril Equipped" },
  { id: "citys_blessing", name: "City's Blessing (10+ permanents)" },
  { id: "unicorn", name: "Good-Fortune Unicorn (ETB trigger)" },
  { id: "crawler", name: "Duskshell Crawler (ETB trigger)" },
  { id: "hornbeetle", name: "Iridescent Hornbeetle (token maker)" }
];

const creatureData = {
  "scute mob": { counters: 1 },
  "hornet queen": { counters: 2 },
  "sigarda, font of blessings": { counters: 4 },
  "king darien xlviii": { counters: 3 },
  "springheart nantuko": { counters: 2 }
};

const ruleDatabase = {
  "cathars' crusade": "Whenever a creature enters the battlefield under your control, put a +1/+1 counter on each creature you control. This is a triggered ability and stacks for each creature.",
  "luminous broodmoth": "If a creature you control without flying dies, return it to the battlefield under your control with a flying counter. This is a replacement effect.",
  "the ozolith": "When a creature you control leaves the battlefield, if it had counters, move those to The Ozolith. At the beginning of combat, you can move those counters to a creature.",
  "teysa karlov": "If a creature dying causes a triggered ability of a permanent you control to trigger, it triggers an additional time. Works with death triggers.",
  "kalain, reclusive painter": "When Kalain enters, you create a Treasure token. Also, creatures you cast with Treasure mana enter with an extra +1/+1 counter."
};

export default function App() {
  const [mode, setMode] = useState("vrestin");
  const [cardQuery, setCardQuery] = useState("");
  const [ruleExplanation, setRuleExplanation] = useState("");

  const lookupRule = () => {
    const match = Object.entries(ruleDatabase).find(([name]) =>
      name.toLowerCase() === cardQuery.toLowerCase().trim()
    );
    if (match) {
      setRuleExplanation(`${match[0]}: ${match[1]}`);
    } else {
      setRuleExplanation("❌ No ruling explanation found for that card (yet). Try a different name or spelling.");
    }
  };

  if (mode === "helper") {
    return (
      <div style={{ padding: "2rem", maxWidth: "700px", margin: "auto" }}>
        <h1>🧠 MTG Mechanics Master</h1>
        <p>Enter a Magic card name to get a simplified explanation of its rules or interactions.</p>
        <input
          type="text"
          placeholder="Enter card name (e.g. The Ozolith)"
          value={cardQuery}
          onChange={(e) => setCardQuery(e.target.value)}
          style={{ width: "100%", padding: "0.5rem", fontSize: "1rem", marginTop: "1rem" }}
        />
        <button
          onClick={lookupRule}
          style={{ marginTop: "1rem", width: "100%", padding: "0.75rem", fontWeight: "bold" }}
        >
          🔎 Explain
        </button>

        {ruleExplanation && (
          <div style={{ marginTop: "2rem", background: "#eee", padding: "1rem", borderRadius: "6px" }}>
            <pre style={{ whiteSpace: "pre-wrap" }}>{ruleExplanation}</pre>
          </div>
        )}

        <button onClick={() => setMode("vrestin")} style={{ marginTop: "2rem" }}>
          🔄 Switch to Devlin Mode
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "700px", margin: "auto" }}>
      <h1 style={{ textAlign: "center" }}>Vrestin +1/+1 Counter Tracker</h1>
      <button onClick={() => setMode("helper")} style={{ marginBottom: "1rem" }}>
        🧠 Switch to MTG Mechanics Master
      </button>

      <p>Welcome back! The full Vrestin calculator will be restored here next.</p>
      {/* The full feature set for Vrestin calculator will be re-implemented in this block. */}
    </div>
  );
}
