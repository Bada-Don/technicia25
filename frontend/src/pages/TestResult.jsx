import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, AlertTriangle, Trophy, Target } from 'lucide-react';

const TestResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { result, sessionId } = location.state || {};

  useEffect(() => {
    if (!result) {
      navigate('/profile');
    }
  }, [result, navigate]);

  if (!result) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Loading results...</p>
      </div>
    );
  }

  const isPassed = result.verification_status === 'Verified';
  const percentage = result.percentage || 0;

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Result Header */}
        <div className={`bg-gradient-to-r ${
          isPassed 
            ? 'from-green-900/50 to-green-800/50 border-green-500' 
            : 'from-red-900/50 to-red-800/50 border-red-500'
        } border-2 rounded-lg p-8 mb-8 text-center`}>
          <div className="flex justify-center mb-4">
            {isPassed ? (
              <CheckCircle size={80} className="text-green-400" />
            ) : (
              <XCircle size={80} className="text-red-400" />
            )}
          </div>
          <h1 className="text-4xl font-bold mb-2">
            {isPassed ? 'Congratulations!' : 'Test Completed'}
          </h1>
          <p className="text-xl text-gray-300 mb-4">
            {result.skill_name} Verification Test
          </p>
          <div className={`inline-block px-6 py-3 rounded-full font-bold text-2xl ${
            isPassed ? 'bg-green-600' : 'bg-red-600'
          }`}>
            {percentage}%
          </div>
          <p className="mt-4 text-lg">
            {isPassed 
              ? '✓ Skill Verified! You have successfully passed the verification test.' 
              : '✗ Verification Failed. Please try again after reviewing the topics.'}
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target size={20} className="text-purple-400" />
              <span className="text-gray-400 text-sm">Score</span>
            </div>
            <p className="text-2xl font-bold text-purple-400">
              {result.obtained_score} / {result.total_score}
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={20} className="text-green-400" />
              <span className="text-gray-400 text-sm">Correct</span>
            </div>
            <p className="text-2xl font-bold text-green-400">
              {result.correct_answers} / {result.total_questions}
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={20} className="text-blue-400" />
              <span className="text-gray-400 text-sm">Duration</span>
            </div>
            <p className="text-2xl font-bold text-blue-400">
              {result.duration_minutes} min
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={20} className="text-yellow-400" />
              <span className="text-gray-400 text-sm">Violations</span>
            </div>
            <p className={`text-2xl font-bold ${
              result.proctoring_violations > 5 ? 'text-red-400' : 'text-yellow-400'
            }`}>
              {result.proctoring_violations}
            </p>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Trophy size={24} className="text-yellow-400" />
            Detailed Results
          </h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-800 rounded-lg">
              <span className="text-gray-300">Total Questions</span>
              <span className="font-bold">{result.total_questions}</span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-gray-800 rounded-lg">
              <span className="text-gray-300">Correct Answers</span>
              <span className="font-bold text-green-400">{result.correct_answers}</span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-gray-800 rounded-lg">
              <span className="text-gray-300">Incorrect Answers</span>
              <span className="font-bold text-red-400">
                {result.total_questions - result.correct_answers}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-gray-800 rounded-lg">
              <span className="text-gray-300">Accuracy</span>
              <span className="font-bold text-purple-400">{percentage}%</span>
            </div>

            <div className="flex justify-between items-center p-4 bg-gray-800 rounded-lg">
              <span className="text-gray-300">Passing Criteria</span>
              <span className="font-bold text-gray-400">70%</span>
            </div>

            <div className="flex justify-between items-center p-4 bg-gray-800 rounded-lg">
              <span className="text-gray-300">Status</span>
              <span className={`font-bold px-4 py-1 rounded-full ${
                isPassed 
                  ? 'bg-green-900/50 text-green-400' 
                  : 'bg-red-900/50 text-red-400'
              }`}>
                {result.verification_status}
              </span>
            </div>
          </div>
        </div>

        {/* Proctoring Report */}
        {result.proctoring_violations > 0 && (
          <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-yellow-400">
              <AlertTriangle size={20} />
              Proctoring Report
            </h3>
            <p className="text-gray-300 mb-2">
              {result.proctoring_violations} violation(s) were detected during the test.
            </p>
            {result.proctoring_violations > 5 && (
              <p className="text-red-400 font-semibold">
                ⚠ High number of violations detected. This may affect your verification status.
              </p>
            )}
          </div>
        )}

        {/* Recommendations */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-bold mb-4">
            {isPassed ? 'Next Steps' : 'Recommendations'}
          </h3>
          {isPassed ? (
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Your skill has been verified and added to your profile</li>
              <li>This verification is visible to potential employers</li>
              <li>Consider taking more advanced tests to showcase expertise</li>
              <li>Update your profile with projects demonstrating this skill</li>
            </ul>
          ) : (
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Review the topics where you struggled</li>
              <li>Practice more before attempting again</li>
              <li>You can retake the test (maximum 3 attempts)</li>
              <li>Consider taking relevant courses to improve your skills</li>
            </ul>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('/profile', { state: { activeTab: 'profile', activeProfileSection: 'technical-skills' }})}
            className="px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors font-semibold"
          >
            Back to Profile
          </button>
          {!isPassed && (
            <button
              onClick={() => navigate(-2)}
              className="px-8 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors font-semibold"
            >
              Try Again
            </button>
          )}
        </div>

        {/* Session Info */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Session ID: {sessionId}</p>
          <p>Completed: {new Date(result.completed_at).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default TestResult;
