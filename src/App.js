import { useState, memo } from "react";

// Data for support cards and creatures
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

// Applies replacement effects in order, returns final amount and log steps
function applyReplacements(amount, selected, nameMap) {
  let current = amount;
  const logSteps = [];
  // +1 replacement effects
  ["hardened_scales", "conclave_mentor", "kami", "innkeeper"].forEach(id => {
    if (selected.includes(id)) {
      current += 1;
      logSteps.push(`${nameMap[id]} applies (+1) → ${current}`);
    }
  });
  // ×2 doubling effects
  ["branching_evolution", "innkeeper"].forEach(id => {
    if (selected.includes(id)) {
      current *= 2;
      logSteps.push(`${nameMap[id]} applies (×2) → ${current}`);
    }
  });
  return { current, logSteps };
}

const nameMap = supportCards.reduce((map, c) => { map[c.id] = c.name; return map; }, {});

// Collapsible Section component
const Section = memo(({ title, isOpen, onToggle, children }) => (
  <div style={{ marginBottom: '1rem', border: '1px solid #444', borderRadius: '6px', overflow: 'hidden' }}>
    <button
      onClick={onToggle}
      style={{
        width: '100%',
        background: '#222',
        color: 'white',
        padding: '0.6rem 1rem',
        textAlign: 'left',
        cursor: 'pointer',
        fontWeight: 'bold',
        border: 'none'
      }}
    >
      {isOpen ? `▼ ${title}` : `▶ ${title}`}
    </button>
    {isOpen && <div style={{ padding: '1rem' }}>{children}</div>}
  </div>
));

export default function App() {
  // State
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

  // Helpers
  const toggleCard = id =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const has = id => selected.includes(id);
  const logEvent = lines => setLog(prev => [lines.join('\n'), ...prev]);

  // Main ETB calculation
  const calculateETB = () => {
    const base = parseInt(vrestinX) || 0;
    const { current: after, logSteps: etbSteps } = applyReplacements(base, selected, nameMap);

    const etbLog = ['[ETB Phase]', `Base: ${base}`,
      ...etbSteps.map(s => `- ${s}`),
      `Result: Vrestin enters with ${after} counters`
    ];
    logEvent(etbLog);

    // Build new creatures list
    const newList = [];
    if (!creatures.some(c => c.name === 'Vrestin')) {
      newList.push({ name: 'Vrestin', base: [0, 0], counters: after });
    }
    for (let i = 1; i <= base; i++) {
      const insectAmt = applyReplacements(1, selected, nameMap).current;
      newList.push({ name: `Insect ${i}`, base: [1, 1], counters: insectAmt });
    }
    setCreatures(prev => [...prev, ...newList]);

    // Good-Fortune Unicorn trigger
    if (has('unicorn')) {
      newList.forEach(c => {
        const { current, logSteps } = applyReplacements(1, selected, nameMap);
        const triggerLog = [`[Unicorn Trigger on ${c.name}]`, 'Base: 1',
          ...logSteps.map(s => `- ${s}`),
          `Result: +${current} counter`
        ];
        logEvent(triggerLog);
        c.counters += current;
      });
    }

    // Duskshell Crawler trigger
    if (has('crawler')) {
      newList.forEach(c => {
        const { current, logSteps } = applyReplacements(1, selected, nameMap);
        const triggerLog = [`[Crawler Trigger on ${c.name}]`, 'Base: 1',
          ...logSteps.map(s => `- ${s}`),
          `Result: +${current} counter`
        ];
        logEvent(triggerLog);
        c.counters += current;
      });
    }
  };

  // Other handlers
  const updateCounter = (i, d) =>
    setCreatures(prev => prev.map((c, idx) => idx === i ? { ...c, counters: Math.max(0, c.counters + d) } : c));
  const remove = i => setCreatures(prev => prev.filter((_, idx) => idx !== i));
  const clearAll = () => setCreatures([]);
  const clearLog = () => setLog([]);

  const addCreature = () => {
    const name = newName.trim(); if (!name) return;
    const data = creatureData[name.toLowerCase()];
    const base = data ? data.base : [0, 0];
    const amt = applyReplacements(data ? data.counters : parseInt(newCounters) || 0, selected, nameMap).current;
    setCreatures(prev => [...prev, { name, base, counters: amt }]);
    setNewName(''); setNewCounters(0); setSuggestions([]);
  };

  const handleName = e => {
    const v = e.target.value; setNewName(v);
    if (!v) return setSuggestions([]);
    setSuggestions(Object.keys(creatureData).filter(n => n.includes(v.toLowerCase())));
  };
  const choose = n => { setNewName(n); setNewCounters(creatureData[n].counters); setSuggestions([]); };

  return (
    <div style={{ padding: '1rem', background: '#111', color: 'white', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>Counter Tracker</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Left column */}
        <div>
          {['Select Active Cards','Vrestin Entry','Add Creature'].map(title => (
            <Section
              key={title}
              title={title}
              isOpen={sections[title]}
              onToggle={() => setSections(prev => ({ ...prev, [title]: !prev[title] }))}
            >
              {title === 'Select Active Cards' && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {supportCards.map(card => (
                    <div key={card.id} onClick={() => toggleCard(card.id)}
                      style={{ padding: '0.5rem 1rem', background: has(card.id) ? '#4caf50' : '#333', borderRadius: '4px', cursor: 'pointer' }}>
                      {card.name}
                    </div>
                  ))}
                </div>
              )}
              {title === 'Vrestin Entry' && (
                <>
                  <input type='number' placeholder='X value' value={vrestinX}
                    onChange={e => setVrestinX(e.target.value)}
                    style={{ width: '100%', marginBottom: '0.5rem', padding: '0.5rem' }} />
                  <button onClick={calculateETB} style={{ width: '100%', padding: '0.5rem' }}>
                    Summon Vrestin
                  </button>
                </>
              )}
              {title === 'Add Creature' && (
                <>
                  <input type='text' placeholder='Creature Name' value={newName} onChange={handleName}
                    style={{ width: '60%', marginRight: '2%', padding: '0.5rem' }} />
                  <input type='number' placeholder='+1/+1 counters' value={newCounters} onChange={e => setNewCounters(e.target.value)}
                    style={{ width: '35%', padding: '0.5rem' }} />
                  <button onClick={addCreature} style={{ width: '100%', marginTop: '0.5rem', padding: '0.5rem' }}>
                    Add Creature
                  </button>
                  <button onClick={clearAll} style={{ width: '100%', marginTop: '0.3rem', padding: '0.5rem' }}>
                    Clear All Creatures
                  </button>
                </>
              )}
            </Section>
          ))}
        </div>
        {/* Right column */}
        <div>
          {['Creatures','Result Log'].map(title => (
            <Section
              key={title}
              title={title}
              isOpen={sections[title]}
              onToggle={() => setSections(prev => ({ ...prev, [title]: !prev[title] }))}
            >
              {title === 'Creatures' && creatures.map((c, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', background: '#222', padding: '0.5rem', marginBottom: '0.3rem' }}>
                  <span>{c.name}: {c.base[0]}/{c.base[1]} (+{c.counters})</span>
                  <div>
                    <button onClick={() => updateCounter(i, 1)} style={{ marginRight: '0.3rem' }}>+1</button>
                    <button onClick={() => updateCounter(i, -1)} style={{ marginRight: '0.3rem' }}>-1</button>
                    <button onClick={() => remove(i)}>🗑️</button>
                  </div>
                </div>
              ))}
              {title === 'Result Log' && (
                <>
                  <textarea readOnly value={log.join('\n-------------------\n')} style={{ width: '100%', height: '150px', background: '#111', color: 'white', padding: '0.5rem' }} />
                  <button onClick={clearLog} style={{ width: '100%', marginTop: '0.3rem', padding: '0.5rem' }}>
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
