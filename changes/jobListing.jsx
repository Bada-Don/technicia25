import React, { useState, useEffect } from "react";
import JobCard from "./JobCard";
import JobDetails from "./JobDetails";
import axios from "axios"; // Import axios

const JobListingSection = () => {
  const [selectedJob, setSelectedJob] = useState(null);
  const [recommendedJobs, setRecommendedJobs] = useState([]); // State for recommended jobs
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userSkills, setUserSkills] = useState([]); // State for user skills
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal

  useEffect(() => {
    // Mark component as mounted
    setMounted(true);
    
    // Optional: Auto-fetch job recommendations when component mounts
    // Commented out to prevent page crash if backend is not running
    // Uncomment the lines below if you want auto-fetch behavior:
    /*
    const timer = setTimeout(() => {
      fetchRecommendedJobs();
    }, 100);
    */
    
    return () => {
      // clearTimeout(timer); // Uncomment if using auto-fetch
      setMounted(false);
    };
  }, []); // Run once on mount

  useEffect(() => {
    // Select the first job from recommendedJobs when available
    if (recommendedJobs.length > 0) {
      setSelectedJob(recommendedJobs[0]);
    }
  }, [recommendedJobs]); // Update selectedJob when recommendedJobs changes

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const handleJobSelect = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // Don't clear selectedJob so it can still be viewed if needed
  };

  const fetchRecommendedJobs = async () => {
    if (!mounted) return; // Don't fetch if component is not mounted
    
    setLoading(true);
    setError(null);

    try {
      // Get token from localStorage
      const token = localStorage.getItem("access_token");
      
      if (!token) {
        setError("Please log in to get job recommendations.");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        "http://localhost:8000/jobs/recommended",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000, // 10 second timeout
        }
      );
      
      if (response.data) {
        setRecommendedJobs(response.data.recommended_jobs || []);
        setUserSkills(response.data.user_skills || []);
        
        if (response.data.recommended_jobs && response.data.recommended_jobs.length === 0) {
          setError(response.data.message || "No jobs found matching your skills. Please add more skills to your profile.");
        }
        
        console.log("Recommended jobs received:", response.data.recommended_jobs);
        console.log("User skills:", response.data.user_skills);
      }
    } catch (err) {
      console.error("Error fetching job recommendations:", err);
      
      if (err.code === 'ECONNABORTED') {
        setError("Request timed out. Please check if the backend server is running.");
      } else if (err.response?.status === 403) {
        setError("Please log in as a student to get job recommendations.");
      } else if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
      } else if (!err.response) {
        setError("Cannot connect to server. Please make sure the backend is running on http://localhost:8000");
      } else {
        setError(err.response?.data?.detail || "Failed to fetch job recommendations. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Safety check - don't render until mounted
  if (!mounted && loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-purple-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-center items-center">
        <h1 className="w-full text-3xl font-bold mb-4 text-purple-500 text-center">
          Get Jobs
        </h1>
      </div>

      <section className=" flex flex-col items-start gap-6 justify-center text-white">
        {" "}
        {/* Changed to flex-col and added gap */}
        <div className="w-full">
          {" "}
          {/* Added w-full */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-purple-400">
                Jobs Based On Your Skill Set
              </h2>
              {userSkills.length > 0 && (
                <p className="text-sm text-gray-400 mt-1">
                  Matching {userSkills.length} skill(s):{" "}
                  {userSkills.slice(0, 5).join(", ")}
                  {userSkills.length > 5 ? "..." : ""}
                </p>
              )}
            </div>
            <button
              onClick={fetchRecommendedJobs}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
              disabled={loading}
              title="Refresh job recommendations"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Loading...</span>
                </>
              ) : recommendedJobs.length > 0 ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Refresh</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                  <span>Get Jobs</span>
                </>
              )}
            </button>
          </div>
        </div>
        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-300 px-4 py-3 rounded w-full">
            <p>{error}</p>
          </div>
        )}
        {loading && !recommendedJobs.length && (
          <div className="flex flex-col items-center justify-center w-full py-12">
            <svg
              className="animate-spin h-12 w-12 text-purple-500 mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="text-gray-400">
              Finding jobs matching your skills...
            </p>
          </div>
        )}
        
        {/* Job Cards Grid */}
        <section className="w-full text-white">
          {recommendedJobs.length === 0 && !loading && !error ? (
            <div className="text-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-400 text-xl mb-2">
                No job recommendations available yet
              </p>
              <p className="text-gray-500 text-sm">
                Click "Get Jobs" button to find opportunities matching your skills!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onSelect={handleJobSelect}
                  isSelected={false}
                />
              ))}
            </div>
          )}
        </section>

        {/* Modal for Job Details */}
        {isModalOpen && selectedJob && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <div 
              className="bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-500 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="sticky top-4 right-4 float-right bg-red-600 hover:bg-red-700 text-white rounded-full p-2 z-10 transition-colors"
                aria-label="Close modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {/* Job Details Content */}
              <div className="p-6">
                <JobDetails job={selectedJob} />
              </div>
            </div>
          </div>
        )}
        {/* Display match information */}
        {recommendedJobs.length > 0 && (
          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-6 rounded-lg border border-purple-500/50 w-full">
            <div className="flex items-center gap-3 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-purple-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 className="text-xl font-bold text-purple-300">
                Match Summary
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-gray-400 text-sm mb-1">Jobs Found</p>
                <p className="text-2xl font-bold text-white">
                  {recommendedJobs.length}
                </p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-gray-400 text-sm mb-1">Your Skills</p>
                <p className="text-2xl font-bold text-white">
                  {userSkills.length}
                </p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-gray-400 text-sm mb-1">Best Match</p>
                <p className="text-2xl font-bold text-purple-400">
                  {recommendedJobs[0]?.match_score || 0}%
                </p>
              </div>
            </div>
            <div className="border-t border-gray-700 pt-4">
              <p className="text-gray-300 text-sm">
                💡 <strong>Top recommendation:</strong>{" "}
                {recommendedJobs[0]?.title} at {recommendedJobs[0]?.company}
              </p>
              <p className="text-gray-400 text-xs mt-2">
                Jobs are ranked by how well your skills match the requirements
                (required skills weighted 70%, preferred skills 30%).
              </p>
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default JobListingSection;
