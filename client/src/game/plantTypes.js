// ===================================
// PLANT TYPES DEFINITIONS
// All plant species with their stats and abilities
// ===================================

export const plantTypes = {
  cactus: {
    name: 'Cactus',
    image: '/assets/mutations/cactus.mutation.png',
    damageType: 'Pierce',
    weakness: 'Blast',
    maxWater: 5,
    maxNutrients: 15,
    maxHealth: 15,
    startWater: 3,
    startNutrients: 8,
    baseWaterConsumption: 1,
    baseNutrientConsumption: 2,
    overwaterThreshold: 4,
    overfeedThreshold: 15,
    // Special abilities
    waterConsumptionGrowth: false,
    nutrientConsumptionGrowth: 2,
    immuneToDrought: true,
    floodDamage: [5, 7],
    description: 'Desert survivor - immune to drought, hates floods'
  },
  
  venusFlytrap: {
    name: 'Venus Flytrap',
    image: '/assets/mutations/venus.fly.trap.mutation.png',
    damageType: 'Bite',
    weakness: 'Pierce',
    maxWater: 10,
    maxNutrients: 0,
    maxHealth: 6,
    startWater: 5,
    startNutrients: 0,
    baseWaterConsumption: 2,
    baseNutrientConsumption: 0,
    overwaterThreshold: 8,
    overfeedThreshold: 0,
    // Special abilities
    expeditionWaterBonus: [2, 3],
    earthquakeDamage: 2,
    description: 'Carnivorous - finds extra water, fragile'
  },
  
  sunflower: {
    name: 'Sunflower',
    image: '/assets/mutations/sunflower.mutation.png',
    damageType: 'Beam',
    weakness: 'Poison',
    maxWater: 12,
    maxNutrients: 12,
    maxHealth: 8,
    startWater: 6,
    startNutrients: 6,
    baseWaterConsumption: 2,
    baseNutrientConsumption: 2,
    overwaterThreshold: 12,
    overfeedThreshold: 12,
    // Special abilities
    photosynthesis: 2,
    morningDewChance: 0.3,
    description: 'Solar powered - photosynthesis & morning dew'
  },
  
  rose: {
    name: 'Rose',
    image: '/assets/mutations/rose.mutation.png',
    damageType: 'Pierce',
    weakness: 'Blast',
    maxWater: 10,
    maxNutrients: 15,
    maxHealth: 8,
    startWater: 2,
    startNutrients: 4,
    baseWaterConsumption: 2,
    baseNutrientConsumption: 3,
    overwaterThreshold: 10,
    overfeedThreshold: 15,
    // Special abilities
    healEnergyCost: 2,
    fertilizeCost: 2,
    immuneToEarthquake: true,
    description: 'Elegant aristocrat - strong roots, thorny care'
  },
  
  ivy: {
    name: 'Ivy',
    image: '/assets/mutations/ivy.mutation.png',
    damageType: 'Poison',
    weakness: 'Physical',
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
    allDisastersDamage: 2,
    autoHealDays: 3,
    healEnergyCost: 3,
    description: 'Toxic creeper - regenerates, takes extra damage'
  },
  
  mushroom: {
    name: 'Mushroom',
    image: '/assets/mutations/mushroom.mutation.png',
    damageType: 'Fungi',
    weakness: 'Physical',
    maxWater: 20,
    maxNutrients: 5,
    maxHealth: 10,
    startWater: 8,
    startNutrients: 3,
    baseWaterConsumption: 5,
    baseNutrientConsumption: 1,
    overwaterThreshold: 20,
    overfeedThreshold: 5,
    // Special abilities
    nightEnergyBonus: 2,
    description: 'Nocturnal fungi - loves moisture, night energy'
  },
  
  appleTree: {
    name: 'Apple Tree',
    image: '/assets/mutations/apple.tree.mutation.png',
    damageType: 'Physical',
    weakness: 'Poison',
    maxWater: 20,
    maxNutrients: 20,
    maxHealth: 20,
    startWater: 18,
    startNutrients: 18,
    baseWaterConsumption: 4,
    baseNutrientConsumption: 4,
    overwaterThreshold: 20,
    overfeedThreshold: 20,
    description: 'Mighty tree - massive tank, huge consumption'
  }
};

/**
 * Get random plant type (used for new game)
 */
export function getRandomPlantType() {
  const types = Object.keys(plantTypes);
  const randomKey = types[Math.floor(Math.random() * types.length)];
  return plantTypes[randomKey];
}

/**
 * Get plant type from localStorage or random
 */
export function getStartingPlantType() {
  const savedType = localStorage.getItem('currentPlantType');
  if (savedType && plantTypes[savedType]) {
    return plantTypes[savedType];
  }
  return getRandomPlantType();
}
