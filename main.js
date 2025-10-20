// ==============================
// 🌿 Roguelike Garden - main.js
// ==============================

// --- Variabile principale ---
let day = 1, water = 10, nutrients = 10, energy = 2, maxEnergy = 2;
let mutations = [], log = [];
let isNight = false, wellRested = false, inBossEvent = false;
const maxDays = 30;

let plant = {
  water: 5,
  nutrients: 5,
  health: 10,
  growth: 1,
  dryDays: 0
};

// ====== Actualizare UI ======
function updateUI() {
  document.getElementById("day").textContent = `${day} / ${maxDays}`;
  document.getElementById("water").textContent = water;
  document.getElementById("nutrients").textContent = nutrients;
  document.getElementById("energy").textContent = `${energy} / ${maxEnergy}`;
  document.getElementById("mutations").textContent = mutations.join(", ") || "None";
  document.getElementById("plant-water").textContent = plant.water;
  document.getElementById("plant-nutrients").textContent = plant.nutrients;
  document.getElementById("plant-health").textContent = plant.health;
  document.getElementById("log").innerHTML = log.map(l => `<div>${l}</div>`).join("");

  const logDiv = document.getElementById("log");
  logDiv.scrollTop = logDiv.scrollHeight;

  updateNextEvent();
  updateRestedIndicator();
}

// ====== Următorul eveniment (boss) ======
let nextBossDay = 3;
let nextBossName = "Drought";

function updateNextEvent() {
  const daysLeft = nextBossDay - day;
  const nextEventEl = document.getElementById("next-event");

  if (daysLeft > 0) {
    nextEventEl.textContent = `⚠️ ${nextBossName} in ${daysLeft} day${daysLeft > 1 ? "s" : ""}`;
  } else if (daysLeft === 0) {
    nextEventEl.textContent = `⚠️ ${nextBossName} today!`;
  } else {
    nextEventEl.textContent = "";
  }

  if (isNight) nextEventEl.textContent = "";
}

function addLog(txt) { log.push(txt); saveGame(); updateUI(); }
function setEvent(txt) { document.getElementById("current-event").innerHTML = txt; }
function setChoices(html) { document.getElementById("choices").innerHTML = html; }
function rand(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }

// ====== Verificări și stări ======
function checkPlantDeath() {
  if (plant.water <= 0) {
    plant.dryDays++;
    if (plant.dryDays === 1) {
      addLog("⚠️ The plant is drying out! It may not last another day without water.");
      return false;
    }
    if (plant.dryDays >= 2) {
      setEvent("💀 Your plant has withered due to dehydration.");
      setChoices(`<button onclick="restart()">Restart</button>`);
      addLog("💀 The plant has perished from lack of water.");
      return true;
    }
  } else {
    plant.dryDays = 0;
  }

  if (plant.health <= 0) {
    setEvent("💀 Your plant has died.");
    setChoices(`<button onclick="restart()">Restart</button>`);
    addLog("💀 The plant has perished.");
    return true;
  }
  return false;
}

// ====== Pornire joc ======
function startGame() {
  updateUI();
  setEvent(`<b>Day ${day}</b> begins.`);
  normalChoices();
}

// ====== Acțiuni zilnice ======
function normalChoices() {
  if (inBossEvent) return;

  const time = isNight ? "🌙 Night — limited actions." : "☀️ Daytime — full energy.";
  setEvent(`${time}<br>Choose your action:`);

  setChoices(`
    <button onclick="openPlantTab()">🌿 Plant Care</button>
    <button onclick="expeditionMenu()">🏕️ Expedition</button>
    <button onclick="sleep()">🛌 Sleep</button>
  `);
}

// ====== Plant Care Tab ======
function openPlantTab() {
  setEvent("Plant care options:");
  setChoices(`
    <button onclick="waterPlant()">💧 Water (-1 Energy)</button>
    <button onclick="fertilizePlant()">🌱 Fertilize (-1 Energy)</button>
    <button onclick="tendPlant()">🩹 Tend (heal plant)</button>
    <button onclick="normalChoices()">↩️ Back</button>
  `);
}

// ====== Folosirea energiei ======
function useEnergy(cost = 1, forced = false) {
  energy -= cost;
  if (energy < 0) energy = 0;
  updateUI();

  if (energy === 0 && wellRested) {
    wellRested = false;
    addLog("☀️ You no longer feel well-rested.");
  }

  if (energy === 0 && !forced) {
    setEvent("You're exhausted... It's time to sleep.");
    setChoices(`<button onclick="sleep(true)">🛌 Sleep</button>`);
  }
}

// ====== Tranziție către noapte ======
function enterNight() {
  isNight = true;
  document.body.classList.add("night");
  document.body.classList.remove("day");
  document.getElementById("night-overlay").style.opacity = "1";

  energy = Math.max(1, Math.floor(maxEnergy / 2));
  addLog("🌙 Night falls. You feel tired and move slower.");
  updateUI();
  normalChoices();
}

// ====== Somn (trecerea timpului) ======
function sleep(fromChoice = true) {
  if (inBossEvent) return;

  // DORMIT NOAPTEA → zi nouă
  if (isNight) {
    isNight = false;
    document.body.classList.remove("night");
    document.body.classList.add("day");
    document.getElementById("night-overlay").style.opacity = "0";

    day++;
    addLog("💤 You rest through the night.");

    if (!wellRested) {
      wellRested = true;
      maxEnergy += 1;
      addLog("✨ You feel well-rested (+1 max energy today).");
    }

    energy = maxEnergy;

    plant.water = Math.max(0, plant.water - 1);
    plant.nutrients = Math.max(0, plant.nutrients - 1);
    plant.growth++;

    if (checkPlantDeath()) return;
    if (day > maxDays) return endGame();

    if (day === nextBossDay) bossDay();
    else if (Math.random() < 0.25) mutationEvent();
    else normalChoices();

    updateUI();
    return;
  }

  // DORMIT ZIUA
  if (!isNight) {
    if (wellRested && fromChoice) {
      addLog("❌ You can’t get extra benefits from sleeping while well-rested.");
    }

    isNight = true;
    document.body.classList.remove("day");
    document.body.classList.add("night");
    document.getElementById("night-overlay").style.opacity = "1";

    energy = Math.max(1, Math.floor(maxEnergy / 2));
    addLog("😴 You nap during the day. Night falls quickly...");
    updateUI();
    normalChoices();
    return;
  }
}

// ====== Acțiuni ======
function waterPlant() {
  if (energy <= 0) return;
  if (water > 0) {
    water--;
    plant.water = Math.min(10, plant.water + 2);
    addLog("💧 You watered the plant.");
  } else addLog("❌ Not enough shared water!");
  useEnergy();
}

function fertilizePlant() {
  if (energy <= 0) return;
  if (nutrients > 0) {
    nutrients--;
    plant.nutrients = Math.min(10, plant.nutrients + 2);
    addLog("🌱 You fertilized the plant.");
  } else addLog("❌ Not enough shared nutrients!");
  useEnergy();
}

function tendPlant() {
  if (energy <= 0) return;
  plant.health = Math.min(10, plant.health + 1);
  addLog("🩹 You tended to the plant. It looks healthier.");
  useEnergy();
}

// ====== Boss Events ======
function droughtEvent() {
  plant.water = 0;
  water = Math.max(0, water - rand(1, 3));
  addLog("☀️ Drought hit! The plant lost all internal water but you endure.");
}

function earthquakeEvent() {
  plant.health = Math.max(0, plant.health - 2);
  addLog("🌋 Earthquake damaged the roots.");
}

function bossDay() {
  inBossEvent = true;
  const bosses = [
    { name: "Drought", effect: droughtEvent },
    { name: "Earthquake", effect: earthquakeEvent }
  ];
  const b = bosses[rand(0, bosses.length - 1)];

  nextBossDay += 3;
  nextBossName = bosses[rand(0, bosses.length - 1)].name;

  b.effect();
  if (checkPlantDeath()) return;

  setEvent(`<b>Boss Event:</b> ${b.name}`);
  setChoices(`<button onclick="afterBoss()">Continue</button>`);
}

function afterBoss() {
  addLog("You recover from the disaster.");
  inBossEvent = false;
  updateUI();
  normalChoices();
}

// ====== Mutations ======
function mutationEvent() {
  setEvent("🧬 Mutation appears!");
  setChoices(`
    <button onclick="adoptMutation('Deep Roots')">Deep Roots</button>
    <button onclick="adoptMutation('Waxy Leaves')">Waxy Leaves</button>
    <button onclick="normalChoices()">Skip</button>
  `);
}

function adoptMutation(m) {
  mutations.push(m);
  addLog(`🧬 Mutation gained: ${m}`);
  normalChoices();
}

// ====== Expeditions ======
function expeditionMenu() {
  setEvent("Choose expedition duration:");
  setChoices(`
    <button onclick="startExpedition(1,1)">1 Day (-1 Energy)</button>
    <button onclick="startExpedition(2,2)">2 Days (-2 Energy)</button>
    <button onclick="startExpedition(3,3)">3 Days (-3 Energy)</button>
    <button onclick="normalChoices()">Cancel</button>
  `);
}

function startExpedition(days, cost) {
  if (energy < cost) {
    addLog("❌ Not enough energy for such a long trip.");
    return;
  }
  useEnergy(cost);
  addLog(`🏕️ You leave for ${days} days.`);

  for (let i = 0; i < days; i++) {
    day++;
    plant.water = Math.max(0, plant.water - 1);
    plant.nutrients = Math.max(0, plant.nutrients - 1);
    if (checkPlantDeath()) return;
    if (day === nextBossDay) bossDay();
  }

  let wg = 0, ng = 0;
  if (days === 1) { wg = rand(2, 5); ng = rand(2, 4); }
  else if (days === 2) { wg = rand(3, 7); ng = rand(3, 6); }
  else { wg = rand(4, 10); ng = rand(4, 9); }

  water += wg; nutrients += ng;
  addLog(`🧭 Returned with +${wg} water, +${ng} nutrients.`);
  updateUI();
  normalChoices();
}

// ====== End / Save ======
function endGame() {
  setEvent("🌸 The plant bore fruit. You survived 30 days!");
  setChoices(`<button onclick="restart()">Restart</button>`);
  addLog("🌸 Victory!");
  localStorage.removeItem("gardenSave");
}

function restart() {
  localStorage.removeItem("gardenSave");
  location.reload();
}

function saveGame() {
  const s = { day, water, nutrients, energy, maxEnergy, mutations, log, plant, isNight, wellRested, nextBossDay, nextBossName };
  localStorage.setItem("gardenSave", JSON.stringify(s));
}

function loadGame() {
  const s = localStorage.getItem("gardenSave");
  if (s) {
    const d = JSON.parse(s);
    Object.assign(window, d);
    addLog("💾 Game loaded from save.");
    if (isNight) document.body.classList.add("night");
  }
}

// ====== Well Rested Indicator ======
function updateRestedIndicator() {
  const indicator = document.getElementById("rested-indicator");
  if (!indicator) return;
  indicator.style.display = wellRested ? "block" : "none";
}

// ====== Garden Info ======
function toggleGardenInfo() {
  document.getElementById("garden-info").classList.toggle("hidden");
}
document.getElementById("toggle-garden").addEventListener("click", toggleGardenInfo);

// ====== Start ======
loadGame();
updateUI();
startGame();
