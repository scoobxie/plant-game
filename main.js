// ===== Variabile de bază =====
let day = 1,
    water = 10,
    nutrients = 10,
    energy = 2,
    maxEnergy = 2;

let mutations = [],
    log = [],
    isNight = false,
    wellRested = false;

const maxDays = 30;

let plant = {
    water: 5,
    nutrients: 5,
    health: 10,
    growth: 1,
    dryDays: 0 // zile consecutive fără apă
};

// ===== Actualizare UI =====
function updateUI() {
    document.getElementById("day").textContent = `${day} / ${maxDays}`;
    document.getElementById("water").textContent = water;
    document.getElementById("nutrients").textContent = nutrients;
    document.getElementById("energy").textContent = `${energy} / ${maxEnergy}`;
    document.getElementById("mutations").textContent = mutations.join(", ") || "None";
    document.getElementById("plant-water").textContent = plant.water;
    document.getElementById("plant-nutrients").textContent = plant.nutrients;
    document.getElementById("plant-health").textContent = plant.health;

    const logBox = document.getElementById("log");
    logBox.innerHTML = log.map(l => `<div>${l}</div>`).join("");
    logBox.scrollTop = logBox.scrollHeight; // auto-scroll log

    updateNextEvent();
}

// ===== Următorul eveniment =====
function updateNextEvent() {
    const nextBoss = Math.ceil(day / 3) * 3;
    const daysLeft = nextBoss - day;
    const bossList = ["Drought", "Earthquake"];
    const eventName = bossList[(nextBoss / 3) % bossList.length] || "Unknown";

    if (daysLeft >= 0)
        document.getElementById("next-event").textContent = isNight
            ? ""
            : daysLeft > 0
                ? `⚠️ ${eventName} in ${daysLeft} day${daysLeft > 1 ? "s" : ""}`
                : `⚠️ ${eventName} today!`;
}

function addLog(txt) {
    log.push(txt);
    saveGame();
    updateUI();
}

function setEvent(txt) {
    document.getElementById("current-event").innerHTML = txt;
}

function setChoices(html) {
    document.getElementById("choices").innerHTML = html;
}

function rand(a, b) {
    return Math.floor(Math.random() * (b - a + 1)) + a;
}

// ===== Stări plantă =====
function updateNeeds() {
    if (plant.water < 0) plant.water = 0;
    if (plant.nutrients < 0) plant.nutrients = 0;
}

// ===== Verifică moartea plantei =====
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

// ===== Început de joc =====
function startGame() {
    updateNeeds();
    updateUI();
    setEvent(`<b>Day ${day}</b> begins.`);
    normalChoices();
}

// ===== Alegeri zilnice =====
function normalChoices() {
    const time = isNight ? "🌙 Night — limited actions." : "☀️ Daytime — full energy.";

    if (energy <= 0) {
        setEvent(`${time}<br>You're too tired to do anything else.`);
        setChoices(`<button onclick="sleep()">🛌 Sleep</button>`);
        return;
    }

    setEvent(`${time}<br>Choose your action:`);
    setChoices(`
        <button onclick="openPlantMenu()">🌿 Tend Plant</button>
        <button onclick="expeditionMenu()">🏕️ Expedition</button>
        <button onclick="sleep()">🛌 Sleep</button>
    `);
}

// ===== Meniu Plantă =====
function openPlantMenu() {
    setEvent("Choose how to tend the plant:");
    setChoices(`
        <button onclick="waterPlant()">💧 Water Plant (-1 Energy)</button>
        <button onclick="fertilizePlant()">🌱 Fertilize Plant (-1 Energy)</button>
        <button onclick="healPlant()">🌼 Tend Plant (-1 Energy)</button>
        <button onclick="normalChoices()">Back</button>
    `);
}

// ===== Energie =====
function useEnergy(cost = 1) {
    energy -= cost;
    if (energy < 0) energy = 0;
    updateUI();

    if (energy <= 0) {
        addLog("😴 You're exhausted. You should sleep to recover.");
        setEvent("You're too tired to continue. Time to rest.");
        setChoices(`<button onclick="sleep()">🛌 Sleep</button>`);
    }
}

// ===== Zi/Noapte =====
function enterNight() {
    isNight = true;
    document.body.classList.add("night");
    energy = Math.ceil(maxEnergy / 2);
    addLog("🌙 Night falls, energy halved.");
    updateUI();
    normalChoices();
}

function sleep(fromChoice = true) {
    if (!isNight) {
        enterNight();
        return;
    }

    isNight = false;
    document.body.classList.remove("night");
    day++;
    addLog("💤 You rest through the night.");

    let originalMax = maxEnergy;

    if (fromChoice && energy > 0) {
        wellRested = true;
        addLog("✨ You feel well-rested (+1 max energy today).");
        maxEnergy += 1;
    }

    energy = maxEnergy;

    // Consumul pasiv al plantei
    plant.water = Math.max(0, plant.water - 1);
    plant.nutrients = Math.max(0, plant.nutrients - 1);
    plant.growth++;
    updateNeeds();

    if (checkPlantDeath()) return;
    if (day > maxDays) return endGame();

    if (day % 3 === 0) bossDay();
    else if (Math.random() < 0.25) mutationEvent();
    else normalChoices();

    if (wellRested) {
        setTimeout(() => {
            wellRested = false;
            maxEnergy = originalMax;
            energy = Math.min(energy, maxEnergy);
            addLog("☀️ The rested feeling fades.");
            updateUI();
        }, 10000);
    }

    updateUI();
}

// ===== Acțiuni plantă =====
function waterPlant() {
    if (energy <= 0) return;
    if (water > 0) {
        water--;
        plant.water = Math.min(10, plant.water + 2);
        addLog("💧 You watered the plant.");
    } else addLog("❌ Not enough shared water!");

    updateNeeds();
    useEnergy();
}

function fertilizePlant() {
    if (energy <= 0) return;
    if (nutrients > 0) {
        nutrients--;
        plant.nutrients = Math.min(10, plant.nutrients + 2);
        addLog("🌱 You fertilized the plant.");
    } else addLog("❌ Not enough nutrients!");

    updateNeeds();
    useEnergy();
}

function healPlant() {
    if (energy <= 0) return;
    plant.health = Math.min(10, plant.health + 1);
    addLog("🌼 You tended the plant. It looks healthier.");
    updateNeeds();
    useEnergy();
}

// ===== Boss Events =====
function droughtEvent() {
    plant.water = 0;
    water = Math.max(0, water - rand(1, 3));
    addLog("☀️ Drought hit! The plant lost all internal water but you endure.");
    updateNeeds();
}

function earthquakeEvent() {
    plant.health = Math.max(0, plant.health - 2);
    addLog("🌋 Earthquake damaged the roots.");
    updateNeeds();
}

function bossDay() {
    const bosses = [
        { name: "Drought", effect: droughtEvent },
        { name: "Earthquake", effect: earthquakeEvent },
    ];
    const b = bosses[rand(0, bosses.length - 1)];
    b.effect();

    if (checkPlantDeath()) return;

    setEvent(`<b>Boss Event:</b> ${b.name}`);
    setChoices(`<button onclick="afterBoss()">Continue</button>`);
}

function afterBoss() {
    addLog("You recover from the disaster.");
    updateUI();
    normalChoices();
}

// ===== Mutations =====
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

// ===== Expeditions =====
function expeditionMenu() {
    setEvent("Choose expedition duration:");
    setChoices(`
        <button onclick="startExpedition(1)">1 Day (-1 Energy)</button>
        <button onclick="startExpedition(2)">2 Days (-2 Energy)</button>
        <button onclick="startExpedition(3)">3 Days (-3 Energy)</button>
        <button onclick="normalChoices()">Cancel</button>
    `);
}

function startExpedition(days) {
    if (energy < days) {
        addLog("❌ Not enough energy for this expedition!");
        return;
    }

    useEnergy(days);
    addLog(`🏕️ You leave for ${days} days.`);

    for (let i = 0; i < days; i++) {
        day++;
        plant.water = Math.max(0, plant.water - 1);
        plant.nutrients = Math.max(0, plant.nutrients - 1);

        if (checkPlantDeath()) return;
        if (day % 3 === 0) bossDay();
    }

    let wg = 0,
        ng = 0;
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

    water += wg;
    nutrients += ng;
    addLog(`🧭 Returned with +${wg} water, +${ng} nutrients.`);

    updateNeeds();
    updateUI();
    normalChoices();
}

// ===== End / Save =====
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
    const s = {
        day,
        water,
        nutrients,
        energy,
        maxEnergy,
        mutations,
        log,
        plant,
        isNight,
        wellRested,
    };
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

// ===== Initialization =====
loadGame();
updateUI();
startGame();
