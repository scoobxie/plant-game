import React from 'react';
import './PaperDoll.css';

const PaperDoll = ({ 
  skinSrc,   
  outfitSrc, 
  hairSrc,
  faceSrc, // (Opțional, pentru viitor)
  isBreathing = true 
}) => {
  
  return (
    <div className={`paper-doll-container ${isBreathing ? 'breathing' : ''}`}>
      
      {/* 1. PIELEA (Baza) */}
      {skinSrc && (
        <img 
          src={skinSrc} 
          alt="Skin" 
          className="doll-layer layer-skin" 
        />
      )}

      {/* 2. FAȚA (Opțional - momentan e desenată pe piele) */}
      {faceSrc && (
        <img 
          src={faceSrc} 
          alt="Face" 
          className="doll-layer layer-face" 
        />
      )}

      {/* 3. HAINELE (Trebuie să vină peste corp) */}
      {outfitSrc && (
        <img 
          src={outfitSrc} 
          alt="Outfit" 
          className="doll-layer layer-outfit" 
        />
      )}

      {/* 4. PĂRUL (Ultimul strat - peste haine) */}
      {hairSrc && (
        <img 
          src={hairSrc} 
          alt="Hair" 
          className="doll-layer layer-hair" 
        />
      )}
      
    </div>
  );
};

export default PaperDoll;