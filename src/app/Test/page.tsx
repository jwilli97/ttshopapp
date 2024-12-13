'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Confetti from 'react-confetti';
import { Button } from '@/components/ui/button';

const ConfettiComponent = () => {
  const [isConfettiActive, setIsConfettiActive] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 });
  const confettiRef = useRef(null);

  useEffect(() => {
    const updateWindowDimensions = () => {
      setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    
    updateWindowDimensions();
    window.addEventListener('resize', updateWindowDimensions);
    
    return () => window.removeEventListener('resize', updateWindowDimensions);
  }, []);

  const triggerConfetti = useCallback(() => {
    setIsConfettiActive(true);
    setOpacity(1);
    
    // Fade out over 5 seconds
    const fadeInterval = setInterval(() => {
      setOpacity((prevOpacity) => {
        if (prevOpacity <= 0) {
          clearInterval(fadeInterval);
          setIsConfettiActive(false);
          return 0;
        }
        return prevOpacity - 0.01;
      });
    }, 100);
  }, []);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center px-4 py-12">
      <Button onClick={triggerConfetti}>Confetti Button</Button>
      {isConfettiActive && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          ref={confettiRef}
          style={{ position: 'fixed', top: 0, left: 0, opacity: opacity }}
          wind={0.025}
          gravity={0.25}
          initialVelocityY={20}
          recycle={false}
          numberOfPieces={200}
        />
      )}
    </div>
  );
};

export default ConfettiComponent;