import { useState, useEffect } from 'react';
import api from '../../services/api';

function ProfileInfo({ profileData, onUpdate }){
    const [formData, setFormData] = useState({
        linkedin_profile: '',
        github_profile: '',
        portfolio_url: '',
        phone_number: '',
        bio: '',
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (profileData?.profile) {
            setFormData({
                linkedin_profile: profileData.profile.linkedin_profile || '',
                github_profile: profileData.profile.github_profile || '',
                portfolio_url: profileData.profile.portfolio_url || '',
                phone_number: profileData.profile.phone_number || '',
                bio: profileData.profile.bio || '',
            });
        }
    }, [profileData]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            await api.put('/student/profile', formData);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const profilePicUrl = profileData?.profile?.profile_picture_url || 'https://via.placeholder.com/150';

    return(
        <section className='bg-[#1f2937] flex flex-col gap-5 p-5' >
            <h3 className="text-2xl font-bold">Personal Information</h3>
            <hr />
            
            {message && (
                <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-900/20 border border-green-500/50 text-green-400' : 'bg-red-900/20 border border-red-500/50 text-red-400'}`}>
                    {message.text}
                </div>
            )}

            <div>
                <h4 className="font-semibold mb-2">Profile Photo</h4>
                <input type="file" name="profilePic" id="profilePic" className='hidden' />
                <label htmlFor="profilePic" className='w-fit cursor-pointer'>
                    <img className='rounded-full w-[7rem] h-[7rem] object-cover border-2 border-purple-500' src={profilePicUrl} alt="Profile" />
                </label>
                <p className="text-sm text-gray-400 mt-2">Click to upload new photo (coming soon)</p>
                
                <br />
                
                <h4 className="font-semibold mb-2">Phone Number</h4>
                <input 
                    className='font-[Arial] bg-transparent rounded px-5 py-2 w-full border border-[#888888] focus:border-purple-500 focus:outline-none' 
                    type="tel" 
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    placeholder='Phone Number' 
                />
                
                <br /><br />
                
                <h4 className="font-semibold mb-2">Bio / Professional Summary</h4>
                <textarea 
                    className='font-[Arial] bg-transparent rounded px-5 py-2 w-full border border-[#888888] focus:border-purple-500 focus:outline-none' 
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder='Tell us about yourself...'
                    rows={4}
                />
                
                <br /><br />
                
                <div className="flex justify-between gap-4">
                    <div className='w-full'>
                        <h4 className="font-semibold mb-2">LinkedIn</h4>
                        <input 
                            className='font-[Arial] bg-transparent rounded px-5 py-2 w-full border border-[#888888] focus:border-purple-500 focus:outline-none' 
                            type="url" 
                            name="linkedin_profile"
                            value={formData.linkedin_profile}
                            onChange={handleChange}
                            placeholder='LinkedIn Profile URL' 
                        />
                    </div>
                    <div className='w-full'>
                        <h4 className="font-semibold mb-2">GitHub</h4>
                        <input 
                            className='font-[Arial] bg-transparent rounded px-5 py-2 w-full border border-[#888888] focus:border-purple-500 focus:outline-none' 
                            type="url" 
                            name="github_profile"
                            value={formData.github_profile}
                            onChange={handleChange}
                            placeholder='GitHub Profile URL' 
                        />
                    </div>
                </div>
                
                <br />
                
                <div className='w-full'>
                    <h4 className="font-semibold mb-2">Portfolio</h4>
                    <input 
                        className='font-[Arial] bg-transparent rounded px-5 py-2 w-full border border-[#888888] focus:border-purple-500 focus:outline-none' 
                        type="url" 
                        name="portfolio_url"
                        value={formData.portfolio_url}
                        onChange={handleChange}
                        placeholder='Portfolio URL' 
                    />
                </div>
            </div>
            
            <button
                onClick={handleSave}
                disabled={saving}
                className={`w-fit px-[1.5rem] py-[.5rem] rounded-xl text-white font-semibold transition-colors ${
                    saving ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#7c35c7] hover:bg-[#4d217b]'
                }`}
            >
                {saving ? 'Saving...' : 'Save Changes'}
            </button>
        </section>
    );
}

export default ProfileInfo;