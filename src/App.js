import { useState, useEffect, memo } from "react";

// Card and creature data
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
  "scute mob": { base: [0, 0], counters: 1 },
  "hornet queen": { base: [2, 2], counters: 0 },
  "sigarda, font of blessings": { base: [4, 4], counters: 0 },
  "king darien xlviii": { base: [2, 3], counters: 1 },
  "springheart nantuko": { base: [2, 2], counters: 0 }
};

// Section component for collapsible panels
const Section = memo(({ title, isOpen, onToggle, children }) => (
  <div style={{ marginBottom: "1.5rem", border: "1px solid #333", borderRadius: "6px", overflow: "hidden" }}>
    <button
      onClick={onToggle}
      style={{
        width: "100%",
        textAlign: "left",
        background: "#333",
        color: "white",
        padding: "0.6rem 1rem",
        fontWeight: "bold",
        cursor: "pointer",
        borderBottom: "1px solid #222"
      }}
    >
      {isOpen ? `▼ ${title}` : `▶ ${title}`}
    </button>
    {isOpen && <div style={{ padding: "1rem" }}>{children}</div>}
  </div>
));

export default function App() {
  // State
  const [selectedCards, setSelectedCards] = useState([]);
  const [vrestinX, setVrestinX] = useState(0);
  const [creatures, setCreatures] = useState([]);
  const [newCreatureName, setNewCreatureName] = useState("");
  const [startingCounters, setStartingCounters] = useState(0);
  const [resultLog, setResultLog] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  // Keep track of which sections are open
  const [openSections, setOpenSections] = useState({
    "Select Active Cards": true,
    "Vrestin Entry": true,
    "Add Creature": true,
    "Creatures": true,
    "Result Log": true
  });

  // Handlers
  const toggleCard = (id) => setSelectedCards(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  const has = (id) => selectedCards.includes(id);

  const getBaseCounterBonus = () => {
    let bonus = 0;
    if (has("hardened_scales")) bonus++;
    if (has("conclave_mentor")) bonus++;
    if (has("ozolith")) bonus++;
    return bonus;
  };

  const getMultiplier = () => {
    let mult = 1;
    if (has("branching_evolution")) mult *= 2;
    if (has("kami")) mult *= 2;
    if (has("innkeeper")) mult *= 2;
    return mult;
  };

  const getEntryCounterBonus = () => {
    let b = 0;
    if (has("unicorn")) b++;
    if (has("crawler")) b++;
    b += getBaseCounterBonus();
    return Math.ceil(b * getMultiplier());
  };

  const calculateETB = () => {
    const base = parseInt(vrestinX) || 0;
    const vCounters = Math.ceil((base + getBaseCounterBonus()) * getMultiplier());
    const insectCounters = getEntryCounterBonus();
    const log = `[ETB Phase]\n✨ Vrestin enters with ${vCounters} counters\n🐞 ${base} Insect tokens created (+${insectCounters})`;
    const newC = [
      ...(creatures.some(c => c.name === "Vrestin") ? [] : [{ name: "Vrestin", base: [0,0], counters: vCounters }]),
      ...Array(base).fill().map((_,i) => ({ name: `Insect ${i+1}`, base:[1,1], counters: insectCounters }))
    ];
    setCreatures(prev => [...prev, ...newC]);
    setResultLog(prev => [log, ...prev]);
  };

  const updateCounter = (i, delta) => setCreatures(prev => prev.map((c,idx) => idx===i ? { ...c, counters: Math.max(0,c.counters+delta) } : c));
  const removeCreature = i => setCreatures(prev => prev.filter((_,idx)=>idx!==i));
  const clearAllCreatures = () => setCreatures([]);
  const clearLog = () => setResultLog([]);

  const addCreature = () => {
    const name = newCreatureName.trim(); if(!name) return;
    const data = creatureData[name.toLowerCase()];
    const base = data ? data.base : [0,0];
    const baseC = data ? data.counters : parseInt(startingCounters)||0;
    const final = Math.ceil((baseC + getBaseCounterBonus()) * getMultiplier());
    setCreatures(prev=>[...prev,{name,base,counters:final}]);
    setNewCreatureName(""); setStartingCounters(0); setSuggestions([]);
  };

  const handleNameChange = e => {
    const v = e.target.value;
    setNewCreatureName(v);
    if(!v) return setSuggestions([]);
    setSuggestions(Object.keys(creatureData).filter(n=>n.includes(v.toLowerCase())));
  };
  const fillSuggestion = name => {
    setNewCreatureName(name.replace(/\b\w/g,c=>c.toUpperCase()));
    const d = creatureData[name]; if(d) setStartingCounters(d.counters);
    setSuggestions([]);
  };

  // Render
  return (
    <div style={{padding:"1rem",backgroundColor:"#1a1a1a",color:"white",fontFamily:"Arial,sans-serif"}}>
      <h1 style={{textAlign:"center",marginBottom:"1.5rem"}}>Counter Tracker</h1>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1.5rem"}}>
        {/* Left Column */}
        <div>
          {Object.keys(openSections).slice(0,3).map(title=> (
            <Section
              key={title}
              title={title}
              isOpen={openSections[title]}
              onToggle={()=>setOpenSections(prev=>({...prev,[title]:!prev[title]}))}
            >
              {title === "Select Active Cards" && (
                <div style={{display:"flex",flexWrap:"wrap",gap:"0.5rem"}}>
                  {supportCards.map(card=>(
                    <div
                      key={card.id}
                      onClick={()=>toggleCard(card.id)}
                      style={{backgroundColor:has(card.id)?"#4caf50":"#2e2e2e",color:"white",padding:"0.5rem 1rem",borderRadius:"6px",cursor:"pointer"}}
                    >{card.name}</div>
                  ))}
                </div>
              )}
              {title === "Vrestin Entry" && (
                <>  
                  <input type="number" placeholder="X value" value={vrestinX}
                    onChange={e=>setVrestinX(e.target.value)}
                    style={{width:"100%",padding:"0.5rem",marginBottom:"0.5rem",borderRadius:"6px"}}
                  />
                  <button onClick={calculateETB} style={{width:"100%",padding:"0.5rem",backgroundColor:"#4CAF50",color:"white",borderRadius:"6px"}}>
                    Summon Vrestin
                  </button>
                </>
              )}
              {title === "Add Creature" && (
                <>
                  <input type="text" placeholder="Creature Name" value={newCreatureName}
                    onChange={handleNameChange}
                    style={{width:"60%",marginRight:"2%",padding:"0.5rem",borderRadius:"6px"}}
                  />
                  <input type="number" placeholder="Counters" value={startingCounters}
                    onChange={e=>setStartingCounters(e.target.value)}
                    style={{width:"35%",padding:"0.5rem",borderRadius:"6px"}}
                  />
                  <button onClick={addCreature} style={{marginTop:"0.5rem",width:"100%",padding:"0.5rem",backgroundColor:"#4CAF50",color:"white",borderRadius:"6px"}}>
                    Add Creature
                  </button>
                  <button onClick={clearAllCreatures} style={{marginTop:"0.3rem",width:"100%",padding:"0.5rem",backgroundColor:"#800",color:"white",borderRadius:"6px"}}>
                    Clear All Creatures
                  </button>
                </>
              )}
            </Section>
          ))}
        </div>
        {/* Right Column */}
        <div>
          {Object.keys(openSections).slice(3).map(title=> (
            <Section
              key={title}
              title={title}
              isOpen={openSections[title]}
              onToggle={()=>setOpenSections(prev=>({...prev,[title]:!prev[title]}))}
            >
              {title === "Creatures" && creatures.map((c,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"#333",padding:"0.5rem",borderRadius:"6px",marginBottom:"0.3rem"}}>
                  <span>{c.name}: {c.base[0]}/{c.base[1]} (+{c.counters})</span>
                  <div>
                    <button onClick={()=>updateCounter(i,1)} style={{marginRight:"0.3rem"}}>+1</button>
                    <button onClick={()=>updateCounter(i,-1)} style={{marginRight:"0.3rem"}}>-1</button>
                    <button onClick={()=>removeCreature(i)}>🗑️</button>
                  </div>
                </div>
              ))}
              {title === "Result Log" && (
                <>
                  <textarea readOnly value={resultLog.join("\n-------------------\n")}
                    style={{width:"100%",height:"150px",backgroundColor:"#222",color:"white",padding:"0.5rem",borderRadius:"6px",fontFamily:"monospace"}}
                  />
                  <button onClick={clearLog} style={{width:"100%",marginTop:"0.3rem",padding:"0.5rem",backgroundColor:"#f44336",color:"white",borderRadius:"6px"}}>
                    Clear Log
                  </button>
                </>
              )}
            </Section>
          ))}
        </div>
      </div>
    </div>
  );
}
