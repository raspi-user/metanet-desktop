import React from 'react';

interface AppLogoProps {
  className?: string;
  size?: string | number;
  color?: string;
}

const AppLogo: React.FC<AppLogoProps> = ({ className, size, color = '#2196F3' }) => {
  // Calculate positions for 8 vertices on a circle
  const centerX = 100;
  const centerY = 100;
  const radius = 80;
  const vertices = [];
  
  // Create 8 vertices positioned in a circle
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * 2 * Math.PI;
    vertices.push({
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    });
  }

  // Create edges between all vertices (complete graph)
  const edges = [];
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      edges.push({
        x1: vertices[i].x,
        y1: vertices[i].y,
        x2: vertices[j].x,
        y2: vertices[j].y
      });
    }
  }

  return (
    <svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      className={className}
      style={{
        width: size || '100%',
        height: size || '100%',
      }}
    >
      {/* Background circle */}
      <circle cx={centerX} cy={centerY} r={radius + 10} fill="white" />
      
      {/* Edges */}
      {edges.map((edge, index) => (
        <line
          key={`edge-${edge.x1}-${edge.y1}-${edge.x2}-${edge.y2}`}
          x1={edge.x1}
          y1={edge.y1}
          x2={edge.x2}
          y2={edge.y2}
          stroke={color}
          strokeWidth="1.5"
          opacity="0.7"
        />
      ))}
      
      {/* Vertices */}
      {vertices.map((vertex, index) => (
        <circle
          key={`vertex-${vertex.x}-${vertex.y}`}
          cx={vertex.x}
          cy={vertex.y}
          r="6"
          fill={color}
        />
      ))}
    </svg>
  );
};

export default AppLogo;
