import React, { useState } from 'react';
import SkillSelector from './SkillSelector';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const RightSection = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { register } = useAuth();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setMessage('');

        const result = await register('/auth/register/student', {
            email,
            password,
            first_name: firstName,
            last_name: lastName,
        });

        setIsLoading(false);

        if (result.success) {
            navigate('/profile');
        } else {
            setMessage(result.error);
        }
    };


    return (
        <div className="xl:-mt-20 flex-1 p-5 md:p-5 bg-transparent flex flex-col justify-center min-h-screen overflow-hidden">
            <div className="border border-gray-700 p-6 rounded-lg max-w-2xl mx-auto bg-[#1a1a24]">
                <h2 className="text-3xl font-light mb-6 text-center">Let’s get you hired!</h2>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="flex space-x-4">
                        <div className="w-1/2">
                            <label className="block text-gray-400 font-light">First Name*</label>
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
                            <label className="block text-gray-400 font-light">Last Name*</label>
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
                        <label className="block text-gray-400 font-light">Email ID*</label>
                        <input
                            type="email"
                            placeholder="name@mail.com"
                            className="w-full p-3 bg-gray-800 font-Arial text-white rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                            required
                            autoComplete='email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 font-light">Enter Password*</label>
                        <input
                            type="password"
                            placeholder="Set Password"
                            className="w-full p-3 bg-gray-800 font-Arial text-white rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                            required
                            autoComplete='current-password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {message && <p className="text-red-500 text-center">{message}</p>}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-purple-700 hover:bg-purple-600 disabled:bg-purple-900 disabled:cursor-not-allowed text-white text-lg font-Arial rounded"
                    >
                        {isLoading ? "Creating Account..." : "Continue"}
                    </button>

                    <Link to="/login">
                        <button className="text-purple-500 hover:underline">Already have an account? Login</button>
                    </Link>
                    <p className="text-sm text-gray-400 font-Arial m-0">
                        By submitting, you acknowledge that you have read and agreed to our{" "}
                        <a href="#" className="underline">Terms of Service</a> and{" "}
                        <a href="#" className="underline">Privacy Policy</a>.
                    </p>
                </form>
            </div>
        </div>
    );
};

export default RightSection;