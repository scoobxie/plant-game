import React, { useState, useEffect } from 'react'; 
import PaperDoll from './PaperDoll';
import './Park.css';
import { playSFX, startParkRadio, stopParkRadio } from '../core/soundManager';

const Park = ({ players, socket, myId, onMove, user }) => { 
    
    // 1. STARE PENTRU ANIMATIA DE PĂȘIT (0 sau 1)
    // Se schimbă automat ca să creeze efectul de "mers"
    const [stepPhase, setStepPhase] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setStepPhase(prev => (prev === 0 ? 1 : 0));
        }, 200); 
        return () => clearInterval(interval);
    }, []);

    const handleMove = (e) => {
        if (e.target.closest('.no-click') || e.target.tagName === 'INPUT') return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = Math.floor(e.clientX - rect.left);
        const y = Math.floor(e.clientY - rect.top);

        if (onMove) {
            onMove(x, y);
        } else {
            socket.emit('move', { id: socket.id, x, y });
        }
    };

    const decor = [
        { id: 't1', type: 'tree', x: '15%', y: 250 },
        { id: 't2', type: 'tree', x: '82%', y: 600 },
        { id: 'p1', type: 'picnic', x: '72%', y: 200 },
    ];

    // Radio
    useEffect(() => {
        startParkRadio(); // Starts the 5-song loop
        return () => stopParkRadio(); // Stops music when the component unmounts
    }, []);

    // Play footstep sounds for YOUR player
    useEffect(() => {
        if (players[myId]?.isMoving && stepPhase === 0) {
            playSFX('footstep'); 
        }
        
}, [stepPhase, players[myId]?.isMoving]);
    
    return (
        <div className="park-container" onClick={handleMove}>
            
            {/* --- DECOR --- */}
            <div className="grass-patch" style={{ top: '20%', left: '40%' }}></div>
            <div className="grass-patch" style={{ top: '60%', left: '15%' }}></div>
            <div className="grass-patch" style={{ top: '80%', left: '70%' }}></div>
            <div className="mistria-flower" style={{ top: '35%', left: '25%' }}></div>
            <div className="mistria-flower" style={{ top: '75%', left: '80%' }}></div>

            <div className="mistria-lake no-click">
                <div className="water-shimmer"></div>
            </div>

            {decor.map(obj => (
                <div key={obj.id} className="no-click" style={{ position: 'absolute', left: obj.x, top: obj.y, zIndex: Math.floor(obj.y) }}>
                    {obj.type === 'tree' && (
                        <div className="mistria-tree">
                            <div className="tree-shadow-floogit add .r"></div>
                            <div className="mistria-leaves"></div>
                            <div className="mistria-trunk"></div>
                        </div>
                    )}
            {obj.type === 'picnic' && (
                <div className="mistria-picnic">
                    {/* PICNIC BASKET */}
                    <img 
                        src="/assets/props/picnic-basket.png" 
                        alt="Picnic Basket" 
                        style={{ 
                            position: 'absolute', 
                            top: '-25px',
                            right: '15px', 
                            width: '55px', 
                            height: 'auto',
                            imageRendering: 'pixelated',
                            zIndex: 10
                        }} 
                    />
                </div>
            )}
                </div>
            ))}

            {/* --- PLAYERS --- */}
            {Object.values(players).map((p) => {
                
                // ✅ 2. MAGIC ANIMATION: Pășit Realist
                const getAnimSrc = (src) => {
                    if (!src) return null;
                    if (p.isMoving) {
                        // Dacă stepPhase e 0 -> Arată piciorul în față (-walk)
                        // Dacă stepPhase e 1 -> Arată piciorul strâns (normal)
                        // Asta creează iluzia că dă din picioare!
                        if (stepPhase === 0) {
                            return src.replace('.png', '-walk.png');
                        }
                        return src; // Revenim la poziția normală între pași
                    }
                    return src; // Când stă pe loc
                };

                // ✅ 3. OGLINDIRE (Stânga/Dreapta)
                const isGirl = p.characterLook?.skin?.includes('girl');
                const facing = p.direction || (isGirl ? 'left' : 'right');
                let mirrorStyle = 'scaleX(1)'; 

                if ((isGirl && facing === 'right') || (!isGirl && facing === 'left')) {
                    mirrorStyle = 'scaleX(-1)';
                }

                return (
                    <div key={p.id} className="no-click" style={{
                            position: 'absolute', left: p.x, top: p.y,
                            // Aici setezi viteza (0.6s e mai lent, ca un mers normal)
                            transition: 'left 0.6s linear, top 0.6s linear', 
                            transform: 'translate(-50%, -100%)',
                            zIndex: Math.floor(p.y),
                            display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none'
                        }}>

                        {/* Chat Bubble */}
                        {p.chatMessage && (
                            <div style={{
                                position: 'absolute', bottom: '100%', marginBottom: '10px',
                                background: '#fff0f5', border: '3px solid #ff80ab', padding: '5px 12px',
                                borderRadius: '15px', fontFamily: 'VT323', fontSize: '1.2rem',
                                whiteSpace: 'nowrap', zIndex: 100, color: '#880e4f'
                            }}>
                                {p.chatMessage}
                                <div style={{
                                    position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                                    borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
                                    borderTop: '6px solid #ff80ab'
                                }}></div>
                            </div>
                        )}

                        {/* Numele */}
                        <div style={{
                            background: p.id === myId ? '#ff80ab' : 'white',
                            color: p.id === myId ? 'white' : '#5d4037',
                            padding: '2px 12px', borderRadius: '10px', border: '3px solid #5d4037',
                            fontFamily: 'VT323', fontSize: '1.2rem', marginBottom: '4px', whiteSpace: 'nowrap'
                        }}>
                            {p.username || "Gardener"}
                        {(p.isVeteran) && (
                        <img 
                            src="/assets/plant.wide.open.mouth.png" 
                            alt="Veteran Badge" 
                            style={{ 
                                width: '20px', 
                                height: '20px', 
                                imageRendering: 'pixelated' 
                            }} 
                        />
                    )}
                        </div>

                        {/* 🏃 PAPERDOLL ANIMAT */}
                        <div style={{ 
                            width: '80px', height: '110px',
                            transform: mirrorStyle, // Oglindire
                            transition: 'transform 0.1s'
                        }}>
                            <PaperDoll 
                                skinSrc={getAnimSrc(p.characterLook?.skin)} 
                                hairSrc={getAnimSrc(p.characterLook?.hair)} 
                                outfitSrc={getAnimSrc(p.characterLook?.outfit)} 
                                isBreathing={!p.isMoving} 
                            />
                        </div>
                        
                        {/* Umbra */}
                        <div style={{ width: '40px', height: '10px', background: 'rgba(0,0,0,0.1)', borderRadius: '50%', marginTop: '-12px' }}></div>
                    </div>
                );
            })}

            {/* CHAT INPUT */}
            <div className="chat-input-container">
                <input 
                    type="text" 
                    className="chat-input-field"
                    placeholder="Type to chat..." 
                    maxLength={40}
                    aria-label="Chat input" 
                    onClick={(e) => e.stopPropagation()} 
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.target.value.trim()) {
                            socket.emit('chat_message', e.target.value);
                            e.target.value = ''; 
                        }
                    }}
                />
            </div>
            
        </div>
    );
};

export default Park;