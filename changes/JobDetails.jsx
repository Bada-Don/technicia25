import React from "react";
import SkillMatch from "./SkillMatch";

const JobDetails = ({ job }) => {
  if (!job) {
    return (
      <div className="border bg-slate-900 p-5 w-[100%] h-max border-slate-500 rounded-2xl mb-4">
        <p className="text-gray-400">Select a job to view details</p>
      </div>
    );
  }

  // Safely extract job properties with fallbacks
  const requiredSkills = job.requirements?.required_skills || [];
  const preferredSkills = job.requirements?.preferred_skills || [];
  const allSkills = [...requiredSkills, ...preferredSkills];
  
  // Format salary
  const formatSalary = () => {
    if (job.salary_range) {
      const { min, max, currency } = job.salary_range;
      return `${currency} ${min?.toLocaleString()} - ${max?.toLocaleString()}`;
    }
    return "Salary not specified";
  };

  // Format location
  const formatLocation = () => {
    if (job.location) {
      const { city, state, country, remote, hybrid } = job.location;
      let loc = city !== "Anywhere" ? `${city}, ${state || country}` : country;
      if (remote) loc += " (Remote)";
      if (hybrid) loc += " (Hybrid)";
      return loc;
    }
    return "Location not specified";
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl font-bold">{job.title}</h2>
        {job.match_score && (
          <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
            {job.match_score}% Match
          </span>
        )}
      </div>
      
      <div className="flex flex-row gap-2 max-sm:gap-1 flex-wrap mb-4">
        <p className="font-bold text-lg text-purple-400">{job.company}</p>
        <span className="w-fit px-3 py-1 rounded text-sm bg-[#840a26]">
          {formatSalary()}
        </span>
        <span className="w-fit px-3 py-1 rounded text-sm bg-[#010d45]">
          {formatLocation()}
        </span>
        <span className="w-fit px-3 py-1 rounded text-sm bg-[#4c1700]">
          {job.employment_type || "Full-time"}
        </span>
        <span className="w-fit px-3 py-1 rounded text-sm bg-purple-900">
          {job.experience_level || "N/A"}
        </span>
      </div>

      {job.matched_skills && job.matched_skills.length > 0 && (
        <div className="mb-4 p-3 bg-green-900/20 border border-green-500/50 rounded">
          <p className="text-sm text-green-300">
            ✓ Your matching skills: <strong>{job.matched_skills.join(", ")}</strong>
          </p>
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-300">Description</h3>
        <p className="text-sm text-gray-400">{job.description}</p>
      </div>

      {job.responsibilities && job.responsibilities.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2 text-gray-300">Responsibilities</h3>
          <ul className="list-disc list-inside space-y-1">
            {job.responsibilities.map((resp, index) => (
              <li key={index} className="text-sm text-gray-400">{resp}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-300">Required Skills</h3>
        <div className="flex flex-wrap gap-2">
          {requiredSkills.map((skill, index) => (
            <SkillMatch 
              key={`req-${index}`} 
              skill={skill}
              isMatched={job.matched_skills?.includes(skill)}
            />
          ))}
        </div>
      </div>

      {preferredSkills.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2 text-gray-300">Preferred Skills</h3>
          <div className="flex flex-wrap gap-2">
            {preferredSkills.map((skill, index) => (
              <SkillMatch 
                key={`pref-${index}`} 
                skill={skill}
                isPreferred
                isMatched={job.matched_skills?.includes(skill)}
              />
            ))}
          </div>
        </div>
      )}

      {job.requirements?.education && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2 text-gray-300">Education</h3>
          <p className="text-sm text-gray-400">{job.requirements.education}</p>
          {job.requirements.years_of_experience && (
            <p className="text-sm text-gray-400 mt-1">
              Experience: {job.requirements.years_of_experience} years
            </p>
          )}
        </div>
      )}

      {job.benefits && job.benefits.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2 text-gray-300">Benefits</h3>
          <ul className="list-disc list-inside space-y-1">
            {job.benefits.map((benefit, index) => (
              <li key={index} className="text-sm text-gray-400">{benefit}</li>
            ))}
          </ul>
        </div>
      )}

      {job.posted_date && (
        <div className="mt-4 pt-4 border-t border-gray-700 text-xs text-gray-500">
          <p>Posted: {new Date(job.posted_date).toLocaleDateString()}</p>
          {job.application_deadline && (
            <p>Application Deadline: {new Date(job.application_deadline).toLocaleDateString()}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default JobDetails;