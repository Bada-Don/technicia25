import React from 'react';
import { useNavigate } from 'react-router-dom';

const ResultModal = ({ score, percentage, onClose }) => {
    const navigate = useNavigate();
    const safeScore = score || {};

    const handleTakeTest = () => {
        navigate('/test');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-gray-800 p-6 rounded-lg">
                <h2 className="text-2xl font-bold mb-4">Test Results</h2>
                {score ? (
                    <>
                        <p>Programming: {safeScore.programming || 0}</p>
                        <p>Framework: {safeScore.framework || 0}</p>
                        <p>Non-Tech & Communication: {safeScore.nonTech || 0}</p>
                        <p>Aptitude: {safeScore.aptitude || 0}</p>
                        <p className="font-bold mt-4">Total Percentage: {percentage ? percentage.toFixed(2) : 0}%</p>
                        <p className="mt-4">
                            {percentage >= 85 
                                ? "Congratulations! You've unlocked the Jobs section." 
                                : "You've unlocked the Recommended Courses section."}
                        </p>
                    </>
                ) : (
                    <>
                        <p>No test results available.</p>
                        <button 
                            className="bg-purple-600 text-white py-2 px-4 rounded mt-4 mr-2 hover:bg-purple-700 transition-colors"
                            onClick={handleTakeTest}
                        >
                            Take Test
                        </button>
                    </>
                )}
                <button 
                    className="bg-gray-600 text-white py-2 px-4 rounded mt-4 hover:bg-gray-700 transition-colors"
                    onClick={onClose}
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default ResultModal;