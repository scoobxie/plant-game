import React, { useState } from 'react';
import '../../styles/auth.css'; 

export default function Register({ switchToLogin }) {
  const [formData, setFormData] = useState({
    username: '', 
    email: '', 
    password: '', 
    character: 'girl'
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Simple validation
    if (!formData.username || !formData.email || !formData.password) {
      return setError("Please fill in all fields!");
    }

    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/register`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        switchToLogin(); 
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      setError("Server connection error");
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
        <h2>New Gardener</h2>
        
        <form onSubmit={handleSubmit}>
          
          {/* Character Selector */}
          <div className="char-select">
            <div className="char-options">
              <div 
                className={`char-option ${formData.character === 'girl' ? 'selected' : ''}`}
                onClick={() => setFormData({...formData, character: 'girl'})}
              >
                <img src="/assets/girl.png" alt="Girl" />
              </div>

              <div 
                className={`char-option ${formData.character === 'boy' ? 'selected' : ''}`}
                onClick={() => setFormData({...formData, character: 'boy'})}
              >
                <img src="/assets/boy.png" alt="Boy" />
              </div>
            </div>
          </div>

          {/* Inputs */}
          <div className="input-group">
            <input 
              type="text" 
              placeholder="Gardener Name" 
              required 
              value={formData.username}
              onChange={e => setFormData({...formData, username: e.target.value})} 
            />
            <input 
              type="email" 
              placeholder="Email" 
              required 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})} 
            />
            <input 
              type="password" 
              placeholder="Secret Code" 
              required 
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})} 
            />
          </div>

          {error && <div className="error">{error}</div>}
          
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Start Adventure"}
          </button>
        </form>
        
        <button className="link-btn" onClick={switchToLogin}>
          Already have an account? Log in
        </button>
      </div>
    </div>
  );
}