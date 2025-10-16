import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SecondaryNavBar from '../components/profile page/secNavBar.jsx';
import Jobs from '../components/profile page/jobListing.jsx';
import RecommendedCourses from '../components/profile page/courseListing.jsx';
import SkillsTable from '../components/profile page/techSkills.jsx';
import ProfileInfo from '../components/profile page/personalInfo.jsx';
import ProfileOverview from '../components/profile page/profileOverview.jsx';
import SkillsPerformance from '../components/profile page/SkillsPerformance.jsx';
import ExperienceForm from '../components/profile page/experience.jsx';
import EducationSection from '../components/profile page/education.jsx';
import Header from "../components/Header.jsx";
import api from '../services/api';

const ProgressBar = ({ progress }) => {
    return (
        <div className="w-full bg-white rounded-full h-2.5 mb-4 mt-2">
            <div 
                className="bg-purple-600 h-2.5 rounded-full" 
                style={{ width: `${progress}%` }}
            ></div>
            <p className="text-center text-sm">{`Progress ${progress}%`}</p>
        </div>
    );
};

function Profile() {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'profile');
    const [activeProfileSection, setActiveProfileSection] = useState('personal-info');
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (location.state?.activeTab) {
            setActiveTab(location.state.activeTab);
        }
    }, [location]);

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            const response = await api.get('/student/profile/complete');
            setProfileData(response.data);
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateYearsOfExperience = () => {
        if (!profileData?.work_experience || profileData.work_experience.length === 0) {
            return 0;
        }
        
        let totalMonths = 0;
        profileData.work_experience.forEach(exp => {
            const startDate = new Date(exp.start_date);
            const endDate = exp.currently_working ? new Date() : new Date(exp.end_date);
            const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                          (endDate.getMonth() - startDate.getMonth());
            totalMonths += months;
        });
        
        return (totalMonths / 12).toFixed(1);
    };

    const handleProfileSectionChange = (section) => {
        setActiveProfileSection(section);
    };

    const renderProfileContent = () => {
        switch (activeProfileSection) {
            case 'personal-info':
                return <ProfileInfo profileData={profileData} onUpdate={fetchProfileData} />;
            case 'technical-skills':
                return <SkillsTable profileData={profileData} onUpdate={fetchProfileData} />;
            case 'skills-performance':
                return <SkillsPerformance />;
            case 'profile-overview':
                return <ProfileOverview />;
            case 'experience':
                return <ExperienceForm profileData={profileData} onUpdate={fetchProfileData} />;
            case 'education':
                return <EducationSection profileData={profileData} onUpdate={fetchProfileData} />;
            default:
                return <ProfileInfo profileData={profileData} onUpdate={fetchProfileData} />;
        }
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="flex items-center justify-center min-h-screen bg-black text-white">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                        <p>Loading profile...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <section className="flex flex-col w-full min-h-screen -my-24 text-white">
                <SecondaryNavBar activeTab={activeTab} setActiveTab={setActiveTab} />
                
                <section className="flex flex-row w-full flex-grow">
                    {activeTab === 'profile' && profileData && (
                        <section className="left-sec w-1/5 p-6">
                            <h3 className="text-xl font-bold">
                                {profileData.profile?.first_name} {profileData.profile?.last_name}
                            </h3>
                            <p className="text-sm mb-2">
                                {calculateYearsOfExperience()} Years of experience
                            </p>
                            <ProgressBar progress={profileData.profile_completion_percentage || 0} />

                            <div className='mt-10 flex flex-col w-full gap-3'>
                                {['personal-info', 'technical-skills', 'skills-performance', 'profile-overview', 'experience', 'education'].map((section) => (
                                    <button 
                                        key={section}
                                        className={`profile-btn text-left pl-5 w-full py-2 rounded ${activeProfileSection === section ? 'bg-purple-600' : 'bg-gray-800 hover:bg-gray-700'}`}
                                        onClick={() => handleProfileSectionChange(section)}
                                    >
                                        {section.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                    </button>
                                ))}
                            </div>
                        </section>
                    )}

                    <section className={`right-sec ${activeTab === 'profile' ? 'w-4/5' : 'w-full'} p-10`}>
                        {activeTab === 'profile' && renderProfileContent()}
                        {activeTab === 'courses' && <RecommendedCourses />}
                        {activeTab === 'jobs' && <Jobs />}
                    </section>
                </section>
            </section>
        </>
    );
}

export default Profile;