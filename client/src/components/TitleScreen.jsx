// src/components/TitleScreen.jsx
import React from 'react';
import '../styles/auth.css'; // We can reuse the auth styles here

export default function TitleScreen({ onStartGame, onContinueGame }) {
  return (
    <div className="auth-wrapper">
      {/* BIG TITLE WITH SPRITES (Reusing your existing code) */}
      <h1 className="game-title">
        {/* Make sure these images exist in public/assets/ */}
       <img src="/assets/plant.wide.open.mouth.png" alt="sprout" className="title-icon left-icon" />
        Plant Game
        <img src="/assets/plant.wide.open.mouth.png" alt="sprout" className="title-icon right-icon" />
      </h1>

      <div className="auth-container" style={{ textAlign: 'center' }}>
        <h2>Main Menu</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <button onClick={onStartGame} className="menu-btn green-btn">
            New Game (Register)
          </button>
          <button onClick={onContinueGame} className="menu-btn wood-btn">
            Continue (Login)
          </button>
        </div>
      </div>
    </div>
  );
}