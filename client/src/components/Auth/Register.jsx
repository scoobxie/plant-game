import React, { useState } from 'react';
import '../../styles/auth.css'; 

export default function Register({ switchToLogin }) {
  const [formData, setFormData] = useState({
    username: '', 
    email: '', 
    password: '', 
    confirmPassword: '', 
    character: 'girl'
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match!");
    }
    if (!formData.username || !formData.email || !formData.password) {
      return setError("Please fill in all fields!");
    }

    setIsLoading(true);

    try {
      // Remove confirmPassword before sending
      const { confirmPassword, ...dataToSend } = formData;

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/register`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alert("Account Created! Check your email.");
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
      <h1 className="game-title">
        <img src="/assets/plant.wide.open.mouth.png" alt="sprout" className="title-icon left-icon" />
        Plant Game
        <img src="/assets/plant.wide.open.mouth.png" alt="sprout" className="title-icon right-icon" />
      </h1>

      <div className="auth-container">
        <h2>New Gardener</h2>
        
        <form onSubmit={handleSubmit}>
          
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
              placeholder="Password" 
              required 
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})} 
            />
            <input 
              type="password" 
              placeholder="Confirm Password" 
              required 
              value={formData.confirmPassword}
              onChange={e => setFormData({...formData, confirmPassword: e.target.value})} 
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