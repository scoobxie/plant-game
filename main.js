let day = 1;
let water = 10;
let nutrients = 10;
let energy = 2;
let maxEnergy = 2;
let mutations = [];
let plant = {
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
  document.getElementById("plant-health").textContent = plant.health;
  document.getElementById("plant-growth").textContent = plant.growth;
  document.getElementById("plant-water-need").textContent = plant.waterNeed;
  document.getElementById("plant-nutrient-need").textContent =
    plant.nutrientNeed;
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

function tendPlant() {
  if (energy <= 0) return;
  plant.health = Math.min(plant.health + 1, 10);
  addLog("🌿 You tended the plant. It looks healthier.");
  useEnergy();
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

function bossDay() {
  const bosses = [
    { name: "Drought", effect: () => (water = 0), msg: "☀️ Drought drained all water!" },
    { name: "Earthquake", effect: () => (plant.health -= 2), msg: "🌋 Earthquake damaged the plant!" }
  ];
  const b = bosses[Math.floor(Math.random() * bosses.length)];
  b.effect();
  addLog(b.msg);
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
