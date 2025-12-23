#!/bin/bash

# 🌱 Plant Game - Folder Structure Setup Script
# Run this from your project root: ./setup-folders.sh

echo "🌱 Setting up Plant Game folder structure..."

# Create main directories
mkdir -p src/components/Game/HUD
mkdir -p src/components/Game/Menus
mkdir -p src/components/Game/Screens
mkdir -p src/components/Battle
mkdir -p src/game/hooks
mkdir -p src/utils

echo "📁 Created folder structure:"
echo "   src/components/Game/HUD/"
echo "   src/components/Game/Menus/"
echo "   src/components/Game/Screens/"
echo "   src/components/Battle/"
echo "   src/game/hooks/"
echo "   src/utils/"

# Create placeholder files with TODO comments
cat > src/components/Game/HUD/LeftPanel.jsx << 'EOF'
// TODO: Extract left panel (resources, calendar, inventory)
export default function LeftPanel(props) {
  return <div id="left-panel">Left Panel - TODO</div>;
}
EOF

cat > src/components/Game/HUD/RightPanel.jsx << 'EOF'
// TODO: Extract right panel (plant stats, log, abilities)
export default function RightPanel(props) {
  return <div id="right-panel">Right Panel - TODO</div>;
}
EOF

cat > src/components/Game/HUD/CenterStage.jsx << 'EOF'
// TODO: Extract center display (plant emoji, time, weather)
export default function CenterStage(props) {
  return <div className="center-stage">Center - TODO</div>;
}
EOF

cat > src/components/Game/Menus/MorningMenu.jsx << 'EOF'
// TODO: Extract morning menu (water, feed, expedition buttons)
export default function MorningMenu(props) {
  return <div>Morning Menu - TODO</div>;
}
EOF

cat > src/components/Game/Menus/AfternoonMenu.jsx << 'EOF'
// TODO: Extract afternoon menu (battle, actions)
export default function AfternoonMenu(props) {
  return <div>Afternoon Menu - TODO</div>;
}
EOF

cat > src/components/Game/Menus/NightMenu.jsx << 'EOF'
// TODO: Extract night menu (tend plant, sleep)
export default function NightMenu(props) {
  return <div>Night Menu - TODO</div>;
}
EOF

cat > src/components/Game/Screens/PlantSelection.jsx << 'EOF'
// TODO: Extract plant selection screen
export default function PlantSelection(props) {
  return <div>Plant Selection - TODO</div>;
}
EOF

cat > src/components/Game/Screens/VictoryScreen.jsx << 'EOF'
// TODO: Extract victory screen
export default function VictoryScreen(props) {
  return <div>Victory - TODO</div>;
}
EOF

cat > src/components/Game/Screens/DeathScreen.jsx << 'EOF'
// TODO: Extract game over screen
export default function DeathScreen(props) {
  return <div>Game Over - TODO</div>;
}
EOF

cat > src/components/Battle/BattleScreen.jsx << 'EOF'
// TODO: Extract battle screen UI
export default function BattleScreen(props) {
  return <div>Battle - TODO</div>;
}
EOF

cat > src/game/hooks/useGameState.js << 'EOF'
// TODO: Extract all game state and actions
import { useState, useEffect } from 'react';

export function useGameState(plantType) {
  // TODO: Move all game state here
  
  return {
    // State
    // Actions
  };
}
EOF

cat > src/game/hooks/useBattleState.js << 'EOF'
// TODO: Extract battle state and combat logic
import { useState, useEffect } from 'react';

export function useBattleState(gameState) {
  // TODO: Move battle state here
  
  return {
    // Battle state
    // Battle actions
  };
}
EOF

cat > src/game/battleLogic.js << 'EOF'
// TODO: Extract battle calculation functions
// - generateEnemy()
// - sortTurnQueue()
// - calculateBattleDamage()
// - checkBattleEnd()
// - calculateBattleRewards()

export function generateEnemy(day) {
  // TODO
}

export function sortTurnQueue(participants) {
  // TODO
}

export function calculateBattleDamage(attacker, target, attackType) {
  // TODO
}

export function checkBattleEnd(participants) {
  // TODO
}

export function calculateBattleRewards(participants, day) {
  // TODO
}
EOF

cat > src/game/weather.js << 'EOF'
// TODO: Extract weather system
// - Weather types
// - generateWeatherCalendar()
// - applyWeatherEffects()

export const weatherTypes = {
  // TODO
};

export function generateWeatherCalendar(maxDays) {
  // TODO
}
EOF

cat > src/game/disasters.js << 'EOF'
// TODO: Extract disaster system
// - Disaster types
// - generateDisasterCalendar()
// - applyDisaster()

export const disasterTypes = {
  // TODO
};

export function generateDisasterCalendar(weatherCalendar) {
  // TODO
}
EOF

cat > src/utils/sounds.js << 'EOF'
// TODO: Extract audio management
// - playSound()
// - Audio file paths

export function playSound(soundName) {
  // TODO
}
EOF

cat > src/utils/localStorage.js << 'EOF'
// TODO: Extract save/load game functions

export function saveGame(gameState) {
  // TODO
}

export function loadGame() {
  // TODO
}
EOF

cat > src/utils/helpers.js << 'EOF'
// TODO: Extract utility functions
// - rand()
// - Date formatting
// - Etc.

export function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
EOF

echo ""
echo "✅ Created placeholder files with TODO comments"
echo ""
echo "📋 Next steps:"
echo "   1. Read STEP_BY_STEP_GUIDE.md"
echo "   2. Start with Step 2 (battleLogic.js)"
echo "   3. Test after each extraction"
echo ""
echo "🎯 Goal: Reduce App.jsx from 3,310 lines → ~250 lines"
echo ""
echo "Happy refactoring! 🚀"
