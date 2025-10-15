import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const CompanySignupForm = () => {
  // Renamed component to CompanySignupForm
  const [companyName, setCompanyName] = useState(""); // Added companyName field
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const companyData = {
      // Renamed to companyData
      name: companyName, // Using companyName instead of firstName/lastName
      email: email,
      password: password,
      location: location,
      contactNumber: contactNumber,
    };

    try {
      const response = await axios.post(
        "http://localhost:5000/company/signup",
        companyData
      ); // Updated API endpoint to /company/signup
      setMessage(response.data.message);
      console.log("Company Signup successful:", response.data);
      navigate("/profile"); // You might want to redirect companies to a different profile page, e.g., '/company/profile' later
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.error);
        console.error("Company Signup error:", error.response.data);
      } else {
        setMessage("An unexpected error occurred. Please try again.");
        console.error("Company Signup error:", error.message);
      }
    }
  };

  return (
    <div className="xl:-mt-20 flex-1 p-5 md:p-5 bg-transparent flex flex-col justify-center min-h-screen overflow-hidden">
      <div className="border border-gray-700 p-6 rounded-lg max-w-2xl mx-auto bg-[#1a1a24]">
        <h2 className="text-3xl font-light mb-6 text-center">
          Let's get your company hiring!
        </h2>{" "}
        {/* Updated Heading */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-400 font-light">
              Company Name*
            </label>{" "}
            {/* Updated Label */}
            <input
              type="text"
              placeholder="Company Name" /* Updated Placeholder */
              className="w-full p-3 bg-gray-800 font-Arial text-white rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
              value={companyName} // Updated state variable
              onChange={(e) => setCompanyName(e.target.value)} // Updated state variable
            />
          </div>

          <div>
            <label className="block text-gray-400 font-light">
              Enter Password*
            </label>
            <input
              type="password"
              placeholder="Set Password"
              className="w-full p-3 bg-gray-800 font-Arial text-white rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-400 font-light">Industry</label>
            <input
              type="text"
              placeholder="eg information technology" /* Updated Placeholder */
              className="w-full p-3 bg-gray-800 font-Arial text-white rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-400 font-light">Location*</label>
            <input
              type="text"
              placeholder="Bangalore, India"
              className="w-full p-3 bg-gray-800 font-Arial text-white rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-gray-400 font-light">
              Foundation Year*
            </label>
            <div className="flex">
              <input
                type="text"
                placeholder="eg 2025"
                className="w-full p-3 bg-gray-800 text-white rounded-r font-Arial focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
              />
            </div>
          </div>

          {message && (
            <p
              className={
                message.includes("success") ? "text-green-500" : "text-red-500"
              }
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-purple-700 hover:bg-purple-600 text-white text-lg font-Arial rounded"
          >
            Continue
          </button>

          <Link to="/company/login">
            {" "}
            {/* Updated Link to Company Login */}
            <button className="text-purple-500 hover:underline">
              Already have a company account? Login
            </button>{" "}
            {/* Updated Text */}
          </Link>
          <p className="text-sm text-gray-400 font-Arial m-0">
            By submitting, you acknowledge that you have read and agreed to our{" "}
            <a href="#" className="underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline">
              Privacy Policy
            </a>
            .
          </p>
        </form>
      </div>
    </div>
  );
};

export default CompanySignupForm; // Renamed export
