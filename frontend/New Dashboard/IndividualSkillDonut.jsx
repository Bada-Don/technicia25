import React, { useEffect, useState } from 'react';

const IndividualSkillDonut = ({ skill, size = 120, thickness = 12 }) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  
  // Animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(skill.level);
    }, 300);
    return () => clearTimeout(timer);
  }, [skill.level]);

  const center = size / 2;
  const radius = center - thickness / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate stroke dash values
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (animatedValue / 100) * circumference;
  
  // Skill level colors
  const getSkillColor = (level) => {
    if (level >= 90) return '#10B981'; // Green for Expert
    if (level >= 80) return '#3B82F6'; // Blue for Advanced  
    if (level >= 70) return '#8B5CF6'; // Purple for Intermediate
    return '#F59E0B'; // Orange for Beginner
  };

  const getSkillCategory = (level) => {
    if (level >= 90) return 'Expert';
    if (level >= 80) return 'Advanced';  
    if (level >= 70) return 'Intermediate';
    return 'Beginner';
  };

  const skillColor = getSkillColor(skill.level);
  
  return (
    <div className="flex flex-col items-center p-4 bg-black/30 backdrop-blur-sm rounded-xl shadow-lg border border-purple-700/30 hover:shadow-xl hover:border-purple-600/50 transition-all duration-300">
      <div className="relative mb-3">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={thickness}
            className="opacity-30"
          />
          
          {/* Progress circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={skillColor}
            strokeWidth={thickness}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{
              filter: 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.3))'
            }}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-white">
            {Math.round(animatedValue)}%
          </span>
        </div>
      </div>
      
      {/* Skill info */}
      <div className="text-center">
        <h4 className="font-semibold text-white mb-1">{skill.name}</h4>
        <span 
          className="text-xs px-2 py-1 rounded-full font-medium"
          style={{ 
            backgroundColor: `${skillColor}15`,
            color: skillColor 
          }}
        >
          {getSkillCategory(skill.level)}
        </span>
      </div>
    </div>
  );
};

export default IndividualSkillDonut;