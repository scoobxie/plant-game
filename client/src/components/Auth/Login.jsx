import React, { useState } from 'react';

export default function Login({ switchToRegister, onLoginSuccess, onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || 'https://plant-game.onrender.com';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch(`${apiUrl}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLoginSuccess(data.user); 
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Cannot connect to server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      {/* Title cu plant icons */}
      <h1 className="game-title">
        <img src="/assets/plant.wide.open.mouth.png" alt="plant" className="title-icon left-icon" />
        Plant Game
        <img src="/assets/plant.wide.open.mouth.png" alt="plant" className="title-icon right-icon" />
      </h1>

      <div className="auth-container">
        {onBack && (
          <button className="back-btn-login" onClick={onBack}>
            ← Back
          </button>
        )}
        
        <h2>Welcome Back</h2>
        
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <input 
              type="email" 
              placeholder="Email" 
              required 
              value={email}
              onChange={e => setEmail(e.target.value)} 
            />
            <input 
              type="password" 
              placeholder="Password" 
              required 
              value={password}
              onChange={e => setPassword(e.target.value)} 
            />
          </div>

          {error && <div className="error">{error}</div>}
          
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
        
        <button className="link-btn" onClick={switchToRegister}>
          Don't have an account? Register
        </button>
      </div>
    </div>
  );
}
