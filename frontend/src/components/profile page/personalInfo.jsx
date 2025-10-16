import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { Camera, Upload } from 'lucide-react';

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
    const [uploadingPicture, setUploadingPicture] = useState(false);
    const fileInputRef = useRef(null);

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

    const handlePictureUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setMessage({ type: 'error', text: 'Please upload a valid image file (JPG, PNG, or WEBP)' });
            return;
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            setMessage({ type: 'error', text: 'File size must be less than 5MB' });
            return;
        }

        setUploadingPicture(true);
        setMessage(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            await api.post('/profile/upload-picture', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setMessage({ 
                type: 'success', 
                text: 'Profile picture uploaded successfully! Face detected and validated.' 
            });
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error uploading picture:', error);
            const errorMessage = error.response?.data?.detail || 'Failed to upload picture. Please try again.';
            setMessage({ type: 'error', text: errorMessage });
        } finally {
            setUploadingPicture(false);
            setTimeout(() => setMessage(null), 5000);
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
                <h4 className="font-semibold mb-4">Profile Photo</h4>
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <img 
                            className='rounded-full w-32 h-32 object-cover border-4 border-purple-500 shadow-lg' 
                            src={profilePicUrl} 
                            alt="Profile" 
                        />
                        {uploadingPicture && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col gap-3">
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            onChange={handlePictureUpload}
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            className='hidden' 
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingPicture}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                                uploadingPicture 
                                    ? 'bg-gray-600 cursor-not-allowed' 
                                    : 'bg-purple-600 hover:bg-purple-700 hover:scale-105'
                            }`}
                        >
                            <Upload size={18} />
                            {uploadingPicture ? 'Uploading...' : 'Upload Photo'}
                        </button>
                        <p className="text-xs text-gray-400">
                            • Required for proctored tests<br/>
                            • Only JPG, PNG, WEBP (Max 5MB)<br/>
                            • Must contain exactly one face<br/>
                            • Clear, well-lit photo recommended
                        </p>
                    </div>
                </div>
                
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