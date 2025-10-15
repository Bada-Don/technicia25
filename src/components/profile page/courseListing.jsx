import React, { useState } from "react";
import coursesData from "./courseListing"; // Import course data (for local filtering if needed)
import axios from 'axios';

function RecommendedCourses() {
    const [resumeText, setResumeText] = useState("");
    const [recommendedCourses, setRecommendedCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [llmReportText, setLlmReportText] = useState(""); // NEW state variable for LLM report


    const handleRecommendCourses = async () => {
        setLoading(true);
        setError(null);
        setRecommendedCourses([]); // Clear previous recommendations
        setLlmReportText(""); // Clear previous report

        try {
            const response = await axios.post('http://localhost:5000/api/recommend-courses', {
                resumeText: resumeText, // ONLY send resumeText - reverted
            });
            setRecommendedCourses(response.data.recommendedCourses);
            setLlmReportText(response.data.llmReportText); // Store llmReportText from response
            console.log("Recommended courses received (resume-text-only):", response.data.recommendedCourses);
            console.log("LLM Report Text received:", response.data.llmReportText); // Log report text
        } catch (err) {
            setError("Failed to fetch course recommendations. Please try again.");
            console.error("Error fetching course recommendations (resume-text-only):", err); // Updated log message
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="bg-[#0d0d0d] text-white min-h-screen flex flex-col p-6">
            <h1 className="text-3xl font-bold mb-6">Course Recommendations</h1>

            <div className="mb-6">
                <label htmlFor="resumeText" className="block text-gray-400 font-light mb-2">Paste Your Resume Text Here:</label>
                <textarea
                    id="resumeText"
                    className="bg-gray-900 border border-gray-500 p-3 w-full h-40 rounded"
                    placeholder="Your resume text..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                />
            </div>

            <button
                onClick={handleRecommendCourses}
                className="bg-purple-500 hover:bg-purple-700 text-white p-3 rounded w-full max-w-sm mb-6"
                disabled={loading}
            >
                {loading ? "Recommending Courses..." : "Get Recommendations"}
            </button>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            {loading && <p className="text-gray-400 mb-4">Loading course recommendations...</p>}


            {/* Display Recommended Courses */}
            <div className="grid grid-cols-1 gap-6 mb-6"> {/* Added mb-6 to create space below courses */}
                {recommendedCourses.map((course, index) => (
                    <div
                        key={index}
                        className="bg-gray-800 p-6 rounded-lg border border-gray-600 flex justify-between items-center"
                    >
                        {/* Text Section */}
                        <div className="w-2/3">
                            <h2 className="text-2xl font-bold mb-2">{course.title}</h2>
                            <p className="text-purple-500 mb-2">{course.provider}</p>
                            <p className="mb-2">
                                Category: <span className="font-bold">{course.category}</span>
                            </p>
                            <p className="mb-2">
                                Level: <span className="font-bold">{course.level}</span>
                            </p>
                            <p className="mb-4">
                                Skills:{" "}
                                <span className="font-bold">{course.skills.join(", ")}</span>
                            </p>
                            <p className="mb-4">
                                Price: <span className="text-red-500">{course.price}</span>
                            </p>
                            <button className="bg-purple-500 hover:bg-purple-700 text-white px-4 py-2 rounded">
                                Enroll Now
                            </button>
                        </div>

                        {/* Course Image */}
                        <div className="w-1/3">
                            <img
                                src={course.image}
                                alt={course.title}
                                className="w-80 h-40 object-cover rounded-md"
                            />
                        </div>
                    </div>
                ))}
                {recommendedCourses.length === 0 && !loading && !error && (
                    <p className="text-gray-400">No courses recommended based on the provided resume text yet. Paste your resume and click 'Get Recommendations'.</p>
                )}
            </div>

            {/* Display LLM Report Text */}
            {llmReportText && (
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-600">
                    <h2 className="text-xl font-bold mb-4">LLM Analysis Report</h2>
                    <pre className="whitespace-pre-line">{llmReportText}</pre> {/* Use <pre> for preserving formatting */}
                </div>
            )}
        </div>
    );
}

export default RecommendedCourses;