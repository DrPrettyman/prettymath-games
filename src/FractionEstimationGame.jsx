import React, { useState, useEffect, useRef } from 'react';

import GameButton from './components/GameButton';

const FractionEstimationGame = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [targetFraction, setTargetFraction] = useState([0, 0]);
  const [currentFraction, setCurrentFraction] = useState(0);
  const [score, setScore] = useState(null);
  const [showScore, setShowScore] = useState(false);
  const [useDecimal, setUseDecimal] = useState(false);
  const svgRef = useRef(null);

  const denominators = [31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60];

  function gcd(a, b) {
    while (b !== 0) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  }

  function findCoprimeNumbers(n) {
    if (n <= 0) {
      throw new Error("Input must be a positive integer");
    }
    
    const coprimes = [];
    
    for (let i = 1; i <= n; i++) {
      if (gcd(i, n) === 1) {
        coprimes.push(i);
      }
    }
    
    return coprimes;
  }

  function getRandomElement(array) {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
  }

  const createFraction = () => {
    // Create a fraction with a denominator between 3 and 25
    const denominator = Math.floor(Math.random() * 23 + 3);
    // Create a numerator between 1 and the denominator
    const coprimeNumbers = findCoprimeNumbers(denominator);
    const coprimeNumerator = getRandomElement(coprimeNumbers);
    return [coprimeNumerator, denominator];
  };

  const formatFraction = (fraction) => {
    if (useDecimal) {
      // Display as decimal with 2 decimal places
      return fraction.toFixed(2);
    } else if (fraction > 0.98) {
      return '1';
    } else if (fraction < 0.02) {
      return '0';
    } else {
      // Convert to fraction with denominator up to 50
      // Find the best approximation with denominator <= 50
      const fractions = denominators.map(denominator => {
        const numerator = Math.round(fraction * denominator);
        return {numerator, denominator};
      });

      const bestFraction = fractions.reduce((best, current) => {
        return (Math.abs(current.numerator/current.denominator - fraction) < Math.abs(best.numerator/best.denominator - fraction) ? current : best);
      });
        
      // Simplify the fraction using GCD
      const gcd = (a, b) => b ? gcd(b, a % b) : a;
      const divisor = gcd(bestFraction.numerator, bestFraction.denominator);
      
      return `${bestFraction.numerator/divisor}/${bestFraction.denominator/divisor}`;
    }
  };

  // Initialize the game with random fractions
  useEffect(() => {
    const [numerator, denominator] = createFraction();
    setCurrentFraction(0.5);
    setTargetFraction([numerator, denominator]);
  }, [useDecimal]);

  // Calculate visualization dimensions
  const calculateDimensions = () => {
    const width = 260;
    const height = 100;
    const fillWidth = width * currentFraction;

    return {
      width,
      height,
      fillWidth,
      targetWidth: width * targetFraction[0] / targetFraction[1]
    };
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    if (showScore) return;

    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());

    // Calculate fraction based on x position
    const { width } = calculateDimensions();
    // Get the position relative to the left edge of our rectangle
    const relativeX = svgP.x;
    
    // Constrain to 0-1 range
    let fraction = Math.max(0, Math.min(1, relativeX / width));
    
    setCurrentFraction(fraction);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSubmit = () => {
    // Calculate the absolute difference
    const difference = Math.abs(targetFraction[0] / targetFraction[1] - currentFraction);
    
    // Score from based on the difference
    let score;
    if (difference <= 0.005) {
      score = 'Perfect!';
    } else if (difference <= 0.02) {
      score = 'Awesome!';
    } else if (difference <= 0.05) {
      score = 'Excellent!';
    } else if (difference <= 0.10) {
      score = 'Good!';
    } else if (difference <= 0.20) {
      score = 'OK';
    } else {
      score = 'Not great...';
    }
    
    setScore(score);
    setShowScore(true);
  };

  const handleReset = () => {
    // Random fraction between 0 and 1
    const [numerator, denominator] = createFraction();
    setCurrentFraction(0.5); // Reset to middle
    setTargetFraction([numerator, denominator]);
    setScore(null);
    setShowScore(false);
  };

  const dimensions = calculateDimensions();

  return (
    <div className="game-container">
      <div className="game-header">
        <h2 className="game-title">Fraction Estimation Game</h2>
        <button 
            onClick={() => {
              setUseDecimal(!useDecimal);
              setScore(null);
              setShowScore(false);
            }} 
            className="game-button"
        >
            {useDecimal ? 'decimal' : 'fraction'}
        </button>
      </div>
      <div className="game-content">
        <div className="game-display">
          <div className="game-text game-text-container">
            <div>{useDecimal ? `Target Fraction: ${formatFraction(targetFraction[0] / targetFraction[1])}` : `Target Fraction: ${targetFraction[0]} / ${targetFraction[1]}`}</div>
            <div>{showScore ? `Your Fraction: ${formatFraction(currentFraction)} — ${score}` : 'Drag the handle to match the target fraction'}</div>
          </div>
          
          <svg
            ref={svgRef}
            width="300"
            height="300"
            className="game-svg"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Container rectangle */}
            <rect
              x="20"
              y="100"
              width={dimensions.width}
              height={dimensions.height}
              fill="none"
              stroke="black"
              strokeWidth="2"
            />
            
            {/* Filled portion representing the fraction */}
            <rect
              x="20"
              y="100"
              width={dimensions.fillWidth}
              height={dimensions.height}
              fill="rgba(0, 0, 255, 0.3)"
            />
            
            {/* Draggable handle */}
            <rect
              x={dimensions.fillWidth + 18}
              y="100"
              width="4"
              height={dimensions.height}
              fill="blue"
              cursor="ew-resize"
              onMouseDown={handleMouseDown}
            />

            {/* Target fraction */}
            {showScore && (
              <rect
                x={dimensions.targetWidth + 18}
                y="60"
                width="4"
                height={dimensions.height + 80}
                fill="green"
              />
            )}
          </svg>

          <div className="button-container">
            <GameButton 
              onClick={handleSubmit} 
              disabled={showScore}
              variant="primary"
            >
              Submit
            </GameButton>
            <GameButton 
              onClick={handleReset}
              variant="secondary"
            >
              New Game
            </GameButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FractionEstimationGame;