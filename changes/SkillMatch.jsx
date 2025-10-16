import React from "react";

const SkillMatch = ({ skill, isMatched = false, isPreferred = false }) => {
  // Determine badge style based on match status and skill type
  const getBadgeStyle = () => {
    if (isMatched) {
      // User has this skill - green
      return "bg-green-600 border-green-400";
    } else if (isPreferred) {
      // Preferred but not matched - blue/gray
      return "bg-gray-700 border-gray-500";
    } else {
      // Required but not matched - orange/red
      return "bg-orange-900 border-orange-600";
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm border ${getBadgeStyle()} flex items-center gap-1`}>
      {skill}
      {isMatched && <span className="text-xs">✓</span>}
      {!isMatched && !isPreferred && <span className="text-xs text-orange-400">!</span>}
    </span>
  );
};

export default SkillMatch;
