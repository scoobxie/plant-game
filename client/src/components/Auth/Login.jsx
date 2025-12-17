import React, { useState } from 'react';
import '../../styles/auth.css';

export default function Login({ switchToRegister, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
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
      {/* 🌿 BIG TITLE 🌿 */}
      <h1 className="game-title">
  <img src="/assets/plant wide open mouth.png" alt="sprout" className="title-icon left-icon" />
  Plant Game
  <img src="/assets/plant wide open mouth.png" alt="sprout" className="title-icon right-icon" />
</h1>

      <div className="auth-container">
        <h2>Continue Game</h2>
        <form onSubmit={handleSubmit}>
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
          {error && <p className="error">{error}</p>}
          
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Loading..." : "Resume Game"}
          </button>
        </form>
        
        <button className="link-btn" onClick={switchToRegister}>
          Don't have an account? Register
        </button>
      </div>
    </div>
  );
}