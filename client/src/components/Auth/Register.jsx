import React, { useState } from 'react';

export default function Register({ switchToLogin }) {
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', confirmPass: '', character: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPass) return setError("Passwords do not match!");
    if (!formData.character) return setError("Please choose a character!");

    try {
      const res = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          character: formData.character
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        alert("Account created! Please log in.");
        switchToLogin();
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      setError("Server connection error");
    }
  };

  return (
    <div className="auth-container">
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Username" required 
          onChange={e => setFormData({...formData, username: e.target.value})} />
        <input type="email" placeholder="Email" required 
          onChange={e => setFormData({...formData, email: e.target.value})} />
        <input type="password" placeholder="Password" required 
          onChange={e => setFormData({...formData, password: e.target.value})} />
        <input type="password" placeholder="Confirm Password" required 
          onChange={e => setFormData({...formData, confirmPass: e.target.value})} />
        
        <div className="char-select">
          <p>Choose your character:</p>
          <div className="char-options">
            <div 
              className={`char-option ${formData.character === 'girl' ? 'selected' : ''}`}
              onClick={() => setFormData({...formData, character: 'girl'})}
            >
              👧 Girl
            </div>
            <div 
              className={`char-option ${formData.character === 'boy' ? 'selected' : ''}`}
              onClick={() => setFormData({...formData, character: 'boy'})}
            >
              👦 Boy
            </div>
          </div>
        </div>

        {error && <p className="error">{error}</p>}
        <button type="submit">Register</button>
      </form>
      <button className="link-btn" onClick={switchToLogin}>Already have an account? Login</button>
    </div>
  );
}