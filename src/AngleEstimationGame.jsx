import React, { useState, useEffect, useRef } from 'react';

import GameButton from './components/GameButton.jsx';

const AngleEstimationGame = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [targetAngle, setTargetAngle] = useState(0);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [score, setScore] = useState(null);
  const [showScore, setShowScore] = useState(false);
  const [useRadians, setUseRadians] = useState(false);
  const svgRef = useRef(null);

  // Add effect to handle system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Initial setup
    document.documentElement.setAttribute('data-theme', mediaQuery.matches ? 'dark' : 'light');
    
    // Listen for changes
    const handleChange = (e) => {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const formatAngle = (angleInRadians) => {
    if (useRadians) {
      // Convert to range 0 to 2π and display with 2 decimal places
      const radians = ((angleInRadians % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      return radians.toFixed(2) + ' rad';
    } else {
      // Convert to degrees 0-360 and round to integer
      return Math.round(normalizeAngle(angleInRadians)) + '°';
    }
  };

  const normalizeAngle = (angle) => {
    // Convert from radians to degrees
    let degrees = angle * 180 / Math.PI;
    // Normalize to 0-360 range
    degrees = ((degrees % 360) + 360) % 360;
    return degrees;
  };

  // Initialize the game with random angles
  useEffect(() => {
    const randomAngle = (Math.random() * (3 * Math.PI / 4 - Math.PI / 2) + Math.PI / 2);
    setCurrentAngle(randomAngle);
    
    if (useRadians) {
      const randomRad = (Math.random() * 2 * Math.PI);
      setTargetAngle(Math.round(randomRad * 100) / 100);
    } else {
      const randomDeg = Math.floor(Math.random() * 360);
      setTargetAngle(randomDeg * Math.PI / 180);
    }
  }, [useRadians]);

  // Calculate point positions for the lines
  const calculatePoints = () => {
    const centerX = 150;
    const centerY = 150;
    const lineLength = 100;
    const targetLineLength = 40;

    // Fixed line (horizontal)
    const fixedEndX = centerX + lineLength;
    const fixedEndY = centerY;

    // Movable line
    const movableEndX = centerX + lineLength * Math.cos(currentAngle);
    const movableEndY = centerY - lineLength * Math.sin(currentAngle);

    // Horizontal line (target)
    const targetHorizontalEndX = centerX + targetLineLength;
    const targetHorizontalEndY = centerY;

    // Target line
    const targetEndX = centerX + targetLineLength * Math.cos(targetAngle);
    const targetEndY = centerY - targetLineLength * Math.sin(targetAngle);

    return {
      centerX,
      centerY,
      fixedEndX,
      fixedEndY,
      movableEndX,
      movableEndY,
      targetHorizontalEndX,
      targetHorizontalEndY,
      targetEndX,
      targetEndY
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

    const { centerX, centerY } = calculatePoints();
    const angle = Math.atan2(-(svgP.y - centerY), svgP.x - centerX);
    setCurrentAngle(angle);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSubmit = () => {
    // Convert angles to degrees in 0-360 range
    const targetDegrees = normalizeAngle(targetAngle);
    const currentDegrees = normalizeAngle(currentAngle);
    
    // Calculate the absolute difference in degrees
    let difference = Math.abs(targetDegrees - currentDegrees);
    // Take the smaller angle between the difference and its complement
    difference = Math.min(difference, 360 - difference);
    
    // Score based on the difference
    let score;
    if (difference == 0){
      score = 'Perfection!';
    } else if (difference <= 5) {
      score = 'Awesome!';
    } else if (difference <= 10) {
      score = 'Excellent!';
    } else if (difference <= 20) {
      score = 'Good!';
    } else if (difference <= 30) {
      score = 'OK';
    } else {
      score = 'Not great...';
    }
    
    setScore(score);
    setShowScore(true);
  };

  const handleReset = () => {
    const randomAngle = (Math.random() * (3 * Math.PI / 4 - Math.PI / 2) + Math.PI / 2);
    setCurrentAngle(randomAngle);
    
    if (useRadians) {
      const randomRad = (Math.random() * 2 * Math.PI);
      setTargetAngle(Math.round(randomRad * 100) / 100);
    } else {
      const randomDeg = Math.floor(Math.random() * 360);
      setTargetAngle(randomDeg * Math.PI / 180);
    }
    setScore(null);
    setShowScore(false);
  };

  const points = calculatePoints();

  return (
    <div className="game-container">
      <div className="game-header">
        <h2 className="game-title">Angle Estimation Game</h2>
        <button 
            onClick={() => {
              setUseRadians(!useRadians);
              setScore(null);
              setShowScore(false);
            }} 
            className="game-button"
        >
            {useRadians ? 'radians' : 'degrees'}
        </button>
      </div>
      <div className="game-content">
        <div className="game-display">
          <div className="game-text game-text-container">
            <div>Target Angle: {formatAngle(targetAngle)}</div>
            <div>{showScore ? `Your Angle: ${formatAngle(currentAngle)} — ${score}` : 'Drag the dot to match the target angle'}</div>
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
            {/* Fixed line */}
            <line
              x1={points.centerX}
              y1={points.centerY}
              x2={points.fixedEndX}
              y2={points.fixedEndY}
              stroke="black"
              strokeWidth="2"
            />
            
            {/* Movable line */}
            <line
              x1={points.centerX}
              y1={points.centerY}
              x2={points.movableEndX}
              y2={points.movableEndY}
              stroke="blue"
              strokeWidth="2"
            />

            {/* Target horizontal line */}
            {showScore && (
              <line
                x1={points.centerX}
                y1={points.centerY}
                x2={points.targetHorizontalEndX}
                y2={points.targetHorizontalEndY}
                stroke="green"
                strokeWidth="2"
              />
            )}

            {/* Target line */}
            {showScore && (
              <line
                x1={points.centerX}
                y1={points.centerY}
                x2={points.targetEndX}
                y2={points.targetEndY}
                stroke="green"
                strokeWidth="2"
              />
            )}

            {/* Angle arc */}
            <path
              d={(() => {
                const radius = 30;
                const startX = points.centerX + radius;
                const startY = points.centerY;
                const endX = points.centerX + radius * Math.cos(currentAngle);
                const endY = points.centerY - radius * Math.sin(currentAngle);
                const normalizedDegrees = normalizeAngle(currentAngle);
                const largeArcFlag = normalizedDegrees > 180 ? 1 : 0;
                
                return `
                  M ${points.centerX} ${points.centerY}
                  L ${startX} ${startY}
                  A ${radius} ${radius} 0 ${largeArcFlag} 0 ${endX} ${endY}
                  L ${points.centerX} ${points.centerY}
                  Z
                `;
              })()}
              fill="rgba(0, 0, 255, 0.1)"
              stroke="blue"
              strokeWidth="1"
            />

            {/* Target Angle arc */}
            {showScore && (
              <path
                d={(() => {
                  const radius = 40;
                  const startX = points.centerX + radius;
                  const startY = points.centerY;
                  const endX = points.centerX + radius * Math.cos(targetAngle);
                  const endY = points.centerY - radius * Math.sin(targetAngle);
                  const normalizedDegrees = normalizeAngle(targetAngle);
                  const largeArcFlag = normalizedDegrees > 180 ? 1 : 0;
                  
                  return `
                    M ${points.centerX} ${points.centerY}
                    L ${startX} ${startY}
                    A ${radius} ${radius} 0 ${largeArcFlag} 0 ${endX} ${endY}
                    L ${points.centerX} ${points.centerY}
                    Z
                  `;
                })()}
                fill="rgba(0, 255, 0, 0.1)"
                stroke="green"
                strokeWidth="1"
              />
            )}
            
            {/* Draggable dot */}
            <circle
              cx={points.movableEndX}
              cy={points.movableEndY}
              r="6"
              fill="blue"
              cursor="pointer"
              onMouseDown={handleMouseDown}
            />
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

export default AngleEstimationGame;