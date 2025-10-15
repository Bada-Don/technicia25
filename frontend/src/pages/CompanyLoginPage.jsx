import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function CompanyLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setMessage('');

        const result = await login(email, password);
        
        setIsLoading(false);
        
        if (result.success) {
            navigate('/company/profile');
        } else {
            setMessage(result.error);
        }
    };

    return (
        <>
            <Header />
            <div
                className="flex flex-row items-center max-md:flex-col justify-center lg:p-10 max-xl:p-0 text-white h-fit relative"
                style={{
                    backgroundColor: "black",
                }}
            >
                {/* Text Section */}
                <div className="space-y-8 text-left w-[45%] max-md:w-full max-md:text-center max-md:my-8">
                    <h1 className="text-7xl max-lg:text-6xl w-full font-bold text-white max-md:text-4xl">
                        Welcome Companies! <br /> <span className="text-purple-500">Login to your company account</span> {/* Updated Heading */}
                    </h1>
                </div>


                {/* Form Section */}
                <div className="flex items-center justify-center max-md:w-[90%]">
                    <div className="w-full h-fit border flex flex-col gap-6 max-md:gap-3 border-gray-700 max-w-2xl bg-[#1a1a24] p-8 rounded-lg shadow-lg">
                        <h2 className="text-3xl font-light  text-center">
                            Company Login {/* Updated Heading */}
                        </h2>
                        <div className="flex justify-between items-center ">
                            <Link to="/profile"> {/* You might want to update these links to company-specific social login later */}
                                <button>
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/2560px-Google_2015_logo.svg.png" alt="Google" className="h-10" />
                                </button>
                            </Link>
                            <Link to="/profile"> {/* You might want to update these links to company-specific social login later */}
                                <button>
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/a/aa/LinkedIn_2021.svg" alt="LinkedIn" className="h-10" />
                                </button>
                            </Link>
                        </div>
                        <div className="text-center text-gray-400 text-3xl leading-3">or</div>
                        <form className="space-y-6" onSubmit={handleSubmit}>

                            <div>
                                <label className="block text-gray-400 font-light">Email ID*</label>
                                <input
                                    type="email"
                                    placeholder="company@mail.com" /* Updated Placeholder */
                                    className="w-full p-3 bg-gray-800 font-Arial text-white rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 font-light">Enter Password*</label>
                                <input
                                    type="password"
                                    placeholder="Company Password" /* Updated Placeholder */
                                    className="w-full p-3 bg-gray-800 font-Arial text-white rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />

                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className=" mt-6 w-full py-3 bg-purple-700 hover:bg-purple-600 disabled:bg-purple-900 disabled:cursor-not-allowed text-white text-lg font-Arial rounded"
                            >
                                {isLoading ? "Logging in..." : "Continue"}
                            </button>

                            {message && <p className="text-red-500 text-center">{message}</p>}

                        </form>
                        <div className=" text-center">
                            <Link to="/company/signup"> 
                                <button className="text-purple-500 hover:underline">Don't have a company account? Sign Up</button> {/* Updated Text */}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default CompanyLoginPage;