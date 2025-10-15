import React, { useState } from 'react';
import SkillSelector from './SkillSelector';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import axios from 'axios';

const RightSection = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [location, setLocation] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [yearsOfExperience, setYearsOfExperience] = useState('');
    const [monthsOfExperience, setMonthsOfExperience] = useState('');
    const [skills, setSkills] = useState([]);
    const [message, setMessage] = useState('');
    const navigate = useNavigate(); // Initialize useNavigate hook

    const handleSubmit = async (event) => {
        event.preventDefault();
    
        const userData = {
            name: `${firstName} ${lastName}`,
            email: email,
            password: password,
            location: location,
            contactNumber: contactNumber,
            experienceYears: yearsOfExperience,
            experienceMonths: monthsOfExperience,
            skills: skills.map(skill => skill.value)
        };
    
        console.log("Frontend - User Data being sent:", userData); // ADD THIS LINE
    
        try {
            const response = await axios.post('http://localhost:5000/signup', userData);
            setMessage(response.data.message);
            console.log("Signup successful:", response.data);
            navigate('/profile');
        } catch (error) {
            if (error.response) {
                setMessage(error.response.data.error);
                console.error("Signup error:", error.response.data);
            } else {
                setMessage("An unexpected error occurred. Please try again.");
                console.error("Signup error:", error.message);
            }
        }
    };

    const handleSkillsChange = (selectedOptions) => {
        console.log("RightSection - handleSkillsChange received:", selectedOptions); // Make sure this is still present
        setSkills(selectedOptions);
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

                    <div className="flex space-x-4">
                        <div className="w-1/2">
                            <label className="block text-gray-400 font-light">Contact Number*</label>
                            <div className="flex">
                                <select className="bg-gray-800 font-Arial text-gray-400 p-3 rounded-l">
                                    <option>+91</option>
                                    {/* Add more country codes as needed */}
                                </select>
                                <input
                                    type="tel"
                                    placeholder="**********"
                                    className="w-full p-3 bg-gray-800 text-white rounded-r font-Arial focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    required
                                    value={contactNumber}
                                    onChange={(e) => setContactNumber(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="w-1/2">
                            <label className="block text-gray-400 font-light">Years of Experience*</label>
                            <div className="flex space-x-2">
                                <input
                                    type="number"
                                    placeholder="E.g: 6"
                                    className="w-1/2 p-3 bg-gray-800 text-white rounded font-Arial focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    required
                                    value={yearsOfExperience}
                                    onChange={(e) => setYearsOfExperience(e.target.value)}
                                />
                                <input
                                    type="number"
                                    placeholder="E.g: 3"
                                    className="w-1/2 p-3 bg-gray-800 text-white font-Arial rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    required
                                    value={monthsOfExperience}
                                    onChange={(e) => setMonthsOfExperience(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <SkillSelector onChange={handleSkillsChange} />

                    {message && <p className={message.includes('success') ? 'text-green-500' : 'text-red-500'}>{message}</p>}

                    <button
                        type="submit"
                        className="w-full py-3 bg-purple-700 hover:bg-purple-600 text-white text-lg font-Arial rounded"
                    >
                        Continue
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