import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "../../components/Header.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

function UnifiedAuthPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("type") || "student");
  const [isLogin, setIsLogin] = useState(searchParams.get("mode") === "login");
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [recruiterName, setRecruiterName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login, register } = useAuth();

  // Update URL when tab or mode changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ type: tab, mode: isLogin ? "login" : "signup" });
    setMessage("");
    resetForm();
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setSearchParams({ type: activeTab, mode: !isLogin ? "login" : "signup" });
    setMessage("");
    resetForm();
  };

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setCompanyName("");
    setRecruiterName("");
    setEmail("");
    setPassword("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    if (isLogin) {
      // Login flow
      const result = await login(email, password);
      setIsLoading(false);

      if (result.success) {
        const userRole = result.data.user.user_role;
        if (userRole === "Company") {
          navigate("/company/profile");
        } else {
          navigate("/profile");
        }
      } else {
        setMessage(result.error);
      }
    } else {
      // Signup flow
      let endpoint = "";
      let userData = {};

      switch (activeTab) {
        case "student":
          endpoint = "/auth/register/student";
          userData = { email, password, first_name: firstName, last_name: lastName };
          break;
        case "educator":
          endpoint = "/auth/register/educator";
          userData = { email, password, first_name: firstName, last_name: lastName };
          break;
        case "company":
          endpoint = "/auth/register/company";
          userData = { email, password, company_name: companyName, recruiter_contact_name: recruiterName };
          break;
      }

      const result = await register(endpoint, userData);
      setIsLoading(false);

      if (result.success) {
        console.log('Registration successful:', result.data);
        console.log('User role:', result.data.user?.user_role);
        
        // Small delay to ensure state is updated
        setTimeout(() => {
          if (activeTab === "company") {
            navigate("/company/profile");
          } else if (activeTab === "student") {
            console.log('Navigating to student onboarding');
            navigate("/student/onboarding");
          } else {
            navigate("/profile");
          }
        }, 100);
      } else {
        setMessage(result.error);
      }
    }
  };

  const tabs = [
    { id: "student", label: "Student", icon: "🎓" },
    { id: "educator", label: "Educator", icon: "👨‍🏫" },
    { id: "company", label: "Company", icon: "🏢" },
  ];

  return (
    <>
      <Header />
      <div
        className="flex flex-row items-center max-md:flex-col justify-center lg:p-10 max-xl:p-0 text-white w-screen absolute -z-10 top-0 overflow-hidden min-h-screen bg-[radial-gradient(circle_at_top_left,_#000000_0%,_rgba(74,26,125,0.6)_30%,_#000000_70%)]"
        style={{ backgroundColor: "black" }}
      >
        {/* Text Section */}
        <div className="space-y-8 text-left w-[45%] max-md:w-full max-md:text-center max-md:my-8 max-md:px-4">
          <h1 className="text-7xl max-lg:text-6xl w-full font-bold text-white max-md:text-4xl">
            {isLogin ? "Welcome Back!" : "Join Us!"} <br />
            <span className="text-purple-500">
              {isLogin ? "Sign in to continue" : "Create your account"}
            </span>
          </h1>
        </div>

        {/* Form Section */}
        <div className="flex items-center justify-center max-md:w-[90%] max-md:mb-10">
          <div className="w-full max-w-2xl border border-gray-700 bg-[#1a1a24] rounded-lg shadow-lg overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-700">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex-1 py-4 px-6 text-center transition-colors ${
                    activeTab === tab.id
                      ? "bg-purple-700 text-white"
                      : "bg-[#1a1a24] text-gray-400 hover:bg-gray-800"
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Form Content */}
            <div className="p-8">
              <h2 className="text-3xl font-light mb-6 text-center">
                {isLogin ? "Login" : "Sign Up"} as {tabs.find(t => t.id === activeTab)?.label}
              </h2>

              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Signup-only fields */}
                {!isLogin && (
                  <>
                    {activeTab !== "company" ? (
                      <div className="flex space-x-4">
                        <div className="w-1/2">
                          <label className="block text-gray-400 font-light">
                            First Name*
                          </label>
                          <input
                            type="text"
                            placeholder="John"
                            className="w-full p-3 bg-gray-800 font-Arial text-white rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                            required
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                          />
                        </div>
                        <div className="w-1/2">
                          <label className="block text-gray-400 font-light">
                            Last Name*
                          </label>
                          <input
                            type="text"
                            placeholder="Doe"
                            className="w-full p-3 font-Arial bg-gray-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                            required
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="block text-gray-400 font-light">
                            Company Name*
                          </label>
                          <input
                            type="text"
                            placeholder="Company Name"
                            className="w-full p-3 bg-gray-800 font-Arial text-white rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                            required
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-gray-400 font-light">
                            Recruiter Contact Name*
                          </label>
                          <input
                            type="text"
                            placeholder="John Doe"
                            className="w-full p-3 bg-gray-800 font-Arial text-white rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                            required
                            value={recruiterName}
                            onChange={(e) => setRecruiterName(e.target.value)}
                          />
                        </div>
                      </>
                    )}
                  </>
                )}

                {/* Common fields */}
                <div>
                  <label className="block text-gray-400 font-light">
                    Email ID*
                  </label>
                  <input
                    type="email"
                    placeholder={
                      activeTab === "company"
                        ? "company@mail.com"
                        : activeTab === "educator"
                        ? "teacher@mail.com"
                        : "student@mail.com"
                    }
                    className="w-full p-3 bg-gray-800 font-Arial text-white rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-light">
                    Password*
                  </label>
                  <input
                    type="password"
                    placeholder={isLogin ? "Your Password" : "Set Password (min 8 characters)"}
                    className="w-full p-3 bg-gray-800 font-Arial text-white rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-6 w-full py-3 bg-purple-700 hover:bg-purple-600 disabled:bg-purple-900 disabled:cursor-not-allowed text-white text-lg font-Arial rounded"
                >
                  {isLoading
                    ? isLogin
                      ? "Logging in..."
                      : "Creating Account..."
                    : isLogin
                    ? "Login"
                    : "Sign Up"}
                </button>

                {message && (
                  <p className="text-red-500 text-center">{message}</p>
                )}
              </form>

              {/* Toggle between login and signup */}
              <div className="text-center mt-6">
                <button
                  onClick={toggleMode}
                  className="text-purple-500 hover:underline"
                >
                  {isLogin
                    ? "Don't have an account? Sign Up"
                    : "Already have an account? Login"}
                </button>
              </div>

              {!isLogin && (
                <p className="text-sm text-gray-400 font-Arial mt-4 text-center">
                  By submitting, you acknowledge that you have read and agreed to
                  our{" "}
                  <a href="#" className="underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="underline">
                    Privacy Policy
                  </a>
                  .
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default UnifiedAuthPage;
