import React, { useState, useEffect } from "react";
import JobCard from "./JobCard";
import JobDetails from "./JobDetails";
import jobsData from "./jobData"; // Keep this import for initial static rendering if needed, but we'll fetch dynamic jobs
import axios from 'axios'; // Import axios

const JobListingSection = () => {
    const [selectedJob, setSelectedJob] = useState(null);
    const [resumeText, setResumeText] = useState(""); // State for resume textarea
    const [recommendedJobs, setRecommendedJobs] = useState([]); // State for recommended jobs
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [llmReportText, setLlmReportText] = useState(""); // State for LLM report


    useEffect(() => {
        // Select the first job from recommendedJobs (if available) or fallback to jobsData
        if (recommendedJobs.length > 0) {
            setSelectedJob(recommendedJobs[0]);
        } else if (jobsData.jobs.length > 0) { // Fallback to static jobsData if no recommendations yet
            setSelectedJob(jobsData.jobs[0]);
        }
    }, [recommendedJobs]); // Update selectedJob when recommendedJobs changes

    const handleJobSelect = (job) => {
        setSelectedJob(job);
    };

    const handleRecommendJobs = async () => {
        setLoading(true);
        setError(null);
        setRecommendedJobs([]); // Clear previous recommendations
        setLlmReportText(""); // Clear previous report

        try {
            const response = await axios.post('http://localhost:5000/api/recommend-jobs', {
                resumeText: resumeText,
            });
            setRecommendedJobs(response.data.recommendedJobs);
            setLlmReportText(response.data.llmReportText); // Store LLM report
            console.log("Recommended jobs received:", response.data.recommendedJobs);
            console.log("LLM Job Report Text received:", response.data.llmReportText); // Log report text
        } catch (err) {
            setError("Failed to fetch job recommendations. Please try again.");
            console.error("Error fetching job recommendations:", err);
        } finally {
            setLoading(false);
        }
    };


    return (
        <>
            <h1 className="w-full text-3xl font-bold mb-4 text-purple-500">Find your dream job</h1>

            <section className=" flex flex-col items-start gap-6 justify-center text-white"> {/* Changed to flex-col and added gap */}

                <div className="mb-6 w-full"> {/* Added w-full */}
                    <label htmlFor="resumeTextJobs" className="block text-gray-400 font-light mb-2">Paste Your Resume Text Here to get Job Recommendations:</label>
                    <textarea
                        id="resumeTextJobs"
                        className="bg-gray-900 border border-gray-500 p-3 w-full h-40 rounded"
                        placeholder="Your resume text..."
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                    />
                </div>

                <button
                    onClick={handleRecommendJobs}
                    className="bg-purple-500 hover:bg-purple-700 text-white p-3 rounded w-full max-w-sm mb-6" // Added mb-6
                    disabled={loading}
                >
                    {loading ? "Recommending Jobs..." : "Get Job Recommendations"}
                </button>

                {error && <p className="text-red-500 mb-4">{error}</p>}
                {loading && <p className="text-gray-400 mb-4">Loading job recommendations...</p>}


                <section className="flex flex-row w-full items-start gap-10 justify-start text-white"> {/* Restored flex-row for job listings and details */}
                    {/* Left Section - Job Listings (with scroll) */}
                    <div
                        className="left-section w-1/3 overflow-y-auto"
                        style={{ maxHeight: 'calc(100vh - 450px)' }} // Adjusted maxHeight to account for new elements
                    >

                        <div className="job-list">
                            {recommendedJobs.map((job) => ( // Use recommendedJobs instead of jobsData.jobs
                                <JobCard
                                    key={job.id}
                                    job={job}
                                    onSelect={handleJobSelect}
                                    isSelected={selectedJob && selectedJob.id === job.id}
                                />
                            ))}
                            {recommendedJobs.length === 0 && !loading && !error && (
                                <p className="text-gray-400">No jobs recommended based on the provided resume text yet. Paste your resume and click 'Get Job Recommendations'.</p>
                            )}
                        </div>
                    </div>

                    {/* Right Section - Job Details */}
                    <div className="right-section w-2/3 ">
                        {selectedJob ? (
                            <JobDetails job={selectedJob} />
                        ) : (
                            <p>Select a job to view details</p>
                        )}
                    </div>
                </section>

                 {/* Display LLM Job Report Text - similar to courses report */}
                 {llmReportText && (
                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-600 mt-6 w-full"> {/* Added mt-6 and w-full */}
                        <h2 className="text-xl font-bold mb-4">LLM Job Analysis Report</h2>
                        <pre className="whitespace-pre-line">{llmReportText}</pre> {/* Use <pre> for preserving formatting */}
                    </div>
                )}


            </section>
        </>
    );
};

export default JobListingSection;