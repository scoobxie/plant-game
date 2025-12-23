// ===================================
// BATTLE LOGIC - Combat Calculations
// All battle-related pure functions (no React)
// ===================================

/**
 * Generate enemy based on current day
 * @param {number} currentDay - Current game day
 * @returns {Object} Enemy object with stats and personality
 */
export function generateEnemy(currentDay) {
  const personalities = {
    aggressive: { 
      name: 'Aggressive', 
      surrenderChance: 0.1, 
      fleeChance: 0.05, 
      attackMod: 1.2, 
      defenseMod: 0.9 
    },
    cowardly: { 
      name: 'Cowardly', 
      surrenderChance: 0.4, 
      fleeChance: 0.3, 
      attackMod: 0.8, 
      defenseMod: 1.1 
    },
    greedy: { 
      name: 'Greedy', 
      surrenderChance: 0.15, 
      fleeChance: 0.1, 
      attackMod: 1.0, 
      defenseMod: 1.0 
    },
    tactical: { 
      name: 'Tactical', 
      surrenderChance: 0.2, 
      fleeChance: 0.15, 
      attackMod: 1.1, 
      defenseMod: 1.1 
    }
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
    isDead: false,
    poisoned: false,
    poisonDamage: 0
  };
}

/**
 * Sort participants by turn order (higher = faster)
 * @param {Array} participants - Array of plants and enemies
 * @returns {Array} Sorted array by turnOrder
 */
export function sortTurnQueue(participants) {
  return [...participants]
    .filter(p => !p.isDead)
    .sort((a, b) => b.turnOrder - a.turnOrder);
}

/**
 * Calculate battle damage with weakness multiplier and poison
 * @param {Object} attacker - Attacking entity
 * @param {Object} target - Target entity
 * @param {string} attackType - Type of attack (Pierce, Poison, etc.)
 * @returns {Object} { damage, isWeakness, appliedPoison }
 */
export function calculateBattleDamage(attacker, target, attackType) {
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
  
  // Weakness multiplier: 1.5x damage
  if (isWeakness) {
    damage = Math.floor(damage * 1.5);
    console.log('⚡ WEAKNESS! Damage:', attacker.damage, '→', damage);
  }
  
  // Apply poison status if attack type is Poison
  let appliedPoison = false;
  if (attackType === 'Poison' && !target.poisoned) {
    target.poisoned = true;
    target.poisonDamage = Math.floor(attacker.damage * 0.3); // 30% of base damage
    appliedPoison = true;
  }
  
  return { damage, isWeakness, appliedPoison };
}

/**
 * Check if battle has ended (all plants dead OR all enemies dead)
 * @param {Array} participants - All battle participants
 * @returns {Object} { ended: boolean, victory: boolean }
 */
export function checkBattleEnd(participants) {
  const alivePlants = participants.filter(p => p.isPlant && !p.isDead);
  const aliveEnemies = participants.filter(p => p.isEnemy && !p.isDead);
  
  if (alivePlants.length === 0) {
    return { ended: true, victory: false }; // DEFEAT
  }
  
  if (aliveEnemies.length === 0) {
    return { ended: true, victory: true }; // VICTORY
  }
  
  return { ended: false }; // Battle continues
}

/**
 * Calculate rewards after victory (water + nutrients based on enemies defeated)
 * @param {Array} participants - All participants
 * @param {number} currentDay - Current game day
 * @returns {Object} { water, nutrients }
 */
export function calculateBattleRewards(participants, currentDay) {
  const defeatedEnemies = participants.filter(p => p.isEnemy);
  
  const waterReward = 3 + Math.floor(defeatedEnemies.length * 1.5) + Math.floor(currentDay / 5);
  const nutrientReward = 2 + defeatedEnemies.length + Math.floor(currentDay / 5);
  
  return { 
    water: waterReward, 
    nutrients: nutrientReward 
  };
}

/**
 * Apply poison damage at start of poisoned entity's turn
 * @param {Object} entity - Entity that is poisoned
 * @returns {number} Damage dealt by poison
 */
export function applyPoisonDamage(entity) {
  if (!entity.poisoned || !entity.poisonDamage) {
    return 0;
  }
  
  const damage = entity.poisonDamage;
  entity.hp = Math.max(0, entity.hp - damage);
  entity.isDead = entity.hp <= 0;
  
  return damage;
}

/**
 * Handle weakness hit - move attacker up in turn queue
 * @param {Array} turnQueue - Current turn queue
 * @param {number} attackerIndex - Index of attacker
 * @returns {Array} Updated turn queue
 */
export function handleWeaknessBonus(turnQueue, attackerIndex) {
  const newQueue = [...turnQueue];
  
  if (attackerIndex > 0) {
    // Swap with previous (move up 1 position)
    const temp = newQueue[attackerIndex - 1];
    newQueue[attackerIndex - 1] = newQueue[attackerIndex];
    newQueue[attackerIndex] = temp;
    return newQueue;
  } else {
    // Already first - try to move another PLANT up
    const otherPlantIndex = newQueue.findIndex((p, idx) => 
      idx > 0 && p.isPlant && !p.isDead && p.id !== newQueue[attackerIndex].id
    );
    
    if (otherPlantIndex > 0) {
      const temp = newQueue[otherPlantIndex - 1];
      newQueue[otherPlantIndex - 1] = newQueue[otherPlantIndex];
      newQueue[otherPlantIndex] = temp;
    }
    
    return newQueue;
  }
}
