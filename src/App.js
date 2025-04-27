import React, { useState } from 'react';
import { auth } from './firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [supportCards, setSupportCards] = useState([
    'Hardened Scales', 'Branching Evolution', 'Kami of Whispered Hopes', 'Innkeeper\'s Talent',
    'Ozolith, the Shattered Spire', 'Conclave Mentor', 'Andúril Equipped',
    'City\'s Blessing (10+ permanents)', 'Good-Fortune Unicorn (ETB trigger)'
  ]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [creatures, setCreatures] = useState([]);
  const [log, setLog] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Login failed. Please check your credentials.');
    }
  };

  const toggleCard = (card) => {
    setSelectedCards(prev =>
      prev.includes(card) ? prev.filter(c => c !== card) : [...prev, card]
    );
  };

  const summonVrestin = (xValue) => {
    const insects = parseInt(xValue, 10) || 0;
    const basePower = 0;
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
    if (selectedCards.includes('Innkeeper\'s Talent')) {
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
    if (selectedCards.includes('City\'s Blessing (10+ permanents)')) {
      counters += insects;
      breakdown.push(`+${insects} from City's Blessing`);
    }
    if (selectedCards.includes('Good-Fortune Unicorn (ETB trigger)')) {
      counters += insects;
      breakdown.push(`+${insects} from Good-Fortune Unicorn`);
    }

    const finalPower = basePower + counters;
    const summary = `Summoned Vrestin with ${insects} Insects (${xValue} X). 
Boosts: ${breakdown.join(', ')}.
Final Power/Toughness: ${finalPower}/${finalPower}`;

    setCreatures([...creatures, { name: `Vrestin (X=${xValue})`, power: finalPower }]);
    setLog(summary);
  };

  const attackAll = () => {
    const attackSummary = creatures.map(c => `${c.name}: ${c.power}/${c.power}`).join(', ');
    setLog(`Attack with: ${attackSummary}`);
  };

  const clearCreatures = () => {
    setCreatures([]);
    setLog('');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <form onSubmit={handleLogin} className="bg-gray-800 p-8 rounded-lg shadow-md text-center">
          <h1 className="text-3xl font-bold mb-4 text-white">MTG Mechanics Master</h1>
          <p className="text-gray-300 mb-6">You bring the deck. We'll handle the rules.<br />Your smart, easy-to-use assistant for decoding the chaos of Magic: The Gathering.</p>
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 mb-4 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 mb-4 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="w-full bg-green-400 hover:bg-green-500 text-black font-bold py-2 px-4 rounded">
            Login
          </button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
          <p className="text-gray-300 mt-4">Don't have an account? <span className="text-green-400">Sign Up</span></p>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-900 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">MTG Mechanics Master</h1>
        <button onClick={() => auth.signOut().then(() => setUser(null))} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Support Cards</h2>
          <div className="flex flex-wrap gap-2 mb-6">
            {supportCards.map((card, index) => (
              <button
                key={index}
                onClick={() => toggleCard(card)}
                className={`px-3 py-1 rounded ${selectedCards.includes(card) ? 'bg-green-500' : 'bg-gray-700'} hover:bg-green-400 transition`}
              >
                {card}
              </button>
            ))}
          </div>

          <h2 className="text-2xl font-bold mb-2">Summon Vrestin</h2>
          <div className="flex gap-2 mb-4">
            <input
              type="number"
              className="p-2 rounded text-black w-full"
              placeholder="Enter X value"
              onKeyDown={(e) => e.key === 'Enter' && summonVrestin(e.target.value)}
            />
            <button onClick={() => summonVrestin(document.querySelector('input[type=number]').value)} className="bg-green-500 hover:bg-green-600 text-black px-4 py-2 rounded">
              Summon
            </button>
          </div>

          <div className="flex gap-2">
            <button onClick={attackAll} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
              Attack with All
            </button>
            <button onClick={clearCreatures} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
              Clear Creatures
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-2">Result Log</h2>
          <textarea
            className="w-full h-96 p-4 rounded bg-gray-800 text-white resize-none"
            value={log}
            readOnly
          />
        </div>
      </div>
    </div>
  );
}

export default App;
