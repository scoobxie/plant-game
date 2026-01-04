import React from 'react';
import PaperDoll from './PaperDoll';
import './Park.css';

const Park = ({ players, socket, myId, onMove }) => { // <--- Am adăugat onMove aici
    
    const handleMove = (e) => {
        // Dacă dai click pe un copac sau lac (decor), nu te miști
        if (e.target.closest('.no-click')) return;

        // Calculăm poziția exactă
        const rect = e.currentTarget.getBoundingClientRect();
        const x = Math.floor(e.clientX - rect.left);
        const y = Math.floor(e.clientY - rect.top);

        // Folosim funcția primită din App.jsx
        if (onMove) {
            onMove(x, y);
        } else {
            // Fallback în caz că nu e conectată funcția
            socket.emit('move', { id: socket.id, x, y });
        }
        
        console.log(`📍 Moving to: X:${x}, Y:${y}`);
    };

    // Obiecte de decor
    const decor = [
        { id: 't1', type: 'tree', x: '15%', y: 250 },
        { id: 't2', type: 'tree', x: '82%', y: 600 },
        { id: 'p1', type: 'picnic', x: '72%', y: 200 },
    ];

    return (
        <div className="park-container" onClick={handleMove}>
            
            {/* Fundal: Iarbă texturată */}
            <div className="grass-patch" style={{ top: '20%', left: '40%' }}></div>
            <div className="grass-patch" style={{ top: '60%', left: '15%' }}></div>
            <div className="grass-patch" style={{ top: '80%', left: '70%' }}></div>

            {/* Flori mici roz */}
            <div className="mistria-flower" style={{ top: '35%', left: '25%' }}></div>
            <div className="mistria-flower" style={{ top: '75%', left: '80%' }}></div>

            {/* Lacul (Baza) */}
            <div className="mistria-lake no-click">
                <div className="water-shimmer"></div>
            </div>

            {/* Obiecte cu adâncime */}
            {decor.map(obj => (
                <div key={obj.id} className="no-click" style={{
                    position: 'absolute',
                    left: obj.x,
                    top: obj.y,
                    zIndex: Math.floor(obj.y)
                }}>
                    {obj.type === 'tree' && (
                        <div className="mistria-tree">
                            <div className="tree-shadow-floor"></div>
                            <div className="mistria-leaves"></div>
                            <div className="mistria-trunk"></div>
                        </div>
                    )}
                    {obj.type === 'picnic' && (
                        <div className="mistria-picnic">
                            <div style={{ position: 'absolute', top: '-15px', right: '20px', width: '40px', height: '30px', background: '#d7ccc8', border: '3px solid #8d6e63', borderRadius: '5px' }}></div>
                        </div>
                    )}
                </div>
            ))}

            {/* Playerii */}
            {Object.values(players).map((p) => (
                <div 
                    key={p.id} 
                    className="no-click"
                    style={{
                        position: 'absolute',
                        left: p.x, 
                        top: p.y,
                        transition: 'left 0.5s ease-out, top 0.5s ease-out', /* Animație fluidă */
                        transform: 'translate(-50%, -100%)',
                        zIndex: Math.floor(p.y),
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        pointerEvents: 'none' /* IMPORTANT: Să nu blocăm click-ul pe iarbă */
                    }}
                >
                    <div style={{
                        background: p.id === myId ? '#ff80ab' : 'white',
                        color: p.id === myId ? 'white' : '#5d4037',
                        padding: '2px 12px',
                        borderRadius: '10px',
                        border: '3px solid #5d4037',
                        fontFamily: 'VT323',
                        fontSize: '1.2rem',
                        marginBottom: '4px',
                        whiteSpace: 'nowrap'
                    }}>
                        {p.username || "Guest"}
                    </div>

                    <div style={{ width: '80px', height: '110px' }}>
                        <PaperDoll 
                            skinSrc={p.characterLook?.skin} 
                            hairSrc={p.characterLook?.hair} 
                            outfitSrc={p.characterLook?.outfit} 
                            isBreathing={true}
                        />
                    </div>
                    {/* Umbră jucător soft */}
                    <div style={{ width: '40px', height: '10px', background: 'rgba(0,0,0,0.1)', borderRadius: '50%', marginTop: '-8px' }}></div>
                </div>
            ))}
        </div>
    );
};

export default Park;