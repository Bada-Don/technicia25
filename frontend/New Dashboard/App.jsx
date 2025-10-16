import React from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import CompanySignupPage from "./pages/auth/CompanySignupPage"; // Import CompanySignupPage
import CompanyLoginPage from "./pages/CompanyLoginPage";
import CompanyProfilePage from "./pages/CompanyProfilePage";
import Home from "./pages/Home";
import Login from "./pages/auth/LoginPage";
import Jobs from "./components/profile page/jobListing";
import Profile from "./pages/profile";
import JobAppStat from "./pages/application status";
import TestPage from "./pages/testPage";
import TalentForm from "./pages/Talentform";
import ResumeScorerTestPage from "./pages/ResumeScorerTestPage"; // Import ResumeScorerTestPage
import LoginPageTeachers from "./pages/auth/LoginPageTeachers";
import StudentSignup from "./pages/auth/StudentSignup";
import TeacherSignup from "./pages/auth/TeacherSignup";
import LeaderBoardPage from "./pages/LeaderBoard";
import UnifiedAuthPage from "./pages/auth/UnifiedAuthPage";
import Dashboard from "./pages/Dashboard";
import ModernDashboard from "./components/ModernDashboard";
import StudentOnboarding from "./pages/StudentOnboarding";
import SkillVerificationTest from "./pages/SkillVerificationTest";
import TestResult from "./pages/TestResult";

function App() {
  return (
    <Router>
      <Routes>
        {/* NEW: Unified Authentication Page */}
        <Route path="/auth" element={<UnifiedAuthPage />} />
        
        {/* Dashboard - Protected */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        
        {/* Modern Dashboard - Protected */}
        <Route path="/modern-dashboard" element={<ProtectedRoute><ModernDashboard /></ProtectedRoute>} />
        
        {/* Student Onboarding - Protected */}
        <Route path="/student/onboarding" element={<ProtectedRoute><StudentOnboarding /></ProtectedRoute>} />

        {/* OLD Routes - Keep for backward compatibility */}
        <Route path="/signup" element={<CompanySignupPage />} />
        <Route path="/company/login" element={<CompanyLoginPage />} />
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login-teachers" element={<LoginPageTeachers />} />
        <Route path="/singup-students" element={<StudentSignup />} />
        <Route path="/singup-teachers" element={<TeacherSignup />} />
        <Route path="/leaderboard" element={<LeaderBoardPage />} />
        <Route
          path="/jobs"
          element={
            <ProtectedRoute>
              <Jobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/courses"
          element={
            <ProtectedRoute>
              <Navigate to="/profile" state={{ activeTab: "courses" }} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/profile"
          element={
            <ProtectedRoute>
              <CompanyProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/application"
          element={
            <ProtectedRoute>
              <JobAppStat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/test"
          element={
            <ProtectedRoute>
              <TestPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/test/skill-verification"
          element={
            <ProtectedRoute>
              <SkillVerificationTest />
            </ProtectedRoute>
          }
        />
        <Route
          path="/test-result"
          element={
            <ProtectedRoute>
              <TestResult />
            </ProtectedRoute>
          }
        />
        <Route path="/signup-students" element={<TalentForm />} />
        <Route path="/resume-scorer-test" element={<ResumeScorerTestPage />} />
      </Routes>
    </Router>
  );
}

export default App;
