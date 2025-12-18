import React, { useState, useEffect, useRef } from 'react';
import './index.css';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

function App() {
  const maxDays = 30;
  
  const [authScreen, setAuthScreen] = useState('title'); // Options: 'title', 'login', 'register'
  const [charPos, setCharPos] = useState('center'); // 🟢 This creates the missing variable

  // --- PLANT TYPES SYSTEM ---
  const plantTypes = {
    cactus: {
      name: 'Cactus',
      image: '/assets/mutations/cactus.mutation.png',
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
      image: '/assets/mutations/venus.fly.trap.mutation.png',
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
      image: '/assets/mutations/sunflower.mutation.png',
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
      image: '/assets/mutations/rose.mutation.png',
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
      image: '/assets/mutations/ivy.mutation.png',
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
      image: '/assets/mutations/mushroom.mutation.png',
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
      image: '/assets/mutations/apple.tree.mutation.png',
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
  const [viewState, setViewState] = useState('title'); 

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
  
  // Battle System V2
  const [battleState, setBattleState] = useState(null);
  const [plantHeads, setPlantHeads] = useState([]);
  const maxPlantHeads = 4;
  const [battleWarning, setBattleWarning] = useState(false);
  const [battleCompleted, setBattleCompleted] = useState(false);
  const [selectedHeadIndex, setSelectedHeadIndex] = useState(0); // For swapping between plants in HUD
  
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
  
  // Initialize first plant head when game starts
  useEffect(() => {
    if (plantType && plantHeads.length === 0 && viewState === 'game') {
      const firstHead = {
        id: `plant_head_0_${Date.now()}`,
        type: plantType.name.toLowerCase().replace(' ', ''),
        name: plantType.name,
        damageType: plantType.damageType,
        hp: plant.health,
        maxHP: plantType.maxHealth,
        water: plant.water,
        maxWater: plantType.maxWater,
        nutrients: plant.nutrients,
        maxNutrients: plantType.maxNutrients,
        damage: 5 + Math.floor(plantType.maxHealth / 4),
        turnOrder: Math.floor(Math.random() * 100),
        isPlant: true,
        isEnemy: false,
        isDead: false
      };
      setPlantHeads([firstHead]);
      console.log('🌱 First plant head created:', firstHead.name);
    }
  }, [plantType, viewState]);
  
  // Add new plant head every 5 days
  useEffect(() => {
    if (day % 5 === 0 && day > 1 && plantHeads.length < maxPlantHeads && viewState === 'game') {
      const addPlantHead = () => {
        // Get a random plant type (can be duplicate!)
        const allTypes = Object.values(plantTypes);
        const randomType = allTypes[Math.floor(Math.random() * allTypes.length)];
        
        const newHead = {
          id: `plant_head_${plantHeads.length}_${Date.now()}`,
          type: randomType.name.toLowerCase().replace(' ', ''),
          name: randomType.name,
          damageType: randomType.damageType,
          hp: randomType.maxHealth,
          maxHP: randomType.maxHealth,
          water: randomType.maxWater,
          maxWater: randomType.maxWater,
          nutrients: randomType.maxNutrients,
          maxNutrients: randomType.maxNutrients,
          damage: 5 + Math.floor(randomType.maxHealth / 4),
          turnOrder: Math.floor(Math.random() * 100),
          isPlant: true,
          isEnemy: false,
          isDead: false,
          // Store original plant type data for management
          plantTypeData: randomType
        };
        setPlantHeads(prev => [...prev, newHead]);
        showNotification(`🌱 New ${randomType.name} head grew!`, 'success');
        console.log('🌱 New plant head added:', newHead.name);
      };
      addPlantHead();
    }
  }, [day]);
  
  // Notifications and feedback
  const [notification, setNotification] = useState(null);
  const [screenShake, setScreenShake] = useState(false);
  const [timeTransition, setTimeTransition] = useState(null); // For big time cards
  const [floatingNumbers, setFloatingNumbers] = useState([]); // For damage/heal numbers

  // --- EFECTE (Load & Save & Styles) ---

// Verificăm dacă userul e logat la pornire
  useEffect(() => {
    // 🟢 NEW: Checks localStorage OR sessionStorage
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const savedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    
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

  // Battle System useRef to prevent double-execution
  const battleLoopLock = useRef(false);
  
  // ==========================================
  // BATTLE GAME LOOP V2
  // ==========================================
  useEffect(() => {
    if (!battleState || gameView !== 'battle') return;
    if (battleState.processing) {
      console.log('⏸️ Processing in progress, skipping useEffect');
      return;
    }
    if (battleLoopLock.current) {
      console.log('🔒 Battle loop locked, skipping useEffect');
      return;
    }
    
    const currentP = battleState.turnQueue?.[battleState.currentTurnIndex];
    if (!currentP) {
      console.error('❌ No current participant!');
      return;
    }
    
    console.log('🎮 Game loop tick:', {
      participant: currentP.name,
      isPlayer: currentP.isPlant,
      waitingForPlayer: battleState.waitingForPlayer,
      processing: battleState.processing
    });
    
    // If enemy turn and not waiting for player, execute AI
    if (currentP.isEnemy && !battleState.waitingForPlayer && !battleState.processing) {
      console.log('🤖 Executing enemy AI');
      battleLoopLock.current = true; // Lock
      
      const timer = setTimeout(() => {
        console.log('🤖 Enemy AI timeout triggered');
        
        // Wait for action animation, then do EVERYTHING in one setBattleState
        setTimeout(() => {
          setBattleState(prev => {
            if (!prev) {
              battleLoopLock.current = false;
              return null;
            }
            
            console.log('🤖 Executing full enemy turn');
            
            // Step 1: Execute enemy action
            let newState = executeEnemyActionV2({ ...prev, processing: true });
            
            // Step 2: Check battle end
            const endCheck = checkBattleEnd(newState.participants);
            if (endCheck.ended) {
              battleLoopLock.current = false;
              // Don't call endBattle here, do it outside
              setTimeout(() => endBattle(endCheck.victory), 100);
              return newState;
            }
            
            // Step 3: Advance turn
            newState = advanceTurnV2(newState);
            battleLoopLock.current = false;
            
            return newState;
          });
        }, 800);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
    
    // If player turn but not waiting, set waiting flag
    if (currentP.isPlant && !battleState.waitingForPlayer && !battleState.processing) {
      console.log('🌱 Setting waitingForPlayer = true');
      setBattleState(prev => ({
        ...prev,
        waitingForPlayer: true
      }));
    }
    
  }, [battleState?.currentTurnIndex, battleState?.processing, gameView]);

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
      // Normal watering - apply to SELECTED plant only!
      setPlantHeads(prev => prev.map((head, idx) => {
        if (idx === selectedHeadIndex) {
          return {
            ...head,
            water: Math.min(head.maxWater, head.water + 2)
          };
        }
        return head;
      }));
      
      // Sync to plant state if it's the selected one
      const selectedHead = plantHeads[selectedHeadIndex];
      if (selectedHead) {
        setPlant(p => ({ ...p, water: Math.min(selectedHead.maxWater, p.water + 2), dryDays: 0 }));
      }
      
      addLog(`💧 ${plantHeads[selectedHeadIndex]?.name || 'Plant'} watered. (Inv -1, Plant +2)`);
      playSound('water');
      showNotification("+2 Water", "success");
      addFloatingNumber('+2 💧', 'heal', 'plant-water');
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
      // Normal feeding - apply to SELECTED plant only!
      setPlantHeads(prev => prev.map((head, idx) => {
        if (idx === selectedHeadIndex && head.maxNutrients > 0) {
          return {
            ...head,
            nutrients: Math.min(head.maxNutrients, head.nutrients + 2)
          };
        }
        return head;
      }));
      
      const selectedHead = plantHeads[selectedHeadIndex];
      if (selectedHead) {
        setPlant(p => ({ ...p, nutrients: Math.min(selectedHead.maxNutrients, p.nutrients + 2) }));
      }
      
      addLog(`🌱 ${plantHeads[selectedHeadIndex]?.name || 'Plant'} fertilized. (Inv -${fertilizeCost}, Plant +2)`);
      playSound('success');
      showNotification("+2 Nutrients", "success");
      addFloatingNumber('+2 🌱', 'heal', 'plant-nutrients');
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
    
    // Check if SELECTED plant is at full health
    const selectedHead = plantHeads[selectedHeadIndex];
    if (!selectedHead || selectedHead.hp >= selectedHead.maxHP) {
      addLog("❌ Selected plant is already at full health!");
      playSound('error');
      showNotification("Plant is already healthy!", "error");
      return;
    }
    
    // Heal SELECTED plant only!
    setPlantHeads(prev => prev.map((head, idx) => {
      if (idx === selectedHeadIndex) {
        return {
          ...head,
          hp: Math.min(head.maxHP, head.hp + 1)
        };
      }
      return head;
    }));
    
    if (selectedHead) {
      setPlant(p => ({ ...p, health: Math.min(selectedHead.maxHP, p.health + 1) }));
    }
    
    setEnergy(prev => {
      const newEnergy = prev - healCost;
    setRunStats(s => ({ ...s, healingsDone: s.healingsDone + 1 })); // Track stat
      if (newEnergy <= 0) {
        setGameView('normal');
      }
      return newEnergy;
    });
    addLog(`🚑 ${selectedHead.name} tended. Health +1. (-${healCost} energy)`);
    playSound('success');
    showNotification("+1 Health", "success");
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

  // ==========================================
  // BATTLE SYSTEM V2 - Clean Implementation
  // ==========================================
  
  // --- HELPER FUNCTIONS ---
  
  const generateEnemy = (currentDay) => {
    const personalities = {
      aggressive: { name: 'Aggressive', surrenderChance: 0.1, fleeChance: 0.05, attackMod: 1.2, defenseMod: 0.9 },
      cowardly: { name: 'Cowardly', surrenderChance: 0.4, fleeChance: 0.3, attackMod: 0.8, defenseMod: 1.1 },
      greedy: { name: 'Greedy', surrenderChance: 0.15, fleeChance: 0.1, attackMod: 1.0, defenseMod: 1.0 },
      tactical: { name: 'Tactical', surrenderChance: 0.2, fleeChance: 0.15, attackMod: 1.1, defenseMod: 1.1 }
    };
    
    const firstNames = ['Grim', 'Rusty', 'Shadow', 'Blade', 'Ash', 'Vex', 'Scar', 'Thorn'];
    const lastNames = ['Raider', 'Marauder', 'Scavenger', 'Bandit', 'Hunter'];
    const enemyDamageTypes = ['Gun', 'Slash', 'Pierce', 'Fire', 'Blast'];
    const plantDamageTypes = ['Pierce', 'Bite', 'Beam', 'Poison', 'Fungi', 'Physical'];
    
    const personalityKeys = Object.keys(personalities);
    const personality = personalities[personalityKeys[Math.floor(Math.random() * personalityKeys.length)]];
    
    const baseHP = 20 + (currentDay * 2);
    const baseDamage = 3 + Math.floor(currentDay / 3);
    
    return {
      id: `enemy_${Date.now()}_${Math.random()}`,
      name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
      personality: personality,
      hp: Math.floor(baseHP * personality.defenseMod),
      maxHP: Math.floor(baseHP * personality.defenseMod),
      damage: Math.floor(baseDamage * personality.attackMod),
      damageType: enemyDamageTypes[Math.floor(Math.random() * enemyDamageTypes.length)],
      weakness: plantDamageTypes[Math.floor(Math.random() * plantDamageTypes.length)],
      turnOrder: 50 + Math.floor(Math.random() * 20),
      isEnemy: true,
      isPlant: false,
      isDead: false
    };
  };
  
  const sortTurnQueue = (participants) => {
    return [...participants]
      .filter(p => !p.isDead)
      .sort((a, b) => b.turnOrder - a.turnOrder);
  };
  
  const calculateBattleDamage = (attacker, target, attackType) => {
    let damage = attacker.damage;
    const isWeakness = target.weakness === attackType;
    
    console.log('⚔️ Damage calc:', {
      attacker: attacker.name,
      baseDamage: attacker.damage,
      attackType: attackType,
      target: target.name,
      targetWeakness: target.weakness,
      isWeakness: isWeakness
    });
    
    if (isWeakness) {
      damage = Math.floor(damage * 1.5);
      console.log('⚡ WEAKNESS! Damage:', attacker.damage, '→', damage);
    }
    
    // Apply poison status if attack type is Poison
    let appliedPoison = false;
    if (attackType === 'Poison' && !target.poisoned) {
      target.poisoned = true;
      target.poisonDamage = Math.floor(attacker.damage * 0.3); // 30% of base damage per turn
      appliedPoison = true;
    }
    
    return { damage, isWeakness, appliedPoison };
  };
  
  const checkBattleEnd = (participants) => {
    const alivePlants = participants.filter(p => p.isPlant && !p.isDead);
    const aliveEnemies = participants.filter(p => p.isEnemy && !p.isDead);
    
    if (alivePlants.length === 0) {
      return { ended: true, victory: false };
    }
    
    if (aliveEnemies.length === 0) {
      return { ended: true, victory: true };
    }
    
    return { ended: false };
  };
  
  const calculateBattleRewards = (participants, currentDay) => {
    const defeatedEnemies = participants.filter(p => p.isEnemy);
    
    const waterReward = 3 + Math.floor(defeatedEnemies.length * 1.5) + Math.floor(currentDay / 5);
    const nutrientReward = 2 + defeatedEnemies.length + Math.floor(currentDay / 5);
    
    return { water: waterReward, nutrients: nutrientReward };
  };
  
  // --- MAIN BATTLE FUNCTIONS ---
  
  const startBattle = () => {
    setBattleWarning(false);
    console.log('🎮 Starting Battle V2');
    
    playSound('error');
    
    // Generate enemies
    const enemyCount = Math.min(3, 1 + Math.floor(day / 10));
    const enemies = Array.from({ length: enemyCount }, () => generateEnemy(day));
    
    // Use plantHeads directly - no sync needed! They're already correct.
    const allParticipants = [...plantHeads.map(h => ({...h})), ...enemies];
    const turnQueue = sortTurnQueue(allParticipants);
    
    const firstParticipant = turnQueue[0];
    
    console.log('⚔️ Battle participants:', {
      plants: allParticipants.filter(p => p.isPlant).map(p => p.name),
      enemies: enemies.map(e => e.name),
      firstTurn: firstParticipant.name,
      isPlayer: firstParticipant.isPlant
    });
    
    addLog(`⚔️ Battle! Facing ${enemyCount} enemies!`);
    
    setBattleState({
      participants: allParticipants,
      turnQueue: turnQueue,
      currentTurnIndex: 0,
      waitingForPlayer: firstParticipant.isPlant,
      processing: false,
      selectedTarget: null,
      dialogState: null,
      battleLog: ['⚔️ Battle started!'],
      weaknessHit: false
    });
    
    setGameView('battle');
  };
  
  const handleBattleAction = (actionType, attackType = null) => {
    if (!battleState || !battleState.waitingForPlayer || battleState.processing) {
      console.log('⚠️ Cannot act - not player turn or processing');
      return;
    }
    
    console.log('🌱 Player action:', actionType);
    
    setBattleState(prev => {
      // CRITICAL: Deep copy participants to avoid mutation!
      const newState = { 
        ...prev,
        participants: prev.participants.map(p => ({...p})),
        turnQueue: prev.turnQueue.map(p => ({...p}))
      };
      
      // CRITICAL: Get currentP from NEW state, not old!
      const currentP = newState.turnQueue[newState.currentTurnIndex];
      
      if (actionType === 'attack') {
        if (!newState.selectedTarget) return prev;
        
        const target = newState.participants.find(p => p.id === newState.selectedTarget);
        if (!target || target.isDead) return prev;
        
        const dmgResult = calculateBattleDamage(currentP, target, attackType);
        const actualDamage = dmgResult.damage;
        
        console.log('💥 BEFORE damage:', target.name, 'HP:', target.hp);
        target.hp = Math.max(0, target.hp - actualDamage);
        console.log('💥 AFTER damage:', target.name, 'HP:', target.hp, '(reduced by', actualDamage, ')');
        
        target.isDead = target.hp <= 0;
        
        // Add damage number animation
        const damageNumberId = `dmg_${Date.now()}_${Math.random()}`;
        if (!newState.damageNumbers) newState.damageNumbers = [];
        newState.damageNumbers.push({
          id: damageNumberId,
          value: `-${actualDamage}`,
          targetId: target.id,
          isWeakness: dmgResult.isWeakness,
          timestamp: Date.now()
        });
        
        // Remove damage number after animation
        setTimeout(() => {
          setBattleState(s => {
            if (!s) return null;
            return {
              ...s,
              damageNumbers: (s.damageNumbers || []).filter(d => d.id !== damageNumberId)
            };
          });
        }, 1500);
        
        if (dmgResult.isWeakness) {
          newState.battleLog = [...newState.battleLog, `${currentP.name} attacks ${target.name} for ${actualDamage} damage! ⚡ WEAKNESS!`];
          newState.weaknessHit = true;
          setTimeout(() => {
            setBattleState(s => s ? ({ ...s, weaknessHit: false }) : null);
          }, 2000);
          
          // WEAKNESS BONUS: Move attacker UP in turn order!
          // Find current position in turnQueue
          const currentIndex = newState.currentTurnIndex;
          
          if (currentIndex > 0) {
            // Not already first - swap with previous
            const temp = newState.turnQueue[currentIndex - 1];
            newState.turnQueue[currentIndex - 1] = newState.turnQueue[currentIndex];
            newState.turnQueue[currentIndex] = temp;
            newState.currentTurnIndex = currentIndex - 1;
            newState.battleLog = [...newState.battleLog, `⚡ ${currentP.name} moves up in turn order!`];
          } else {
            // Already first - move another PLANT up if exists
            const otherPlantIndex = newState.turnQueue.findIndex((p, idx) => 
              idx > 0 && p.isPlant && !p.isDead && p.id !== currentP.id
            );
            if (otherPlantIndex > 0) {
              const otherPlant = newState.turnQueue[otherPlantIndex];
              // Swap with previous
              const temp = newState.turnQueue[otherPlantIndex - 1];
              newState.turnQueue[otherPlantIndex - 1] = newState.turnQueue[otherPlantIndex];
              newState.turnQueue[otherPlantIndex] = temp;
              newState.battleLog = [...newState.battleLog, `⚡ ${otherPlant.name} moves up in turn order!`];
            }
          }
        } else {
          newState.battleLog = [...newState.battleLog, `${currentP.name} attacks ${target.name} for ${actualDamage} damage!`];
        }
        
        // If poison was applied
        if (dmgResult.appliedPoison) {
          newState.battleLog = [...newState.battleLog, `☠️ ${target.name} is poisoned!`];
        }
        
        // If target died, re-sort queue and find current plant's new position
        if (target.isDead) {
          console.log('⚰️ Target died, re-sorting queue');
          newState.turnQueue = sortTurnQueue(newState.participants);
          newState.currentTurnIndex = newState.turnQueue.findIndex(p => p.id === currentP.id);
          console.log('📍 Plant new index after death:', newState.currentTurnIndex);
        }
      } else if (actionType === 'heal') {
        currentP.hp = Math.min(currentP.maxHP, currentP.hp + 3);
        
        // CRITICAL: Sync change to participants array too!
        const participantIndex = newState.participants.findIndex(p => p.id === currentP.id);
        if (participantIndex !== -1) {
          newState.participants[participantIndex].hp = currentP.hp;
        }
        
        newState.battleLog = [...newState.battleLog, `${currentP.name} heals +3 HP!`];
        
        // Add heal number
        const healNumberId = `heal_${Date.now()}_${Math.random()}`;
        if (!newState.damageNumbers) newState.damageNumbers = [];
        newState.damageNumbers.push({
          id: healNumberId,
          value: '+3',
          targetId: currentP.id,
          isHeal: true,
          timestamp: Date.now()
        });
        setTimeout(() => {
          setBattleState(s => {
            if (!s) return null;
            return { ...s, damageNumbers: (s.damageNumbers || []).filter(d => d.id !== healNumberId) };
          });
        }, 1500);
      } else if (actionType === 'water') {
        currentP.water = Math.min(currentP.maxWater, currentP.water + 2);
        
        // CRITICAL: Sync change to participants array too!
        const participantIndex = newState.participants.findIndex(p => p.id === currentP.id);
        if (participantIndex !== -1) {
          newState.participants[participantIndex].water = currentP.water;
        }
        
        newState.battleLog = [...newState.battleLog, `${currentP.name} restores +2 💧!`];
      } else if (actionType === 'feed') {
        currentP.nutrients = Math.min(currentP.maxNutrients, currentP.nutrients + 2);
        
        // CRITICAL: Sync change to participants array too!
        const participantIndex = newState.participants.findIndex(p => p.id === currentP.id);
        if (participantIndex !== -1) {
          newState.participants[participantIndex].nutrients = currentP.nutrients;
        }
        
        newState.battleLog = [...newState.battleLog, `${currentP.name} restores +2 🌱!`];
      }
      
      newState.selectedTarget = null;
      newState.waitingForPlayer = false;
      newState.processing = true;
      
      return newState;
    });
    
    playSound('click');
    
    // Check battle end and advance turn
    setTimeout(() => {
      setBattleState(prev => {
        if (!prev) return null;
        
        const endCheck = checkBattleEnd(prev.participants);
        if (endCheck.ended) {
          endBattle(endCheck.victory);
          return prev;
        }
        
        // Advance turn
        return advanceTurnV2(prev);
      });
    }, 800);
  };
  
  const handleTargetSelect = (targetId) => {
    if (!battleState) return;
    
    setBattleState(prev => ({
      ...prev,
      selectedTarget: targetId
    }));
  };
  
  const executeEnemyActionV2 = (state) => {
    console.log('🤖 Enemy action');
    
    // CRITICAL: Deep copy participants to avoid mutation!
    const newState = { 
      ...state,
      participants: state.participants.map(p => ({...p})),
      turnQueue: state.turnQueue.map(p => ({...p}))
    };
    const enemy = newState.turnQueue[newState.currentTurnIndex];
    
    // Apply poison damage at START of enemy turn
    if (enemy.poisoned && enemy.poisonDamage) {
      enemy.hp = Math.max(0, enemy.hp - enemy.poisonDamage);
      newState.battleLog = [...newState.battleLog, `☠️ ${enemy.name} takes ${enemy.poisonDamage} poison damage!`];
      
      // Sync to participants
      const enemyInParticipants = newState.participants.find(p => p.id === enemy.id);
      if (enemyInParticipants) {
        enemyInParticipants.hp = enemy.hp;
        enemyInParticipants.isDead = enemy.hp <= 0;
        enemy.isDead = enemy.hp <= 0;
      }
      
      // If enemy died from poison, skip their action
      if (enemy.isDead) {
        console.log('☠️ Enemy died from poison!');
        newState.turnQueue = sortTurnQueue(newState.participants);
        newState.processing = true;
        return newState;
      }
    }
    
    const alivePlants = newState.participants.filter(p => p.isPlant && !p.isDead);
    if (alivePlants.length === 0) return newState;
    
    // Random action
    const actions = ['attack', 'steal_water', 'steal_nutrients'];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const target = alivePlants[Math.floor(Math.random() * alivePlants.length)];
    
    playSound('error');
    
    if (action === 'attack') {
      const dmgResult = calculateBattleDamage(enemy, target, enemy.damageType);
      target.hp = Math.max(0, target.hp - dmgResult.damage);
      target.isDead = target.hp <= 0;
      newState.battleLog = [...newState.battleLog, `${enemy.name} attacks ${target.name} for ${dmgResult.damage} damage!`];
      
      // Add damage number for enemy attack
      if (!newState.damageNumbers) newState.damageNumbers = [];
      newState.damageNumbers.push({
        id: `dmg_enemy_${Date.now()}_${Math.random()}`,
        value: `-${dmgResult.damage}`,
        targetId: target.id,
        isWeakness: false,
        timestamp: Date.now()
      });
      
      // If target died, re-sort queue and find enemy's new position
      if (target.isDead) {
        console.log('⚰️ Target died, re-sorting queue');
        newState.turnQueue = sortTurnQueue(newState.participants);
        newState.currentTurnIndex = newState.turnQueue.findIndex(p => p.id === enemy.id);
        console.log('📍 Enemy new index after death:', newState.currentTurnIndex);
      }
    } else if (action === 'steal_water') {
      target.water = Math.max(0, target.water - 2);
      newState.battleLog = [...newState.battleLog, `${enemy.name} steals 2 💧 from ${target.name}!`];
    } else {
      target.nutrients = Math.max(0, target.nutrients - 2);
      newState.battleLog = [...newState.battleLog, `${enemy.name} steals 2 🌱 from ${target.name}!`];
    }
    
    newState.processing = true;
    
    return newState;
  };
  
  const advanceTurnV2 = (state) => {
    console.log('➡️ Advancing turn (SIMPLIFIED)');
    
    const newState = { ...state };
    newState.weaknessHit = false;
    
    // SIMPLE INCREMENT - No re-sorting here!
    // Re-sorting only happens when someone dies
    newState.currentTurnIndex = (newState.currentTurnIndex + 1) % newState.turnQueue.length;
    
    const nextP = newState.turnQueue[newState.currentTurnIndex];
    
    console.log('✅ Next turn:', {
      participant: nextP?.name,
      index: newState.currentTurnIndex,
      isPlayer: nextP?.isPlant,
      queueLength: newState.turnQueue.length
    });
    
    if (nextP.isPlant) {
      newState.waitingForPlayer = true;
      newState.processing = false;
    } else {
      newState.waitingForPlayer = false;
      newState.processing = false;
    }
    
    return newState;
  };
  
  const endBattle = (victory) => {
    if (!battleState) {
      console.log('⚠️ endBattle called but battleState is null, ignoring');
      return;
    }
    
    console.log('✅ Battle ended, victory:', victory);
    
    if (victory) {
      const rewards = calculateBattleRewards(battleState.participants, day);
      
      // Don't add to stock - battles don't give stock resources
      // Resources are synced from battle back to plant below
      
      playSound('success');
      addLog(`⚔️ Victory!`);
      showNotification(`Victory!`, 'success');
      
      // Sync plant HP/water/nutrients back to plantHeads
      const updatedHeads = plantHeads.map(head => {
        const battleHead = battleState.participants.find(p => p.id === head.id);
        if (battleHead) {
          return {
            ...head,
            hp: battleHead.hp,
            water: battleHead.water,
            nutrients: battleHead.nutrients
          };
        }
        return head;
      });
      
      // Remove dead plants
      const aliveHeads = updatedHeads.filter(h => h.hp > 0);
      
      // Check if ALL plant heads are dead → GAME OVER
      if (aliveHeads.length === 0) {
        playSound('error');
        addLog('💀 All plants died... Game Over!');
        setGameView('dead');
        setBattleState(null);
        return;
      }
      
      // Update plantHeads with only alive plants
      setPlantHeads(aliveHeads);
      
      // If some plants died, show message
      const deadCount = updatedHeads.length - aliveHeads.length;
      if (deadCount > 0) {
        addLog(`💀 ${deadCount} plant${deadCount > 1 ? 's' : ''} died in battle...`);
        showNotification(`${deadCount} plant${deadCount > 1 ? 's' : ''} lost`, 'error');
      }
      
      // Sync first alive plant head to main plant state (new "main")
      const firstAlive = aliveHeads[0];
      if (firstAlive) {
        setPlant(prev => ({
          ...prev,
          health: firstAlive.hp,
          water: firstAlive.water,
          nutrients: firstAlive.nutrients
        }));
        
        // Reset selectedHeadIndex if out of bounds
        if (selectedHeadIndex >= aliveHeads.length) {
          setSelectedHeadIndex(0);
        }
      }
    } else {
      playSound('error');
      addLog('💀 Defeated...');
      setGameView('dead');
      setBattleState(null);
      return;
    }
    
    setBattleState(null);
    setBattleWarning(false);
    setBattleCompleted(true);
    console.log('✅ Battle ended, battleCompleted set to TRUE');
    setGameView('normal');
  };

  // Acțiune: Somn / Trecerea Timpului
  const sleep = () => {
    if (timeOfDay === 'morning') {
      setTimeOfDay('afternoon');
      showTimeTransition('AFTERNOON', '🌅');
      playSound('success');
      addLog("🌅 Afternoon approaches.");
      setBattleCompleted(false); // Reset for next afternoon
    } else if (timeOfDay === 'afternoon') {
      // Check if ANY plant has nocturnal bonus
      const hasNocturnal = plantHeads.some(head => head.plantTypeData?.nightEnergyBonus);
      const nocturnalBonus = hasNocturnal ? 2 : 0;
      const baseNightEnergy = 1 + nocturnalBonus;
      
      setEnergy(baseNightEnergy);
      setTimeOfDay('night');
      showTimeTransition('NIGHT', '🌙');
      playSound('success');
      setBattleCompleted(false); // Reset for next day
      
      if (hasNocturnal) {
        addLog(`🌙 Night falls. You recover ${baseNightEnergy} energy (🍄 Nocturnal bonus!)`);
      } else {
        addLog(`🌙 Night falls. You recover ${baseNightEnergy} energy.`);
      }
    } else {
      startNewDay();
    }
  };

// NEW FUNCTION: Send save data to backend
const saveToCloud = async () => {
  if (!user || !user.email) return; // Don't save if not logged in

  const gameState = { 
    day, water, nutrients, energy, plant, timeOfDay,
    plantConsumptionRate, difficultyLevel 
  };

  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    // This sends the data to your Node.js server
    await fetch('http://localhost:5000/api/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // 🔐 This is the "Key" for the lock
      },
      body: JSON.stringify({ 
        email: user.email, 
        gameState: gameState 
      })
    });
    console.log("☁️ Cloud Save Complete");
  } catch (error) {
    console.error("❌ Cloud Save Failed:", error);
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
    
    // ☀️ SUNNY: +2 nutrients la TOATE plantele
    if (nextDayWeather === 'sunny') {
      // Apply to ALL plant heads that need nutrients
      setPlantHeads(prev => prev.map(head => ({
        ...head,
        nutrients: head.maxNutrients > 0 ? Math.min(head.maxNutrients, head.nutrients + 2) : head.nutrients
      })));
      
      setPlant(p => ({ 
        ...p, 
        nutrients: Math.min(plantType.maxNutrients, p.nutrients + 2) 
      }));
      addLog(`☀️ Sunny day! All plants get +2 nutrients!`);
      showNotification("Sunny! +2 🌱 to all", "success");
      addFloatingNumber('+2 🌱', 'heal', 'plant-nutrients');
    }
    
    // 🌧️ RAINY: Umple water bar complet pentru TOATE plantele, no overwater damage
    if (nextDayWeather === 'rainy') {
      // Fill ALL plant heads
      setPlantHeads(prev => prev.map(head => ({
        ...head,
        water: head.maxWater
      })));
      
      setPlant(p => ({ 
        ...p, 
        water: plantType.maxWater,
        overwateredDays: 0 // Clear overwater debuff!
      }));
      addLog(`🌧️ Rain! All plants water filled to max!`);
      showNotification("Rain filled all water! 💧", "success");
      addFloatingNumber('🌧️ Max Water!', 'heal', 'plant-water');
    }
    
    // ❄️ SNOWY: FREEZE - 0 consumption today (except nutrients can still grow from sunny bonuses)
    // This is handled in sleep() function with a flag
    
    // ⛈️ THUNDERSTORM: Locked inside (doar Sleep), +2 water la TOATE plantele
    if (nextDayWeather === 'thunderstorm') {
      // Apply to ALL plant heads
      setPlantHeads(prev => prev.map(head => ({
        ...head,
        water: Math.min(head.maxWater, head.water + 2)
      })));
      
      setPlant(p => ({ 
        ...p, 
        water: Math.min(plantType.maxWater, p.water + 2)
      }));
      addLog(`⛈️ Thunderstorm! All plants get +2 water!`);
      showNotification("Thunderstorm! +2 💧 to all", "success");
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
    
    // Check if ANY plant has nocturnal bonus
    const hasNocturnal = plantHeads.some(head => head.plantTypeData?.nightEnergyBonus);
    const nocturnalBonus = hasNocturnal ? 2 : 0;
    
    // Well-rested buff: If you slept early (with energy left), get +1 max energy
    if (energy > 0) {
      setWellRested(true);
      const bonusEnergy = 3 + nocturnalBonus;
      setMaxEnergy(bonusEnergy);
      setEnergy(bonusEnergy);
      if (hasNocturnal) {
        addLog(`✨ Well rested + Nocturnal! Max energy: ${bonusEnergy}`);
      } else {
        addLog("✨ Well rested! Max energy: 3 (can do 3-day expedition)");
      }
    } else {
      setWellRested(false);
      const normalEnergy = 2 + nocturnalBonus;
      setMaxEnergy(normalEnergy);
      setEnergy(normalEnergy);
      if (hasNocturnal) {
        addLog(`💤 Restless night. Max energy: ${normalEnergy} (🍄 Nocturnal bonus!)`);
      } else {
        addLog("💤 A restless night. Max energy: 2");
      }
    }

    // Plant consumption - Apply to ALL plant heads!
    const totalPlantCount = plantHeads.length;
    const actualWaterPerPlant = currentWeather === 'snowy' ? 0 : waterConsumptionRate;
    const actualNutrientsPerPlant = currentWeather === 'snowy' ? 0 : nutrientConsumptionRate;
    
    if (currentWeather === 'snowy') {
      addLog(`❄️ Snowy day! All plants frozen - no consumption!`);
      showNotification("Frozen! No consumption", "success");
    } else {
      addLog(`🌙 Night passed. Each plant consumed ${actualWaterPerPlant} 💧 & ${actualNutrientsPerPlant} 🌱`);
    }
    
    // Update ALL plant heads with consumption
    setPlantHeads(prev => prev.map(head => {
      const newWater = Math.max(0, head.water - actualWaterPerPlant);
      const newNutrients = Math.max(0, head.nutrients - actualNutrientsPerPlant);
      let newHP = head.hp;
      
      // Health degradation if nutrients are low
      if (head.nutrients < 3 && head.maxNutrients > 0) {
        newHP = Math.max(0, newHP - 1);
      }
      
      return {
        ...head,
        water: newWater,
        nutrients: newNutrients,
        hp: newHP
      };
    }));
    
    // Also update main plant state for compatibility
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

        dryDays: newDryDays,
        overwateredDays: newOverwateredDays,
        damagedRootsDays: newDamagedRootsDays
      };
    });

    // Check Disaster
    if (newDay === nextDisasterDay) {
        triggerDisaster(newDay);
    }

    saveToCloud();

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
          // Apply to ALL plant heads
          setPlantHeads(prev => prev.map(head => ({
            ...head,
            hp: Math.max(0, head.hp - totalDamage)
          })));
          
          setPlant(p => ({...p, health: Math.max(0, p.health - totalDamage)}));
          addLog(`🌋 Earthquake damaged all plants for ${totalDamage} damage!`);
          showNotification(`EARTHQUAKE! -${totalDamage} HP to all`, "disaster");
          addFloatingNumber(`-${totalDamage} ❤️`, 'damage', 'plant-health');
      } else if (nextDisasterType === 'Flood') {
          // FLOOD: Saturează TOATE plantele cu apă DAR dă debuff overwatered + root damage
          setPlantHeads(prev => prev.map(head => ({
            ...head,
            water: head.maxWater, // Fill to max!
            hp: Math.max(0, head.hp - 1) // Root suffocation
          })));
          
          setPlant(p => ({
            ...p, 
            water: plantType.maxWater,
            health: Math.max(0, p.health - 1),
            overwateredDays: 2
          }));
          addLog(`☔ FLOOD submerged all plants! Root suffocation: -1 HP each.`);
          showNotification(`FLOOD! All plants damaged`, "disaster");
          addFloatingNumber('+MAX 💧', 'heal', 'plant-water');
          addFloatingNumber('-1 ❤️', 'damage', 'plant-health');
          addFloatingNumber('☔ Flooded!', 'damage', 'center');
      } else if (nextDisasterType === 'Landslide') {
          // LANDSLIDE: Damage instant to ALL plants
          const landslideDamage = totalDamage + 1;
          
          setPlantHeads(prev => prev.map(head => ({
            ...head,
            hp: Math.max(0, head.hp - landslideDamage)
          })));
          
          setPlant(p => ({
            ...p,
            health: Math.max(0, p.health - landslideDamage),
            damagedRootsDays: 3
          }));
          addLog(`🪨 LANDSLIDE crushed all plants! -${landslideDamage} HP each.`);
          showNotification(`LANDSLIDE! All plants damaged`, "disaster");
          addFloatingNumber(`-${landslideDamage} ❤️`, 'damage', 'plant-health');
          addFloatingNumber('🪨 Landslide!', 'damage', 'center');
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

// 🟢 TITLE SCREEN WITH TWO BUTTONS
  if (viewState === 'title') {
    return (
      <div className="auth-wrapper">
        <h1 className="game-title">
          <img src="/assets/plant.wide.open.mouth.png" alt="" className="title-icon left-icon" />
          PLANT GAME
          <img src="/assets/plant.wide.open.mouth.png" alt="" className="title-icon right-icon" />
        </h1>
        
        <div className="game-subtitle">Pixel Garden Adventure</div>

        {/* 🆕 BUTTON GROUP */}
        <div className="title-menu">
          
          {/* Button 1: Play / Login */}
          <button className="press-start-btn" onClick={() => setViewState('login')}>
            ▶ RESUME GAME
          </button>
          
          {/* Button 2: Register */}
          <button className="new-game-btn" onClick={() => setViewState('register')}>
            ★ NEW GARDENER
          </button>

        </div>

        <div className="version-tag">v1.0</div>
      </div>
    );
  }
  // 🟢 END NEW BLOCK

  if (viewState === 'login') {
    return (
      <div className="auth-wrapper">
        <Login 
          switchToRegister={() => setViewState('register')} 
          onLoginSuccess={(u) => { setUser(u); setViewState('game'); }} 
          // 🟢 ADD THIS: Allow going back to Title
          onBack={() => setViewState('title')} 
        />
      </div>
    );
  }

  if (viewState === 'register') {
    return (
      <div className="auth-wrapper">
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
      
      {/* Butoane Utilitare Direct pe Ecran */}
<div className="utility-buttons-container">
  <button className="utility-btn" onClick={() => {
    localStorage.clear();
    sessionStorage.clear();
    setUser(null);
    setViewState('title');
  }}>
    LOG OUT
  </button>
  
  <button className="utility-btn restart-btn-top" onClick={restart}>
    RESTART
  </button>
</div>

      {/* Moon Phase - Top Right Corner */}
{/* ☀️/🌙 Indicator dinamic în colț */}
<div 
  className="moon-phase-corner clickable" 
  onClick={() => setMoonCalendarExpanded(!moonCalendarExpanded)}
>
<div className={`moon-phase-emoji ${timeOfDay === 'morning' ? 'is-sun' : ''}`}>
  {timeOfDay === 'morning' ? '☀️' : getMoonPhase(day).emoji}
</div>
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
<div className="room-view" style={{ 
  gridColumn: '2', 
  justifySelf: 'center', 
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  alignItems: 'center',
  marginTop: '150px',
  marginRight: '30px',
  height: '60vh', 
  width: '100%', 
  maxWidth: '850px',

}}>

{/* 📅 WALL CALENDAR */}
    <div style={{
      position: 'absolute',
      top: '100px',
      left: '60px', /* Near the window */
      width: '100px',
      height: '110px',
      background: '#ffffffff',
      border: '4px solid #3d1f08',
      boxShadow: '4px 4px 0 rgba(0,0,0,0.2)',
      zIndex: 5,
      display: 'flex',
      flexDirection: 'column',
      textAlign: 'center',
      transform: 'rotate(-2deg)', /* Slight tilt makes it look natural */
      transformOrigin: 'top center'
    }}>
      {/* Nail */}
      <div style={{position:'absolute', top:'-8px', left:'50%', transform:'translateX(-50%)', width:'8px', height:'8px', background:'#333', borderRadius:'50%'}}></div>
      
      {/* Red Header */}
      <div style={{background: '#d64545', color:'white', fontFamily:'"VT323", monospace', padding:'4px 0', borderBottom:'2px solid #3d1f08'}}>
        {currentSeason.name.toUpperCase()}
      </div>
      
      {/* Paper Body */}
      <div style={{flex: 1, display:'flex', flexDirection:'column', justifyContent:'center', color:'#3d1f08'}}>
        <div style={{fontSize:'3.5rem', lineHeight:'0.9', fontWeight:'bold', fontFamily:'"VT323", monospace'}}>{day}</div>
        <div style={{fontSize:'0.8rem', fontFamily:'"VT323", monospace', color:'#888'}}>DAY OF {maxDays}</div>
      </div>
    </div>

 {/* GEAMUL: Folosește clasele dinamice pentru a vedea cerul prin el */}
  <div className={`window-glass weather-${currentWeather} time-${timeOfDay}`} style={{
    width: '40%',
    height: '50%',
    position: 'absolute',
    top: '15%',
    border: '6px solid #5c382eff',
    zIndex: 1,
    boxShadow: 'inset 0 0 20px #ffcd2881'
  }}>

{currentWeather === 'rainy' && (
      <div className="weather-overlay rain-overlay">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="rain-drop" style={{ left: `${Math.random() * 100}%` }}></div>
        ))}
      </div>
    )}

    {/* Grilaj geam pentru aspect mai drăguț */}
    <div style={{ position: 'absolute', top: '50%', width: '100%', height: '5px', background: '#5c382eff' }}></div>
    <div style={{ position: 'absolute', left: '50%', height: '100%', width: '5px', background: '#5c382eff' }}></div>
  </div>

  {/* 🪵 PODEAUA CAMEREI */}
  <div className="room-floor" style={{ 
    width: '100%', 
    height: '25%', 
    background: '#b1917fff', 
    borderTop: '6px solid #c5a491ff',
    zIndex: 1
  }}></div>

  {/* Planta și Fata: Vor sta în fața geamului */}
  <div style={{ display: 'flex', alignItems: 'flex-end', zIndex: 10, marginTop: '25%'}}>
     <img src={plantType.image} style={{ width: '300px', height: 'auto', imageRendering: 'pixelated' }} />
     <img 
        src={user?.character === 'boy' ? "/assets/boy.png" : "/assets/girl.png"} 
        style={{ width: '300px', height: 'auto', imageRendering: 'pixelated' }} 
     />
</div>
  {/* Panou Dreapta */}
  <div className="plant-panel stats-panel">...</div>
</div>


  {/*INVENTORY */}
  <div className="stats-panel inventory-panel"> ... </div>
        {/* INVENTORY PANEL (Left Side) */}
        <div className="stats-panel inventory-panel">
          <div className="stats-panel-section">
            <div className="stats-panel-title">Inventory</div>
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
            
            {/* SINGLE PLANT DISPLAY WITH SWAPPING */}
            {plantHeads && plantHeads.length > 0 && (() => {
              // Safety: Ensure selectedHeadIndex is valid
              const safeIndex = Math.min(selectedHeadIndex, plantHeads.length - 1);
              const currentHead = plantHeads[safeIndex];
              
              if (!currentHead) {
                console.error('No currentHead found!', {selectedHeadIndex, safeIndex, plantHeadsLength: plantHeads.length});
                return null;
              }
              
              return (
                <div style={{
                  background: 'rgba(81, 207, 102, 0.1)',
                  border: '2px solid #51cf66',
                  borderRadius: '8px',
                  padding: '10px',
                  marginBottom: '10px',
                  position: 'relative'
                }}>
                  {/* Plant Header with Arrows */}
                  <div style={{
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    marginBottom: '10px'
                  }}>
                    {/* Left Arrow */}
                    {plantHeads.length > 1 && (
                      <button 
                        onClick={() => setSelectedHeadIndex((selectedHeadIndex - 1 + plantHeads.length) % plantHeads.length)}
                        style={{
                          background: 'rgba(81, 207, 102, 0.2)',
                          border: '1px solid #51cf66',
                          borderRadius: '5px',
                          color: 'white',
                          fontSize: '1.2rem',
                          padding: '5px 10px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(81, 207, 102, 0.4)'}
                        onMouseLeave={(e) => e.target.style.background = 'rgba(81, 207, 102, 0.2)'}
                      >
                        ◀
                      </button>
                    )}
                    
                    {/* Plant Name & Emoji */}
                    <div style={{flex: 1, textAlign: 'center'}}>
                      <div style={{fontSize: '2rem', marginBottom: '5px'}}>{currentHead.emoji}</div>
                      <div style={{fontWeight: 'bold', fontSize: '1.1rem'}}>
                        {currentHead.name}
                      </div>
                      {plantHeads.length > 1 && (
                        <div style={{fontSize: '0.8rem', color: '#888', marginTop: '3px'}}>
                          Plant {selectedHeadIndex + 1}/{plantHeads.length}
                        </div>
                      )}
                    </div>
                    
                    {/* Right Arrow */}
                    {plantHeads.length > 1 && (
                      <button 
                        onClick={() => setSelectedHeadIndex((selectedHeadIndex + 1) % plantHeads.length)}
                        style={{
                          background: 'rgba(81, 207, 102, 0.2)',
                          border: '1px solid #51cf66',
                          borderRadius: '5px',
                          color: 'white',
                          fontSize: '1.2rem',
                          padding: '5px 10px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(81, 207, 102, 0.4)'}
                        onMouseLeave={(e) => e.target.style.background = 'rgba(81, 207, 102, 0.2)'}
                      >
                        ▶
                      </button>
                    )}
                  </div>
                  
                  {/* HP Bar - Single bar only */}
                  <div className="stat-row">
                    <div className="stat-label">❤️ Health {currentHead.hp < 3 ? '⚠️' : ''}</div>
                    <div className={`stat-value ${currentHead.hp < 3 ? 'warning' : ''}`}>{currentHead.hp} / {currentHead.maxHP}</div>
                  </div>
                  <div className="stat-bar">
                    <div className="stat-bar-fill" style={{width: `${(currentHead.hp / currentHead.maxHP) * 100}%`}}></div>
                  </div>
                  
                  {/* Water Bar */}
                  <div className="stat-row">
                    <div className="stat-label">💧 Water {currentHead.water < 3 ? '⚠️' : ''}</div>
                    <div className={`stat-value ${currentHead.water < 3 ? 'warning' : ''}`}>{currentHead.water} / {currentHead.maxWater}</div>
                  </div>
                  <div className="stat-bar">
                    <div className="stat-bar-fill water-bar" style={{width: `${(currentHead.water / currentHead.maxWater) * 100}%`}}></div>
                  </div>
                  
                  {/* Nutrients Bar (if applicable) */}
                  {currentHead.maxNutrients > 0 && (
                    <>
                      <div className="stat-row">
                        <div className="stat-label">🌱 Nutrients {currentHead.nutrients < 3 ? '⚠️' : ''}</div>
                        <div className={`stat-value ${currentHead.nutrients < 3 ? 'warning' : ''}`}>{currentHead.nutrients} / {currentHead.maxNutrients}</div>
                      </div>
                      <div className="stat-bar">
                        <div className="stat-bar-fill nutrient-bar" style={{width: `${(currentHead.nutrients / currentHead.maxNutrients) * 100}%`}}></div>
                      </div>
                    </>
                  )}
                  
                  {/* Carnivorous Indicator */}
                  {currentHead.maxNutrients === 0 && (
                    <div style={{
                      background: 'rgba(255, 107, 107, 0.2)',
                      border: '1px solid #ff6b6b',
                      borderRadius: '5px',
                      padding: '8px',
                      marginTop: '8px',
                      textAlign: 'center',
                      color: '#ff6b6b',
                      fontSize: '0.9rem'
                    }}>
                      🦟 Carnivorous - Catches own food!
                    </div>
                  )}
                </div>
              );
            })()}
            
            {/* Consumption Info Panel */}
            <div className="consumption-info">
              <div className="consumption-label">🌙Nightly Consumption:</div>
              
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
                      <div className="action-menu-title">🌿 Plant Care </div>
                    </div>
                    <div className="action-menu-item" onClick={() => setGameView('expedition-menu')}>
                      <div className="action-menu-title">🎒 Expedition </div>
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
                {/* After battle completed - show continue */}
                {battleCompleted && (
                  <div className="action-menu-item" onClick={sleep}>
                    <div className="action-menu-title">🌙 Continue to Night</div>
                    <div className="action-menu-subtitle">✅ Battle complete!</div>
                  </div>
                )}
                
                {/* Battle triggers on Sunny, Overcast, or Snowy - only if not completed */}
                {!battleCompleted && (currentWeather === 'sunny' || currentWeather === 'overcast' || currentWeather === 'snowy') && !battleWarning && (
                  <div className="action-menu-item" onClick={() => setBattleWarning(true)}>
                    <div className="action-menu-title">⚔️ DEFEND!</div>
                    <div className="action-menu-subtitle">⚠️ Attackers approaching!</div>
                  </div>
                )}
                {!battleCompleted && battleWarning && (
                  <div className="action-menu-item danger" onClick={startBattle}>
                    <div className="action-menu-title">⚔️ START BATTLE!</div>
                    <div className="action-menu-subtitle">Fight for survival!</div>
                  </div>
                )}
                {/* No battles on rainy/thunderstorm - can skip */}
                {!battleCompleted && (currentWeather === 'rainy' || currentWeather === 'thunderstorm') && (
                  <div className="action-menu-item" onClick={sleep}>
                    <div className="action-menu-title">🌙 To Night</div>
                    <div className="action-menu-subtitle">Safe from attackers</div>
                  </div>
                )}
                {!battleCompleted && !battleWarning && (currentWeather === 'sunny' || currentWeather === 'overcast' || currentWeather === 'snowy') && (
                  <div className="action-menu-item disabled">
                    <div className="action-menu-title">🌙 To Night</div>
                    <div className="action-menu-subtitle">Must defend first!</div>
                  </div>
                )}
                {!battleCompleted && battleWarning && (
                  <div className="action-menu-item disabled">
                    <div className="action-menu-title">❌ Can't Skip</div>
                    <div className="action-menu-subtitle">Must fight!</div>
                  </div>
                )}
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

            {/* BATTLE UI */}
            {battleState && gameView === 'battle' && (
              <div className="battle-screen">
                <div className="battle-background"></div>
                
                {/* Turn Order Panel - LEFT SIDE */}
                <div className="turn-order-panel">
                  <div className="turn-order-title">⚔️ Turn Order</div>
                  <div className="turn-order-list">
                    {battleState.turnQueue?.map((p, idx) => (
                      <div 
                        key={p.id}
                        className={`turn-order-item ${idx === battleState.currentTurnIndex ? 'current-turn' : ''} ${p.isDead ? 'dead' : ''}`}
                      >
                        <div className="turn-order-icon">{p.emoji || '👤'}</div>
                        <div className="turn-order-name">{p.name}</div>
                        <div className="turn-order-hp">{p.hp}/{p.maxHP}</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Enemies Display - TOP CENTER */}
                <div className="battle-enemies">
                  {battleState.participants?.filter(p => p.isEnemy && !p.isDead).map(enemy => (
                    <div 
                      key={enemy.id}
                      className={`battle-enemy ${battleState.selectedTarget === enemy.id ? 'targeted' : ''}`}
                      onClick={() => handleTargetSelect(enemy.id)}
                    >
                      <div className="enemy-sprite">👤</div>
                      <div className="enemy-name">{enemy.name}</div>
                      <div className="hp-bar-container">
                        <div 
                          className="hp-bar-fill"
                          style={{ width: `${(enemy.hp / enemy.maxHP) * 100}%` }}
                        ></div>
                        <div className="hp-bar-text">{enemy.hp}/{enemy.maxHP}</div>
                      </div>
                      <div className="weakness-indicator">Weak: {enemy.weakness}</div>
                    </div>
                  ))}
                </div>
                
                {/* Plants Display - BOTTOM */}
                <div className="battle-plants">
                  {battleState.participants?.filter(p => p.isPlant && !p.isDead).map(plant => (
                    <div 
                      key={plant.id}
                      className={`battle-plant ${plant.id === battleState.turnQueue?.[battleState.currentTurnIndex]?.id ? 'current-turn-plant' : ''}`}
                    >
                      <div className="plant-sprite">{plant.emoji}</div>
                      <div className="plant-name">{plant.name}</div>
                      
                      <div className="stat-bar-container">
                        <div className="stat-label">❤️ HP</div>
                        <div className="stat-bar">
                          <div className="stat-bar-fill hp" style={{ width: `${(plant.hp / plant.maxHP) * 100}%` }}></div>
                          <div className="stat-bar-text">{plant.hp}/{plant.maxHP}</div>
                        </div>
                      </div>
                      
                      <div className="stat-bar-container">
                        <div className="stat-label">💧 Water</div>
                        <div className="stat-bar">
                          <div className="stat-bar-fill water" style={{ width: `${(plant.water / plant.maxWater) * 100}%` }}></div>
                          <div className="stat-bar-text">{plant.water}/{plant.maxWater}</div>
                        </div>
                      </div>
                      
                      {plant.maxNutrients > 0 && (
                        <div className="stat-bar-container">
                          <div className="stat-label">🌱 Nutrients</div>
                          <div className="stat-bar">
                            <div className="stat-bar-fill nutrients" style={{ width: `${(plant.nutrients / plant.maxNutrients) * 100}%` }}></div>
                            <div className="stat-bar-text">{plant.nutrients}/{plant.maxNutrients}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Action Menu - BOTTOM RIGHT - Only when waitingForPlayer */}
                {battleState.waitingForPlayer && !battleState.processing && (
                  <div className="battle-action-menu">
                    <div className="battle-action-title">
                      {battleState.turnQueue?.[battleState.currentTurnIndex]?.name}'s Turn
                    </div>
                    
                    <div className="battle-actions">
                      {/* ATTACK SECTION */}
                      <div className="action-section-title">⚔️ ATTACK</div>
                      
                      <button 
                        className="battle-action-btn attack"
                        onClick={() => handleBattleAction('attack', battleState.turnQueue?.[battleState.currentTurnIndex]?.damageType)}
                        disabled={!battleState.selectedTarget}
                      >
                        <div className="action-icon">⚔️</div>
                        <div className="action-name">{battleState.turnQueue?.[battleState.currentTurnIndex]?.damageType} Attack</div>
                        <div className="action-desc">{!battleState.selectedTarget ? 'Select target!' : 'Special damage'}</div>
                      </button>
                      
                      <button 
                        className="battle-action-btn attack"
                        onClick={() => handleBattleAction('attack', 'Physical')}
                        disabled={!battleState.selectedTarget}
                      >
                        <div className="action-icon">🌿</div>
                        <div className="action-name">Root Attack</div>
                        <div className="action-desc">{!battleState.selectedTarget ? 'Select target!' : 'Physical damage'}</div>
                      </button>
                      
                      {/* SUPPORT SECTION */}
                      <div className="action-section-title">💚 SUPPORT</div>
                      
                      <button 
                        className="battle-action-btn heal"
                        onClick={() => handleBattleAction('heal')}
                        disabled={battleState.turnQueue?.[battleState.currentTurnIndex]?.hp >= battleState.turnQueue?.[battleState.currentTurnIndex]?.maxHP}
                      >
                        <div className="action-icon">🚑</div>
                        <div className="action-name">Heal</div>
                        <div className="action-desc">Restore +3 HP</div>
                      </button>
                      
                      <button 
                        className="battle-action-btn restore"
                        onClick={() => handleBattleAction('water')}
                        disabled={battleState.turnQueue?.[battleState.currentTurnIndex]?.water >= battleState.turnQueue?.[battleState.currentTurnIndex]?.maxWater}
                      >
                        <div className="action-icon">💧</div>
                        <div className="action-name">Water</div>
                        <div className="action-desc">Restore +2 💧</div>
                      </button>
                      
                      {battleState.turnQueue?.[battleState.currentTurnIndex]?.maxNutrients > 0 && (
                        <button 
                          className="battle-action-btn restore"
                          onClick={() => handleBattleAction('feed')}
                          disabled={battleState.turnQueue?.[battleState.currentTurnIndex]?.nutrients >= battleState.turnQueue?.[battleState.currentTurnIndex]?.maxNutrients}
                        >
                          <div className="action-icon">🌱</div>
                          <div className="action-name">Feed</div>
                          <div className="action-desc">Restore +2 🌱</div>
                        </button>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Battle Log - BOTTOM LEFT */}
                <div className="battle-log-panel">
                  <div className="battle-log-title">📜 Battle Log</div>
                  <div className="battle-log-content">
                    {battleState.battleLog?.slice(-5).map((entry, idx) => (
                      <div key={idx} className="battle-log-entry">{entry}</div>
                    ))}
                  </div>
                </div>
                
                {/* Weakness Popup */}
                {battleState.weaknessHit && (
                  <div className="weakness-popup">
                    <div className="weakness-text">WEAKNESS!</div>
                  </div>
                )}
                
                {/* Floating Damage Numbers */}
                {battleState.damageNumbers?.map(dmgNum => {
                  // Find participant position to place number
                  const participant = battleState.participants.find(p => p.id === dmgNum.targetId);
                  if (!participant) return null;
                  
                  const isEnemy = participant.isEnemy;
                  const participantIndex = battleState.participants.filter(p => p.isEnemy === isEnemy && !p.isDead).findIndex(p => p.id === dmgNum.targetId);
                  
                  // Calculate position (rough estimate)
                  const baseLeft = isEnemy ? 50 : 50; // Center
                  const offsetX = participantIndex * 250; // Space between participants
                  const topPos = isEnemy ? 200 : window.innerHeight - 300;
                  
                  return (
                    <div 
                      key={dmgNum.id}
                      className={`battle-damage-number ${dmgNum.isWeakness ? 'weakness' : ''} ${dmgNum.isHeal ? 'heal' : 'damage'}`}
                      style={{
                        position: 'fixed',
                        left: `calc(${baseLeft}% + ${offsetX}px - 100px)`,
                        top: `${topPos}px`,
                        zIndex: 10002
                      }}
                    >
                      {dmgNum.value}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}


export default App;