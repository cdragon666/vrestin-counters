import { useState, useEffect, memo } from "react";

const supportCards = [
  { id: "hardened_scales", name: "Hardened Scales" },
  { id: "branching_evolution", name: "Branching Evolution" },
  { id: "kami", name: "Kami of Whispered Hopes" },
  { id: "innkeeper", name: "Innkeeper's Talent" },
  { id: "ozolith", name: "Ozolith, the Shattered Spire" },
  { id: "conclave_mentor", name: "Conclave Mentor" },
  { id: "anduril", name: "Andúril Equipped" },
  { id: "citys_blessing", name: "City's Blessing (10+ permanents)" },
  { id: "unicorn", name: "Good-Fortune Unicorn" },
  { id: "crawler", name: "Duskshell Crawler" },
  { id: "hornbeetle", name: "Iridescent Hornbeetle" }
];

const creatureData = {
  "scute mob": { base: [0, 0], counters: 1 },
  "hornet queen": { base: [2, 2], counters: 0 },
  "sigarda, font of blessings": { base: [4, 4], counters: 0 },
  "king darien xlviii": { base: [2, 3], counters: 1 },
  "springheart nantuko": { base: [2, 2], counters: 0 }
};

// Apply replacement effects in sequence and log each step
function applyReplacements(amount, selected, nameMap) {
  let current = amount;
  const logSteps = [];
  // 'Plus one' effects
  ["hardened_scales", "conclave_mentor", "kami", "innkeeper"].forEach(id => {
    if (selected.includes(id)) {
      current += 1;
      logSteps.push(`${nameMap[id]} applies (+1) → ${current}`);
    }
  });
  // 'Doubling' effects
  ["branching_evolution", "innkeeper"].forEach(id => {
    if (selected.includes(id)) {
      current *= 2;
      logSteps.push(`${nameMap[id]} applies (×2) → ${current}`);
    }
  });
  return { current, logSteps };
}

const nameMap = supportCards.reduce((m, c) => { m[c.id] = c.name; return m; }, {});

const Section = memo(({ title, isOpen, onToggle, children }) => (
  <div style={{ marginBottom: '1rem', border: '1px solid #444', borderRadius: '6px', overflow: 'hidden' }}>
    <button
      onClick={onToggle}
      style={{ width: '100%', background: '#222', color: 'white', padding: '0.6rem 1rem', textAlign: 'left', cursor: 'pointer', fontWeight: 'bold' }}
    >
      {isOpen ? `▼ ${title}` : `▶ ${title}`}
    </button>
    {isOpen && <div style={{ padding: '1rem' }}>{children}</div>}
  </div>
));

export default function App() {
  const [selected, setSelected] = useState([]);
  const [vrestinX, setVrestinX] = useState(0);
  const [creatures, setCreatures] = useState([]);
  const [newName, setNewName] = useState('');
  const [newCounters, setNewCounters] = useState(0);
  const [log, setLog] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [sections, setSections] = useState({
    'Select Active Cards': true,
    'Vrestin Entry': true,
    'Add Creature': true,
    'Creatures': true,
    'Result Log': true
  });

  const toggleCard = id => setSelected(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  const has = id => selected.includes(id);

  const logEvent = (lines) => setLog(prev => [lines.join('\n'), ...prev]);

  // ETB calculation with replacement pipeline
  const calculateETB = () => {
    const base = parseInt(vrestinX) || 0;
    const { current: after, logSteps } = applyReplacements(base, selected, nameMap);
    const lines = [`[ETB Phase]`, `Base: ${base}`].concat(
      logSteps.map(s => `- ${s}`),
      [`Result: Vrestin enters with ${after} counters`]
    );
    logEvent(lines);
    const newList = [];
    if (!creatures.some(c=>c.name==='Vrestin')) newList.push({ name: 'Vrestin', base: [0,0], counters: after });
    for (let i=1; i<=base; i++) newList.push({ name: `Insect ${i}`, base: [1,1], counters: applyReplacements(1, selected, nameMap).current });
    setCreatures(prev => [...prev, ...newList]);
  };

  // Handle trigger: Good-Fortune Unicorn and Crawler ETB
  useEffect(() => {
    const unicorns = creatures.filter(c => c.name === 'Vrestin');
    if (has('unicorn') && unicorns.length) {
      const { current, logSteps } = applyReplacements(1, selected, nameMap);
      const lines = [`[Unicorn Trigger]`, `Base: 1`].concat(
        logSteps.map(s => `- ${s}`),
        [`Result: +${current} counter`]
      );
      logEvent(lines);
      setCreatures(prev => prev.map(c => c.name==='Vrestin' ? { ...c, counters: c.counters + current } : c));
    }
  }, [creatures]);

  const updateCounter = (i, d) => setCreatures(prev => prev.map((c,idx)=> idx===i? {...c, counters: Math.max(0, c.counters+d)}:c));
  const remove = i => setCreatures(prev => prev.filter((_,idx)=>idx!==i));
  const clearAll = () => setCreatures([]);
  const clearLog = () => setLog([]);

  const addCreature = () => {
    const n = newName.trim(); if(!n) return;
    const d = creatureData[n.toLowerCase()];
    const base = d? d.base: [0,0];
    const counted = applyReplacements(d? d.counters: parseInt(newCounters)||0, selected, nameMap).current;
    setCreatures(prev=>[...prev,{ name: n, base, counters: counted }]);
    setNewName(''); setNewCounters(0); setSuggestions([]);
  };

  const handleName = e => {
    const v=e.target.value; setNewName(v);
    if(!v) return setSuggestions([]);
    setSuggestions(Object.keys(creatureData).filter(n=>n.includes(v.toLowerCase())));
  };
  const choose = n=>{ setNewName(n); setNewCounters(creatureData[n].counters); setSuggestions([]); };

  return (
    <div style={{ padding:'1rem', background:'#111', color:'white', fontFamily:'sans-serif' }}>
      <h1 style={{ textAlign:'center' }}>Counter Tracker</h1>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
        <div>
          {['Select Active Cards','Vrestin Entry','Add Creature'].map(title=> (
            <Section key={title}
              title={title}
              isOpen={sections[title]}
              onToggle={()=> setSections(prev=>({...prev,[title]:!prev[title]}))}
            >
              {title==='Select Active Cards' && (
                <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem' }}>
                  {supportCards.map(card=>(
                    <div key={card.id} onClick={()=>toggleCard(card.id)}
                      style={{ padding:'0.5rem 1rem', background: has(card.id)?'#4caf50':'#333', borderRadius:'4px', cursor:'pointer' }}>
                      {card.name}
                    </div>
                  ))}
                </div>
              )}
              {title==='Vrestin Entry' && (
                <>
                  <input type='number' placeholder='X' value={vrestinX}
                    onChange={e=>setVrestinX(e.target.value)} style={{ width:'100%', marginBottom:'0.5rem' }} />
                  <button onClick={calculateETB} style={{ width:'100%' }}>Summon</button>
                </>
              )}
              {title==='Add Creature' && (
                <>
                  <input type='text' placeholder='Name' value={newName} onChange={handleName} style={{ width:'65%', marginRight:'2%' }} />
                  <input type='number' placeholder='+1/+1' value={newCounters} onChange={e=>setNewCounters(e.target.value)} style={{ width:'30%' }} />
                  <button onClick={addCreature} style={{ width:'100%', marginTop:'0.5rem' }}>Add Creature</button>
                  <button onClick={clearAll} style={{ width:'100%', marginTop:'0.3rem' }}>Clear All</button>
                </>
              )}
            </Section>
          ))}
        </div>
        <div>
          {['Creatures','Result Log'].map(title=> (
            <Section key={title}
              title={title}
              isOpen={sections[title]}
              onToggle={()=> setSections(prev=>({...prev,[title]:!prev[title]}))}
            >
              {title==='Creatures' && creatures.map((c,i)=>(
                <div key={i} style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.3rem', background:'#222', padding:'0.5rem' }}>
                  <span>{c.name}: {c.base[0]}/{c.base[1]} (+{c.counters})</span>
                  <div>
                    <button onClick={()=>updateCounter(i,1)}>+1</button>
                    <button onClick={()=>updateCounter(i,-1)}>-1</button>
                    <button onClick={()=>remove(i)}>🗑️</button>
                  </div>
                </div>
              ))}
              {title==='Result Log' && (
                <>
                  <textarea readOnly value={log.join('\n-------------------\n')} style={{ width:'100%', height:'150px', background:'#111', color:'white' }} />
                  <button onClick={clearLog} style={{ width:'100%', marginTop:'0.3rem' }}>Clear Log</button>
                </>
              )}
            </Section>
          ))}
        </div>
      </div>
    </div>
  );
}
