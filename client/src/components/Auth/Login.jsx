import React, { useState } from 'react';
import '../../styles/auth.css';

export default function Login({ switchToRegister, onLoginSuccess, onBack }) {
  // Views: 'login' | 'forgot-email' | 'forgot-code' | 'forgot-password'
  const [view, setView] = useState('login'); 
  
  // Login Data
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Reset Flow Data
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // UI States
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || 'https://plant-game.onrender.com';

  // ==========================================
  // 1. LOGIN HANDLER
  // ==========================================
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
        // 🟢 ALWAYS SAVE TO LOCALSTORAGE (Default behavior)
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

  // ==========================================
  // 2. FORGOT PASSWORD FLOW
  // ==========================================

  // STEP 1: SEND EMAIL
 // 1. GENERATE & SEND CODE (Frontend Version)
  const handleSendCode = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Generate random 6-digit code locally
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code); // Save it to check later

    // Send via EmailJS
    emailjs.send(
      import.meta.env.VITE_SERVICE_ID,
      import.meta.env.VITE_TEMPLATE_ID,
      {
        to_email: resetEmail, // This sends it to the user's email
        code: code            // This puts the number in the email
      },
      import.meta.env.VITE_PUBLIC_KEY
    )
    .then(() => {
       console.log("✅ Email sent successfully!");
       setSuccessMsg("Code sent! Check your inbox.");
       setTimeout(() => {
           setSuccessMsg('');
           setView('forgot-code'); 
       }, 2000);
    })
    .catch((err) => {
       console.error("❌ EmailJS Failed:", err);
       setError("Could not send email. Check console.");
    })
    .finally(() => {
       setIsLoading(false);
    });
  };

  // STEP 2: VERIFY CODE
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
        const res = await fetch(`${apiUrl}/api/verify-code`, { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: resetEmail, code: resetCode })
        });
        
        if (res.ok) {
            setSuccessMsg("Code Verified!");
            setTimeout(() => {
                setSuccessMsg('');
                setView('forgot-password'); 
            }, 1000);
        } else {
            setError("Invalid Code. Try again.");
        }
    } catch (err) {
        setError("Connection Error");
    } finally {
        setIsLoading(false);
    }
  };

  // STEP 3: CHANGE PASSWORD
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
        const res = await fetch(`${apiUrl}/api/reset-password`, { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
              email: resetEmail, 
              code: resetCode, 
              newPassword: newPassword 
          })
        });
        
        if (res.ok) {
          setSuccessMsg("Success! Logging you in...");
          setTimeout(() => {
             setSuccessMsg('');
             setView('login');
          }, 2000); 
        } else {
          setError("Failed to update password.");
        }
    } catch (err) {
        setError("Connection Error");
    } finally {
        setIsLoading(false);
    }
  };

  // ==========================================
  // 3. RENDER
  // ==========================================
  return (
    <div className="auth-wrapper">
      <h1 className="game-title">
        <img src="/assets/plant.wide.open.mouth.png" alt="sprout" className="title-icon left-icon" />
        Plant Game
        <img src="/assets/plant.wide.open.mouth.png" alt="sprout" className="title-icon right-icon" />
      </h1>

      <div className="auth-container">
        
        {/* Back Button */}
        {onBack && view === 'login' && (
          <button type="button" onClick={onBack} className="back-btn-login">
            ← Back to Title
          </button>
        )}

        {/* === VIEW: LOGIN === */}
        {view === 'login' && (
          <>
            <h2>Continue Game</h2>
            <form onSubmit={handleLogin}>
              <input type="email" placeholder="Email" required value={email} onChange={e => setEmail(e.target.value)} />
              <input type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} />
              
              <div className="auth-options" style={{ justifyContent: 'flex-start' }}>
                {/* 🗑️ REMOVED CHECKBOX HERE */}
                <span className="forgot-password" onClick={() => {setError(''); setView('forgot-email')}}>
                  Forgot Password?
                </span>
              </div>

              {error && <p className="error">{error}</p>}
              {successMsg && <p className="error" style={{borderColor:'green', color:'green', background:'#e0ffe0'}}>{successMsg}</p>}
              
              <button type="submit" disabled={isLoading}>{isLoading ? "Loading..." : "Play"}</button>
            </form>
            <button className="link-btn" onClick={switchToRegister}>Don't have an account? Register</button>
          </>
        )}

        {/* === VIEW: STEP 1 (EMAIL) === */}
        {view === 'forgot-email' && (
          <>
            <h2>Step 1: Recovery</h2>
            <p style={{color: 'var(--wood-light)'}}>Enter email to receive code.</p>
            <form onSubmit={handleSendCode}>
              <input type="email" placeholder="Your Email" required value={resetEmail} onChange={e => setResetEmail(e.target.value)} />
              
              {error && <p className="error">{error}</p>}
              {successMsg && <p className="error" style={{borderColor:'green', color:'green', background:'#e0ffe0'}}>{successMsg}</p>}
              
              <button type="submit" disabled={isLoading} style={{background: 'var(--wood-light)', borderColor: '#5e2f0d'}}>
                {isLoading ? "Sending..." : "Send Code"}
              </button>
            </form>
            <button className="link-btn" onClick={() => {setError(''); setView('login')}}>Cancel</button>
          </>
        )}

        {/* === VIEW: STEP 2 (CODE) === */}
        {view === 'forgot-code' && (
          <>
            <h2>Step 2: Verify</h2>
            <p style={{color: 'var(--wood-light)'}}>Check inbox for 6-digit code.</p>
            <form onSubmit={handleVerifyCode}>
              <input type="text" placeholder="Enter Code" required value={resetCode} onChange={e => setResetCode(e.target.value)} />
              
              {error && <p className="error">{error}</p>}
              {successMsg && <p className="error" style={{borderColor:'green', color:'green', background:'#e0ffe0'}}>{successMsg}</p>}
              
              <button type="submit" disabled={isLoading} style={{background: 'var(--leaf-green)', borderColor: '#2f3a22'}}>
                {isLoading ? "Checking..." : "Verify Code"}
              </button>
            </form>
            <button className="link-btn" onClick={() => {setError(''); setView('forgot-email')}}>Back</button>
          </>
        )}

        {/* === VIEW: STEP 3 (PASSWORD) === */}
        {view === 'forgot-password' && (
          <>
            <h2>Step 3: New Password</h2>
            <p style={{color: 'var(--wood-light)'}}>Code Verified! Set new password.</p>
            <form onSubmit={handleChangePassword}>
              <input type="password" placeholder="New Password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              
              {error && <p className="error">{error}</p>}
              {successMsg && <p className="error" style={{borderColor:'green', color:'green', background:'#e0ffe0'}}>{successMsg}</p>}
              
              <button type="submit" disabled={isLoading} style={{background: 'var(--pixel-yellow)', color: 'var(--wood-primary)', borderColor: '#bfae16'}}>
                {isLoading ? "Saving..." : "Change Password"}
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
}