import React, { useState, useEffect } from 'react';
import './styles/variables.css';
import './styles/layout.css';
import './styles/themes.css';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

function App() {
  const maxDays = 30;

  // --- 1. STATE: AUTENTIFICARE ---
  const [user, setUser] = useState(null);
  const [viewState, setViewState] = useState('login'); // 'login', 'register', 'game'

  // --- 2. STATE: JOC (Resurse & Timp) ---
  // Inventarul TĂU
  const [water, setWater] = useState(10); 
  const [nutrients, setNutrients] = useState(10);
  
  // Starea PLANTEI
  const [plant, setPlant] = useState({
    water: 5,      
    nutrients: 5,  
    health: 10,    
    growth: 1,
    dryDays: 0
  });

  // Timp și Energie
  const [day, setDay] = useState(1);
  const [timeOfDay, setTimeOfDay] = useState('morning'); 
  const [energy, setEnergy] = useState(3);
  const [maxEnergy, setMaxEnergy] = useState(3);

  // UI și Event-uri
  const [log, setLog] = useState(['🎮 Welcome! Tend to your plant.']);
  const [gameView, setGameView] = useState('normal');
  const [wellRested, setWellRested] = useState(false);
  
  // Boss / Disaster
  const [nextDisasterDay, setNextDisasterDay] = useState(3);
  const [nextDisasterType, setNextDisasterType] = useState('Drought');
  const [bossEvent, setBossEvent] = useState(null);

  // --- EFECTE (Load & Save & Styles) ---

  // Verificăm dacă userul e logat la pornire
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setViewState('game');
      
      // Încărcăm și salvarea jocului dacă există (din localStorage momentan)
      const savedGame = localStorage.getItem('gardenSave');
      if (savedGame) {
        try {
          const data = JSON.parse(savedGame);
          setDay(data.day); setWater(data.water); setNutrients(data.nutrients);
          setEnergy(data.energy); setPlant(data.plant);
          setTimeOfDay(data.timeOfDay);
        } catch(e) { console.error("Corrupted save"); }
      }
    }
  }, []);

  // Salvăm jocul la fiecare modificare
  useEffect(() => {
    if (viewState === 'game') {
      const gameState = { day, water, nutrients, energy, plant, timeOfDay };
      localStorage.setItem('gardenSave', JSON.stringify(gameState));
    }
  }, [day, water, nutrients, energy, plant, timeOfDay, viewState]);

  // Aplicăm tema (Zi/Noapte) pe body
  useEffect(() => {
    document.body.className = ''; 
    if (timeOfDay === 'night') document.body.classList.add('night');
    else if (timeOfDay === 'afternoon') document.body.classList.add('afternoon');
    else document.body.classList.add('day');
  }, [timeOfDay]);

  // --- LOGICĂ JOC ---

  const addLog = (txt) => {
    setLog(prev => [txt, ...prev].slice(0, 50));
  };

  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  // Acțiune: Udă Planta
  const waterPlant = () => {
    if (energy <= 0) { addLog("❌ Too tired!"); return; }
    if (water <= 0) { addLog("❌ No water left! Go on an expedition."); return; }

    setWater(prev => prev - 1);
    setPlant(p => ({ ...p, water: Math.min(10, p.water + 2), dryDays: 0 }));
    setEnergy(prev => prev - 1);
    addLog("💧 Plant watered. (Inv -1, Plant +2)");
    setGameView('normal');
  };

  // Acțiune: Fertilizează
  const fertilizePlant = () => {
    if (energy <= 0) { addLog("❌ Too tired!"); return; }
    if (nutrients <= 0) { addLog("❌ No nutrients! Go on an expedition."); return; }

    setNutrients(prev => prev - 1);
    setPlant(p => ({ ...p, nutrients: Math.min(10, p.nutrients + 2) }));
    setEnergy(prev => prev - 1);
    addLog("🌱 Plant fertilized. (Inv -1, Plant +2)");
    setGameView('normal');
  };

  // Acțiune: Îngrijește (Heal)
  const healPlant = () => {
    if (energy <= 0) { addLog("❌ Too tired!"); return; }
    setPlant(p => ({ ...p, health: Math.min(10, p.health + 1) }));
    setEnergy(prev => prev - 1);
    addLog("🚑 Plant tended. Health +1.");
    setGameView('normal');
  };

  // Acțiune: Expediție (Câștigi resurse)
  const startExpedition = (duration) => {
    if (energy < duration) { addLog("❌ Not enough energy!"); return; }

    const foundWater = rand(1, 3) * duration;
    const foundNutrients = rand(1, 2) * duration;

    setEnergy(prev => prev - duration);
    setWater(prev => prev + foundWater);
    setNutrients(prev => prev + foundNutrients);
    
    // Planta suferă puțin cât ești plecat
    setPlant(p => ({
      ...p,
      water: Math.max(0, p.water - duration),
      nutrients: Math.max(0, p.nutrients - duration)
    }));

    addLog(`🕊️ Expedition: Found ${foundWater} Water, ${foundNutrients} Nutrients.`);
    
    // Trecerea timpului pentru expediții lungi
    if(duration > 1) {
       setDay(prev => prev + duration);
       setTimeOfDay('night'); 
    }
    setGameView('normal');
  };

  // Acțiune: Somn / Trecerea Timpului
  const sleep = () => {
    if (timeOfDay === 'morning') {
      setTimeOfDay('afternoon');
      addLog("🌅 Afternoon approaches.");
    } else if (timeOfDay === 'afternoon') {
      setTimeOfDay('night');
      addLog("🌙 Night falls.");
    } else {
      startNewDay();
    }
  };

  const startNewDay = () => {
    setDay(d => d + 1);
    setTimeOfDay('morning');
    
    // Energie
    if (energy > 0) {
      setWellRested(true);
      setMaxEnergy(3);
      setEnergy(3);
      addLog("✨ Well rested! Max energy restored.");
    } else {
      setWellRested(false);
      setMaxEnergy(2);
      setEnergy(2);
      addLog("💤 A restless night.");
    }

    // Consumul Plantei peste noapte
    setPlant(prev => {
      const consumption = 1;
      const newWater = Math.max(0, prev.water - consumption);
      const newNutrients = Math.max(0, prev.nutrients - consumption);
      const newDryDays = newWater === 0 ? prev.dryDays + 1 : 0;
      
      if (newDryDays >= 2) {
        setGameView('dead');
        addLog("💀 Plant dried out completely.");
      }

      return {
        ...prev,
        water: newWater,
        nutrients: newNutrients,
        growth: prev.growth + 1,
        dryDays: newDryDays
      };
    });

    // Check Disaster
    if (day + 1 === nextDisasterDay) {
        triggerDisaster();
    }
  };

  const triggerDisaster = () => {
      setBossEvent(nextDisasterType);
      setGameView('boss');
      addLog(`⚠️ DISASTER: ${nextDisasterType} has struck!`);
      
      if (nextDisasterType === 'Drought') {
          setPlant(p => ({...p, water: 0}));
          addLog("☀️ The drought evaporated all plant water!");
      } else {
          setPlant(p => ({...p, health: Math.max(0, p.health - 3)}));
          addLog("🌋 Earthquake damaged the roots (-3 Health)!");
      }
  };

  const handleBossContinue = () => {
      setNextDisasterDay(day + rand(4, 7));
      setNextDisasterType(rand(0, 1) === 0 ? 'Drought' : 'Earthquake');
      setGameView('normal');
  };

  const restart = () => {
    localStorage.removeItem('gardenSave');
    window.location.reload();
  };

  // --- RENDERIZARE ---

  if (viewState === 'login') {
    return (
      <div className="auth-wrapper">
        <h1 id="title">🌿 Plant Game</h1>
        <Login 
          switchToRegister={() => setViewState('register')} 
          onLoginSuccess={(u) => { setUser(u); setViewState('game'); }} 
        />
      </div>
    );
  }

  if (viewState === 'register') {
    return (
      <div className="auth-wrapper">
        <h1 id="title">🌿 Plant Game</h1>
        <Register switchToLogin={() => setViewState('login')} />
      </div>
    );
  }

  // JOCUL
  return (
    <>
      <div id="moonlight-overlay"></div>
      
      <button className={`restart-btn`} onClick={() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setViewState('login');
      }} style={{position: 'fixed', top: 10, left: 10, zIndex: 1000}}>
        🚪 LOGOUT
      </button>

      {wellRested && <div id="rested-indicator" style={{
          position: 'fixed', top: 10, right: 10, color: 'gold', fontWeight:'bold', textShadow:'0 0 5px black'
      }}>✨ Well Rested</div>}

      <div id="game">
        <h1 id="title">🌿 Plant Game</h1>
        
        {/* Warning pentru următorul dezastru */}
        <div id="next-event">
            ⚠️ {nextDisasterType} in {nextDisasterDay - day} days
        </div>

        <div className="container">
          {/* STATISTICI (Stânga) */}
          <div id="left-panel">
            <h2>🎒 Your Inventory</h2>
            <table>
              <tbody>
                <tr><th>💧 Water Bucket:</th><td>{water}</td></tr>
                <tr><th>🌱 Nutrient Bag:</th><td>{nutrients}</td></tr>
                <tr><th>⚡ Energy:</th><td>{energy} / {maxEnergy}</td></tr>
                <tr><th>🌞 Day:</th><td>{day} / {maxDays}</td></tr>
              </tbody>
            </table>

            <h2 style={{marginTop: '20px'}}>🪴 Plant Vitality</h2>
            <table>
              <tbody>
                <tr><th>💧 Moisture:</th><td>{plant.water} / 10</td></tr>
                <tr><th>🍞 Fed Level:</th><td>{plant.nutrients} / 10</td></tr>
                <tr><th>❤️ Health:</th><td>{plant.health} / 10</td></tr>
              </tbody>
            </table>
          </div>

          {/* CENTRU (Vizual) */}
          <div id="center-panel">
            <div style={{fontSize: '2rem', marginBottom: '10px'}}>
                {user?.character === 'boy' ? '👦' : '👧'} {user?.username}
            </div>
            <div style={{fontSize: '8rem', transition: '0.5s', filter: `drop-shadow(0 0 10px ${plant.health < 5 ? 'red' : 'green'})`}}>
              {gameView === 'dead' ? '🥀' : (plant.water < 3 ? '🍂' : '🌿')}
            </div>
            <p style={{fontSize: '1.2rem', fontWeight: 'bold', marginTop:'20px'}}>
                {timeOfDay.toUpperCase()}
            </p>
          </div>

          {/* DREAPTA (Log & Acțiuni) */}
          <div id="right-panel">
            <h2>📜 Daily Log</h2>
            <div id="log">
              {log.map((msg, i) => <div key={i} style={{marginBottom:'5px', borderBottom:'1px dashed #ccc'}}>{msg}</div>)}
            </div>

            <div id="action-bar">
              {gameView === 'dead' ? (
                <button className="action-btn" onClick={restart}>💀 RESTART GAME</button>
              ) : gameView === 'boss' ? (
                 <button className="action-btn" onClick={handleBossContinue}>OK, I'll survive!</button> 
              ) : (
                <>
                  {/* BUTOANE PRINCIPALE */}
                  {gameView === 'normal' && (
                    <>
                      <button className="action-btn" onClick={() => setGameView('plant-menu')}>
                        🌿 Tend Plant
                      </button>
                      <button className="action-btn" onClick={() => setGameView('expedition-menu')}>
                        🎒 Expedition
                      </button>
                      <button className="action-btn" onClick={sleep}>
                        {timeOfDay === 'night' ? '💤 Sleep' : 'Dg Pass Time'}
                      </button>
                    </>
                  )}

                  {/* MENIU ÎNGRIJIRE */}
                  {gameView === 'plant-menu' && (
                    <>
                      <button className="action-btn" onClick={waterPlant}>💧 Water (-1)</button>
                      <button className="action-btn" onClick={fertilizePlant}>🌱 Fertilize (-1)</button>
                      <button className="action-btn" onClick={healPlant}>🚑 Heal (-1 E)</button>
                      <button className="action-btn" style={{opacity:0.7}} onClick={() => setGameView('normal')}>🔙 Back</button>
                    </>
                  )}

                  {/* MENIU EXPEDIȚII */}
                  {gameView === 'expedition-menu' && (
                    <>
                      <button className="action-btn" onClick={() => startExpedition(1)}>Trip (1 Day)</button>
                      <button className="action-btn" onClick={() => startExpedition(2)}>Trip (2 Days)</button>
                      <button className="action-btn" style={{opacity:0.7}} onClick={() => setGameView('normal')}>🔙 Back</button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;