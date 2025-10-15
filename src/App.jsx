import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import CompanySignupPage from "./pages/CompanySignupPage"; // Import CompanySignupPage
import CompanyLoginPage from "./pages/CompanyLoginPage";
import CompanyProfilePage from "./pages/CompanyProfilePage";
import Home from "./pages/Home";
import Login from "./pages/LoginPage";
import Jobs from "./components/profile page/jobListing";
import Profile from "./pages/profile";
import JobAppStat from "./pages/application status";
import TestPage from "./pages/testPage";
import TalentForm from "./pages/Talentform";
import ResumeScorerTestPage from "./pages/ResumeScorerTestPage"; // Import ResumeScorerTestPage

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<CompanySignupPage />} />{" "}
        {/* Route for Company Signup */}
        <Route path="/company/login" element={<CompanyLoginPage />} />{" "}
        {/* Route for Company Login */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/profile" element={<Profile />} />
        <Route
          path="/profile/courses"
          element={<Navigate to="/profile" state={{ activeTab: "courses" }} />}
        />
        <Route path="/company/profile" element={<CompanyProfilePage />} />
        <Route path="/application" element={<JobAppStat />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/talent" element={<TalentForm />} />
        <Route path="/resume-scorer-test" element={<ResumeScorerTestPage />} />
      </Routes>
    </Router>
  );
}

export default App;
