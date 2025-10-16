import React from "react";
import { Link } from "react-router-dom";

const JobCard = ({ job, onSelect, isSelected }) => {
  // Format location
  const getLocation = () => {
    if (job.location) {
      const { city, remote, hybrid } = job.location;
      if (remote) return "Remote";
      if (hybrid) return `${city} (Hybrid)`;
      return city;
    }
    return "Not specified";
  };

  return (
    <div
      className={`border bg-slate-900 p-5 border-slate-500 rounded-2xl cursor-pointer hover:border-[#833fd4] hover:shadow-lg hover:shadow-purple-500/20 transition-all transform hover:-translate-y-1 h-full flex flex-col`}
      onClick={() => onSelect(job)}
    >
      {/* Header with match score */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="text-lg font-bold line-clamp-2 mb-1">{job.title}</h4>
          <p className="text-sm text-purple-400 font-semibold">{job.company}</p>
        </div>
        {job.match_score && (
          <span className="bg-gradient-to-r from-green-600 to-green-500 text-white text-xs font-bold px-3 py-1 rounded-full ml-2 whitespace-nowrap">
            {job.match_score}%
          </span>
        )}
      </div>

      {/* Job info badges */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="text-xs bg-slate-800 px-2 py-1 rounded">
          📍 {getLocation()}
        </span>
        <span className="text-xs bg-slate-800 px-2 py-1 rounded">
          💼 {job.employment_type || "Full-time"}
        </span>
        <span className="text-xs bg-slate-800 px-2 py-1 rounded">
          📊 {job.experience_level || "N/A"}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-400 line-clamp-3 mb-3 flex-1">{job.description}</p>
      
      {/* Matched skills */}
      {job.matched_skills && job.matched_skills.length > 0 && (
        <div className="mb-3 p-2 bg-green-900/20 border border-green-500/30 rounded">
          <p className="text-xs text-green-400 font-semibold mb-1">✓ Your Skills Match:</p>
          <p className="text-xs text-green-300">{job.matched_skills.slice(0, 3).join(", ")}{job.matched_skills.length > 3 ? '...' : ''}</p>
        </div>
      )}

      {/* View Details Button */}
      <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg mt-auto transition-colors font-semibold">
        View Details →
      </button>
    </div>
  );
};

export default JobCard;