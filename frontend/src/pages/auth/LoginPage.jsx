import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import Header from "../../components/Header.jsx";
import axios from "axios";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // Initialize useNavigate hook

  const handleSubmit = async (event) => {
    event.preventDefault();

    const loginData = {
      email: email,
      password: password,
    };

    try {
      const response = await axios.post(
        "http://localhost:5000/login",
        loginData,
        { withCredentials: true }
      );
      setMessage(response.data.message);
      console.log("Login successful:", response.data);
      // Redirect to profile page after successful login
      navigate("/profile"); // Use navigate to redirect
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.error);
        console.error("Login error:", error.response.data);
      } else {
        setMessage("Login failed. Please check your connection and try again.");
        console.error("Login error:", error.message);
      }
    }
  };

  return (
    <>
      <Header />
      {/* ... rest of your LoginPage.jsx code - same as before, just add useNavigate and redirection */}
      {/* Make sure you haven't accidentally changed any classNames or structure */}
      <div
        className="flex flex-row items-center max-md:flex-col justify-center lg:p-10 max-xl:p-0 text-white  w-screen absolute -z-10 top-0 overflow-hidden h-screen bg-[radial-gradient(circle_at_top_left,_#000000_0%,_rgba(74,26,125,0.6)_30%,_#000000_70%)]"
        style={{
          backgroundColor: "black",
        }}
      >
        {/* Text Section */}
        <div className="space-y-8 text-left w-[45%] max-md:w-full max-md:text-center max-md:my-8">
          <h1 className="text-7xl max-lg:text-6xl w-full font-bold text-white max-md:text-4xl">
            Welcome Back! <br />{" "}
            <span className="text-purple-500">Login to your account</span>
          </h1>
        </div>

        {/* Form Section */}
        <div className="flex items-center justify-center max-md:w-[90%]">
          <div className="w-full h-fit border flex flex-col gap-6 max-md:gap-3 border-gray-700 max-w-2xl bg-[#1a1a24] p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl font-light  text-center">
              Login to Your Account
            </h2>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {" "}
              {/* Add onSubmit handler */}
              <div>
                <label className="block text-gray-400 font-light">
                  Email ID*
                </label>
                <input
                  type="email"
                  placeholder="name@mail.com"
                  className="w-full p-3 bg-gray-800 font-Arial text-white rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                  value={email} // Bind input value to state
                  onChange={(e) => setEmail(e.target.value)} // Update state on input change
                />
              </div>
              <div>
                <label className="block text-gray-400 font-light">
                  Enter Password*
                </label>
                <input
                  type="password"
                  placeholder="Your Password"
                  className="w-full p-3 bg-gray-800 font-Arial text-white rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                  value={password} // Bind input value to state
                  onChange={(e) => setPassword(e.target.value)} // Update state on input change
                />
              </div>
              <button
                type="submit"
                className=" mt-6 w-full py-3 bg-purple-700 hover:bg-purple-600 text-white text-lg font-Arial rounded"
              >
                Continue
              </button>
              {message && (
                <p
                  className={
                    message.includes("success")
                      ? "text-green-500"
                      : "text-red-500"
                  }
                >
                  {message}
                </p>
              )}{" "}
              {/* Display message */}
            </form>
            <div className=" text-center">
              <Link to="/talent">
                <button className="text-purple-500 hover:underline">
                  Don't have an account? Sign Up
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginPage;
