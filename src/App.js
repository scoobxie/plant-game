import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const maxDays = 30;
  
  // Game state
  const [day, setDay] = useState(1);
  const [water, setWater] = useState(10);
  const [nutrients, setNutrients] = useState(10);
  const [energy, setEnergy] = useState(2);
  const [maxEnergy, setMaxEnergy] = useState(2);
  const [mutations, setMutations] = useState([]);
  const [log, setLog] = useState([]);
  const [isNight, setIsNight] = useState(false);
  const [wellRested, setWellRested] = useState(false);
  const [gameView, setGameView] = useState('normal'); // normal, plant-menu, expedition-menu, boss, mutation
  const [bossEvent, setBossEvent] = useState(null);
  const [plant, setPlant] = useState({
    water: 5,
    nutrients: 5,
    health: 10,
    growth: 1,
    dryDays: 0
  });

  // Load game on mount
  useEffect(() => {
    const saved = localStorage.getItem('gardenSave');
    if (saved) {
      const data = JSON.parse(saved);
      setDay(data.day);
      setWater(data.water);
      setNutrients(data.nutrients);
      setEnergy(data.energy);
      setMaxEnergy(data.maxEnergy);
      setMutations(data.mutations);
      setLog([...data.log, '💾 Game loaded from save.']);
      setPlant(data.plant);
      setIsNight(data.isNight);
      setWellRested(data.wellRested);
    }
  }, []);

  // Save game whenever state changes
  useEffect(() => {
    const gameState = {
      day, water, nutrients, energy, maxEnergy,
      mutations, log, plant, isNight, wellRested
    };
    localStorage.setItem('gardenSave', JSON.stringify(gameState));
  }, [day, water, nutrients, energy, maxEnergy, mutations, log, plant, isNight, wellRested]);

  // Well-rested timer
  useEffect(() => {
    if (wellRested) {
      const timer = setTimeout(() => {
        setWellRested(false);
        setMaxEnergy(2);
        setEnergy(e => Math.min(e, 2));
        addLog('☀️ The rested feeling fades.');
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [wellRested]);

  const addLog = (txt) => {
    setLog(prev => [...prev, txt]);
  };

  const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

  const checkPlantDeath = () => {
    if (plant.water <= 0) {
      const newDryDays = plant.dryDays + 1;
      setPlant(p => ({ ...p, dryDays: newDryDays }));
      
      if (newDryDays === 1) {
        addLog('⚠️ The plant is drying out! It may not last another day without water.');
        return false;
      }
      if (newDryDays >= 2) {
        setGameView('dead');
        addLog('💀 The plant has perished from lack of water.');
        return true;
      }
    } else {
      setPlant(p => ({ ...p, dryDays: 0 }));
    }

    if (plant.health <= 0) {
      setGameView('dead');
      addLog('💀 The plant has perished.');
      return true;
    }

    return false;
  };

  const spendEnergy = (cost = 1) => {
    setEnergy(e => {
      const newEnergy = Math.max(0, e - cost);
      if (newEnergy <= 0) {
        addLog('😴 You\'re exhausted. You should sleep to recover.');
      }
      return newEnergy;
    });
  };

  const waterPlant = () => {
    if (energy <= 0) return;
    if (water > 0) {
      setWater(w => w - 1);
      setPlant(p => ({ ...p, water: Math.min(10, p.water + 2) }));
      addLog('💧 You watered the plant.');
    } else {
      addLog('❌ Not enough shared water!');
    }
    spendEnergy();
    setGameView('normal');
  };

  const fertilizePlant = () => {
    if (energy <= 0) return;
    if (nutrients > 0) {
      setNutrients(n => n - 1);
      setPlant(p => ({ ...p, nutrients: Math.min(10, p.nutrients + 2) }));
      addLog('🌱 You fertilized the plant.');
    } else {
      addLog('❌ Not enough nutrients!');
    }
    spendEnergy();
    setGameView('normal');
  };

  const healPlant = () => {
    if (energy <= 0) return;
    setPlant(p => ({ ...p, health: Math.min(10, p.health + 1) }));
    addLog('🌼 You tended the plant. It looks healthier.');
    spendEnergy();
    setGameView('normal');
  };

  const enterNight = () => {
    setIsNight(true);
    setEnergy(Math.ceil(maxEnergy / 2));
    addLog('🌙 Night falls, energy halved.');
  };

  const sleep = () => {
    if (!isNight) {
      enterNight();
      return;
    }

    setIsNight(false);
    const newDay = day + 1;
    setDay(newDay);
    addLog('💤 You rest through the night.');

    let shouldBeWellRested = energy > 0;
    if (shouldBeWellRested) {
      setWellRested(true);
      addLog('✨ You feel well-rested (+1 max energy today).');
      setMaxEnergy(3);
      setEnergy(3);
    } else {
      setEnergy(maxEnergy);
    }

    // Plant passive consumption
    setPlant(p => ({
      ...p,
      water: Math.max(0, p.water - 1),
      nutrients: Math.max(0, p.nutrients - 1),
      growth: p.growth + 1
    }));

    // Check for death after sleep
    setTimeout(() => {
      if (checkPlantDeath()) return;
      if (newDay > maxDays) {
        setGameView('victory');
        addLog('🌸 Victory!');
        localStorage.removeItem('gardenSave');
        return;
      }

      if (newDay % 3 === 0) {
        triggerBossEvent();
      } else if (Math.random() < 0.25) {
        setGameView('mutation');
      } else {
        setGameView('normal');
      }
    }, 100);
  };

  const triggerBossEvent = () => {
    const bosses = [
      { name: 'Drought', effect: 'drought' },
      { name: 'Earthquake', effect: 'earthquake' }
    ];
    const boss = bosses[rand(0, bosses.length - 1)];
    
    if (boss.effect === 'drought') {
      setPlant(p => ({ ...p, water: 0 }));
      setWater(w => Math.max(0, w - rand(1, 3)));
      addLog('☀️ Drought hit! The plant lost all internal water but you endure.');
    } else {
      setPlant(p => ({ ...p, health: Math.max(0, p.health - 2) }));
      addLog('🌋 Earthquake damaged the roots.');
    }

    setBossEvent(boss.name);
    setGameView('boss');
    
    setTimeout(() => {
      if (checkPlantDeath()) return;
    }, 100);
  };

  const afterBoss = () => {
    addLog('You recover from the disaster.');
    setGameView('normal');
  };

  const adoptMutation = (mutation) => {
    setMutations(m => [...m, mutation]);
    addLog(`🧬 Mutation gained: ${mutation}`);
    setGameView('normal');
  };

  const startExpedition = (days) => {
    if (energy < days) {
      addLog('❌ Not enough energy for this expedition!');
      return;
    }

    spendEnergy(days);
    addLog(`🕊️ You leave for ${days} days.`);

    let newDay = day;
    let newPlant = { ...plant };
    
    for (let i = 0; i < days; i++) {
      newDay++;
      newPlant.water = Math.max(0, newPlant.water - 1);
      newPlant.nutrients = Math.max(0, newPlant.nutrients - 1);
    }

    setDay(newDay);
    setPlant(newPlant);

    let wg = 0, ng = 0;
    if (days === 1) {
      wg = rand(1, 4);
      ng = rand(1, 3);
    } else if (days === 2) {
      wg = rand(2, 6);
      ng = rand(2, 5);
    } else {
      wg = rand(3, 10);
      ng = rand(3, 9);
    }

    setWater(w => w + wg);
    setNutrients(n => n + ng);
    addLog(`🧭 Returned with +${wg} water, +${ng} nutrients.`);

    setTimeout(() => {
      if (checkPlantDeath()) return;
      if (newDay % 3 === 0) {
        triggerBossEvent();
      } else {
        setGameView('normal');
      }
    }, 100);
  };

  const restart = () => {
    localStorage.removeItem('gardenSave');
    window.location.reload();
  };

  // Calculate next event
  const getNextEvent = () => {
    const nextBoss = Math.ceil(day / 3) * 3;
    const daysLeft = nextBoss - day;
    const bossList = ['Drought', 'Earthquake'];
    const eventName = bossList[Math.floor((nextBoss / 3) % bossList.length)] || 'Unknown';

    if (isNight || daysLeft < 0) return '';
    if (daysLeft > 0) return `⚠️ ${eventName} in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`;
    return `⚠️ ${eventName} today!`;
  };

  return (
    <div className={isNight ? 'night' : 'day'}>
      <div id="moonlight-overlay"></div>
      <button onClick={restart}>🔄 RESTART</button>
      
      {wellRested && <div id="rested-indicator">✨ Well Rested</div>}
      
      <div id="game">
        <h1 id="title">🌿 Plant Game</h1>
        <div id="next-event">{getNextEvent()}</div>

        <div className="container">
          {/* Left Panel - Stats */}
          <div id="left-panel">
            <h2>Stats</h2>
            <table>
              <tbody>
                <tr><th>🌞 Day</th><td>{day} / {maxDays}</td></tr>
                <tr><th>💧 Water</th><td>{water}</td></tr>
                <tr><th>🌱 Nutrients</th><td>{nutrients}</td></tr>
                <tr><th>⚡ Energy</th><td>{energy} / {maxEnergy}</td></tr>
              </tbody>
            </table>
            <h2>Plant Info</h2>
            <table>
              <tbody>
                <tr><th>🌵 Mutations</th><td>{mutations.join(', ') || 'None'}</td></tr>
                <tr><th>💧 Plant Water</th><td>{plant.water}</td></tr>
                <tr><th>🪴 Plant Nutrients</th><td>{plant.nutrients}</td></tr>
                <tr><th>🌸 Plant Health</th><td>{plant.health}</td></tr>
              </tbody>
            </table>
          </div>

          {/* Center Panel */}
          <div id="center-panel"></div>

          {/* Right Panel - Events & Log */}
          <div id="right-panel">
            <h2>Current Day</h2>
            <div id="current-event">
              {gameView === 'normal' && (
                <>
                  <p>{isNight ? '🌙 Night — limited actions.' : '☀️ Daytime — full energy.'}</p>
                  {energy <= 0 ? (
                    <p>You're too tired to do anything else.</p>
                  ) : (
                    <p>Choose your action:</p>
                  )}
                </>
              )}
              {gameView === 'plant-menu' && <p>Choose how to tend the plant:</p>}
              {gameView === 'expedition-menu' && <p>Choose expedition duration:</p>}
              {gameView === 'boss' && <p><b>Boss Event:</b> {bossEvent}</p>}
              {gameView === 'mutation' && <p>🧬 Mutation appears!</p>}
              {gameView === 'dead' && <p>💀 Your plant has died.</p>}
              {gameView === 'victory' && <p>🌸 The plant bore fruit. You survived 30 days!</p>}
            </div>
            <h2>Daily Log</h2>
            <div id="log">
              {log.map((entry, i) => <div key={i}>{entry}</div>)}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div id="action-bar">
          <div id="choices">
            {gameView === 'normal' && energy <= 0 && (
              <button className="action-btn" onClick={sleep}>
                {isNight ? '🌅 Wake Up' : '🛌 Sleep'}
              </button>
            )}
            
            {gameView === 'normal' && energy > 0 && (
              <>
                <button className="action-btn" onClick={() => setGameView('plant-menu')}>🌿 Tend Plant</button>
                <button className="action-btn" onClick={() => setGameView('expedition-menu')}>🕊️ Expedition</button>
                <button className="action-btn" onClick={sleep}>
                  {isNight ? '🌅 Wake Up' : '🛌 Sleep'}
                </button>
              </>
            )}

            {gameView === 'plant-menu' && (
              <>
                <button className="action-btn" onClick={waterPlant}>💧 Water Plant (-1 Energy)</button>
                <button className="action-btn" onClick={fertilizePlant}>🌱 Fertilize Plant (-1 Energy)</button>
                <button className="action-btn" onClick={healPlant}>🌼 Tend Plant (-1 Energy)</button>
                <button className="action-btn" onClick={() => setGameView('normal')}>Back</button>
              </>
            )}

            {gameView === 'expedition-menu' && (
              <>
                <button className="action-btn" onClick={() => startExpedition(1)}>1 Day (-1 Energy)</button>
                <button className="action-btn" onClick={() => startExpedition(2)}>2 Days (-2 Energy)</button>
                <button className="action-btn" onClick={() => startExpedition(3)}>3 Days (-3 Energy)</button>
                <button className="action-btn" onClick={() => setGameView('normal')}>Cancel</button>
              </>
            )}

            {gameView === 'boss' && (
              <button className="action-btn" onClick={afterBoss}>Continue</button>
            )}

            {gameView === 'mutation' && (
              <>
                <button className="action-btn" onClick={() => adoptMutation('Deep Roots')}>Deep Roots</button>
                <button className="action-btn" onClick={() => adoptMutation('Waxy Leaves')}>Waxy Leaves</button>
                <button className="action-btn" onClick={() => setGameView('normal')}>Skip</button>
              </>
            )}

            {(gameView === 'dead' || gameView === 'victory') && (
              <button onClick={restart}>Restart</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;