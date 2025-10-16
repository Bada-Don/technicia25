import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DonutChart from '../DonutChart';
import IndividualSkillDonut from '../IndividualSkillDonut';
import { TrendingUp, Award, Target, CheckCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const SkillsPerformance = () => {
  const [skillsData, setSkillsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSkillsPerformance();
  }, []);

  const fetchSkillsPerformance = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("Please log in to view your skills performance.");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${API_BASE_URL}/test/skills-performance`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSkillsData(response.data);
    } catch (err) {
      console.error("Error fetching skills performance:", err);
      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
      } else {
        setError(err.response?.data?.detail || "Failed to load skills performance.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your performance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500 text-red-300 px-6 py-4 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  if (!skillsData || skillsData.skills_performance.length === 0) {
    return (
      <div className="bg-gray-900/40 border border-gray-700 rounded-xl p-8 text-center">
        <div className="mb-4">
          <Target className="w-16 h-16 mx-auto text-gray-500" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No Test Results Yet</h3>
        <p className="text-gray-400 mb-4">
          You haven't taken any skill tests yet. Take tests to see your performance here!
        </p>
        <button
          onClick={() => window.location.href = '/profile'}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Take a Test
        </button>
      </div>
    );
  }

  // Prepare data for the overall donut chart
  const donutData = skillsData.skills_performance.slice(0, 8).map(skill => ({
    name: skill.skill_name,
    value: skill.percentage
  }));

  // Prepare data for individual skill donuts
  const individualSkills = skillsData.skills_performance.map(skill => ({
    name: skill.skill_name,
    level: skill.percentage,
    category: skill.verification_status
  }));

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/50 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-purple-400" />
          Skills Performance Overview
        </h2>
        <p className="text-gray-300 mb-4">
          Your test performance across different technologies. Shows your best score for each skill.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-purple-700/30">
            <div className="flex items-center gap-3">
              <div className="bg-purple-600/20 p-3 rounded-lg">
                <Award className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Average Score</p>
                <p className="text-2xl font-bold text-white">{skillsData.average_score}%</p>
              </div>
            </div>
          </div>

          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-purple-700/30">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600/20 p-3 rounded-lg">
                <Target className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Skills Tested</p>
                <p className="text-2xl font-bold text-white">{skillsData.total_skills_tested}</p>
              </div>
            </div>
          </div>

          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-purple-700/30">
            <div className="flex items-center gap-3">
              <div className="bg-green-600/20 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Verified Skills</p>
                <p className="text-2xl font-bold text-white">
                  {skillsData.skills_performance.filter(s => s.verification_status === 'Verified').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Performance Donut Chart */}
      {donutData.length > 0 && (
        <div className="bg-gray-900/40 border border-gray-700 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Overall Skills Distribution</h3>
          <div className="flex justify-center">
            <DonutChart data={donutData} size={300} thickness={40} />
          </div>
        </div>
      )}

      {/* Individual Skill Performance */}
      <div className="bg-gray-900/40 border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Individual Skill Scores</h3>
        
        {individualSkills.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No skill data available</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {individualSkills.map((skill, index) => (
              <IndividualSkillDonut key={index} skill={skill} size={140} thickness={14} />
            ))}
          </div>
        )}
      </div>

      {/* Detailed Skills Table */}
      <div className="bg-gray-900/40 border border-gray-700 rounded-xl p-6 overflow-x-auto">
        <h3 className="text-xl font-semibold text-white mb-4">Detailed Test Results</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-4 text-gray-300 font-semibold">Rank</th>
              <th className="text-left py-3 px-4 text-gray-300 font-semibold">Skill</th>
              <th className="text-left py-3 px-4 text-gray-300 font-semibold">Score</th>
              <th className="text-left py-3 px-4 text-gray-300 font-semibold">Percentage</th>
              <th className="text-left py-3 px-4 text-gray-300 font-semibold">Status</th>
              <th className="text-left py-3 px-4 text-gray-300 font-semibold">Completed</th>
            </tr>
          </thead>
          <tbody>
            {skillsData.skills_performance.map((skill, index) => (
              <tr key={skill.skill_id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                <td className="py-3 px-4 text-gray-300">#{index + 1}</td>
                <td className="py-3 px-4 text-white font-medium">{skill.skill_name}</td>
                <td className="py-3 px-4 text-gray-300">
                  {skill.obtained_score} / {skill.total_score}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-700 rounded-full h-2 max-w-[100px]">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${skill.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-white font-semibold min-w-[50px]">{skill.percentage}%</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      skill.verification_status === 'Verified'
                        ? 'bg-green-900/30 text-green-400 border border-green-600/30'
                        : skill.verification_status === 'Failed'
                        ? 'bg-red-900/30 text-red-400 border border-red-600/30'
                        : 'bg-yellow-900/30 text-yellow-400 border border-yellow-600/30'
                    }`}
                  >
                    {skill.verification_status}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-400 text-sm">
                  {new Date(skill.completed_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <button
          onClick={fetchSkillsPerformance}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors font-medium flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          Refresh Data
        </button>
      </div>
    </div>
  );
};

export default SkillsPerformance;
