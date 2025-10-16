import React, { useEffect, useState } from 'react';

const DonutChart = ({ data, size = 200, thickness = 30 }) => {
  const [animatedData, setAnimatedData] = useState(data.map(item => ({ ...item, value: 0 })));
  // Animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedData(data);
    }, 300);
    return () => clearTimeout(timer);
  }, [data]);

  const center = size / 2;
  const radius = center - thickness / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate total value for percentage calculation
  const total = animatedData.reduce((sum, item) => sum + item.value, 0);
  
  // Generate colors for each segment
  const colors = [
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#10B981', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#F97316', // Orange
  ];
  
  let currentAngle = -90; // Start from top
  
  return (
    <div className="relative">
      <svg width={size} height={size} className="transform rotate-0">
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={thickness}
        />
        
        {/* Data segments */}
        {animatedData.map((item, index) => {
          const percentage = (item.value / total) * 100;
          const strokeDasharray = (percentage / 100) * circumference;
          const strokeDashoffset = circumference - strokeDasharray;
          
          const segment = (
            <circle
              key={index}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={colors[index % colors.length]}
              strokeWidth={thickness}
              strokeDasharray={`${strokeDasharray} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform={`rotate(${currentAngle} ${center} ${center})`}
              className="transition-all duration-1000 ease-out"
              style={{
                transformOrigin: `${center}px ${center}px`,
              }}
            />
          );
          
          currentAngle += (percentage / 100) * 360;
          return segment;
        })}
        
        {/* Center text */}
        <text
          x={center}
          y={center - 10}
          textAnchor="middle"
          className="text-2xl font-bold fill-gray-800"
          dominantBaseline="middle"
        >
          {Math.round((animatedData.reduce((sum, item) => sum + item.value, 0) / animatedData.length))}%
        </text>
        <text
          x={center}
          y={center + 15}
          textAnchor="middle"
          className="text-sm fill-gray-500"
          dominantBaseline="middle"
        >
          Avg Skills
        </text>
      </svg>
      
      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        {animatedData.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: colors[index % colors.length] }}
            ></div>
            <span className="text-gray-700 truncate">{item.name}</span>
            <span className="text-gray-500 ml-auto">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonutChart;