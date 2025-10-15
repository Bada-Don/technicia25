import React, { useState } from 'react';
import axios from 'axios';

const ResumeScorer = () => {
    const [jobDescription, setJobDescription] = useState('');
    const [resumeText, setResumeText] = useState('');
    const [score, setScore] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setScore(null); // Clear previous score
        setError(''); // Clear previous errors
        setLoading(true); // Set loading state

        try {
            const response = await axios.post('http://localhost:5000/api/resume-score', {
                jobDescription: jobDescription,
                resumeText: resumeText
            });
            setScore(response.data.score);
            console.log("Resume score received:", response.data.score); // Log success
        } catch (error) {
            if (error.response) {
                setError(`Error: ${error.response.data.error || 'Failed to score resume. Please check inputs and backend.'}`);
                console.error("Resume scoring error:", error.response.data); // Log full error response
            } else {
                setError('Error: Could not connect to server. Please check your network and backend.');
                console.error("Network error:", error.message); // Log network error
            }
        } finally {
            setLoading(false); // End loading state
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Resume Scorer</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="jobDescription" className="block text-gray-700 text-sm font-bold mb-2">Job Description:</label>
                    <textarea
                        id="jobDescription"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        rows="5"
                        placeholder="Paste job description here"
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="resumeText" className="block text-gray-700 text-sm font-bold mb-2">Resume Text:</label>
                    <textarea
                        id="resumeText"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        rows="10"
                        placeholder="Paste resume text here"
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        required
                    />
                </div>
                <div className="flex items-center justify-between">
                    <button
                        className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="submit"
                        disabled={loading} // Disable button during loading
                    >
                        {loading ? 'Scoring...' : 'Score Resume'}
                    </button>
                </div>
            </form>

            {loading && <p className="mt-4 text-gray-600">Scoring in progress...</p>}

            {error && <p className="mt-4 text-red-500">{error}</p>}

            {score !== null && !error && (
                <div className="mt-6 p-4 bg-green-100 rounded-md border border-green-400">
                    <h3 className="text-lg font-semibold text-green-700">Resume Suitability Rating:</h3>
                    <p className="text-2xl font-bold text-green-900 mt-2">{`Rating: ${score} / 100`}</p>                </div>
            )}
        </div>
    );
};

export default ResumeScorer;