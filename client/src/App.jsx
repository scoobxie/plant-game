import React, { useState, useEffect, useRef } from 'react';
import './game-ui.css';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

function App() {
  const maxDays = 30;

  // --- PLANT TYPES SYSTEM ---
  const plantTypes = {
    cactus: {
      name: 'Cactus',
      emoji: '🌵',
      damageType: 'Pierce',
      maxWater: 5,
      maxNutrients: 15,
      maxHealth: 15,
      startWater: 3,
      startNutrients: 8,
      baseWaterConsumption: 1, // LOW - nu crește
      baseNutrientConsumption: 2,
      overwaterThreshold: 4, // Overwater ușor! (4/5 nu 5/5)
      overfeedThreshold: 15,
      // Special abilities
      waterConsumptionGrowth: false, // NU crește water consumption
      nutrientConsumptionGrowth: 2, // Crește cu +2 (nu +1-2)
      immuneToDrought: true,
      floodDamage: [5, 7], // Extra damage de la flood
      description: 'Desert survivor - immune to drought, hates floods'
    },
    venusFlytrap: {
      name: 'Venus Flytrap',
      emoji: '🪴',
      damageType: 'Bite',
      maxWater: 10,
      maxNutrients: 0,
      maxHealth: 6, // Fragil! (nu 8)
      startWater: 5,
      startNutrients: 0,
      baseWaterConsumption: 2,
      baseNutrientConsumption: 0,
      overwaterThreshold: 8, // Overwater ușor! (8/10 nu 10/10)
      overfeedThreshold: 0,
      // Special abilities
      expeditionWaterBonus: [2, 3], // Extra water în expeditions
      earthquakeDamage: 2, // +2 extra damage
      description: 'Carnivorous - finds extra water, fragile'
    },
    sunflower: {
      name: 'Sunflower',
      emoji: '🌻',
      damageType: 'Beam',
      maxWater: 12,
      maxNutrients: 12,
      maxHealth: 8, // 8 HP (nu 10)
      startWater: 6,
      startNutrients: 6,
      baseWaterConsumption: 2,
      baseNutrientConsumption: 2,
      overwaterThreshold: 12,
      overfeedThreshold: 12,
      // Special abilities
      photosynthesis: 2, // +2 nutrients dimineața
      morningDewChance: 0.3, // 30% chance +1 water
      description: 'Solar powered - photosynthesis & morning dew'
    },
    rose: {
      name: 'Rose',
      emoji: '🌹',
      damageType: 'Pierce',
      maxWater: 10,
      maxNutrients: 15,
      maxHealth: 8,
      startWater: 2, // LOW start (nu 5)
      startNutrients: 4, // LOW start (nu 8)
      baseWaterConsumption: 2,
      baseNutrientConsumption: 3,
      overwaterThreshold: 10,
      overfeedThreshold: 15,
      // Special abilities
      healEnergyCost: 2, // Heal costă 2 energy (thorny!)
      fertilizeCost: 2, // Consumă 2 nutrients (picky eater!)
      immuneToEarthquake: true,
      description: 'Elegant aristocrat - strong roots, thorny care'
    },
    ivy: {
      name: 'Ivy',
      emoji: '🌿',
      damageType: 'Poison',
      maxWater: 8,
      maxNutrients: 10,
      maxHealth: 12,
      startWater: 4,
      startNutrients: 5,
      baseWaterConsumption: 1,
      baseNutrientConsumption: 2,
      overwaterThreshold: 8,
      overfeedThreshold: 10,
      // Special abilities
      allDisastersDamage: 2, // +2 damage de la TOATE dezastrele
      autoHealDays: 3, // +1 HP every 3 days
      healEnergyCost: 3, // Manual heal costă 3 energy
      description: 'Toxic creeper - regenerates, takes extra damage'
    },
    mushroom: {
      name: 'Mushroom',
      emoji: '🍄',
      damageType: 'Fungi',
      maxWater: 20, // MARE! (nu 15)
      maxNutrients: 5,
      maxHealth: 10,
      startWater: 8,
      startNutrients: 3,
      baseWaterConsumption: 5, // MULT! (nu 3)
      baseNutrientConsumption: 1,
      overwaterThreshold: 20,
      overfeedThreshold: 5,
      // Special abilities
      nightEnergyBonus: 2, // +2 extra energy noaptea (total 3)
      description: 'Nocturnal fungi - loves moisture, night energy'
    },
    appleTree: {
      name: 'Apple Tree',
      emoji: '🍎',
      damageType: 'Gravity',
      maxWater: 20,
      maxNutrients: 20,
      maxHealth: 20,
      startWater: 18, // Aproape maxat!
      startNutrients: 18, // Aproape maxat!
      baseWaterConsumption: 4,
      baseNutrientConsumption: 4,
      overwaterThreshold: 20,
      overfeedThreshold: 20,
      // Special abilities
      description: 'Mighty tree - massive tank, huge consumption'
    }
  };

  // Random starter plant - salvat în localStorage pentru consistency
  const [plantType] = useState(() => {
    // Check dacă avem deja un tip salvat
    const savedType = localStorage.getItem('currentPlantType');
    if (savedType && plantTypes[savedType]) {
      return plantTypes[savedType];
    }
    
    // Generează nou plantType random
    const types = Object.keys(plantTypes);
    const randomType = types[Math.floor(Math.random() * types.length)];
    localStorage.setItem('currentPlantType', randomType);
    return plantTypes[randomType];
  });

  // --- 1. STATE: AUTENTIFICARE ---
  const [user, setUser] = useState(null);
  const [viewState, setViewState] = useState('login'); // 'login', 'register', 'game'

  // --- SISTEM FAZĂ LUNARĂ (ciclu de 30 zile) ---
  const moonPhases = [
    { name: 'New Moon', emoji: '🌑', day: 0 },
    { name: 'Waxing Crescent', emoji: '🌒', day: 3 },
    { name: 'First Quarter', emoji: '🌓', day: 7 },
    { name: 'Waxing Gibbous', emoji: '🌔', day: 11 },
    { name: 'Full Moon', emoji: '🌕', day: 15 },
    { name: 'Waning Gibbous', emoji: '🌖', day: 19 },
    { name: 'Last Quarter', emoji: '🌗', day: 23 },
    { name: 'Waning Crescent', emoji: '🌘', day: 27 }
  ];
  
  // Offset aleatoriu pentru ziua de început (0-29) pentru varietate în faza lunară
  // Salvat în localStorage pentru a persista între refresh-uri
  const [moonDayOffset] = useState(() => {
    const saved = localStorage.getItem('moonDayOffset');
    if (saved) return parseInt(saved);
    const newOffset = Math.floor(Math.random() * 30);
    localStorage.setItem('moonDayOffset', newOffset.toString());
    return newOffset;
  });
  
  const getMoonPhase = (dayNumber) => {
    const cycleDay = ((dayNumber - 1) + moonDayOffset) % 30; // 0-29
    for (let i = moonPhases.length - 1; i >= 0; i--) {
      if (cycleDay >= moonPhases[i].day) {
        return moonPhases[i];
      }
    }
    return moonPhases[0];
  };

  // --- WEATHER SYSTEM pentru Calendar Display ---
  const weatherTypes = {
    sunny: { name: 'Sunny', emoji: '☀️' },
    overcast: { name: 'Overcast', emoji: '☁️' },
    rainy: { name: 'Rainy', emoji: '🌧️' },
    snowy: { name: 'Snowy', emoji: '❄️' },
    thunderstorm: { name: 'Thunderstorm', emoji: '⛈️' }
  };
  
  // Generează weather pentru fiecare zi cu SEASONAL SYSTEM (persistat în localStorage)
  const [weatherCalendar] = useState(() => {
    const saved = localStorage.getItem('weatherCalendar');
    if (saved) return JSON.parse(saved);
    
    // === SEASONAL CONFIGURATIONS ===
    const seasonConfigs = [
      // Config 1: Summer → Autumn → Winter → Spring
      {
        name: 'SAWS',
        seasons: [
          { name: 'summer', start: 1, end: 7 },
          { name: 'autumn', start: 8, end: 15 },
          { name: 'winter', start: 16, end: 25 },  // +3 zile
          { name: 'spring', start: 26, end: 30 }   // -3 zile (shortened)
        ]
      },
      // Config 2: Autumn → Winter → Spring → Summer
      {
        name: 'AWSS',
        seasons: [
          { name: 'autumn', start: 1, end: 8 },
          { name: 'winter', start: 9, end: 18 },   // +3 zile
          { name: 'spring', start: 19, end: 23 },  // -3 zile
          { name: 'summer', start: 24, end: 30 }
        ]
      },
      // Config 3: Winter → Spring → Summer → Autumn
      {
        name: 'WSSA',
        seasons: [
          { name: 'winter', start: 1, end: 10 },   // +3 zile
          { name: 'spring', start: 11, end: 15 },  // -3 zile
          { name: 'summer', start: 16, end: 23 },
          { name: 'autumn', start: 24, end: 30 }
        ]
      }
    ];
    
    // Random pick configuration
    const config = seasonConfigs[Math.floor(Math.random() * 3)];
    console.log(`🌍 Season Config: ${config.name}`);
    
    // Save config to localStorage
    localStorage.setItem('seasonConfig', JSON.stringify(config));
    
    // Weather probabilities per season
    const seasonWeather = {
      summer: [
        { type: 'sunny', prob: 0.70 },
        { type: 'overcast', prob: 0.20 },
        { type: 'rainy', prob: 0.10 }
      ],
      autumn: [
        { type: 'overcast', prob: 0.40 },
        { type: 'rainy', prob: 0.30 },
        { type: 'sunny', prob: 0.20 },
        { type: 'thunderstorm', prob: 0.10 }
      ],
      winter: [
        { type: 'snowy', prob: 0.50 },
        { type: 'overcast', prob: 0.30 },
        { type: 'rainy', prob: 0.15 },
        { type: 'thunderstorm', prob: 0.05 }
      ],
      spring: [
        { type: 'rainy', prob: 0.40 },
        { type: 'sunny', prob: 0.40 },
        { type: 'overcast', prob: 0.15 },
        { type: 'thunderstorm', prob: 0.05 }
      ]
    };
    
    // Helper: pick weather based on probabilities
    const pickWeather = (weatherProbs) => {
      const rand = Math.random();
      let cumulative = 0;
      for (const { type, prob } of weatherProbs) {
        cumulative += prob;
        if (rand < cumulative) return type;
      }
      return weatherProbs[0].type; // fallback
    };
    
    // Generate calendar based on seasons
    const calendar = {};
    for (let day = 1; day <= 30; day++) {
      // Find which season this day belongs to
      const season = config.seasons.find(s => day >= s.start && day <= s.end);
      const weatherProbs = seasonWeather[season.name];
      calendar[day] = pickWeather(weatherProbs);
    }
    
    localStorage.setItem('weatherCalendar', JSON.stringify(calendar));
    return calendar;
  });

  // --- 2. STATE: JOC (Resurse & Timp) ---
  // Inventarul TĂU
  const [water, setWater] = useState(10); 
  const [nutrients, setNutrients] = useState(10);
  
  // Starea PLANTEI - bazat pe tipul de plantă (folosește callback pentru timing corect)
  const [plant, setPlant] = useState(() => ({
    water: plantType.startWater,      
    nutrients: plantType.startNutrients,  
    health: plantType.maxHealth,    
    growth: 1,
    dryDays: 0,
    overwateredDays: 0,  // Debuff pentru overwatering
    damagedRootsDays: 0  // Debuff pentru Landslide
  }));

  // Timp și Energie
  const [day, setDay] = useState(1);
  const [timeOfDay, setTimeOfDay] = useState('morning'); 
  const [energy, setEnergy] = useState(2); // START WITH 2
  const [maxEnergy, setMaxEnergy] = useState(2);
  
  // Current weather pentru ziua curentă (după day e definit)
  const [currentWeather, setCurrentWeather] = useState(() => weatherCalendar[1] || 'sunny');
  const currentWeatherData = weatherTypes[currentWeather];
  
  // Helper: get current season based on day
  const getCurrentSeason = () => {
    const savedConfig = localStorage.getItem('seasonConfig');
    if (!savedConfig) return { name: 'summer', emoji: '☀️' };
    
    const config = JSON.parse(savedConfig);
    const currentSeason = config.seasons.find(s => day >= s.start && day <= s.end);
    
    const seasonEmojis = {
      summer: '☀️',
      autumn: '🍂',
      winter: '❄️',
      spring: '🌸'
    };
    
    const seasonNames = {
      summer: 'Summer',
      autumn: 'Autumn',
      winter: 'Winter',
      spring: 'Spring'
    };
    
    return {
      name: seasonNames[currentSeason?.name] || 'Summer',
      emoji: seasonEmojis[currentSeason?.name] || '☀️'
    };
  };
  
  // Helper: get energy cost (Overcast = 2x cost)
  const getEnergyCost = (baseAmount = 1) => {
    if (currentWeather === 'overcast') {
      return baseAmount * 2;
    }
    return baseAmount;
  };
  
  const currentSeason = getCurrentSeason();

  // UI și Event-uri
  const [log, setLog] = useState(['🎮 Welcome! Tend to your plant.']);
  const [gameView, setGameView] = useState('normal');
  const [moonCalendarExpanded, setMoonCalendarExpanded] = useState(false);
  const [plantInfoExpanded, setPlantInfoExpanded] = useState(false);
  const [wellRested, setWellRested] = useState(false);
  
  // Run Stats pentru Victory Screen
  const [runStats, setRunStats] = useState({
    disastersSurvived: 0,
    watersUsed: 0,
    nutrientsUsed: 0,
    expeditionsCompleted: 0,
    healingsDone: 0
  });
  
  // Boss / Dezastru - generează toate dezastrele pentru 30 zile
  const [disasters, setDisasters] = useState(() => {
    // Helper function pentru random
    const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    
    // Helper function: returnează dezastrele valide pentru un weather
    const getValidDisastersForWeather = (weather) => {
      const allDisasters = {
        // FLOOD: doar când plouă/ninge/thunderstorm
        flood: ['rainy', 'snowy', 'thunderstorm'],
        // DROUGHT: doar când e sunny/overcast
        drought: ['sunny', 'overcast'],
        // EARTHQUAKE: oricând
        earthquake: ['sunny', 'overcast', 'rainy', 'snowy', 'thunderstorm'],
        // LANDSLIDE: oricând
        landslide: ['sunny', 'overcast', 'rainy', 'snowy', 'thunderstorm']
      };
      
      const valid = [];
      if (allDisasters.flood.includes(weather)) valid.push('Flood');
      if (allDisasters.drought.includes(weather)) valid.push('Drought');
      if (allDisasters.earthquake.includes(weather)) valid.push('Earthquake');
      if (allDisasters.landslide.includes(weather)) valid.push('Landslide');
      
      return valid;
    };
    
    const disasterList = [];
    
    // Primul dezastru MEREU la ziua 3
    const day3Weather = weatherCalendar[3] || 'sunny';
    const validDisastersDay3 = getValidDisastersForWeather(day3Weather);
    if (validDisastersDay3.length > 0) {
      disasterList.push({
        day: 3,
        type: validDisastersDay3[randInt(0, validDisastersDay3.length - 1)]
      });
    }
    
    // Pentru zilele 4-30: 25% șansă de dezastru în fiecare zi
    for (let currentDay = 4; currentDay <= 30; currentDay++) {
      if (Math.random() < 0.25) { // 25% șansă
        const dayWeather = weatherCalendar[currentDay] || 'sunny';
        const validDisasters = getValidDisastersForWeather(dayWeather);
        
        if (validDisasters.length > 0) {
          disasterList.push({
            day: currentDay,
            type: validDisasters[randInt(0, validDisasters.length - 1)]
          });
        }
      }
    }
    
    return disasterList; // Deja sortate crescător
  });
  
  const [nextDisasterDay, setNextDisasterDay] = useState(999);
  const [nextDisasterType, setNextDisasterType] = useState('Drought');
  
  // Sincronizează nextDisasterDay cu lista de disasters la montare
  useEffect(() => {
    if (disasters.length > 0) {
      setNextDisasterDay(disasters[0].day);
      setNextDisasterType(disasters[0].type);
      console.log('Initialized disasters:', disasters);
    }
  }, []); // Run doar o dată la mount
  
  // Update currentWeather când day se schimbă
  useEffect(() => {
    const newWeather = weatherCalendar[day] || 'sunny';
    setCurrentWeather(newWeather);
  }, [day, weatherCalendar]);
  
  const [currentDisasterType, setCurrentDisasterType] = useState('Drought'); // Ce se întâmplă ACUM
  const [bossEvent, setBossEvent] = useState(null);
  const [nightActionTaken, setNightActionTaken] = useState(false);
  const disasterTriggeredRef = useRef(false); // Folosește ref pentru verificare sincronă
  
  // Scalare dificultate - inițializat cu base consumption din plantType
  const [plantConsumptionRate, setPlantConsumptionRate] = useState(1); // For display only
  const [waterConsumptionRate, setWaterConsumptionRate] = useState(plantType.baseWaterConsumption);
  const [nutrientConsumptionRate, setNutrientConsumptionRate] = useState(plantType.baseNutrientConsumption);
  const [difficultyLevel, setDifficultyLevel] = useState(1);
  
  // Vedere calendar - derulează pe măsură ce zilele trec
  // LOGICĂ NOUĂ: Săgeata se mișcă la ziua curentă, nu track-ul
  const [calendarScrollPosition, setCalendarScrollPosition] = useState(0);
  
  // Mini-meniu pentru butoane
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Bug 4 FIX: Sincronizează săgeata cu ziua curentă (pentru expediții)
  useEffect(() => {
    setCalendarScrollPosition(day - 1);
  }, [day]);
  
  // Notifications and feedback
  const [notification, setNotification] = useState(null);
  const [screenShake, setScreenShake] = useState(false);
  const [timeTransition, setTimeTransition] = useState(null); // For big time cards
  const [floatingNumbers, setFloatingNumbers] = useState([]); // For damage/heal numbers

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
          setDay(data.day); 
          setWater(data.water); 
          setNutrients(data.nutrients);
          setEnergy(data.energy); 
          setPlant(data.plant);
          setTimeOfDay(data.timeOfDay);
          setPlantConsumptionRate(data.plantConsumptionRate || 1);
          setDifficultyLevel(data.difficultyLevel || 1);
        } catch(e) { console.error("Corrupted save"); }
      }
    }
  }, []);

  // Salvăm jocul la fiecare modificare
  useEffect(() => {
    if (viewState === 'game') {
      const gameState = { 
        day, water, nutrients, energy, plant, timeOfDay,
        plantConsumptionRate, difficultyLevel 
      };
      localStorage.setItem('gardenSave', JSON.stringify(gameState));
    }
  }, [day, water, nutrients, energy, plant, timeOfDay, viewState, plantConsumptionRate, difficultyLevel]);

  // Aplicăm tema (Zi/Noapte) pe body
  useEffect(() => {
    document.body.className = ''; 
    if (timeOfDay === 'night') document.body.classList.add('night');
    else if (timeOfDay === 'afternoon') document.body.classList.add('afternoon');
    else document.body.classList.add('day');
  }, [timeOfDay]);

  // --- LOGICĂ JOC ---

  // Sound effects using Web Audio API
  const playSound = (type) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch(type) {
      case 'water':
        oscillator.frequency.value = 400;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
        break;
      case 'success':
        oscillator.frequency.value = 600;
        oscillator.type = 'square';
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
        break;
      case 'warning':
        oscillator.frequency.value = 200;
        oscillator.type = 'sawtooth';
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
        break;
      case 'disaster':
        oscillator.frequency.value = 100;
        oscillator.type = 'sawtooth';
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 1);
        break;
      case 'error':
        oscillator.frequency.value = 150;
        oscillator.type = 'square';
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
        break;
    }
  };

  // Show notification popup
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Show big time transition card
  const showTimeTransition = (timeLabel, emoji, isDisaster = false) => {
    // Don't show transition if it's a disaster - let disaster effects play first
    if (isDisaster) return;
    
    setTimeTransition({ timeLabel, emoji });
    setTimeout(() => setTimeTransition(null), 1200); // Faster - 1.2 seconds total
  };

  // Add floating number effect
  const addFloatingNumber = (value, type, position = 'center') => {
    const id = Date.now() + Math.random();
    setFloatingNumbers(prev => [...prev, { id, value, type, position }]);
    setTimeout(() => {
      setFloatingNumbers(prev => prev.filter(num => num.id !== id));
    }, 2000);
  };

  const addLog = (txt) => {
    setLog(prev => {
      const newLog = [txt, ...prev].slice(0, 50);
      setTimeout(() => {
        const logBox = document.getElementById('log');
        if (logBox) {
          logBox.scrollTop = 0;
        }
      }, 0);
      return newLog;
    });
  };

  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  // Acțiune: Udă Planta
  const waterPlant = () => {
    const energyCost = getEnergyCost(1);
    
    if (energy < energyCost) { 
      addLog(`❌ Too tired! ${currentWeather === 'overcast' ? '(Overcast: 2x energy)' : ''}`); 
      playSound('error');
      showNotification(currentWeather === 'overcast' ? "Need 2 energy! (Overcast)" : "No energy left!", "error");
      setGameView('normal');
      return; 
    }
    if (water <= 0) { 
      addLog("❌ No water left! Go on an expedition."); 
      playSound('error');
      showNotification("Out of water!", "error");
      return; 
    }

    setWater(prev => prev - 1);
    addFloatingNumber('-1 💧', 'damage', 'water'); // Inventar pierde apă
    setRunStats(s => ({ ...s, watersUsed: s.watersUsed + 1 })); // Track stat
    
    // Check dacă planta e deja la max water (overwatering!) - bazat pe tip
    if (plant.water >= plantType.overwaterThreshold) {
      // OVERWATERING! Root suffocation + debuff
      setPlant(p => ({ 
        ...p, 
        water: plantType.maxWater, // Rămâne la max
        health: Math.max(0, p.health - 1), // -1 HP instant (root suffocation)
        overwateredDays: 2, // Debuff 2 zile
        dryDays: 0 
      }));
      addLog("⚠️ OVERWATERED! Root suffocation: -1 HP. Debuff applied for 2 days.");
      playSound('error');
      showNotification("OVERWATERED! -1 HP", "disaster");
      addFloatingNumber('-1 ❤️', 'damage', 'plant-health');
      addFloatingNumber('☔ Overwatered!', 'damage', 'center');
    } else {
      // Normal watering
      setPlant(p => ({ ...p, water: Math.min(plantType.maxWater, p.water + 2), dryDays: 0 }));
      addLog("💧 Plant watered. (Inv -1, Plant +2)");
      playSound('water');
      showNotification("+2 Plant Water", "success");
      addFloatingNumber('+2 💧', 'heal', 'plant-water'); // Planta primește apă
    }
    
    setEnergy(prev => {
      const newEnergy = prev - energyCost;
      if (newEnergy <= 0) {
        setGameView('normal');
      }
      return newEnergy;
    });
    
    // Dacă e noapte, marchează acțiunea ca făcută și închide meniul
    if (timeOfDay === 'night') {
      setGameView('normal');
    }
    // Ziua nu închide meniul - userul poate să continue sau să dea Back
  };

  // Acțiune: Fertilizează
  const fertilizePlant = () => {
    const fertilizeCost = plantType.fertilizeCost || 1; // Default 1, Rose 2
    
    if (energy <= 0) { 
      addLog("❌ Too tired!"); 
      playSound('error');
      showNotification("No energy left!", "error");
      setGameView('normal');
      return; 
    }
    
    // Venus Flytrap nu are nevoie de nutrients!
    if (plantType.maxNutrients === 0) {
      addLog(`❌ ${plantType.name} doesn't need nutrients! It's carnivorous!`);
      playSound('error');
      showNotification("Carnivorous plant!", "error");
      return;
    }
    
    if (nutrients < fertilizeCost) { 
      addLog(`❌ No nutrients! Need ${fertilizeCost} nutrients.`); 
      playSound('error');
      showNotification(`Need ${fertilizeCost} nutrients!`, "error");
      return; 
    }
    setRunStats(s => ({ ...s, nutrientsUsed: s.nutrientsUsed + 1 })); // Track stat

    setNutrients(prev => prev - fertilizeCost);
    addFloatingNumber(`-${fertilizeCost} 🌱`, 'damage', 'nutrients'); // Inventar pierde nutrienți
    
    // Check dacă planta e deja la max nutrients (overfeed!) - bazat pe tip
    if (plant.nutrients >= plantType.overfeedThreshold) {
      // OVERFEED! Nutrient burn - damage
      setPlant(p => ({ 
        ...p, 
        nutrients: plantType.maxNutrients, // Rămâne la max
        health: Math.max(0, p.health - 1) // -1 HP instant (nutrient burn)
      }));
      addLog("⚠️ OVERFED! Nutrient burn: -1 HP. Plant can't absorb more!");
      playSound('error');
      showNotification("OVERFED! -1 HP", "disaster");
      addFloatingNumber('-1 ❤️', 'damage', 'plant-health');
      addFloatingNumber('🔥 Nutrient Burn!', 'damage', 'center');
    } else {
      // Normal feeding
      setPlant(p => ({ ...p, nutrients: Math.min(plantType.maxNutrients, p.nutrients + 2) }));
      addLog(`🌱 Plant fertilized. (Inv -${fertilizeCost}, Plant +2)`);
      playSound('success');
      showNotification("+2 Plant Nutrients", "success");
      addFloatingNumber('+2 🌱', 'heal', 'plant-nutrients'); // Planta primește nutrienți
    }
    
    setEnergy(prev => {
      const newEnergy = prev - 1;
      if (newEnergy <= 0) {
        setGameView('normal');
      }
      return newEnergy;
    });
    
    // Dacă e noapte, marchează acțiunea ca făcută și închide meniul
    if (timeOfDay === 'night') {
      setGameView('normal');
    }
    // Ziua nu închide meniul - userul poate să continue sau să dea Back
  };

  // Acțiune: Îngrijește (Heal)
  const healPlant = () => {
    const healCost = plantType.healEnergyCost || 1; // Default 1, Rose 2, Ivy 3
    
    if (energy < healCost) { 
      addLog(`❌ Too tired! Need ${healCost} energy.`); 
      playSound('error');
      showNotification(`Need ${healCost} energy!`, "error");
      setGameView('normal');
      return; 
    }
    if (plant.health >= plantType.maxHealth) {
      addLog("❌ Plant is already at full health!");
      playSound('error');
      showNotification("Plant is already healthy!", "error");
      return;
    }
    setPlant(p => ({ ...p, health: Math.min(plantType.maxHealth, p.health + 1) }));
    setEnergy(prev => {
      const newEnergy = prev - healCost;
    setRunStats(s => ({ ...s, healingsDone: s.healingsDone + 1 })); // Track stat
      if (newEnergy <= 0) {
        setGameView('normal');
      }
      return newEnergy;
    });
    addLog(`🚑 Plant tended. Health +1. (-${healCost} energy)`);
    playSound('success');
    showNotification("+1 Plant Health", "success");
    addFloatingNumber('+1 ❤️', 'heal', 'plant-health');
    
    // Dacă e noapte, marchează acțiunea ca făcută și închide meniul
    if (timeOfDay === 'night') {
      setGameView('normal');
    }
    // Ziua nu închide meniul - userul poate să continue sau să dea Back
  };

  // Acțiune: Expediție (Câștigi resurse)
  const startExpedition = (duration) => {
    const energyCost = duration === 1 ? 2 : (duration === 2 ? 3 : 4);
    
    if (energy < energyCost) { 
      addLog(`❌ Not enough energy! Need ${energyCost} energy.`); 
      return; 
    }

    setGameView('expedition');
    setEnergy(prev => prev - energyCost);

    // Flag to prevent double disaster trigger - using closure
    let disasterAlreadyTriggered = false;

    setTimeout(() => {
      let foundWater = rand(1, 3) * duration;
      const foundNutrients = rand(1, 2) * duration;
      
      // Venus Flytrap bonus: +2-3 extra water
      if (plantType.expeditionWaterBonus) {
        const bonus = rand(plantType.expeditionWaterBonus[0], plantType.expeditionWaterBonus[1]);
        foundWater += bonus;
        addLog(`🪴 Carnivorous bonus: Found +${bonus} extra water!`);
      }

      setWater(prev => prev + foundWater);
      setNutrients(prev => prev + foundNutrients);
      
      // Plant suffers during expedition - ONLY consumption, no day advancement
      setPlant(p => ({
        ...p,
        water: Math.max(0, p.water - (duration * waterConsumptionRate)),
        nutrients: Math.max(0, p.nutrients - (duration * nutrientConsumptionRate))
      }));

      addLog(`🕊️ Expedition complete: Found ${foundWater} Water, ${foundNutrients} Nutrients.`);
      playSound('success');
      showNotification(`+${foundWater} Water, +${foundNutrients} Nutrients`, "success");
      
      // For multi-day expeditions, advance time and CHECK FOR DISASTERS
      if(duration > 1) {
    setRunStats(s => ({ ...s, expeditionsCompleted: s.expeditionsCompleted + 1 })); // Track stat
         const daysAdvanced = duration - 1;
         
         // Verifică TOATE dezastrele din lista pe zilele parcurse
         const disastersToTrigger = [];
         for (let i = 1; i <= daysAdvanced; i++) {
           const dayToCheck = day + i;
           const disasterOnDay = disasters.find(d => d.day === dayToCheck);
           if (disasterOnDay && !disasterAlreadyTriggered) {
             disastersToTrigger.push(disasterOnDay);
             disasterAlreadyTriggered = true; // Doar primul dezastru
             break;
           }
         }
         
         // Update day
         setDay(prev => {
           const newDay = prev + daysAdvanced;
           // Bug 4 FIX: Actualizează poziția săgeții când ziua se schimbă
           setCalendarScrollPosition(newDay - 1);
           return newDay;
         });
         setTimeOfDay('night');
         const nightEnergy = 1 + (plantType.nightEnergyBonus || 0); // Mushroom: +2 extra
         setEnergy(nightEnergy);
         
         // Trigger disaster AFTER state updates are queued
         if (disastersToTrigger.length > 0) {
           setTimeout(() => {
             triggerDisaster(disastersToTrigger[0].day);
           }, 100);
         }
      }
      setGameView('normal');
    }, 2000);
  };

  // Acțiune: Somn / Trecerea Timpului
  const sleep = () => {
    if (timeOfDay === 'morning') {
      setTimeOfDay('afternoon');
      showTimeTransition('AFTERNOON', '🌅');
      playSound('success');
      addLog("🌅 Afternoon approaches.");
    } else if (timeOfDay === 'afternoon') {
      const nightEnergy = 1 + (plantType.nightEnergyBonus || 0); // Mushroom: +2 extra (total 3)
      setTimeOfDay('night');
      setEnergy(nightEnergy);
      showTimeTransition('NIGHT', '🌙');
      playSound('success');
      
      if (plantType.nightEnergyBonus) {
        addLog(`🌙 Night falls. You recover ${nightEnergy} energy (🍄 Nocturnal bonus!)`);
        showNotification(`+${nightEnergy} Energy (Nocturnal!)`, "success");
      } else {
        addLog(`🌙 Night falls. You recover ${nightEnergy} energy.`);
      }
    } else {
      startNewDay();
    }
  };

  const startNewDay = () => {
    const newDay = day + 1;
    
    // VICTORY CHECK - Day 30 completed!
    if (newDay > 30) {
      setGameView('victory');
      playSound('success');
      return;
    }
    
    setTimeOfDay('morning');
    
    // 🌻 SUNFLOWER ABILITIES - Morning bonuses
    if (plantType.photosynthesis) {
      setPlant(p => ({ 
        ...p, 
        nutrients: Math.min(plantType.maxNutrients, p.nutrients + plantType.photosynthesis) 
      }));
      addLog(`🌻 Photosynthesis: +${plantType.photosynthesis} nutrients!`);
      showNotification(`Photosynthesis +${plantType.photosynthesis} 🌱`, "success");
      addFloatingNumber(`+${plantType.photosynthesis} 🌱`, 'heal', 'plant-nutrients');
    }
    
    if (plantType.morningDewChance && Math.random() < plantType.morningDewChance) {
      setPlant(p => ({ 
        ...p, 
        water: Math.min(plantType.maxWater, p.water + 1) 
      }));
      addLog(`💧 Morning Dew collected: +1 water!`);
      showNotification("Morning Dew +1 💧", "success");
      addFloatingNumber('+1 💧', 'heal', 'plant-water');
    }
    
    // ===== WEATHER EFFECTS =====
    const nextDayWeather = weatherCalendar[newDay] || 'sunny';
    
    // ☀️ SUNNY: +2 nutrients la plantă
    if (nextDayWeather === 'sunny') {
      setPlant(p => ({ 
        ...p, 
        nutrients: Math.min(plantType.maxNutrients, p.nutrients + 2) 
      }));
      addLog(`☀️ Sunny day! Photosynthesis: +2 nutrients!`);
      showNotification("Sunny! +2 🌱", "success");
      addFloatingNumber('+2 🌱', 'heal', 'plant-nutrients');
    }
    
    // 🌧️ RAINY: Umple water bar complet, no overwater damage
    if (nextDayWeather === 'rainy') {
      setPlant(p => ({ 
        ...p, 
        water: plantType.maxWater,
        overwateredDays: 0 // Clear overwater debuff!
      }));
      addLog(`🌧️ Rain! Plant water filled to max!`);
      showNotification("Rain filled water! 💧", "success");
      addFloatingNumber('🌧️ Max Water!', 'heal', 'plant-water');
    }
    
    // ❄️ SNOWY: FREEZE - 0 consumption today (except nutrients can still grow from sunny bonuses)
    // This is handled in sleep() function with a flag
    
    // ⛈️ THUNDERSTORM: Locked inside (doar Sleep), +2 water la plantă
    if (nextDayWeather === 'thunderstorm') {
      setPlant(p => ({ 
        ...p, 
        water: Math.min(plantType.maxWater, p.water + 2)
      }));
      addLog(`⛈️ Thunderstorm! Heavy rain: +2 water!`);
      showNotification("Thunderstorm! +2 💧", "success");
      addFloatingNumber('+2 💧', 'heal', 'plant-water');
    }
    
    // Check if disaster day - don't show transition card if so
    const isDisasterDay = newDay === nextDisasterDay;
    
    // Show big NEW DAY transition (unless it's a disaster day)
    if (!isDisasterDay) {
      showTimeTransition(`DAY ${newDay}`, '☀️');
      playSound('success');
      
      // DUPĂ tranziție (1.2s), mută săgeata
      setTimeout(() => {
        setCalendarScrollPosition(newDay - 1);
        // DUPĂ animația săgeții (1s), setează ziua (highlight apare)
        setTimeout(() => {
          setDay(newDay);
        }, 1000);
      }, 1200);
    } else {
      // Dacă e zi de dezastru, mută săgeata imediat
      setCalendarScrollPosition(newDay - 1);
      // După animația săgeții, setează ziua
      setTimeout(() => {
        setDay(newDay);
      }, 1000);
    }
    
    // Progressive difficulty scaling - SEPARATE consumption
    // Every 7 days, 50% chance to increase EITHER water OR nutrient consumption
    if (newDay % 7 === 0 && Math.random() < 0.5) {
      const increaseWater = Math.random() < 0.5;
      
      if (increaseWater && waterConsumptionRate < 4) {
        const newRate = waterConsumptionRate + rand(1, 2);
        setWaterConsumptionRate(Math.min(newRate, 4));
        addLog(`💧 Climate dries! Water consumption: ${Math.min(newRate, 4)} per night.`);
        playSound('warning');
        showNotification(`Water consumption increased!`, "warning");
      } else if (!increaseWater && nutrientConsumptionRate < 4) {
        const newRate = nutrientConsumptionRate + rand(1, 2);
        setNutrientConsumptionRate(Math.min(newRate, 4));
        addLog(`🌱 Soil depletes! Nutrient consumption: ${Math.min(newRate, 4)} per night.`);
        playSound('warning');
        showNotification(`Nutrient consumption increased!`, "warning");
      }
    }
    
    // Random difficulty spike (15% chance after day 10, capped at 5)
    if (newDay > 10 && Math.random() < 0.15 && difficultyLevel < 5) {
      setDifficultyLevel(prev => {
        const newLevel = prev + 1;
        addLog(`🌪️ Environmental stress increases! (Difficulty: ${newLevel})`);
        return newLevel;
      });
    }
    
    // Well-rested buff: If you slept early (with energy left), get +1 max energy
    if (energy > 0) {
      setWellRested(true);
      setMaxEnergy(3);
      setEnergy(3);
      addLog("✨ Well rested! Max energy: 3 (can do 3-day expedition)");
      // Buff lasts the entire day - don't remove it with setTimeout
    } else {
      setWellRested(false);
      setMaxEnergy(2);
      setEnergy(2);
      addLog("💤 A restless night. Max energy: 2");
    }

    // Plant consumption - SEPARATE rates
    addLog(`🌙 Night passed. Plant consumed ${waterConsumptionRate} water & ${nutrientConsumptionRate} nutrients.`);
    
    setPlant(prev => {
      // Damaged Roots debuff: +1 nutrient consumption
      const extraNutrientConsumption = prev.damagedRootsDays > 0 ? 1 : 0;
      const totalNutrientConsumption = nutrientConsumptionRate + extraNutrientConsumption;
      
      if (extraNutrientConsumption > 0) {
        addLog(`🪨 Damaged Roots: Plant consumed +${extraNutrientConsumption} extra nutrients.`);
      }
      
      // ❄️ SNOWY: FREEZE - 0 consumption!
      let actualWaterConsumption = waterConsumptionRate;
      let actualNutrientConsumption = totalNutrientConsumption;
      
      if (currentWeather === 'snowy') {
        actualWaterConsumption = 0;
        actualNutrientConsumption = 0;
        addLog(`❄️ Snowy day! Plant metabolism frozen - no consumption!`);
        showNotification("Frozen! No consumption", "success");
      }
      
      const newWater = Math.max(0, prev.water - actualWaterConsumption);
      const newNutrients = Math.max(0, prev.nutrients - actualNutrientConsumption);
      const newDryDays = newWater === 0 ? prev.dryDays + 1 : 0;
      
      // Health degradation if nutrients are low
      let newHealth = prev.health;
      if (prev.nutrients < 3) {
        newHealth = Math.max(0, prev.health - 1);
        if (newHealth < prev.health) {
          addLog("⚠️ Plant is malnourished! Health decreased.");
        }
      }
      
      // 🌿 IVY AUTO-HEAL: +1 HP every 3 days
      if (plantType.autoHealDays && newDay % plantType.autoHealDays === 0 && newHealth < plantType.maxHealth) {
        newHealth = Math.min(plantType.maxHealth, newHealth + 1);
        addLog("🌿 Ivy regenerates! +1 HP (auto-heal)");
        showNotification("Ivy Regeneration +1 HP", "success");
        addFloatingNumber('+1 ❤️', 'heal', 'plant-health');
      }
      
      // OVERWATERED DEBUFF: damage zilnic
      let newOverwateredDays = prev.overwateredDays;
      if (newOverwateredDays > 0) {
        newHealth = Math.max(0, newHealth - 1);
        newOverwateredDays -= 1;
        addLog(`☔ Overwatered debuff: -1 HP. ${newOverwateredDays} day(s) remaining.`);
        showNotification("Overwatered: -1 HP", "disaster");
        addFloatingNumber('-1 ❤️', 'damage', 'plant-health');
      }
      
      // DAMAGED ROOTS DEBUFF: decrementare counter
      let newDamagedRootsDays = prev.damagedRootsDays;
      if (newDamagedRootsDays > 0) {
        newDamagedRootsDays -= 1;
        if (newDamagedRootsDays === 0) {
          addLog(`🌱 Damaged Roots healed! Nutrient consumption back to normal.`);
          showNotification("Roots Healed!", "success");
        } else {
          addLog(`🪨 Damaged Roots: ${newDamagedRootsDays} day(s) remaining.`);
        }
      }
      
      if (newDryDays >= 2) {
        setGameView('dead');
        playSound('warning');
        showNotification("Plant died from dehydration!", "disaster");
        addLog("💀 Plant dried out completely.");
      }
      
      if (newHealth <= 0) {
        setGameView('dead');
        playSound('warning');
        showNotification("Plant died from poor health!", "disaster");
        addLog("💀 Plant died from poor health.");
      }

      return {
        ...prev,
        water: newWater,
        nutrients: newNutrients,
        health: newHealth,
        growth: prev.growth + 1,
        dryDays: newDryDays,
        overwateredDays: newOverwateredDays,
        damagedRootsDays: newDamagedRootsDays
      };
    });

    // Check Disaster
    if (newDay === nextDisasterDay) {
        triggerDisaster(newDay);
    }
  };

  const triggerDisaster = (currentDay = day) => {
      // Prevent double-trigger with ref (synchronous check)
      if (disasterTriggeredRef.current) {
        return;
      }
      disasterTriggeredRef.current = true;
      
      // Save current disaster type before scheduling next
      setCurrentDisasterType(nextDisasterType);
      
      setBossEvent(nextDisasterType);
      setGameView('boss');
      playSound('disaster');
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 500);
      
      addLog(`⚠️ DISASTER: ${nextDisasterType} has struck!`);
      
      // Scale disaster damage with difficulty
      const baseDamage = difficultyLevel;
      const randomVariation = rand(0, 2);
      const totalDamage = baseDamage + randomVariation;
      
      if (nextDisasterType === 'Drought') {
          setPlant(p => ({...p, water: 0}));
          const waterLoss = Math.min(water, totalDamage + rand(1, 3));
          setWater(w => Math.max(0, w - waterLoss));
          addLog(`☀️ Drought evaporated all plant water! Lost ${waterLoss} shared water.`);
          showNotification(`DROUGHT! -${waterLoss} Water`, "disaster");
          addFloatingNumber(`-${waterLoss}`, 'damage', 'water');
      } else if (nextDisasterType === 'Earthquake') {
          setPlant(p => ({...p, health: Math.max(0, p.health - totalDamage)}));
          addLog(`🌋 Earthquake damaged roots for ${totalDamage} damage!`);
          showNotification(`EARTHQUAKE! -${totalDamage} Health`, "disaster");
          addFloatingNumber(`-${totalDamage}`, 'damage', 'plant-health');
      } else if (nextDisasterType === 'Flood') {
          // FLOOD: Saturează planta cu apă DAR dă debuff overwatered + root damage
          setPlant(p => ({
            ...p, 
            water: 10, // Plină de apă
            health: Math.max(0, p.health - 1), // Root suffocation instant
            overwateredDays: 2 // Debuff 2 zile
          }));
          addLog(`☔ FLOOD submerged the plant! Overwatered debuff applied. Root suffocation: -1 HP.`);
          showNotification(`FLOOD! Overwatered + Root Damage`, "disaster");
          addFloatingNumber('+10 💧', 'heal', 'plant-water');
          addFloatingNumber('-1 ❤️', 'damage', 'plant-health');
          addFloatingNumber('☔ Overwatered!', 'damage', 'center');
      } else if (nextDisasterType === 'Landslide') {
          // LANDSLIDE: Damage instant + debuff damaged roots (mănâncă mai mulți nutrienți)
          const landslideDamage = totalDamage + 1; // Puțin mai mult damage
          setPlant(p => ({
            ...p,
            health: Math.max(0, p.health - landslideDamage),
            damagedRootsDays: 3 // Debuff 3 zile (mai lung decât overwatered)
          }));
          addLog(`🪨 LANDSLIDE crushed the roots! -${landslideDamage} HP. Damaged Roots debuff: +1 nutrient consumption for 3 days.`);
          showNotification(`LANDSLIDE! Root Damage + Debuff`, "disaster");
          addFloatingNumber(`-${landslideDamage} ❤️`, 'damage', 'plant-health');
          addFloatingNumber('🪨 Damaged Roots!', 'damage', 'center');
      }
      
      // Scoate dezastrul curent din listă și setează următorul
      setDisasters(prevDisasters => {
        const remainingDisasters = prevDisasters.filter(d => d.day !== currentDay);
        
        if (remainingDisasters.length > 0) {
          // Mai sunt dezastre - setează următorul
          const nextDisaster = remainingDisasters[0];
          setNextDisasterDay(nextDisaster.day);
          setNextDisasterType(nextDisaster.type);
          addLog(`📅 Next disaster: ${nextDisaster.type} on day ${nextDisaster.day}`);
        } else {
          // Nu mai sunt dezastre
          setNextDisasterDay(999);
          setNextDisasterType('None');
          addLog(`🎉 No more disasters scheduled!`);
        }
        
        return remainingDisasters;
      });
  };

  const handleBossContinue = () => {
      // Next disaster info is already set in triggerDisaster()
      addLog(`📅 Next disaster in 3 days.`);
    setRunStats(s => ({ ...s, disastersSurvived: s.disastersSurvived + 1 })); // Track stat
      setGameView('normal');
      // Reset the guard flag for next disaster
      disasterTriggeredRef.current = false;
  };

  const restart = () => {
    localStorage.removeItem('gardenSave');
    localStorage.removeItem('moonDayOffset'); // Resetează faza lunară
    localStorage.removeItem('currentPlantType'); // ȘTERGE PLANTA pentru re-roll
    localStorage.removeItem('weatherCalendar'); // Resetează weather
    // Forțează refresh pentru a genera o nouă plantă randomizată
    window.location.reload();
  };

  // Check if sleep button should show
  const canSleep = () => {
    // Afternoon: always can pass to night
    if (timeOfDay === 'afternoon') return true;
    // Night: always can sleep to morning
    if (timeOfDay === 'night') return true;
    // Morning: never can skip (must use actions)
    return false;
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
      
      {/* Notification Popup */}
      {notification && (
        <div className={`notification notification-${notification.type}`}>
          {notification.message}
        </div>
      )}
      
      {/* Time Transition Card - Balatro Style */}
      {timeTransition && (
        <div className="time-transition">
          <div className="time-transition-content">
            <div className="time-emoji">{timeTransition.emoji}</div>
            <div className="time-label">{timeTransition.timeLabel}</div>
          </div>
        </div>
      )}

      {/* Floating Numbers */}
      {floatingNumbers.map(num => (
        <div 
          key={num.id} 
          className={`floating-number floating-${num.type} floating-${num.position}`}
        >
          {num.value}
        </div>
      ))}
      
      {/* WEATHER OVERLAYS */}
      {currentWeather === 'rainy' && (
        <div className="weather-overlay rain-overlay">
          {Array.from({ length: 100 }).map((_, i) => (
            <div key={i} className="rain-drop" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${0.5 + Math.random() * 0.5}s`
            }}></div>
          ))}
        </div>
      )}
      
      {currentWeather === 'snowy' && (
        <div className="weather-overlay snow-overlay">
          {Array.from({ length: 50 }).map((_, i) => (
            <div key={i} className="snowflake" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
              fontSize: `${10 + Math.random() * 10}px`
            }}>❄</div>
          ))}
        </div>
      )}
      
      {currentWeather === 'thunderstorm' && (
        <>
          <div className="weather-overlay rain-overlay thunderstorm-rain">
            {Array.from({ length: 150 }).map((_, i) => (
              <div key={i} className="rain-drop heavy" style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 1}s`,
                animationDuration: `${0.3 + Math.random() * 0.3}s`
              }}></div>
            ))}
          </div>
          <div className="lightning-overlay"></div>
        </>
      )}
      
      {/* Mini-Meniu Hamburger - Stânga Sus */}
      <div className="mini-menu">
        <button className="hamburger-btn" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>
        
        {menuOpen && (
          <div className="menu-dropdown">
            <button className="menu-item logout-btn" onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              localStorage.removeItem('gardenSave');
              setViewState('login');
            }}>
              🚪 LOGOUT
            </button>
            
            <button className="menu-item restart-btn-menu" onClick={restart}>
              🔄 RESTART
            </button>
          </div>
        )}
      </div>

      {/* Day Counter - Top Left Corner with Season */}
      <div className="day-counter-corner">
        <div className="season-indicator">
          <span className="season-emoji">{currentSeason.emoji}</span>
          <span className="season-name">{currentSeason.name}</span>
        </div>
        <div className="day-counter-row">
          <div className="day-counter-number">{day}</div>
          <div className="day-counter-separator">/</div>
          <div className="day-counter-max">{maxDays}</div>
        </div>
      </div>

      {/* Moon Phase - Top Right Corner */}
      <div 
        className="moon-phase-corner clickable" 
        onClick={() => setMoonCalendarExpanded(!moonCalendarExpanded)}
      >
        <div className="moon-expand-hint">▼ Click to expand</div>
        <div className="moon-phase-emoji">{getMoonPhase(day).emoji}</div>
        <div className="moon-phase-name">{getMoonPhase(day).name}</div>
      </div>

      {/* MOON CALENDAR EXPANDED */}
      {moonCalendarExpanded && (
        <div className="moon-calendar-overlay" onClick={() => setMoonCalendarExpanded(false)}>
          <div className="moon-calendar-panel" onClick={(e) => e.stopPropagation()}>
            <div className="moon-calendar-header">
              <h2>🌙 Moon Phase Calendar</h2>
              <button className="close-btn" onClick={() => setMoonCalendarExpanded(false)}>✕</button>
            </div>
            <div className="moon-calendar-grid">
              {Array.from({ length: 30 }, (_, i) => i + 1).map(dayNum => {
                const moonPhase = getMoonPhase(dayNum);
                const isCurrentDay = dayNum === day;
                return (
                  <div 
                    key={dayNum} 
                    className={`moon-calendar-day ${isCurrentDay ? 'current' : ''}`}
                  >
                    <div className="moon-calendar-day-num">Day {dayNum}</div>
                    <div className="moon-calendar-moon">{moonPhase.emoji}</div>
                    <div className="moon-calendar-phase">{moonPhase.name}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* CALENDAR NOU - Hybrid scroll */}
      {gameView === 'normal' && (
        <div className="calendar-container-new">
          {/* Săgeata se mișcă până la ziua 5, apoi rămâne fixă */}
          <div 
            className="calendar-arrow-new" 
            style={{
              left: `${40 + (Math.min(calendarScrollPosition, 4) * 120)}px`
            }}
          >
            ▼
          </div>
          
          {/* Track-ul se mișcă după ziua 5 */}
          <div 
            className="calendar-track-new"
            style={{
              transform: calendarScrollPosition > 4 
                ? `translateX(-${(calendarScrollPosition - 4) * 120}px)` 
                : 'translateX(0)'
            }}
          >
            {Array.from({length: maxDays}, (_, i) => {
              const dayNum = i + 1;
              const moonPhase = getMoonPhase(dayNum);
              
              // Caută dacă această zi are un dezastru planificat
              const disasterForThisDay = disasters.find(d => d.day === dayNum);
              const isDisasterDay = disasterForThisDay !== undefined;
              const disasterType = disasterForThisDay?.type || '';
              
              const isCurrentDay = dayNum === day;
              
              // Calendar arată WEATHER în loc de moon phase
              const dayWeather = weatherCalendar[dayNum] || 'sunny';
              const weatherIcon = weatherTypes[dayWeather].emoji;
              
              // Ziua curentă: afternoon = 🌅, night = moon phase, altfel weather
              let displayIcon = weatherIcon;
              let timeClass = '';
              if (isCurrentDay) {
                if (timeOfDay === 'afternoon') {
                  displayIcon = '🌅'; // Afternoon override
                  timeClass = 'time-afternoon';
                } else if (timeOfDay === 'night') {
                  displayIcon = moonPhase.emoji; // Night arată moon phase!
                  timeClass = 'time-night';
                } else {
                  timeClass = 'time-morning';
                }
              }
              
              return (
                <div 
                  key={dayNum} 
                  className={`calendar-day-new ${isCurrentDay ? 'current-day' : ''} ${isDisasterDay ? 'disaster-day' : ''} ${timeClass}`}
                >
                  <div className="calendar-day-number">Day {dayNum}</div>
                  <div className="calendar-moon">{displayIcon}</div>
                  {isDisasterDay && (
                    <div className="calendar-disaster">⚠️ {disasterType}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div id="game" className={`${screenShake ? 'screen-shake' : ''} weather-${currentWeather} time-${timeOfDay}`}>
        {/* INVENTORY PANEL (Left Side) */}
        <div className="stats-panel inventory-panel">
          <div className="stats-panel-section">
            <div className="stats-panel-title">🎒 Your Inventory</div>
            <div className="stat-row">
              <div className="stat-label">💧 Water Buckets</div>
              <div className={`stat-value ${water < 3 ? 'warning' : ''}`}>{water}</div>
            </div>
            <div className="stat-bar">
              <div className="stat-bar-fill" style={{width: `${(water / 20) * 100}%`}}></div>
            </div>
            
            <div className="stat-row">
              <div className="stat-label">🌱 Nutrient Bags</div>
              <div className={`stat-value ${nutrients < 3 ? 'warning' : ''}`}>{nutrients}</div>
            </div>
            <div className="stat-bar">
              <div className="stat-bar-fill" style={{width: `${(nutrients / 20) * 100}%`}}></div>
            </div>
            
            <div className="stat-row">
              <div className="stat-label">⚡ Energy</div>
              <div className="stat-value">{energy} / {maxEnergy} {wellRested ? '✨' : ''}</div>
            </div>
          </div>
        </div>

        {/* PLANT PANEL (Right Side) */}
        <div className="stats-panel plant-panel">
          <div className="stats-panel-section">
            <div className="stats-panel-title">
              {plantType.emoji} {plantType.name}
              <button 
                className="plant-info-btn-inline"
                onClick={() => setPlantInfoExpanded(!plantInfoExpanded)}
              >
                ℹ️
              </button>
            </div>
            
            {/* PLANT INFO MODAL POPUP */}
            {plantInfoExpanded && (
              <>
                <div className="modal-overlay" onClick={() => setPlantInfoExpanded(false)}></div>
                <div className="plant-info-modal">
                  <div className="plant-info-header">
                    <div className="plant-info-title">
                      {plantType.emoji} {plantType.name}
                    </div>
                    <div className="plant-damage-type-modal">⚔️ {plantType.damageType}</div>
                    <button className="modal-close-btn" onClick={() => setPlantInfoExpanded(false)}>✕</button>
                  </div>
                  
                  <div className="plant-abilities-modal">
                    {plantType.immuneToDrought && (
                      <div className="ability-badge immunity">☀️ Drought Immune</div>
                    )}
                    {plantType.immuneToEarthquake && (
                      <div className="ability-badge immunity">🌋 Quake Immune</div>
                    )}
                    {plantType.photosynthesis && (
                      <div className="ability-badge buff">🌻 Photosynthesis +{plantType.photosynthesis}🌱</div>
                    )}
                    {plantType.morningDewChance && (
                      <div className="ability-badge buff">💧 Morning Dew 30%</div>
                    )}
                    {plantType.expeditionWaterBonus && (
                      <div className="ability-badge buff">🦟 Carnivore +{plantType.expeditionWaterBonus[0]}-{plantType.expeditionWaterBonus[1]}💧</div>
                    )}
                    {plantType.nightEnergyBonus && (
                      <div className="ability-badge buff">🍄 Nocturnal +{plantType.nightEnergyBonus}⚡</div>
                    )}
                    {plantType.autoHealDays && (
                      <div className="ability-badge buff">🌿 Regen +1❤️/3d</div>
                    )}
                    {plantType.healEnergyCost && plantType.healEnergyCost > 1 && (
                      <div className="ability-badge debuff">🚑 Heal -{plantType.healEnergyCost}⚡</div>
                    )}
                    {plantType.fertilizeCost && plantType.fertilizeCost > 1 && (
                      <div className="ability-badge debuff">🌱 Feed -{plantType.fertilizeCost}🌱</div>
                    )}
                    {plantType.allDisastersDamage && (
                      <div className="ability-badge debuff">💥 Fragile +{plantType.allDisastersDamage} dmg</div>
                    )}
                  </div>
                </div>
              </>
            )}
            
            {/* WEATHER STATUS PANEL */}
            <div className="weather-status-panel">
              <div className="weather-status-title">
                {currentWeatherData.emoji} {currentWeatherData.name}
              </div>
              <div className="weather-effects-list">
                {currentWeather === 'sunny' && (
                  <div className="weather-effect-item sunny">☀️ +2 🌱 daily</div>
                )}
                {currentWeather === 'overcast' && (
                  <div className="weather-effect-item overcast">☁️ 2x ⚡ cost</div>
                )}
                {currentWeather === 'rainy' && (
                  <div className="weather-effect-item rainy">🌧️ Fill 💧 bar</div>
                )}
                {currentWeather === 'snowy' && (
                  <div className="weather-effect-item snowy">❄️ FREEZE (0 consumption)</div>
                )}
                {currentWeather === 'thunderstorm' && (
                  <div className="weather-effect-item thunderstorm">⛈️ Locked inside</div>
                )}
              </div>
            </div>
            
            <div className="stat-row">
              <div className="stat-label">💧 Moisture {plant.water < 3 ? '⚠️' : ''}</div>
              <div className={`stat-value ${plant.water < 3 ? 'warning' : ''}`}>{plant.water} / {plantType.maxWater}</div>
            </div>
            <div className="stat-bar">
              <div className="stat-bar-fill water-bar" style={{width: `${(plant.water / plantType.maxWater) * 100}%`}}></div>
            </div>
            
            {plantType.maxNutrients > 0 && (
              <>
                <div className="stat-row">
                  <div className="stat-label">🍞 Fed Level {plant.nutrients < 3 ? '⚠️' : ''}</div>
                  <div className={`stat-value ${plant.nutrients < 3 ? 'warning' : ''}`}>{plant.nutrients} / {plantType.maxNutrients}</div>
                </div>
                <div className="stat-bar">
                  <div className="stat-bar-fill nutrient-bar" style={{width: `${(plant.nutrients / plantType.maxNutrients) * 100}%`}}></div>
                </div>
              </>
            )}
            
            {plantType.maxNutrients === 0 && (
              <div className="carnivorous-indicator">
                🦟 Carnivorous - Catches own food!
              </div>
            )}
            
            <div className="stat-row">
              <div className="stat-label">❤️ Health {plant.health < 4 ? '⚠️' : ''}</div>
              <div className={`stat-value ${plant.health < 4 ? 'warning' : ''}`}>{plant.health} / {plantType.maxHealth}</div>
            </div>
            <div className="stat-bar">
              <div className="stat-bar-fill health-bar" style={{width: `${(plant.health / plantType.maxHealth) * 100}%`}}></div>
            </div>
            
            <div className="consumption-info">
              <div className="consumption-label">🌙 Nightly Consumption:</div>
              
              {/* WEATHER EFFECT INDICATOR */}
              {(currentWeather === 'snowy' || currentWeather === 'rainy' || currentWeather === 'sunny') && (
                <div className="weather-effect-banner">
                  {currentWeather === 'snowy' && (
                    <span className="weather-effect frozen">❄️ FROZEN - No consumption!</span>
                  )}
                  {currentWeather === 'rainy' && (
                    <span className="weather-effect rain-bonus">🌧️ Rain will fill water!</span>
                  )}
                  {currentWeather === 'sunny' && (
                    <span className="weather-effect sunny-bonus">☀️ +2 nutrients tomorrow!</span>
                  )}
                </div>
              )}
              
              <div className="consumption-inline">
                {/* Water Consumption */}
                <span className={`consumption-item ${currentWeather === 'snowy' ? 'frozen-stat' : ''}`}>
                  {currentWeather === 'snowy' ? '0' : waterConsumptionRate} 💧
                  {currentWeather === 'snowy' && <span className="frozen-tag">❄️</span>}
                </span>
                
                {/* Nutrient Consumption (doar dacă planta folosește nutrients) */}
                {plantType.maxNutrients > 0 && (
                  <span className={`consumption-item ${plant.damagedRootsDays > 0 ? 'debuff-highlight' : ''} ${currentWeather === 'snowy' ? 'frozen-stat' : ''}`}>
                    {currentWeather === 'snowy' ? '0' : nutrientConsumptionRate}
                    {plant.damagedRootsDays > 0 && !currentWeather === 'snowy' && ` +1`} 🌱
                    {plant.damagedRootsDays > 0 && <span className="debuff-tag">🪨</span>}
                    {currentWeather === 'snowy' && <span className="frozen-tag">❄️</span>}
                  </span>
                )}
                
                {/* Health Damage (doar dacă există debuff-uri) */}
                {plant.overwateredDays > 0 && (
                  <span className="consumption-item debuff-highlight damage-item">
                    -1 ❤️
                    <span className="debuff-tag">☔</span>
                  </span>
                )}
              </div>
            </div>
            
            {plant.overwateredDays > 0 && (
              <div className="debuff-indicator overwatered-debuff">
                <div className="debuff-icon">☔</div>
                <div className="debuff-text">
                  <div className="debuff-name">Overwatered</div>
                  <div className="debuff-duration">-1 HP per day ({plant.overwateredDays} days left)</div>
                </div>
              </div>
            )}
            
            {plant.damagedRootsDays > 0 && (
              <div className="debuff-indicator damaged-roots-debuff">
                <div className="debuff-icon">🪨</div>
                <div className="debuff-text">
                  <div className="debuff-name">Damaged Roots</div>
                  <div className="debuff-duration">+1 🌱 consumption per night ({plant.damagedRootsDays} days left)</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CENTER STAGE (Plant) */}
        <div className="center-stage">
          <div className={`plant-display ${plant.health < 5 ? 'low-health' : ''}`}>
            {gameView === 'dead' ? '🥀' : (plant.water < 3 ? '🍂' : plantType.emoji)}
          </div>
          <div className="time-of-day-label">
            {timeOfDay.toUpperCase()}
          </div>
        </div>

        {/* LOG PANEL (Bottom Left) */}
        <div className="log-panel">
          <div className="log-panel-title">📜 Activity Log</div>
          <div>
            {log.slice(0, 5).map((msg, i) => (
              <div key={i} className="log-entry">{msg}</div>
            ))}
          </div>
        </div>

        {/* ACTION MENUS - Persona 3 Style */}
        {gameView === 'victory' ? (
          <>
            <div className="full-screen-overlay victory-overlay">
              <div className="overlay-card victory-card">
                <div className="overlay-icon" style={{fontSize: '8rem'}}>🏆</div>
                <div className="overlay-title">VICTORY!</div>
                <div className="overlay-subtitle">You survived all 30 days with your {plantType.name}!</div>
                
                <div className="victory-stats">
                  <div className="victory-stat-title">📊 Run Statistics</div>
                  <div className="victory-stat-grid">
                    <div className="victory-stat-item">
                      <span className="stat-icon">⚠️</span>
                      <span className="stat-label">Disasters Survived</span>
                      <span className="stat-value">{runStats.disastersSurvived}</span>
                    </div>
                    <div className="victory-stat-item">
                      <span className="stat-icon">💧</span>
                      <span className="stat-label">Waters Used</span>
                      <span className="stat-value">{runStats.watersUsed}</span>
                    </div>
                    <div className="victory-stat-item">
                      <span className="stat-icon">🌱</span>
                      <span className="stat-label">Nutrients Used</span>
                      <span className="stat-value">{runStats.nutrientsUsed}</span>
                    </div>
                    <div className="victory-stat-item">
                      <span className="stat-icon">🎒</span>
                      <span className="stat-label">Expeditions</span>
                      <span className="stat-value">{runStats.expeditionsCompleted}</span>
                    </div>
                    <div className="victory-stat-item">
                      <span className="stat-icon">🚑</span>
                      <span className="stat-label">Healings</span>
                      <span className="stat-value">{runStats.healingsDone}</span>
                    </div>
                    <div className="victory-stat-item">
                      <span className="stat-icon">❤️</span>
                      <span className="stat-label">Final Health</span>
                      <span className="stat-value">{plant.health}/{plantType.maxHealth}</span>
                    </div>
                  </div>
                </div>
                
                <div className="overlay-button victory-button" onClick={restart}>🌱 Play Again</div>
              </div>
            </div>
          </>
        ) : gameView === 'dead' ? (
          <>
            <div className="full-screen-overlay">
              <div className="overlay-card">
                <div className="overlay-icon" style={{fontSize: '8rem'}}>💀</div>
                <div className="overlay-title">Plant Died</div>
                <div className="overlay-subtitle">Your plant has withered away...</div>
                <div className="overlay-button" onClick={restart}>Restart Journey</div>
              </div>
            </div>
          </>
        ) : gameView === 'boss' ? (
          <>
            <div className="full-screen-overlay disaster-overlay">
              <div className="overlay-card">
                <div className="overlay-icon" style={{fontSize: '8rem'}}>⚠️</div>
                <div className="overlay-title">{currentDisasterType} Struck!</div>
                <div className="overlay-subtitle">Your plant weathered the storm...</div>
                <div className="overlay-button" onClick={handleBossContinue}>Continue</div>
              </div>
            </div>
          </>
        ) : gameView === 'expedition' ? (
          <>
            <div className="full-screen-overlay expedition-overlay">
              <div className="overlay-card">
                <div className="overlay-icon" style={{fontSize: '8rem', animation: 'bounce 2s infinite'}}>🎒</div>
                <div className="overlay-title">On Expedition</div>
                <div className="overlay-subtitle">Gathering resources...</div>
                <div style={{fontSize: '5rem', marginTop: '20px', animation: 'pulse 1s infinite'}}>🚶</div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* MAIN MENU - MORNING */}
            {gameView === 'normal' && timeOfDay === 'morning' && (
              <div className="action-menu-container">
                <div className={`click-here-indicator weather-${currentWeather}`}>👇 CLICK HERE 👇</div>
                {currentWeather === 'thunderstorm' ? (
                  <>
                    <div className="action-menu-item disabled">
                      <div className="action-menu-title">⛈️ Thunderstorm!</div>
                      <div className="action-menu-subtitle">Can't go outside - locked indoors</div>
                    </div>
                    <div className="action-menu-item" onClick={sleep}>
                      <div className="action-menu-title">⏭️ Wait Inside</div>
                      <div className="action-menu-subtitle">Skip to afternoon</div>
                    </div>
                  </>
                ) : energy >= getEnergyCost(1) ? (
                  <>
                    <div className="action-menu-item" onClick={() => setGameView('plant-menu')}>
                      <div className="action-menu-title">🌿 Tend Plant</div>
                      <div className="action-menu-subtitle">Water, fertilize, or heal your plant</div>
                    </div>
                    <div className="action-menu-item" onClick={() => setGameView('expedition-menu')}>
                      <div className="action-menu-title">🎒 Expedition</div>
                      <div className="action-menu-subtitle">Gather water and nutrients</div>
                    </div>
                  </>
                ) : (
                  <div className="action-menu-item" onClick={sleep}>
                    <div className="action-menu-title">⏭️ No Energy</div>
                    <div className="action-menu-subtitle">
                      {currentWeather === 'overcast' ? '☁️ Overcast: Need 2 energy minimum' : 'Skip to afternoon'}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* MAIN MENU - AFTERNOON */}
            {gameView === 'normal' && timeOfDay === 'afternoon' && (
              <div className="action-menu-container">
                <div className="action-menu-item disabled">
                  <div className="action-menu-title">🌾 Weed Combat</div>
                  <div className="action-menu-subtitle">Coming Soon</div>
                </div>
                <div className="action-menu-item" onClick={sleep}>
                  <div className="action-menu-title">🌙 To Night</div>
                  <div className="action-menu-subtitle">Advance to nighttime</div>
                </div>
              </div>
            )}

            {/* MAIN MENU - NIGHT */}
            {gameView === 'normal' && timeOfDay === 'night' && energy >= getEnergyCost(1) && (
              <div className="action-menu-container">
                <div className="action-menu-item" onClick={() => {
                  setGameView('plant-menu');
                }}>
                  <div className="action-menu-title">🌿 Tend Plant</div>
                  <div className="action-menu-subtitle">
                    {currentWeather === 'overcast' ? '☁️ Overcast: 2x energy cost' : 'Use energy to care for plant'}
                  </div>
                  <div className="action-menu-cost">-{getEnergyCost(1)} ⚡</div>
                </div>
                <div className="action-menu-item" onClick={sleep}>
                  <div className="action-menu-title">💤 Sleep Early</div>
                  <div className="action-menu-subtitle">Get well-rested buff (+1 max energy)</div>
                </div>
              </div>
            )}

            {/* NIGHT - No energy left, must sleep */}
            {gameView === 'normal' && timeOfDay === 'night' && energy < getEnergyCost(1) && (
              <div className="action-menu-container">
                <div className="action-menu-item" onClick={sleep}>
                  <div className="action-menu-title">💤 Sleep</div>
                  <div className="action-menu-subtitle">
                    {currentWeather === 'overcast' && energy === 1 ? '☁️ Need 2 energy (Overcast)' : 'End the day and restore energy'}
                  </div>
                </div>
              </div>
            )}

            {/* PLANT CARE SUBMENU */}
            {gameView === 'plant-menu' && (
              <>
                <div className="modal-overlay" onClick={() => setGameView('normal')}></div>
                <div className="submenu-panel">
                  <div className="submenu-title">🌿 Plant Care</div>
                  <div className="submenu-options">
                    <div 
                      className={`action-menu-item ${(water <= 0 || energy < getEnergyCost(1)) ? 'disabled' : ''}`}
                      onClick={() => {if (water > 0 && energy >= getEnergyCost(1)) waterPlant();}}
                    >
                      <div className="action-menu-title">💧 Water</div>
                      <div className="action-menu-subtitle">
                        {water <= 0 ? 'No water!' : energy < getEnergyCost(1) ? `Need ${getEnergyCost(1)} energy!` : 'Give plant +2 water'}
                      </div>
                      <div className="action-menu-cost">-{getEnergyCost(1)} ⚡</div>
                    </div>
                    <div 
                      className={`action-menu-item ${(nutrients <= 0 || energy < getEnergyCost(1) || plantType.maxNutrients === 0) ? 'disabled' : ''}`}
                      onClick={() => {if (nutrients > 0 && energy >= getEnergyCost(1) && plantType.maxNutrients > 0) fertilizePlant();}}
                    >
                      <div className="action-menu-title">🌱 Fertilize</div>
                      <div className="action-menu-subtitle">
                        {plantType.maxNutrients === 0 ? 'Carnivorous - no nutrients!' : nutrients <= 0 ? 'No nutrients!' : energy < getEnergyCost(1) ? `Need ${getEnergyCost(1)} energy!` : 'Give plant +2 nutrients'}
                      </div>
                      <div className="action-menu-cost">-{getEnergyCost(1)} ⚡</div>
                    </div>
                    <div 
                      className={`action-menu-item ${(plant.health >= plantType.maxHealth || energy < getEnergyCost(1)) ? 'disabled' : ''}`}
                      onClick={() => {if (plant.health < plantType.maxHealth && energy >= getEnergyCost(1)) healPlant();}}
                    >
                      <div className="action-menu-title">🚑 Heal</div>
                      <div className="action-menu-subtitle">
                        {plant.health >= plantType.maxHealth ? 'Plant at full health!' : energy < getEnergyCost(1) ? `Need ${getEnergyCost(1)} energy!` : 'Restore +1 health'}
                      </div>
                      <div className="action-menu-cost">-{getEnergyCost(1)} ⚡</div>
                    </div>
                    <div className="action-menu-item" onClick={() => setGameView('normal')}>
                      <div className="action-menu-title">🔙 Back</div>
                      <div className="action-menu-subtitle">Return to main menu</div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* EXPEDITION SUBMENU */}
            {gameView === 'expedition-menu' && (
              <>
                <div className="modal-overlay" onClick={() => setGameView('normal')}></div>
                <div className="submenu-panel">
                  <div className="submenu-title">🎒 Expedition</div>
                  <div className="submenu-options">
                    <div 
                      className={`action-menu-item ${energy < 2 ? 'disabled' : ''}`}
                      onClick={() => {if (energy >= 2) startExpedition(1);}}
                    >
                      <div className="action-menu-title">🚶 1-Day Trip</div>
                      <div className="action-menu-subtitle">
                        {energy < 2 ? 'Need 2 energy!' : 'Quick resource gathering'}
                      </div>
                      <div className="action-menu-cost">-2 ⚡</div>
                    </div>
                    <div 
                      className={`action-menu-item ${energy < 3 ? 'disabled' : ''}`}
                      onClick={() => {if (energy >= 3) startExpedition(2);}}
                    >
                      <div className="action-menu-title">🏃 2-Day Trip</div>
                      <div className="action-menu-subtitle">
                        {energy < 3 ? 'Need 3 energy!' : 'Extended resource gathering'}
                      </div>
                      <div className="action-menu-cost">-3 ⚡</div>
                    </div>
                    <div 
                      className={`action-menu-item ${(!wellRested || energy < 4) ? 'disabled' : ''}`}
                      onClick={() => {if (wellRested && energy >= 4) startExpedition(3);}}
                    >
                      <div className="action-menu-title">🏃‍♂️ 3-Day Trip ✨</div>
                      <div className="action-menu-subtitle">
                        {!wellRested ? 'Need well-rested buff!' : energy < 4 ? 'Need 4 energy!' : 'Maximum resource haul!'}
                      </div>
                      <div className="action-menu-cost">-4 ⚡</div>
                    </div>
                    <div className="action-menu-item" onClick={() => setGameView('normal')}>
                      <div className="action-menu-title">🔙 Back</div>
                      <div className="action-menu-subtitle">Return to main menu</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default App;