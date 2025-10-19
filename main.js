let day = 1;
let water = 5;
let nutrients = 5;
let energy = 2;
let maxEnergy = 2;
let mutations = [];
let plant = {
  water: 5,
  nutrients: 5,
  health: 10,
  growth: 1,
  waterNeed: "Low",
  nutrientNeed: "Low"
};

let log = [];
const maxDays = 30;

function updateUI() {
  document.getElementById("day").textContent = `${day} / ${maxDays}`;
  document.getElementById("water").textContent = water;
  document.getElementById("nutrients").textContent = nutrients;
  document.getElementById("energy").textContent = `${energy} / ${maxEnergy}`;
  document.getElementById("mutations").textContent =
    mutations.join(", ") || "None";
  document.getElementById("plant-water").textContent = plant.water;
  document.getElementById("plant-nutrients").textContent = plant.nutrients;
  document.getElementById("plant-health").textContent = plant.health;
  document.getElementById("plant-growth").textContent = plant.growth;
  document.getElementById("plant-water-need").textContent = plant.waterNeed;
  document.getElementById("plant-nutrient-need").textContent = plant.nutrientNeed;
  document.getElementById("log").innerHTML = log.map(l => `<div>${l}</div>`).join("");
}

function setCurrentEvent(text) {
  document.getElementById("current-event").innerHTML = text;
}

function addLog(text) {
  log.push(text);
  updateUI();
}

function useEnergy(cost = 1) {
  energy -= cost;
  if (energy <= 0) {
    setCurrentEvent("You feel exhausted... Time to rest.");
    document.getElementById("choices").innerHTML = `<button onclick="sleep()">🌙 Sleep</button>`;
  }
  updateUI();
}

function sleep() {
  energy = maxEnergy;
  day++;
  plant.growth++;
  addLog(`You rest. The plant grows slightly. (Growth: ${plant.growth})`);
  setCurrentEvent(`<b>Day ${day}</b> begins anew.`);
  nextDaySetup();
}

function nextDaySetup() {
  if (day > maxDays) return endGame();
  if (day % 3 === 0) bossDay();
  else if (Math.random() < 0.1) mutationEvent();
  else normalChoices();
  updateUI();
}

function normalChoices() {
  setCurrentEvent("What will you do today?");
  document.getElementById("choices").innerHTML = `
    <button onclick="gatherWater()">💧 Gather Water (-1 Energy)</button>
    <button onclick="gatherNutrients()">🌱 Gather Nutrients (-1 Energy)</button>
    <button onclick="tendPlant()">🌿 Tend to Plant (-1 Energy)</button>
  `;
}

function gatherWater() {
  if (energy <= 0) return;
  water += 3;
  addLog("💧 You gathered water.");
  useEnergy();
}

function gatherNutrients() {
  if (energy <= 0) return;
  nutrients += 3;
  addLog("🌱 You gathered nutrients.");
  useEnergy();
}

function updateNeeds() {
  if (plant.water <= 3)
    plant.waterNeed = "High";
  else if (plant.water > 3 && plant.water <= 6)
    plant.waterNeed = "Medium";
  else if (plant.water > 6 && plant.water <= 10)
    plant.waterNeed = "Low";

  if (plant.nutrients <= 3)
    plant.nutrientNeed= "High";
  else if (plant.nutrients > 3 && plant.nutrients <= 6)
    plant.nutrientNeed = "Medium";
  else if (plant.nutrients > 6 && plant.nutrients <= 10)
    plant.nutrientNeed = "Low";
}

function tendPlant() {
  if (energy <= 0) return;
  if (water >= 1 && nutrients >= 1) {
  water -= 1;
  nutrients -= 1;
  plant.water = Math.min(plant.water + 1, 10);
  plant.nutrients = Math.min(plant.nutrients + 1, 10);
  plant.health = Math.min(plant.health + 1, 10);
  updateNeeds();
  updateUI();
  addLog("🌿 You tended the plant. It looks healthier.");
  useEnergy();
  }
  else addLog("Not enough resources to feed the plant.");
}

function mutationEvent() {
  setCurrentEvent("A strange mutation opportunity appears...");
  document.getElementById("choices").innerHTML = "";
  const m = { name: "Deep Roots", desc: "Water costs halved in future." };
  const btn = document.createElement("button");
  btn.textContent = `🧬 Adopt Mutation: ${m.name}`;
  btn.onclick = () => {
    mutations.push(m.name);
    addLog(`🧬 Mutation gained: ${m.name}`);
    nextDaySetup();
  };
  document.getElementById("choices").appendChild(btn);
}

function droughtEvent() {
plant.water = 0;
updateNeeds();
updateUI();
addLog("Drought drained all water!")
}

function earthquakeEvent() {
plant.health -= 2;
updateNeeds();
updateUI();
addLog("Earthquake damaged the plant!")
}

function bossDay() {
  const bosses = [
    { name: "Drought", effect: droughtEvent },
    { name: "Earthquake", effect: earthquakeEvent }
  ];
  const b = bosses[Math.floor(Math.random() * bosses.length)];
  b.effect();
  setCurrentEvent(`<b>Boss Event:</b> ${b.name}`);
  
  document.getElementById("choices").innerHTML = `
    <button onclick="resolveBossDay()">Continue</button>
  `;
}

function resolveBossDay() {
  addLog("You survived the environmental disaster.");
  day++; // advance to next day AFTER boss event
  energy = maxEnergy;
  setCurrentEvent(`<b>Day ${day}</b> begins anew.`);
  nextDaySetup();
}

function endGame() {
  setCurrentEvent("<b>🌸 The plant bore fruit. You have survived the 30 days!</b>");
  document.getElementById("choices").innerHTML = `<button onclick="restart()">Restart</button>`;
}

function restart() {
  day = 1;
  water = 10;
  nutrients = 10;
  energy = 2;
  plant = { health: 10, growth: 1, waterNeed: "Low", nutrientNeed: "Low" };
  mutations = [];
  log = [];
  normalChoices();
  updateUI();
}

function toggleGardenInfo() {
  const info = document.getElementById("garden-info");
  info.classList.toggle("hidden");
}

document.getElementById("toggle-garden").addEventListener("click", toggleGardenInfo);

updateUI();
normalChoices();
setCurrentEvent("<b>Day 1</b> begins...");
