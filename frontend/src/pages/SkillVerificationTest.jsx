import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Camera, Video, AlertTriangle, CheckCircle, Eye, EyeOff, Clock } from 'lucide-react';
import api from '../services/api';

const SkillVerificationTest = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { skill, isProctored } = location.state || {};

  // Test state
  const [testStarted, setTestStarted] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [timeRemaining, setTimeRemaining] = useState(45 * 60); // 45 minutes

  // Proctoring state
  const [proctoringEnabled, setProctoringEnabled] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(false);
  const [videoStream, setVideoStream] = useState(null);
  const [violations, setViolations] = useState([]);
  const [lastFaceVerification, setLastFaceVerification] = useState(null);

  // Refs
  const videoRef = useRef(null);
  const faceVerificationIntervalRef = useRef(null);

  // Check if we have necessary data
  useEffect(() => {
    if (!skill) {
      navigate('/profile');
      return;
    }
  }, [skill, navigate]);

  // Timer effect
  useEffect(() => {
    if (testStarted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmitTest(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [testStarted, timeRemaining]);

  // Tab switch detection
  useEffect(() => {
    if (testStarted && isProctored) {
      const handleVisibilityChange = () => {
        if (document.hidden && sessionId) {
          logTabSwitch();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [testStarted, isProctored, sessionId]);

  // Camera and face verification
  useEffect(() => {
    if (testStarted && isProctored && proctoringEnabled) {
      startCamera();
      startFaceVerification();

      return () => {
        stopCamera();
        stopFaceVerification();
      };
    }
  }, [testStarted, isProctored, proctoringEnabled]);

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      setVideoStream(stream);
      setCameraPermission(true);
      setProctoringEnabled(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      alert('Camera access is required for this proctored test. Please allow camera permissions.');
      setCameraPermission(false);
    }
  };

  const startCamera = async () => {
    if (videoStream && videoRef.current) {
      videoRef.current.srcObject = videoStream;
      videoRef.current.play();
    }
  };

  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
    }
    if (faceVerificationIntervalRef.current) {
      clearInterval(faceVerificationIntervalRef.current);
    }
  };

  const captureFrame = useCallback(() => {
    if (!videoRef.current) return null;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    return canvas.toDataURL('image/jpeg', 0.8);
  }, []);

  const startFaceVerification = () => {
    // Verify face every 30 seconds
    faceVerificationIntervalRef.current = setInterval(async () => {
      await verifyFace();
    }, 30000);

    // Initial verification
    setTimeout(() => verifyFace(), 3000);
  };

  const stopFaceVerification = () => {
    if (faceVerificationIntervalRef.current) {
      clearInterval(faceVerificationIntervalRef.current);
    }
  };

  const verifyFace = async () => {
    if (!sessionId || !videoRef.current) return;

    try {
      const imageBase64 = captureFrame();
      if (!imageBase64) return;

      const response = await api.post(`/proctoring/sessions/${sessionId}/verify-face`, {
        image_base64: imageBase64
      });

      setLastFaceVerification(response.data);

      if (!response.data.verified) {
        const newViolation = {
          type: 'Face Not Matched',
          severity: 'High',
          timestamp: new Date().toLocaleTimeString()
        };
        setViolations(prev => [...prev, newViolation]);
      }
    } catch (error) {
      console.error('Face verification error:', error);
    }
  };

  const logTabSwitch = async () => {
    if (!sessionId) return;

    try {
      await api.post(`/proctoring/sessions/${sessionId}/tab-switch`);
      const newViolation = {
        type: 'Tab Switch',
        severity: 'Medium',
        timestamp: new Date().toLocaleTimeString()
      };
      setViolations(prev => [...prev, newViolation]);
    } catch (error) {
      console.error('Tab switch logging error:', error);
    }
  };

  const createSession = async () => {
    try {
      const response = await api.post('/test/sessions/create', {
        skill_id: skill.skill_id,
        is_proctored: isProctored
      });
      setSessionId(response.data.session_id);
      return response.data.session_id;
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to create test session');
      throw error;
    }
  };

  const startSession = async (sessionId) => {
    try {
      await api.post(`/test/sessions/${sessionId}/start`);
      const questionsResponse = await api.get(`/test/sessions/${sessionId}/questions`);
      setQuestions(questionsResponse.data);
      setTestStarted(true);
    } catch (error) {
      alert('Failed to start test session');
      throw error;
    }
  };

  const handleStartTest = async () => {
    if (isProctored && !proctoringEnabled) {
      await requestCameraPermission();
      if (!cameraPermission) return;
    }

    try {
      const newSessionId = await createSession();
      await startSession(newSessionId);
    } catch (error) {
      console.error('Error starting test:', error);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const submitAnswer = async (questionId, answer) => {
    if (!sessionId || !answer) return;

    try {
      await api.post(`/test/sessions/${sessionId}/answers`, {
        question_id: questionId,
        answer: answer,
        time_taken_seconds: 60
      });
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  const handleNext = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    const currentAnswer = answers[currentQuestion.question_id];

    if (currentAnswer) {
      await submitAnswer(currentQuestion.question_id, currentAnswer);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const toggleMarkForReview = () => {
    const questionId = questions[currentQuestionIndex].question_id;
    setMarkedForReview(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleSubmitTest = async (forcedByTimeout = false) => {
    if (!sessionId) return;

    const confirmSubmit = forcedByTimeout || window.confirm(
      'Are you sure you want to submit the test? You cannot change your answers after submission.'
    );

    if (!confirmSubmit) return;

    try {
      const currentQuestion = questions[currentQuestionIndex];
      const currentAnswer = answers[currentQuestion?.question_id];
      if (currentAnswer) {
        await submitAnswer(currentQuestion.question_id, currentAnswer);
      }

      const response = await api.post(`/test/sessions/${sessionId}/submit`, {
        force_submit: forcedByTimeout
      });

      stopCamera();
      stopFaceVerification();

      navigate('/test-result', { 
        state: { 
          result: response.data,
          sessionId: sessionId
        } 
      });
    } catch (error) {
      console.error('Error submitting test:', error);
      alert('Failed to submit test. Please try again.');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  const currentQuestion = questions[currentQuestionIndex];

  if (!skill) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (!testStarted) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
            <h1 className="text-3xl font-bold mb-4">Skill Verification Test</h1>
            <h2 className="text-2xl text-purple-400 mb-6">{skill.skill_name}</h2>

            <div className="space-y-6">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center">
                  <AlertTriangle className="mr-2 text-yellow-500" size={20} />
                  Test Instructions
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-300 ml-6">
                  <li>Duration: 45 minutes</li>
                  <li>Total Questions: 30 (MCQ and Coding)</li>
                  <li>Passing Score: 70%</li>
                  <li>You can attempt each skill test up to 3 times</li>
                  <li>This test is web-proctored - camera access is required</li>
                </ul>
              </div>

              {isProctored && (
                <div className="bg-blue-900/20 border border-blue-500/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center">
                    <Camera className="mr-2 text-blue-400" size={20} />
                    Proctoring Information
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-300 ml-6">
                    <li>Your camera will be active throughout the test</li>
                    <li>Tab switching and window changes will be monitored</li>
                    <li>Ensure you're in a well-lit, quiet environment</li>
                    <li>Keep your face visible in the camera frame</li>
                  </ul>
                  
                  {proctoringEnabled ? (
                    <div className="mt-4 flex items-center text-green-400">
                      <CheckCircle className="mr-2" size={20} />
                      <span>Camera access granted - Ready to start</span>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <button
                        onClick={requestCameraPermission}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                      >
                        <Video size={18} />
                        Enable Camera
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-yellow-900/20 border border-yellow-500/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center">
                  <AlertTriangle className="mr-2 text-yellow-500" size={20} />
                  Important Guidelines
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-300 ml-6">
                  <li>Do not refresh the page during the test</li>
                  <li>Ensure stable internet connection</li>
                  <li>Close all other tabs and applications</li>
                  <li>Have a valid ID ready for verification</li>
                </ul>
              </div>

              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => navigate('/profile')}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartTest}
                  disabled={isProctored && !proctoringEnabled}
                  className={`px-6 py-3 rounded-lg transition-colors ${
                    isProctored && !proctoringEnabled
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  Start Test
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {isProctored && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          <div className="bg-red-600 px-4 py-2 rounded-full flex items-center gap-2">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold">RECORDING</span>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-48 h-36 object-cover"
            />
            {lastFaceVerification && (
              <div className={`text-xs p-2 ${
                lastFaceVerification.verified ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
              }`}>
                {lastFaceVerification.verified ? '✓ Verified' : '✗ Not Verified'}
                {lastFaceVerification.confidence && ` (${lastFaceVerification.confidence}%)`}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="fixed top-4 left-4 z-50 space-y-2">
        <div className={`px-6 py-3 rounded-lg border ${
          timeRemaining < 300 ? 'bg-red-900 border-red-700' : 'bg-gray-900 border-gray-700'
        }`}>
          <div className="text-sm text-gray-400">Time Remaining</div>
          <div className={`text-2xl font-bold flex items-center gap-2 ${
            timeRemaining < 300 ? 'text-red-400 animate-pulse' : 'text-purple-400'
          }`}>
            <Clock size={24} />
            {formatTime(timeRemaining)}
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-700 px-6 py-3 rounded-lg">
          <div className="text-sm text-gray-400">Progress</div>
          <div className="text-lg font-bold text-purple-400">
            {getAnsweredCount()} / {questions.length} Answered
          </div>
        </div>
      </div>

      <div className="pt-24 pb-8 px-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                Question {currentQuestionIndex + 1} of {questions.length}
              </h2>
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  currentQuestion?.difficulty_level === 'Easy' ? 'bg-green-900/30 text-green-400' :
                  currentQuestion?.difficulty_level === 'Medium' ? 'bg-yellow-900/30 text-yellow-400' :
                  'bg-red-900/30 text-red-400'
                }`}>
                  {currentQuestion?.difficulty_level}
                </span>
                <span className="px-3 py-1 rounded-full text-sm bg-blue-900/30 text-blue-400">
                  {currentQuestion?.question_type}
                </span>
              </div>
            </div>

            {currentQuestion && (
              <div className="space-y-6">
                <div className="bg-gray-800 p-6 rounded-lg">
                  <p className="text-lg text-gray-200 leading-relaxed">
                    {currentQuestion.question_text}
                  </p>
                </div>

                {currentQuestion.question_type === 'MCQ' && currentQuestion.options && (
                  <div className="space-y-3">
                    {currentQuestion.options.map((option) => (
                      <label
                        key={option.option_id}
                        className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          answers[currentQuestion.question_id] === option.option_id
                            ? 'border-purple-500 bg-purple-900/20'
                            : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestion.question_id}`}
                          value={option.option_id}
                          checked={answers[currentQuestion.question_id] === option.option_id}
                          onChange={(e) => handleAnswerChange(currentQuestion.question_id, e.target.value)}
                          className="mt-1 mr-4"
                        />
                        <span className="text-gray-200">{option.option_text}</span>
                      </label>
                    ))}
                  </div>
                )}

                {(currentQuestion.question_type === 'Coding' || currentQuestion.question_type === 'ShortAnswer') && (
                  <textarea
                    value={answers[currentQuestion.question_id] || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion.question_id, e.target.value)}
                    placeholder={currentQuestion.question_type === 'Coding' ? 'Write your code here...' : 'Type your answer here...'}
                    className="w-full h-64 p-4 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none font-mono"
                  />
                )}
              </div>
            )}

            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-700">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className={`px-6 py-3 rounded-lg transition-colors ${
                  currentQuestionIndex === 0
                    ? 'bg-gray-700 cursor-not-allowed text-gray-500'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                Previous
              </button>

              <div className="flex gap-4">
                <button
                  onClick={toggleMarkForReview}
                  className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-colors ${
                    markedForReview.has(currentQuestion?.question_id)
                      ? 'bg-yellow-600 hover:bg-yellow-700'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {markedForReview.has(currentQuestion?.question_id) ? <EyeOff size={18} /> : <Eye size={18} />}
                  {markedForReview.has(currentQuestion?.question_id) ? 'Unmark' : 'Mark for Review'}
                </button>

                {currentQuestionIndex < questions.length - 1 ? (
                  <button
                    onClick={handleNext}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubmitTest(false)}
                    className="px-8 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors font-semibold"
                  >
                    Submit Test
                  </button>
                )}
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-800 rounded-lg">
              <h3 className="font-semibold mb-3">Question Overview</h3>
              <div className="grid grid-cols-10 gap-2">
                {questions.map((q, idx) => (
                  <button
                    key={q.question_id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`w-10 h-10 rounded flex items-center justify-center text-sm font-semibold transition-all ${
                      idx === currentQuestionIndex
                        ? 'bg-purple-600'
                        : answers[q.question_id]
                        ? 'bg-green-900/50 hover:bg-green-900/70'
                        : markedForReview.has(q.question_id)
                        ? 'bg-yellow-900/50 hover:bg-yellow-900/70'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillVerificationTest;
