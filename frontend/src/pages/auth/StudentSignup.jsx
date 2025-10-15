import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/Header.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

function StudentSignup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    const result = await register("/auth/register/student", {
      email,
      password,
      first_name: firstName,
      last_name: lastName,
    });

    setIsLoading(false);

    if (result.success) {
      navigate("/profile");
    } else {
      setMessage(result.error);
    }
  };

  return (
    <>
      <Header />
      <div
        className="flex flex-row items-center max-md:flex-col justify-center lg:p-10 max-xl:p-0 text-white w-screen absolute -z-10 top-0 overflow-hidden h-screen bg-[radial-gradient(circle_at_top_left,_#000000_0%,_rgba(74,26,125,0.6)_30%,_#000000_70%)]"
        style={{
          backgroundColor: "black",
        }}
      >
        {/* Text Section */}
        <div className="space-y-8 text-left w-[45%] max-md:w-full max-md:text-center max-md:my-8">
          <h1 className="text-7xl max-lg:text-6xl w-full font-bold text-white max-md:text-4xl">
            Join Us! <br />{" "}
            <span className="text-purple-500">Create Student Account</span>
          </h1>
        </div>

        {/* Form Section */}
        <div className="flex items-center justify-center max-md:w-[90%]">
          <div className="w-full h-fit border flex flex-col gap-6 max-md:gap-3 border-gray-700 max-w-2xl bg-[#1a1a24] p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl font-light text-center">
              Student Registration
            </h2>

            <form className="space-y-6" onSubmit={handleSubmit}>
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

              <div>
                <label className="block text-gray-400 font-light">
                  Email ID*
                </label>
                <input
                  type="email"
                  placeholder="name@mail.com"
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
                  placeholder="Set Password (min 8 characters)"
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
                {isLoading ? "Creating Account..." : "Sign Up"}
              </button>

              {message && (
                <p className="text-red-500 text-center">{message}</p>
              )}
            </form>

            <div className="text-center">
              <Link to="/login">
                <button className="text-purple-500 hover:underline">
                  Already have an account? Login
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default StudentSignup;
