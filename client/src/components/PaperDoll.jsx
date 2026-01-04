import React from 'react';
import './PaperDoll.css';

const PaperDoll = ({ 
  skinSrc,   
  outfitSrc, 
  hairSrc,
  faceSrc, 
  isBreathing = true,
  showLeaf = false
}) => {
  
// BOY OR GIRL LEAF ACCESSORY
  const isBoy = skinSrc && skinSrc.includes('boy');
  const leafImage = isBoy 
      ? "/assets/accessories/leaf-accessory-boy.png" 
      : "/assets/accessories/leaf-accessory-girl.png";

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

      {/* 5. LEAF ACCESSORY (VETERAN REWARD) */}
      {showLeaf && (
        <img 
          src={leafImage} 
          alt="Veteran Leaf" 
          className="doll-layer"
          style={{ zIndex: 35 }} // Peste păr
        />
      )}
    </div>
  );
};

export default PaperDoll;